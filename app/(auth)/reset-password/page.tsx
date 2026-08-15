"use client";

import { useActionState } from "react";
import { updatePassword, type AuthState } from "@/lib/actions/auth";
import { AuthCard, PasswordField, authSubmitClass } from "@/components/auth/AuthCard";

const initial: AuthState = {};

export default function ResetPasswordPage() {
  const [state, action, pending] = useActionState(updatePassword, initial);
  return (
    <AuthCard title="Atur password baru" sub="Buat password baru untuk akun kamu.">
      <form action={action} className="space-y-5">
        <PasswordField
          label="Password Baru"
          name="password"
          placeholder="Min. 8 karakter"
          autoComplete="new-password"
          required
          minLength={8}
          aria-invalid={!!state.error}
          aria-describedby={state.error ? "reset-error" : undefined}
        />
        {state.error && (
          <p id="reset-error" role="alert" className="text-sm text-red-400">
            {state.error}
          </p>
        )}
        <button type="submit" disabled={pending} className={authSubmitClass}>
          {pending ? "Menyimpan…" : "Simpan password"}
        </button>
      </form>
    </AuthCard>
  );
}
