import React, { useEffect } from 'react';
import { Outlet, Link } from 'react-router-dom';
import './App.css';
const Home = () => {
  return (
    <>
    <nav>
 
 
<Link to="/" className='link'>WATER PAYMENT</Link>

    </nav>
    
  
    <Outlet/>
    </>
  );
};

export default Home;
