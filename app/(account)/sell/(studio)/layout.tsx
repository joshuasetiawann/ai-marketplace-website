import { redirect } from "next/navigation";
import SellerNav from "@/components/SellerNav";
import { createServerClient } from "@/lib/supabase/server";

export default async function SellerStudioLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/sell");

  const { data: profile } = await supabase.from("profiles").select("is_seller").eq("id", user.id).single();
  if (!profile?.is_seller) redirect("/sell/start");

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex items-center gap-2">
        <span className="font-display text-headline-md text-on-surface">Seller Studio</span>
      </div>
      <div className="grid gap-8 md:grid-cols-[200px_1fr]">
        <aside className="md:sticky md:top-6 md:self-start">
          <SellerNav />
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
