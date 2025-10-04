import { writable } from 'svelte/store';
import { openhackApi } from '../lib/api/openhackApi.js';
import { teamRune } from './teamRune.js';
/**
 * submissionRune store
 * - holds the team's submission object (name, desc, repo, pres) or null
 * - updated indirectly by the update*() functions which write to the backend
 */
export const submissionRune = writable(null);
// NOTE: Debounce belongs in the UI. These functions perform the network
// call and update the teamRune on success. UI components should debounce
// user typing and call these functions after idle.
/**
 * updateName(name)
 * - Purpose: Update the submission name on the backend.
 * - Input: name string
 * - Output: backend response
 * - Side effects: calls `refreshTeamSubmission()` which updates `teamRune`
 */
export async function updateName(name) {
    const team = await openhackApi.Submissions.updateName(name);
    updateStores(team);
    return team;
}
/**
 * updateDesc(desc)
 * - Purpose: Update the submission description on the backend.
 * - Input: desc string
 * - Output: backend response
 * - Side effects: refreshes team/submission state
 */
export async function updateDesc(desc) {
    const team = await openhackApi.Submissions.updateDesc(desc);
    updateStores(team);
    return team;
}
/**
 * updateRepo(repo)
 * - Purpose: Update the repository URL for the submission.
 */
export async function updateRepo(repo) {
    const team = await openhackApi.Submissions.updateRepo(repo);
    updateStores(team);
    return team;
}
/**
 * updatePres(pres)
 * - Purpose: Update the presentation URL/identifier for the submission.
 */
export async function updatePres(pres) {
    const team = await openhackApi.Submissions.updatePres(pres);
    updateStores(team);
    return team;
}
/**
 * refreshTeamSubmission()
 * - Purpose: Retrieve the team object from backend and update both teamRune
 *   and submissionRune. This is used after any submission patch to keep
 *   client state in sync with the server.
 * - Error handling: failures are swallowed here (UI or callers may retry).
 */
function updateStores(team) {
    teamRune.set(team);
    submissionRune.set(team.submission ?? null);
}
