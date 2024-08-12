import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Login from './pages/login';
import Dashboard from './admin/dashboard';
import Users from './pages/Users';
import Inventory from './pages/Inventory';
import Orders from './pages/Orders';
import Patients from './pages/Patients';
import Pharmacists from './pages/Pharmacists';
import Financial from './pages/Financial';
import Compliance from './pages/Compliance';
import PharmacistDashboard from './pages/PharmacyDash';
import { AuthProvider, AuthContext } from './contexts/AuthContext';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/users"
            element={
              <PrivateRoute>
                <Layout>
                  <Users />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/inventory"
            element={
              <PrivateRoute>
                <Layout>
                  <Inventory />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <PrivateRoute>
                <Layout>
                  <Orders />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/patients"
            element={
              <PrivateRoute>
                <Layout>
                  <Patients />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/pharmacists"
            element={
              <PrivateRoute>
                <Layout>
                  <Pharmacists />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/financial"
            element={
              <PrivateRoute>
                <Layout>
                  <Financial />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/compliance"
            element={
              <PrivateRoute>
                <Layout>
                  <Compliance />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/pharmacist-dashboard"
            element={
              <PrivateRoute>
                <Layout>
                  <PharmacistDashboard />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

function Layout({ children }) {
  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <div style={{ flexGrow: 1, padding: '2rem', backgroundColor: '#f0f2f5' }}>
        {children}
      </div>
    </div>
  );
}

function PrivateRoute({ children }) {
  const { user } = React.useContext(AuthContext);

  if (!user) {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      return children; // If user exists in localStorage, allow access
    }
    return <Navigate to="/login" />; // Otherwise, redirect to login
  }

  return children;
}


export default App;
