"use client";

import { useActionState } from "react";
import { updatePassword, type AuthState } from "@/lib/actions/auth";
import { AuthCard, fieldClass } from "@/components/auth/AuthCard";

const initial: AuthState = {};

export default function ResetPasswordPage() {
  const [state, action, pending] = useActionState(updatePassword, initial);
  return (
    <AuthCard title="Atur password baru" sub="Buat password baru untuk akun kamu.">
      <form action={action} className="space-y-4">
        <input
          name="password"
          type="password"
          placeholder="Password baru (min. 8 karakter)"
          aria-label="Password baru"
          autoComplete="new-password"
          className={fieldClass}
        />
        {state.error && <p role="alert" className="text-sm text-red-400">{state.error}</p>}
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-lg bg-accent py-3 font-semibold text-base transition hover:brightness-110 disabled:opacity-60"
        >
          {pending ? "Menyimpan…" : "Simpan password"}
        </button>
      </form>
    </AuthCard>
  );
}
