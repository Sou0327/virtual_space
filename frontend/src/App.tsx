import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { CreateSpacePage } from './pages/CreateSpacePage';
import { ExplorePage } from './pages/ExplorePage';
import { SpaceViewPage } from './pages/SpaceViewPage';
import RoomBuilder from './components/three/RoomBuilder';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* メインページ */}
          <Route path="/" element={<Layout><HomePage /></Layout>} />
          <Route path="/login" element={<Layout><LoginPage /></Layout>} />
          <Route path="/register" element={<Layout><RegisterPage /></Layout>} />
          <Route path="/dashboard" element={<Layout><DashboardPage /></Layout>} />
          <Route path="/create" element={<Layout><CreateSpacePage /></Layout>} />
          <Route path="/explore" element={<Layout><ExplorePage /></Layout>} />
          <Route path="/space/:id" element={<Layout><SpaceViewPage /></Layout>} />

          {/* ルームビルダー（フルスクリーン） */}
          <Route path="/room-builder" element={<RoomBuilder />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
