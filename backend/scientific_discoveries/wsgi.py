"""WSGI config for scientific_discoveries project."""
import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'scientific_discoveries.settings')
application = get_wsgi_application()
