import { describe, it, expect, beforeAll } from "vitest";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Integration test for the DB security model (RLS + guard triggers + RPCs).
// Runs only when a local Supabase is reachable (env set); skipped in plain CI.
// Prereqs: `supabase start` + `npm run seed:users` (demo user@/admin@nexora.ai).
const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const DEMO_PW = process.env.DEMO_PASSWORD || "Demo1234!";
const run = Boolean(URL && ANON);

async function signedIn(email: string): Promise<SupabaseClient> {
  const c = createClient(URL!, ANON!, { auth: { persistSession: false, autoRefreshToken: false } });
  const { error } = await c.auth.signInWithPassword({ email, password: DEMO_PW });
  if (error) throw new Error(`sign-in failed for ${email}: ${error.message}`);
  return c;
}

describe.skipIf(!run)("DB security (RLS + guards + RPCs)", () => {
  let user: SupabaseClient;
  let admin: SupabaseClient;
  let uid: string;

  beforeAll(async () => {
    user = await signedIn("user@nexora.ai");
    admin = await signedIn("admin@nexora.ai");
    uid = (await user.auth.getUser()).data.user!.id;
  });

  it("blocks direct order inserts (checkout RPC is the only path)", async () => {
    const { error } = await user.from("orders").insert({ buyer_id: uid, status: "paid", total_usd: 0 });
    expect(error).toBeTruthy();
  });

  it("neutralizes forged product trust columns on insert", async () => {
    const { data, error } = await user
      .from("products")
      .insert({ owner_id: uid, name: "SecTest", category: "vision", status: "draft", rating: 5, reviews_count: 999, creator_id: "TrustedLab" })
      .select("id, rating, reviews_count, creator_id")
      .single();
    expect(error).toBeNull();
    expect(Number(data!.rating)).toBe(0);
    expect(data!.reviews_count).toBe(0);
    expect(data!.creator_id).toBeNull();
    await user.from("products").delete().eq("id", data!.id);
  });

  it("blocks a seller from self-publishing", async () => {
    const { error } = await user
      .from("products")
      .insert({ owner_id: uid, name: "SneakyPub", category: "vision", status: "published" });
    expect(error).toBeTruthy();
  });

  it("hides contact_messages from non-admins but shows them to admins", async () => {
    await user.from("contact_messages").insert({ name: "t", email: "t@t.io", body: "integration test message" });
    const asUser = await user.from("contact_messages").select("id");
    expect(asUser.data?.length ?? 0).toBe(0);
    const asAdmin = await admin.from("contact_messages").select("id");
    expect(asAdmin.data?.length ?? 0).toBeGreaterThan(0);
  });

  it("rejects a payout request without a verified account / below minimum", async () => {
    const { error } = await user.rpc("request_payout", { p_amount_usd: 10 });
    expect(error).toBeTruthy();
  });

  it("hides profiles.role from signed-in users while is_admin() still answers", async () => {
    const { error } = await user.from("profiles").select("id, role");
    expect(error).toBeTruthy(); // column-level grant, not a row filter
    expect((await user.rpc("is_admin")).data).toBe(false);
    expect((await admin.rpc("is_admin")).data).toBe(true);
  });

  it("stops a seller from verifying or re-pointing their own payout account", async () => {
    // Direct column write — the flag request_payout() trusts before money moves.
    const direct = await user.from("stores").update({ payout_status: "verified" }).eq("owner_id", uid);
    expect(direct.error).toBeTruthy();
    // Swapping the destination while keeping an existing 'verified' flag.
    const swap = await user.from("stores").update({ payout_account_masked: "••••9999" }).eq("owner_id", uid);
    expect(swap.error).toBeTruthy();
    // The admin RPC is not reachable from a non-admin session either.
    const rpc = await user.rpc("set_payout_account_status", { p_owner: uid, p_status: "verified" });
    expect(rpc.error).toBeTruthy();
  });

  it("validates promo codes server-side", async () => {
    const { data: valid } = await user.rpc("validate_promo", { p_code: "NEXORA10", p_subtotal: 100 });
    expect(Number(valid)).toBe(10);
    const { data: bad } = await user.rpc("validate_promo", { p_code: "NOPE", p_subtotal: 100 });
    expect(Number(bad)).toBe(0);
  });
});
