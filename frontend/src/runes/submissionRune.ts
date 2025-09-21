import { writable } from 'svelte/store'
import api from '../lib/apiClient'
import { teamRune } from './teamRune'
import type { Submission } from '../types/team'

/**
 * submissionRune store
 * - holds the team's submission object (name, desc, repo, pres) or null
 * - updated indirectly by the update*() functions which write to the backend
 */
export const submissionRune = writable<Submission | null>(null)

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
export async function updateName(name: string) {
  const res = await api.patch('/teams/submissions/name', { name })
  // refresh team submission
  await refreshTeamSubmission()
  return res.data
}

/**
 * updateDesc(desc)
 * - Purpose: Update the submission description on the backend.
 * - Input: desc string
 * - Output: backend response
 * - Side effects: refreshes team/submission state
 */
export async function updateDesc(desc: string) {
  const res = await api.patch('/teams/submissions/desc', { desc })
  await refreshTeamSubmission()
  return res.data
}

/**
 * updateRepo(repo)
 * - Purpose: Update the repository URL for the submission.
 */
export async function updateRepo(repo: string) {
  const res = await api.patch('/teams/submissions/repo', { repo })
  await refreshTeamSubmission()
  return res.data
}

/**
 * updatePres(pres)
 * - Purpose: Update the presentation URL/identifier for the submission.
 */
export async function updatePres(pres: string) {
  const res = await api.patch('/teams/submissions/pres', { pres })
  await refreshTeamSubmission()
  return res.data
}

/**
 * refreshTeamSubmission()
 * - Purpose: Retrieve the team object from backend and update both teamRune
 *   and submissionRune. This is used after any submission patch to keep
 *   client state in sync with the server.
 * - Error handling: failures are swallowed here (UI or callers may retry).
 */
async function refreshTeamSubmission() {
  try {
    const res = await api.get('/teams')
    teamRune.set(res.data)
    submissionRune.set(res.data.submission || null)
  } catch (e) {
    // ignore for now; callers/tests can handle errors
  }
}
