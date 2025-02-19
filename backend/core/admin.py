"""
Core Admin Module

Customizes the Django admin interface for:
- Model registration
- List display configuration
- Search functionality
- Filtering options
- Action definitions
- Form customization

Features:
- Custom list displays
- Search fields
- List filters
- Inline model handling
- Admin actions
- Field ordering
"""

from django.contrib import admin
from .models import Category, Product, Stock

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    """
    Category Admin Configuration
    
    Customizes category display and functionality in admin:
    - List display fields
    - Search capabilities
    - Ordering options
    """
    list_display = ('name', 'description', 'created_at', 'updated_at')
    search_fields = ('name', 'description')
    ordering = ('name',)

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    """
    Product Admin Configuration
    
    Customizes product management in admin:
    - Display fields
    - Filtering options
    - Search functionality
    - Related field handling
    """
    list_display = ('name', 'category', 'quantity', 'unit_price', 'created_at')
    list_filter = ('category', 'created_at')
    search_fields = ('name', 'description')

class StockAdmin(admin.ModelAdmin):
    """
    Admin interface configuration for Stock model
    """
    list_display = ('product', 'quantity_changed', 'type', 'created_by', 'created_at')
    search_fields = ('product__name', 'notes')
    list_filter = ('type', 'created_at')

# Register models with their admin classes - only need these lines
admin.site.register(Stock, StockAdmin)

# Remove these duplicate registrations
# admin.site.register(Category)
# admin.site.register(Product)
# admin.site.register(Stock) 