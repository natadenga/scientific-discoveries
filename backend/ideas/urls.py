from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import IdeaViewSet, ScientificFieldViewSet, CommentViewSet

router = DefaultRouter()
router.register('fields', ScientificFieldViewSet, basename='field')
router.register('comments', CommentViewSet, basename='comment')
router.register('', IdeaViewSet, basename='idea')

# Router автоматично створює:
#
# Галузі науки:
# GET    /api/ideas/fields/           → список галузей
# GET    /api/ideas/fields/{slug}/    → деталі галузі
#
# Ідеї:
# GET    /api/ideas/                  → список ідей (з фільтрами)
# POST   /api/ideas/                  → створити ідею
# GET    /api/ideas/{slug}/           → деталі ідеї
# PATCH  /api/ideas/{slug}/           → оновити ідею
# DELETE /api/ideas/{slug}/           → видалити ідею
# POST   /api/ideas/{slug}/like/      → лайкнути
# GET    /api/ideas/{slug}/comments/  → список коментарів
# POST   /api/ideas/{slug}/comments/  → додати коментар
# GET    /api/ideas/my/               → мої ідеї
#
# Коментарі:
# DELETE /api/ideas/comments/{id}/    → видалити коментар

urlpatterns = [
    path('', include(router.urls)),
]
