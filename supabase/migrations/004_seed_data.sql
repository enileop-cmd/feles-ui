-- ═══════════════════════════════════════════════════════════════
-- Felix Lens (Felen) — Migration 004: Seed Data
-- ═══════════════════════════════════════════════════════════════

-- ─── GOVERNORATES (22 محافظات يمنية) ────────────────────────────
INSERT INTO governorates (slug, name_ar, name_en, lat, lng) VALUES
  ('sanaa',       'صنعاء',      'Sana''a',       15.369445,  44.191006),
  ('hadramout',   'حضرموت',     'Hadramout',     15.933610,  48.784626),
  ('hodeidah',    'الحديدة',    'Al-Hudaydah',   14.797760,  42.954540),
  ('taiz',        'تعز',        'Taiz',          13.578900,  44.020900),
  ('aden',        'عدن',        'Aden',          12.785500,  45.018700),
  ('ibb',         'إب',         'Ibb',           13.966700,  44.183300),
  ('socotra',     'سقطرى',      'Socotra',       12.463400,  53.823700),
  ('marib',       'مأرب',       'Marib',         15.466700,  45.316700),
  ('jawf',        'الجوف',      'Al-Jawf',       16.200000,  45.533300),
  ('hajjah',      'حجة',        'Hajjah',        15.699722,  43.600278),
  ('mahwit',      'المحويت',    'Al-Mahwit',     15.466700,  43.550000),
  ('sanaa-gov',   'محافظة صنعاء','Sana''a Gov.',  15.233300,  44.200000),
  ('bayda',       'البيضاء',    'Al-Bayda',      13.983300,  45.566700),
  ('shabwah',     'شبوة',       'Shabwah',       15.000000,  47.000000),
  ('abyan',       'أبين',       'Abyan',         13.550000,  45.966700),
  ('lahij',       'لحج',        'Lahij',         13.033300,  44.883300),
  ('dhale',       'الضالع',     'Ad-Dali',       13.700000,  44.733300),
  ('taizz',       'تعز المحافظة','Taiz Gov.',     13.578900,  44.020900),
  ('mahrah',      'المهرة',     'Al-Mahrah',     16.516700,  51.250000),
  ('amran',       'عمران',      'Amran',         15.666700,  43.950000),
  ('dhamar',      'ذمار',       'Dhamar',        14.550000,  44.400000),
  ('raymah',      'ريمة',       'Raymah',        14.666700,  43.716700)
ON CONFLICT (slug) DO NOTHING;

-- ─── HERITAGE CATEGORIES ────────────────────────────────────────
INSERT INTO heritage_categories (slug, name_ar, name_en, desc_ar, desc_en, color, sort_order) VALUES
  ('architecture','العمارة الطينية',   'Mud Architecture',
   'فنون البناء باللبن والحجر في مدن اليمن التاريخية.',
   'The art of building with mud brick and stone in Yemen''s historic cities.',
   '#a86b3d', 1),

  ('crafts',      'الحِرَف اليدوية',    'Handicrafts',
   'الفضة، الجنابي، النسيج، الفخار، وحرف السلال.',
   'Silver, jambiya, weaving, pottery, and basket crafts.',
   '#0f766e', 2),

  ('zawamil',     'الزوامل والأهازيج', 'Zawamil & Chants',
   'أناشيد شعبية جماعية موروثة عن القبائل والمناسبات.',
   'Collective folk chants inherited from tribes and occasions.',
   '#7c5e2a', 3),

  ('rituals',     'الطقوس والأعراس',   'Rituals & Weddings',
   'طقوس اجتماعية وأعراس وأعياد موروثة.',
   'Social rituals, weddings, and inherited celebrations.',
   '#8a3d3d', 4),

  ('folktales',   'الحكايات الشعبية',  'Folktales',
   'قصص وخرافات وأمثال وحكم شعبية يمنية.',
   'Yemeni folk stories, fables, proverbs, and wisdom.',
   '#3d5a8a', 5),

  ('textiles',    'المنسوجات والأزياء','Textiles & Costume',
   'الشمائل، المعاوز، الفوط والأزياء الشعبية.',
   'Shama''il, ma''awiz, futah, and traditional garments.',
   '#c48a2d', 6),

  ('manuscripts', 'المخطوطات والنقوش', 'Manuscripts & Inscriptions',
   'المخطوطات العلمية والنقوش المسندية.',
   'Scientific manuscripts and Sabaean inscriptions.',
   '#4a5a2d', 7),

  ('food',        'المطبخ الشعبي',     'Traditional Cuisine',
   'أطباق وممارسات غذائية موروثة.',
   'Inherited dishes and culinary practices.',
   '#a0533d', 8)

ON CONFLICT (slug) DO NOTHING;

-- ─── TAGS ───────────────────────────────────────────────────────
INSERT INTO tags (slug, name_ar, name_en) VALUES
  ('skyscrapers',    'ناطحات سحاب', 'Skyscrapers'),
  ('qamariya',       'قمريات',      'Qamariya'),
  ('doors',          'أبواب',       'Doors'),
  ('souks',          'أسواق',       'Souks'),
  ('fortresses',     'قلاع',        'Fortresses'),
  ('mosques',        'مساجد',       'Mosques'),
  ('portrait',       'بورتريه',     'Portrait'),
  ('crafts-tag',     'حرف',         'Crafts'),
  ('ornaments',      'زخارف',       'Ornaments'),
  ('calligraphy',    'خط عربي',     'Arabic Calligraphy'),
  ('weapons',        'أسلحة',       'Weapons'),
  ('silver',         'فضة',         'Silver'),
  ('children',       'أطفال',       'Children'),
  ('women',          'نساء',        'Women'),
  ('men',            'رجال',        'Men')
ON CONFLICT (slug) DO NOTHING;

-- ─── TIMELINE DECADES ───────────────────────────────────────────
INSERT INTO timeline_decades (decade, label_ar, label_en, desc_ar, desc_en, sort_order) VALUES
  (1900, 'بدايات التوثيق',  'Dawn of Documentation',
   'أول صور فوتوغرافية للبعثات الأجنبية في عدن وصنعاء.',
   'First photographs by foreign expeditions in Aden and Sana''a.',
   1),
  (1930, 'الرحّالة الأوائل', 'The Early Travellers',
   'توثيق فريا ستارك وهانس هلفريتز للحياة اليمنية.',
   'Documentation of Yemeni life by Freya Stark and Hans Helfritz.',
   2),
  (1960, 'حقبة التحولات',   'Era of Transformation',
   'الحياة الاجتماعية بعد ثورة 26 سبتمبر و14 أكتوبر.',
   'Social life after the September 26 and October 14 revolutions.',
   3),
  (1970, 'توثيق العمارة',   'Architectural Documentation',
   'بعثات اليونسكو لحفظ صنعاء وشبام وزبيد.',
   'UNESCO missions to preserve Sana''a, Shibam, and Zabid.',
   4),
  (1990, 'الوحدة والإرث',   'Unity & Heritage',
   'توثيق يمني بعد إعلان الوحدة وتصنيف المدن التراثية.',
   'Yemeni documentation after unification and World Heritage listing.',
   5),
  (2010, 'العدسة الرقمية',  'The Digital Lens',
   'توثيق رقمي مكثف للتراث المهدد أثناء الحرب.',
   'Intensive digital documentation of endangered heritage during conflict.',
   6)
ON CONFLICT DO NOTHING;
