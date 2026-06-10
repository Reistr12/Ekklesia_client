import { QueryClient } from '@tanstack/react-query'

const shouldRetryQuery = (failureCount: number, error: unknown) => {
	const status = (error as { response?: { status?: number } } | null)?.response?.status

	if (status === 400 || status === 401 || status === 403 || status === 404) {
		return false
	}

	return failureCount < 2
}

export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 60 * 1000,
			gcTime: 10 * 60 * 1000,
			refetchOnWindowFocus: false,
			refetchOnMount: true,
			refetchOnReconnect: true,
			retry: shouldRetryQuery,
		},
		mutations: {
			retry: 0,
		},
	},
})
