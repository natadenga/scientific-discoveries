from rest_framework import viewsets, generics, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import get_user_model

from .serializers import (
    UserSerializer,
    UserCreateSerializer,
    UserUpdateSerializer,
    UserShortSerializer
)

User = get_user_model()


class UserViewSet(viewsets.ModelViewSet):
    """
    ViewSet для роботи з користувачами

    GET /api/users/ - список всіх користувачів
    GET /api/users/{id}/ - деталі користувача
    GET /api/users/me/ - профіль поточного користувача
    PATCH /api/users/{id}/ - оновити профіль
    POST /api/users/{id}/follow/ - підписатися/відписатися
    """
    queryset = User.objects.filter(is_staff=False)  # Приховуємо адмінів
    serializer_class = UserSerializer

    def get_permissions(self):
        """Різні права доступу для різних дій"""
        if self.action in ['list', 'retrieve']:
            # Перегляд доступний всім
            return [permissions.AllowAny()]
        else:
            # Інші дії тільки для авторизованих
            return [permissions.IsAuthenticated()]

    def get_serializer_class(self):
        """Різні серіалізатори для різних дій"""
        if self.action == 'partial_update':
            return UserUpdateSerializer
        return UserSerializer

    @action(detail=False, methods=['get', 'patch'])
    def me(self, request):
        """
        GET /api/users/me/ - отримати свій профіль
        PATCH /api/users/me/ - оновити свій профіль
        """
        user = request.user

        if request.method == 'GET':
            serializer = UserSerializer(user)
            return Response(serializer.data)

        elif request.method == 'PATCH':
            serializer = UserUpdateSerializer(user, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(UserSerializer(user).data)

    @action(detail=True, methods=['post'])
    def follow(self, request, pk=None):
        """
        POST /api/users/{id}/follow/ - підписатися або відписатися
        """
        user_to_follow = self.get_object()
        current_user = request.user

        if user_to_follow == current_user:
            return Response(
                {'error': 'Не можна підписатися на себе'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if current_user.following.filter(pk=user_to_follow.pk).exists():
            # Вже підписаний - відписуємось
            current_user.following.remove(user_to_follow)
            return Response({'status': 'unfollowed'})
        else:
            # Підписуємось
            current_user.following.add(user_to_follow)
            return Response({'status': 'followed'})

    @action(detail=True, methods=['get'])
    def ideas(self, request, pk=None):
        """GET /api/users/{id}/ideas/ - ідеї користувача"""
        from ideas.models import Idea
        from ideas.serializers import IdeaListSerializer

        user = self.get_object()
        ideas = Idea.objects.filter(author=user, is_public=True)
        serializer = IdeaListSerializer(ideas, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def followers(self, request, pk=None):
        """GET /api/users/{id}/followers/ - список підписників"""
        user = self.get_object()
        followers = user.followers.all()
        serializer = UserShortSerializer(followers, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def following(self, request, pk=None):
        """GET /api/users/{id}/following/ - список підписок"""
        user = self.get_object()
        following = user.following.all()
        serializer = UserShortSerializer(following, many=True)
        return Response(serializer.data)


class RegisterView(generics.CreateAPIView):
    """
    POST /api/register/ - реєстрація нового користувача
    """
    queryset = User.objects.all()
    serializer_class = UserCreateSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        return Response({
            'message': 'Користувача успішно створено',
            'user': UserSerializer(user).data
        }, status=status.HTTP_201_CREATED)
