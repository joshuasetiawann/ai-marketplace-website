"use client";

import { useActionState } from "react";
import { changePassword, type AccountState } from "@/lib/actions/account";

export default function ChangePasswordForm() {
  const [state, action, pending] = useActionState(changePassword, {} as AccountState);
  return (
    <form action={action} className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <label className="block flex-1">
        <span className="mb-2 block text-body-sm font-medium text-on-surface">Password baru</span>
        <input name="password" type="password" autoComplete="new-password" placeholder="Min. 8 karakter" className="input-field" />
      </label>
      <button type="submit" disabled={pending} className="btn-soft px-6 py-3">
        {pending ? "Menyimpan…" : "Ubah password"}
      </button>
      {state.error && <p className="text-body-sm text-error">{state.error}</p>}
      {state.ok && <p className="text-body-sm text-success">Password diperbarui.</p>}
    </form>
  );
}
