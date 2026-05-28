"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signIn, type AuthState } from "@/lib/actions/auth";
import { AuthCard, fieldClass } from "@/components/auth/AuthCard";

const initial: AuthState = {};

export default function LoginPage() {
  const [state, action, pending] = useActionState(signIn, initial);
  return (
    <AuthCard title="Masuk" sub="Selamat datang kembali di Nexora AI.">
      <form action={action} className="space-y-4">
        <input name="email" type="email" placeholder="Email" autoComplete="email" className={fieldClass} />
        <input
          name="password"
          type="password"
          placeholder="Password"
          autoComplete="current-password"
          className={fieldClass}
        />
        {state.error && <p className="text-sm text-red-400">{state.error}</p>}
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-lg bg-accent py-3 font-semibold text-base transition hover:brightness-110 disabled:opacity-60"
        >
          {pending ? "Memproses…" : "Masuk"}
        </button>
        <div className="flex items-center justify-between text-sm">
          <Link href="/register" className="text-accent hover:underline">
            Buat akun
          </Link>
          <Link href="/forgot-password" className="text-muted hover:text-accent">
            Lupa password?
          </Link>
        </div>
      </form>
    </AuthCard>
  );
}
