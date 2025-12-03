from rest_framework import viewsets, status, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q

from .models import Idea, ScientificField, Comment
from .serializers import (
    IdeaListSerializer,
    IdeaDetailSerializer,
    IdeaCreateSerializer,
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

    GET /api/fields/ - список галузей
    GET /api/fields/{slug}/ - деталі галузі
    """
    queryset = ScientificField.objects.all()
    serializer_class = ScientificFieldSerializer
    lookup_field = 'slug'  # Використовуємо slug замість id


class IdeaViewSet(viewsets.ModelViewSet):
    """
    ViewSet для ідей

    GET /api/ideas/ - список ідей (з фільтрацією)
    POST /api/ideas/ - створити ідею
    GET /api/ideas/{slug}/ - деталі ідеї
    PATCH /api/ideas/{slug}/ - оновити ідею
    DELETE /api/ideas/{slug}/ - видалити ідею
    POST /api/ideas/{slug}/like/ - лайкнути
    POST /api/ideas/{slug}/comments/ - додати коментар
    """
    queryset = Idea.objects.filter(is_public=True)
    lookup_field = 'slug'

    # Фільтрація та пошук
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'scientific_field__slug', 'author', 'is_open_for_collaboration']
    search_fields = ['title', 'description', 'keywords']
    ordering_fields = ['created_at', 'views_count', 'likes_count']
    ordering = ['-created_at']  # За замовчуванням - нові спочатку

    def get_permissions(self):
        """Різні права для різних дій"""
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        elif self.action in ['create', 'like', 'comments']:
            # Створення ідеї, лайки та коментарі - тільки авторизовані
            return [permissions.IsAuthenticated()]
        else:
            # Редагування/видалення - тільки автор
            return [permissions.IsAuthenticated(), IsAuthorOrReadOnly()]

    def get_serializer_class(self):
        """Різні серіалізатори для різних дій"""
        if self.action == 'list':
            return IdeaListSerializer
        elif self.action == 'retrieve':
            return IdeaDetailSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return IdeaCreateSerializer
        elif self.action == 'add_comment':
            return CommentCreateSerializer
        return IdeaListSerializer

    def get_queryset(self):
        """Фільтруємо ідеї"""
        queryset = Idea.objects.filter(is_public=True)

        # Якщо користувач авторизований - показуємо і його приватні ідеї
        if self.request.user.is_authenticated:
            queryset = Idea.objects.filter(
                Q(is_public=True) | Q(author=self.request.user)
            )

        return queryset.select_related('author', 'scientific_field')

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
        POST /api/ideas/{slug}/like/ - лайкнути ідею
        """
        idea = self.get_object()
        idea.likes_count += 1
        idea.save(update_fields=['likes_count'])
        return Response({
            'status': 'liked',
            'likes_count': idea.likes_count
        })

    @action(detail=True, methods=['get', 'post'], url_path='comments')
    def comments(self, request, slug=None):
        """
        GET /api/ideas/{slug}/comments/ - список коментарів
        POST /api/ideas/{slug}/comments/ - додати коментар
        """
        idea = self.get_object()

        if request.method == 'GET':
            comments = idea.comments.all()
            serializer = CommentSerializer(comments, many=True)
            return Response(serializer.data)

        elif request.method == 'POST':
            serializer = CommentCreateSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            serializer.save(idea=idea, author=request.user)

            # Повертаємо повний коментар
            comment = Comment.objects.get(pk=serializer.instance.pk)
            return Response(
                CommentSerializer(comment).data,
                status=status.HTTP_201_CREATED
            )

    @action(detail=False, methods=['get'])
    def my(self, request):
        """
        GET /api/ideas/my/ - мої ідеї
        """
        ideas = Idea.objects.filter(author=request.user)
        serializer = IdeaListSerializer(ideas, many=True)
        return Response(serializer.data)


class CommentViewSet(viewsets.ModelViewSet):
    """
    ViewSet для коментарів (видалення)

    DELETE /api/comments/{id}/ - видалити коментар
    """
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated, IsAuthorOrReadOnly]
    http_method_names = ['delete']  # Тільки видалення
