import React from 'react';
import Login from './Login';
import './App.css';

const Landing = ({ onLogin }) => {
  return (
    <div className="LandingContainer">
      <div className="InfoSection">
        <h1>Welcome</h1>
        <h2>to Our Water Payment System</h2>
        <p>
          Manage your water payments effortlessly. Log in with your credentials
          to view and pay your water bills online.
        </p>
        <p>
          If you have any questions or need assistance, please contact our
          support team.
        </p>
      </div>
      <div className="LoginSection">
        <Login onLogin={onLogin} />
      </div>
    </div>
  );
};

export default Landing;
