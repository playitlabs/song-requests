import React, { useState, useEffect } from 'react';
import { TrackDto } from '../../shared/TrackDto';
import useLocalStorage from './hooks/useLocalStorage';
import { useSettingsQuery } from './queries/Settings';

export function TrackCard({ track }: { track: TrackDto }) {
    const [showConfirm, setShowConfirm] = useState(false);
    const [requesterName, setRequesterName] = useLocalStorage<string>('songRequestName', '');
    const [requesterMessage, setRequesterMessage] = useState('');
    const [isRequested, setIsRequested] = useState(false);
    const [requestTime, setRequestTime] = useState<Date | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const maxMessageLength = useSettingsQuery().data?.maxMessageLength || 150;

    // Reset the requested status after 30 seconds
    useEffect(() => {
        if (isRequested) {
            const timer = setTimeout(() => {
                setIsRequested(false);
            }, 30000); // 30 seconds
            return () => clearTimeout(timer);
        }
    }, [isRequested]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!requesterName.trim()) {
            // Don't submit if name is empty
            return;
        }
        
        // Clear any previous error
        setErrorMessage(null);
        
        console.log('Requesting track:', track.guid);
        fetch('/api/requestTrack', {
            method: 'POST',
            body: JSON.stringify({ 
                trackGuid: track.guid, 
                requestedBy: requesterName,
                message: requesterMessage.trim() || undefined
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (response.ok) {
                setIsRequested(true);
                setRequestTime(new Date());
                setShowConfirm(false);
                setRequesterMessage(''); // Clear message for next request
            } else if (response.status === 409) {
                // Song is already requested
                return response.json().then(data => {
                    setErrorMessage(data.message || 'This song has already been requested recently.');
                });
            } else if (response.status === 400) {
                // Validation error (e.g., message too long)
                return response.json().then(data => {
                    setErrorMessage(data.message || 'Invalid request parameters.');
                });
            } else {
                return response.json().then(data => {
                    setErrorMessage(data.message || 'An error occurred while requesting the song');
                });
            }
        })
        .catch(error => {
            console.error('Error requesting track:', error);
            setErrorMessage('Network error. Please try again.');
        });
    };

    // Format the time since request
    const getTimeSinceRequest = () => {
        if (!requestTime) return '';
        
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - requestTime.getTime()) / 1000);
        
        if (diffInSeconds < 60) {
            return 'just now';
        } else {
            const minutes = Math.floor(diffInSeconds / 60);
            return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        }
    };

    return (
        <>
            <div
                onClick={() => {
                    setShowConfirm(true);
                    setErrorMessage(null);
                }}
                className={`bg-white rounded-lg shadow-md p-3 lg:p-4 hover:shadow-lg transition-shadow duration-200 cursor-pointer 
                    ${isRequested ? 'border-2 border-green-500' : ''}`}
            >
                <div className="text-base lg:text-lg font-semibold text-gray-800">{track.artistTitle}</div>
                {isRequested && (
                    <div className="mt-2 text-sm text-green-600 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Requested {getTimeSinceRequest()}
                    </div>
                )}
            </div>

            {showConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">
                            {errorMessage ? 'Song Request' : 'Confirm Song Request'}
                        </h3>
                        <p className="text-gray-600 mb-4">
                            {errorMessage ? 
                                `Unable to request: ${track.artistTitle}` : 
                                `Would you like to request "${track.artistTitle}"?`}
                        </p>
                        {errorMessage && (
                            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                                {errorMessage}
                            </div>
                        )}
                        
                        {!errorMessage ? (
                            <form onSubmit={handleSubmit}>
                                <div className="mb-4">
                                    <label htmlFor="requesterName" className="block text-sm font-medium text-gray-700 mb-1">
                                        Your Name
                                    </label>
                                    <input
                                        type="text"
                                        id="requesterName"
                                        name="requesterName"
                                        autoFocus={!requesterName}
                                        value={requesterName}
                                        onChange={(e) => setRequesterName(e.target.value)}
                                        placeholder="Enter your name"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                    {requesterName && (
                                        <p className="text-xs text-gray-500 mt-1">
                                            Your name will be remembered for future requests
                                        </p>
                                    )}
                                </div>
                                
                                <div className="mb-4">
                                    <label htmlFor="requesterMessage" className="block text-sm font-medium text-gray-700 mb-1">
                                        Message (optional)
                                    </label>
                                    <textarea
                                        id="requesterMessage"
                                        name="requesterMessage"
                                        value={requesterMessage}
                                        autoFocus={!!requesterName}
                                        onChange={(e) => {
                                            if (e.target.value.length <= maxMessageLength) {
                                                setRequesterMessage(e.target.value);
                                            }
                                        }}
                                        placeholder={`Add a message (max ${maxMessageLength} characters)`}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 resize-none"
                                        rows={3}
                                    />
                                    <p className="text-xs text-gray-500 mt-1 flex justify-end">
                                        <span>{requesterMessage.length}/{maxMessageLength}</span>
                                    </p>
                                </div>
                                
                                <div className="flex justify-end space-x-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowConfirm(false);
                                            setErrorMessage(null);
                                        }}
                                        className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={!requesterName.trim()}
                                        className={`px-4 py-2 ${!requesterName.trim() ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 cursor-pointer'} text-white rounded-lg transition-colors`}
                                    >
                                        Request Song
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="flex justify-center">
                                <button
                                    autoFocus
                                    type="button"
                                    onClick={() => {
                                        setShowConfirm(false);
                                        setErrorMessage(null);
                                    }}
                                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors cursor-pointer"
                                >
                                    Close
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
