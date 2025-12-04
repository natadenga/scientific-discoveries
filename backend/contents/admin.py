from django.contrib import admin
from .models import ScientificField, Content, Comment, Like


@admin.register(ScientificField)
class ScientificFieldAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug')
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ('name',)


@admin.register(Content)
class ContentAdmin(admin.ModelAdmin):
    list_display = ('title', 'content_type', 'author', 'status', 'views_count', 'created_at')
    list_filter = ('content_type', 'status', 'scientific_fields', 'is_public', 'created_at')
    search_fields = ('title', 'description', 'keywords')
    prepopulated_fields = {'slug': ('title',)}
    readonly_fields = ('views_count', 'created_at', 'updated_at')
    filter_horizontal = ('scientific_fields',)


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ('author', 'content', 'parent', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('text', 'author__email')


@admin.register(Like)
class LikeAdmin(admin.ModelAdmin):
    list_display = ('user', 'content', 'created_at')
    list_filter = ('created_at',)
