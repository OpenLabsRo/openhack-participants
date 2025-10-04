import axios from 'axios';
import api from '../apiClient.js';
export function isApiError(err) {
    return (typeof err === 'object' &&
        err !== null &&
        'status' in err &&
        'message' in err);
}
// toApiError promotes unknown values (Axios errors or otherwise) into ApiError.
function toApiError(err) {
    if (axios.isAxiosError(err) && err.response) {
        const { status, data } = err.response;
        const message = typeof data?.message === 'string' ? data.message : err.message;
        return { name: 'ApiError', status, message };
    }
    const message = err instanceof Error ? err.message : 'Unknown error';
    return { name: 'ApiError', status: 0, message };
}
// request executes the provided axios call and converts failures into ApiError.
async function request(fn) {
    try {
        const { data } = await fn();
        return data;
    }
    catch (err) {
        throw toApiError(err);
    }
}
// createApiHelpers wires domain-specific helpers onto a shared axios instance so runes/tests
// can consume a consistent, typed surface area.
export function createApiHelpers(apiClient = api) {
    const Accounts = {
        // check verifies onboarding status for an email.
        check: (email) => request(() => apiClient.post('/accounts/auth/check', {
            email,
        })),
        // register issues a token and profile for new accounts.
        register: (payload) => request(() => apiClient.post('/accounts/auth/register', payload)),
        // login authenticates via credentials.
        login: (payload) => request(() => apiClient.post('/accounts/auth/login', payload)),
        // whoami resolves the current account from the auth token.
        whoami: () => request(() => apiClient.get('/accounts/meta/whoami')),
        // editName updates the display name and returns a refreshed token payload.
        editName: (name) => request(() => apiClient.patch('/accounts/me', { name })),
        // flags retrieves participant feature flags.
        flags: () => request(() => apiClient.get('/accounts/flags')),
    };
    const Teams = {
        // detail returns the caller's team document (requires membership).
        detail: () => request(() => apiClient.get('/teams')),
        // create provisions a team and returns token/account for the creator.
        create: (name) => request(() => apiClient.post('/teams', { name })),
        // changeName mutates the team name.
        changeName: (payload) => request(() => apiClient.patch('/teams/name', payload)),
        // updateTable mutates the team table.
        changeTable: (payload) => request(() => apiClient.patch('/teams/table', payload)),
        // remove deletes the team (single-member constraint) and refreshes auth state.
        remove: () => request(() => apiClient.delete('/teams')),
        // members lists the hydrated roster for the team.
        members: () => request(() => apiClient.get('/teams/members')),
        // join enrolls the caller into the specified team and returns token/account/members.
        join: (id) => request(() => apiClient.patch('/teams/members/join', undefined, { params: { id } })),
        // leave removes the caller and returns the remaining roster.
        leave: () => request(() => apiClient.patch('/teams/members/leave')),
        // kick expels the given account ID and returns the updated roster.
        kick: (id) => request(() => apiClient.patch('/teams/members/kick', undefined, { params: { id } })),
    };
    const Submissions = {
        // updateName/Desc/Repo/Pres patch individual submission fields and return the updated team doc.
        updateName: (name) => request(() => apiClient.patch('/teams/submissions/name', { name })),
        updateDesc: (desc) => request(() => apiClient.patch('/teams/submissions/desc', { desc })),
        updateRepo: (repo) => request(() => apiClient.patch('/teams/submissions/repo', { repo })),
        updatePres: (pres) => request(() => apiClient.patch('/teams/submissions/pres', { pres })),
    };
    const Flags = {
        // fetch retrieves administrator flag state and active stage.
        fetch: () => request(() => apiClient.get('/accounts/flags')),
    };
    return { Accounts, Teams, Submissions, Flags };
}
export const openhackApi = createApiHelpers();
