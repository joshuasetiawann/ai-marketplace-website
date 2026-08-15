"use client";

import { useActionState, useState } from "react";
import Icon from "./Icon";
import { deleteAccount, type AccountState } from "@/lib/actions/account";

export default function DeleteAccountForm() {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(deleteAccount, {} as AccountState);

  if (!open) {
    return (
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-body-sm text-on-surface-variant">
          Menghapus akun bersifat permanen dan tidak dapat dibatalkan.
        </p>
        <button onClick={() => setOpen(true)} className="btn-soft px-4 py-2 text-body-sm text-error">
          <Icon name="delete_forever" size={16} /> Hapus akun
        </button>
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-3">
      <p className="text-body-sm text-error">
        Ini akan menghapus akunmu secara permanen. Masukkan password untuk konfirmasi.
      </p>
      <input name="current" type="password" autoComplete="current-password" placeholder="Password" className="input-field" required />
      <div className="flex gap-2">
        <button type="submit" disabled={pending} className="btn-soft px-4 py-2 text-body-sm text-error">
          {pending ? "Menghapus…" : "Hapus permanen"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="btn-soft px-4 py-2 text-body-sm">
          Batal
        </button>
      </div>
      {state.error && <p role="alert" className="text-body-sm text-error">{state.error}</p>}
    </form>
  );
}
