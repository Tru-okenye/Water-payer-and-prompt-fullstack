import React, { useState } from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Payment from './payment';
import Home from './Home';
import Landing from './Landing';
import Receipt from './Receipt';
import Success from './Success';
function App() {
  const handleLogin = () => {
    // Your login logic here
    console.log('Logged in!');
  };

  return (
    <main>
      <Router>
        <Routes>
          <Route
            path="/"
            element={<Home onLogin={handleLogin} />}
          >
            <Route index element={<Landing onLogin={handleLogin} />} />
             <Route path="payment/:tenantId" element={<Payment />} />
             <Route path="Receipt" element={<Receipt />} />
             <Route path="Success" element={<Success />} />
          </Route>
        </Routes>
      </Router>
    </main>
  );
}

export default App;
