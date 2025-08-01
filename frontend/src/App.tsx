import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ServerList from './pages/ServerList';
import CreateServer from './pages/CreateServer';
import ServerDetail from './pages/ServerDetail';
import UserSettings from './pages/UserSettings';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/servers"
          element={
            <ProtectedRoute>
              <Layout>
                <ServerList />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/servers/create"
          element={
            <ProtectedRoute>
              <Layout>
                <CreateServer />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/servers/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <ServerDetail />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Layout>
                <UserSettings />
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
  );
}

export default App; 