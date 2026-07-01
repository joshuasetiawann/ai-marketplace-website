import Icon from "@/components/Icon";
import ProfileNameForm from "@/components/ProfileNameForm";
import ChangePasswordForm from "@/components/ChangePasswordForm";
import ChangeEmailForm from "@/components/ChangeEmailForm";
import DeleteAccountForm from "@/components/DeleteAccountForm";
import TwoFactorSettings from "@/components/TwoFactorSettings";
import { createServerClient } from "@/lib/supabase/server";
import { signOutEverywhere } from "@/lib/actions/account";

export const metadata = { title: "Pengaturan — Nexora AI" };

function Section({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl surface-card p-6">
      <h2 className="mb-4 flex items-center gap-2 font-display text-body-lg font-semibold text-on-surface">
        <Icon name={icon} size={20} className="text-primary-container" /> {title}
      </h2>
      {children}
    </section>
  );
}

export default async function SettingsPage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("name").eq("id", user!.id).single();

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-5">
      <h1 className="font-display text-headline-md text-on-surface">Pengaturan</h1>

      <Section title="Profil" icon="person">
        <ProfileNameForm initialName={profile?.name ?? ""} />
      </Section>

      <Section title="Email" icon="mail">
        <ChangeEmailForm current={user!.email ?? ""} />
      </Section>

      <Section title="Password" icon="lock">
        <ChangePasswordForm />
      </Section>

      <Section title="Autentikasi 2 langkah (2FA)" icon="security">
        <TwoFactorSettings />
      </Section>

      <Section title="Keamanan sesi" icon="devices">
        <div className="flex items-center justify-between">
          <p className="text-body-sm text-on-surface-variant">Keluar dari semua perangkat yang sedang masuk.</p>
          <form action={signOutEverywhere}>
            <button className="btn-soft px-4 py-2 text-body-sm text-error">
              <Icon name="logout" size={16} /> Keluar di semua perangkat
            </button>
          </form>
        </div>
      </Section>

      <Section title="Hapus akun" icon="warning">
        <DeleteAccountForm />
      </Section>
    </div>
  );
}
