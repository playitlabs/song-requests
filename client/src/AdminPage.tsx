import React, { useState, useEffect } from 'react';
import { AdminRequestList } from './AdminRequestList';
import { AdminLoginForm } from './AdminLoginForm';

export function AdminPage() {
    const storedToken = localStorage.getItem('admin_token');
    const [isAuthenticated, setIsAuthenticated] = useState(storedToken !== null);
    const [token, setToken] = useState<string | null>(storedToken);
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        
        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ password }),
            });
            
            const data = await response.json();
            
            if (response.ok && data.success) {
                localStorage.setItem('admin_token', data.token);
                setToken(data.token);
                setIsAuthenticated(true);
            } else {
                setError(data.message || 'Login failed');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('admin_token');
        setToken(null);
        setIsAuthenticated(false);
        setPassword('');
    };

    if (!isAuthenticated) {
        return (
            <AdminLoginForm
                error={error}
                password={password}
                isLoading={isLoading}
                onPasswordChange={setPassword}
                onSubmit={handleLogin}
            />
        );
    }

    return <AdminRequestList token={token} onLogout={handleLogout} />;
} 