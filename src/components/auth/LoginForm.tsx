"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type LoginFormProps = {
  redirectTo?: string;
};

export default function LoginForm({ redirectTo = "/" }: LoginFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);
    const username = String(formData.get("username") || "").trim();
    const password = String(formData.get("password") || "");

    if (!username || !password) {
      setError("Please enter both username and password.");
      return;
    }

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      setError(body.error || "Could not log in with those credentials.");
      return;
    }

    startTransition(() => {
      router.push(redirectTo || "/");
      router.refresh();
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-sm space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-lg"
    >
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-semibold text-slate-900">Sign in</h1>
        <p className="text-sm text-slate-600">
          Use your LASA credentials to access the waybill system.
        </p>
      </div>

      <div className="space-y-4">
        <label className="flex flex-col gap-2 text-sm text-slate-700">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">
            Username / Email
          </span>
          <input
            name="username"
            type="text"
            autoComplete="username"
            className="form-input"
            placeholder="support@lasa.africa"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm text-slate-700">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">
            Password
          </span>
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            className="form-input"
            placeholder="••••••••"
          />
        </label>
      </div>

      {error && (
        <p className="rounded-lg bg-rose-100 px-3 py-2 text-sm text-rose-700">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}

