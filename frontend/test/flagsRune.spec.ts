import { beforeEach, describe, expect, it, vi } from "vitest";
import { get } from "svelte/store";

import api from "../src/lib/apiClient";
import {
  flagsRune,
  fetchFlags,
  configurePolling,
  startPolling,
  stopPolling,
  subscribeWs,
} from "../src/runes/flagsRune";

// Use fake timers to exercise polling without waiting in real time
vi.useFakeTimers();

// Mock network client so fetchFlags resolves synchronously with provided data
vi.mock("../src/lib/apiClient", () => ({
  default: {
    get: vi.fn(),
  },
}));

describe("flagsRune", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    flagsRune.set(null);
    configurePolling(10); // small interval for tests
  });

  /**
   * fetchFlags()
   * - Ensures the API path is used and the flagsRune store is updated.
   */
  it("fetchFlags() calls api and updates store", async () => {
    const flags = {
      flags: { a: true },
      stage: { id: "s", name: "S", turnoff: [], turnon: [] },
    };
    (api.get as any).mockResolvedValue({ data: flags });
    const res = await fetchFlags();
    expect(api.get).toHaveBeenCalledWith("/accounts/flags");
    expect(get(flagsRune)).toEqual(flags);
    expect(res).toEqual(flags);
  });

  /**
   * startPolling/stopPolling()
   * - Verifies polling triggers repeated fetches and can be stopped.
   */
  it("startPolling/stopPolling repeatedly calls fetchFlags", async () => {
    (api.get as any).mockResolvedValue({
      data: {
        flags: {},
        stage: { id: "s", name: "S", turnoff: [], turnon: [] },
      },
    });
    startPolling();
    // advance timers a few intervals
    vi.advanceTimersByTime(50);
    expect(api.get).toHaveBeenCalled();
    stopPolling();
    const called = (api.get as any).mock.calls.length;
    vi.advanceTimersByTime(50);
    // no additional calls after stop
    expect((api.get as any).mock.calls.length).toBe(called);
  });

  /**
   * subscribeWs()
   * - Currently a placeholder; ensure it returns an unsubscribe function.
   */
  it("subscribeWs() returns unsubscribe function placeholder", () => {
    const unsub = subscribeWs();
    expect(typeof unsub).toBe("function");
  });
});
