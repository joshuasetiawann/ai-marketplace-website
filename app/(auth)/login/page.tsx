"use client";

import { Suspense, useActionState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signIn, type AuthState } from "@/lib/actions/auth";
import { AuthCard, AuthField, PasswordField, authSubmitClass } from "@/components/auth/AuthCard";
import Icon from "@/components/Icon";

const initial: AuthState = {};

/**
 * Carries the `?next=` the route guard set, so signing in returns the user to
 * the page they asked for instead of dumping everyone on the dashboard. Kept in
 * its own Suspense boundary so reading search params doesn't make /login dynamic.
 */
function NextField() {
  const next = useSearchParams().get("next") ?? "";
  return <input type="hidden" name="next" value={next} />;
}

export default function LoginPage() {
  const [state, action, pending] = useActionState(signIn, initial);
  return (
    <AuthCard tab="login" title="Selamat datang kembali" sub="Masuk ke akun Nexora AI kamu.">
      <form action={action} className="space-y-5">
        <Suspense fallback={null}>
          <NextField />
        </Suspense>
        {/* "Email atau password salah" deliberately does not say which, so it is
            bound to both fields — a screen reader otherwise announces the error
            with nothing to tie it to. */}
        <AuthField
          label="Email"
          icon="mail"
          name="email"
          type="email"
          placeholder="kamu@email.com"
          autoComplete="email"
          required
          aria-invalid={!!state.error}
          aria-describedby={state.error ? "login-error" : undefined}
        />
        <PasswordField
          name="password"
          placeholder="••••••••"
          autoComplete="current-password"
          required
          aria-invalid={!!state.error}
          aria-describedby={state.error ? "login-error" : undefined}
          right={
            <Link href="/forgot-password" className="text-[12px] text-accent hover:underline">
              Lupa password?
            </Link>
          }
        />
        {state.error && (
          <p id="login-error" role="alert" className="text-sm text-red-400">
            {state.error}
          </p>
        )}
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
