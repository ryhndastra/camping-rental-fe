/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import OrderList from './components/OrderList';
import TermsConditions from './components/TermsConditions';

import './index.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('adminToken'));

  // Listen for authentication changes
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('adminToken');
      setIsAuthenticated(!!token);
    };

    // Check immediately
    checkAuth();

    // Listen for storage changes (in case token is set/removed in another tab)
    window.addEventListener('storage', checkAuth);

    // Custom event for when login happens in the same tab
    window.addEventListener('authChange', checkAuth);

    return () => {
      window.removeEventListener('storage', checkAuth);
      window.removeEventListener('authChange', checkAuth);
    };
  }, []);

  return (
    <div className="App">
      <Router>
        <Routes>
          {/* Default route: kalau sudah login masuk ke dashboard */}
          <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />} />

          {/* Dashboard hanya bisa diakses kalau login */}
          <Route
            path="/dashboard"
            element={isAuthenticated ? <Dashboard /> : <Navigate to="/" />}
          />

          {/* Order List */}
          <Route
            path="/orders"
            element={isAuthenticated ? <OrderList /> : <Navigate to="/" />}
          />

          {/* Terms & Conditions bisa diakses tanpa login */}
          <Route path="/terms" element={<TermsConditions />} />

          {/* Catch all: kalau path tidak dikenali */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
