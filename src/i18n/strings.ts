/**
 * Every UI string on the site lives here. Components must not hardcode text.
 * Values are taken verbatim from the build spec, Appendix A.
 *
 * Kurdish (Sorani, Arabic script) was added as a third language. It hasn't
 * been reviewed by a native speaker — the UI strings below are workable, but
 * the medical/technical terms in products.json's `_ku` fields especially
 * need a native check before this goes in front of real customers.
 */

export type Lang = 'ar' | 'en' | 'ku';

export const LANGS: Lang[] = ['ar', 'en', 'ku'];
export const DEFAULT_LANG: Lang = 'en';

/** Brand statement, shown only in English mode. */
export const HERO_LINE_1 = 'SHM. Your Trusted Partner for Medical Instrument Selection.';
export const HERO_LINE_2 = 'Powered by an Iraqi Medical Student.';
/** Arabic equivalents, shown only in Arabic mode — one language at a time, never both. */
export const HERO_LINE_1_AR = 'شريكك الموثوق لاختيار أدواتك الجراحية.';
export const HERO_LINE_2_AR = 'بدعم من طالب طب عراقي.';
/** Kurdish (Sorani) equivalents, shown only in Kurdish mode. */
export const HERO_LINE_1_KU = 'هاوبەشی متمانەپێکراوت بۆ هەڵبژاردنی ئامرازی پزیشکی.';
export const HERO_LINE_2_KU = 'پاڵپشتی کراوە لەلایەن خوێندکارێکی پزیشکی عێراقی.';

export const WHATSAPP_NUMBER = '07858325208';
export const WHATSAPP_INTL = '9647858325208';
export const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_INTL}`;

export const INSTAGRAM_URL = 'https://www.instagram.com/shm_1q/';
export const FACEBOOK_URL = 'https://www.facebook.com/SHM.I0';

export const SITE_URL = 'https://shm-website.thoalfekar2004work.workers.dev';

/** The three trust claims shown as a checklist (proof strip, footer). */
export const PROOF_POINTS: { ar: string; en: string; ku: string }[] = [
  {
    ar: 'نفحص كل قطعة قبل الشحن',
    en: 'QC on every piece before shipping',
    ku: 'هەموو پارچەیەک پێش ناردن پشکنین دەکرێت',
  },
  {
    ar: 'تبديل متوفر عند وجود خلل واضح',
    en: 'Exchange guarantee for clear defects',
    ku: 'گۆڕینەوە بەردەستە بۆ هەر کێماسییەکی ڕوون',
  },
  {
    ar: 'ستانلس ستيل بعلامة CE',
    en: 'CE-marked stainless steel',
    ku: 'پۆڵای زنگ نەگر بە مۆری CE',
  },
];

type Dict = Record<string, { ar: string; en: string; ku: string }>;

export const t: Dict = {
  'nav.catalog': { ar: 'الكتالوج', en: 'Catalog', ku: 'کاتالۆگ' },
  'nav.sets': { ar: 'الستات', en: 'Sets', ku: 'سێتەکان' },
  'hero.cta': { ar: 'تصفح الكتالوج', en: 'Browse the Catalog', ku: 'گەڕان بە کاتالۆگدا' },
  'grid.from': { ar: 'يبدأ من', en: 'From', ku: 'دەستپێدەکات لە' },
  'product.addToCart': { ar: 'أضف للسلة', en: 'Add to Cart', ku: 'زیادکردن بۆ سەپەت' },
  'product.inCart': { ar: 'بالسلة', en: 'In cart', ku: 'لە سەپەتدا' },
  'product.viewCart': { ar: 'شوف السلة', en: 'View cart', ku: 'بینینی سەپەت' },
  'product.orderWhatsApp': {
    ar: 'اطلب عبر واتساب',
    en: 'Order on WhatsApp',
    ku: 'داواکردن لە ڕێگەی واتساپ',
  },
  'product.unavailable': {
    ar: 'غير متوفر حالياً',
    en: 'Currently unavailable',
    ku: 'ئێستا بەردەست نییە',
  },
  'product.comingSoon': { ar: 'قريباً', en: 'Coming Soon', ku: 'بەم زووانە' },
  'product.preorderWhatsApp': {
    ar: 'اطلب حجز مسبق عبر واتساب',
    en: 'Pre-order on WhatsApp',
    ku: 'پێشداواکردن لە ڕێگەی واتساپ',
  },
  'product.lowStock': { ar: 'كمية محدودة', en: 'Limited stock', ku: 'کەمی لە کۆگا' },
  'product.bestSeller': { ar: 'الأكثر مبيعاً', en: 'Best seller', ku: 'زۆرترین فرۆشراو' },
  'product.offer': { ar: 'عرض', en: 'Offer', ku: 'داشکاندن' },
  'product.offerEnds': {
    ar: 'ينتهي العرض خلال',
    en: 'Offer ends in',
    ku: 'داشکاندنەکە کۆتایی دێت لە',
  },
  'product.wasPrice': { ar: 'السعر السابق', en: 'Previous price', ku: 'نرخی پێشوو' },
  'time.days': { ar: 'يوم', en: 'days', ku: 'ڕۆژ' },
  'time.hours': { ar: 'ساعة', en: 'hrs', ku: 'کاژێر' },
  'time.minutes': { ar: 'دقيقة', en: 'min', ku: 'خولەک' },
  'time.seconds': { ar: 'ثانية', en: 'sec', ku: 'چرکە' },
  'product.qcLine': {
    ar: 'نفحص كل قطعة قبل الشحن — وإذا بيها خلل واضح، التبديل متوفر.',
    en: 'Every piece is QC-tested before shipping — exchange available for any clear defect.',
    ku: 'هەموو پارچەیەک پێش ناردن پشکنین دەکرێت — گۆڕینەوە بەردەستە بۆ هەر کێماسییەکی ڕوون.',
  },
  'cart.title': { ar: 'السلة', en: 'Cart', ku: 'سەپەت' },
  'cart.empty': { ar: 'سلتك فارغة', en: 'Your cart is empty', ku: 'سەپەتەکەت بەتاڵە' },
  'cart.continue': { ar: 'كمل التسوق', en: 'Continue shopping', ku: 'بەردەوامبوون لە کڕین' },
  'cart.total': { ar: 'المجموع', en: 'Total', ku: 'کۆی گشتی' },
  'cart.qty': { ar: 'العدد', en: 'Qty', ku: 'ژمارە' },
  'cart.subtotal': { ar: 'مجموع المنتجات', en: 'Subtotal', ku: 'کۆی کاڵاکان' },
  'cart.delivery': { ar: 'التوصيل', en: 'Delivery', ku: 'گەیاندن' },
  'cart.deliveryNote': {
    ar: 'توصيل لكل محافظات العراق — 5,000 د.ع',
    en: 'Delivery anywhere in Iraq — 5,000 IQD',
    ku: 'گەیاندن بۆ هەموو پارێزگاکانی عێراق — 5,000 د.ع',
  },
  'cart.deliveryNoteFree': {
    ar: 'توصيل مجاني لكل محافظات العراق',
    en: 'Free delivery anywhere in Iraq',
    ku: 'گەیاندنی بەخۆڕایی بۆ هەموو پارێزگاکانی عێراق',
  },
  'cart.codNote': {
    ar: 'الدفع عند الاستلام — نتواصل وياك للتأكيد قبل الشحن',
    en: 'Cash on delivery — we message you to confirm before shipping',
    ku: 'پارەدان لە کاتی گەیاندن — پێش ناردن پەیوەندیت پێوە دەکەین بۆ دڵنیابوونەوە',
  },
  'cart.checkout': { ar: 'إتمام الطلب', en: 'Checkout', ku: 'تەواوکردنی داواکاری' },
  'form.name': { ar: 'الاسم', en: 'Name', ku: 'ناو' },
  'form.phone': { ar: 'رقم الهاتف', en: 'Phone', ku: 'ژمارەی مۆبایل' },
  'form.phoneError': {
    ar: 'اكتب رقم عراقي صحيح يبدأ بـ 07 (11 رقم)',
    en: 'Enter a valid Iraqi number starting with 07 (11 digits)',
    ku: 'ژمارەیەکی دروستی عێراقی بنووسە کە بە 07 دەست پێبکات (11 ژمارە)',
  },
  'form.governorate': { ar: 'المحافظة', en: 'Governorate', ku: 'پارێزگا' },
  'form.address': {
    ar: 'العنوان (المنطقة، الشارع، أقرب نقطة دالة)',
    en: 'Address (area, street, nearest landmark)',
    ku: 'ناونیشان (گەڕەک، شەقام، نزیکترین نیشانە)',
  },
  'form.submit': { ar: 'أرسل الطلب', en: 'Place order', ku: 'ناردنی داواکاری' },
  'form.error': {
    ar: 'صار خلل بإرسال الطلب — جرب مرة ثانية أو اطلب مباشرة عبر واتساب:',
    en: 'Something went wrong — try again or order directly on WhatsApp:',
    ku: 'هەڵەیەک ڕوویدا لە ناردنی داواکاریت — دووبارە هەوڵبدەرەوە یان ڕاستەوخۆ لە ڕێگەی واتساپ داوا بکە:',
  },
  'success.title': { ar: '✅ تم استلام طلبك', en: '✅ Order received', ku: '✅ داواکاریت وەرگیرا' },
  'success.body': {
    ar: 'راح نتواصل وياك على الواتساب لتأكيد الطلب قبل الشحن.',
    en: "We'll message you on WhatsApp to confirm before shipping.",
    ku: 'لە ڕێگەی واتساپ پەیوەندیت پێوە دەکەین بۆ دڵنیابوونەوە پێش ناردن.',
  },
  'search.placeholder': {
    ar: 'دور على أداة...',
    en: 'Search instruments...',
    ku: 'بگەڕێ بۆ ئامراز...',
  },
  'price.unit': { ar: 'د.ع', en: 'IQD', ku: 'د.ع' },
  'price.free': { ar: 'مجاني', en: 'Free', ku: 'بەخۆڕایی' },
  'product.freeDelivery': { ar: 'توصيل مجاني', en: 'Free Delivery', ku: 'گەیاندنی بەخۆڕایی' },
  'showcase.mostOrdered': {
    ar: 'الأكثر طلباً من الأطباء',
    en: 'Most Ordered by Doctors',
    ku: 'زۆرترین داواکراو لەلایەن پزیشکان',
  },

  // --- supporting UI strings (not in Appendix A, same register) ---
  'nav.openSearch': { ar: 'بحث', en: 'Search', ku: 'گەڕان' },
  'nav.closeSearch': { ar: 'إغلاق البحث', en: 'Close search', ku: 'داخستنی گەڕان' },
  'nav.cart': { ar: 'السلة', en: 'Cart', ku: 'سەپەت' },
  'nav.language': { ar: 'اللغة', en: 'Language', ku: 'زمان' },
  'nav.darkMode': { ar: 'الوضع الليلي', en: 'Dark mode', ku: 'دۆخی تاریک' },
  'nav.menu': { ar: 'القائمة', en: 'Menu', ku: 'مێنیو' },
  'search.noResults': { ar: 'ما لكينا نتيجة', en: 'No results', ku: 'هیچ نەدۆزرایەوە' },
  'cart.remove': { ar: 'حذف', en: 'Remove', ku: 'سڕینەوە' },
  'cart.increase': { ar: 'زيادة', en: 'Increase', ku: 'زیادکردن' },
  'cart.decrease': { ar: 'إنقاص', en: 'Decrease', ku: 'کەمکردنەوە' },
  'cart.summary': { ar: 'ملخص الطلب', en: 'Order summary', ku: 'پوختەی داواکاری' },
  'checkout.title': { ar: 'إتمام الطلب', en: 'Checkout', ku: 'تەواوکردنی داواکاری' },
  'checkout.sending': { ar: 'كاعد نرسل...', en: 'Sending...', ku: 'لە ناردندایە...' },
  'checkout.required': { ar: 'هذا الحقل مطلوب', en: 'This field is required', ku: 'ئەم خانە پێویستە' },
  'checkout.whatsappFallback': {
    ar: 'أرسل الطلب بالواتساب',
    en: 'Send the order on WhatsApp',
    ku: 'داواکاری بنێرە بە واتساپ',
  },
  'gallery.viewLarger': { ar: 'كبّر الصورة', en: 'View larger', ku: 'گەورەکردنی وێنە' },
  'gallery.close': { ar: 'إغلاق', en: 'Close', ku: 'داخستن' },
  'gallery.shot': { ar: 'صورة', en: 'Shot', ku: 'وێنە' },
  'product.backToCategory': { ar: 'رجوع', en: 'Back', ku: 'گەڕانەوە' },
  'category.count': { ar: 'أداة', en: 'items', ku: 'ئامراز' },
  'notfound.title': { ar: 'الصفحة مو موجودة', en: 'Page not found', ku: 'پەڕەکە بوونی نییە' },
  'notfound.body': {
    ar: 'الرابط اللي فتحته مو موجود. ارجع للكتالوج.',
    en: 'That link does not exist. Head back to the catalog.',
    ku: 'ئەو لینکەی کردتەوە بوونی نییە. بگەڕێوە بۆ کاتالۆگ.',
  },
  'notfound.cta': { ar: 'رجوع للكتالوج', en: 'Back to the catalog', ku: 'گەڕانەوە بۆ کاتالۆگ' },
  'footer.contact': { ar: 'تواصل ويانا', en: 'Contact', ku: 'پەیوەندیمان پێوە بکە' },
  'footer.rights': { ar: 'كل الحقوق محفوظة', en: 'All rights reserved', ku: 'هەموو مافەکان پارێزراون' },
  'sets.title': { ar: 'الستات', en: 'Sets', ku: 'سێتەکان' },
  'skip.toContent': { ar: 'تخطَّ إلى المحتوى', en: 'Skip to content', ku: 'بازدان بۆ ناوەرۆک' },

  'reviews.title': { ar: 'تقييمات العملاء', en: 'Customer Reviews', ku: 'هەڵسەنگاندنی کڕیاران' },
  'reviews.seeAll': { ar: 'شاهد التقييمات', en: 'See Reviews', ku: 'هەڵسەنگاندنەکان ببینە' },
  'reviews.write': { ar: 'أضف تقييمك', en: 'Write a Review', ku: 'هەڵسەنگاندنی خۆت بنووسە' },
  'reviews.basedOn': { ar: 'بناءً على', en: 'Based on', ku: 'بەپێی' },
  'reviews.reviewsWord': { ar: 'تقييم', en: 'reviews', ku: 'هەڵسەنگاندن' },
  'reviews.noneYet': {
    ar: 'لا توجد تقييمات بعد — كن أول من يضيف تقييمه!',
    en: 'No reviews yet — be the first!',
    ku: 'هێشتا هەڵسەنگاندن نییە — یەکەم کەس بە کە!',
  },
  'reviews.formName': { ar: 'اسمك', en: 'Your name', ku: 'ناوت' },
  'reviews.formRating': { ar: 'تقييمك', en: 'Your rating', ku: 'هەڵسەنگاندنی تۆ' },
  'reviews.formText': { ar: 'رأيك', en: 'Your review', ku: 'ڕای تۆ' },
  'reviews.formTextPlaceholder': {
    ar: 'شاركنا تجربتك مع المنتج...',
    en: 'Tell other customers about your experience...',
    ku: 'ئەزموونی خۆت لەگەڵ کڕیارانی دیکە باس بکە...',
  },
  'reviews.formSubmit': { ar: 'إرسال التقييم', en: 'Submit Review', ku: 'ناردنی هەڵسەنگاندن' },
  'reviews.formSending': { ar: 'كاعد نرسل...', en: 'Sending...', ku: 'لە ناردندایە...' },
  'reviews.thankYou': {
    ar: 'شكراً! تقييمك سيظهر على الموقع بعد المراجعة.',
    en: "Thanks! Your review will appear once it's approved.",
    ku: 'سوپاس! هەڵسەنگاندنەکەت دوای پێداچوونەوە لەسەر ماڵپەڕ دەردەکەوێت.',
  },
  'reviews.error': {
    ar: 'صار خلل — جرب مرة ثانية.',
    en: 'Something went wrong — please try again.',
    ku: 'هەڵەیەک ڕوویدا — تکایە دووبارە هەوڵ بدەرەوە.',
  },

  'promo.freeDeliveryBanner': {
    ar: 'توصيل مجاني على جميع الطلبات',
    en: 'Free delivery on every order',
    ku: 'گەیاندنی بەخۆڕایی بۆ هەموو داواکارییەک',
  },
  'promo.through': { ar: 'لغاية', en: 'through', ku: 'تا' },
};

export function tr(key: string, lang: Lang): string {
  const entry = t[key];
  if (!entry) throw new Error(`Missing i18n key: ${key}`);
  return entry[lang];
}

/**
 * 18 governorates, Arabic values stored as-is (spec Appendix A). These are
 * the canonical values submitted with an order — kept Arabic-only in every
 * language mode (same simplification the site already made for English).
 */
export const GOVERNORATES = [
  'بغداد', 'البصرة', 'نينوى', 'أربيل', 'السليمانية', 'دهوك',
  'كركوك', 'الأنبار', 'بابل', 'كربلاء', 'النجف', 'الديوانية',
  'ذي قار', 'ميسان', 'المثنى', 'واسط', 'صلاح الدين', 'ديالى',
] as const;

/** Western digits with thousands separators, in every language mode. */
export function formatPrice(iqd: number, lang: Lang): string {
  return `${iqd.toLocaleString('en-US')} ${tr('price.unit', lang)}`;
}
