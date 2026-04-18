// ============================================================
// seed.js — بيانات let's Café & More الكاملة
// شغّله مرة واحدة من Firebase Console أو عبر Admin SDK
// أو الصق rawMaterials و products في store/index.js كـ DEFAULT_*
// ============================================================

// ─── المواد الخام (كل مكوّن فريد من الريسيبي) ────────────────
export const RAW_MATERIALS = [
  // قهوة
  { id: 'rm_espresso',      name: 'قهوة اسبريسو',        unit: 'جرام',  costPerUnit: 2,    currentStock: 5000 },
  { id: 'rm_turkish',       name: 'قهوة تركي',            unit: 'جرام',  costPerUnit: 1.5,  currentStock: 3000 },
  { id: 'rm_nescafe',       name: 'قهوة سريعة الذوبان',   unit: 'جرام',  costPerUnit: 3,    currentStock: 2000 },
  { id: 'rm_hazelnut_pwd',  name: 'بندق (مسحوق)',         unit: 'جرام',  costPerUnit: 5,    currentStock: 1000 },
  // سوائل أساسية
  { id: 'rm_milk',          name: 'حليب',                 unit: 'مللي',  costPerUnit: 0.08, currentStock: 50000 },
  { id: 'rm_water',         name: 'مياه',                 unit: 'مللي',  costPerUnit: 0.01, currentStock: 100000 },
  { id: 'rm_water_hot',     name: 'مياه ساخنة',           unit: 'مللي',  costPerUnit: 0.01, currentStock: 50000 },
  { id: 'rm_cream_foam',    name: 'كريمة حليب فوم',       unit: 'مللي',  costPerUnit: 0.5,  currentStock: 5000 },
  // سيراب ومحليات
  { id: 'rm_sugar',         name: 'سكر (باكت)',           unit: 'باكت',  costPerUnit: 0.5,  currentStock: 2000 },
  { id: 'rm_syrup_hazel',   name: 'سيراب بندق',           unit: 'مللي',  costPerUnit: 0.8,  currentStock: 3000 },
  { id: 'rm_syrup_cookies', name: 'سيراب كوكيز',          unit: 'مللي',  costPerUnit: 0.8,  currentStock: 2000 },
  { id: 'rm_syrup_almond',  name: 'سيراب لوز محمص',       unit: 'مللي',  costPerUnit: 1,    currentStock: 2000 },
  { id: 'rm_syrup_straw',   name: 'سيراب فراولة',         unit: 'مللي',  costPerUnit: 0.8,  currentStock: 2000 },
  { id: 'rm_syrup_vanilla', name: 'سيراب فانيليا',        unit: 'مللي',  costPerUnit: 0.7,  currentStock: 2000 },
  { id: 'rm_syrup_caramel', name: 'سيراب كراميل',         unit: 'مللي',  costPerUnit: 0.8,  currentStock: 2000 },
  { id: 'rm_syrup_mocha',   name: 'سيراب موكا',           unit: 'مللي',  costPerUnit: 0.8,  currentStock: 2000 },
  { id: 'rm_syrup_mojito',  name: 'سيراب موهيتو',         unit: 'مللي',  costPerUnit: 1,    currentStock: 3000 },
  { id: 'rm_syrup_pinacol', name: 'سيراب بينا كولادا',    unit: 'مللي',  costPerUnit: 1,    currentStock: 2000 },
  { id: 'rm_syrup_mint',    name: 'سيراب نعناع',          unit: 'مللي',  costPerUnit: 0.8,  currentStock: 2000 },
  { id: 'rm_syrup_rose',    name: 'سيراب روز',            unit: 'مللي',  costPerUnit: 0.8,  currentStock: 1000 },
  { id: 'rm_syrup_peach',   name: 'سيراب خوخ',            unit: 'مللي',  costPerUnit: 0.8,  currentStock: 1000 },
  { id: 'rm_syrup_waterml', name: 'سيراب بطيخ',           unit: 'مللي',  costPerUnit: 1,    currentStock: 1000 },
  { id: 'rm_syrup_banana',  name: 'سيراب موز دولسي',      unit: 'مللي',  costPerUnit: 0.8,  currentStock: 1000 },
  { id: 'rm_syrup_irishcr', name: 'سيراب ايرش كريم',      unit: 'مللي',  costPerUnit: 1,    currentStock: 1000 },
  { id: 'rm_syrup_popcorn', name: 'سيراب بوب كورن',       unit: 'مللي',  costPerUnit: 0.8,  currentStock: 1000 },
  { id: 'rm_syrup_tiramis', name: 'سيراب ترامسيو',        unit: 'مللي',  costPerUnit: 1,    currentStock: 1000 },
  // شوكولاتة وصوصات
  { id: 'rm_dark_choc',     name: 'دارك شوكلت',           unit: 'مللي',  costPerUnit: 1.2,  currentStock: 3000 },
  { id: 'rm_sauce_straw',   name: 'صوص فراولة',           unit: 'مللي',  costPerUnit: 1,    currentStock: 2000 },
  { id: 'rm_sauce_blue',    name: 'صوص توت ازرق',         unit: 'مللي',  costPerUnit: 1,    currentStock: 2000 },
  { id: 'rm_sauce_mixed',   name: 'صوص ميكس بيري',        unit: 'مللي',  costPerUnit: 1,    currentStock: 2000 },
  { id: 'rm_sauce_mango',   name: 'صوص مانجو',            unit: 'مللي',  costPerUnit: 1,    currentStock: 2000 },
  { id: 'rm_sauce_peach',   name: 'صوص خوخ',              unit: 'مللي',  costPerUnit: 1,    currentStock: 1000 },
  { id: 'rm_sauce_raspb',   name: 'صوص راسبيري',          unit: 'مللي',  costPerUnit: 1,    currentStock: 1000 },
  { id: 'rm_sauce_passion', name: 'صوص باشون',            unit: 'مللي',  costPerUnit: 1,    currentStock: 1000 },
  { id: 'rm_sauce_kiwi',    name: 'صوص كيوي',             unit: 'مللي',  costPerUnit: 1,    currentStock: 1000 },
  { id: 'rm_sauce_apple',   name: 'صوص جرين ابل',         unit: 'مللي',  costPerUnit: 1,    currentStock: 1000 },
  { id: 'rm_sauce_shea',    name: 'شيا',                  unit: 'مللي',  costPerUnit: 1.5,  currentStock: 1000 },
  { id: 'rm_sauce_lotus',   name: 'صوص لوتس',             unit: 'مللي',  costPerUnit: 1.2,  currentStock: 1000 },
  { id: 'rm_nutella',       name: 'نوتيلا',               unit: 'جرام',  costPerUnit: 2,    currentStock: 2000 },
  { id: 'rm_pistachio',     name: 'فسدق (معجون)',         unit: 'جرام',  costPerUnit: 5,    currentStock: 1000 },
  { id: 'rm_kinder',        name: 'كيندر',                unit: 'جرام',  costPerUnit: 3,    currentStock: 1000 },
  // موهيتو أساسيات
  { id: 'rm_lemon',         name: 'ليمون',                unit: 'قطعة',  costPerUnit: 2,    currentStock: 1000 },
  { id: 'rm_mint',          name: 'نعناع',                unit: 'ورقة',  costPerUnit: 0.1,  currentStock: 5000 },
  { id: 'rm_ice_crush',     name: 'ثلج مجروش',           unit: 'قطعة',  costPerUnit: 0.05, currentStock: 10000 },
  { id: 'rm_orange_dry',    name: 'برتقال مجفف',          unit: 'قطعة',  costPerUnit: 1,    currentStock: 2000 },
  { id: 'rm_rosemary',      name: 'روز ماري',             unit: 'عود',   costPerUnit: 0.5,  currentStock: 2000 },
  { id: 'rm_soda_can',      name: 'سودا (كان)',           unit: 'كان',   costPerUnit: 5,    currentStock: 500 },
  // مواد الفرابيه والسموزي
  { id: 'rm_ice',           name: 'ثلج',                  unit: 'قطعة',  costPerUnit: 0.05, currentStock: 20000 },
  { id: 'rm_puree_straw',   name: 'بيوريه فراولة',        unit: 'جرام',  costPerUnit: 1.5,  currentStock: 3000 },
  { id: 'rm_puree_mango',   name: 'بيوريه مانجو',         unit: 'جرام',  costPerUnit: 1.5,  currentStock: 3000 },
  { id: 'rm_puree_blue',    name: 'بيوريه توت ازرق',      unit: 'جرام',  costPerUnit: 2,    currentStock: 2000 },
  { id: 'rm_puree_lemon',   name: 'بيوريه ليمون',         unit: 'جرام',  costPerUnit: 1,    currentStock: 2000 },
  { id: 'rm_redbull_pwd',   name: 'بودر ريدبول',          unit: 'جرام',  costPerUnit: 3,    currentStock: 1000 },
  { id: 'rm_yogurt',        name: 'يوغرت',                unit: 'جرام',  costPerUnit: 1.5,  currentStock: 3000 },
  { id: 'rm_garnish',       name: 'جارنيش',               unit: 'جرام',  costPerUnit: 0.5,  currentStock: 2000 },
  // مواد الفرابيه
  { id: 'rm_frappe_base',   name: 'فرابيه بيس',           unit: 'جرام',  costPerUnit: 1,    currentStock: 5000 },
  // ميلك شيك
  { id: 'rm_icecream',      name: 'آيس كريم',             unit: 'جرام',  costPerUnit: 1.5,  currentStock: 5000 },
  { id: 'rm_oreo',          name: 'اوريو',                unit: 'جرام',  costPerUnit: 2,    currentStock: 1000 },
  // ماتشا
  { id: 'rm_matcha',        name: 'ماتشا',                unit: 'جرام',  costPerUnit: 8,    currentStock: 1000 },
  // بانكيك وافل
  { id: 'rm_pancake_mix',   name: 'خليط بانكيك',          unit: 'جرام',  costPerUnit: 1,    currentStock: 5000 },
  { id: 'rm_waffle_mix',    name: 'خليط وافل',            unit: 'جرام',  costPerUnit: 1,    currentStock: 5000 },
  // ساندي
  { id: 'rm_sunday_base',   name: 'بيس سانداي',           unit: 'جرام',  costPerUnit: 1,    currentStock: 3000 },
  // مشروبات غازية جاهزة
  { id: 'rm_redbull',       name: 'ريد بول (علبة)',       unit: 'علبة',  costPerUnit: 25,   currentStock: 100 },
  { id: 'rm_redbull_flv',   name: 'ريد بول فليفر (علبة)',unit: 'علبة',   costPerUnit: 30,   currentStock: 100 },
  { id: 'rm_can',           name: 'مشروب غازي (كان)',      unit: 'كان',   costPerUnit: 12,   currentStock: 200 },
  { id: 'rm_fairouz',       name: 'فيروز',                unit: 'زجاجة', costPerUnit: 15,   currentStock: 100 },
  { id: 'rm_brill',         name: 'بريل',                 unit: 'زجاجة', costPerUnit: 15,   currentStock: 100 },
  { id: 'rm_water_bottle',  name: 'مياه صغيرة',           unit: 'زجاجة', costPerUnit: 3,    currentStock: 200 },
  // شاي
  { id: 'rm_tea_bag',       name: 'أكياس شاي',            unit: 'كيس',   costPerUnit: 0.5,  currentStock: 1000 },
  { id: 'rm_green_tea',     name: 'شاي أخضر',             unit: 'كيس',   costPerUnit: 1,    currentStock: 500 },
  { id: 'rm_karak',         name: 'كرك',                  unit: 'جرام',  costPerUnit: 2,    currentStock: 1000 },
  { id: 'rm_marshmallow',   name: 'مارشميلو',             unit: 'جرام',  costPerUnit: 1,    currentStock: 500 },
  { id: 'rm_lotus',         name: 'لوتس',                 unit: 'جرام',  costPerUnit: 3,    currentStock: 1000 },
  // ضافات
  { id: 'rm_whip',          name: 'ويبد كريم',            unit: 'مللي',  costPerUnit: 0.5,  currentStock: 3000 },
  { id: 'rm_boba',          name: 'بوبا',                 unit: 'جرام',  costPerUnit: 1.5,  currentStock: 1000 },
  { id: 'rm_tapioca',       name: 'تابيوكا',              unit: 'جرام',  costPerUnit: 1,    currentStock: 1000 },
  { id: 'rm_brown_sugar',   name: 'سكر بني',              unit: 'جرام',  costPerUnit: 0.5,  currentStock: 2000 },
  { id: 'rm_topping',       name: 'توبينج',               unit: 'جرام',  costPerUnit: 1,    currentStock: 1000 },
  { id: 'rm_honey',         name: 'عسل',                  unit: 'مللي',  costPerUnit: 1,    currentStock: 1000 },
  { id: 'rm_flavor',        name: 'فليفر',                unit: 'مللي',  costPerUnit: 0.5,  currentStock: 1000 },
  // ── Dessert ──────────────────────────────────────────────
  { id: 'rm_dessert_base',  name: 'خليط حلويات (بيس)',   unit: 'جرام',  costPerUnit: 1.5,  currentStock: 3000 },
  { id: 'rm_cream_cheese',  name: 'كريم تشيز',            unit: 'جرام',  costPerUnit: 3,    currentStock: 2000 },
  // ── Croissant ─────────────────────────────────────────────
  { id: 'rm_croissant',     name: 'كروسان (قطعة)',        unit: 'قطعة',  costPerUnit: 15,   currentStock: 200 },
  { id: 'rm_halomi',        name: 'جبن حلومي',             unit: 'جرام',  costPerUnit: 4,    currentStock: 1000 },
  { id: 'rm_smoked_beef',   name: 'لحم مدخن',             unit: 'جرام',  costPerUnit: 5,    currentStock: 1000 },
  { id: 'rm_turkey',        name: 'تيركي (ديك رومي)',     unit: 'جرام',  costPerUnit: 4,    currentStock: 1000 },
  { id: 'rm_cheese_mix',    name: 'جبن مشكل',             unit: 'جرام',  costPerUnit: 3,    currentStock: 1000 },
  { id: 'rm_white_choc',    name: 'شوكولاتة بيضاء',       unit: 'جرام',  costPerUnit: 2,    currentStock: 1000 },
]

// ─── المنتجات الكاملة مع الوصفات ────────────────────────────
export const PRODUCTS = [

  // ══════════════════════════════════════════════════════════
  // Speciality
  // ══════════════════════════════════════════════════════════
  { id: 'p_v60',       name: 'V60',             category: 'Speciality', price: 100, stock: 999,
    recipe: [{ materialId: 'rm_espresso', amount: 15 }, { materialId: 'rm_water', amount: 250 }] },
  { id: 'p_v60cold',   name: 'قهوة باردة V60',  category: 'Speciality', price: 100, stock: 999,
    recipe: [{ materialId: 'rm_espresso', amount: 15 }, { materialId: 'rm_water', amount: 250 }, { materialId: 'rm_ice', amount: 10 }] },
  { id: 'p_coldbrew',  name: 'Cold Brew',        category: 'Speciality', price: 100, stock: 999,
    recipe: [{ materialId: 'rm_espresso', amount: 20 }, { materialId: 'rm_water', amount: 300 }] },

  // ══════════════════════════════════════════════════════════
  // قهوة تركي
  // ══════════════════════════════════════════════════════════
  { id: 'p_turkish',   name: 'قهوة تركي',       category: 'قهوة تركي', price: 50, stock: 999,
    recipe: [{ materialId: 'rm_turkish', amount: 14 }, { materialId: 'rm_sugar', amount: 3 }, { materialId: 'rm_water', amount: 40 }] },
  { id: 'p_french',    name: 'قهوة فرنساوي',    category: 'قهوة تركي', price: 75, stock: 999,
    recipe: [{ materialId: 'rm_turkish', amount: 8 }, { materialId: 'rm_milk', amount: 150 }, { materialId: 'rm_sugar', amount: 3 }] },
  { id: 'p_hazelnut',  name: 'قهوة بندق',       category: 'قهوة تركي', price: 75, stock: 999,
    recipe: [{ materialId: 'rm_hazelnut_pwd', amount: 12 }, { materialId: 'rm_milk', amount: 150 }, { materialId: 'rm_sugar', amount: 3 }] },
  { id: 'p_nescafe',   name: 'نسكافيه',         category: 'قهوة تركي', price: 85, stock: 999,
    recipe: [{ materialId: 'rm_nescafe', amount: 10 }, { materialId: 'rm_milk', amount: 150 }, { materialId: 'rm_sugar', amount: 3 }] },

  // ══════════════════════════════════════════════════════════
  // Espresso
  // ══════════════════════════════════════════════════════════
  { id: 'p_esp_single', name: 'اسبريسو سنجل',        category: 'Espresso', price: 60, stock: 999,
    recipe: [{ materialId: 'rm_espresso', amount: 10 }] },
  { id: 'p_esp_double', name: 'اسبريسو دبل',          category: 'Espresso', price: 80, stock: 999,
    recipe: [{ materialId: 'rm_espresso', amount: 20 }] },
  { id: 'p_esp_mikato', name: 'اسبريسو ميكاتو',       category: 'Espresso', price: 85, stock: 999,
    recipe: [{ materialId: 'rm_espresso', amount: 20 }, { materialId: 'rm_cream_foam', amount: 30 }] },
  { id: 'p_american',   name: 'اميركان كوفي',          category: 'Espresso', price: 85, stock: 999,
    recipe: [{ materialId: 'rm_espresso', amount: 20 }, { materialId: 'rm_water_hot', amount: 120 }] },
  { id: 'p_cappuccino', name: 'كابتشينو',              category: 'Espresso', price: 95, stock: 999,
    recipe: [{ materialId: 'rm_espresso', amount: 20 }, { materialId: 'rm_milk', amount: 250 }] },
  { id: 'p_flatwhite',  name: 'فلات وايت',             category: 'Espresso', price: 95, stock: 999,
    recipe: [{ materialId: 'rm_espresso', amount: 20 }, { materialId: 'rm_milk', amount: 250 }] },
  { id: 'p_latte',      name: 'لاتيه',                 category: 'Espresso', price: 90, stock: 999,
    recipe: [{ materialId: 'rm_espresso', amount: 20 }, { materialId: 'rm_milk', amount: 250 }] },
  { id: 'p_cortado',    name: 'كورتادو',               category: 'Espresso', price: 85, stock: 999,
    recipe: [{ materialId: 'rm_espresso', amount: 20 }, { materialId: 'rm_milk', amount: 60 }] },
  { id: 'p_mocha_hzl',  name: 'موكا بندق',             category: 'Espresso', price: 100, stock: 999,
    recipe: [{ materialId: 'rm_espresso', amount: 20 }, { materialId: 'rm_milk', amount: 200 }, { materialId: 'rm_dark_choc', amount: 45 }, { materialId: 'rm_syrup_hazel', amount: 15 }] },
  { id: 'p_latte_cook', name: 'لاتيه كوكيز',           category: 'Espresso', price: 105, stock: 999,
    recipe: [{ materialId: 'rm_espresso', amount: 20 }, { materialId: 'rm_milk', amount: 250 }, { materialId: 'rm_syrup_cookies', amount: 20 }] },
  { id: 'p_latte_almd', name: 'لاتيه لوز محمص',        category: 'Espresso', price: 105, stock: 999,
    recipe: [{ materialId: 'rm_espresso', amount: 20 }, { materialId: 'rm_milk', amount: 250 }, { materialId: 'rm_syrup_almond', amount: 20 }] },
  { id: 'p_mocha_straw',name: 'موكا فراولة',           category: 'Espresso', price: 110, stock: 999,
    recipe: [{ materialId: 'rm_espresso', amount: 20 }, { materialId: 'rm_milk', amount: 200 }, { materialId: 'rm_dark_choc', amount: 45 }, { materialId: 'rm_syrup_straw', amount: 15 }] },
  { id: 'p_mocha',      name: 'موكا',                  category: 'Espresso', price: 95, stock: 999,
    recipe: [{ materialId: 'rm_espresso', amount: 20 }, { materialId: 'rm_milk', amount: 200 }, { materialId: 'rm_dark_choc', amount: 45 }] },
  { id: 'p_white_mocha',name: 'وايت موكا',             category: 'Espresso', price: 95, stock: 999,
    recipe: [{ materialId: 'rm_espresso', amount: 20 }, { materialId: 'rm_milk', amount: 200 }, { materialId: 'rm_syrup_vanilla', amount: 30 }] },
  { id: 'p_esp_conbana',name: 'اسبريسو كون بانا',      category: 'Espresso', price: 70, stock: 999,
    recipe: [{ materialId: 'rm_espresso', amount: 20 }, { materialId: 'rm_cream_foam', amount: 30 }] },
  { id: 'p_spanish',    name: 'اسبانش لاتيه',          category: 'Espresso', price: 110, stock: 999,
    recipe: [{ materialId: 'rm_espresso', amount: 20 }, { materialId: 'rm_milk', amount: 200 }, { materialId: 'rm_syrup_vanilla', amount: 20 }] },
  { id: 'p_tristino',   name: 'تريستينو ميكاتو',       category: 'Espresso', price: 70, stock: 999,
    recipe: [{ materialId: 'rm_espresso', amount: 20 }, { materialId: 'rm_cream_foam', amount: 30 }] },

  // ══════════════════════════════════════════════════════════
  // Hot Drinks
  // ══════════════════════════════════════════════════════════
  { id: 'p_tea',        name: 'شاي',                   category: 'مشروبات ساخنة', price: 40, stock: 999,
    recipe: [{ materialId: 'rm_tea_bag', amount: 2 }, { materialId: 'rm_water', amount: 250 }] },
  { id: 'p_green_tea',  name: 'شاي أخضر',              category: 'مشروبات ساخنة', price: 45, stock: 999,
    recipe: [{ materialId: 'rm_green_tea', amount: 2 }, { materialId: 'rm_water', amount: 250 }] },
  { id: 'p_karak',      name: 'شاي كرك',               category: 'مشروبات ساخنة', price: 70, stock: 999,
    recipe: [{ materialId: 'rm_karak', amount: 10 }, { materialId: 'rm_milk', amount: 200 }] },
  { id: 'p_milk_tea',   name: 'شاي حليب',              category: 'مشروبات ساخنة', price: 70, stock: 999,
    recipe: [{ materialId: 'rm_tea_bag', amount: 2 }, { materialId: 'rm_milk', amount: 200 }] },
  { id: 'p_hot_choc',   name: 'هوت شوكليت',            category: 'مشروبات ساخنة', price: 85, stock: 999,
    recipe: [{ materialId: 'rm_dark_choc', amount: 60 }, { materialId: 'rm_milk', amount: 250 }] },
  { id: 'p_hot_sider',  name: 'هوت سيدر',              category: 'مشروبات ساخنة', price: 85, stock: 999,
    recipe: [{ materialId: 'rm_syrup_peach', amount: 30 }, { materialId: 'rm_water', amount: 200 }] },
  { id: 'p_hot_choc_hz',name: 'هوت شوكليت بندق',       category: 'مشروبات ساخنة', price: 100, stock: 999,
    recipe: [{ materialId: 'rm_dark_choc', amount: 60 }, { materialId: 'rm_milk', amount: 250 }, { materialId: 'rm_syrup_hazel', amount: 20 }] },
  { id: 'p_hot_marsm',  name: 'هوت شوكليت مارشيملو',   category: 'مشروبات ساخنة', price: 105, stock: 999,
    recipe: [{ materialId: 'rm_dark_choc', amount: 60 }, { materialId: 'rm_milk', amount: 250 }, { materialId: 'rm_marshmallow', amount: 20 }] },
  { id: 'p_hot_lotus',  name: 'هوت لوتس',              category: 'مشروبات ساخنة', price: 85, stock: 999,
    recipe: [{ materialId: 'rm_lotus', amount: 30 }, { materialId: 'rm_milk', amount: 250 }] },

  // ══════════════════════════════════════════════════════════
  // Ice Coffee
  // ══════════════════════════════════════════════════════════
  { id: 'p_ice_latte',  name: 'ايس لاتيه',             category: 'Ice Coffee', price: 85, stock: 999,
    recipe: [{ materialId: 'rm_espresso', amount: 20 }, { materialId: 'rm_milk', amount: 250 }, { materialId: 'rm_ice', amount: 10 }] },
  { id: 'p_ice_mocha',  name: 'ايس موكا',              category: 'Ice Coffee', price: 105, stock: 999,
    recipe: [{ materialId: 'rm_espresso', amount: 20 }, { materialId: 'rm_milk', amount: 200 }, { materialId: 'rm_dark_choc', amount: 45 }, { materialId: 'rm_ice', amount: 10 }] },
  { id: 'p_ice_wmocha', name: 'ايس وايت موكا',          category: 'Ice Coffee', price: 105, stock: 999,
    recipe: [{ materialId: 'rm_espresso', amount: 20 }, { materialId: 'rm_milk', amount: 200 }, { materialId: 'rm_syrup_vanilla', amount: 30 }, { materialId: 'rm_ice', amount: 10 }] },
  { id: 'p_ice_span',   name: 'ايس سبانش لاتيه',       category: 'Ice Coffee', price: 110, stock: 999,
    recipe: [{ materialId: 'rm_espresso', amount: 20 }, { materialId: 'rm_milk', amount: 200 }, { materialId: 'rm_syrup_vanilla', amount: 20 }, { materialId: 'rm_ice', amount: 10 }] },
  { id: 'p_ice_watml',  name: 'ايس لاتيه بطيخ',        category: 'Ice Coffee', price: 115, stock: 999,
    recipe: [{ materialId: 'rm_espresso', amount: 20 }, { materialId: 'rm_milk', amount: 200 }, { materialId: 'rm_syrup_waterml', amount: 30 }, { materialId: 'rm_ice', amount: 10 }] },
  { id: 'p_ice_tiram',  name: 'ايس لاتيه تراميسيو',    category: 'Ice Coffee', price: 115, stock: 999,
    recipe: [{ materialId: 'rm_espresso', amount: 20 }, { materialId: 'rm_milk', amount: 200 }, { materialId: 'rm_syrup_tiramis', amount: 30 }, { materialId: 'rm_ice', amount: 10 }] },
  { id: 'p_ice_banana', name: 'ايس لاتيه دولسي موز',   category: 'Ice Coffee', price: 115, stock: 999,
    recipe: [{ materialId: 'rm_espresso', amount: 20 }, { materialId: 'rm_milk', amount: 200 }, { materialId: 'rm_syrup_banana', amount: 30 }, { materialId: 'rm_ice', amount: 10 }] },
  { id: 'p_ice_tofi',   name: 'ايس لاتيه توفي كرانش',  category: 'Ice Coffee', price: 115, stock: 999,
    recipe: [{ materialId: 'rm_espresso', amount: 20 }, { materialId: 'rm_milk', amount: 200 }, { materialId: 'rm_syrup_caramel', amount: 30 }, { materialId: 'rm_ice', amount: 10 }] },
  { id: 'p_ice_irish',  name: 'ايس لاتيه ايرش كريم',   category: 'Ice Coffee', price: 115, stock: 999,
    recipe: [{ materialId: 'rm_espresso', amount: 20 }, { materialId: 'rm_milk', amount: 200 }, { materialId: 'rm_syrup_irishcr', amount: 30 }, { materialId: 'rm_ice', amount: 10 }] },
  { id: 'p_ice_popcorn',name: 'ايس لاتيه بوب كورن',    category: 'Ice Coffee', price: 115, stock: 999,
    recipe: [{ materialId: 'rm_espresso', amount: 20 }, { materialId: 'rm_milk', amount: 200 }, { materialId: 'rm_syrup_popcorn', amount: 30 }, { materialId: 'rm_ice', amount: 10 }] },

  // ══════════════════════════════════════════════════════════
  // Fresh Juice
  // ══════════════════════════════════════════════════════════
  { id: 'p_mango_j',    name: 'مانجو',                 category: 'Fresh Juice', price: 80, stock: 999,
    recipe: [{ materialId: 'rm_puree_mango', amount: 150 }, { materialId: 'rm_ice', amount: 5 }] },
  { id: 'p_straw_j',    name: 'فراولة',                category: 'Fresh Juice', price: 80, stock: 999,
    recipe: [{ materialId: 'rm_puree_straw', amount: 150 }, { materialId: 'rm_ice', amount: 5 }] },
  { id: 'p_orange_j',   name: 'برتقال',               category: 'Fresh Juice', price: 80, stock: 999,
    recipe: [{ materialId: 'rm_puree_lemon', amount: 100 }, { materialId: 'rm_water', amount: 100 }, { materialId: 'rm_ice', amount: 5 }] },
  { id: 'p_guava_j',    name: 'جوافة',                category: 'Fresh Juice', price: 80, stock: 999,
    recipe: [{ materialId: 'rm_ice', amount: 5 }, { materialId: 'rm_water', amount: 200 }] },
  { id: 'p_lemon_j',    name: 'ليمون',                category: 'Fresh Juice', price: 70, stock: 999,
    recipe: [{ materialId: 'rm_puree_lemon', amount: 50 }, { materialId: 'rm_water', amount: 150 }, { materialId: 'rm_ice', amount: 5 }] },
  { id: 'p_lemon_mint', name: 'ليمون نعناع',           category: 'Fresh Juice', price: 75, stock: 999,
    recipe: [{ materialId: 'rm_puree_lemon', amount: 50 }, { materialId: 'rm_water', amount: 150 }, { materialId: 'rm_syrup_mint', amount: 25 }, { materialId: 'rm_ice', amount: 5 }] },
  { id: 'p_avocado',    name: 'افوكادو مكسرات',        category: 'Fresh Juice', price: 110, stock: 999,
    recipe: [{ materialId: 'rm_milk', amount: 150 }, { materialId: 'rm_ice', amount: 5 }, { materialId: 'rm_pistachio', amount: 15 }] },

  // ══════════════════════════════════════════════════════════
  // Smoothie
  // ══════════════════════════════════════════════════════════
  { id: 'p_smth_blue',  name: 'سموزي توت ازرق',        category: 'Smoothie', price: 85, stock: 999,
    recipe: [{ materialId: 'rm_ice', amount: 15 }, { materialId: 'rm_puree_blue', amount: 70 }, { materialId: 'rm_water', amount: 150 }, { materialId: 'rm_garnish', amount: 20 }] },
  { id: 'p_smth_mango', name: 'سموزي مانجو',           category: 'Smoothie', price: 85, stock: 999,
    recipe: [{ materialId: 'rm_ice', amount: 15 }, { materialId: 'rm_puree_mango', amount: 70 }, { materialId: 'rm_water', amount: 150 }, { materialId: 'rm_garnish', amount: 20 }] },
  { id: 'p_smth_straw', name: 'سموزي فراولة',          category: 'Smoothie', price: 85, stock: 999,
    recipe: [{ materialId: 'rm_ice', amount: 15 }, { materialId: 'rm_puree_straw', amount: 70 }, { materialId: 'rm_water', amount: 150 }, { materialId: 'rm_garnish', amount: 20 }] },
  { id: 'p_smth_lemon', name: 'سموزي ليمون نعناع',     category: 'Smoothie', price: 85, stock: 999,
    recipe: [{ materialId: 'rm_ice', amount: 15 }, { materialId: 'rm_puree_lemon', amount: 50 }, { materialId: 'rm_water', amount: 150 }, { materialId: 'rm_garnish', amount: 20 }, { materialId: 'rm_syrup_mint', amount: 25 }] },
  { id: 'p_smth_redb',  name: 'سموزي ريدبول',          category: 'Smoothie', price: 85, stock: 999,
    recipe: [{ materialId: 'rm_ice', amount: 15 }, { materialId: 'rm_redbull_pwd', amount: 60 }, { materialId: 'rm_water', amount: 150 }, { materialId: 'rm_garnish', amount: 20 }] },

  // ══════════════════════════════════════════════════════════
  // Frappe
  // ══════════════════════════════════════════════════════════
  { id: 'p_fr_classic', name: 'فرابيه كلاسيك',         category: 'Frappe', price: 80, stock: 999,
    recipe: [{ materialId: 'rm_frappe_base', amount: 60 }, { materialId: 'rm_milk', amount: 150 }, { materialId: 'rm_ice', amount: 15 }] },
  { id: 'p_fr_caramel', name: 'فرابيه كراميل',         category: 'Frappe', price: 90, stock: 999,
    recipe: [{ materialId: 'rm_frappe_base', amount: 60 }, { materialId: 'rm_milk', amount: 150 }, { materialId: 'rm_syrup_caramel', amount: 30 }, { materialId: 'rm_ice', amount: 15 }] },
  { id: 'p_fr_coffee',  name: 'فرابيه كوفي',           category: 'Frappe', price: 80, stock: 999,
    recipe: [{ materialId: 'rm_frappe_base', amount: 60 }, { materialId: 'rm_milk', amount: 150 }, { materialId: 'rm_espresso', amount: 20 }, { materialId: 'rm_ice', amount: 15 }] },
  { id: 'p_fr_choc',    name: 'فرابيه شوكليت',         category: 'Frappe', price: 80, stock: 999,
    recipe: [{ materialId: 'rm_frappe_base', amount: 60 }, { materialId: 'rm_milk', amount: 150 }, { materialId: 'rm_dark_choc', amount: 40 }, { materialId: 'rm_ice', amount: 15 }] },
  { id: 'p_fr_popcorn', name: 'فرابيه بوب كورن',       category: 'Frappe', price: 95, stock: 999,
    recipe: [{ materialId: 'rm_frappe_base', amount: 60 }, { materialId: 'rm_milk', amount: 150 }, { materialId: 'rm_syrup_popcorn', amount: 30 }, { materialId: 'rm_ice', amount: 15 }] },
  { id: 'p_fr_butters', name: 'فرابيه بتر اسكوتش',     category: 'Frappe', price: 100, stock: 999,
    recipe: [{ materialId: 'rm_frappe_base', amount: 60 }, { materialId: 'rm_milk', amount: 150 }, { materialId: 'rm_syrup_caramel', amount: 30 }, { materialId: 'rm_ice', amount: 15 }] },
  { id: 'p_fr_yogstraw',name: 'فرابيه زبادي فراولة',   category: 'Frappe', price: 110, stock: 999,
    recipe: [{ materialId: 'rm_yogurt', amount: 80 }, { materialId: 'rm_sauce_straw', amount: 40 }, { materialId: 'rm_ice', amount: 15 }] },
  { id: 'p_fr_yogmix',  name: 'فرابيه زبادي ميكس بري', category: 'Frappe', price: 110, stock: 999,
    recipe: [{ materialId: 'rm_yogurt', amount: 80 }, { materialId: 'rm_sauce_mixed', amount: 40 }, { materialId: 'rm_ice', amount: 15 }] },
  { id: 'p_fr_mocha',   name: 'فرابيه موكا',           category: 'Frappe', price: 110, stock: 999,
    recipe: [{ materialId: 'rm_frappe_base', amount: 60 }, { materialId: 'rm_milk', amount: 150 }, { materialId: 'rm_dark_choc', amount: 40 }, { materialId: 'rm_espresso', amount: 20 }, { materialId: 'rm_ice', amount: 15 }] },
  { id: 'p_fr_cheesecake',name:'فرابيه تشيز كيك فراولة',category:'Frappe', price:95, stock:999,
    recipe:[{materialId:'rm_frappe_base',amount:60},{materialId:'rm_milk',amount:150},{materialId:'rm_sauce_straw',amount:35},{materialId:'rm_ice',amount:15}]},
  { id: 'p_fr_irish',   name: 'فرابيه ايرش كريم',      category: 'Frappe', price: 95, stock: 999,
    recipe: [{ materialId: 'rm_frappe_base', amount: 60 }, { materialId: 'rm_milk', amount: 150 }, { materialId: 'rm_syrup_irishcr', amount: 30 }, { materialId: 'rm_ice', amount: 15 }] },
  { id: 'p_fr_saltcar', name: 'فرابيه كراميل مملح',    category: 'Frappe', price: 95, stock: 999,
    recipe: [{ materialId: 'rm_frappe_base', amount: 60 }, { materialId: 'rm_milk', amount: 150 }, { materialId: 'rm_syrup_caramel', amount: 30 }, { materialId: 'rm_ice', amount: 15 }] },
  { id: 'p_fr_tiram',   name: 'فرابيه ترامسيو',        category: 'Frappe', price: 95, stock: 999,
    recipe: [{ materialId: 'rm_frappe_base', amount: 60 }, { materialId: 'rm_milk', amount: 150 }, { materialId: 'rm_syrup_tiramis', amount: 30 }, { materialId: 'rm_ice', amount: 15 }] },
  { id: 'p_fr_yogurt',  name: 'فرابيه زبادي',          category: 'Frappe', price: 100, stock: 999,
    recipe: [{ materialId: 'rm_yogurt', amount: 100 }, { materialId: 'rm_ice', amount: 15 }, { materialId: 'rm_syrup_vanilla', amount: 20 }] },
  { id: 'p_fr_shea',    name: 'فرابيه زبادي شيا',      category: 'Frappe', price: 110, stock: 999,
    recipe: [{ materialId: 'rm_yogurt', amount: 80 }, { materialId: 'rm_sauce_shea', amount: 35 }, { materialId: 'rm_ice', amount: 15 }] },

  // ══════════════════════════════════════════════════════════
  // Milkshake
  // ══════════════════════════════════════════════════════════
  { id: 'p_mk_vanilla', name: 'ميلك شيك فانليا',       category: 'Milkshake', price: 85, stock: 999,
    recipe: [{ materialId: 'rm_icecream', amount: 150 }, { materialId: 'rm_milk', amount: 150 }, { materialId: 'rm_syrup_vanilla', amount: 20 }] },
  { id: 'p_mk_choc',    name: 'ميلك شيك شوكليت',       category: 'Milkshake', price: 85, stock: 999,
    recipe: [{ materialId: 'rm_icecream', amount: 150 }, { materialId: 'rm_milk', amount: 150 }, { materialId: 'rm_dark_choc', amount: 40 }] },
  { id: 'p_mk_straw',   name: 'ميلك شيك فراولة',       category: 'Milkshake', price: 85, stock: 999,
    recipe: [{ materialId: 'rm_icecream', amount: 150 }, { materialId: 'rm_milk', amount: 150 }, { materialId: 'rm_sauce_straw', amount: 40 }] },
  { id: 'p_mk_mango',   name: 'ميلك شيك مانجو',        category: 'Milkshake', price: 85, stock: 999,
    recipe: [{ materialId: 'rm_icecream', amount: 150 }, { materialId: 'rm_milk', amount: 150 }, { materialId: 'rm_sauce_mango', amount: 40 }] },
  { id: 'p_mk_caramel', name: 'ميلك شيك كراميل',       category: 'Milkshake', price: 90, stock: 999,
    recipe: [{ materialId: 'rm_icecream', amount: 150 }, { materialId: 'rm_milk', amount: 150 }, { materialId: 'rm_syrup_caramel', amount: 30 }] },
  { id: 'p_mk_blue',    name: 'ميلك شيك توت ازرق',     category: 'Milkshake', price: 95, stock: 999,
    recipe: [{ materialId: 'rm_icecream', amount: 150 }, { materialId: 'rm_milk', amount: 150 }, { materialId: 'rm_sauce_blue', amount: 40 }] },
  { id: 'p_mk_oreo',    name: 'ميلك شيك اوريو',        category: 'Milkshake', price: 95, stock: 999,
    recipe: [{ materialId: 'rm_icecream', amount: 150 }, { materialId: 'rm_milk', amount: 150 }, { materialId: 'rm_oreo', amount: 40 }] },
  { id: 'p_mk_nutella', name: 'ميلك شيك نوتيلا',       category: 'Milkshake', price: 90, stock: 999,
    recipe: [{ materialId: 'rm_icecream', amount: 150 }, { materialId: 'rm_milk', amount: 150 }, { materialId: 'rm_nutella', amount: 40 }] },
  { id: 'p_mk_pista',   name: 'ميلك شيك فسدق',         category: 'Milkshake', price: 100, stock: 999,
    recipe: [{ materialId: 'rm_icecream', amount: 150 }, { materialId: 'rm_milk', amount: 150 }, { materialId: 'rm_pistachio', amount: 30 }] },
  { id: 'p_mk_lotus',   name: 'ميلك شيك لوتس',         category: 'Milkshake', price: 90, stock: 999,
    recipe: [{ materialId: 'rm_icecream', amount: 150 }, { materialId: 'rm_milk', amount: 150 }, { materialId: 'rm_lotus', amount: 30 }] },

  // ══════════════════════════════════════════════════════════
  // Mojito & Pinacola
  // ══════════════════════════════════════════════════════════
  { id: 'p_moj_classic',name: 'موهيتو كلاسيك',         category: 'Mojito', price: 80, stock: 999,
    recipe: [{ materialId: 'rm_syrup_mojito', amount: 30 }, { materialId: 'rm_lemon', amount: 2 }, { materialId: 'rm_mint', amount: 15 }, { materialId: 'rm_ice_crush', amount: 15 }, { materialId: 'rm_orange_dry', amount: 2 }, { materialId: 'rm_rosemary', amount: 1 }, { materialId: 'rm_soda_can', amount: 1 }] },
  { id: 'p_moj_straw',  name: 'موهيتو فراولة',         category: 'Mojito', price: 90, stock: 999,
    recipe: [{ materialId: 'rm_syrup_mojito', amount: 30 }, { materialId: 'rm_lemon', amount: 2 }, { materialId: 'rm_mint', amount: 15 }, { materialId: 'rm_ice_crush', amount: 15 }, { materialId: 'rm_orange_dry', amount: 2 }, { materialId: 'rm_rosemary', amount: 1 }, { materialId: 'rm_soda_can', amount: 1 }, { materialId: 'rm_sauce_straw', amount: 35 }] },
  { id: 'p_moj_blue',   name: 'موهيتو توت ازرق',       category: 'Mojito', price: 90, stock: 999,
    recipe: [{ materialId: 'rm_syrup_mojito', amount: 30 }, { materialId: 'rm_lemon', amount: 2 }, { materialId: 'rm_mint', amount: 15 }, { materialId: 'rm_ice_crush', amount: 15 }, { materialId: 'rm_orange_dry', amount: 2 }, { materialId: 'rm_rosemary', amount: 1 }, { materialId: 'rm_soda_can', amount: 1 }, { materialId: 'rm_sauce_blue', amount: 35 }] },
  { id: 'p_moj_mixed',  name: 'موهيتو ميكس بيري',      category: 'Mojito', price: 90, stock: 999,
    recipe: [{ materialId: 'rm_syrup_mojito', amount: 30 }, { materialId: 'rm_lemon', amount: 2 }, { materialId: 'rm_mint', amount: 15 }, { materialId: 'rm_ice_crush', amount: 15 }, { materialId: 'rm_orange_dry', amount: 2 }, { materialId: 'rm_rosemary', amount: 1 }, { materialId: 'rm_soda_can', amount: 1 }, { materialId: 'rm_sauce_mixed', amount: 35 }] },
  { id: 'p_moj_peach',  name: 'موهيتو خوخ',            category: 'Mojito', price: 90, stock: 999,
    recipe: [{ materialId: 'rm_syrup_mojito', amount: 30 }, { materialId: 'rm_lemon', amount: 2 }, { materialId: 'rm_mint', amount: 15 }, { materialId: 'rm_ice_crush', amount: 15 }, { materialId: 'rm_orange_dry', amount: 2 }, { materialId: 'rm_rosemary', amount: 1 }, { materialId: 'rm_soda_can', amount: 1 }, { materialId: 'rm_sauce_peach', amount: 35 }] },
  { id: 'p_moj_mango',  name: 'موهيتو مانجو',          category: 'Mojito', price: 90, stock: 999,
    recipe: [{ materialId: 'rm_syrup_mojito', amount: 30 }, { materialId: 'rm_lemon', amount: 2 }, { materialId: 'rm_mint', amount: 15 }, { materialId: 'rm_ice_crush', amount: 15 }, { materialId: 'rm_orange_dry', amount: 2 }, { materialId: 'rm_rosemary', amount: 1 }, { materialId: 'rm_soda_can', amount: 1 }, { materialId: 'rm_sauce_mango', amount: 35 }] },
  { id: 'p_moj_raspb',  name: 'موهيتو راسبيري',        category: 'Mojito', price: 90, stock: 999,
    recipe: [{ materialId: 'rm_syrup_mojito', amount: 30 }, { materialId: 'rm_lemon', amount: 2 }, { materialId: 'rm_mint', amount: 15 }, { materialId: 'rm_ice_crush', amount: 15 }, { materialId: 'rm_orange_dry', amount: 2 }, { materialId: 'rm_rosemary', amount: 1 }, { materialId: 'rm_soda_can', amount: 1 }, { materialId: 'rm_sauce_raspb', amount: 35 }] },
  { id: 'p_moj_passion',name: 'موهيتو باشون',           category: 'Mojito', price: 90, stock: 999,
    recipe: [{ materialId: 'rm_syrup_mojito', amount: 30 }, { materialId: 'rm_lemon', amount: 2 }, { materialId: 'rm_mint', amount: 15 }, { materialId: 'rm_ice_crush', amount: 15 }, { materialId: 'rm_orange_dry', amount: 2 }, { materialId: 'rm_rosemary', amount: 1 }, { materialId: 'rm_soda_can', amount: 1 }, { materialId: 'rm_sauce_passion', amount: 35 }] },
  { id: 'p_moj_kiwi',   name: 'موهيتو كيوي',           category: 'Mojito', price: 90, stock: 999,
    recipe: [{ materialId: 'rm_syrup_mojito', amount: 30 }, { materialId: 'rm_lemon', amount: 2 }, { materialId: 'rm_mint', amount: 15 }, { materialId: 'rm_ice_crush', amount: 15 }, { materialId: 'rm_orange_dry', amount: 2 }, { materialId: 'rm_rosemary', amount: 1 }, { materialId: 'rm_soda_can', amount: 1 }, { materialId: 'rm_sauce_kiwi', amount: 35 }] },
  { id: 'p_moj_apple',  name: 'موهيتو جرين ابل',       category: 'Mojito', price: 90, stock: 999,
    recipe: [{ materialId: 'rm_syrup_mojito', amount: 30 }, { materialId: 'rm_lemon', amount: 2 }, { materialId: 'rm_mint', amount: 15 }, { materialId: 'rm_ice_crush', amount: 15 }, { materialId: 'rm_orange_dry', amount: 2 }, { materialId: 'rm_rosemary', amount: 1 }, { materialId: 'rm_soda_can', amount: 1 }, { materialId: 'rm_sauce_apple', amount: 35 }] },
  { id: 'p_moj_shea',   name: 'موهيتو شيا',            category: 'Mojito', price: 100, stock: 999,
    recipe: [{ materialId: 'rm_syrup_mojito', amount: 30 }, { materialId: 'rm_lemon', amount: 2 }, { materialId: 'rm_mint', amount: 15 }, { materialId: 'rm_ice_crush', amount: 15 }, { materialId: 'rm_orange_dry', amount: 2 }, { materialId: 'rm_rosemary', amount: 1 }, { materialId: 'rm_soda_can', amount: 1 }, { materialId: 'rm_sauce_shea', amount: 35 }] },
  // Pina Colada
  { id: 'p_pina_class', name: 'بيناكولادا كلاسيك',     category: 'Mojito', price: 80, stock: 999,
    recipe: [{ materialId: 'rm_syrup_pinacol', amount: 30 }, { materialId: 'rm_lemon', amount: 2 }, { materialId: 'rm_mint', amount: 15 }, { materialId: 'rm_ice_crush', amount: 15 }, { materialId: 'rm_orange_dry', amount: 2 }, { materialId: 'rm_rosemary', amount: 1 }, { materialId: 'rm_soda_can', amount: 1 }] },
  { id: 'p_pina_mixed', name: 'بيناكولادا ميكس بيري',  category: 'Mojito', price: 90, stock: 999,
    recipe: [{ materialId: 'rm_syrup_pinacol', amount: 30 }, { materialId: 'rm_lemon', amount: 2 }, { materialId: 'rm_mint', amount: 15 }, { materialId: 'rm_ice_crush', amount: 15 }, { materialId: 'rm_orange_dry', amount: 2 }, { materialId: 'rm_rosemary', amount: 1 }, { materialId: 'rm_soda_can', amount: 1 }, { materialId: 'rm_sauce_mixed', amount: 35 }] },
  { id: 'p_pina_straw', name: 'بيناكولادا فراولة',     category: 'Mojito', price: 90, stock: 999,
    recipe: [{ materialId: 'rm_syrup_pinacol', amount: 30 }, { materialId: 'rm_lemon', amount: 2 }, { materialId: 'rm_mint', amount: 15 }, { materialId: 'rm_ice_crush', amount: 15 }, { materialId: 'rm_orange_dry', amount: 2 }, { materialId: 'rm_rosemary', amount: 1 }, { materialId: 'rm_soda_can', amount: 1 }, { materialId: 'rm_sauce_straw', amount: 35 }] },

  // ══════════════════════════════════════════════════════════
  // Matcha & Ice Tea
  // ══════════════════════════════════════════════════════════
  { id: 'p_icetea_rose',name: 'ايس تي لاتيه روز',      category: 'Matcha', price: 85, stock: 999,
    recipe: [{ materialId: 'rm_green_tea', amount: 2 }, { materialId: 'rm_milk', amount: 150 }, { materialId: 'rm_syrup_rose', amount: 20 }, { materialId: 'rm_ice', amount: 10 }] },
  { id: 'p_icetea_peach',name:'ايس تي خوخ',            category: 'Matcha', price: 85, stock: 999,
    recipe: [{ materialId: 'rm_green_tea', amount: 2 }, { materialId: 'rm_water', amount: 200 }, { materialId: 'rm_syrup_peach', amount: 20 }, { materialId: 'rm_ice', amount: 10 }] },
  { id: 'p_lemon_rose',  name: 'كركديه ليمونادا',       category: 'Matcha', price: 85, stock: 999,
    recipe: [{ materialId: 'rm_syrup_rose', amount: 30 }, { materialId: 'rm_puree_lemon', amount: 30 }, { materialId: 'rm_water', amount: 150 }, { materialId: 'rm_ice', amount: 10 }] },
  { id: 'p_matcha',      name: 'ايس ماتشا',             category: 'Matcha', price: 90, stock: 999,
    recipe: [{ materialId: 'rm_matcha', amount: 10 }, { materialId: 'rm_milk', amount: 250 }, { materialId: 'rm_ice', amount: 10 }] },
  { id: 'p_matcha_span', name: 'ايس ماتشا اسبانش',     category: 'Matcha', price: 95, stock: 999,
    recipe: [{ materialId: 'rm_matcha', amount: 10 }, { materialId: 'rm_milk', amount: 200 }, { materialId: 'rm_syrup_vanilla', amount: 20 }, { materialId: 'rm_ice', amount: 10 }] },
  { id: 'p_matcha_straw',name: 'ايس ماتشا فراولة',     category: 'Matcha', price: 95, stock: 999,
    recipe: [{ materialId: 'rm_matcha', amount: 10 }, { materialId: 'rm_milk', amount: 200 }, { materialId: 'rm_sauce_straw', amount: 30 }, { materialId: 'rm_ice', amount: 10 }] },
  { id: 'p_matcha_mango',name: 'ايس ماتشا مانجو',      category: 'Matcha', price: 95, stock: 999,
    recipe: [{ materialId: 'rm_matcha', amount: 10 }, { materialId: 'rm_milk', amount: 200 }, { materialId: 'rm_sauce_mango', amount: 30 }, { materialId: 'rm_ice', amount: 10 }] },

  // ══════════════════════════════════════════════════════════
  // Pancakes
  // ══════════════════════════════════════════════════════════
  { id: 'p_pan_nut_12',  name: 'بانكيك نوتيلا 12',     category: 'Pancakes', price: 85, stock: 999,
    recipe: [{ materialId: 'rm_pancake_mix', amount: 150 }, { materialId: 'rm_nutella', amount: 40 }] },
  { id: 'p_pan_nut_24',  name: 'بانكيك نوتيلا 24',     category: 'Pancakes', price: 100, stock: 999,
    recipe: [{ materialId: 'rm_pancake_mix', amount: 300 }, { materialId: 'rm_nutella', amount: 80 }] },
  { id: 'p_pan_choc_12', name: 'بانكيك شوكليت 12',     category: 'Pancakes', price: 85, stock: 999,
    recipe: [{ materialId: 'rm_pancake_mix', amount: 150 }, { materialId: 'rm_dark_choc', amount: 50 }] },
  { id: 'p_pan_choc_24', name: 'بانكيك شوكليت 24',     category: 'Pancakes', price: 100, stock: 999,
    recipe: [{ materialId: 'rm_pancake_mix', amount: 300 }, { materialId: 'rm_dark_choc', amount: 100 }] },
  { id: 'p_pan_kin_12',  name: 'بانكيك كيندر 12',      category: 'Pancakes', price: 90, stock: 999,
    recipe: [{ materialId: 'rm_pancake_mix', amount: 150 }, { materialId: 'rm_kinder', amount: 40 }] },
  { id: 'p_pan_kin_24',  name: 'بانكيك كيندر 24',      category: 'Pancakes', price: 110, stock: 999,
    recipe: [{ materialId: 'rm_pancake_mix', amount: 300 }, { materialId: 'rm_kinder', amount: 80 }] },
  { id: 'p_pan_lot_12',  name: 'بانكيك لوتس 12',       category: 'Pancakes', price: 85, stock: 999,
    recipe: [{ materialId: 'rm_pancake_mix', amount: 150 }, { materialId: 'rm_lotus', amount: 40 }] },
  { id: 'p_pan_lot_24',  name: 'بانكيك لوتس 24',       category: 'Pancakes', price: 100, stock: 999,
    recipe: [{ materialId: 'rm_pancake_mix', amount: 300 }, { materialId: 'rm_lotus', amount: 80 }] },
  { id: 'p_pan_pis_12',  name: 'بانكيك فسدق 12',       category: 'Pancakes', price: 100, stock: 999,
    recipe: [{ materialId: 'rm_pancake_mix', amount: 150 }, { materialId: 'rm_pistachio', amount: 40 }] },
  { id: 'p_pan_pis_24',  name: 'بانكيك فسدق 24',       category: 'Pancakes', price: 120, stock: 999,
    recipe: [{ materialId: 'rm_pancake_mix', amount: 300 }, { materialId: 'rm_pistachio', amount: 80 }] },

  // ══════════════════════════════════════════════════════════
  // Waffle
  // ══════════════════════════════════════════════════════════
  { id: 'p_waf_nut',    name: 'وافل نوتيلا',            category: 'Waffle', price: 90, stock: 999,
    recipe: [{ materialId: 'rm_waffle_mix', amount: 200 }, { materialId: 'rm_nutella', amount: 50 }] },
  { id: 'p_waf_choc',   name: 'وافل شوكليت',            category: 'Waffle', price: 90, stock: 999,
    recipe: [{ materialId: 'rm_waffle_mix', amount: 200 }, { materialId: 'rm_dark_choc', amount: 60 }] },
  { id: 'p_waf_kin',    name: 'وافل كيندر',             category: 'Waffle', price: 100, stock: 999,
    recipe: [{ materialId: 'rm_waffle_mix', amount: 200 }, { materialId: 'rm_kinder', amount: 50 }] },
  { id: 'p_waf_lot',    name: 'وافل لوتس',              category: 'Waffle', price: 90, stock: 999,
    recipe: [{ materialId: 'rm_waffle_mix', amount: 200 }, { materialId: 'rm_lotus', amount: 50 }] },
  { id: 'p_waf_pis',    name: 'وافل فسدق',              category: 'Waffle', price: 120, stock: 999,
    recipe: [{ materialId: 'rm_waffle_mix', amount: 200 }, { materialId: 'rm_pistachio', amount: 50 }] },

  // ══════════════════════════════════════════════════════════
  // Sunday
  // ══════════════════════════════════════════════════════════
  { id: 'p_sun_straw_c',name: 'سانداي فراولة كأس',      category: 'Sunday', price: 30, stock: 999,
    recipe: [{ materialId: 'rm_sunday_base', amount: 100 }, { materialId: 'rm_sauce_straw', amount: 30 }] },
  { id: 'p_sun_straw_n',name: 'سانداي فراولة كونو',      category: 'Sunday', price: 50, stock: 999,
    recipe: [{ materialId: 'rm_sunday_base', amount: 150 }, { materialId: 'rm_sauce_straw', amount: 40 }] },
  { id: 'p_sun_blue_c', name: 'سانداي بلو بيري كأس',    category: 'Sunday', price: 30, stock: 999,
    recipe: [{ materialId: 'rm_sunday_base', amount: 100 }, { materialId: 'rm_sauce_blue', amount: 30 }] },
  { id: 'p_sun_blue_n', name: 'سانداي بلو بيري كونو',   category: 'Sunday', price: 50, stock: 999,
    recipe: [{ materialId: 'rm_sunday_base', amount: 150 }, { materialId: 'rm_sauce_blue', amount: 40 }] },
  { id: 'p_sun_van_c',  name: 'سانداي فانيليا كأس',     category: 'Sunday', price: 30, stock: 999,
    recipe: [{ materialId: 'rm_sunday_base', amount: 100 }, { materialId: 'rm_syrup_vanilla', amount: 20 }] },
  { id: 'p_sun_van_n',  name: 'سانداي فانيليا كونو',    category: 'Sunday', price: 50, stock: 999,
    recipe: [{ materialId: 'rm_sunday_base', amount: 150 }, { materialId: 'rm_syrup_vanilla', amount: 30 }] },
  { id: 'p_sun_choc_c', name: 'سانداي شيكولاته كأس',    category: 'Sunday', price: 30, stock: 999,
    recipe: [{ materialId: 'rm_sunday_base', amount: 100 }, { materialId: 'rm_dark_choc', amount: 30 }] },
  { id: 'p_sun_choc_n', name: 'سانداي شيكولاته كونو',   category: 'Sunday', price: 50, stock: 999,
    recipe: [{ materialId: 'rm_sunday_base', amount: 150 }, { materialId: 'rm_dark_choc', amount: 40 }] },

  // ══════════════════════════════════════════════════════════
  // Soft Drinks
  // ══════════════════════════════════════════════════════════
  { id: 'p_can',        name: 'مشروب غازي كان',          category: 'Soft Drinks', price: 45, stock: 999,
    recipe: [{ materialId: 'rm_can', amount: 1 }] },
  { id: 'p_redbull',    name: 'ريد بول',                  category: 'Soft Drinks', price: 90, stock: 999,
    recipe: [{ materialId: 'rm_redbull', amount: 1 }] },
  { id: 'p_redbull_flv',name: 'ريد بول فليفر',            category: 'Soft Drinks', price: 100, stock: 999,
    recipe: [{ materialId: 'rm_redbull_flv', amount: 1 }] },
  { id: 'p_water',      name: 'مياه صغيرة',               category: 'Soft Drinks', price: 15, stock: 999,
    recipe: [{ materialId: 'rm_water_bottle', amount: 1 }] },
  { id: 'p_fairouz',    name: 'فيروز',                    category: 'Soft Drinks', price: 55, stock: 999,
    recipe: [{ materialId: 'rm_fairouz', amount: 1 }] },
  { id: 'p_brill',      name: 'بريل',                     category: 'Soft Drinks', price: 55, stock: 999,
    recipe: [{ materialId: 'rm_brill', amount: 1 }] },

  // ══════════════════════════════════════════════════════════
  // Dessert — السعر 0 يعدّله الأدمن
  // ══════════════════════════════════════════════════════════
  { id: 'p_eng_cake',   name: 'English Cake',             category: 'Dessert', price: 0, stock: 999,
    recipe: [{ materialId: 'rm_dessert_base', amount: 150 }] },
  { id: 'p_san_seb',    name: 'San Sebastián',            category: 'Dessert', price: 0, stock: 999,
    recipe: [{ materialId: 'rm_cream_cheese', amount: 200 }, { materialId: 'rm_dessert_base', amount: 100 }] },
  { id: 'p_brownies',   name: 'Brownies',                 category: 'Dessert', price: 0, stock: 999,
    recipe: [{ materialId: 'rm_dessert_base', amount: 120 }, { materialId: 'rm_dark_choc', amount: 50 }] },
  { id: 'p_tiramisu',   name: 'Tiramisu',                 category: 'Dessert', price: 0, stock: 999,
    recipe: [{ materialId: 'rm_cream_cheese', amount: 150 }, { materialId: 'rm_espresso', amount: 20 }, { materialId: 'rm_dessert_base', amount: 100 }] },
  { id: 'p_cookies',    name: 'Cookies',                  category: 'Dessert', price: 0, stock: 999,
    recipe: [{ materialId: 'rm_dessert_base', amount: 100 }, { materialId: 'rm_dark_choc', amount: 30 }] },
  { id: 'p_honey_cake', name: 'Honey Cake',               category: 'Dessert', price: 0, stock: 999,
    recipe: [{ materialId: 'rm_dessert_base', amount: 150 }, { materialId: 'rm_honey', amount: 40 }] },
  { id: 'p_carrot_cake',name: 'Carrot Cake',              category: 'Dessert', price: 0, stock: 999,
    recipe: [{ materialId: 'rm_dessert_base', amount: 150 }] },
  { id: 'p_choc_cake',  name: 'Chocolate Cake',           category: 'Dessert', price: 0, stock: 999,
    recipe: [{ materialId: 'rm_dessert_base', amount: 150 }, { materialId: 'rm_dark_choc', amount: 60 }] },
  { id: 'p_molten',     name: 'Molten Cake',              category: 'Dessert', price: 0, stock: 999,
    recipe: [{ materialId: 'rm_dessert_base', amount: 120 }, { materialId: 'rm_dark_choc', amount: 50 }] },
  { id: 'p_ecler',      name: 'Ecler',                    category: 'Dessert', price: 0, stock: 999,
    recipe: [{ materialId: 'rm_dessert_base', amount: 100 }, { materialId: 'rm_cream_cheese', amount: 60 }] },

  // ══════════════════════════════════════════════════════════
  // Croissant — السعر 0 يعدّله الأدمن
  // ══════════════════════════════════════════════════════════
  { id: 'p_cr_plain',   name: 'Plain Croissant',          category: 'Croissant', price: 0, stock: 999,
    recipe: [{ materialId: 'rm_croissant', amount: 1 }] },
  { id: 'p_cr_halomi',  name: 'Halomi Sandwich',          category: 'Croissant', price: 0, stock: 999,
    recipe: [{ materialId: 'rm_croissant', amount: 1 }, { materialId: 'rm_halomi', amount: 60 }] },
  { id: 'p_cr_smokebeef',name:'Smoke Beef',               category: 'Croissant', price: 0, stock: 999,
    recipe: [{ materialId: 'rm_croissant', amount: 1 }, { materialId: 'rm_smoked_beef', amount: 60 }] },
  { id: 'p_cr_turkey',  name: 'Turkey Chicken',           category: 'Croissant', price: 0, stock: 999,
    recipe: [{ materialId: 'rm_croissant', amount: 1 }, { materialId: 'rm_turkey', amount: 60 }] },
  { id: 'p_cr_mixcheese',name:'Mix Cheese Croissant',     category: 'Croissant', price: 0, stock: 999,
    recipe: [{ materialId: 'rm_croissant', amount: 1 }, { materialId: 'rm_cheese_mix', amount: 50 }] },
  { id: 'p_cr_smk_turk',name: 'Smoked Turkey Croissant', category: 'Croissant', price: 0, stock: 999,
    recipe: [{ materialId: 'rm_croissant', amount: 1 }, { materialId: 'rm_turkey', amount: 60 }] },
  { id: 'p_cr_smk_beef',name: 'Smoked Beef Croissant',   category: 'Croissant', price: 0, stock: 999,
    recipe: [{ materialId: 'rm_croissant', amount: 1 }, { materialId: 'rm_smoked_beef', amount: 60 }] },
  // Sweet Croissant
  { id: 'p_cr_nutella', name: 'Nutella Croissant',        category: 'Sweet Croissant', price: 0, stock: 999,
    recipe: [{ materialId: 'rm_croissant', amount: 1 }, { materialId: 'rm_nutella', amount: 40 }] },
  { id: 'p_cr_pista',   name: 'Pistachio Croissant',      category: 'Sweet Croissant', price: 0, stock: 999,
    recipe: [{ materialId: 'rm_croissant', amount: 1 }, { materialId: 'rm_pistachio', amount: 35 }] },
  { id: 'p_cr_kinder',  name: 'Kinder Croissant',         category: 'Sweet Croissant', price: 0, stock: 999,
    recipe: [{ materialId: 'rm_croissant', amount: 1 }, { materialId: 'rm_kinder', amount: 40 }] },
  { id: 'p_cr_wchoc',   name: 'White Chocolate Croissant',category: 'Sweet Croissant', price: 0, stock: 999,
    recipe: [{ materialId: 'rm_croissant', amount: 1 }, { materialId: 'rm_white_choc', amount: 40 }] },
]
