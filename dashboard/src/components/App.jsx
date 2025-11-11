import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const Apps = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [language, setLanguage] = useState(localStorage.getItem('language') || 'en');
  const [currency, setCurrency] = useState(localStorage.getItem('currency') || 'INR');
  const [chartType, setChartType] = useState(localStorage.getItem('chartType') || 'line');
  const [twoFA, setTwoFA] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSaveProfile = () => {
    // In a real app, this would update the backend
    alert("Profile updated successfully!");
    setShowEditProfile(false);
  };

  const handleChangePassword = () => {
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    if (newPassword.length < 6) {
      alert("Password must be at least 6 characters!");
      return;
    }
    // In a real app, this would update the backend
    alert("Password changed successfully!");
    setShowChangePassword(false);
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    // Apply theme to document
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const handleCurrencyChange = (curr) => {
    setCurrency(curr);
    localStorage.setItem('currency', curr);
  };

  const handleChartTypeChange = (type) => {
    setChartType(type);
    localStorage.setItem('chartType', type);
  };

  return (
    <>
      <h3 className="title">Settings & Preferences</h3>

      {/* User Profile Section */}
      <div className="section" style={{ marginBottom: '30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h4>User Profile</h4>
          <button
            className="btn btn-blue"
            onClick={() => setShowEditProfile(true)}
            style={{ padding: '8px 16px', fontSize: '14px' }}
          >
            Edit Profile
          </button>
        </div>
        <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px' }}>
          <p><strong>Name:</strong> {user?.name || 'N/A'}</p>
          <p><strong>Email:</strong> {user?.email || 'N/A'}</p>
          <p><strong>User ID:</strong> {user?.id || 'N/A'}</p>
        </div>
      </div>

      {/* Security Settings */}
      <div className="section" style={{ marginBottom: '30px' }}>
        <h4 style={{ marginBottom: '15px' }}>Security Settings</h4>
        <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <div>
              <p style={{ margin: 0, fontWeight: '500' }}>Two-Factor Authentication (2FA)</p>
              <small style={{ color: '#666' }}>Add an extra layer of security to your account</small>
            </div>
            <label style={{ position: 'relative', display: 'inline-block', width: '50px', height: '24px' }}>
              <input
                type="checkbox"
                checked={twoFA}
                onChange={(e) => setTwoFA(e.target.checked)}
                style={{ opacity: 0, width: 0, height: 0 }}
              />
              <span style={{
                position: 'absolute',
                cursor: 'pointer',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: twoFA ? '#28a745' : '#ccc',
                borderRadius: '24px',
                transition: '0.3s'
              }}>
                <span style={{
                  position: 'absolute',
                  content: '""',
                  height: '18px',
                  width: '18px',
                  left: '3px',
                  bottom: '3px',
                  background: 'white',
                  borderRadius: '50%',
                  transition: '0.3s',
                  transform: twoFA ? 'translateX(26px)' : 'translateX(0)'
                }}></span>
              </span>
            </label>
          </div>
          <button
            className="btn btn-blue"
            onClick={() => setShowChangePassword(true)}
            style={{ padding: '8px 16px', fontSize: '14px' }}
          >
            Change Password
          </button>
        </div>
      </div>

      {/* Preferences */}
      <div className="section" style={{ marginBottom: '30px' }}>
        <h4 style={{ marginBottom: '15px' }}>Preferences</h4>
        <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px' }}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Theme</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                className={theme === 'light' ? 'btn btn-blue' : 'btn btn-grey'}
                onClick={() => handleThemeChange('light')}
                style={{ padding: '8px 16px' }}
              >
                Light
              </button>
              <button
                className={theme === 'dark' ? 'btn btn-blue' : 'btn btn-grey'}
                onClick={() => handleThemeChange('dark')}
                style={{ padding: '8px 16px' }}
              >
                Dark
              </button>
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Language</label>
            <select
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              style={{ width: '100%', padding: '8px', fontSize: '14px' }}
            >
              <option value="en">English</option>
              <option value="hi">Hindi</option>
              <option value="es">Spanish</option>
            </select>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Currency</label>
            <select
              value={currency}
              onChange={(e) => handleCurrencyChange(e.target.value)}
              style={{ width: '100%', padding: '8px', fontSize: '14px' }}
            >
              <option value="INR">₹ Indian Rupee (INR)</option>
              <option value="USD">$ US Dollar (USD)</option>
              <option value="EUR">€ Euro (EUR)</option>
            </select>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Default Chart Type</label>
            <select
              value={chartType}
              onChange={(e) => handleChartTypeChange(e.target.value)}
              style={{ width: '100%', padding: '8px', fontSize: '14px' }}
            >
              <option value="line">Line Chart</option>
              <option value="candlestick">Candlestick Chart</option>
              <option value="bar">Bar Chart</option>
            </select>
          </div>
        </div>
      </div>

      {/* Connected Apps / Integrations */}
      <div className="section" style={{ marginBottom: '30px' }}>
        <h4 style={{ marginBottom: '15px' }}>Connected Apps & Integrations</h4>
        <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px' }}>
          <div style={{ marginBottom: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div>
                <p style={{ margin: 0, fontWeight: '500' }}>Email Notifications</p>
                <small style={{ color: '#666' }}>Receive email updates for trade activities</small>
              </div>
              <label style={{ position: 'relative', display: 'inline-block', width: '50px', height: '24px' }}>
                <input
                  type="checkbox"
                  checked={emailNotifications}
                  onChange={(e) => setEmailNotifications(e.target.checked)}
                  style={{ opacity: 0, width: 0, height: 0 }}
                />
                <span style={{
                  position: 'absolute',
                  cursor: 'pointer',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: emailNotifications ? '#28a745' : '#ccc',
                  borderRadius: '24px',
                  transition: '0.3s'
                }}>
                  <span style={{
                    position: 'absolute',
                    content: '""',
                    height: '18px',
                    width: '18px',
                    left: '3px',
                    bottom: '3px',
                    background: 'white',
                    borderRadius: '50%',
                    transition: '0.3s',
                    transform: emailNotifications ? 'translateX(26px)' : 'translateX(0)'
                  }}></span>
                </span>
              </label>
            </div>
          </div>
          <div style={{ marginTop: '20px' }}>
            <p style={{ marginBottom: '10px', fontWeight: '500' }}>Bank Account / UPI</p>
            <button className="btn btn-blue" style={{ padding: '8px 16px', fontSize: '14px' }}>
              Link Bank Account
            </button>
          </div>
        </div>
      </div>

      {/* Logout Button */}
      <div className="section">
        <button
          className="btn"
          onClick={handleLogout}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            background: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            width: '100%'
          }}
        >
          Logout
        </button>
      </div>

      {/* Edit Profile Modal */}
      {showEditProfile && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            padding: '30px',
            borderRadius: '8px',
            maxWidth: '400px',
            width: '90%'
          }}>
            <h3 style={{ marginTop: 0 }}>Edit Profile</h3>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ width: '100%', padding: '8px', fontSize: '16px' }}
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: '100%', padding: '8px', fontSize: '16px' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                className="btn btn-blue"
                onClick={handleSaveProfile}
                style={{ flex: 1, padding: '10px' }}
              >
                Save
              </button>
              <button
                className="btn btn-grey"
                onClick={() => {
                  setShowEditProfile(false);
                  setName(user?.name || "");
                  setEmail(user?.email || "");
                }}
                style={{ flex: 1, padding: '10px' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showChangePassword && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            padding: '30px',
            borderRadius: '8px',
            maxWidth: '400px',
            width: '90%'
          }}>
            <h3 style={{ marginTop: 0 }}>Change Password</h3>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Current Password</label>
              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                style={{ width: '100%', padding: '8px', fontSize: '16px' }}
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                style={{ width: '100%', padding: '8px', fontSize: '16px' }}
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={{ width: '100%', padding: '8px', fontSize: '16px' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                className="btn btn-blue"
                onClick={handleChangePassword}
                style={{ flex: 1, padding: '10px' }}
              >
                Change Password
              </button>
              <button
                className="btn btn-grey"
                onClick={() => {
                  setShowChangePassword(false);
                  setOldPassword("");
                  setNewPassword("");
                  setConfirmPassword("");
                }}
                style={{ flex: 1, padding: '10px' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Apps;
