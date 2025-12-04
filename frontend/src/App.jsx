import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

import useAuthStore from './store/authStore';
import Navbar from './components/common/Navbar';
import ProtectedRoute from './components/common/ProtectedRoute';
import Loading from './components/common/Loading';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ContentsListPage from './pages/contents/ContentsListPage';
import ContentDetailPage from './pages/contents/ContentDetailPage';
import ContentCreatePage from './pages/contents/ContentCreatePage';
import ContentEditPage from './pages/contents/ContentEditPage';
import UsersListPage from './pages/users/UsersListPage';
import UserDetailPage from './pages/users/UserDetailPage';
import ProfilePage from './pages/profile/ProfilePage';

function App() {
  const { initialize, isLoading } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (isLoading) {
    return <Loading text="Завантаження..." />;
  }

  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/contents" element={<ContentsListPage />} />
        <Route path="/contents/:slug" element={<ContentDetailPage />} />
        <Route
          path="/contents/:slug/edit"
          element={
            <ProtectedRoute>
              <ContentEditPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/contents/create"
          element={
            <ProtectedRoute>
              <ContentCreatePage />
            </ProtectedRoute>
          }
        />
        <Route path="/users" element={<UsersListPage />} />
        <Route path="/users/:id" element={<UserDetailPage />} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
