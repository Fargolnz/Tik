const API_BASE = import.meta.env.VITE_API_URL || "/api";

function getToken(): string | null {
  return localStorage.getItem("tik_token");
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  let data: any;
  try {
    data = await res.json();
  } catch {
    const text = await res.text();
    throw new Error(`Server returned ${res.status}: ${text.slice(0, 100)}`);
  }

  if (!res.ok) {
    throw new Error(data.error || "Request failed");
  }

  return data as T;
}

export interface UserData {
  id: number;
  full_name: string;
  phone: string;
  created_at: string;
}

export interface ProfileData {
  user_id: number;
  familyCount: number;
  hasChild: boolean | number;
  childCount: number;
  hasElderly: boolean | number;
  elderlyCount: number;
  hasDisease: boolean | number;
  diseases: string[];
  hasPet: boolean | number;
  petCount: number;
  livingType: string;
  floor: number;
  hasElevator: boolean | number;
  hasToolsKnowledge: boolean | number;
  hasFirstAid: boolean | number;
}

export interface ChecklistItemData {
  id?: number;
  item_id: string;
  title: string;
  description?: string;
  category: string;
  priority: string;
  quantity?: string;
  checked: boolean | number;
  customizable?: boolean | number;
}

export interface ActionItemData {
  id?: number;
  action_id: string;
  phase: string;
  title: string;
  description?: string;
  priority: string;
  checked: boolean | number;
}

export const api = {
  auth: {
    register: (data: { full_name: string; phone: string; password: string }) =>
      request<{ user: UserData; token: string }>("/auth/register", {
        method: "POST",
        body: JSON.stringify(data),
      }),

    login: (data: { phone: string; password: string }) =>
      request<{ user: UserData; token: string }>("/auth/login", {
        method: "POST",
        body: JSON.stringify(data),
      }),

    sendOtp: (data: { phone: string; register?: boolean }) =>
      request<{ message: string; code_debug: string }>("/auth/send-otp", {
        method: "POST",
        body: JSON.stringify(data),
      }),

    verifyOtp: (data: { phone: string; code: string }) =>
      request<{ user: UserData; token: string; is_new: boolean }>(
        "/auth/verify-otp",
        {
          method: "POST",
          body: JSON.stringify(data),
        }
      ),

    forgotPassword: (data: {
      phone: string;
      code: string;
      new_password: string;
    }) =>
      request<{ message: string }>("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify(data),
      }),

    me: () => request<{ user: UserData }>("/auth/me"),

    updateProfile: (data: { full_name: string }) =>
      request<{ user: UserData }>("/auth/profile", {
        method: "PUT",
        body: JSON.stringify(data),
      }),

    changePassword: (data: { current_password: string; new_password: string }) =>
      request<{ message: string }>("/auth/change-password", {
        method: "PUT",
        body: JSON.stringify(data),
      }),

    deleteAccount: () =>
      request<{ message: string }>("/auth/account", {
        method: "DELETE",
      }),
  },

  profile: {
    get: () => request<{ profile: ProfileData | null }>("/profile"),

    save: (data: Partial<ProfileData>) =>
      request<{ profile: ProfileData }>("/profile", {
        method: "PUT",
        body: JSON.stringify(data),
      }),
  },

  checklist: {
    get: () =>
      request<{ items: ChecklistItemData[] }>("/checklist"),

    save: (items: ChecklistItemData[]) =>
      request<{ items: ChecklistItemData[] }>("/checklist", {
        method: "PUT",
        body: JSON.stringify({ items }),
      }),
  },

  actions: {
    get: () => request<{ items: ActionItemData[] }>("/actions"),

    save: (items: ActionItemData[]) =>
      request<{ items: ActionItemData[] }>("/actions", {
        method: "PUT",
        body: JSON.stringify({ items }),
      }),
  },
};

export function setToken(token: string) {
  localStorage.setItem("tik_token", token);
}

export function clearToken() {
  localStorage.removeItem("tik_token");
}

export function getStoredToken(): string | null {
  return localStorage.getItem("tik_token");
}
