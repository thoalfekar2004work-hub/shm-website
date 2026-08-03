/**
 * Every UI string on the site lives here. Components must not hardcode text.
 * Values are taken verbatim from the build spec, Appendix A.
 */

export type Lang = 'ar' | 'en';

export const LANGS: Lang[] = ['ar', 'en'];
export const DEFAULT_LANG: Lang = 'en';

/** Brand statement, shown only in English mode. */
export const HERO_LINE_1 = 'SHM. Your Trusted Partner for Medical Instrument Selection.';
export const HERO_LINE_2 = 'Powered by an Iraqi Medical Student.';
/** Arabic equivalents, shown only in Arabic mode — one language at a time, never both. */
export const HERO_LINE_1_AR = 'شريكك الموثوق لاختيار أدواتك الجراحية.';
export const HERO_LINE_2_AR = 'بدعم من طالب طب عراقي.';

export const WHATSAPP_NUMBER = '07858325208';
export const WHATSAPP_INTL = '9647858325208';
export const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_INTL}`;

export const INSTAGRAM_URL = 'https://www.instagram.com/shm_1q/';
export const FACEBOOK_URL = 'https://www.facebook.com/SHM.I0';

export const SITE_URL = 'https://shm-website.pages.dev';

type Dict = Record<string, { ar: string; en: string }>;

export const t: Dict = {
  'nav.catalog': { ar: 'الكتالوج', en: 'Catalog' },
  'nav.sets': { ar: 'الستات', en: 'Sets' },
  'hero.cta': { ar: 'تصفح الكتالوج', en: 'Browse the Catalog' },
  'grid.from': { ar: 'يبدأ من', en: 'From' },
  'product.addToCart': { ar: 'أضف للسلة', en: 'Add to Cart' },
  'product.inCart': { ar: 'بالسلة', en: 'In cart' },
  'product.viewCart': { ar: 'شوف السلة', en: 'View cart' },
  'product.orderWhatsApp': { ar: 'اطلب عبر واتساب', en: 'Order on WhatsApp' },
  'product.unavailable': { ar: 'غير متوفر حالياً', en: 'Currently unavailable' },
  'product.lowStock': { ar: 'كمية محدودة', en: 'Limited stock' },
  'product.bestSeller': { ar: 'الأكثر مبيعاً', en: 'Best seller' },
  'product.offer': { ar: 'عرض', en: 'Offer' },
  'product.offerEnds': { ar: 'ينتهي العرض خلال', en: 'Offer ends in' },
  'product.wasPrice': { ar: 'السعر السابق', en: 'Previous price' },
  'bestSellers.title': { ar: 'الأكثر مبيعاً', en: 'Best sellers' },
  'bestSellers.sub': {
    ar: 'الأدوات اللي يطلبها الأطباء أكثر شي',
    en: 'The instruments surgeons order most',
  },
  'time.days': { ar: 'يوم', en: 'days' },
  'time.hours': { ar: 'ساعة', en: 'hrs' },
  'time.minutes': { ar: 'دقيقة', en: 'min' },
  'time.seconds': { ar: 'ثانية', en: 'sec' },
  'product.qcLine': {
    ar: 'نفحص كل قطعة قبل الشحن — وإذا بيها خلل واضح، التبديل متوفر.',
    en: 'Every piece is QC-tested before shipping — exchange available for any clear defect.',
  },
  'cart.title': { ar: 'السلة', en: 'Cart' },
  'cart.empty': { ar: 'سلتك فارغة', en: 'Your cart is empty' },
  'cart.continue': { ar: 'كمل التسوق', en: 'Continue shopping' },
  'cart.total': { ar: 'المجموع', en: 'Total' },
  'cart.qty': { ar: 'العدد', en: 'Qty' },
  'cart.subtotal': { ar: 'مجموع المنتجات', en: 'Subtotal' },
  'cart.delivery': { ar: 'التوصيل', en: 'Delivery' },
  'cart.deliveryNote': {
    ar: 'توصيل لكل محافظات العراق — 5,000 د.ع',
    en: 'Delivery anywhere in Iraq — 5,000 IQD',
  },
  'cart.codNote': {
    ar: 'الدفع عند الاستلام — نتواصل وياك للتأكيد قبل الشحن',
    en: 'Cash on delivery — we message you to confirm before shipping',
  },
  'cart.checkout': { ar: 'إتمام الطلب', en: 'Checkout' },
  'form.name': { ar: 'الاسم', en: 'Name' },
  'form.phone': { ar: 'رقم الهاتف', en: 'Phone' },
  'form.phoneError': {
    ar: 'اكتب رقم عراقي صحيح يبدأ بـ 07 (11 رقم)',
    en: 'Enter a valid Iraqi number starting with 07 (11 digits)',
  },
  'form.governorate': { ar: 'المحافظة', en: 'Governorate' },
  'form.address': {
    ar: 'العنوان (المنطقة، الشارع، أقرب نقطة دالة)',
    en: 'Address (area, street, nearest landmark)',
  },
  'form.submit': { ar: 'أرسل الطلب', en: 'Place order' },
  'form.error': {
    ar: 'صار خلل بإرسال الطلب — جرب مرة ثانية أو اطلب مباشرة عبر واتساب:',
    en: 'Something went wrong — try again or order directly on WhatsApp:',
  },
  'success.title': { ar: '✅ تم استلام طلبك', en: '✅ Order received' },
  'success.body': {
    ar: 'راح نتواصل وياك على الواتساب لتأكيد الطلب قبل الشحن.',
    en: "We'll message you on WhatsApp to confirm before shipping.",
  },
  'search.placeholder': { ar: 'دور على أداة...', en: 'Search instruments...' },
  'proof.strip': {
    ar: 'نفحص كل قطعة قبل الشحن · تبديل متوفر عند وجود خلل واضح · ستانلس ستيل بعلامة CE',
    en: 'QC on every piece before shipping · Exchange guarantee for clear defects · CE-marked stainless steel',
  },
  'price.unit': { ar: 'د.ع', en: 'IQD' },

  // --- supporting UI strings (not in Appendix A, same register) ---
  'nav.openSearch': { ar: 'بحث', en: 'Search' },
  'nav.closeSearch': { ar: 'إغلاق البحث', en: 'Close search' },
  'nav.cart': { ar: 'السلة', en: 'Cart' },
  'nav.language': { ar: 'اللغة', en: 'Language' },
  'nav.menu': { ar: 'القائمة', en: 'Menu' },
  'search.noResults': { ar: 'ما لكينا نتيجة', en: 'No results' },
  'cart.remove': { ar: 'حذف', en: 'Remove' },
  'cart.increase': { ar: 'زيادة', en: 'Increase' },
  'cart.decrease': { ar: 'إنقاص', en: 'Decrease' },
  'cart.summary': { ar: 'ملخص الطلب', en: 'Order summary' },
  'checkout.title': { ar: 'إتمام الطلب', en: 'Checkout' },
  'checkout.sending': { ar: 'كاعد نرسل...', en: 'Sending...' },
  'checkout.required': { ar: 'هذا الحقل مطلوب', en: 'This field is required' },
  'checkout.whatsappFallback': { ar: 'أرسل الطلب بالواتساب', en: 'Send the order on WhatsApp' },
  'gallery.viewLarger': { ar: 'كبّر الصورة', en: 'View larger' },
  'gallery.close': { ar: 'إغلاق', en: 'Close' },
  'gallery.shot': { ar: 'صورة', en: 'Shot' },
  'product.backToCategory': { ar: 'رجوع', en: 'Back' },
  'category.count': { ar: 'أداة', en: 'items' },
  'notfound.title': { ar: 'الصفحة مو موجودة', en: 'Page not found' },
  'notfound.body': {
    ar: 'الرابط اللي فتحته مو موجود. ارجع للكتالوج.',
    en: 'That link does not exist. Head back to the catalog.',
  },
  'notfound.cta': { ar: 'رجوع للكتالوج', en: 'Back to the catalog' },
  'footer.contact': { ar: 'تواصل ويانا', en: 'Contact' },
  'footer.rights': { ar: 'كل الحقوق محفوظة', en: 'All rights reserved' },
  'sets.title': { ar: 'الستات', en: 'Sets' },
  'skip.toContent': { ar: 'تخطَّ إلى المحتوى', en: 'Skip to content' },
};

export function tr(key: string, lang: Lang): string {
  const entry = t[key];
  if (!entry) throw new Error(`Missing i18n key: ${key}`);
  return entry[lang];
}

/** 18 governorates, Arabic values stored as-is (spec Appendix A). */
export const GOVERNORATES = [
  'بغداد', 'البصرة', 'نينوى', 'أربيل', 'السليمانية', 'دهوك',
  'كركوك', 'الأنبار', 'بابل', 'كربلاء', 'النجف', 'الديوانية',
  'ذي قار', 'ميسان', 'المثنى', 'واسط', 'صلاح الدين', 'ديالى',
] as const;

/** Western digits with thousands separators, in both language modes. */
export function formatPrice(iqd: number, lang: Lang): string {
  return `${iqd.toLocaleString('en-US')} ${tr('price.unit', lang)}`;
}
