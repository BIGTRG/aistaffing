// @ts-nocheck
// Drop-in replacement for `convex/react` hooks, backed by the Postgres REST API.
// Mirrors the Convex useQuery/useMutation call signatures so admin pages keep
// their original shape while running entirely on our own infrastructure.
import { useCallback, useEffect, useState } from "react";

type FnRef = { path: string };

export const api = {
  addOnServices: {
    listAll: { path: "/admin/addons/services" },
    listActive: { path: "/admin/addons/services-active" },
    listSubscriptions: { path: "/admin/addons/subscriptions" },
    getSubscriptionStats: { path: "/admin/addons/stats" },
  },
  agentWorkforce: {
    getWorkforceStats: { path: "/admin/workforce/stats" },
    listAgents: { path: "/admin/workforce/agents" },
    getAgentSkills: { path: "/admin/workforce/agent-skills" },
    listActivities: { path: "/admin/workforce/activities" },
    listShifts: { path: "/admin/workforce/shifts" },
    listSkillCatalog: { path: "/admin/workforce/skill-catalog" },
    listMessages: { path: "/admin/workforce/messages" },
    listSkillRequests: { path: "/admin/workforce/skill-requests" },
    toggleAgentStatus: { path: "/admin/workforce/agent-status" },
    updateMessageStatus: { path: "/admin/workforce/message-status" },
    updateSkillRequest: { path: "/admin/workforce/skill-request" },
  },
};

// Simple invalidation bus: any mutation triggers a refetch of live queries.
let version = 0;
const listeners = new Set<() => void>();
function bump() {
  version++;
  for (const l of listeners) l();
}

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem("auth_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function useQuery(ref: FnRef, args?: Record<string, unknown> | "skip") {
  const [data, setData] = useState<unknown>(undefined);
  const [v, setV] = useState(version);

  useEffect(() => {
    const l = () => setV((x) => x + 1);
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  }, []);

  const key = args === "skip" ? "skip" : JSON.stringify(args ?? {});

  useEffect(() => {
    if (key === "skip") {
      setData(undefined);
      return;
    }
    let alive = true;
    const params = new URLSearchParams();
    for (const [k, val] of Object.entries(JSON.parse(key))) {
      if (val !== undefined && val !== null) params.set(k, String(val));
    }
    const qs = params.toString();
    fetch(`/api${ref.path}${qs ? `?${qs}` : ""}`, { headers: authHeaders() })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((d) => {
        if (alive) setData(d);
      })
      .catch(() => {
        if (alive) setData(null);
      });
    return () => {
      alive = false;
    };
  }, [ref.path, key, v]);

  return data;
}

export function useMutation(ref: FnRef) {
  return useCallback(
    async (args?: Record<string, unknown>) => {
      const res = await fetch(`/api${ref.path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify(args ?? {}),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error || res.statusText);
      }
      const d = await res.json().catch(() => null);
      bump();
      return d;
    },
    [ref],
  );
}
