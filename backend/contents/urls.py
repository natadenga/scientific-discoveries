from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ContentViewSet, ScientificFieldViewSet, CommentViewSet

router = DefaultRouter()
router.register('fields', ScientificFieldViewSet, basename='field')
router.register('comments', CommentViewSet, basename='comment')
router.register('', ContentViewSet, basename='content')

# Router автоматично створює:
#
# Галузі науки:
# GET    /api/contents/fields/           → список галузей
# GET    /api/contents/fields/{slug}/    → деталі галузі
#
# Контент:
# GET    /api/contents/                  → список (з фільтрами)
# POST   /api/contents/                  → створити
# GET    /api/contents/{slug}/           → деталі
# PATCH  /api/contents/{slug}/           → оновити
# DELETE /api/contents/{slug}/           → видалити
# POST   /api/contents/{slug}/like/      → лайкнути
# GET    /api/contents/{slug}/comments/  → список коментарів
# POST   /api/contents/{slug}/comments/  → додати коментар
# GET    /api/contents/my/               → мій контент
#
# Коментарі:
# DELETE /api/contents/comments/{id}/    → видалити коментар

urlpatterns = [
    path('', include(router.urls)),
]
