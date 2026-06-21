-- ─────────────────────────────────────────────────────────────────────────────
-- Seed: curated "house" catalog (owner_id null = platform-owned, published).
-- Demo auth users (user@ / admin@) are seeded separately by scripts/seed-users.mjs
-- because auth.users must be created through the Auth admin API, not raw SQL.
-- Ported from legacy-vite/src/data/models.js; capabilities/specs copy follows
-- the v2 mockup (docs/design/v2/text-detail.txt).
-- ─────────────────────────────────────────────────────────────────────────────

insert into products
  (name, tagline, category, use_cases, use_case_tags, tier, price_usd, icon, art, description, capabilities, specs, status, rating, reviews_count, creator_id)
values
  ('Nexus Vision Pro', 'Model gambar generatif kelas enterprise', 'vision',
   array['business','creative'], array['Marketing','Concept Art','Editorial'],
   'Pro', 24, 'visibility', array['#0b3a44','#00e5ff'],
   'Model difusi gambar resolusi tinggi dengan zero-shot style transfer dan output hingga 8K. Dirancang untuk tim marketing, concept art, dan editorial yang menuntut kualitas visual kelas enterprise dengan konsistensi karakter dan kontrol komposisi tingkat lanjut. Terintegrasi penuh dengan API Nexora Core.',
   '[{"icon":"high_quality","title":"Output 8K","text":"Resolusi ultra-tinggi siap cetak."},
     {"icon":"auto_awesome","title":"Zero-shot style","text":"Transfer gaya tanpa fine-tuning."},
     {"icon":"layers","title":"Kontrol komposisi","text":"Layer & region editing presisi."},
     {"icon":"api","title":"API siap pakai","text":"Integrasi REST & webhook."}]'::jsonb,
   '{"Parameters":"12B","Context Window":"32K","Latency":"~600ms","Diperbarui":"24 Okt 2025"}'::jsonb,
   'published', 4.9, 1280, 'synthetix-labs'),

  ('CodeWeaver X', 'LLM canggih untuk generasi full-stack', 'code',
   array['developer','business'], array['Coding','Refactor','Docs'],
   'Pro', 39, 'code', array['#10233a','#3b82f6'],
   'Asisten koding multi-bahasa untuk generasi full-stack, review, dan refactor otomatis. Memahami konteks repositori penuh sehingga saran kode konsisten dengan arsitektur dan konvensi tim — dari prototipe sampai produksi.',
   '[{"icon":"code","title":"Generasi full-stack","text":"Frontend, backend & infra dari satu prompt."},
     {"icon":"bug_report","title":"Review & refactor","text":"Deteksi bug + saran perbaikan otomatis."},
     {"icon":"terminal","title":"40+ bahasa","text":"Dukungan luas bahasa & framework."},
     {"icon":"api","title":"Integrasi IDE","text":"Ekstensi VS Code & JetBrains."}]'::jsonb,
   '{"Parameters":"34B","Context Window":"128K","Latency":"~800ms","Diperbarui":"12 Nov 2025"}'::jsonb,
   'published', 4.8, 940, 'synthetix-labs'),

  ('Chroma Studio FX', 'Efek visual & color grading sinematik', 'video',
   array['creative'], array['VFX','Color Grading','Film'],
   'Pro', 49, 'movie', array['#2a1f05','#e9c349'],
   'Pipeline efek visual dan color grading sinematik untuk konten film dan iklan. Terapkan LUT kelas film, VFX generatif, dan compositing multi-layer langsung dari prompt — hasil konsisten antar shot dalam satu proyek.',
   '[{"icon":"palette","title":"Color grading sinematik","text":"LUT & tone kelas film."},
     {"icon":"movie","title":"VFX generatif","text":"Efek partikel & compositing."},
     {"icon":"hd","title":"Render 4K HDR","text":"Output siap broadcast."},
     {"icon":"api","title":"Pipeline node","text":"Integrasi Nuke & Resolve."}]'::jsonb,
   '{"Resolusi":"4K HDR","Framerate":"60 fps","Latency":"~2s/frame","Diperbarui":"03 Des 2025"}'::jsonb,
   'published', 4.7, 612, 'aura-labs'),

  ('Aura Synth', 'Sintesis suara & musik adaptif', 'audio',
   array['creative','lifestyle'], array['Music','Voice','SFX'],
   'Pro', 19, 'graphic_eq', array['#231038','#a855f7'],
   'Hasilkan musik, suara, dan efek audio adaptif berkualitas studio dari deskripsi teks. Komposisi mengikuti mood, tempo, dan durasi target — cocok untuk konten, game, dan aplikasi interaktif dengan kebutuhan audio dinamis.',
   '[{"icon":"graphic_eq","title":"Musik adaptif","text":"Komposisi mengikuti mood & tempo."},
     {"icon":"mic","title":"Voice cloning","text":"Suara natural multi-bahasa."},
     {"icon":"music_note","title":"SFX studio","text":"Efek suara kualitas produksi."},
     {"icon":"api","title":"Streaming API","text":"Latensi rendah untuk aplikasi live."}]'::jsonb,
   '{"Sample Rate":"48 kHz","Voices":"120+","Latency":"~300ms","Diperbarui":"28 Sep 2025"}'::jsonb,
   'published', 4.6, 388, 'aura-labs'),

  ('Lumen Portrait', 'Portrait fotorealistik dengan kontrol cahaya', 'vision',
   array['creative','business'], array['Portrait','Product','Fashion'],
   'Free', 0, 'face', array['#0b3a44','#22d3ee'],
   'Model portrait fotorealistik dengan kontrol pencahayaan dan komposisi tingkat studio. Atur arah cahaya, mood, dan lensa virtual seperti sesi foto sungguhan — detail kulit dan rambut tetap natural di semua preset.',
   '[{"icon":"face","title":"Potret fotorealistik","text":"Detail kulit & rambut natural."},
     {"icon":"wb_sunny","title":"Kontrol pencahayaan","text":"Studio lighting virtual 3 titik."},
     {"icon":"palette","title":"Preset gaya","text":"60+ preset fashion & editorial."},
     {"icon":"high_quality","title":"Upscale 4K","text":"Perbesar tanpa kehilangan detail."}]'::jsonb,
   '{"Parameters":"6B","Output":"4K","Latency":"~900ms","Diperbarui":"15 Agu 2025"}'::jsonb,
   'published', 4.5, 210, 'synthetix-labs'),

  ('Forge 3D', 'Generasi aset 3D siap produksi', 'vision',
   array['developer','creative'], array['Game','3D','Assets'],
   'Enterprise', 35, 'deployed_code', array['#072a1f','#7ee0a8'],
   'Hasilkan aset 3D bertekstur siap pakai untuk game dan visualisasi produk. Topologi rapi, material PBR lengkap, dan ekspor sekali klik ke format standar industri — langsung drop ke engine tanpa retopo manual.',
   '[{"icon":"view_in_ar","title":"Aset 3D bertekstur","text":"Material PBR siap engine."},
     {"icon":"deployed_code","title":"Ekspor universal","text":"GLTF, FBX & USDZ sekali klik."},
     {"icon":"bolt","title":"Topologi rapi","text":"Mesh optimal untuk game & AR."},
     {"icon":"api","title":"Pipeline API","text":"Integrasi Unity & Unreal."}]'::jsonb,
   '{"Poly Budget":"5–500rb","Format":"GLTF · FBX · USDZ","Latency":"~4s/aset","Diperbarui":"20 Okt 2025"}'::jsonb,
   'published', 4.8, 524, 'aura-labs');
