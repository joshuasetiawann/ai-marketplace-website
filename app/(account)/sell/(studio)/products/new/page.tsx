import Link from "next/link";
import Icon from "@/components/Icon";
import ProductForm from "@/components/ProductForm";

export const metadata = { title: "Produk Baru — Nexora AI" };

export default function NewProductPage() {
  return (
    <div className="flex flex-col gap-6">
      <Link href="/sell/products" className="flex items-center gap-1 text-body-sm text-on-surface-variant hover:text-on-surface">
        <Icon name="arrow_back" size={16} /> Kembali ke produk
      </Link>
      <h2 className="font-display text-title-md text-on-surface">Produk Baru</h2>
      <ProductForm />
    </div>
  );
}
