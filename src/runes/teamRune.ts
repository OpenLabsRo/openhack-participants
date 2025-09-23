import { writable } from 'svelte/store'
import { setAuthToken } from '../lib/apiClient.js'
import type { Team } from '../types/team.js'
import type { Account } from '../types/account.js'
import {
  openhackApi,
  type AccountTokenResponse,
  type AccountMembersResponse,
  type TeamMembersResponse,
} from '../lib/api/openhackApi.js'
import { accountRune } from './accountRune.js'

export const teamRune = writable<Team | null>(null)
export const teamMembersRune = writable<Account[]>([])

async function refreshAuth({ token, account }: AccountTokenResponse) {
  setAuthToken(token)
  accountRune.set(account)
}

function applyMembers(members: Account[]) {
  teamMembersRune.set(members)
}

export async function getTeam() {
  const team = await openhackApi.Teams.detail()
  teamRune.set(team)
  return team
}

export async function loadMembers() {
  const members = await openhackApi.Teams.members()
  applyMembers(members)
  return members
}

export async function createTeam(name: string) {
  const response = await openhackApi.Teams.create(name)
  await refreshAuth(response)
  const team = await getTeam()
  await loadMembers()
  return team
}

export async function renameTeam(name: string) {
  const team = await openhackApi.Teams.rename({ name })
  teamRune.set(team)
  return team
}

export async function deleteTeam() {
  const response = await openhackApi.Teams.remove()
  await refreshAuth(response)
  teamRune.set(null)
  teamMembersRune.set([])
  return response
}

export async function join(teamId: string) {
  const response: AccountMembersResponse = await openhackApi.Teams.join(teamId)
  await refreshAuth(response)
  applyMembers(response.members)
  return getTeam()
}

export async function leave() {
  const response: AccountMembersResponse = await openhackApi.Teams.leave()
  await refreshAuth(response)
  teamRune.set(null)
  teamMembersRune.set([])
  return response
}

export async function kick(accountId: string) {
  const { members }: TeamMembersResponse = await openhackApi.Teams.kick(accountId)
  applyMembers(members)
  return getTeam()
}
