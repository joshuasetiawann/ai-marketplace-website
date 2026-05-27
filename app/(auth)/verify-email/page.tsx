import Link from "next/link";
import { MailCheck } from "lucide-react";
import { AuthCard } from "@/components/auth/AuthCard";

export default function VerifyEmailPage() {
  return (
    <AuthCard
      title="Cek email kamu"
      sub="Kami mengirim tautan verifikasi. Klik tautan itu untuk mengaktifkan akun, lalu masuk."
    >
      <div className="flex flex-col items-center gap-4 py-2 text-center">
        <span className="grid h-14 w-14 place-items-center rounded-full bg-accent/10 text-accent">
          <MailCheck className="h-7 w-7" strokeWidth={1.75} />
        </span>
        <p className="text-sm text-muted">
          Tidak menerima email? Periksa folder spam, atau coba daftar ulang.
        </p>
        <Link href="/login" className="text-sm font-medium text-accent hover:underline">
          Lanjut ke halaman masuk
        </Link>
      </div>
    </AuthCard>
  );
}
