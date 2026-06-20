"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registerUser, type AuthState } from "@/lib/actions/auth";
import { AuthCard, AuthField, PasswordField, authSubmitClass } from "@/components/auth/AuthCard";
import Icon from "@/components/Icon";

const initial: AuthState = {};

export default function RegisterPage() {
  const [state, action, pending] = useActionState(registerUser, initial);
  return (
    <AuthCard tab="register" title="Buat akun" sub="Gratis. Belanja & jual model AI dalam satu akun.">
      <form action={action} className="space-y-5">
        <AuthField label="Nama Lengkap" icon="person" name="name" placeholder="Nama kamu" autoComplete="name" />
        <AuthField label="Email" icon="mail" name="email" type="email" placeholder="kamu@email.com" autoComplete="email" />
        <PasswordField name="password" placeholder="Min. 8 karakter" autoComplete="new-password" />
        {state.error && <p role="alert" className="text-sm text-red-400">{state.error}</p>}
        <button type="submit" disabled={pending} className={authSubmitClass}>
          {pending ? "Memproses…" : "Daftar"}
          {!pending && <Icon name="arrow_forward" size={17} />}
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
