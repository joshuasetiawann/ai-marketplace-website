import Icon from "@/components/Icon";
import { EmptyState } from "@/components/common";
import { createServerClient } from "@/lib/supabase/server";

export const metadata = { title: "Pesan Masuk — Console" };

export default async function AdminMessagesPage() {
  const supabase = await createServerClient();
  const { data } = await supabase
    .from("contact_messages")
    .select("id,name,email,subject,body,created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  const messages = data ?? [];

  return (
    <div className="flex flex-col gap-6">
      <h2 className="font-display text-title-md text-on-surface">Pesan Masuk</h2>

      {messages.length === 0 ? (
        <EmptyState icon="forum" title="Belum ada pesan" message="Pesan dari halaman Hubungi Kami akan muncul di sini." />
      ) : (
        <div className="flex flex-col gap-3">
          {messages.map((m) => (
            <div key={m.id} className="rounded-xl surface-card p-5">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-body-md font-semibold text-on-surface">{m.subject || "(tanpa subjek)"}</p>
                  <p className="text-[12px] text-on-surface-variant">
                    {m.name} ·{" "}
                    <a href={`mailto:${m.email}`} className="text-primary-container hover:underline">
                      {m.email}
                    </a>
                  </p>
                </div>
                <span className="text-[12px] text-outline">
                  {new Date(m.created_at).toLocaleString("id-ID")}
                </span>
              </div>
              <p className="whitespace-pre-line text-body-sm text-on-surface-variant">{m.body}</p>
              <a href={`mailto:${m.email}?subject=Re: ${encodeURIComponent(m.subject || "Pesan kamu")}`} className="mt-3 inline-flex items-center gap-1 text-body-sm text-primary-container hover:underline">
                <Icon name="reply" size={16} /> Balas
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
