"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Icon from "./Icon";
import { moderateProduct } from "@/lib/actions/admin";

export default function AdminModerateActions({ id }: { id: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const act = (action: "approve" | "reject") =>
    start(async () => {
      await moderateProduct(id, action);
      router.refresh();
    });

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => act("approve")}
        disabled={pending}
        className="inline-flex items-center gap-1 rounded-lg bg-success/10 px-3 py-1.5 text-body-sm text-success hover:bg-success/20"
      >
        <Icon name="check" size={16} /> Setujui
      </button>
      <button
        onClick={() => act("reject")}
        disabled={pending}
        className="inline-flex items-center gap-1 rounded-lg bg-error/10 px-3 py-1.5 text-body-sm text-error hover:bg-error/20"
      >
        <Icon name="close" size={16} /> Tolak
      </button>
    </div>
  );
}
