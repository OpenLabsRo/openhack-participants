import { writable } from "svelte/store";
import api from "../lib/apiClient";

export type Team = {
  id: string;
  name: string;
  members: string[];
  submission: {
    name: string;
    desc: string;
    repo: string;
    pres: string;
  };
  deleted: boolean;
};

/**
 * teamRune store
 * - holds the current team object for the signed-in user, or null when not on a team
 * - updated by getTeam, createTeam, join, leave, and kick
 */
export const teamRune = writable<Team | null>(null);

/**
 * getTeam()
 * - Purpose: Fetch the user's team from the backend and cache it in `teamRune`.
 * - Input: none
 * - Output: team object returned by backend
 * - Side effects: updates `teamRune`
 * - Error modes: throws on network failure
 */
export async function getTeam() {
  const res = await api.get("/teams");
  teamRune.set(res.data);
  return res.data;
}

/**
 * createTeam(name)
 * - Purpose: Create a new team and set it in `teamRune`.
 * - Input: team name
 * - Output: created team object
 * - Side effects: updates `teamRune`
 */
export async function createTeam(name: string) {
  const res = await api.post("/teams", { name });
  teamRune.set(res.data);
  return res.data;
}

/**
 * join(teamId)
 * - Purpose: Join an existing team by id.
 * - Input: teamId string
 * - Output: joined team object
 * - Side effects: updates `teamRune`
 */
export async function join(teamId: string) {
  const res = await api.post(`/teams/${teamId}/join`);
  teamRune.set(res.data);
  return res.data;
}

/**
 * leave()
 * - Purpose: Leave the current team.
 * - Input: none
 * - Output: backend response
 * - Side effects: clears `teamRune`
 */
export async function leave() {
  const res = await api.post("/teams/leave");
  teamRune.set(null);
  return res.data;
}

/**
 * kick(accountId)
 * - Purpose: Remove a member (account) from the team, then refresh team state.
 * - Input: accountId string
 * - Output: backend response
 * - Side effects: calls `getTeam()` which updates `teamRune`
 */
export async function kick(accountId: string) {
  const res = await api.post("/teams/kick", { accountId });
  // after kick, refresh team
  await getTeam();
  return res.data;
}
