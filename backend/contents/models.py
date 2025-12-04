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


class ContentStatus(models.TextChoices):
    IDEA = 'idea', 'Ідея'
    IN_PROGRESS = 'in_progress', 'У процесі'
    COMPLETED = 'completed', 'Завершено'


class ContentType(models.TextChoices):
    IDEA = 'idea', 'Ідея'
    RESOURCE = 'resource', 'Корисний ресурс'
    WEBINAR = 'webinar', 'Вебінар'
    LECTURE = 'lecture', 'Гостьова лекція'


class Content(models.Model):
    """Науковий контент: ідея / ресурс / вебінар / лекція"""
    content_type = models.CharField(
        'Тип контенту',
        max_length=20,
        choices=ContentType.choices,
        default=ContentType.IDEA
    )
    title = models.CharField('Назва', max_length=255)
    slug = models.SlugField('Slug', max_length=100, unique=True, blank=True)
    description = models.TextField('Опис')
    link = models.URLField('Посилання', max_length=500, blank=True)

    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='contents',
        verbose_name='Автор'
    )

    scientific_fields = models.ManyToManyField(
        ScientificField,
        blank=True,
        related_name='contents',
        verbose_name='Галузі науки'
    )

    keywords = models.CharField('Ключові слова', max_length=500, blank=True)
    status = models.CharField(
        'Статус',
        max_length=20,
        choices=ContentStatus.choices,
        default=ContentStatus.IDEA
    )

    is_public = models.BooleanField('Публічний', default=True)
    is_open_for_collaboration = models.BooleanField('Відкритий для співпраці', default=True)

    views_count = models.PositiveIntegerField('Перегляди', default=0)

    created_at = models.DateTimeField('Дата створення', auto_now_add=True)
    updated_at = models.DateTimeField('Дата оновлення', auto_now=True)

    class Meta:
        verbose_name = 'Контент'
        verbose_name_plural = 'Контент'
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.slug:
            # slugify з allow_unicode для кирилиці, обмежуємо до 80 символів
            base_slug = slugify(self.title, allow_unicode=True)[:80]
            if not base_slug:
                # Якщо slug порожній - використовуємо timestamp
                import time
                base_slug = f"content-{int(time.time())}"
            slug = base_slug
            counter = 1
            while Content.objects.filter(slug=slug).exists():
                slug = f"{base_slug[:70]}-{counter}"  # залишаємо місце для лічильника
                counter += 1
            self.slug = slug
        super().save(*args, **kwargs)

    @property
    def likes_count(self):
        return self.likes.count()

    def __str__(self):
        return self.title


class Like(models.Model):
    """Лайк до контенту"""
    content = models.ForeignKey(
        Content,
        on_delete=models.CASCADE,
        related_name='likes',
        verbose_name='Контент'
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='likes',
        verbose_name='Користувач'
    )
    created_at = models.DateTimeField('Дата', auto_now_add=True)

    class Meta:
        verbose_name = 'Лайк'
        verbose_name_plural = 'Лайки'
        unique_together = ['content', 'user']  # Один лайк від користувача

    def __str__(self):
        return f"{self.user} лайкнув {self.content}"


class Comment(models.Model):
    """Коментар до контенту"""
    content = models.ForeignKey(
        Content,
        on_delete=models.CASCADE,
        related_name='comments',
        verbose_name='Контент'
    )
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='comments',
        verbose_name='Автор'
    )
    parent = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='replies',
        verbose_name='Батьківський коментар'
    )
    text = models.TextField('Зміст')
    created_at = models.DateTimeField('Дата створення', auto_now_add=True)

    class Meta:
        verbose_name = 'Коментар'
        verbose_name_plural = 'Коментарі'
        ordering = ['created_at']

    def __str__(self):
        return f"Коментар від {self.author} до {self.content}"
