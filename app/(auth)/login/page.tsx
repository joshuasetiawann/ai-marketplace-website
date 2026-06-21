"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signIn, type AuthState } from "@/lib/actions/auth";
import { AuthCard, AuthField, PasswordField, authSubmitClass } from "@/components/auth/AuthCard";
import Icon from "@/components/Icon";

const initial: AuthState = {};

export default function LoginPage() {
  const [state, action, pending] = useActionState(signIn, initial);
  return (
    <AuthCard tab="login" title="Selamat datang kembali" sub="Masuk ke akun Nexora AI kamu.">
      <form action={action} className="space-y-5">
        <AuthField label="Email" icon="mail" name="email" type="email" placeholder="kamu@email.com" autoComplete="email" />
        <PasswordField
          name="password"
          placeholder="••••••••"
          autoComplete="current-password"
          right={
            <Link href="/forgot-password" className="text-[12px] text-accent hover:underline">
              Lupa password?
            </Link>
          }
        />
        {state.error && <p role="alert" className="text-sm text-red-400">{state.error}</p>}
        <button type="submit" disabled={pending} className={authSubmitClass}>
          {pending ? "Memproses…" : "Masuk"}
          {!pending && <Icon name="arrow_forward" size={17} />}
        </button>
        <p className="text-center text-sm text-muted">
          Belum punya akun?{" "}
          <Link href="/register" className="font-semibold text-accent hover:underline">
            Daftar gratis
          </Link>
        </p>
      </form>
    </AuthCard>
  );
}
