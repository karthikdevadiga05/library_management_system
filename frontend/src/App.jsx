import React, { useState, useEffect } from 'react';
import { authService } from './services/authService';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import UserDashboard from './components/User/UserDashboard';
import LibraryDashboard from './components/Library/LibraryDashboard';
import Footer from './components/Common/Footer';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [showRegister, setShowRegister] = useState(false);

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
  }, []);

  const handleLogin = (user) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
  };

  const handleRegisterSuccess = () => {
    setShowRegister(false);
    alert('Registration successful! Please login.');
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen flex flex-col">
        {showRegister ? (
          <Register 
            onSuccess={handleRegisterSuccess}
            onBackToLogin={() => setShowRegister(false)}
          />
        ) : (
          <Login 
            onLogin={handleLogin}
            onShowRegister={() => setShowRegister(true)}
          />
        )}
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {currentUser.user_type === 'user' && (
        <UserDashboard user={currentUser} onLogout={handleLogout} />
      )}
      {currentUser.user_type === 'library' && (
        <LibraryDashboard user={currentUser} onLogout={handleLogout} />
      )}
      <Footer />
    </div>
  );
}

export default App;