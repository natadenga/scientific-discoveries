from rest_framework import serializers
from .models import Content, ScientificField, Comment, Like
from users.serializers import UserShortSerializer


class ScientificFieldSerializer(serializers.ModelSerializer):
    """Серіалізатор для галузей науки"""
    contents_count = serializers.SerializerMethodField()

    class Meta:
        model = ScientificField
        fields = ['id', 'name', 'slug', 'description', 'contents_count']
        read_only_fields = ['slug']

    def get_contents_count(self, obj) -> int:
        return obj.contents.count()


class ReplySerializer(serializers.ModelSerializer):
    """Серіалізатор для відповідей на коментарі"""
    author = UserShortSerializer(read_only=True)

    class Meta:
        model = Comment
        fields = ['id', 'author', 'text', 'created_at']
        read_only_fields = ['id', 'author', 'created_at']


class CommentSerializer(serializers.ModelSerializer):
    """Серіалізатор для коментарів"""
    author = UserShortSerializer(read_only=True)
    replies = ReplySerializer(many=True, read_only=True)
    replies_count = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = ['id', 'author', 'text', 'created_at', 'replies', 'replies_count']
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
        fields = ['text', 'parent_id']

    def validate_parent_id(self, value):
        """Перевіряємо що батьківський коментар не є відповіддю (глибина 1)"""
        if value and value.parent is not None:
            raise serializers.ValidationError(
                "Можна відповідати тільки на коментарі верхнього рівня"
            )
        return value


class ContentListSerializer(serializers.ModelSerializer):
    """Серіалізатор для списку контенту (коротка версія)"""
    author = UserShortSerializer(read_only=True)
    scientific_fields = ScientificFieldSerializer(many=True, read_only=True)
    comments_count = serializers.SerializerMethodField()
    likes_count = serializers.SerializerMethodField()

    class Meta:
        model = Content
        fields = [
            'id', 'content_type', 'title', 'slug', 'link', 'author', 'scientific_fields',
            'status', 'is_open_for_collaboration',
            'views_count', 'likes_count', 'comments_count',
            'created_at'
        ]

    def get_comments_count(self, obj) -> int:
        return obj.comments.filter(parent__isnull=True).count()

    def get_likes_count(self, obj) -> int:
        return obj.likes.count()


class ContentDetailSerializer(serializers.ModelSerializer):
    """Серіалізатор для детального перегляду контенту"""
    author = UserShortSerializer(read_only=True)
    scientific_fields = ScientificFieldSerializer(many=True, read_only=True)
    comments = serializers.SerializerMethodField()
    comments_count = serializers.SerializerMethodField()
    likes_count = serializers.SerializerMethodField()
    liked = serializers.SerializerMethodField()

    class Meta:
        model = Content
        fields = [
            'id', 'content_type', 'title', 'slug', 'description', 'link', 'author',
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
        """Перевіряємо чи поточний користувач лайкнув контент"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.likes.filter(user=request.user).exists()
        return False


class ContentCreateSerializer(serializers.ModelSerializer):
    """Серіалізатор для створення/оновлення контенту"""
    scientific_field_ids = serializers.PrimaryKeyRelatedField(
        queryset=ScientificField.objects.all(),
        many=True,
        write_only=True,
        required=False
    )

    class Meta:
        model = Content
        fields = [
            'id', 'slug', 'content_type', 'title', 'description', 'link',
            'scientific_field_ids', 'keywords', 'status',
            'is_public', 'is_open_for_collaboration'
        ]
        read_only_fields = ['id', 'slug']

    def validate(self, data):
        """Валідація: для ресурсів/вебінарів/лекцій посилання обов'язкове"""
        content_type = data.get('content_type', 'idea')
        link = data.get('link', '')

        if content_type in ['resource', 'webinar', 'lecture'] and not link:
            raise serializers.ValidationError({
                'link': 'Посилання обов\'язкове для цього типу контенту'
            })
        return data

    def create(self, validated_data):
        """Автоматично додаємо автора при створенні"""
        scientific_fields = validated_data.pop('scientific_field_ids', [])
        validated_data['author'] = self.context['request'].user
        content = super().create(validated_data)
        if scientific_fields:
            content.scientific_fields.set(scientific_fields)
        return content

    def update(self, instance, validated_data):
        scientific_fields = validated_data.pop('scientific_field_ids', None)
        instance = super().update(instance, validated_data)
        if scientific_fields is not None:
            instance.scientific_fields.set(scientific_fields)
        return instance
