"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase/client";
import { AuthCard, fieldClass } from "@/components/auth/AuthCard";

export default function TwoFactorChallengePage() {
  const router = useRouter();
  const supabase = createBrowserClient();
  const [factorId, setFactorId] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.mfa.listFactors();
      const totp = data?.totp?.find((f) => f.status === "verified");
      if (totp) setFactorId(totp.id);
      else router.replace("/dashboard"); // no factor — nothing to step up
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!factorId) return;
    setError("");
    setBusy(true);
    const { data: ch, error: chErr } = await supabase.auth.mfa.challenge({ factorId });
    if (chErr) {
      setBusy(false);
      return setError(chErr.message);
    }
    const { error: vErr } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: ch.id,
      code: code.trim(),
    });
    setBusy(false);
    if (vErr) return setError("Kode salah atau kedaluwarsa. Coba lagi.");
    router.replace("/dashboard");
    router.refresh();
  }

  return (
    <AuthCard title="Verifikasi dua langkah" sub="Masukkan kode 6 digit dari aplikasi authenticator kamu.">
      <form onSubmit={submit} className="space-y-4">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder="123456"
          aria-label="Kode 2FA"
          className={fieldClass}
        />
        {error && (
          <p role="alert" className="text-sm text-red-400">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={busy || !factorId}
          className="w-full rounded-lg bg-accent py-3 font-semibold text-base transition hover:brightness-110 disabled:opacity-60"
        >
          {busy ? "Memverifikasi…" : "Verifikasi"}
        </button>
      </form>
    </AuthCard>
  );
}
