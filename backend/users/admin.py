from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Institution


@admin.register(Institution)
class InstitutionAdmin(admin.ModelAdmin):
    list_display = ('name', 'created_at')
    search_fields = ('name',)
    ordering = ('name',)


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('email', 'username', 'role', 'institution', 'is_verified', 'created_at')
    list_filter = ('role', 'education_level', 'is_verified')
    search_fields = ('email', 'username', 'first_name', 'last_name')
    ordering = ('-created_at',)

    fieldsets = BaseUserAdmin.fieldsets + (
        ('Додаткова інформація', {
            'fields': ('role', 'institution', 'education_level', 'avatar',
                      'bio', 'scientific_interests', 'publications',
                      'orcid', 'google_scholar', 'web_of_science', 'scopus',
                      'is_verified')
        }),
    )
