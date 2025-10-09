import { derived, writable, get } from 'svelte/store'
import { openhackApi } from '$api/openhackApi.js'
import { teamRune } from '$runes/teamRune.js'
import type { Submission, Team } from '$types/team.js'
import { withMinDuration } from '$lib/stores/withMinDuration.js'
import {
  DEFAULT_MIN_DURATION,
  waitMinimumDuration,
} from '$lib/utils/minDuration.js'

/**
 * submissionRune store
 * - holds the team's submission object (name, desc, repo, pres) or null
 * - updated indirectly by the update*() functions which write to the backend
 */
export const submissionRune = writable<Submission | null>(null)
const submissionLoadingCounter = writable(0)
export const submissionLoadingPending = derived(
  submissionLoadingCounter,
  (pending) => pending > 0
)
export const submissionLoading = withMinDuration(submissionLoadingPending)

const MIN_LOADING_DURATION = DEFAULT_MIN_DURATION

function beginSubmissionLoading() {
  const pending = get(submissionLoadingCounter)
  submissionLoadingCounter.set(pending + 1)
  return pending === 0
}

function endSubmissionLoading() {
  submissionLoadingCounter.update((pending) => (pending > 0 ? pending - 1 : 0))
}

async function withSubmissionLoading<T>(task: () => Promise<T>): Promise<T> {
  const isRoot = beginSubmissionLoading()
  const startedAt = isRoot ? Date.now() : 0
  try {
    const result = await task()
    if (isRoot) {
      await waitMinimumDuration(startedAt, MIN_LOADING_DURATION)
    }
    return result
  } catch (error) {
    if (isRoot) {
      await waitMinimumDuration(startedAt, MIN_LOADING_DURATION)
    }
    throw error
  } finally {
    endSubmissionLoading()
  }
}

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
  return withSubmissionLoading(async () => {
    const team = await openhackApi.Submissions.updateName(name)
    updateStores(team)
    return team
  })
}

/**
 * updateDesc(desc)
 * - Purpose: Update the submission description on the backend.
 * - Input: desc string
 * - Output: backend response
 * - Side effects: refreshes team/submission state
 */
export async function updateDesc(desc: string) {
  return withSubmissionLoading(async () => {
    const team = await openhackApi.Submissions.updateDesc(desc)
    updateStores(team)
    return team
  })
}

/**
 * updateRepo(repo)
 * - Purpose: Update the repository URL for the submission.
 */
export async function updateRepo(repo: string) {
  return withSubmissionLoading(async () => {
    const team = await openhackApi.Submissions.updateRepo(repo)
    updateStores(team)
    return team
  })
}

/**
 * updatePres(pres)
 * - Purpose: Update the presentation URL/identifier for the submission.
 */
export async function updatePres(pres: string) {
  return withSubmissionLoading(async () => {
    const team = await openhackApi.Submissions.updatePres(pres)
    updateStores(team)
    return team
  })
}

/**
 * refreshTeamSubmission()
 * - Purpose: Retrieve the team object from backend and update both teamRune
 *   and submissionRune. This is used after any submission patch to keep
 *   client state in sync with the server.
 * - Error handling: failures are swallowed here (UI or callers may retry).
 */
function updateStores(team: Team) {
  teamRune.set(team)
  submissionRune.set(team.submission ?? null)
}
