"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Icon from "./Icon";
import { addManyToCart } from "@/lib/actions/commerce";

export default function WishlistAddAll({ ids }: { ids: string[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [err, setErr] = useState("");

  return (
    <div className="flex flex-wrap items-center gap-3">
      {err && (
        <span role="alert" className="text-body-sm text-error">
          {err}
        </span>
      )}
      <button
        disabled={pending}
        onClick={() =>
          start(async () => {
            setErr("");
            // The result used to be dropped: on failure the user was pushed to
            // an unchanged cart with nothing to explain why it was unchanged.
            const res = await addManyToCart(ids);
            if (res?.needsAuth) return router.push("/login?next=/wishlist");
            if (res?.error) return setErr(res.error);
            router.push("/cart");
          })
        }
        className="btn-ghost px-5 py-2.5"
      >
        <Icon name="shopping_cart_checkout" size={18} /> {pending ? "Menambahkan…" : "Tambah semua"}
      </button>
    </div>
  );
}
