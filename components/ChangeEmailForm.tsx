"use client";

import { useActionState } from "react";
import { changeEmail, type AccountState } from "@/lib/actions/account";

export default function ChangeEmailForm({ current }: { current: string }) {
  const [state, action, pending] = useActionState(changeEmail, {} as AccountState);
  return (
    <form action={action} className="flex flex-col gap-3">
      <p className="text-body-sm text-on-surface-variant">
        Email saat ini: <span className="text-on-surface">{current}</span>
      </p>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="block flex-1">
          <span className="mb-2 block text-body-sm font-medium text-on-surface">Email baru</span>
          <input name="email" type="email" autoComplete="email" placeholder="email@baru.com" className="input-field" required />
        </label>
        <button type="submit" disabled={pending} className="btn-soft px-6 py-3">
          {pending ? "Mengirim…" : "Ubah email"}
        </button>
      </div>
      {state.error && <p role="alert" className="text-body-sm text-error">{state.error}</p>}
      {state.ok && (
        <p role="status" className="text-body-sm text-success">
          Konfirmasi dikirim. Cek email lama dan baru untuk menyelesaikan perubahan.
        </p>
      )}
    </form>
  );
}
