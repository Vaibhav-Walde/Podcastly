import { Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import CreateSession from './pages/CreateSession';
import JoinSession from './pages/JoinSession';
import RecentSession from './pages/RecentSession';
import NSender from './pages/Nsender';
import NReceiver from './pages/Nreceiver';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/createSession" element={<CreateSession />} />
      <Route path="/joinSession" element={<JoinSession />} />
      <Route path="/recentSession" element={<RecentSession />} />
      <Route path="/nsender" element={<NSender />} />
      <Route path="/nreceiver" element={<NReceiver />} />
    </Routes>
  );
}

export default App;
