import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SimpleHomePage } from './pages/SimpleHomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { CreateSpacePage } from './pages/CreateSpacePage';
import { ExplorePage } from './pages/ExplorePage';
import { SpaceViewPage } from './pages/SpaceViewPage';
import { TestPage } from './pages/TestPage';
import { SimpleTestPage } from './pages/SimpleTestPage';
import { BasicTestPage } from './pages/BasicTestPage';
import { DebugPage } from './pages/DebugPage';
import { React19TestPage } from './pages/React19TestPage';
import { useAuthStore } from './stores/authStore';

// Protected Route Component
interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<SimpleHomePage />} />
          <Route path="/basic-test" element={<BasicTestPage />} />
          <Route path="/simple-test" element={<SimpleTestPage />} />
          <Route path="/debug" element={<DebugPage />} />
          <Route path="/react19-test" element={<React19TestPage />} />
          <Route path="/test" element={<TestPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/spaces/create"
            element={
              <ProtectedRoute>
                <CreateSpacePage />
              </ProtectedRoute>
            }
          />
          <Route path="/spaces/:spaceId/view" element={<SpaceViewPage />} />
          <Route
            path="/spaces/:spaceId"
            element={
              <ProtectedRoute>
                <SpaceViewPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
