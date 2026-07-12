from rest_framework import serializers
from django.contrib.auth.models import User
from django.utils import timezone
from .models import Profile, Vehicle, Driver, Trip, MaintenanceLog, FuelLog, Expense


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ['role']


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    role = serializers.ChoiceField(choices=Profile.ROLE_CHOICES, write_only=True, default='fleet_manager')
    profile = ProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'role', 'profile']

    def create(self, validated_data):
        role = validated_data.pop('role', 'fleet_manager')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
        )
        Profile.objects.create(user=user, role=role)
        return user


class VehicleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vehicle
        fields = '__all__'

    def validate_registration_number(self, value):
        if not value.strip():
            raise serializers.ValidationError("Registration number is required.")
        qs = Vehicle.objects.filter(registration_number__iexact=value.strip())
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError("A vehicle with this registration number already exists.")
        return value.strip()

    def validate_capacity_kg(self, value):
        if value <= 0:
            raise serializers.ValidationError("Capacity must be greater than 0.")
        return value


class DriverSerializer(serializers.ModelSerializer):
    is_license_expired = serializers.SerializerMethodField()

    class Meta:
        model = Driver
        fields = '__all__'

    def get_is_license_expired(self, obj):
        return obj.is_license_expired()

    def validate_license_number(self, value):
        if not value.strip():
            raise serializers.ValidationError("License number is required.")
        qs = Driver.objects.filter(license_number__iexact=value.strip())
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError("A driver with this license number already exists.")
        return value.strip()

    def validate_contact_number(self, value):
        if not value.strip():
            raise serializers.ValidationError("Contact number is required.")
        return value.strip()


class TripSerializer(serializers.ModelSerializer):
    vehicle_registration = serializers.ReadOnlyField(source='vehicle.registration_number')
    driver_name = serializers.ReadOnlyField(source='driver.name')

    class Meta:
        model = Trip
        fields = '__all__'
        read_only_fields = ['status', 'start_odometer', 'end_odometer', 'fuel_consumed',
                             'created_by', 'dispatched_at', 'completed_at']

    def validate(self, data):
        vehicle = data.get('vehicle') or getattr(self.instance, 'vehicle', None)
        driver = data.get('driver') or getattr(self.instance, 'driver', None)
        cargo_weight = data.get('cargo_weight') or getattr(self.instance, 'cargo_weight', None)

        # Mandatory rule: cargo weight must not exceed vehicle's max load capacity
        if vehicle and cargo_weight is not None and cargo_weight > vehicle.capacity_kg:
            raise serializers.ValidationError(
                f"Cargo weight ({cargo_weight}kg) exceeds vehicle capacity ({vehicle.capacity_kg}kg)."
            )

        # Only creating a NEW trip needs availability checks (editing an existing
        # dispatched trip shouldn't re-check, since it's already flagged On Trip)
        if self.instance is None:
            if vehicle and vehicle.status not in ('Available',):
                raise serializers.ValidationError(f"Vehicle {vehicle.registration_number} is not available.")
            if driver:
                if driver.status not in ('Available',):
                    raise serializers.ValidationError(f"Driver {driver.name} is not available.")
                if driver.is_license_expired():
                    raise serializers.ValidationError(f"Driver {driver.name}'s license has expired.")

        return data


class MaintenanceLogSerializer(serializers.ModelSerializer):
    vehicle_registration = serializers.ReadOnlyField(source='vehicle.registration_number')

    class Meta:
        model = MaintenanceLog
        fields = '__all__'


class FuelLogSerializer(serializers.ModelSerializer):
    vehicle_registration = serializers.ReadOnlyField(source='vehicle.registration_number')

    class Meta:
        model = FuelLog
        fields = '__all__'

    def validate_liters(self, value):
        if value <= 0:
            raise serializers.ValidationError("Liters must be greater than 0.")
        return value


class ExpenseSerializer(serializers.ModelSerializer):
    vehicle_registration = serializers.ReadOnlyField(source='vehicle.registration_number')

    class Meta:
        model = Expense
        fields = '__all__'

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Amount must be greater than 0.")
        return value
