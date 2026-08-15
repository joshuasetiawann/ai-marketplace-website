import Link from "next/link";
import { createServerClient } from "@/lib/supabase/server";
import { AuthCard } from "@/components/auth/AuthCard";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";

export const metadata = { title: "Atur password baru — Nexora AI" };

/**
 * Landing page for the emailed reset link.
 *
 * Rendered on the server so the recovery session is checked before the form is
 * drawn: opening this URL without one (expired link, or just typing the path)
 * used to show a form that looked fine and failed on every submit, with nothing
 * explaining why. The check mirrors updatePassword()'s rule exactly — a session
 * carrying a `password` amr entry is an ordinary login, not a recovery.
 */
export default async function ResetPasswordPage() {
  const supabase = await createServerClient();
  const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  const methods = (aal?.currentAuthenticationMethods ?? []).map((m) =>
    typeof m === "string" ? m : m.method,
  );
  const canReset = methods.length > 0 && !methods.includes("password");

  if (!canReset) {
    return (
      <AuthCard
        title="Tautan tidak berlaku"
        sub="Tautan reset password sudah kedaluwarsa atau sudah pernah dipakai."
      >
        <div className="space-y-4">
          <p className="text-sm text-muted">
            Minta tautan baru, lalu buka dari email yang sama di peramban ini.
          </p>
          <Link href="/forgot-password" className="block text-sm text-accent hover:underline">
            Minta tautan reset baru
          </Link>
          <p className="text-sm text-muted">
            Sudah ingat passwordmu?{" "}
            <Link href="/login" className="text-accent hover:underline">
              Masuk
            </Link>
            . Mau ganti password akun yang sedang masuk? Buka{" "}
            <Link href="/settings" className="text-accent hover:underline">
              Pengaturan
            </Link>
            .
          </p>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Atur password baru" sub="Buat password baru untuk akun kamu.">
      <ResetPasswordForm />
    </AuthCard>
  );
}
