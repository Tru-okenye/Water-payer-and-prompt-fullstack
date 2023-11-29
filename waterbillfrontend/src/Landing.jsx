import React from 'react';
import Login from './Login';

const Landing = ({ onLogin }) => {
  return (
    <>
      <Login onLogin={onLogin} />
    </>
  );
}

export default Landing;
