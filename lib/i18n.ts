// Internationalization utilities for Palestinian Kufiya Store

export type Language = "en" | "ar"

export interface Translation {
  [key: string]: string | Translation
}

export const translations: Record<Language, Translation> = {
  en: {
    // Header & Navigation
    store_name: "Palestinian Kufiya Store",
    back_to_store: "Back to Store",
    back_to_product: "Back to Product",
    admin_dashboard: "Admin Dashboard",

    // Product Page
    traditional_handmade: "Traditional Handmade",
    authentic_kufiya: "Authentic Palestinian Kufiya",
    limited_offer: "Limited Time Offer",
    about_kufiya: "About this Kufiya",
    product_description:
      "This authentic Palestinian kufiya represents centuries of cultural heritage and craftsmanship. Hand-woven with traditional patterns, each piece tells a story of Palestinian identity and resilience. The distinctive black and white checkered pattern is not just a fashion statement, but a symbol of Palestinian culture and solidarity.",
    cotton_100: "100% Cotton",
    handmade: "Handmade",
    free_shipping: "Free Shipping",
    premium_quality: "Premium Quality",
    cultural_significance: "Cultural Significance",
    cultural_description:
      "By purchasing this kufiya, you're supporting Palestinian artisans and helping preserve this important cultural tradition. Each purchase contributes to the livelihood of Palestinian families and communities.",
    buy_now: "Buy Now",
    add_to_wishlist: "Add to Wishlist",
    secure_payment: "• Secure payment processing",
    return_policy: "• 30-day return policy",
    worldwide_shipping: "• Worldwide shipping available",
    customer_reviews: "Customer Reviews",
    verified_purchase: "Verified Purchase",
    authentic_craftsmanship: "Authentic Palestinian Craftsmanship",
    traditional_pattern: "Traditional Pattern",
    hand_woven_edges: "Hand-Woven Edges",
    premium_cotton: "Premium Cotton",
    authentic_tassels: "Authentic Tassels",
    pattern_description: "Classic black and white houndstooth pattern representing Palestinian heritage",
    edges_description: "Carefully crafted borders with traditional zigzag patterns",
    cotton_description: "Made from high-quality 100% cotton for comfort and durability",
    tassels_description: "Hand-finished tassels that showcase traditional craftsmanship",
    authentic_quality: "Authentic Quality",
    quality_description: "Each kufiya is carefully inspected to ensure authentic Palestinian craftsmanship",
    supporting_artisans: "Supporting Artisans",
    artisans_description: "Your purchase directly supports Palestinian artisans and their families",
    fast_delivery: "Fast Delivery",
    delivery_description: "Free worldwide shipping with tracking on all orders",

    // Payment Page
    order_summary: "Order Summary",
    quantity: "Quantity",
    subtotal: "Subtotal",
    shipping: "Shipping",
    free: "Free",
    tax: "Tax",
    total: "Total",
    secure_payment_title: "Secure Payment",
    shipping_information: "Shipping Information",
    first_name: "First Name",
    last_name: "Last Name",
    email: "Email",
    address: "Address",
    city: "City",
    country: "Country",
    select_country: "Select country",
    payment_information: "Payment Information",
    card_number: "Card Number",
    expiry_date: "Expiry Date",
    cvv: "CVV",
    name_on_card: "Name on Card",
    complete_payment: "Complete Payment",
    processing_payment: "Processing Payment...",
    payment_secure: "Your payment information is secure and encrypted",
    coupon_code: "Coupon Code",
    apply_coupon: "Apply Coupon",
    coupon_applied: "Coupon applied successfully!",
    invalid_coupon: "Invalid or expired coupon code",
    discount: "Discount",

    // Success Page
    payment_successful: "Payment Successful!",
    thank_you_message: "Thank you for your purchase. Your Palestinian kufiya will be shipped within 2-3 business days.",
    continue_shopping: "Continue Shopping",

    // Admin
    admin_login: "Admin Login",
    username: "Username",
    password: "Password",
    sign_in: "Sign In",
    signing_in: "Signing in...",
    welcome: "Welcome",
    logout: "Logout",
    total_revenue: "Total Revenue",
    total_orders: "Total Orders",
    completed_orders: "Completed Orders",
    processing: "Processing",
    all_orders: "All Orders from Database",
    filter_by_status: "Filter by status",
    refresh: "Refresh",
    order_id: "Order ID",
    customer: "Customer",
    amount: "Amount",
    card_details: "Card Details",
    status: "Status",
    date: "Date",
    actions: "Actions",
    order_details: "Order Details",
    customer_information: "Customer Information",
    name: "Name",
    payment_information_admin: "Payment Information",
    sensitive_data: "⚠️ Sensitive Payment Data from Database",
    card_number_admin: "Card Number",
    expiry_date_admin: "Expiry Date",
    cvv_admin: "CVV",
    cardholder_name: "Cardholder Name",
    order_information: "Order Information",
    order_date: "Order Date",
    created: "Created",

    // Shipping
    shipping_details: "Shipping Details",
    estimated_delivery: "Estimated Delivery",
    tracking_number: "Tracking Number",
    shipping_method: "Shipping Method",
    standard_shipping: "Standard Shipping",
    express_shipping: "Express Shipping",
    overnight_shipping: "Overnight Shipping",

    // Coupons
    manage_coupons: "Manage Coupons",
    create_coupon: "Create Coupon",
    coupon_name: "Coupon Code",
    discount_type: "Discount Type",
    percentage: "Percentage",
    fixed_amount: "Fixed Amount",
    discount_value: "Discount Value",
    expiry_date_coupon: "Expiry Date",
    max_uses: "Maximum Uses",
    active: "Active",
    inactive: "Inactive",
    save_coupon: "Save Coupon",

    // Common
    loading: "Loading...",
    error: "Error",
    success: "Success",
    cancel: "Cancel",
    save: "Save",
    delete: "Delete",
    edit: "Edit",
    view: "View",
    close: "Close",
    yes: "Yes",
    no: "No",
    addToCart: "Add To Cart"

  },
  ar: {
    // Header & Navigation
    store_name: "متجر الكوفية الفلسطينية",
    back_to_store: "العودة للمتجر",
    back_to_product: "العودة للمنتج",
    admin_dashboard: "لوحة الإدارة",

    // Product Page
    traditional_handmade: "صناعة تقليدية يدوية",
    authentic_kufiya: "كوفية فلسطينية أصيلة",
    limited_offer: "عرض لفترة محدودة",
    about_kufiya: "عن هذه الكوفية",
    product_description:
      "تمثل هذه الكوفية الفلسطينية الأصيلة قروناً من التراث الثقافي والحرفية. منسوجة يدوياً بأنماط تقليدية، كل قطعة تحكي قصة الهوية الفلسطينية والصمود. النمط المميز بالمربعات السوداء والبيضاء ليس مجرد بيان أزياء، بل رمز للثقافة والتضامن الفلسطيني.",
    cotton_100: "قطن 100%",
    handmade: "صناعة يدوية",
    free_shipping: "شحن مجاني",
    premium_quality: "جودة ممتازة",
    cultural_significance: "الأهمية الثقافية",
    cultural_description:
      "بشرائك لهذه الكوفية، فإنك تدعم الحرفيين الفلسطينيين وتساعد في الحفاظ على هذا التقليد الثقافي المهم. كل عملية شراء تساهم في معيشة العائلات والمجتمعات الفلسطينية.",
    buy_now: "اشتري الآن",
    add_to_wishlist: "أضف لقائمة الأمنيات",
    secure_payment: "• معالجة دفع آمنة",
    return_policy: "• سياسة إرجاع لمدة 30 يوماً",
    worldwide_shipping: "• شحن عالمي متاح",
    customer_reviews: "تقييمات العملاء",
    verified_purchase: "شراء موثق",
    authentic_craftsmanship: "حرفية فلسطينية أصيلة",
    traditional_pattern: "نمط تقليدي",
    hand_woven_edges: "حواف منسوجة يدوياً",
    premium_cotton: "قطن ممتاز",
    authentic_tassels: "شراشيب أصيلة",
    pattern_description: "نمط كلاسيكي أسود وأبيض يمثل التراث الفلسطيني",
    edges_description: "حدود مصنوعة بعناية بأنماط متعرجة تقليدية",
    cotton_description: "مصنوع من قطن عالي الجودة 100% للراحة والمتانة",
    tassels_description: "شراشيب مكتملة يدوياً تظهر الحرفية التقليدية",
    authentic_quality: "جودة أصيلة",
    quality_description: "يتم فحص كل كوفية بعناية لضمان الحرفية الفلسطينية الأصيلة",
    supporting_artisans: "دعم الحرفيين",
    artisans_description: "شراؤك يدعم الحرفيين الفلسطينيين وعائلاتهم مباشرة",
    fast_delivery: "توصيل سريع",
    delivery_description: "شحن مجاني عالمي مع تتبع على جميع الطلبات",

    // Payment Page
    order_summary: "ملخص الطلب",
    quantity: "الكمية",
    subtotal: "المجموع الفرعي",
    shipping: "الشحن",
    free: "مجاني",
    tax: "الضريبة",
    total: "المجموع",
    secure_payment_title: "دفع آمن",
    shipping_information: "معلومات الشحن",
    first_name: "الاسم الأول",
    last_name: "اسم العائلة",
    email: "البريد الإلكتروني",
    address: "العنوان",
    city: "المدينة",
    country: "البلد",
    select_country: "اختر البلد",
    payment_information: "معلومات الدفع",
    card_number: "رقم البطاقة",
    expiry_date: "تاريخ الانتهاء",
    cvv: "رمز الأمان",
    name_on_card: "الاسم على البطاقة",
    complete_payment: "إتمام الدفع",
    processing_payment: "جاري معالجة الدفع...",
    payment_secure: "معلومات الدفع الخاصة بك آمنة ومشفرة",
    coupon_code: "كود الخصم",
    apply_coupon: "تطبيق الكوبون",
    coupon_applied: "تم تطبيق الكوبون بنجاح!",
    invalid_coupon: "كود كوبون غير صالح أو منتهي الصلاحية",
    discount: "الخصم",

    // Success Page
    payment_successful: "تم الدفع بنجاح!",
    thank_you_message: "شكراً لك على الشراء. سيتم شحن الكوفية الفلسطينية خلال 2-3 أيام عمل.",
    continue_shopping: "متابعة التسوق",

    // Admin
    admin_login: "تسجيل دخول الإدارة",
    username: "اسم المستخدم",
    password: "كلمة المرور",
    sign_in: "تسجيل الدخول",
    signing_in: "جاري تسجيل الدخول...",
    welcome: "مرحباً",
    logout: "تسجيل الخروج",
    total_revenue: "إجمالي الإيرادات",
    total_orders: "إجمالي الطلبات",
    completed_orders: "الطلبات المكتملة",
    processing: "قيد المعالجة",
    all_orders: "جميع الطلبات من قاعدة البيانات",
    filter_by_status: "تصفية حسب الحالة",
    refresh: "تحديث",
    order_id: "رقم الطلب",
    customer: "العميل",
    amount: "المبلغ",
    card_details: "تفاصيل البطاقة",
    status: "الحالة",
    date: "التاريخ",
    actions: "الإجراءات",
    order_details: "تفاصيل الطلب",
    customer_information: "معلومات العميل",
    name: "الاسم",
    payment_information_admin: "معلومات الدفع",
    sensitive_data: "⚠️ بيانات دفع حساسة من قاعدة البيانات",
    card_number_admin: "رقم البطاقة",
    expiry_date_admin: "تاريخ الانتهاء",
    cvv_admin: "رمز الأمان",
    cardholder_name: "اسم حامل البطاقة",
    order_information: "معلومات الطلب",
    order_date: "تاريخ الطلب",
    created: "تم الإنشاء",

    // Shipping
    shipping_details: "تفاصيل الشحن",
    estimated_delivery: "التسليم المتوقع",
    tracking_number: "رقم التتبع",
    shipping_method: "طريقة الشحن",
    standard_shipping: "شحن عادي",
    express_shipping: "شحن سريع",
    overnight_shipping: "شحن ليلي",

    // Coupons
    manage_coupons: "إدارة الكوبونات",
    create_coupon: "إنشاء كوبون",
    coupon_name: "كود الكوبون",
    discount_type: "نوع الخصم",
    percentage: "نسبة مئوية",
    fixed_amount: "مبلغ ثابت",
    discount_value: "قيمة الخصم",
    expiry_date_coupon: "تاريخ الانتهاء",
    max_uses: "الحد الأقصى للاستخدام",
    active: "نشط",
    inactive: "غير نشط",
    save_coupon: "حفظ الكوبون",

    // Common
    loading: "جاري التحميل...",
    error: "خطأ",
    success: "نجح",
    cancel: "إلغاء",
    save: "حفظ",
    delete: "حذف",
    edit: "تعديل",
    view: "عرض",
    close: "إغلاق",
    yes: "نعم",
    no: "لا",
    addToCart: "اضافة الي السلة"
  },
}

// Get translation by key
export function t(key: string, lang: Language = "en"): string {
  const keys = key.split(".")
  let value: any = translations[lang]

  for (const k of keys) {
    if (value && typeof value === "object" && k in value) {
      value = value[k]
    } else {
      // Fallback to English if key not found
      value = translations.en
      for (const fallbackKey of keys) {
        if (value && typeof value === "object" && fallbackKey in value) {
          value = value[fallbackKey]
        } else {
          return key // Return key if not found
        }
      }
      break
    }
  }

  return typeof value === "string" ? value : key
}

// Language context
export const getLanguageDirection = (lang: Language): "ltr" | "rtl" => {
  return lang === "ar" ? "rtl" : "ltr"
}

export const getLanguageName = (lang: Language): string => {
  return lang === "ar" ? "العربية" : "English"
}
