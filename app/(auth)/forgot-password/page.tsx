"use client";

import { useActionState } from "react";
import Link from "next/link";
import { requestPasswordReset, type AuthState } from "@/lib/actions/auth";
import { AuthCard, AuthField, DevMailHint, authSubmitClass } from "@/components/auth/AuthCard";

const initial: AuthState = {};

export default function ForgotPasswordPage() {
  const [state, action, pending] = useActionState(requestPasswordReset, initial);
  return (
    <AuthCard
      title="Lupa password"
      sub="Masukkan email kamu, kami kirim tautan untuk mengatur ulang password."
    >
      {state.ok ? (
        <div className="space-y-4">
          <p role="status" className="text-sm text-accent">
            Tautan reset sudah dikirim. Cek email kamu.
          </p>
          <DevMailHint />
          <Link href="/login" className="text-sm text-muted hover:text-accent">
            Kembali ke halaman masuk
          </Link>
        </div>
      ) : (
        <form action={action} className="space-y-5">
          <AuthField label="Email" icon="mail" name="email" type="email" placeholder="kamu@email.com" autoComplete="email" required />
          {state.error && <p role="alert" className="text-sm text-red-400">{state.error}</p>}
          <button type="submit" disabled={pending} className={authSubmitClass}>
            {pending ? "Mengirim…" : "Kirim tautan reset"}
          </button>
          <p className="text-center text-sm text-muted">
            <Link href="/login" className="text-accent hover:underline">
              Kembali ke masuk
            </Link>
          </p>
        </form>
      )}
    </AuthCard>
  );
}
