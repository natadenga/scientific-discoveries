# Наукові Знахідки

Веб-платформа для обміну науковим контентом між студентами та викладачами.

## Технології

**Backend:**
- Python 3.11+
- Django 5.x
- Django REST Framework
- PostgreSQL (production) / SQLite (development)
- JWT автентифікація (Simple JWT)

**Frontend:**
- React 19
- Vite
- React Router
- Zustand (state management)
- React Bootstrap
- Axios

## Функціонал

- Реєстрація та автентифікація користувачів (студент, викладач, дослідник)
- Публікація контенту різних типів:
  - **Ідеї** - наукові ідеї та пропозиції
  - **Ресурси** - корисні матеріали та посилання
  - **Вебінари** - онлайн-заходи та записи
  - **Лекції** - гостьові лекції
- Коментування контенту (з підтримкою вкладених відповідей)
- Лайки та перегляди
- Підписка на інших користувачів
- Пошук та фільтрація за галузями науки
- Профілі користувачів з науковими інтересами, публікаціями, ORCID, Google Scholar, Scopus, Web of Science

## Швидкий старт

### Backend (Django)

```bash
cd backend

# Створіть віртуальне середовище
python -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate   # Windows

# Встановіть залежності
pip install -r requirements.txt

# Створіть базу даних
python manage.py migrate

# Створіть адміністратора
python manage.py createsuperuser

# Запустіть сервер
python manage.py runserver
```

Backend готовий:
- API: http://localhost:8000/api/
- Admin: http://localhost:8000/admin/

### Frontend (React + Vite)

```bash
cd frontend

# Встановіть залежності
npm install

# Запустіть dev-сервер
npm run dev
```

Frontend готовий: http://localhost:5173/

## API Endpoints

### Автентифікація
- `POST /api/auth/register/` - реєстрація
- `POST /api/auth/login/` - вхід (отримання JWT токенів)
- `POST /api/auth/refresh/` - оновлення access токена
- `GET /api/auth/me/` - поточний користувач

### Контент
- `GET /api/contents/` - список контенту (з фільтрацією та пошуком)
- `GET /api/contents/?content_type=idea` - фільтр за типом (idea, resource, webinar, lecture)
- `POST /api/contents/` - створити контент
- `GET /api/contents/{slug}/` - деталі контенту
- `PATCH /api/contents/{slug}/` - оновити контент
- `DELETE /api/contents/{slug}/` - видалити контент
- `POST /api/contents/{slug}/like/` - лайкнути
- `POST /api/contents/{slug}/comment/` - додати коментар
- `GET /api/contents/my/` - мій контент

### Користувачі
- `GET /api/users/` - список користувачів
- `GET /api/users/{id}/` - профіль користувача
- `PATCH /api/users/me/` - оновити свій профіль
- `POST /api/users/{id}/follow/` - підписатися/відписатися
- `GET /api/users/{id}/followers/` - підписники
- `GET /api/users/{id}/following/` - підписки
- `GET /api/users/{id}/contents/` - контент користувача

### Галузі науки
- `GET /api/fields/` - список галузей

### Заклади освіти
- `GET /api/institutions/` - список закладів (з пошуком)
- `POST /api/institutions/` - додати заклад

## Деплой

### Railway (Backend)
1. Створіть новий проєкт на Railway
2. Додайте PostgreSQL
3. Підключіть GitHub репозиторій
4. Встановіть змінні середовища:
   - `SECRET_KEY` - секретний ключ Django
   - `DEBUG=False`
   - `ALLOWED_HOSTS` - домен Railway
   - `CORS_ALLOWED_ORIGINS` - домен фронтенду

### Vercel (Frontend)
1. Імпортуйте проєкт на Vercel
2. Root Directory: `frontend`
3. Встановіть змінну `VITE_API_URL` з URL бекенду

## Структура проєкту

```
naukovi-znakhidky-clean/
├── backend/
│   ├── scientific_discoveries/  # Налаштування Django
│   ├── users/                   # Модуль користувачів
│   ├── contents/                # Модуль контенту
│   ├── manage.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── api/         # API клієнт
│   │   ├── components/  # React компоненти
│   │   ├── pages/       # Сторінки
│   │   ├── store/       # Zustand store
│   │   └── hooks/       # Custom hooks
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## Ліцензія

MIT
