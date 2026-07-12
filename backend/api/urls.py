from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    RegisterView, LoginView, MeView,
    VehicleViewSet, DriverViewSet, TripViewSet,
    MaintenanceLogViewSet, FuelLogViewSet, ExpenseViewSet,
    DashboardView, ReportsView,
)

router = DefaultRouter()
router.register(r'vehicles', VehicleViewSet, basename='vehicle')
router.register(r'drivers', DriverViewSet, basename='driver')
router.register(r'trips', TripViewSet, basename='trip')
router.register(r'maintenance', MaintenanceLogViewSet, basename='maintenance')
router.register(r'fuel-logs', FuelLogViewSet, basename='fuellog')
router.register(r'expenses', ExpenseViewSet, basename='expense')

urlpatterns = [
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/me/', MeView.as_view(), name='me'),
    path('dashboard/', DashboardView.as_view(), name='dashboard'),
    path('reports/', ReportsView.as_view(), name='reports'),
    path('', include(router.urls)),
]
