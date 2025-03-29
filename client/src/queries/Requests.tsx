import { useQuery, UseQueryResult, useMutation, useQueryClient } from "@tanstack/react-query";
import { RequestDto } from "../../../shared/RequestDto";

export function useRequestsQuery(
    token?: string | null, 
    onAuthError?: () => void
): UseQueryResult<RequestDto[], Error> {
    return useQuery<RequestDto[], Error>({
        queryKey: ['requests', token],
        queryFn: async () => {
            const headers: HeadersInit = {};
            if (token) {
                headers.Authorization = `Bearer ${token}`;
            }
            
            const response = await fetch('/api/requests', { headers });
            
            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    // Token expired or invalid, trigger logout
                    if (onAuthError) {
                        onAuthError();
                    }
                    throw new Error('Authentication failed');
                }
                throw new Error('Failed to fetch requests');
            }
            
            return response.json();
        },
        retry: false,
        enabled: !!token
    });
}

export function useDeleteRequestMutation(token: string | null, onAuthError?: () => void) {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: async (requestId: string) => {
            const headers: HeadersInit = {
                'Content-Type': 'application/json'
            };
            
            if (token) {
                headers.Authorization = `Bearer ${token}`;
            }
            
            const response = await fetch(`/api/requests/${requestId}`, {
                method: 'DELETE',
                headers
            });
            
            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    // Token expired or invalid, trigger logout
                    if (onAuthError) {
                        onAuthError();
                    }
                    throw new Error('Authentication failed');
                }
                throw new Error('Failed to delete request');
            }
            
            return response.json();
        },
        onSuccess: () => {
            // Invalidate and refetch the requests query
            queryClient.invalidateQueries({ queryKey: ['requests', token] });
        }
    });
}