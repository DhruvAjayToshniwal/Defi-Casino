import React, { useState } from 'react';
import './AuthForm.css'; // Make sure to import the CSS file for styling

function AuthForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLogin, setIsLogin] = useState(true); // true for login, false for register
    const [message, setMessage] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        const action = isLogin ? 'login' : 'register';
        const endpoint = `http://localhost:3000/${action}`;

        fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => { throw new Error(text) });
            }
            return response.json();
        })
        .then(data => {
            setMessage(`Success: ${isLogin ? 'Logged in successfully' : 'Registered successfully'}`);
            console.log('Success:', data);
            if (!isLogin) {
                setIsLogin(true); // Automatically switch to login after registration
            } else {
                setTimeout(() => {
                    window.location.href = 'http://localhost:8000'; // Redirect to the external landing page
                }, 1000);
            }
        })
        .catch(error => {
            setMessage(`Error: ${error.message}`);
            console.error('Error:', error);
        });
    };

    return (
        <div className="auth-container">
            <h1>{isLogin ? 'Login' : 'Register'}</h1>
            <form onSubmit={handleSubmit} className="auth-form">
                {message && <p className="message">{message}</p>}
                <label>
                    Email:
                    <input 
                        type="email" 
                        value={email} 
                        onChange={e => setEmail(e.target.value)} 
                        required 
                    />
                </label>
                <label>
                    Password:
                    <input 
                        type="password" 
                        value={password} 
                        onChange={e => setPassword(e.target.value)} 
                        required 
                    />
                </label>
                <button type="submit" className="auth-button">{isLogin ? 'Login' : 'Register'}</button>
                <div className="auth-switch">
                    <button type="button" className="forgot-password-button">Forgot your password?</button>
                </div>
            </form>
            <div className="auth-footer">
                {isLogin ? (
                    <span>Don't have an account? <button type="button" className="signup-button" onClick={() => setIsLogin(false)}>Sign up</button></span>
                ) : (
                    <span>Already have an account? <button type="button" className="signup-button" onClick={() => setIsLogin(true)}>Login</button></span>
                )}
            </div>
        </div>
    );
}

export default AuthForm;
