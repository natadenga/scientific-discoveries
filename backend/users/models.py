from django.contrib.auth.models import AbstractUser
from django.db import models


class EducationLevel(models.TextChoices):
    INCOMPLETE_SECONDARY = 'incomplete_secondary', 'Неповна середня освіта'
    SECONDARY = 'secondary', 'Середня освіта'
    BACHELOR = 'bachelor', 'Бакалавр'
    MASTER = 'master', 'Магістр'
    PHD = 'phd', 'Аспірант / PhD'
    DOCTOR = 'doctor', 'Доктор наук'


class UserRole(models.TextChoices):
    STUDENT = 'student', 'Студент'
    TEACHER = 'teacher', 'Викладач'
    RESEARCHER = 'researcher', 'Дослідник'


class User(AbstractUser):
    """Розширена модель користувача"""
    email = models.EmailField('Email', unique=True)
    role = models.CharField('Роль', max_length=20, choices=UserRole.choices)
    institution = models.CharField('Заклад освіти', max_length=255)
    education_level = models.CharField(
        'Рівень освіти',
        max_length=30,
        choices=EducationLevel.choices,
        default=EducationLevel.BACHELOR
    )
    
    # Профіль
    avatar = models.ImageField('Фото', upload_to='avatars/', null=True, blank=True)
    bio = models.TextField('Біографія', blank=True)
    scientific_interests = models.TextField('Наукові інтереси', blank=True)
    publications = models.TextField('Публікації', blank=True)
    
    # Наукові профілі
    orcid = models.CharField('ORCID', max_length=50, blank=True)
    google_scholar = models.URLField('Google Scholar', blank=True)
    
    # Підписки
    following = models.ManyToManyField(
        'self',
        symmetrical=False,
        related_name='followers',
        blank=True
    )
    
    is_verified = models.BooleanField('Верифікований', default=False)
    created_at = models.DateTimeField('Дата створення', auto_now_add=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'role', 'institution']
    
    class Meta:
        verbose_name = 'Користувач'
        verbose_name_plural = 'Користувачі'
        ordering = ['-created_at']
    
    def __str__(self):
        return self.email
