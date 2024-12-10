import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import './App.css';

const Home = () => {
  return (
    <>
      <nav>
        <Link to="/" className="link">WATER PAYMENT</Link>
      </nav>
      
      <Outlet />

      <footer className="Footer">
        <p>Contact us: +254-700-000-000 | support@waterpayment.com</p>
        <p>&copy; 2024 Water Payment System. All rights reserved.</p>
      </footer>
    </>
  );
};

export default Home;
