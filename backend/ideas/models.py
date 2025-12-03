from django.db import models
from django.conf import settings
from django.utils.text import slugify


class ScientificField(models.Model):
    """Галузі науки"""
    name = models.CharField('Назва', max_length=255, unique=True)
    slug = models.SlugField('Slug', unique=True, blank=True)
    description = models.TextField('Опис', blank=True)
    
    class Meta:
        verbose_name = 'Галузь науки'
        verbose_name_plural = 'Галузі науки'
        ordering = ['name']
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)
    
    def __str__(self):
        return self.name


class IdeaStatus(models.TextChoices):
    IDEA = 'idea', 'Ідея'
    IN_PROGRESS = 'in_progress', 'У процесі'
    COMPLETED = 'completed', 'Завершено'


class Idea(models.Model):
    """Наукова ідея"""
    title = models.CharField('Назва', max_length=255)
    slug = models.SlugField('Slug', max_length=100, unique=True, blank=True)
    description = models.TextField('Опис')
    
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='ideas',
        verbose_name='Автор'
    )
    
    scientific_field = models.ForeignKey(
        ScientificField,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='ideas',
        verbose_name='Галузь науки'
    )
    
    keywords = models.CharField('Ключові слова', max_length=500, blank=True)
    status = models.CharField(
        'Статус',
        max_length=20,
        choices=IdeaStatus.choices,
        default=IdeaStatus.IDEA
    )
    
    is_public = models.BooleanField('Публічна', default=True)
    is_open_for_collaboration = models.BooleanField('Відкрита для співпраці', default=True)
    
    views_count = models.PositiveIntegerField('Перегляди', default=0)
    likes_count = models.PositiveIntegerField('Лайки', default=0)
    
    created_at = models.DateTimeField('Дата створення', auto_now_add=True)
    updated_at = models.DateTimeField('Дата оновлення', auto_now=True)
    
    class Meta:
        verbose_name = 'Ідея'
        verbose_name_plural = 'Ідеї'
        ordering = ['-created_at']
    
    def save(self, *args, **kwargs):
        if not self.slug:
            # slugify з allow_unicode для кирилиці, обмежуємо до 80 символів
            base_slug = slugify(self.title, allow_unicode=True)[:80]
            if not base_slug:
                # Якщо slug порожній - використовуємо timestamp
                import time
                base_slug = f"idea-{int(time.time())}"
            slug = base_slug
            counter = 1
            while Idea.objects.filter(slug=slug).exists():
                slug = f"{base_slug[:70]}-{counter}"  # залишаємо місце для лічильника
                counter += 1
            self.slug = slug
        super().save(*args, **kwargs)
    
    def __str__(self):
        return self.title


class Comment(models.Model):
    """Коментар до ідеї"""
    idea = models.ForeignKey(
        Idea,
        on_delete=models.CASCADE,
        related_name='comments',
        verbose_name='Ідея'
    )
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='comments',
        verbose_name='Автор'
    )
    content = models.TextField('Зміст')
    created_at = models.DateTimeField('Дата створення', auto_now_add=True)
    
    class Meta:
        verbose_name = 'Коментар'
        verbose_name_plural = 'Коментарі'
        ordering = ['created_at']
    
    def __str__(self):
        return f"Коментар від {self.author} до {self.idea}"
