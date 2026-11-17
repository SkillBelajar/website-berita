"use client";

export interface AuthState {
  token: string | null;
  role: string | null;
  name: string | null;
  email: string | null;
}

export function saveAuth(token: string, role: string, name?: string, email?: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem("auth_token", token);
  localStorage.setItem("auth_role", role);
  if (name) localStorage.setItem("auth_name", name);
  if (email) localStorage.setItem("auth_email", email);

  // Simpan juga ke document.cookie agar persist
  document.cookie = `auth_token=${token}; path=/; max-age=86400; SameSite=Lax`;

  window.dispatchEvent(new Event("auth-changed"));
}

export function getAuth(): AuthState {
  if (typeof window === "undefined") {
    return { token: null, role: null, name: null, email: null };
  }

  return {
    token: localStorage.getItem("auth_token"),
    role: localStorage.getItem("auth_role"),
    name: localStorage.getItem("auth_name") || "Pengguna",
    email: localStorage.getItem("auth_email"),
  };
}

export function clearAuth() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("auth_token");
  localStorage.removeItem("auth_role");
  localStorage.removeItem("auth_name");
  localStorage.removeItem("auth_email");

  document.cookie = "auth_token=; path=/; max-age=0";
  window.dispatchEvent(new Event("auth-changed"));
}
