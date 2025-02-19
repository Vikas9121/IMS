"""
Core URLs Module

Defines API endpoint routing:
- Authentication endpoints
- User management routes
- Inventory operations
- Analytics and reporting
- File uploads/downloads

Features:
- JWT authentication routes
- ViewSet routing
- Custom endpoint mapping
- File handling routes
- Nested routing support
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from .views import PredictionViewSet

# Create router for ViewSets
router = DefaultRouter()
router.register(r'categories', views.CategoryViewSet)
router.register(r'products', views.ProductViewSet)
router.register(r'stocks', views.StockViewSet)
router.register(r'predictions', PredictionViewSet, basename='predictions')

# App name for URL namespacing
app_name = 'core'

# URL patterns for the core app
urlpatterns = [
    # ViewSet URLs
    path('', include(router.urls)),
    
    # Additional endpoints
    path('dashboard/', views.dashboard, name='dashboard'),
    path('test/', views.test_api, name='test-api'),
    path('auth/password-reset/', views.password_reset_request, name='password-reset'),
    path('auth/password-reset-confirm/', views.password_reset_confirm, name='password-reset-confirm'),
    path('register/', views.register_user, name='register'),
] 