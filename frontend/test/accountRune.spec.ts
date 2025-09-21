import { beforeEach, describe, expect, it, vi } from "vitest";
import { get } from "svelte/store";

import api, { setAuthToken } from "../src/lib/apiClient";
import {
  accountRune,
  check,
  register,
  login,
  whoami,
  logout,
} from "../src/runes/accountRune";

// Mock the api client to avoid real network calls. We keep the real
// setAuthToken implementation from apiClient because tests verify it is called.
vi.mock("../src/lib/apiClient", async () => {
  const actual = await vi.importActual("../src/lib/apiClient");
  return {
    default: {
      post: vi.fn(),
      get: vi.fn(),
    },
    setAuthToken: actual.setAuthToken,
  };
});

describe("accountRune", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    accountRune.set(null);
  });

  /**
   * check()
   * - Verifies that the check() helper forwards the email to the backend
   *   and returns the parsed response. No state changes expected.
   */
  it("check() calls /accounts/check and returns data", async () => {
    (api.post as any).mockResolvedValue({
      data: { registered: false },
    });
    const res = await check("a@b.com");
    expect(api.post).toHaveBeenCalledWith("/accounts/check", {
      email: "a@b.com",
    });
    expect(res).toEqual({ registered: false });
  });

  /**
   * register()
   * - Ensures register() posts the email/password, then stores the
   *   returned token and account into the client state.
   */
  it("register() posts, sets token and store", async () => {
    const account = {
      id: "1",
      email: "a@b.com",
      password: "",
      name: "A",
      teamID: "",
    };
    (api.post as any).mockResolvedValue({
      data: { token: "tok", account },
    });
    const spy = vi.spyOn(require("../src/lib/apiClient"), "setAuthToken");
    const res = await register("a@b.com", "pass");
    expect(api.post).toHaveBeenCalledWith("/accounts/register", {
      email: "a@b.com",
      password: "pass",
    });
    expect(spy).toHaveBeenCalledWith("tok");
    expect(get(accountRune)).toEqual(account);
    expect(res).toEqual(account);
  });

  /**
   * login()
   * - Similar to register(): posts credentials, stores token and account.
   */
  it("login() posts, sets token and store", async () => {
    const account = {
      id: "2",
      email: "b@b.com",
      password: "",
      name: "B",
      teamID: "",
    };
    (api.post as any).mockResolvedValue({
      data: { token: "tok2", account },
    });
    const spy = vi.spyOn(require("../src/lib/apiClient"), "setAuthToken");
    const res = await login("b@b.com", "pwd");
    expect(api.post).toHaveBeenCalledWith("/accounts/login", {
      email: "b@b.com",
      password: "pwd",
    });
    expect(spy).toHaveBeenCalledWith("tok2");
    expect(get(accountRune)).toEqual(account);
    expect(res).toEqual(account);
  });

  /**
   * whoami()
   * - Fetches the profile for the current token and updates the local store.
   */
  it("whoami() fetches and sets account", async () => {
    const account = {
      id: "3",
      email: "c@c.com",
      password: "",
      name: "C",
      teamID: "",
    };
    (api.get as any).mockResolvedValue({ data: account });
    const res = await whoami();
    expect(api.get).toHaveBeenCalledWith("/accounts/whoami");
    expect(get(accountRune)).toEqual(account);
    expect(res).toEqual(account);
  });

  /**
   * logout()
   * - Confirms the logout helper clears stored token and resets the account store.
   */
  it("logout() clears token and store", () => {
    const spy = vi.spyOn(require("../src/lib/apiClient"), "setAuthToken");
    accountRune.set({
      id: "x",
      email: "e",
      password: "",
      name: "N",
      teamID: "",
    });
    logout();
    expect(spy).toHaveBeenCalledWith(null);
    expect(get(accountRune)).toBeNull();
  });
});
