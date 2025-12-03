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
import IdeasListPage from './pages/ideas/IdeasListPage';
import IdeaDetailPage from './pages/ideas/IdeaDetailPage';
import IdeaCreatePage from './pages/ideas/IdeaCreatePage';
import IdeaEditPage from './pages/ideas/IdeaEditPage';
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
        <Route path="/ideas" element={<IdeasListPage />} />
        <Route path="/ideas/:slug" element={<IdeaDetailPage />} />
        <Route
          path="/ideas/:slug/edit"
          element={
            <ProtectedRoute>
              <IdeaEditPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ideas/create"
          element={
            <ProtectedRoute>
              <IdeaCreatePage />
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
