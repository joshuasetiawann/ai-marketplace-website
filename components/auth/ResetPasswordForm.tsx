"use client";

import { useActionState, useState } from "react";
import { updatePassword, type AuthState } from "@/lib/actions/auth";
import { PasswordField, authSubmitClass } from "@/components/auth/AuthCard";

const initial: AuthState = {};

export default function ResetPasswordForm() {
  const [state, action, pending] = useActionState(updatePassword, initial);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  // On this one screen a typo locks the user out of the account they are trying
  // to recover, so the mismatch is caught here rather than after submit.
  const mismatch = confirm.length > 0 && confirm !== password;
  const message = mismatch ? "Konfirmasi password belum sama." : state.error;

  return (
    <form action={action} className="space-y-5">
      <PasswordField
        label="Password Baru"
        name="password"
        placeholder="Min. 8 karakter"
        autoComplete="new-password"
        required
        minLength={8}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        aria-invalid={!!state.error}
        aria-describedby={message ? "reset-error" : undefined}
      />
      <PasswordField
        label="Ulangi Password Baru"
        name="confirm"
        placeholder="Ketik ulang password"
        autoComplete="new-password"
        required
        minLength={8}
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        aria-invalid={mismatch}
        aria-describedby={message ? "reset-error" : undefined}
      />
      {message && (
        <p id="reset-error" role="alert" className="text-sm text-red-400">
          {message}
        </p>
      )}
      <button type="submit" disabled={pending || mismatch} className={authSubmitClass}>
        {pending ? "Menyimpan…" : "Simpan password"}
      </button>
    </form>
  );
}
