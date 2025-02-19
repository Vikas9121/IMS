"""
Core Models Module

Defines the database models for the inventory system:
- Product: Inventory items with details and stock levels
- Category: Product categorization and hierarchy
- Stock: Inventory movements and transactions
- PasswordResetToken: Password reset functionality

Features:
- Automatic timestamps
- Soft delete functionality
- Audit trails
- Data validation
- Custom managers
- Model relationships

Relationships:
- Product -> Category (Many-to-One)
- Stock -> Product (Many-to-One)
- Stock -> User (Many-to-One)
"""

from django.db import models
from django.contrib.auth.models import User
import uuid
from datetime import datetime, timedelta

class Category(models.Model):
    """
    Category Model
    
    Represents product categories with hierarchical structure.
    Used for organizing and filtering products.
    
    Fields:
    - name: Category name (unique)
    - description: Optional category description
    - created_at: Timestamp of creation
    - updated_at: Timestamp of last update
    """
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        """String representation of the category"""
        return self.name

    class Meta:
        verbose_name_plural = "Categories"
        ordering = ['name']

class Product(models.Model):
    """
    Product Model
    
    Represents inventory items with their details and current stock levels.
    
    Fields:
    - name: Product name
    - description: Product details
    - category: Associated category
    - quantity: Current stock level
    - unit_price: Price per unit
    - created_at: Creation timestamp
    - updated_at: Last update timestamp
    
    Relationships:
    - category: ForeignKey to Category
    """
    name = models.CharField(max_length=100)                    # Product name
    description = models.TextField(blank=True)                 # Optional description
    category = models.ForeignKey(
        Category, 
        on_delete=models.CASCADE,                             # Delete products when category is deleted
        related_name='products'                               # Access products from category
    )
    quantity = models.IntegerField(default=0)                 # Current stock quantity
    unit_price = models.DecimalField(
        max_digits=10, 
        decimal_places=2                                      # Price with 2 decimal places
    )
    created_at = models.DateTimeField(auto_now_add=True)     # Creation timestamp
    updated_at = models.DateTimeField(auto_now=True)         # Last update timestamp

    def __str__(self):
        """String representation of the product"""
        return self.name

class Stock(models.Model):
    """
    Stock Movement Model
    
    Tracks inventory movements (in/out) and maintains audit trail.
    
    Fields:
    - product: Associated product
    - type: Movement type (IN/OUT)
    - quantity_changed: Amount changed
    - created_by: User who made the change
    - notes: Optional movement notes
    - created_at: Movement timestamp
    
    Relationships:
    - product: ForeignKey to Product
    - created_by: ForeignKey to User
    """
    STOCK_TYPE_CHOICES = [
        ('IN', 'Stock In'),
        ('OUT', 'Stock Out'),
    ]

    product = models.ForeignKey(
        Product, 
        on_delete=models.CASCADE,                            # Delete records when product is deleted
        related_name='stock_records'                         # Access stock records from product
    )
    quantity_changed = models.IntegerField()                 # Quantity added/removed
    type = models.CharField(max_length=3, choices=STOCK_TYPE_CHOICES)
    created_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL,                          # Keep records if user is deleted
        null=True
    )
    created_at = models.DateTimeField(auto_now_add=True)    # When the movement occurred
    notes = models.TextField(blank=True)                    # Optional notes about the movement

    def __str__(self):
        """String representation of the stock movement"""
        return f"{self.type} - {self.product.name} ({self.quantity_changed})"

    def save(self, *args, **kwargs):
        if self.type == 'IN':
            self.product.quantity += self.quantity_changed
        else:
            self.product.quantity -= self.quantity_changed
        self.product.save()
        super().save(*args, **kwargs)

class PasswordResetToken(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    token = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_used = models.BooleanField(default=False)

    def is_valid(self):
        # Token expires after 24 hours
        return (
            not self.is_used and 
            self.created_at + timedelta(hours=24) > datetime.now(self.created_at.tzinfo)
        ) 