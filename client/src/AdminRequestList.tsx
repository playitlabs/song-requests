import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useTracksQuery } from './queries/Tracks';
import { useRequestsQuery, useDeleteRequestMutation } from './queries/Requests';

interface AdminRequestListProps {
    token: string | null;
    onLogout: () => void;
}

interface DeleteConfirmationProps {
    requestId: string;
    trackName: string;
    onCancel: () => void;
    onConfirm: () => void;
    isPending: boolean;
}

function DeleteConfirmation({ requestId, trackName, onCancel, onConfirm, isPending }: DeleteConfirmationProps) {
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    Confirm Delete Request
                </h3>
                <p className="text-gray-600 mb-6">
                    Are you sure you want to delete the request for "{trackName}"?
                </p>
                <div className="flex justify-end space-x-3">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors cursor-pointer"
                        disabled={isPending}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors cursor-pointer"
                        disabled={isPending}
                    >
                        {isPending ? 'Deleting...' : 'Delete Request'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export function AdminRequestList({ token, onLogout }: AdminRequestListProps) {
    const navigate = useNavigate();
    const { data: requests, isLoading: requestsLoading, error: requestsError } = useRequestsQuery(token, onLogout);
    const { data: tracks, isLoading: tracksLoading } = useTracksQuery();
    const deleteRequestMutation = useDeleteRequestMutation(token, onLogout);
    const [requestToDelete, setRequestToDelete] = useState<string | null>(null);

    // Function to lookup track name by GUID
    const getTrackName = (trackGuid: string) => {
        const track = tracks?.find(t => t.guid === trackGuid);
        return track ? track.artistTitle : 'Unknown Track';
    };

    const handleDeleteRequest = (requestId: string) => {
        setRequestToDelete(requestId);
    };

    const confirmDelete = () => {
        if (requestToDelete) {
            deleteRequestMutation.mutate(requestToDelete);
            // We'll close the dialog when the mutation succeeds
            if (!deleteRequestMutation.isPending) {
                setRequestToDelete(null);
            }
        }
    };

    const cancelDelete = () => {
        setRequestToDelete(null);
    };

    if (requestsLoading || tracksLoading) {
        return <div className="flex justify-center items-center p-8">Loading...</div>;
    }

    if (requestsError) {
        return (
            <div className="w-full max-w-6xl p-6">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    Error loading requests. Please try again.
                </div>
                <button 
                    onClick={() => navigate({ to: '/admin' })}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                    Retry
                </button>
            </div>
        );
    }

    // Find the request to delete to get its track name
    const requestToDeleteObject = requestToDelete ? requests?.find(r => r.id === requestToDelete) : null;
    const trackNameToDelete = requestToDeleteObject ? getTrackName(requestToDeleteObject.trackGuid) : '';

    return (
        <>
            <div className="w-full max-w-6xl p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">Song Requests Admin</h1>
                    <button 
                        onClick={onLogout}
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors cursor-pointer"
                    >
                        Logout
                    </button>
                </div>
                
                <div className="overflow-x-auto bg-white rounded-lg shadow">
                    <table className="min-w-full">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Song</th>
                                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requested By</th>
                                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
                                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requested Time</th>
                                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP Address</th>
                                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Processed Time</th>
                                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {requests?.length ? (
                                requests.sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime()).map(request => (
                                    <tr key={request.id} className="hover:bg-gray-50">
                                        <td className="py-4 px-4 whitespace-nowrap align-top">{getTrackName(request.trackGuid)}</td>
                                        <td className="py-4 px-4 whitespace-nowrap align-top">{request.requestedBy}</td>
                                        <td className="py-4 px-4 max-w-xs align-top whitespace-pre-line">
                                            {request.message || '-'}
                                        </td>
                                        <td className="py-4 px-4 whitespace-nowrap align-top">
                                            {new Date(request.requestedAt).toLocaleString()}
                                        </td>
                                        <td className="py-4 px-4 whitespace-nowrap align-top">{request.ipAddress || 'Unknown'}</td>
                                        <td className="py-4 px-4 whitespace-nowrap align-top">
                                            {request.processedAt ? new Date(request.processedAt).toLocaleString() : 'Not processed'}
                                        </td>
                                        <td className="py-4 px-4 whitespace-nowrap align-top">
                                            {!request.processedAt && (
                                                <button
                                                    onClick={() => handleDeleteRequest(request.id)}
                                                    className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors cursor-pointer"
                                                >
                                                    Delete
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="py-4 px-4 text-center text-gray-500">No requests yet</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {requestToDelete && requestToDeleteObject && (
                <DeleteConfirmation
                    requestId={requestToDelete}
                    trackName={trackNameToDelete}
                    onCancel={cancelDelete}
                    onConfirm={confirmDelete}
                    isPending={deleteRequestMutation.isPending}
                />
            )}
        </>
    );
}