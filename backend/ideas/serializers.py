from rest_framework import serializers
from .models import Idea, ScientificField, Comment, Like
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


class ReplySerializer(serializers.ModelSerializer):
    """Серіалізатор для відповідей на коментарі"""
    author = UserShortSerializer(read_only=True)

    class Meta:
        model = Comment
        fields = ['id', 'author', 'content', 'created_at']
        read_only_fields = ['id', 'author', 'created_at']


class CommentSerializer(serializers.ModelSerializer):
    """Серіалізатор для коментарів"""
    author = UserShortSerializer(read_only=True)
    replies = ReplySerializer(many=True, read_only=True)
    replies_count = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = ['id', 'author', 'content', 'created_at', 'replies', 'replies_count']
        read_only_fields = ['id', 'author', 'created_at']

    def get_replies_count(self, obj) -> int:
        return obj.replies.count()


class CommentCreateSerializer(serializers.ModelSerializer):
    """Серіалізатор для створення коментаря"""
    parent_id = serializers.PrimaryKeyRelatedField(
        queryset=Comment.objects.all(),
        source='parent',
        write_only=True,
        required=False,
        allow_null=True
    )

    class Meta:
        model = Comment
        fields = ['content', 'parent_id']

    def validate_parent_id(self, value):
        """Перевіряємо що батьківський коментар не є відповіддю (глибина 1)"""
        if value and value.parent is not None:
            raise serializers.ValidationError(
                "Можна відповідати тільки на коментарі верхнього рівня"
            )
        return value


class IdeaListSerializer(serializers.ModelSerializer):
    """Серіалізатор для списку ідей (коротка версія)"""
    author = UserShortSerializer(read_only=True)
    scientific_fields = ScientificFieldSerializer(many=True, read_only=True)
    comments_count = serializers.SerializerMethodField()
    likes_count = serializers.SerializerMethodField()

    class Meta:
        model = Idea
        fields = [
            'id', 'title', 'slug', 'author', 'scientific_fields',
            'status', 'is_open_for_collaboration',
            'views_count', 'likes_count', 'comments_count',
            'created_at'
        ]

    def get_comments_count(self, obj) -> int:
        return obj.comments.filter(parent__isnull=True).count()

    def get_likes_count(self, obj) -> int:
        return obj.likes.count()


class IdeaDetailSerializer(serializers.ModelSerializer):
    """Серіалізатор для детального перегляду ідеї"""
    author = UserShortSerializer(read_only=True)
    scientific_fields = ScientificFieldSerializer(many=True, read_only=True)
    comments = serializers.SerializerMethodField()
    comments_count = serializers.SerializerMethodField()
    likes_count = serializers.SerializerMethodField()
    liked = serializers.SerializerMethodField()

    class Meta:
        model = Idea
        fields = [
            'id', 'title', 'slug', 'description', 'author',
            'scientific_fields', 'keywords', 'status',
            'is_public', 'is_open_for_collaboration',
            'views_count', 'likes_count', 'liked',
            'comments', 'comments_count',
            'created_at', 'updated_at'
        ]

    def get_comments(self, obj):
        """Повертаємо тільки коментарі верхнього рівня (з відповідями)"""
        top_level_comments = obj.comments.filter(parent__isnull=True)
        return CommentSerializer(top_level_comments, many=True).data

    def get_comments_count(self, obj) -> int:
        return obj.comments.count()

    def get_likes_count(self, obj) -> int:
        return obj.likes.count()

    def get_liked(self, obj) -> bool:
        """Перевіряємо чи поточний користувач лайкнув ідею"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.likes.filter(user=request.user).exists()
        return False


class IdeaCreateSerializer(serializers.ModelSerializer):
    """Серіалізатор для створення/оновлення ідеї"""
    scientific_field_ids = serializers.PrimaryKeyRelatedField(
        queryset=ScientificField.objects.all(),
        many=True,
        write_only=True,
        required=False
    )

    class Meta:
        model = Idea
        fields = [
            'id', 'slug', 'title', 'description', 'scientific_field_ids',
            'keywords', 'status', 'is_public', 'is_open_for_collaboration'
        ]
        read_only_fields = ['id', 'slug']

    def create(self, validated_data):
        """Автоматично додаємо автора при створенні"""
        scientific_fields = validated_data.pop('scientific_field_ids', [])
        validated_data['author'] = self.context['request'].user
        idea = super().create(validated_data)
        if scientific_fields:
            idea.scientific_fields.set(scientific_fields)
        return idea

    def update(self, instance, validated_data):
        scientific_fields = validated_data.pop('scientific_field_ids', None)
        instance = super().update(instance, validated_data)
        if scientific_fields is not None:
            instance.scientific_fields.set(scientific_fields)
        return instance
