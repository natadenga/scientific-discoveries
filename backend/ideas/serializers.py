from rest_framework import serializers
from .models import Idea, ScientificField, Comment
from users.serializers import UserShortSerializer


class ScientificFieldSerializer(serializers.ModelSerializer):
    """Серіалізатор для галузей науки"""
    ideas_count = serializers.SerializerMethodField()

    class Meta:
        model = ScientificField
        fields = ['id', 'name', 'slug', 'description', 'ideas_count']
        read_only_fields = ['slug']

    def get_ideas_count(self, obj) -> int:
        return obj.ideas.count()


class CommentSerializer(serializers.ModelSerializer):
    """Серіалізатор для коментарів"""
    author = UserShortSerializer(read_only=True)

    class Meta:
        model = Comment
        fields = ['id', 'author', 'content', 'created_at']
        read_only_fields = ['id', 'author', 'created_at']


class CommentCreateSerializer(serializers.ModelSerializer):
    """Серіалізатор для створення коментаря"""

    class Meta:
        model = Comment
        fields = ['content']


class IdeaListSerializer(serializers.ModelSerializer):
    """Серіалізатор для списку ідей (коротка версія)"""
    author = UserShortSerializer(read_only=True)
    scientific_field = ScientificFieldSerializer(read_only=True)
    comments_count = serializers.SerializerMethodField()

    class Meta:
        model = Idea
        fields = [
            'id', 'title', 'slug', 'author', 'scientific_field',
            'status', 'is_open_for_collaboration',
            'views_count', 'likes_count', 'comments_count',
            'created_at'
        ]

    def get_comments_count(self, obj) -> int:
        return obj.comments.count()


class IdeaDetailSerializer(serializers.ModelSerializer):
    """Серіалізатор для детального перегляду ідеї"""
    author = UserShortSerializer(read_only=True)
    scientific_field = ScientificFieldSerializer(read_only=True)
    comments = CommentSerializer(many=True, read_only=True)
    comments_count = serializers.SerializerMethodField()

    class Meta:
        model = Idea
        fields = [
            'id', 'title', 'slug', 'description', 'author',
            'scientific_field', 'keywords', 'status',
            'is_public', 'is_open_for_collaboration',
            'views_count', 'likes_count',
            'comments', 'comments_count',
            'created_at', 'updated_at'
        ]

    def get_comments_count(self, obj) -> int:
        return obj.comments.count()


class IdeaCreateSerializer(serializers.ModelSerializer):
    """Серіалізатор для створення/оновлення ідеї"""
    scientific_field_id = serializers.PrimaryKeyRelatedField(
        queryset=ScientificField.objects.all(),
        source='scientific_field',
        write_only=True,
        required=False
    )

    class Meta:
        model = Idea
        fields = [
            'id', 'slug', 'title', 'description', 'scientific_field_id',
            'keywords', 'status', 'is_public', 'is_open_for_collaboration'
        ]
        read_only_fields = ['id', 'slug']

    def create(self, validated_data):
        """Автоматично додаємо автора при створенні"""
        validated_data['author'] = self.context['request'].user
        return super().create(validated_data)
