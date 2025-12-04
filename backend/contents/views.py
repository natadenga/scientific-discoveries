from rest_framework import viewsets, status, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q

from .models import Content, ScientificField, Comment, Like
from .serializers import (
    ContentListSerializer,
    ContentDetailSerializer,
    ContentCreateSerializer,
    ScientificFieldSerializer,
    CommentSerializer,
    CommentCreateSerializer
)


class IsAuthorOrReadOnly(permissions.BasePermission):
    """Дозволяє редагувати тільки автору"""

    def has_object_permission(self, request, view, obj):
        # GET, HEAD, OPTIONS - дозволено всім
        if request.method in permissions.SAFE_METHODS:
            return True
        # Інше - тільки автору
        return obj.author == request.user


class ScientificFieldViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet для галузей науки (тільки читання)

    GET /api/contents/fields/ - список галузей
    GET /api/contents/fields/{slug}/ - деталі галузі
    """
    queryset = ScientificField.objects.all()
    serializer_class = ScientificFieldSerializer
    lookup_field = 'slug'  # Використовуємо slug замість id


class ContentViewSet(viewsets.ModelViewSet):
    """
    ViewSet для контенту (ідеї, ресурси, вебінари, лекції)

    GET /api/contents/ - список (з фільтрацією по content_type: idea/resource/webinar/lecture)
    POST /api/contents/ - створити
    GET /api/contents/{slug}/ - деталі
    PATCH /api/contents/{slug}/ - оновити
    DELETE /api/contents/{slug}/ - видалити
    POST /api/contents/{slug}/like/ - лайкнути/анлайкнути
    POST /api/contents/{slug}/comments/ - додати коментар
    """
    queryset = Content.objects.filter(is_public=True)
    lookup_field = 'slug'

    # Фільтрація та пошук
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'author', 'is_open_for_collaboration', 'content_type']
    search_fields = ['title', 'description', 'keywords']
    ordering_fields = ['created_at', 'views_count']
    ordering = ['-created_at']  # За замовчуванням - нові спочатку

    def get_permissions(self):
        """Різні права для різних дій"""
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        elif self.action in ['create', 'like', 'comments']:
            # Створення контенту, лайки та коментарі - тільки авторизовані
            return [permissions.IsAuthenticated()]
        else:
            # Редагування/видалення - тільки автор
            return [permissions.IsAuthenticated(), IsAuthorOrReadOnly()]

    def get_serializer_class(self):
        """Різні серіалізатори для різних дій"""
        if self.action == 'list':
            return ContentListSerializer
        elif self.action == 'retrieve':
            return ContentDetailSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return ContentCreateSerializer
        elif self.action == 'add_comment':
            return CommentCreateSerializer
        return ContentListSerializer

    def get_queryset(self):
        """Фільтруємо контент"""
        queryset = Content.objects.filter(is_public=True)

        # Якщо користувач авторизований - показуємо і його приватний контент
        if self.request.user.is_authenticated:
            queryset = Content.objects.filter(
                Q(is_public=True) | Q(author=self.request.user)
            )

        # Фільтр по галузі науки
        field_slug = self.request.query_params.get('scientific_field__slug')
        if field_slug:
            queryset = queryset.filter(scientific_fields__slug=field_slug)

        return queryset.select_related('author').prefetch_related('scientific_fields').distinct()

    def retrieve(self, request, *args, **kwargs):
        """При перегляді - збільшуємо лічильник переглядів"""
        instance = self.get_object()
        instance.views_count += 1
        instance.save(update_fields=['views_count'])
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def like(self, request, slug=None):
        """
        POST /api/contents/{slug}/like/ - лайкнути/анлайкнути контент (toggle)
        """
        content = self.get_object()
        like, created = Like.objects.get_or_create(content=content, user=request.user)

        if not created:
            # Лайк вже існує - видаляємо (анлайк)
            like.delete()
            return Response({
                'status': 'unliked',
                'likes_count': content.likes.count()
            })

        return Response({
            'status': 'liked',
            'likes_count': content.likes.count()
        })

    @action(detail=True, methods=['get', 'post'], url_path='comments')
    def comments(self, request, slug=None):
        """
        GET /api/contents/{slug}/comments/ - список коментарів
        POST /api/contents/{slug}/comments/ - додати коментар
        """
        content = self.get_object()

        if request.method == 'GET':
            # Повертаємо тільки коментарі верхнього рівня
            comments = content.comments.filter(parent__isnull=True)
            serializer = CommentSerializer(comments, many=True)
            return Response(serializer.data)

        elif request.method == 'POST':
            serializer = CommentCreateSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            serializer.save(content=content, author=request.user)

            # Повертаємо повний коментар
            comment = Comment.objects.get(pk=serializer.instance.pk)
            return Response(
                CommentSerializer(comment).data,
                status=status.HTTP_201_CREATED
            )

    @action(detail=False, methods=['get'])
    def my(self, request):
        """
        GET /api/contents/my/ - мій контент (з опціональною фільтрацією по content_type)
        """
        contents = Content.objects.filter(author=request.user)

        # Опціональна фільтрація по типу контенту
        content_type = request.query_params.get('content_type')
        if content_type:
            contents = contents.filter(content_type=content_type)

        serializer = ContentListSerializer(contents, many=True)
        return Response(serializer.data)


class CommentViewSet(viewsets.ModelViewSet):
    """
    ViewSet для коментарів (видалення)

    DELETE /api/contents/comments/{id}/ - видалити коментар
    """
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated, IsAuthorOrReadOnly]
    http_method_names = ['delete']  # Тільки видалення
