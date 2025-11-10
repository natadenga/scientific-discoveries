from django.contrib import admin
from .models import ScientificField, Idea, Comment


@admin.register(ScientificField)
class ScientificFieldAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug')
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ('name',)


@admin.register(Idea)
class IdeaAdmin(admin.ModelAdmin):
    list_display = ('title', 'author', 'status', 'scientific_field', 'views_count', 'created_at')
    list_filter = ('status', 'scientific_field', 'is_public', 'created_at')
    search_fields = ('title', 'description', 'keywords')
    prepopulated_fields = {'slug': ('title',)}
    readonly_fields = ('views_count', 'likes_count', 'created_at', 'updated_at')


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ('author', 'idea', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('content', 'author__email')
