"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registerUser, type AuthState } from "@/lib/actions/auth";
import { AuthCard, fieldClass } from "@/components/auth/AuthCard";

const initial: AuthState = {};

export default function RegisterPage() {
  const [state, action, pending] = useActionState(registerUser, initial);
  return (
    <AuthCard title="Buat akun" sub="Gratis. Belanja & jual model AI dalam satu akun.">
      <form action={action} className="space-y-4">
        <input name="name" placeholder="Nama lengkap" aria-label="Nama lengkap" autoComplete="name" className={fieldClass} />
        <input name="email" type="email" placeholder="Email" aria-label="Email" autoComplete="email" className={fieldClass} />
        <input
          name="password"
          type="password"
          placeholder="Password (min. 8 karakter)"
          aria-label="Password"
          autoComplete="new-password"
          className={fieldClass}
        />
        {state.error && <p role="alert" className="text-sm text-red-400">{state.error}</p>}
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-lg bg-accent py-3 font-semibold text-base transition hover:brightness-110 disabled:opacity-60"
        >
          {pending ? "Memproses…" : "Daftar"}
        </button>
        <p className="text-center text-sm text-muted">
          Sudah punya akun?{" "}
          <Link href="/login" className="text-accent hover:underline">
            Masuk
          </Link>
        </p>
      </form>
    </AuthCard>
  );
}
