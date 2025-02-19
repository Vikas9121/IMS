"""
Core Views Module

This module contains the main API views for:
- Authentication (login, register, password reset)
- User management (profile, preferences)
- Inventory operations (products, categories, stock)
- Analytics and predictions
- Dashboard metrics

Features:
- JWT authentication
- Permission-based access control
- Request validation
- Error handling
- Response formatting
- Cache management
- Rate limiting

Classes:
- LoginView: Handle user authentication
- RegisterView: New user registration
- ProfileView: User profile management
- ProductViewSet: Product CRUD operations
- CategoryViewSet: Category management
- StockViewSet: Inventory movements
- DashboardView: Analytics and metrics
- PredictionView: ML-based forecasting
"""

# Import necessary modules from Django REST framework
from rest_framework import viewsets, permissions
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Sum, Count, F
from django.utils import timezone
from datetime import timedelta
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.permissions import AllowAny
from django.contrib.auth.models import User
from .serializers import CategorySerializer, ProductSerializer, StockSerializer, UserSerializer, UserCreateSerializer
from rest_framework import status
from sklearn.linear_model import LinearRegression
import numpy as np
from datetime import datetime
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.conf import settings
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError

# Import local models and serializers
from .models import Category, Product, Stock, PasswordResetToken

class CategoryViewSet(viewsets.ModelViewSet):
    """
    ViewSet for handling Category operations.
    Provides CRUD operations: list, create, retrieve, update, delete
    """
    queryset = Category.objects.all()                # Get all categories
    serializer_class = CategorySerializer            # Serializer for Category model
    permission_classes = [permissions.IsAuthenticated]           # Only authenticated users can access

    def perform_create(self, serializer):
        serializer.save()

class ProductViewSet(viewsets.ModelViewSet):
    """
    ViewSet for handling Product operations.
    Provides CRUD operations: list, create, retrieve, update, delete
    """
    queryset = Product.objects.all()                # Get all products
    serializer_class = ProductSerializer            # Serializer for Product model
    permission_classes = [permissions.IsAuthenticated]          # Only authenticated users can access

    def get_queryset(self):
        queryset = Product.objects.all()
        category = self.request.query_params.get('category', None)
        if category:
            queryset = queryset.filter(category_id=category)
        return queryset

class StockViewSet(viewsets.ModelViewSet):
    """
    ViewSet for handling Stock operations.
    Provides CRUD operations: list, create, retrieve, update, delete
    """
    queryset = Stock.objects.all()                  # Get all stock records
    serializer_class = StockSerializer              # Serializer for Stock model
    permission_classes = [permissions.IsAuthenticated]          # Only authenticated users can access 

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard(request):
    """
    Dashboard view providing overview of inventory system.
    Returns:
    - Inventory summary
    - Stock movements
    - Top products
    - Recent transactions
    - Transaction summary
    - Recent activity
    """
    try:
        # Get date range from query params or default to last 30 days
        days = int(request.query_params.get('days', 30))
        today = timezone.now()
        start_date = today - timedelta(days=days)

        # Basic metrics
        metrics = {
            'inventory_summary': {
                'total_products': Product.objects.count(),
                'total_categories': Category.objects.count(),
                'low_stock_products': Product.objects.filter(quantity__lte=10).count(),
                'out_of_stock_products': Product.objects.filter(quantity=0).count(),
                'total_inventory_value': Product.objects.annotate(
                    item_value=F('quantity') * F('unit_price')
                ).aggregate(total=Sum('item_value'))['total'] or 0,
            },
            
            'stock_movements': {
                'recent_movements': Stock.objects.filter(
                    created_at__gte=start_date
                ).count(),
                'stock_in': Stock.objects.filter(
                    type='IN', 
                    created_at__gte=start_date
                ).aggregate(total=Sum('quantity_changed'))['total'] or 0,
                'stock_out': Stock.objects.filter(
                    type='OUT', 
                    created_at__gte=start_date
                ).aggregate(total=Sum('quantity_changed'))['total'] or 0,
            },
            
            'top_products': {
                'most_active': Product.objects.annotate(
                    movement_count=Count('stock_records')
                ).order_by('-movement_count')[:5].values('name', 'movement_count'),
                'highest_value': Product.objects.annotate(
                    total_value=F('quantity') * F('unit_price')
                ).order_by('-total_value')[:5].values(
                    'name', 'unit_price', 'quantity', 'total_value'
                ),
                'lowest_stock': Product.objects.filter(
                    quantity__gt=0
                ).order_by('quantity')[:5].values('name', 'quantity'),
            },
            
            'recent_transactions': Stock.objects.select_related(
                'product', 'created_by'
            ).order_by('-created_at')[:5].values(
                'created_at',
                'product__name',
                'type',
                'quantity_changed',
                'created_by__username'
            ),
            
            'transaction_summary': {
                'total_transactions': Stock.objects.filter(
                    created_at__gte=start_date
                ).count(),
                'total_value': Stock.objects.filter(
                    created_at__gte=start_date
                ).annotate(
                    value=F('quantity_changed') * F('product__unit_price')
                ).aggregate(total=Sum('value'))['total'] or 0,
            }
        }
        
        return Response(metrics)
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    """
    Register a new user
    """
    try:
        data = request.data
        # Check if username exists
        if User.objects.filter(username=data['username']).exists():
            return Response({
                'detail': 'Username already exists'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if email exists
        if User.objects.filter(email=data['email']).exists():
            return Response({
                'detail': 'Email already exists'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Create user
        user = User.objects.create_user(
            username=data['username'],
            email=data['email'],
            password=data['password'],
            first_name=data.get('first_name', ''),
            last_name=data.get('last_name', '')
        )

        return Response({
            'detail': 'User registered successfully',
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email
            }
        }, status=status.HTTP_201_CREATED)

    except Exception as e:
        print(f"Registration error: {str(e)}")
        return Response({
            'detail': 'Failed to register user'
        }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated])
def get_user_profile(request):
    """
    GET: Get logged in user's profile
    PATCH: Update user profile
    """
    if request.method == 'GET':
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
    
    elif request.method == 'PATCH':
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(TokenObtainPairView):
    """
    Handle user authentication and token generation.
    
    POST: Accepts username/password, returns authentication token
    
    Request body:
    {
        "username": "string",
        "password": "string"
    }
    
    Response:
    {
        "token": "string",
        "user": UserSerializer data
    }
    """
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        try:
            response = super().post(request, *args, **kwargs)
            return response
        except (InvalidToken, TokenError, Exception) as e:
            print(f"Login error: {str(e)}")  # For debugging
            return Response(
                {'detail': 'Invalid username or password. Please try again.'},
                status=status.HTTP_401_UNAUTHORIZED
            )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def test_token(request):
    return Response({"message": "Token is valid"})

@api_view(['GET'])
@permission_classes([AllowAny])
def test_api(request):
    return Response({"message": "API is working"})

class PredictionViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def retrieve(self, request, pk=None):
        try:
            # Get historical data
            product = Product.objects.get(pk=pk)
            days = int(request.query_params.get('days', 30))
            end_date = datetime.now()
            start_date = end_date - timedelta(days=days)
            
            # Get stock movements
            stock_movements = Stock.objects.filter(
                product=product,
                created_at__range=[start_date, end_date]
            ).order_by('created_at')

            # Prepare data for ML
            dates = [(m.created_at - start_date).days for m in stock_movements]
            quantities = [m.quantity_changed for m in stock_movements]
            
            if len(dates) < 2:
                return Response({
                    'error': 'Insufficient data for prediction'
                }, status=400)

            # Prepare prediction model
            X = np.array(dates).reshape(-1, 1)
            y = np.array(quantities)
            model = LinearRegression()
            model.fit(X, y)

            # Generate future dates
            future_days = range(days + 1, days + 31)
            future_X = np.array(future_days).reshape(-1, 1)
            
            # Make predictions
            predictions = model.predict(future_X)
            
            # Calculate confidence score
            confidence_score = max(0, min(100, model.score(X, y) * 100))
            
            # Calculate reorder point
            avg_daily_demand = np.mean(quantities)
            std_daily_demand = np.std(quantities)
            lead_time = 7  # Assumed lead time in days
            service_level = 1.96  # 95% service level
            reorder_point = (avg_daily_demand * lead_time) + (service_level * std_daily_demand * np.sqrt(lead_time))

            return Response({
                'dates': [start_date + timedelta(days=d) for d in future_days],
                'historical': quantities,
                'forecast': predictions.tolist(),
                'reorderPoint': round(reorder_point),
                'peakDemand': round(max(predictions)),
                'confidenceScore': round(confidence_score),
                'alerts': self._generate_alerts(product, predictions, reorder_point)
            })

        except Product.DoesNotExist:
            return Response({'error': 'Product not found'}, status=404)
        except Exception as e:
            return Response({'error': str(e)}, status=500)

    def _generate_alerts(self, product, predictions, reorder_point):
        current_stock = product.quantity
        if current_stock <= reorder_point:
            return f"Stock level ({current_stock}) is below reorder point ({round(reorder_point)}). Consider restocking soon."
        return None 

@api_view(['POST'])
@permission_classes([AllowAny])
def password_reset_request(request):
    """Handle password reset request"""
    try:
        email = request.data.get('email')
        if not email:
            return Response({
                'detail': 'Email is required.'
            }, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.filter(email=email).first()
        if user:
            # Create reset token
            reset_token = PasswordResetToken.objects.create(user=user)
            
            # Create reset link
            reset_url = f"http://localhost:3000/reset-password/{reset_token.token}"
            
            # Send email with reset link
            send_mail(
                subject='Password Reset Request',
                message=f'Click the following link to reset your password: {reset_url}',
                from_email=None,  # Uses DEFAULT_FROM_EMAIL from settings
                recipient_list=[user.email],
                fail_silently=False,
            )

        # Always return success (security best practice)
        return Response({
            'message': 'If an account exists with this email, you will receive password reset instructions.'
        })

    except Exception as e:
        print(f"Password reset error: {str(e)}")
        return Response({
            'detail': 'Failed to process password reset request.'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([AllowAny])
def password_reset_confirm(request):
    """Handle password reset confirmation"""
    try:
        token = request.data.get('token')
        new_password = request.data.get('new_password')

        if not token or not new_password:
            return Response({
                'detail': 'Token and new password are required.'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Find and validate token
        reset_token = PasswordResetToken.objects.filter(token=token).first()
        if not reset_token or not reset_token.is_valid():
            return Response({
                'detail': 'Invalid or expired reset token.'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Reset password
        user = reset_token.user
        user.set_password(new_password)
        user.save()

        # Mark token as used
        reset_token.is_used = True
        reset_token.save()

        return Response({
            'message': 'Password reset successful.'
        })

    except Exception as e:
        print(f"Password reset confirmation error: {str(e)}")
        return Response({
            'detail': 'Failed to reset password.'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR) 