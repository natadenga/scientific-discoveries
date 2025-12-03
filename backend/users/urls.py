from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, RegisterView

router = DefaultRouter()
router.register('', UserViewSet, basename='user')

# Router автоматично створює:
# GET    /api/users/           → list
# POST   /api/users/           → create (не використовуємо, є RegisterView)
# GET    /api/users/{id}/      → retrieve
# PATCH  /api/users/{id}/      → partial_update
# DELETE /api/users/{id}/      → destroy
# GET    /api/users/me/        → @action me
# POST   /api/users/{id}/follow/    → @action follow
# GET    /api/users/{id}/ideas/     → @action ideas
# GET    /api/users/{id}/followers/ → @action followers
# GET    /api/users/{id}/following/ → @action following

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('', include(router.urls)),
]
