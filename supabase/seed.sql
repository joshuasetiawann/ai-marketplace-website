-- ─────────────────────────────────────────────────────────────────────────────
-- Seed: curated "house" catalog (owner_id null = platform-owned, published).
-- Demo auth users (user@ / admin@) are seeded separately by scripts/seed-users.mjs
-- because auth.users must be created through the Auth admin API, not raw SQL.
-- Ported from legacy-vite/src/data/models.js.
-- ─────────────────────────────────────────────────────────────────────────────

insert into products
  (name, tagline, category, use_cases, use_case_tags, tier, price_usd, icon, art, description, status, rating, reviews_count, creator_id)
values
  ('Nexus Vision Pro', 'Model gambar generatif kelas enterprise', 'vision',
   array['business','creative'], array['Marketing','Concept Art','Editorial'],
   'Pro', 24, 'visibility', array['#0b3a44','#00e5ff'],
   'Model difusi gambar resolusi tinggi dengan zero-shot style transfer dan output hingga 8K.',
   'published', 4.9, 1280, 'synthetix-labs'),

  ('CodeWeaver X', 'LLM canggih untuk generasi full-stack', 'code',
   array['developer','business'], array['Coding','Refactor','Docs'],
   'Pro', 39, 'code', array['#10233a','#3b82f6'],
   'Asisten koding multi-bahasa untuk generasi full-stack, review, dan refactor otomatis.',
   'published', 4.8, 940, 'synthetix-labs'),

  ('Chroma Studio FX', 'Efek visual & color grading sinematik', 'video',
   array['creative'], array['VFX','Color Grading','Film'],
   'Pro', 49, 'palette', array['#2a1f05','#e9c349'],
   'Pipeline efek visual dan color grading sinematik untuk konten film dan iklan.',
   'published', 4.7, 612, 'aura-labs'),

  ('Aura Synth', 'Sintesis suara & musik adaptif', 'audio',
   array['creative','lifestyle'], array['Music','Voice','SFX'],
   'Pro', 19, 'graphic_eq', array['#231038','#a855f7'],
   'Hasilkan musik, suara, dan efek audio adaptif berkualitas studio dari deskripsi teks.',
   'published', 4.6, 388, 'aura-labs'),

  ('Lumen Portrait', 'Portrait fotorealistik dengan kontrol cahaya', 'vision',
   array['creative','business'], array['Portrait','Product','Fashion'],
   'Free', 0, 'face', array['#0b3a44','#22d3ee'],
   'Model portrait fotorealistik dengan kontrol pencahayaan dan komposisi tingkat studio.',
   'published', 4.5, 210, 'synthetix-labs'),

  ('Forge 3D', 'Generasi aset 3D siap produksi', 'vision',
   array['developer','creative'], array['Game','3D','Assets'],
   'Enterprise', 35, 'deployed_code', array['#072a1f','#7ee0a8'],
   'Hasilkan aset 3D bertekstur siap pakai untuk game dan visualisasi produk.',
   'published', 4.8, 524, 'aura-labs');
