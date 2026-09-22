import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProblemList } from './pages/ProblemList';
import { ProblemWorkspace } from './pages/ProblemWorkspace';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/problems" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/problems" element={<ProblemList />} />
        <Route path="/problems/:slug" element={<ProblemWorkspace />} />
      </Routes>
    </BrowserRouter>
  );
}