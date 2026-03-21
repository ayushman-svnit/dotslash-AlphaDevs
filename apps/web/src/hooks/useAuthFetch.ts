"use client";

import { auth } from "@/lib/firebase";

/**
 * Returns a fetch wrapper that automatically attaches the Firebase ID token
 * as a Bearer token on every request to the backend.
 */
export function useAuthFetch() {
  const authFetch = async (url: string, options: RequestInit = {}) => {
    const currentUser = auth.currentUser;
    const token = currentUser ? await currentUser.getIdToken() : null;

    return fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        "Content-Type": "application/json",
      },
    });
  };

  return authFetch;
}
