import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Icon from "@/components/Icon";

/**
 * Legal pages. These existed as dead <span>s in the footer, and checkout asked
 * buyers to tick "I agree to the Terms" styled like a link that went nowhere —
 * not a great look for a marketplace taking real payments.
 *
 * Plain content, one route, no CMS: the point is that the documents are
 * reachable and quotable, not that they are editable from an admin screen.
 */
const DOCS = {
  privasi: {
    title: "Kebijakan Privasi",
    intro:
      "Ringkasan bagaimana Nexora AI mengumpulkan, memakai, dan melindungi datamu.",
    sections: [
      {
        h: "Data yang kami kumpulkan",
        p: [
          "Data akun: nama tampilan, alamat email, dan kata sandi yang disimpan dalam bentuk hash oleh penyedia autentikasi kami — kami tidak pernah menyimpan kata sandi asli.",
          "Data transaksi: pesanan, item, metode pembayaran yang dipilih, dan status pembayaran.",
          "Data penjual: nama toko, kategori, dan rekening pencairan (nomor rekening disimpan dalam bentuk tersamar, hanya empat digit terakhir yang ditampilkan).",
        ],
      },
      {
        h: "Bagaimana data dipakai",
        p: [
          "Menjalankan marketplace: menampilkan katalog, memproses pesanan, mengirim model yang kamu beli, dan mencairkan pendapatan penjual.",
          "Menjaga keamanan: mendeteksi penyalahgunaan, membatasi laju permintaan, dan memverifikasi identitas saat kamu mengubah data sensitif.",
          "Kami tidak menjual data pribadimu.",
        ],
      },
      {
        h: "Siapa yang bisa melihat apa",
        p: [
          "Akses data dibatasi di tingkat basis data, bukan hanya di antarmuka. Kamu hanya bisa membaca baris milikmu sendiri; penjual hanya melihat penjualan produknya; hanya admin yang bisa membaca antrian moderasi dan pesan dukungan.",
          "Nama tampilan dan ulasanmu bersifat publik. Email, pesanan, dan rekeningmu tidak.",
        ],
      },
      {
        h: "Menghapus akun",
        p: [
          "Kamu bisa menghapus akun dari halaman Pengaturan setelah memasukkan kata sandi. Catatan keuangan yang wajib disimpan (penjualan dan pencairan) tetap ada — akun penjual dengan riwayat transaksi perlu proses penutupan toko lewat dukungan.",
        ],
      },
    ],
  },
  ketentuan: {
    title: "Syarat & Ketentuan",
    intro: "Aturan main untuk pembeli dan penjual di Nexora AI.",
    sections: [
      {
        h: "Akun",
        p: [
          "Satu akun bisa berbelanja sekaligus berjualan. Kamu bertanggung jawab menjaga kerahasiaan kata sandi dan disarankan mengaktifkan autentikasi dua langkah.",
          "Dilarang membuat akun untuk menyamar sebagai orang atau organisasi lain.",
        ],
      },
      {
        h: "Membeli",
        p: [
          "Harga ditampilkan dalam Rupiah dan sudah termasuk PPN 11% pada total akhir.",
          "Produk digital dikirim melalui kunci lisensi dan/atau tautan akses di halaman Library setelah pembayaran dikonfirmasi.",
          "Ulasan hanya dapat ditulis oleh pembeli yang sudah membayar produk tersebut, satu ulasan per produk per akun.",
        ],
      },
      {
        h: "Menjual",
        p: [
          "Setiap produk melewati moderasi sebelum terbit. Penjual tidak dapat menerbitkan produknya sendiri.",
          "Komisi platform sebesar 20% dari nilai transaksi kotor; 80% menjadi pendapatan bersih penjual.",
          "Pencairan minimum 50 USD dan hanya bisa dilakukan ke rekening yang sudah terdaftar. Saldo yang dapat dicairkan adalah pendapatan bersih dikurangi pencairan yang sudah diminta.",
          "Menjual model yang melanggar hak pihak lain, atau menautkan berkas berbahaya, berakibat penurunan produk dan penutupan toko.",
        ],
      },
      {
        h: "Pengembalian dana",
        p: [
          "Pengembalian dana untuk produk digital diproses melalui dukungan, dengan penilaian kasus per kasus.",
          "Pesanan yang dikembalikan membatalkan akses ke aset dan menarik kembali atribusi pendapatan penjual.",
        ],
      },
    ],
  },
  keamanan: {
    title: "Keamanan",
    intro: "Bagaimana Nexora AI menjaga akun, data, dan uangmu.",
    sections: [
      {
        h: "Akun",
        p: [
          "Sesi disimpan sebagai cookie httpOnly, bukan di penyimpanan peramban yang bisa dibaca skrip.",
          "Autentikasi dua langkah (TOTP) tersedia di Pengaturan. Mengaktifkan maupun menonaktifkannya sama-sama memerlukan kode dari aplikasi authenticator.",
          "Mengganti kata sandi atau menghapus akun memerlukan kata sandi saat ini. Tautan reset kata sandi hanya berlaku untuk sesi yang berasal dari email tersebut.",
        ],
      },
      {
        h: "Data",
        p: [
          "Kontrol akses ditegakkan oleh basis data melalui row-level security, sehingga permintaan yang tidak berhak tidak pernah mendapatkan barisnya — bukan sekadar disembunyikan oleh antarmuka.",
          "Jalur uang (checkout, pengembalian dana, pencairan) berjalan sebagai fungsi tepercaya di basis data; klien tidak dapat membuat pesanan atau pencairan secara langsung.",
        ],
      },
      {
        h: "Melaporkan kerentanan",
        p: [
          "Menemukan celah keamanan? Kirim detailnya lewat halaman Kontak dengan subjek “Laporan Keamanan”. Mohon jangan mengumumkannya sebelum kami sempat memperbaiki.",
        ],
      },
    ],
  },
} as const;

type Doc = keyof typeof DOCS;

export function generateStaticParams() {
  return Object.keys(DOCS).map((doc) => ({ doc }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ doc: string }>;
}): Promise<Metadata> {
  const { doc } = await params;
  const entry = DOCS[doc as Doc];
  if (!entry) return { title: "Dokumen tidak ditemukan — Nexora AI" };
  return {
    title: `${entry.title} — Nexora AI`,
    description: entry.intro,
    alternates: { canonical: `/legal/${doc}` },
  };
}

export default async function LegalPage({ params }: { params: Promise<{ doc: string }> }) {
  const { doc } = await params;
  const entry = DOCS[doc as Doc];
  if (!entry) notFound();

  return (
    <div className="mx-auto max-w-3xl px-5 py-10 md:px-16">
      <nav className="mb-6 flex items-center gap-2 text-body-sm text-on-surface-variant">
        <Link href="/" className="hover:text-on-surface">
          Beranda
        </Link>
        <Icon name="chevron_right" size={16} />
        <span className="text-on-surface">{entry.title}</span>
      </nav>

      <p className="mb-2 eyebrow-mono">
        <span className="mr-1 opacity-60">{"//"}</span>Dokumen
      </p>
      <h1 className="font-display text-headline-md text-on-surface md:text-headline-lg">{entry.title}</h1>
      <p className="mt-3 text-body-lg text-on-surface-variant">{entry.intro}</p>

      <div className="mt-10 flex flex-col gap-8">
        {entry.sections.map((s) => (
          <section key={s.h}>
            <h2 className="mb-3 font-display text-title-md text-on-surface">{s.h}</h2>
            <div className="flex flex-col gap-3">
              {s.p.map((line) => (
                <p key={line} className="text-body-md leading-relaxed text-on-surface-variant">
                  {line}
                </p>
              ))}
            </div>
          </section>
        ))}
      </div>

      <p className="mt-12 border-t pt-6 text-body-sm text-on-surface-variant hairline">
        Ada yang belum jelas?{" "}
        <Link href="/contact" className="text-primary-container hover:underline">
          Hubungi kami
        </Link>
        .
      </p>
    </div>
  );
}
