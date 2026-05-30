"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Icon from "./Icon";
import { addManyToCart } from "@/lib/actions/commerce";

export default function WishlistAddAll({ ids }: { ids: string[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <button
      disabled={pending}
      onClick={() =>
        start(async () => {
          await addManyToCart(ids);
          router.push("/cart");
        })
      }
      className="btn-ghost px-5 py-2.5"
    >
      <Icon name="shopping_cart_checkout" size={18} /> {pending ? "Menambahkan…" : "Tambah semua"}
    </button>
  );
}
