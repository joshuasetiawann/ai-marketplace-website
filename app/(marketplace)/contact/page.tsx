import type { Metadata } from "next";
import Icon from "@/components/Icon";
import ContactForm from "@/components/ContactForm";
import { createServerClient, getCurrentUser } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Hubungi Kami — Nexora AI",
  description: "Punya pertanyaan tentang Nexora AI? Kirim pesan ke tim kami.",
};

export default async function ContactPage() {
  const supabase = await createServerClient();
  const user = await getCurrentUser();
  let name = "";
  if (user) {
    const { data } = await supabase.from("profiles").select("name").eq("id", user.id).single();
    name = data?.name ?? "";
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-12 md:px-8">
      <div className="mb-8">
        <h1 className="font-display text-headline-md text-on-surface md:text-headline-lg">Hubungi kami</h1>
        <p className="mt-2 text-body-md text-on-surface-variant">
          Pertanyaan produk, kerja sama, atau butuh bantuan? Kirim pesan di bawah — atau email{" "}
          <a href="mailto:halo@nexora.ai" className="text-primary-container hover:underline">
            halo@nexora.ai
          </a>
          .
        </p>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        {[
          { icon: "mail", label: "Email", value: "halo@nexora.ai" },
          { icon: "support_agent", label: "Dukungan", value: "Sen–Jum, 09.00–18.00 WIB" },
          { icon: "handshake", label: "Kemitraan", value: "partner@nexora.ai" },
        ].map((c) => (
          <div key={c.label} className="rounded-xl surface-card p-5">
            <Icon name={c.icon} size={20} className="mb-2 text-primary-container" />
            <p className="text-body-sm font-semibold text-on-surface">{c.label}</p>
            <p className="text-[12px] text-on-surface-variant">{c.value}</p>
          </div>
        ))}
      </div>

      <ContactForm defaultName={name} defaultEmail={user?.email ?? ""} />
    </div>
  );
}
