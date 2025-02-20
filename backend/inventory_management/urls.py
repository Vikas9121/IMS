"""
URL configuration for inventory_management project.

This module defines the main URL routing for the entire project.
It includes:
- Admin interface URLs
- API documentation URLs (Swagger and ReDoc)
- Core app URLs
- Root URL redirect

URL Structure:
- /admin/           -> Django Admin Interface
- /swagger/         -> Swagger API Documentation
- /redoc/           -> ReDoc API Documentation
- /api/            -> Core API Endpoints
- /                -> Redirects to Admin Interface
"""

# Import necessary Django and third-party modules
from django.contrib import admin
from django.urls import path, include
from django.views.generic import RedirectView
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from rest_framework_simplejwt.views import TokenRefreshView
from core import views

# Swagger/OpenAPI documentation configuration
schema_view = get_schema_view(
    openapi.Info(
        title="IMS API",
        default_version='v1',
        description="Inventory Management System API",
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

# URL patterns for the entire project
urlpatterns = [
    # Redirect root URL to admin interface for easy access
    path('', RedirectView.as_view(url='/admin/', permanent=True)),
    
    # Django admin interface URL - provides built-in admin panel
    path('admin/', admin.site.urls),
    
    # Swagger documentation URLs - API documentation interfaces
    path('', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('api/docs/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
    
    # Authentication endpoints
    path('api/auth/', include([
        path('token/', views.LoginView.as_view(), name='token_obtain_pair'),
        path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
        path('profile/', views.get_user_profile, name='user_profile'),
    ])),
    
    # Core API endpoints
    path('api/', include('core.urls')),
]
