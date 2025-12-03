# Наукові Знахідки

Веб-платформа для обміну науковими ідеями між студентами та викладачами.

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
- Публікація наукових ідей з категоріями та ключовими словами
- Коментування ідей
- Лайки та перегляди
- Підписка на інших користувачів
- Пошук та фільтрація ідей
- Профілі користувачів з науковими інтересами, публікаціями, ORCID

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

# Завантажте початкові дані (галузі науки)
python manage.py loaddata scientific_fields.json

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

### Ідеї
- `GET /api/ideas/` - список ідей (з фільтрацією та пошуком)
- `POST /api/ideas/` - створити ідею
- `GET /api/ideas/{slug}/` - деталі ідеї
- `PATCH /api/ideas/{slug}/` - оновити ідею
- `DELETE /api/ideas/{slug}/` - видалити ідею
- `POST /api/ideas/{slug}/like/` - лайкнути
- `GET /api/ideas/{slug}/comments/` - коментарі
- `POST /api/ideas/{slug}/comments/` - додати коментар
- `GET /api/ideas/my/` - мої ідеї

### Користувачі
- `GET /api/users/` - список користувачів
- `GET /api/users/{id}/` - профіль користувача
- `PATCH /api/users/me/` - оновити свій профіль
- `POST /api/users/{id}/follow/` - підписатися/відписатися
- `GET /api/users/{id}/followers/` - підписники
- `GET /api/users/{id}/following/` - підписки
- `GET /api/users/{id}/ideas/` - ідеї користувача

### Галузі науки
- `GET /api/fields/` - список галузей

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
│   ├── config/          # Налаштування Django
│   ├── users/           # Модуль користувачів
│   ├── ideas/           # Модуль ідей
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
