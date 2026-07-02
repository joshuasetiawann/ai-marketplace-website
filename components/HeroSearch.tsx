"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Icon from "./Icon";

export default function HeroSearch() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/explore${query.trim() ? `?q=${encodeURIComponent(query.trim())}` : ""}`);
  };

  return (
    <form onSubmit={submit} className="group relative mt-4 w-full max-w-2xl">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-5">
        <Icon name="search" className="text-outline" size={22} />
      </div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Kamu butuh bantuan apa?"
        aria-label="Cari model"
        className="w-full rounded-full border border-white/10 bg-surface-container-lowest py-4 pl-14 pr-32 text-body-md text-on-surface outline-none transition-colors placeholder:text-outline/70 focus:border-primary-container/50"
      />
      <div className="absolute inset-y-0 right-0 flex items-center pr-2">
        <button type="submit" className="btn-primary px-5 py-2.5">
          Cari <Icon name="arrow_forward" size={16} />
        </button>
      </div>
    </form>
  );
}
