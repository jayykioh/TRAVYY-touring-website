import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';

function App() {
  return (
    <Router>
      <div className='App'>
        <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/Login" element={<Login />} />
        {/* Add more routes as needed */}
      </Routes>
      </div>
    </Router>
  );
}

export default App;