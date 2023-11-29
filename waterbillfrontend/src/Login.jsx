import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';
const Login = ({ onLogin }) => {
  const [name, setName] = useState('');
  const [tenantId, setTenantId] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/verify-login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ name, tenant_id: tenantId }),
      });

      const data = await response.json();

      if (data.success) {
        // Login successful, notify the parent component
        onLogin();
        // Redirect to the payment page
         navigate(`/payment/${tenantId}`);
      } else {
        // Login failed, show an error message
        alert(data.message);
      }
    } catch (error) {
      console.error('Error during login:', error);
    }
  };

  return (
    <>
    <div className="Login">

    <div className="LoginPage">
      <h2>Login</h2>
      <label>
        Name:
      </label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
      
      <label>
        Tenant ID:
      </label>
        <input type="text" value={tenantId} onChange={(e) => setTenantId(e.target.value)} />
      
      <button onClick={handleLogin} className="Loginbutton">Login</button>
    </div>
    
    </div>
    </>
  );
};

export default Login;
