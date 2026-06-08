"use client";

import { useEffect, useState } from "react";
import Icon from "./Icon";
import { createBrowserClient } from "@/lib/supabase/client";

type Enroll = { factorId: string; qr: string; secret: string };

export default function TwoFactorSettings() {
  const supabase = createBrowserClient();
  const [status, setStatus] = useState<"loading" | "none" | "enrolling" | "enabled">("loading");
  const [factorId, setFactorId] = useState<string | null>(null);
  const [enroll, setEnroll] = useState<Enroll | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const refresh = async () => {
    const { data } = await supabase.auth.mfa.listFactors();
    const totp = data?.totp?.find((f) => f.status === "verified");
    if (totp) {
      setFactorId(totp.id);
      setStatus("enabled");
    } else {
      setStatus("none");
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startEnroll = async () => {
    setError("");
    setBusy(true);
    const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp" });
    setBusy(false);
    if (error) return setError(error.message);
    setEnroll({ factorId: data.id, qr: data.totp.qr_code, secret: data.totp.secret });
    setStatus("enrolling");
  };

  const verify = async () => {
    if (!enroll) return;
    setError("");
    setBusy(true);
    const { data: ch, error: chErr } = await supabase.auth.mfa.challenge({ factorId: enroll.factorId });
    if (chErr) {
      setBusy(false);
      return setError(chErr.message);
    }
    const { error: vErr } = await supabase.auth.mfa.verify({
      factorId: enroll.factorId,
      challengeId: ch.id,
      code: code.trim(),
    });
    setBusy(false);
    if (vErr) return setError(vErr.message);
    setEnroll(null);
    setCode("");
    refresh();
  };

  const disable = async () => {
    if (!factorId) return;
    setBusy(true);
    await supabase.auth.mfa.unenroll({ factorId });
    setBusy(false);
    setStatus("none");
  };

  if (status === "loading") return <p className="text-body-sm text-on-surface-variant">Memuat…</p>;

  if (status === "enabled")
    return (
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-2 text-body-sm text-success">
          <Icon name="verified_user" size={18} fill /> 2FA aktif
        </span>
        <button onClick={disable} disabled={busy} className="btn-soft px-4 py-2 text-body-sm">
          Nonaktifkan
        </button>
      </div>
    );

  if (status === "enrolling" && enroll)
    return (
      <div className="flex flex-col gap-4">
        <p className="text-body-sm text-on-surface-variant">
          Scan QR ini di aplikasi authenticator (Google Authenticator, Authy), lalu masukkan kode 6 digit.
        </p>
        <div className="flex flex-wrap items-center gap-4">
          {/* qr_code is a data-URI SVG produced by Supabase Auth (trusted source). */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={enroll.qr} alt="Kode QR 2FA" className="h-40 w-40 rounded-lg bg-white p-2" />
          <div className="text-[12px] text-on-surface-variant">
            Atau masukkan kode manual:
            <br />
            <span className="font-mono text-on-surface">{enroll.secret}</span>
          </div>
        </div>
        <div className="flex gap-3">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            inputMode="numeric"
            placeholder="123456"
            className="input-field w-40"
          />
          <button onClick={verify} disabled={busy} className="btn-primary px-6 py-3">
            {busy ? "Memverifikasi…" : "Verifikasi"}
          </button>
        </div>
        {error && <p className="text-body-sm text-error">{error}</p>}
      </div>
    );

  return (
    <div className="flex items-center justify-between">
      <p className="text-body-sm text-on-surface-variant">Tambahkan lapisan keamanan ekstra dengan kode dari aplikasi authenticator.</p>
      <button onClick={startEnroll} disabled={busy} className="btn-soft px-4 py-2 text-body-sm">
        {busy ? "…" : "Aktifkan 2FA"}
      </button>
      {error && <p className="text-body-sm text-error">{error}</p>}
    </div>
  );
}
