/**
 * Checks if a single GraphQL error object represents an infrastructure failure.
 */
const checkSingleInfraError = (gqlError) => {
    const msg = (gqlError.message || '').toLowerCase();
    const code = (gqlError.extensions?.code || '').toLowerCase();

    return (
        code === 'internal_server_error' ||
        code === 'internal' ||
        msg.includes('internal server error') ||
        msg.includes('connect call failed') ||
        msg.includes('connection refused') ||
        msg.includes('econnrefused') ||
        msg.includes('multiple exceptions') ||
        msg.includes('oserror') ||
        msg.includes('failed to fetch') ||
        msg.includes('network error')
    );
};

/**
 * Returns true if the error (ApolloError or GraphQLError) looks like 
 * a server-side infrastructure failure (DB down, unhandled exception, etc.).
 * 
 * Handles both:
 * - Single GraphQLError (from errorLink loop)
 * - aggregated ApolloError (from component onError, containing .graphQLErrors[])
 */
export const isInfraError = (error) => {
    if (!error) return false;

    // 1. Is it an aggregated ApolloError with graphQLErrors array?
    if (error.graphQLErrors && Array.isArray(error.graphQLErrors) && error.graphQLErrors.length > 0) {
        return error.graphQLErrors.some(checkSingleInfraError);
    }

    // 2. Is it a network error property on ApolloError?
    if (error.networkError) {
        return true;
    }

    // 3. Fallback: treat it as a single error object (or vanilla Error)
    return checkSingleInfraError(error);
};

/**
 * Returns true if an error is an authentication error (401/403).
 */
export const isAuthError = (error) => {
    if (!error) return false;

    const checkMsg = (msg) => {
        const m = (msg || '').toLowerCase();
        return m.includes('unauthorized') || m.includes('forbidden') || m.includes('401') || m.includes('403');
    };

    // 1. Aggregated ApolloError
    if (error.graphQLErrors && Array.isArray(error.graphQLErrors) && error.graphQLErrors.length > 0) {
        return error.graphQLErrors.some(e => checkMsg(e.message));
    }

    // 2. Fallback single error
    return checkMsg(error.message);
};
