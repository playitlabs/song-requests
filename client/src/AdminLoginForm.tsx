import React from 'react';

interface AdminLoginFormProps {
    error: string;
    password: string;
    isLoading: boolean;
    onPasswordChange: (value: string) => void;
    onSubmit: (e: React.FormEvent) => void;
}

export function AdminLoginForm({ 
    error, 
    password, 
    isLoading, 
    onPasswordChange, 
    onSubmit 
}: AdminLoginFormProps) {
    return (
        <div className="w-full max-w-md p-6 mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Admin Login</h1>
            
            <div className="bg-white rounded-lg shadow-md p-6">
                <form onSubmit={onSubmit}>
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                            {error}
                        </div>
                    )}
                    
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            autoFocus
                            value={password}
                            onChange={(e) => onPasswordChange(e.target.value)}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            required
                        />
                    </div>
                    
                    <div className="flex items-center justify-between">
                        <button
                            type="submit"
                            className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
                                isLoading ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Logging in...' : 'Sign In'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
} 