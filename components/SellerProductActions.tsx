"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Icon from "./Icon";
import { submitForReview, withdrawProduct, deleteProduct } from "@/lib/actions/products";

export default function SellerProductActions({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const run = (fn: (id: string) => Promise<void>) =>
    start(async () => {
      await fn(id);
      router.refresh();
    });

  return (
    <div className="flex items-center gap-1">
      {(status === "draft" || status === "rejected") && (
        <button
          onClick={() => run(submitForReview)}
          disabled={pending}
          className="rounded-md px-2 py-1 text-[12px] text-primary-container hover:bg-primary-container/10"
          title="Kirim untuk ditinjau"
        >
          <Icon name="send" size={16} />
        </button>
      )}
      {status === "under_review" && (
        <button
          onClick={() => run(withdrawProduct)}
          disabled={pending}
          className="rounded-md px-2 py-1 text-[12px] text-on-surface-variant hover:bg-white/5"
          title="Tarik kembali ke draft"
        >
          <Icon name="restart_alt" size={16} />
        </button>
      )}
      <Link href={`/sell/products/${id}/edit`} className="rounded-md px-2 py-1 text-on-surface-variant hover:bg-white/5" title="Edit">
        <Icon name="edit" size={16} />
      </Link>
      <button
        onClick={() => {
          if (confirm("Hapus produk ini?")) run(deleteProduct);
        }}
        disabled={pending}
        className="rounded-md px-2 py-1 text-on-surface-variant hover:bg-error/10 hover:text-error"
        title="Hapus"
      >
        <Icon name="delete" size={16} />
      </button>
    </div>
  );
}
