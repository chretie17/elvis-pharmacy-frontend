import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Dashboard from './admin/Dashboard';
import Users from './pages/Users';
import Inventory from './pages/Inventory';
import AllOrders from './pages/Orders';
import AllPatients from './pages/Patients';
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
                  <AllOrders />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/patients"
            element={
              <PrivateRoute>
                <Layout>
                  <AllPatients />
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
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar />
      <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Navbar /> {/* Navbar is fixed at the top */}
        <div style={{ flexGrow: 1, padding: '20px', marginTop: '64px', overflowY: 'auto', backgroundColor: '#fffff' }}>
          {children}
        </div>
      </div>
    </div>
  );
}

function PrivateRoute({ children }) {
  const { user, setUser } = React.useContext(AuthContext);
  const storedUser = localStorage.getItem('user');

  React.useEffect(() => {
    if (!user && storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, [user, setUser, storedUser]);

  if (!user && !storedUser) {
    return <Navigate to="/login" />;
  }

  return children;
}

export default App;
