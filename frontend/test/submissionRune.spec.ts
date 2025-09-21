import { beforeEach, describe, expect, it, vi } from "vitest";
import { get } from "svelte/store";

import api from "../src/lib/apiClient";
import {
  submissionRune,
  updateName,
  updateDesc,
  updateRepo,
  updatePres,
} from "../src/runes/submissionRune";
import { teamRune } from "../src/runes/teamRune";

// Mock network interactions; tests assert that the proper endpoints are used
vi.mock("../src/lib/apiClient", () => ({
  default: {
    get: vi.fn(),
    patch: vi.fn(),
  },
}));

describe("submissionRune", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    submissionRune.set(null);
    teamRune.set(null);
  });

  /**
   * updateName()
   * - Verifies that updating the name issues a PATCH to the correct path
   *   and that the subsequent refresh updates both teamRune and submissionRune.
   */
  it("updateName() patches then refreshes team and submission", async () => {
    (api.patch as any).mockResolvedValue({ data: { ok: true } });
    const refreshed = {
      id: "t",
      name: "T",
      members: [],
      submission: { name: "N", desc: "D", repo: "R", pres: "P" },
      deleted: false,
    };
    (api.get as any).mockResolvedValue({ data: refreshed });
    const res = await updateName("N");
    expect(api.patch).toHaveBeenCalledWith("/teams/submissions/name", {
      name: "N",
    });
    expect(get(teamRune)).toEqual(refreshed);
    expect(get(submissionRune)).toEqual(refreshed.submission);
    expect(res).toEqual({ ok: true });
  });

  /**
   * updateDesc()
   * - Same pattern as updateName(); ensures desc patch and refresh happen.
   */
  it("updateDesc() patches then refreshes team and submission", async () => {
    (api.patch as any).mockResolvedValue({ data: { ok: true } });
    const refreshed = {
      id: "t",
      name: "T",
      members: [],
      submission: { name: "N", desc: "D", repo: "R", pres: "P" },
      deleted: false,
    };
    (api.get as any).mockResolvedValue({ data: refreshed });
    const res = await updateDesc("D");
    expect(api.patch).toHaveBeenCalledWith("/teams/submissions/desc", {
      desc: "D",
    });
    expect(get(teamRune)).toEqual(refreshed);
    expect(get(submissionRune)).toEqual(refreshed.submission);
    expect(res).toEqual({ ok: true });
  });

  /**
   * updateRepo()
   */
  it("updateRepo() patches then refreshes team and submission", async () => {
    (api.patch as any).mockResolvedValue({ data: { ok: true } });
    const refreshed = {
      id: "t",
      name: "T",
      members: [],
      submission: { name: "N", desc: "D", repo: "R", pres: "P" },
      deleted: false,
    };
    (api.get as any).mockResolvedValue({ data: refreshed });
    const res = await updateRepo("R");
    expect(api.patch).toHaveBeenCalledWith("/teams/submissions/repo", {
      repo: "R",
    });
    expect(get(teamRune)).toEqual(refreshed);
    expect(get(submissionRune)).toEqual(refreshed.submission);
    expect(res).toEqual({ ok: true });
  });

  /**
   * updatePres()
   */
  it("updatePres() patches then refreshes team and submission", async () => {
    (api.patch as any).mockResolvedValue({ data: { ok: true } });
    const refreshed = {
      id: "t",
      name: "T",
      members: [],
      submission: { name: "N", desc: "D", repo: "R", pres: "P" },
      deleted: false,
    };
    (api.get as any).mockResolvedValue({ data: refreshed });
    const res = await updatePres("P");
    expect(api.patch).toHaveBeenCalledWith("/teams/submissions/pres", {
      pres: "P",
    });
    expect(get(teamRune)).toEqual(refreshed);
    expect(get(submissionRune)).toEqual(refreshed.submission);
    expect(res).toEqual({ ok: true });
  });
});
