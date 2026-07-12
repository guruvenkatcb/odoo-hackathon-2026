import csv
from django.http import HttpResponse
from django.utils import timezone
from django.db.models import Sum, Count, Q
from rest_framework import viewsets, generics, permissions, status
from rest_framework.authtoken.models import Token
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Vehicle, Driver, Trip, MaintenanceLog, FuelLog, Expense
from .serializers import (
    UserSerializer, VehicleSerializer, DriverSerializer, TripSerializer,
    MaintenanceLogSerializer, FuelLogSerializer, ExpenseSerializer,
)


# ---------- Auth ----------

class RegisterView(generics.CreateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        token, _ = Token.objects.get_or_create(user=user)
        return Response(
            {'token': token.key, 'user': UserSerializer(user).data},
            status=status.HTTP_201_CREATED,
        )


class LoginView(ObtainAuthToken):
    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        token, _ = Token.objects.get_or_create(user=user)
        role = getattr(getattr(user, 'profile', None), 'role', None)
        return Response({'token': token.key, 'username': user.username, 'role': role})


class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)


# ---------- Vehicles & Drivers (CRUD) ----------

class VehicleViewSet(viewsets.ModelViewSet):
    queryset = Vehicle.objects.all()
    serializer_class = VehicleSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        qs = super().get_queryset()
        status_param = self.request.query_params.get('status')
        type_param = self.request.query_params.get('type')
        region_param = self.request.query_params.get('region')
        dispatch_pool = self.request.query_params.get('dispatch_pool')
        if status_param:
            qs = qs.filter(status=status_param)
        if type_param:
            qs = qs.filter(type__iexact=type_param)
        if region_param:
            qs = qs.filter(region__iexact=region_param)
        # Mandatory rule: Retired / In Shop vehicles must never appear in dispatch selection
        if dispatch_pool == 'true':
            qs = qs.filter(status='Available')
        return qs


class DriverViewSet(viewsets.ModelViewSet):
    queryset = Driver.objects.all()
    serializer_class = DriverSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        qs = super().get_queryset()
        status_param = self.request.query_params.get('status')
        dispatch_pool = self.request.query_params.get('dispatch_pool')
        if status_param:
            qs = qs.filter(status=status_param)
        # Mandatory rule: expired-license / suspended drivers cannot be assigned to trips
        if dispatch_pool == 'true':
            qs = qs.filter(status='Available').exclude(license_expiry__lt=timezone.now().date())
        return qs


# ---------- Trips (with automatic status transitions) ----------

class TripViewSet(viewsets.ModelViewSet):
    queryset = Trip.objects.all()
    serializer_class = TripSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        qs = super().get_queryset()
        status_param = self.request.query_params.get('status')
        if status_param:
            qs = qs.filter(status=status_param)
        return qs

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['post'])
    def dispatch_trip(self, request, pk=None):
        trip = self.get_object()
        if trip.status != 'Draft':
            return Response({'detail': 'Only Draft trips can be dispatched.'}, status=400)
        if trip.vehicle.status != 'Available':
            return Response({'detail': 'Vehicle is no longer available.'}, status=400)
        if trip.driver.status != 'Available':
            return Response({'detail': 'Driver is no longer available.'}, status=400)
        if trip.driver.is_license_expired():
            return Response({'detail': "Driver's license has expired."}, status=400)

        trip.status = 'Dispatched'
        trip.dispatched_at = timezone.now()
        trip.vehicle.status = 'On Trip'
        trip.driver.status = 'On Trip'
        trip.save()
        trip.vehicle.save()
        trip.driver.save()
        return Response(TripSerializer(trip).data)

    @action(detail=True, methods=['post'])
    def complete_trip(self, request, pk=None):
        trip = self.get_object()
        if trip.status != 'Dispatched':
            return Response({'detail': 'Only Dispatched trips can be completed.'}, status=400)

        end_odometer = request.data.get('end_odometer')
        fuel_consumed = request.data.get('fuel_consumed')

        trip.status = 'Completed'
        trip.completed_at = timezone.now()
        if end_odometer is not None:
            trip.end_odometer = end_odometer
            trip.vehicle.odometer = end_odometer
        if fuel_consumed is not None:
            trip.fuel_consumed = fuel_consumed
            FuelLog.objects.create(
                vehicle=trip.vehicle,
                liters=fuel_consumed,
                cost=request.data.get('fuel_cost', 0),
            )

        trip.vehicle.status = 'Available'
        trip.driver.status = 'Available'
        trip.save()
        trip.vehicle.save()
        trip.driver.save()
        return Response(TripSerializer(trip).data)

    @action(detail=True, methods=['post'])
    def cancel_trip(self, request, pk=None):
        trip = self.get_object()
        if trip.status != 'Dispatched':
            return Response({'detail': 'Only Dispatched trips can be cancelled.'}, status=400)

        trip.status = 'Cancelled'
        trip.vehicle.status = 'Available'
        trip.driver.status = 'Available'
        trip.save()
        trip.vehicle.save()
        trip.driver.save()
        return Response(TripSerializer(trip).data)


# ---------- Maintenance ----------

class MaintenanceLogViewSet(viewsets.ModelViewSet):
    queryset = MaintenanceLog.objects.all()
    serializer_class = MaintenanceLogSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        log = serializer.save()
        # Mandatory rule: creating an active maintenance record -> vehicle becomes In Shop
        if log.status == 'Open':
            log.vehicle.status = 'In Shop'
            log.vehicle.save()

    @action(detail=True, methods=['post'])
    def close(self, request, pk=None):
        log = self.get_object()
        log.status = 'Closed'
        log.closed_at = timezone.now()
        log.save()
        # Mandatory rule: closing maintenance restores vehicle to Available (unless retired)
        if log.vehicle.status != 'Retired':
            log.vehicle.status = 'Available'
            log.vehicle.save()
        return Response(MaintenanceLogSerializer(log).data)


# ---------- Fuel & Expenses ----------

class FuelLogViewSet(viewsets.ModelViewSet):
    queryset = FuelLog.objects.all()
    serializer_class = FuelLogSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


class ExpenseViewSet(viewsets.ModelViewSet):
    queryset = Expense.objects.all()
    serializer_class = ExpenseSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


# ---------- Dashboard KPIs ----------

class DashboardView(APIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get(self, request):
        vehicles = Vehicle.objects.all()
        total_vehicles = vehicles.count()
        active_vehicles = vehicles.exclude(status='Retired').count()
        available_vehicles = vehicles.filter(status='Available').count()
        in_maintenance = vehicles.filter(status='In Shop').count()
        on_trip_vehicles = vehicles.filter(status='On Trip').count()

        active_trips = Trip.objects.filter(status='Dispatched').count()
        pending_trips = Trip.objects.filter(status='Draft').count()
        drivers_on_duty = Driver.objects.filter(status='On Trip').count()

        fleet_utilization = round((on_trip_vehicles / active_vehicles) * 100, 1) if active_vehicles else 0

        return Response({
            'active_vehicles': active_vehicles,
            'available_vehicles': available_vehicles,
            'vehicles_in_maintenance': in_maintenance,
            'active_trips': active_trips,
            'pending_trips': pending_trips,
            'drivers_on_duty': drivers_on_duty,
            'fleet_utilization_percent': fleet_utilization,
        })


# ---------- Reports & Analytics ----------

class ReportsView(APIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get(self, request):
        data = []
        for v in Vehicle.objects.all():
            total_distance = Trip.objects.filter(vehicle=v, status='Completed').aggregate(
                d=Sum('planned_distance'))['d'] or 0
            total_fuel = FuelLog.objects.filter(vehicle=v).aggregate(l=Sum('liters'))['l'] or 0
            total_fuel_cost = FuelLog.objects.filter(vehicle=v).aggregate(c=Sum('cost'))['c'] or 0
            total_maintenance_cost = MaintenanceLog.objects.filter(vehicle=v).aggregate(
                c=Sum('cost'))['c'] or 0
            total_expenses = Expense.objects.filter(vehicle=v).aggregate(a=Sum('amount'))['a'] or 0
            total_revenue = Trip.objects.filter(vehicle=v, status='Completed').aggregate(
                r=Sum('revenue'))['r'] or 0

            fuel_efficiency = round(float(total_distance) / float(total_fuel), 2) if total_fuel else 0
            operational_cost = float(total_fuel_cost) + float(total_maintenance_cost) + float(total_expenses)
            roi = None
            if v.acquisition_cost and float(v.acquisition_cost) > 0:
                roi = round(
                    (float(total_revenue) - (float(total_maintenance_cost) + float(total_fuel_cost)))
                    / float(v.acquisition_cost), 3
                )

            data.append({
                'vehicle': v.registration_number,
                'vehicle_name': v.name,
                'total_distance': float(total_distance),
                'total_fuel_liters': float(total_fuel),
                'fuel_efficiency_km_per_l': fuel_efficiency,
                'operational_cost': round(operational_cost, 2),
                'total_revenue': float(total_revenue),
                'roi': roi,
            })

        if request.query_params.get('format') == 'csv':
            response = HttpResponse(content_type='text/csv')
            response['Content-Disposition'] = 'attachment; filename="transitops_report.csv"'
            writer = csv.writer(response)
            writer.writerow(['Vehicle', 'Name', 'Total Distance', 'Total Fuel (L)',
                              'Fuel Efficiency (km/L)', 'Operational Cost', 'Total Revenue', 'ROI'])
            for row in data:
                writer.writerow([row['vehicle'], row['vehicle_name'], row['total_distance'],
                                  row['total_fuel_liters'], row['fuel_efficiency_km_per_l'],
                                  row['operational_cost'], row['total_revenue'], row['roi']])
            return response

        return Response(data)
