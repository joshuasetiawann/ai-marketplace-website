"use client";

import { useActionState } from "react";
import { updateProfileName, type AccountState } from "@/lib/actions/account";

export default function ProfileNameForm({ initialName }: { initialName: string }) {
  const [state, action, pending] = useActionState(updateProfileName, {} as AccountState);
  return (
    <form action={action} className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <label className="block flex-1">
        <span className="mb-2 block text-body-sm font-medium text-on-surface">Nama tampilan</span>
        <input name="name" defaultValue={initialName} className="input-field" required />
      </label>
      <button type="submit" disabled={pending} className="btn-primary px-6 py-3">
        {pending ? "Menyimpan…" : "Simpan"}
      </button>
      {state.error && <p className="text-body-sm text-error">{state.error}</p>}
      {state.ok && <p className="text-body-sm text-success">Tersimpan.</p>}
    </form>
  );
}
