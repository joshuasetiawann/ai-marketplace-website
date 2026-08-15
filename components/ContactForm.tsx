"use client";

import { useActionState } from "react";
import Icon from "./Icon";
import { sendContactMessage, type ContactState } from "@/lib/actions/contact";

export default function ContactForm({ defaultName = "", defaultEmail = "" }: { defaultName?: string; defaultEmail?: string }) {
  const [state, action, pending] = useActionState(sendContactMessage, {} as ContactState);

  if (state.ok) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl surface-card p-8 text-center">
        <span className="grid h-14 w-14 place-items-center rounded-full bg-success/10 text-success">
          <Icon name="mark_email_read" size={28} />
        </span>
        <h3 className="font-display text-title-md text-on-surface">Pesan terkirim</h3>
        <p className="text-body-sm text-on-surface-variant">Tim kami akan membalas ke email kamu secepatnya.</p>
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-4 rounded-xl surface-card p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-body-sm font-medium text-on-surface">Nama</span>
          <input name="name" defaultValue={defaultName} placeholder="Nama kamu" className="input-field" required />
        </label>
        <label className="block">
          <span className="mb-2 block text-body-sm font-medium text-on-surface">Email</span>
          <input name="email" type="email" defaultValue={defaultEmail} placeholder="email@kamu.com" className="input-field" required />
        </label>
      </div>
      <label className="block">
        <span className="mb-2 block text-body-sm font-medium text-on-surface">Subjek</span>
        <input name="subject" placeholder="Ada yang bisa kami bantu?" className="input-field" />
      </label>
      <label className="block">
        <span className="mb-2 block text-body-sm font-medium text-on-surface">Pesan</span>
        <textarea name="body" rows={5} placeholder="Ceritakan kebutuhanmu…" className="input-field resize-none" required minLength={10} />
      </label>
      {state.error && <p role="alert" className="text-body-sm text-error">{state.error}</p>}
      <button type="submit" disabled={pending} className="btn-primary self-start px-6 py-3">
        <Icon name="send" size={18} /> {pending ? "Mengirim…" : "Kirim pesan"}
      </button>
    </form>
  );
}
