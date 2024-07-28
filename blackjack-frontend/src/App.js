import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import AuthForm from './AuthForm';
import LandingPage from './LandingPage'; // Ensure this component is created

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<AuthForm />} />
                <Route path="/landing" element={<LandingPage />} />
                <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
        </Router>
    );
}

export default App;
