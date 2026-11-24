import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { ProblemList } from './pages/ProblemList';
import { ProblemWorkspace } from './pages/ProblemWorkspace';
import { Profile } from './pages/Profile';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { AdminRoute } from './components/AdminRoute';
import { AdminProblemList } from './pages/admin/AdminProblemList';
import { AdminProblemEditor } from './pages/admin/AdminProblemEditor';
import { AdminTestCaseManager } from './pages/admin/AdminTestCaseManager';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-chai-bg text-chai-text">
        <Navbar />
        <main className="flex-1 flex flex-col">
          <Routes>
            <Route path="/" element={<Navigate to="/problems" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/problems" element={<ProblemList />} />
            <Route path="/problems/:slug" element={<ProblemWorkspace />} />
            <Route path="/profile" element={<Profile />} />

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminRoute />}>
              <Route index element={<Navigate to="/admin/problems" replace />} />
              <Route path="problems" element={<AdminProblemList />} />
              <Route path="problems/new" element={<AdminProblemEditor />} />
              <Route path="problems/:id/edit" element={<AdminProblemEditor />} />
              <Route path="problems/:id/test-cases" element={<AdminTestCaseManager />} />
            </Route>
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
