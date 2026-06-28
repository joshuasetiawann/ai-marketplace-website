// Seed demo auth users. Re-run after every `supabase db reset` (which truncates
// auth.users). Demo password is intentionally well-known — this is a template.
//
//   npm run seed:users
//
// Requires NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in .env.local.
import { createClient } from "@supabase/supabase-js";

try {
  process.loadEnvFile(".env.local");
} catch {
  // env already provided by the shell
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const DEMO = [
  { email: "user@nexora.ai", name: "Alex Morgan", role: "user" },
  { email: "admin@nexora.ai", name: "Nexora Admin", role: "admin" },
];

for (const u of DEMO) {
  const { data, error } = await admin.auth.admin.createUser({
    email: u.email,
    password: "Demo1234!",
    email_confirm: true,
    user_metadata: { name: u.name },
  });
  if (error) {
    console.error(`✗ ${u.email}: ${error.message}`);
    continue;
  }
  if (u.role === "admin") {
    const { error: upErr } = await admin
      .from("profiles")
      .update({ role: "admin" })
      .eq("id", data.user.id);
    if (upErr) console.error(`✗ promote ${u.email}: ${upErr.message}`);
  }
  console.log(`✓ seeded ${u.email} (${u.role})`);
}
