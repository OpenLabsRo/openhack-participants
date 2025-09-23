import { writable } from 'svelte/store';
import { setAuthToken } from '../lib/apiClient.js';
import { openhackApi, } from '../lib/api/openhackApi.js';
import { accountRune } from './accountRune.js';
export const teamRune = writable(null);
export const teamMembersRune = writable([]);
async function refreshAuth({ token, account }) {
    setAuthToken(token);
    accountRune.set(account);
}
function applyMembers(members) {
    teamMembersRune.set(members);
}
export async function getTeam() {
    const team = await openhackApi.Teams.detail();
    teamRune.set(team);
    return team;
}
export async function loadMembers() {
    const members = await openhackApi.Teams.members();
    applyMembers(members);
    return members;
}
export async function createTeam(name) {
    const response = await openhackApi.Teams.create(name);
    await refreshAuth(response);
    const team = await getTeam();
    await loadMembers();
    return team;
}
export async function renameTeam(name) {
    const team = await openhackApi.Teams.rename({ name });
    teamRune.set(team);
    return team;
}
export async function deleteTeam() {
    const response = await openhackApi.Teams.remove();
    await refreshAuth(response);
    teamRune.set(null);
    teamMembersRune.set([]);
    return response;
}
export async function join(teamId) {
    const response = await openhackApi.Teams.join(teamId);
    await refreshAuth(response);
    applyMembers(response.members);
    return getTeam();
}
export async function leave() {
    const response = await openhackApi.Teams.leave();
    await refreshAuth(response);
    teamRune.set(null);
    teamMembersRune.set([]);
    return response;
}
export async function kick(accountId) {
    const { members } = await openhackApi.Teams.kick(accountId);
    applyMembers(members);
    return getTeam();
}
