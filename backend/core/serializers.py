"""
Core Serializers Module

Handles data serialization/deserialization for:
- API request/response formatting
- Data validation
- Complex data transformations
- Nested relationships
- Custom field processing

Features:
- Nested serialization
- Custom validation
- Field transformations
- Relationship handling
- Response formatting
"""

from rest_framework import serializers
from .models import Category, Product, Stock
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password

class CategorySerializer(serializers.ModelSerializer):
    """
    Category Serializer
    
    Handles category data with:
    - Basic field serialization
    - Product count calculation
    - Nested product data (optional)
    - Custom validation rules
    """
    class Meta:
        model = Category                # The model to serialize
        fields = '__all__'             # Include all fields from the model
        # This will serialize: id, name, description, created_at, updated_at

class ProductSerializer(serializers.ModelSerializer):
    """
    Serializer for the Product model
    Converts Product instances to/from JSON
    """
    category_name = serializers.CharField(source='category.name', read_only=True)
    
    class Meta:
        model = Product                 # The model to serialize
        fields = ['id', 'name', 'description', 'category', 'category_name', 
                 'quantity', 'unit_price', 'created_at', 'updated_at']

class StockSerializer(serializers.ModelSerializer):
    """
    Serializer for the Stock model
    Converts Stock movement instances to/from JSON
    """
    product_name = serializers.CharField(source='product.name', read_only=True)
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    
    class Meta:
        model = Stock                   # The model to serialize
        fields = ['id', 'product', 'product_name', 'quantity_changed', 'type',
                 'notes', 'created_by', 'created_by_username', 'created_at']

class DashboardMetricsSerializer(serializers.Serializer):
    """
    Serializer for dashboard metrics.
    Handles the structure of dashboard data returned by the API.
    """
    inventory_summary = serializers.DictField(
        child=serializers.IntegerField(min_value=0)
    )
    stock_movements = serializers.DictField(
        child=serializers.IntegerField(min_value=0)
    )
    top_products = serializers.DictField()
    recent_transactions = serializers.ListField(
        child=serializers.DictField()
    )
    transaction_summary = serializers.DictField(
        child=serializers.DecimalField(max_digits=10, decimal_places=2)
    )
    recent_activity = serializers.ListField(
        child=serializers.DictField()
    )

    class Meta:
        fields = (
            'inventory_summary',
            'stock_movements',
            'top_products',
            'recent_transactions',
            'transaction_summary',
            'recent_activity'
        )

class UserSerializer(serializers.ModelSerializer):
    """
    User Serializer
    
    Handles user data serialization with:
    - Password hashing
    - Field validation
    - Custom field formatting
    - Profile data inclusion
    """
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']
        read_only_fields = ('id',)

class UserCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for User registration
    """
    password = serializers.CharField(
        write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ('username', 'password', 'password2', 
                 'email', 'first_name', 'last_name')

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError(
                {"password": "Password fields didn't match."})
        return attrs

    def create(self, validated_data):
        user = User.objects.create(
            username=validated_data['username'],
            email=validated_data['email'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name']
        )
        user.set_password(validated_data['password'])
        user.save()
        return user 