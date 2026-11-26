import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './guards/ProtectedRoute';

import Login from './pages/Login';

import AdminLayout from './layouts/AdminLayout';
import DocenteLayout from './layouts/DocenteLayout';
import EstudianteLayout from './layouts/EstudianteLayout';

import './App.css';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>

          <Route
            path="/"
            element={<Navigate to="/login" replace />}
          />

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={['ADMIN']}>
                <AdminLayout />
              </ProtectedRoute>
            }
          />

          <Route
            path="/docente"
            element={
              <ProtectedRoute roles={['DOCENTE']}>
                <DocenteLayout />
              </ProtectedRoute>
            }
          />

          <Route
            path="/estudiante"
            element={
              <ProtectedRoute roles={['ESTUDIANTE']}>
                <EstudianteLayout />
              </ProtectedRoute>
            }
          />

          <Route
            path="*"
            element={<Navigate to="/login" replace />}
          />

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;