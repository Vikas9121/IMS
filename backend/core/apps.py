"""
Core App Configuration

Defines the core app settings and initialization:
- App configuration
- Signal registration
- App-specific settings
- Custom app functionality

Features:
- App registry
- Signal handlers
- Custom configurations
- Startup operations
"""

from django.apps import AppConfig

class CoreConfig(AppConfig):
    """
    Core Application Configuration
    
    Handles app initialization and setup:
    - Default auto field
    - App name
    - Signal registration
    - Initial setup
    """
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'core'

    def ready(self):
        """
        Perform initialization operations when app is ready:
        - Register signals
        - Initialize services
        - Setup background tasks
        """
        import core.signals  # Import signals 