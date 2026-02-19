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


export const isInfraError = (error) => {
    if (!error) return false;

    if (error.graphQLErrors && Array.isArray(error.graphQLErrors) && error.graphQLErrors.length > 0) {
        return error.graphQLErrors.some(checkSingleInfraError);
    }

    if (error.networkError) {
        return true;
    }

    return checkSingleInfraError(error);
};

export const isAuthError = (error) => {
    if (!error) return false;

    const checkMsg = (msg) => {
        const m = (msg || '').toLowerCase();
        return m.includes('unauthorized') || m.includes('forbidden') || m.includes('401') || m.includes('403');
    };

    if (error.graphQLErrors && Array.isArray(error.graphQLErrors) && error.graphQLErrors.length > 0) {
        return error.graphQLErrors.some(e => checkMsg(e.message));
    }

    return checkMsg(error.message);
};
