import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import * as apiClient from "../src/lib/apiClient";

describe("apiClient token behavior", () => {
  let storageMock: any;

  beforeEach(() => {
    storageMock = {
      setItem: vi.fn(),
      removeItem: vi.fn(),
      getItem: vi.fn(() => null),
    };
    // stub global localStorage for Node environment
    vi.stubGlobal("localStorage", storageMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("sets and clears token in localStorage and axios defaults", () => {
    apiClient.setAuthToken("foo");
    expect(storageMock.setItem).toHaveBeenCalledWith("auth_token", "foo");
    apiClient.setAuthToken(null);
    expect(storageMock.removeItem).toHaveBeenCalledWith("auth_token");
  });
});
