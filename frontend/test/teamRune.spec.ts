import { beforeEach, describe, expect, it, vi } from "vitest";
import { get } from "svelte/store";

import api from "../src/lib/apiClient";
import {
  teamRune,
  getTeam,
  createTeam,
  join,
  leave,
  kick,
} from "../src/runes/teamRune";

// Mock network client so tests remain deterministic and offline
vi.mock("../src/lib/apiClient", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe("teamRune", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    teamRune.set(null);
  });

  /**
   * getTeam()
   * - Should fetch the team and cache it in teamRune
   */
  it("getTeam() fetches and sets team", async () => {
    const team = {
      id: "t1",
      name: "Team",
      members: [],
      submission: { name: "", desc: "", repo: "", pres: "" },
      deleted: false,
    };
    (api.get as any).mockResolvedValue({ data: team });
    const res = await getTeam();
    expect(api.get).toHaveBeenCalledWith("/teams");
    expect(get(teamRune)).toEqual(team);
    expect(res).toEqual(team);
  });

  /**
   * createTeam()
   * - Should POST a new team name and set the returned team
   */
  it("createTeam() posts and sets team", async () => {
    const team = {
      id: "t2",
      name: "New",
      members: [],
      submission: { name: "", desc: "", repo: "", pres: "" },
      deleted: false,
    };
    (api.post as any).mockResolvedValue({ data: team });
    const res = await createTeam("New");
    expect(api.post).toHaveBeenCalledWith("/teams", { name: "New" });
    expect(get(teamRune)).toEqual(team);
    expect(res).toEqual(team);
  });

  /**
   * join()
   * - Should call the join endpoint and set the team returned
   */
  it("join() posts and sets team", async () => {
    const team = {
      id: "t3",
      name: "Join",
      members: ["1"],
      submission: { name: "", desc: "", repo: "", pres: "" },
      deleted: false,
    };
    (api.post as any).mockResolvedValue({ data: team });
    const res = await join("t3");
    expect(api.post).toHaveBeenCalledWith("/teams/t3/join");
    expect(get(teamRune)).toEqual(team);
    expect(res).toEqual(team);
  });

  /**
   * leave()
   * - Should call leave endpoint and clear local team state
   */
  it("leave() posts and clears team", async () => {
    (api.post as any).mockResolvedValue({ data: { ok: true } });
    teamRune.set({
      id: "t4",
      name: "L",
      members: [],
      submission: { name: "", desc: "", repo: "", pres: "" },
      deleted: false,
    });
    const res = await leave();
    expect(api.post).toHaveBeenCalledWith("/teams/leave");
    expect(get(teamRune)).toBeNull();
    expect(res).toEqual({ ok: true });
  });

  /**
   * kick()
   * - Should call kick and then refresh the team via getTeam()
   */
  it("kick() posts and refreshes team via getTeam", async () => {
    const postRes = { data: { ok: true } };
    const refreshed = {
      id: "t5",
      name: "Refreshed",
      members: [],
      submission: { name: "", desc: "", repo: "", pres: "" },
      deleted: false,
    };
    (api.post as any).mockResolvedValue(postRes);
    (api.get as any).mockResolvedValue({ data: refreshed });
    const res = await kick("acct");
    expect(api.post).toHaveBeenCalledWith("/teams/kick", {
      accountId: "acct",
    });
    // getTeam is called inside kick which sets the team
    expect(get(teamRune)).toEqual(refreshed);
    expect(res).toEqual(postRes.data);
  });
});
