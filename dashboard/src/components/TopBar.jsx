import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import Menu from "./Menu";

const TopBar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="topbar-container">
      <div className="topbar-right">
        <Menu />
        <div className="user">
          <span className="avatar">{getInitials(user?.name)}</span>
          <span className="userid">{user?.name || 'User'}</span>
          <button 
            onClick={handleLogout}
            style={{
              marginLeft: '10px',
              padding: '5px 10px',
              background: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default TopBar;