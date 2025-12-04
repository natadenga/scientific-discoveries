from django.contrib import admin
from .models import ScientificField, Idea, Comment, Like


@admin.register(ScientificField)
class ScientificFieldAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug')
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ('name',)


@admin.register(Idea)
class IdeaAdmin(admin.ModelAdmin):
    list_display = ('title', 'author', 'status', 'views_count', 'created_at')
    list_filter = ('status', 'scientific_fields', 'is_public', 'created_at')
    search_fields = ('title', 'description', 'keywords')
    prepopulated_fields = {'slug': ('title',)}
    readonly_fields = ('views_count', 'created_at', 'updated_at')
    filter_horizontal = ('scientific_fields',)


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ('author', 'idea', 'parent', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('content', 'author__email')


@admin.register(Like)
class LikeAdmin(admin.ModelAdmin):
    list_display = ('user', 'idea', 'created_at')
    list_filter = ('created_at',)
