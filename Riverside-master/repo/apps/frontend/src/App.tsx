import { Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import CreateSession from './pages/CreateSession';
import JoinSession from './pages/JoinSession';
import RecentSession from './pages/RecentSession';
import AllSessions from './pages/AllSessions';
import NSender from './pages/Nsender';
import NReceiver from './pages/Nreceiver';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/createSession" element={<ProtectedRoute><CreateSession /></ProtectedRoute>} />
      <Route path="/joinSession" element={<ProtectedRoute><JoinSession /></ProtectedRoute>} />
      <Route path="/recentSession" element={<ProtectedRoute><RecentSession /></ProtectedRoute>} />
      <Route path="/allSessions" element={<ProtectedRoute><AllSessions /></ProtectedRoute>} />
      <Route path="/nsender" element={<ProtectedRoute><NSender /></ProtectedRoute>} />
      <Route path="/nreceiver" element={<ProtectedRoute><NReceiver /></ProtectedRoute>} />
    </Routes>
  );
}

export default App;
