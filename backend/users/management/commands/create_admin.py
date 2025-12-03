from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from decouple import config

User = get_user_model()


class Command(BaseCommand):
    help = 'Create admin user from environment variables'

    def handle(self, *args, **options):
        email = config('ADMIN_EMAIL', default=None)
        password = config('ADMIN_PASSWORD', default=None)

        if not email or not password:
            self.stdout.write(self.style.WARNING(
                'ADMIN_EMAIL and ADMIN_PASSWORD not set, skipping admin creation'
            ))
            return

        if User.objects.filter(email=email).exists() or User.objects.filter(username='admin').exists():
            self.stdout.write(self.style.WARNING(f'Admin already exists, skipping'))
            return

        User.objects.create_superuser(
            email=email,
            username='admin',
            password=password,
            role='teacher',
            institution='Admin'
        )
        self.stdout.write(self.style.SUCCESS(f'Admin {email} created successfully'))
