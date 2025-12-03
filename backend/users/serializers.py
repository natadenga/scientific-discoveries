from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """Серіалізатор для перегляду користувачів"""
    followers_count = serializers.SerializerMethodField()
    following_count = serializers.SerializerMethodField()
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'email', 'username', 'first_name', 'last_name', 'full_name',
            'role', 'institution', 'education_level', 'avatar', 'bio',
            'scientific_interests', 'publications', 'orcid', 'google_scholar',
            'is_verified', 'followers_count', 'following_count', 'created_at'
        ]
        read_only_fields = ['id', 'email', 'is_verified', 'created_at']

    def get_followers_count(self, obj) -> int:
        return obj.followers.count()

    def get_following_count(self, obj) -> int:
        return obj.following.count()

    def get_full_name(self, obj) -> str:
        if obj.first_name or obj.last_name:
            return f"{obj.first_name} {obj.last_name}".strip()
        return obj.username


class UserCreateSerializer(serializers.ModelSerializer):
    """Серіалізатор для реєстрації нового користувача"""
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            'email', 'username', 'first_name', 'last_name',
            'password', 'password_confirm',
            'role', 'institution', 'education_level'
        ]

    def validate(self, data):
        """Перевірка що паролі співпадають"""
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError({
                'password_confirm': 'Паролі не співпадають'
            })
        return data

    def create(self, validated_data):
        """Створення користувача з хешованим паролем"""
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')

        user = User(**validated_data)
        user.set_password(password)  # Хешує пароль
        user.save()
        return user


class UserUpdateSerializer(serializers.ModelSerializer):
    """Серіалізатор для оновлення профілю"""

    class Meta:
        model = User
        fields = [
            'username', 'first_name', 'last_name', 'bio',
            'scientific_interests', 'publications',
            'orcid', 'google_scholar', 'avatar'
        ]


class UserShortSerializer(serializers.ModelSerializer):
    """Короткий серіалізатор (для вкладення в інші об'єкти)"""
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'full_name', 'avatar', 'role', 'is_verified']

    def get_full_name(self, obj) -> str:
        if obj.first_name or obj.last_name:
            return f"{obj.first_name} {obj.last_name}".strip()
        return obj.username
