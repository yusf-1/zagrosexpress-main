import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'en' | 'ar' | 'ku';

interface Translations {
  [key: string]: {
    en: string;
    ar: string;
    ku: string;
  };
}

export const translations: Translations = {
  // Language selection
  selectLanguage: {
    en: 'Select Your Language',
    ar: 'اختر لغتك',
    ku: 'زمانەکەت هەڵبژێرە',
  },
  continue: {
    en: 'Continue',
    ar: 'متابعة',
    ku: 'بەردەوام بە',
  },
  // Auth
  signIn: {
    en: 'Sign In',
    ar: 'تسجيل الدخول',
    ku: 'چوونەژوورەوە',
  },
  signUp: {
    en: 'Sign Up',
    ar: 'إنشاء حساب',
    ku: 'تۆمارکردن',
  },
  email: {
    en: 'Email',
    ar: 'البريد الإلكتروني',
    ku: 'ئیمەیل',
  },
  password: {
    en: 'Password',
    ar: 'كلمة المرور',
    ku: 'وشەی نهێنی',
  },
  fullName: {
    en: 'Full Name',
    ar: 'الاسم الكامل',
    ku: 'ناوی تەواو',
  },
  phone: {
    en: 'Phone Number',
    ar: 'رقم الهاتف',
    ku: 'ژمارەی مۆبایل',
  },
  whatsappNumber: {
    en: 'WhatsApp Number',
    ar: 'رقم الواتساب',
    ku: 'ژمارەی واتساپ',
  },
  noAccount: {
    en: "Don't have an account?",
    ar: 'ليس لديك حساب؟',
    ku: 'هەژمارت نییە؟',
  },
  haveAccount: {
    en: 'Already have an account?',
    ar: 'لديك حساب بالفعل؟',
    ku: 'هەژمارت هەیە؟',
  },
  signupContactUs: {
    en: 'First time? Contact us on WhatsApp',
    ar: 'أول مرة؟ تواصل معنا على واتساب',
    ku: 'یەکەم جارە؟ پەیوەندیمان پێوە بکە لە واتساپ',
  },
  signOut: {
    en: 'Sign Out',
    ar: 'تسجيل الخروج',
    ku: 'چوونەدەرەوە',
  },
  // Home page
  welcome: {
    en: 'Welcome',
    ar: 'مرحباً',
    ku: 'بەخێربێیت',
  },
  placeOrder: {
    en: 'Place Order',
    ar: 'تقديم طلب',
    ku: 'داواکاری تۆمار بکە',
  },
  orderNow: {
    en: 'Order Now',
    ar: 'اطلب الآن',
    ku: 'ئێستا داوا بکە',
  },
  myOrders: {
    en: 'My Orders',
    ar: 'طلباتي',
    ku: 'داواکارییەکانم',
  },
   orderSummary: {
     en: 'Your Orders',
     ar: 'ملخص طلباتك',
     ku: 'پوختەی داواکارییەکانت',
   },
   waitingPrice: {
     en: 'Waiting Price',
     ar: 'بانتظار السعر',
     ku: 'چاوەڕوانی نرخ',
   },
   priceReady: {
     en: 'Price Ready',
     ar: 'السعر جاهز',
     ku: 'نرخ ئامادەیە',
   },
   inProgress: {
     en: 'In Progress',
     ar: 'قيد التنفيذ',
     ku: 'لە جێبەجێکردندایە',
   },
   totalOrders: {
     en: 'Total',
     ar: 'المجموع',
     ku: 'کۆی گشتی',
   },
  whereIsMyOrder: {
    en: 'Where Is My Order',
    ar: 'أين طلبي',
    ku: 'داواکاریەکەم لەکوێیە',
  },
  // Order form
  productUrl: {
    en: 'Product URL',
    ar: 'رابط المنتج',
    ku: 'لینکی بەرهەم',
  },
  productDetails: {
    en: 'Product Details',
    ar: 'تفاصيل المنتج',
    ku: 'وردەکارییەکانی بەرهەم',
  },
  shippingMethod: {
    en: 'Shipping Method',
    ar: 'طريقة الشحن',
    ku: 'شێوازی ناردن',
  },
  bySea: {
    en: 'By Sea',
    ar: 'شحن بحري',
    ku: 'بە دەریا',
  },
  byAir: {
    en: 'By Air',
    ar: 'شحن جوي',
    ku: 'بە فڕۆکە',
  },
  both: {
    en: 'Both',
    ar: 'كلاهما',
    ku: 'هەردووکیان',
  },
  submitOrder: {
    en: 'Submit Order',
    ar: 'إرسال الطلب',
    ku: 'ناردنی داواکاری',
  },
  // Order status
  pending: {
    en: 'Pending Review',
    ar: 'قيد المراجعة',
    ku: 'چاوەڕوانی پێداچوونەوە',
  },
  quoted: {
    en: 'Price Quoted',
    ar: 'تم عرض السعر',
    ku: 'نرخ دانراوە',
  },
  accepted: {
    en: 'Accepted',
    ar: 'تم القبول',
    ku: 'پەسەندکراوە',
  },
  buying: {
    en: 'Buying',
    ar: 'جاري الشراء',
    ku: 'لە کڕین دایە',
  },
  receivedChina: {
    en: 'Received in China',
    ar: 'تم الاستلام في الصين',
    ku: 'وەرگیرا لە مەخزەنی سین',
  },
  onTheWay: {
    en: 'On the Way to Iraq',
    ar: 'في الطريق إلى العراق',
    ku: 'لەڕێگادایە بۆ عێراق',
  },
  readyPickup: {
    en: 'Ready for Pickup',
    ar: 'جاهز للاستلام',
    ku: 'ئامادەیە بۆ وەرگرتن',
  },
  // Actions
  accept: {
    en: 'Accept',
    ar: 'قبول',
    ku: 'پەسەندکردن',
  },
  viewReceipt: {
    en: 'View Receipt',
    ar: 'عرض الإيصال',
    ku: 'بینینی وەسڵ',
  },
  pickupAddress: {
    en: 'Pickup Address',
    ar: 'عنوان الاستلام',
    ku: 'ناونیشانی وەرگرتن',
  },
  shippingCost: {
    en: 'Shipping Cost',
    ar: 'تكلفة الشحن',
    ku: 'تێچووی ناردن',
  },
  productPrice: {
    en: 'Product Price',
    ar: 'سعر المنتج',
    ku: 'نرخی بەرهەم',
  },
  total: {
    en: 'Total',
    ar: 'المجموع',
    ku: 'کۆی گشتی',
  },
  adminResponse: {
    en: 'Admin Response',
    ar: 'رد الإدارة',
    ku: 'وەڵامی بەڕێوەبەر',
  },
  contactWhatsApp: {
    en: 'Contact via WhatsApp',
    ar: 'تواصل عبر واتساب',
    ku: 'پەیوەندی لە ڕێگای واتساپ',
  },
  wantToOrder: {
    en: 'Want to proceed with this order?',
    ar: 'هل تريد متابعة هذا الطلب؟',
    ku: 'دەتەوێت بەردەوام بیت لەم داواکارییە؟',
  },
  contactAdminForPayment: {
    en: 'If you want to order, pay through WhatsApp to Zagros.',
    ar: 'إذا كنت تريد الطلب، ادفع عبر واتساب إلى زاغروس.',
    ku: 'ئەگەر دەتەوێت داواکاری بکەیت، لە ڕێگای واتساپ پارە بدە بە زاگرۆس.',
  },
  whatsappOrderMessage: {
    en: 'Hi, I want to ask about order #',
    ar: 'مرحباً، أريد الاستفسار عن الطلب رقم #',
    ku: 'سڵاو، دەمەوێت پرسیار بکەم دەربارەی داواکاری ژمارە #',
  },
  transferFee: {
    en: 'Transfer Fee',
    ar: 'رسوم التحويل',
    ku: 'کرێی ناردنی پارە',
  },
  free: {
    en: 'Free',
    ar: 'مجاني',
    ku: 'بەخۆڕایی',
  },
  amountPaid: {
    en: 'Amount Paid',
    ar: 'المبلغ المدفوع',
    ku: 'بڕی پارەی دراو',
  },
  amountRemaining: {
    en: 'Amount Remaining',
    ar: 'المبلغ المتبقي',
    ku: 'بڕی پارەی ماوە',
  },
  paymentStatus: {
    en: 'Payment Status',
    ar: 'حالة الدفع',
    ku: 'دۆخی پارەدان',
  },
  fullyPaid: {
    en: 'Fully Paid',
    ar: 'مدفوع بالكامل',
    ku: 'بە تەواوی دراوە',
  },
  partiallyPaid: {
    en: 'Partially Paid',
    ar: 'مدفوع جزئياً',
    ku: 'بەشێکی دراوە',
  },
  notPaid: {
    en: 'Not Paid',
    ar: 'غير مدفوع',
    ku: 'پارە نەدراوە',
  },
  // Admin
  adminPanel: {
    en: 'Admin Panel',
    ar: 'لوحة الإدارة',
    ku: 'پانێلی بەڕێوەبەر',
  },
  allOrders: {
    en: 'All Orders',
    ar: 'جميع الطلبات',
    ku: 'هەموو داواکارییەکان',
  },
  respond: {
    en: 'Respond',
    ar: 'الرد',
    ku: 'وەڵامدانەوە',
  },
  updateStatus: {
    en: 'Update Status',
    ar: 'تحديث الحالة',
    ku: 'نوێکردنەوەی دۆخ',
  },
  sendQuote: {
    en: 'Send Quote',
    ar: 'إرسال السعر',
    ku: 'ناردنی نرخ',
  },
  // Messages
  orderSubmitted: {
    en: 'Order submitted successfully!',
    ar: 'تم إرسال الطلب بنجاح!',
    ku: 'داواکاری بە سەرکەوتوویی نێردرا!',
  },
  orderAccepted: {
    en: 'Order accepted! Contact us via WhatsApp.',
    ar: 'تم قبول الطلب! تواصل معنا عبر واتساب.',
    ku: 'داواکاری پەسەندکرا! پەیوەندیمان پێوە بکە لە واتساپ.',
  },
  noOrders: {
    en: 'No orders yet',
    ar: 'لا توجد طلبات بعد',
    ku: 'هێشتا داواکاری نییە',
  },
  // CBM Calculator
  cbmCalculator: {
    en: 'CBM Calculator',
    ar: 'حاسبة CBM',
    ku: 'ژمێرەری CBM',
  },
  cbmCalculatorDesc: {
    en: 'Calculate cubic meters for your shipment',
    ar: 'احسب الأمتار المكعبة لشحنتك',
    ku: 'مەترە کیوبی بارەکەت بژمێرە',
  },
   home: {
     en: 'Home',
     ar: 'الرئيسية',
     ku: 'سەرەتا',
   },
  settings: {
    en: 'Settings',
    ar: 'الإعدادات',
    ku: 'ڕێکخستنەکان',
  },
  personalInfo: {
    en: 'Personal Info',
    ar: 'المعلومات الشخصية',
    ku: 'زانیاری کەسی',
  },
  ourAddress: {
    en: 'Our Address',
    ar: 'عنواننا',
    ku: 'ناونیشانی ئێمە',
  },
  termsAndConditions: {
    en: 'Terms & Conditions',
    ar: 'الشروط والأحكام',
    ku: 'مەرج و ڕێسا',
  },
  privacyPolicy: {
    en: 'Privacy Policy',
    ar: 'سياسة الخصوصية',
    ku: 'سیاسەتی تایبەتی',
  },
  privacyLastUpdated: {
    en: 'Last updated: February 2026',
    ar: 'آخر تحديث: فبراير 2026',
    ku: 'دوایین نوێکاری: شوبات ٢٠٢٦',
  },
  privacyIntroTitle: {
    en: 'Introduction',
    ar: 'المقدمة',
    ku: 'پێشەکی',
  },
  privacyIntroBody: {
    en: 'Zagros Express Company ("we," "our," or "us") is committed to protecting your privacy. We are located in Erbil, Kurdistan Region of Iraq. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application and services.',
    ar: 'شركة زاغروس إكسبريس ("نحن" أو "خاصتنا") ملتزمة بحماية خصوصيتك. نحن موجودون في أربيل، إقليم كردستان العراق. توضح سياسة الخصوصية هذه كيفية جمع معلوماتك واستخدامها والإفصاح عنها وحمايتها عند استخدام تطبيقنا وخدماتنا.',
    ku: 'کۆمپانیای زاگروس ئێکسپرێس ("ئێمە" یان "هی ئێمە") پابەندە بە پاراستنی نهێنییەتی تۆ. ئێمە لە هەولێر، هەرێمی کوردستانی عێراق دانین. ئەم سیاسەتی نهێنییەتیە ڕوون دەکات چۆن زانیاریەکانت کۆدەکەینەوە، بەکاردەهێنین، بڵاودەکەینەوە و دەپارێزین کاتێک ئەپی مۆبایل و خزمەتگوزارییەکانمان بەکاردەهێنی.',
  },
  privacyInfoCollectTitle: {
    en: 'Information We Collect',
    ar: 'المعلومات التي نجمعها',
    ku: 'ئەو زانیاریانەی کۆدەکەینەوە',
  },
  privacyInfoCollectIntro: {
    en: 'We may collect information about you in various ways, including:',
    ar: 'قد نجمع معلومات عنك بعدة طرق، بما في ذلك:',
    ku: 'ئێمە دەتوانین زانیاری لەسەرت کۆبکەینەوە بە چەند شێوازێک، لەوانە:',
  },
  privacyInfoCollectPersonal: {
    en: 'Personal Data: Name, phone number, WhatsApp number, and shipping addresses.',
    ar: 'البيانات الشخصية: الاسم، رقم الهاتف، رقم واتساب، وعناوين الشحن.',
    ku: 'زانیاری کەسی: ناو، ژمارەی مۆبایل، ژمارەی واتساپ، و ناونیشانی ناردن.',
  },
  privacyInfoCollectOrder: {
    en: 'Order Information: Details about your shipping orders, product information, and delivery preferences.',
    ar: 'معلومات الطلب: تفاصيل عن طلبات الشحن، معلومات المنتجات، وتفضيلات التوصيل.',
    ku: 'زانیاری داواکاری: وردەکاری داواکارییەکانی ناردن، زانیاری بەرهەم، و هەڵبژاردەکانی گەیاندن.',
  },
  privacyInfoCollectDevice: {
    en: 'Device Information: Device type, operating system, and unique device identifiers.',
    ar: 'معلومات الجهاز: نوع الجهاز، نظام التشغيل، ومعرّفات الجهاز الفريدة.',
    ku: 'زانیاری ئامێر: جۆری ئامێر، سیستەمی کارکردن، و ناسنامەی تایبەتی ئامێر.',
  },
  privacyInfoCollectUsage: {
    en: 'Usage Data: Information about how you use our application.',
    ar: 'بيانات الاستخدام: معلومات عن كيفية استخدامك لتطبيقنا.',
    ku: 'داتای بەکارهێنان: زانیاری سەبارەت بە چۆنیەتی بەکارهێنانی ئەپەکە.',
  },
  privacyUseInfoTitle: {
    en: 'How We Use Your Information',
    ar: 'كيف نستخدم معلوماتك',
    ku: 'چۆن زانیاریەکانت بەکاردەهێنین',
  },
  privacyUseInfoIntro: {
    en: 'We use the information we collect to:',
    ar: 'نستخدم المعلومات التي نجمعها من أجل:',
    ku: 'ئێمە زانیاریەکانمان بەکاردەهێنین بۆ:',
  },
  privacyUseInfo1: {
    en: 'Process and manage your shipping orders',
    ar: 'معالجة وإدارة طلبات الشحن الخاصة بك',
    ku: 'پرۆسەکردن و بەڕێوەبردنی داواکارییەکانی ناردنت',
  },
  privacyUseInfo2: {
    en: 'Communicate with you about your orders and services',
    ar: 'التواصل معك بشأن طلباتك وخدماتنا',
    ku: 'پەیوەندی کردن لەگەڵت سەبارەت بە داواکاری و خزمەتگوزارییەکانت',
  },
  privacyUseInfo3: {
    en: 'Send you order updates via WhatsApp',
    ar: 'إرسال تحديثات الطلب عبر واتساب',
    ku: 'ناردنی نوێکاری داواکاری لە ڕێگەی واتساپ',
  },
  privacyUseInfo4: {
    en: 'Improve our application and services',
    ar: 'تحسين تطبيقنا وخدماتنا',
    ku: 'باشترکردنی ئەپ و خزمەتگوزارییەکانمان',
  },
  privacyUseInfo5: {
    en: 'Comply with legal obligations',
    ar: 'الامتثال للالتزامات القانونية',
    ku: 'هاوبەشبوون لەگەڵ پابەندییە یاساییەکان',
  },
  privacySharingTitle: {
    en: 'Information Sharing',
    ar: 'مشاركة المعلومات',
    ku: 'هاوبەشکردنی زانیاری',
  },
  privacySharingIntro: {
    en: 'We do not sell, trade, or rent your personal information to third parties. We may share your information with:',
    ar: 'نحن لا نبيع أو نتاجر أو نؤجر معلوماتك الشخصية لأطراف ثالثة. قد نشارك معلوماتك مع:',
    ku: 'ئێمە زانیاری تایبەتی تۆ نەدەفرۆشین، نەدەگۆڕین، یان بە کرێ نادەدەین. دەتوانین زانیاریەکانت هاوبەش بکەین لەگەڵ:',
  },
  privacySharingPartner: {
    en: 'Shipping partners necessary to complete your orders',
    ar: 'شركاء الشحن الضروريين لإتمام طلباتك',
    ku: 'هاوبەشەکانی ناردن کە پێویستن بۆ تەواوکردنی داواکارییەکانت',
  },
  privacySharingProviders: {
    en: 'Service providers who assist in operating our application',
    ar: 'مزودي الخدمات الذين يساعدون في تشغيل تطبيقنا',
    ku: 'دابینکەرانی خزمەتگوزاری کە یارمەتی لە کارکردنی ئەپەکەمان دەدەن',
  },
  privacySharingLegal: {
    en: 'Legal authorities when required by law',
    ar: 'الجهات القانونية عند طلب القانون',
    ku: 'دەسەڵاتە یاساییەکان کاتێک یاسا داوای بکات',
  },
  privacySecurityTitle: {
    en: 'Data Security',
    ar: 'أمن البيانات',
    ku: 'پاراستنی داتا',
  },
  privacySecurityBody: {
    en: 'We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.',
    ar: 'نطبق إجراءات تقنية وتنظيمية مناسبة لحماية معلوماتك الشخصية من الوصول غير المصرح به أو التغيير أو الإفصاح أو الإتلاف.',
    ku: 'ئێمە ڕێکارە تەکنیکی و ڕێکخراوی گونجاو جێبەجێ دەکەین بۆ پاراستنی زانیاری تایبەتی تۆ لە دەستگەیشتن، گۆڕان، بڵاوبوونەوە یان وێرانکردنی نادروست.',
  },
  privacyRightsTitle: {
    en: 'Your Rights',
    ar: 'حقوقك',
    ku: 'مافەکانت',
  },
  privacyRightsIntro: {
    en: 'You have the right to:',
    ar: 'لديك الحق في:',
    ku: 'تۆ مافت هەیە بۆ:',
  },
  privacyRights1: {
    en: 'Access your personal information',
    ar: 'الوصول إلى معلوماتك الشخصية',
    ku: 'دەستگەیشتن بە زانیاری تایبەتی تۆ',
  },
  privacyRights2: {
    en: 'Correct inaccurate data',
    ar: 'تصحيح البيانات غير الدقيقة',
    ku: 'ڕاستکردنەوەی زانیاری نادروست',
  },
  privacyRights3: {
    en: 'Request deletion of your data',
    ar: 'طلب حذف بياناتك',
    ku: 'داوای سڕینەوەی داتاکەت بکەیت',
  },
  privacyRights4: {
    en: 'Withdraw consent at any time',
    ar: 'سحب الموافقة في أي وقت',
    ku: 'ڕاکێشانەوەی ڕەزامەندی لە هەر کاتێک',
  },
  privacyChildrenTitle: {
    en: "Children's Privacy",
    ar: 'خصوصية الأطفال',
    ku: 'نهێنییەتی منداڵان',
  },
  privacyChildrenBody: {
    en: 'Our services are not intended for individuals under the age of 13. We do not knowingly collect personal information from children under 13.',
    ar: 'خدماتنا ليست مخصصة لمن هم دون 13 عامًا. نحن لا نجمع عن علم معلومات شخصية من الأطفال دون 13 عامًا.',
    ku: 'خزمەتگوزارییەکانمان بۆ کەسانی ژێر ١٣ ساڵ نییە. ئێمە بە ئاسایی زانیاری تایبەتی لە منداڵانی ژێر ١٣ ساڵ کۆناکەینەوە.',
  },
  privacyChangesTitle: {
    en: 'Changes to This Policy',
    ar: 'التغييرات على هذه السياسة',
    ku: 'گۆڕانکاری لەسەر ئەم سیاسەتییە',
  },
  privacyChangesBody: {
    en: 'We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.',
    ar: 'قد نقوم بتحديث سياسة الخصوصية هذه من وقت لآخر. سنخطرك بأي تغييرات من خلال نشر السياسة الجديدة على هذه الصفحة وتحديث تاريخ "آخر تحديث".',
    ku: 'ئێمە دەتوانین ئەم سیاسەتی نهێنییەتییە لە کاتێک بە دوای کاتێک نوێ بکەینەوە. لە ڕێگەی دانانی سیاسەتی نوێ لەسەر ئەم پەڕەیە و نوێکردنەوەی "دوایین نوێکاری" ئاگادارت دەکەین.',
  },
  privacyContactTitle: {
    en: 'Contact Us',
    ar: 'تواصل معنا',
    ku: 'پەیوەندیمان پێوە بکە',
  },
  privacyContactIntro: {
    en: 'If you have questions about this Privacy Policy, contact us:',
    ar: 'إذا كانت لديك أسئلة حول سياسة الخصوصية هذه، تواصل معنا:',
    ku: 'ئەگەر پرسیارت هەیە سەبارەت بە ئەم سیاسەتی نهێنییەتییە، پەیوەندیمان پێوە بکە:',
  },
  privacyContactWhatsappLabel: {
    en: 'WhatsApp:',
    ar: 'واتساب:',
    ku: 'واتساپ:',
  },
  privacyContactEmailLabel: {
    en: 'Email:',
    ar: 'البريد الإلكتروني:',
    ku: 'ئیمەیل:',
  },
  changeLanguage: {
    en: 'Change Language',
    ar: 'تغيير اللغة',
    ku: 'گۆڕینی زمان',
  },
  logout: {
    en: 'Log Out',
    ar: 'تسجيل الخروج',
    ku: 'چوونەدەرەوە',
  },
  deleteAccount: {
    en: 'Delete Account',
    ar: 'حذف الحساب',
    ku: 'سڕینەوەی هەژمار',
  },
  deleteAccountConfirm: {
    en: 'Are you sure you want to delete your account? This cannot be undone.',
    ar: 'هل أنت متأكد من حذف حسابك؟ لا يمكن التراجع عن ذلك.',
    ku: 'دڵنیایت لە سڕینەوەی هەژمارەکەت؟ ئەمە ناگەڕێتەوە.',
  },
  deleteAccountSuccess: {
    en: 'Account deleted successfully.',
    ar: 'تم حذف الحساب بنجاح.',
    ku: 'هەژمار بە سەرکەوتوویی سڕایەوە.',
  },
  deleteAccountFailed: {
    en: 'Failed to delete account.',
    ar: 'فشل حذف الحساب.',
    ku: 'سڕینەوەی هەژمار سەرکەوتوو نەبوو.',
  },
  confirmLogout: {
    en: 'Are you sure you want to logout? You can use this password on another device after logout.',
    ar: 'هل أنت متأكد من تسجيل الخروج؟ يمكنك استخدام كلمة المرور هذه على جهاز آخر بعد تسجيل الخروج.',
    ku: 'دڵنیای لە دەرچوون؟ دەتوانی ئەم وشەی نهێنیە لەسەر ئامێری تر بەکاربهێنیت.',
  },
  loggedOutSuccessfully: {
    en: 'Logged out successfully. You can now use this password on another device.',
    ar: 'تم تسجيل الخروج بنجاح. يمكنك الآن استخدام كلمة المرور هذه على جهاز آخر.',
    ku: 'بە سەرکەوتوویی دەرچووی. ئێستا دەتوانی وشەی نهێنیەکە لەسەر ئامێری تر بەکاربهێنیت.',
  },
  logoutFailed: {
    en: 'Logout failed. Please try again.',
    ar: 'فشل تسجيل الخروج. يرجى المحاولة مرة أخرى.',
    ku: 'دەرچوون سەرکەوتوو نەبوو. تکایە دووبارە هەوڵبدەرەوە.',
  },
  accountInfo: {
    en: 'Account Information',
    ar: 'معلومات الحساب',
    ku: 'زانیاری هەژمار',
  },
  changePassword: {
    en: 'Change Password',
    ar: 'تغيير كلمة المرور',
    ku: 'گۆڕینی وشەی نهێنی',
  },
  newPassword: {
    en: 'New Password',
    ar: 'كلمة المرور الجديدة',
    ku: 'وشەی نهێنی نوێ',
  },
  confirmPassword: {
    en: 'Confirm Password',
    ar: 'تأكيد كلمة المرور',
    ku: 'دووبارەکردنەوەی وشەی نهێنی',
  },
  passwordChanged: {
    en: 'Password changed successfully',
    ar: 'تم تغيير كلمة المرور بنجاح',
    ku: 'وشەی نهێنی بە سەرکەوتوویی گۆڕدرا',
  },
  passwordsDoNotMatch: {
    en: 'Passwords do not match',
    ar: 'كلمات المرور غير متطابقة',
    ku: 'وشەی نهێنییەکان یەک ناگرنەوە',
  },
  passwordTooShort: {
    en: 'Password must be at least 6 characters',
    ar: 'يجب أن تكون كلمة المرور 6 أحرف على الأقل',
    ku: 'وشەی نهێنی دەبێت لانیکەم ٦ پیت بێت',
  },
  noOrdersDesc: {
    en: "You haven't placed any orders yet.",
    ar: 'لم تقم بتقديم أي طلبات بعد.',
    ku: 'تا ئێستا هیچ داواکاریەکت نەناردووە.',
  },
  productLink: {
    en: 'Product Link',
    ar: 'رابط المنتج',
    ku: 'لینکی بەرهەم',
  },
  details: {
    en: 'Details',
    ar: 'التفاصيل',
    ku: 'وردەکاریەکان',
  },
  orderDetails: {
    en: 'Order Details',
    ar: 'تفاصيل الطلب',
    ku: 'وردەکاریەکانی داواکاری',
  },
  orderNotFound: {
    en: 'Order not found',
    ar: 'الطلب غير موجود',
    ku: 'داواکاری نەدۆزرایەوە',
  },
 trackOnMap: {
   en: 'Track on Map',
   ar: 'تتبع على الخريطة',
   ku: 'بەدواداچوون لە نەخشە',
 },
 orderTracking: {
   en: 'Order Tracking',
   ar: 'تتبع الطلب',
   ku: 'بەدواداچوونی داواکاری',
 },
   guangzhou: {
     en: 'Guangzhou',
     ar: 'قوانغتشو',
     ku: 'گوانگجۆ',
   },
   ummQasr: {
     en: 'Umm Qasr',
     ar: 'أم قصر',
     ku: 'ئوم قەسر',
   },
   baghdad: {
     en: 'Baghdad',
     ar: 'بغداد',
     ku: 'بەغدا',
   },
   china: {
     en: 'China',
     ar: 'الصين',
     ku: 'چین',
   },
   iraq: {
     en: 'Iraq',
     ar: 'العراق',
     ku: 'عێراق',
   },
   seaRoute: {
     en: 'Sea',
     ar: 'بحري',
     ku: 'دەریایی',
   },
   airRoute: {
     en: 'Air',
     ar: 'جوي',
     ku: 'ئاسمانی',
   },
  dimensions: {
    en: 'Dimensions',
    ar: 'الأبعاد',
    ku: 'قەبارەکان',
  },
  enterDimensions: {
    en: 'Enter the dimensions of your product',
    ar: 'أدخل أبعاد منتجك',
    ku: 'قەبارەکانی بەرهەمەکەت بنووسە',
  },
  unitOfMeasurement: {
    en: 'Unit of Measurement',
    ar: 'وحدة القياس',
    ku: 'یەکەی پێوانە',
  },
  millimeter: {
    en: 'Millimeter',
    ar: 'ملليمتر',
    ku: 'میلیمەتر',
  },
  centimeter: {
    en: 'Centimeter',
    ar: 'سنتيمتر',
    ku: 'سەنتیمەتر',
  },
  meter: {
    en: 'Meter',
    ar: 'متر',
    ku: 'مەتر',
  },
  length: {
    en: 'Length',
    ar: 'الطول',
    ku: 'درێژی',
  },
  width: {
    en: 'Width',
    ar: 'العرض',
    ku: 'پانی',
  },
  height: {
    en: 'Height',
    ar: 'الارتفاع',
    ku: 'بەرزی',
  },
  weight: {
    en: 'Weight',
    ar: 'الوزن',
    ku: 'کێش',
  },
  weightUnit: {
    en: 'Weight Unit',
    ar: 'وحدة الوزن',
    ku: 'یەکەی کێش',
  },
  kilogram: {
    en: 'Kilogram',
    ar: 'كيلوغرام',
    ku: 'کیلۆگرام',
  },
  gram: {
    en: 'Gram',
    ar: 'غرام',
    ku: 'گرام',
  },
  quantity: {
    en: 'Quantity',
    ar: 'الكمية',
    ku: 'بڕ',
  },
  results: {
    en: 'Results',
    ar: 'النتائج',
    ku: 'ئەنجامەکان',
  },
  volume: {
    en: 'Volume',
    ar: 'الحجم',
    ku: 'قەبارە',
  },
  totalWeight: {
    en: 'Total Weight',
    ar: 'الوزن الإجمالي',
    ku: 'کۆی کێش',
  },
  estimatedCost: {
    en: 'Estimated Cost',
    ar: 'التكلفة التقديرية',
    ku: 'تێچووی خەمڵێنراو',
  },
  volumetricWeight: {
    en: 'Volumetric Weight',
    ar: 'الوزن الحجمي',
    ku: 'کێشی قەبارەیی',
  },
  seaFreight: {
    en: 'Sea Freight',
    ar: 'الشحن البحري',
    ku: 'بارکردن بە دەریا',
  },
  airFreight: {
    en: 'Air Freight',
    ar: 'الشحن الجوي',
    ku: 'بارکردن بە فڕۆکە',
  },
  containerCapacity: {
    en: 'Container Capacity',
    ar: 'سعة الحاوية',
    ku: 'گنجایشی کۆنتەینەر',
  },
  units: {
    en: 'units',
    ar: 'وحدة',
    ku: 'دانە',
  },
  cbmPriceRate: {
    en: 'CBM Price Rate',
    ar: 'سعر CBM',
    ku: 'نرخی CBM',
  },
  perCBM: {
    en: 'per CBM',
    ar: 'لكل CBM',
    ku: 'بۆ هەر CBM',
  },
  savePrice: {
    en: 'Save Price',
    ar: 'حفظ السعر',
    ku: 'نرخ پاشەکەوت بکە',
  },
  lastUpdated: {
    en: 'Last updated',
    ar: 'آخر تحديث',
    ku: 'دوایین نوێکردنەوە',
  },
  priceSaved: {
    en: 'Price saved successfully!',
    ar: 'تم حفظ السعر بنجاح!',
    ku: 'نرخ بە سەرکەوتوویی پاشەکەوت کرا!',
  },
  priceDisclaimer: {
    en: 'This is an estimated price and may vary. Final cost could be higher or lower.',
    ar: 'هذا سعر تقديري وقد يختلف. التكلفة النهائية قد تكون أعلى أو أقل.',
    ku: 'ئەمە نرخێکی خەمڵێنراوە و دەکرێت جیاواز بێت. تێچووی کۆتایی دەکرێت زیاتر یان کەمتر بێت.',
  },
  calculateCbm: {
    en: 'Calculate CBM',
    ar: 'حساب CBM',
    ku: 'ژمێردنی CBM',
  },
  calculateCbmDesc: {
    en: 'Calculate cubic meters from product dimensions',
    ar: 'احسب الأمتار المكعبة من أبعاد المنتج',
    ku: 'مەترە کیوبی لە قەبارەکانی بەرهەم بژمێرە',
  },
  checkCostByCbm: {
    en: 'Check Cost by CBM',
    ar: 'حساب التكلفة بالـ CBM',
    ku: 'پشکنینی تێچوو بە CBM',
  },
  checkCostByCbmDesc: {
    en: 'Calculate shipping cost from your CBM value',
    ar: 'احسب تكلفة الشحن من قيمة CBM الخاصة بك',
    ku: 'تێچووی ناردن لە بەهای CBM کەت بژمێرە',
  },
  enterCbmValue: {
    en: 'Enter your CBM value',
    ar: 'أدخل قيمة CBM',
    ku: 'بەهای CBM بنووسە',
  },
  cbmValue: {
    en: 'CBM Value',
    ar: 'قيمة CBM',
    ku: 'بەهای CBM',
  },
  currentCbmPrice: {
    en: 'Current CBM Price',
    ar: 'سعر CBM الحالي',
    ku: 'نرخی CBM ی ئێستا',
  },
  // Orders page
  orders: {
    en: 'Orders',
    ar: 'الطلبات',
    ku: 'داواکارییەکان',
  },
  ordersDesc: {
    en: 'Place new orders, view your orders, and track shipments',
    ar: 'تقديم طلبات جديدة، عرض طلباتك، وتتبع الشحنات',
    ku: 'داواکاری نوێ تۆمار بکە، داواکارییەکانت ببینە، و شوێنکەوتنی بارەکان',
  },
  placeOrderDesc: {
    en: 'Submit a new order from any website',
    ar: 'تقديم طلب جديد من أي موقع',
    ku: 'داواکاری نوێ لە هەر ماڵپەڕێک تۆمار بکە',
  },
  myOrdersDesc: {
    en: 'Check the status of your pending orders',
    ar: 'تحقق من حالة طلباتك المعلقة',
    ku: 'دۆخی داواکارییە چاوەڕوانەکانت بپشکنە',
  },
  trackOrderDesc: {
    en: 'Track your orders in real-time',
    ar: 'تتبع طلباتك في الوقت الفعلي',
    ku: 'شوێنکەوتنی داواکارییەکانت لە کاتی ڕاستەقینەدا',
  },
  // Wholesale Products
  wholesaleProducts: {
    en: 'Wholesale Products',
    ar: 'المنتجات بالجملة',
    ku: 'بەرهەمەکانی کۆمەڵ',
  },
  wholesaleProductsDesc: {
    en: 'Browse our wholesale product catalog',
    ar: 'تصفح كتالوج منتجاتنا بالجملة',
    ku: 'کاتالۆگی بەرهەمەکانی کۆمەڵمان ببینە',
  },
  manageProducts: {
    en: 'Manage Products',
    ar: 'إدارة المنتجات',
    ku: 'بەڕێوەبردنی بەرهەمەکان',
  },
  categories: {
    en: 'Categories',
    ar: 'الفئات',
    ku: 'پۆلەکان',
  },
  products: {
    en: 'Products',
    ar: 'المنتجات',
    ku: 'بەرهەمەکان',
  },
  productCategories: {
    en: 'Product Categories',
    ar: 'فئات المنتجات',
    ku: 'پۆلەکانی بەرهەم',
  },
  addCategory: {
    en: 'Add Category',
    ar: 'إضافة فئة',
    ku: 'زیادکردنی پۆل',
  },
  editCategory: {
    en: 'Edit Category',
    ar: 'تعديل الفئة',
    ku: 'دەستکاریکردنی پۆل',
  },
  categoryName: {
    en: 'Category Name',
    ar: 'اسم الفئة',
    ku: 'ناوی پۆل',
  },
  categoryImage: {
    en: 'Category Image',
    ar: 'صورة الفئة',
    ku: 'وێنەی پۆل',
  },
  noCategories: {
    en: 'No categories yet',
    ar: 'لا توجد فئات بعد',
    ku: 'هێشتا پۆل نییە',
  },
   shops: {
     en: 'Shops',
     ar: 'المتاجر',
     ku: 'دوکانەکان',
   },
   noShops: {
     en: 'No shops yet',
     ar: 'لا توجد متاجر بعد',
     ku: 'هێشتا دوکان نییە',
   },
   addShop: {
     en: 'Add Shop',
     ar: 'إضافة متجر',
     ku: 'زیادکردنی دوکان',
   },
   editShop: {
     en: 'Edit Shop',
     ar: 'تعديل المتجر',
     ku: 'دەستکاریکردنی دوکان',
   },
   shopName: {
     en: 'Shop Name',
     ar: 'اسم المتجر',
     ku: 'ناوی دوکان',
   },
   shopCreated: {
     en: 'Shop created successfully',
     ar: 'تم إنشاء المتجر بنجاح',
     ku: 'دوکان بە سەرکەوتوویی دروستکرا',
   },
   shopUpdated: {
     en: 'Shop updated successfully',
     ar: 'تم تحديث المتجر بنجاح',
     ku: 'دوکان بە سەرکەوتوویی نوێکرایەوە',
   },
   shopDeleted: {
     en: 'Shop deleted successfully',
     ar: 'تم حذف المتجر بنجاح',
     ku: 'دوکان بە سەرکەوتوویی سڕایەوە',
   },
   shopNameRequired: {
     en: 'Shop name is required',
     ar: 'اسم المتجر مطلوب',
     ku: 'ناوی دوکان پێویستە',
   },
  addProduct: {
    en: 'Add Product',
    ar: 'إضافة منتج',
    ku: 'زیادکردنی بەرهەم',
  },
  editProduct: {
    en: 'Edit Product',
    ar: 'تعديل المنتج',
    ku: 'دەستکاریکردنی بەرهەم',
  },
  productName: {
    en: 'Product Name',
    ar: 'اسم المنتج',
    ku: 'ناوی بەرهەم',
  },
  productImage: {
    en: 'Product Image',
    ar: 'صورة المنتج',
    ku: 'وێنەی بەرهەم',
  },
  noProducts: {
    en: 'No products yet',
    ar: 'لا توجد منتجات بعد',
    ku: 'هێشتا بەرهەم نییە',
  },
  addCategoryFirst: {
    en: 'Add a category first',
    ar: 'أضف فئة أولاً',
    ku: 'سەرەتا پۆل زیادبکە',
  },
  selectCategory: {
    en: 'Select Category',
    ar: 'اختر الفئة',
    ku: 'پۆل هەڵبژێرە',
  },
  category: {
    en: 'Category',
    ar: 'الفئة',
    ku: 'پۆل',
  },
  description: {
    en: 'Description',
    ar: 'الوصف',
    ku: 'وەسف',
  },
  price: {
    en: 'Price',
    ar: 'السعر',
    ku: 'نرخ',
  },
  askForPrice: {
    en: 'Ask for Price',
    ar: 'استفسر عن السعر',
    ku: 'داوای نرخ بکە',
  },
  saveChanges: {
    en: 'Save Changes',
    ar: 'حفظ التغييرات',
    ku: 'گۆڕانکارییەکان پاشەکەوت بکە',
  },
  noProductsYet: {
    en: 'No products yet',
    ar: 'لا توجد منتجات بعد',
    ku: 'هێشتا بەرهەم نییە',
  },
  passwordRequired: {
    en: 'Password Required',
    ar: 'كلمة المرور مطلوبة',
    ku: 'وشەی نهێنی پێویستە',
  },
  enterWholesalePassword: {
    en: 'Enter the password to access wholesale products',
    ar: 'أدخل كلمة المرور للوصول إلى المنتجات بالجملة',
    ku: 'وشەی نهێنی بنووسە بۆ دەستگەیشتن بە بەرهەمەکانی کۆمەڵ',
  },
  enter: {
    en: 'Enter',
    ar: 'دخول',
    ku: 'چوونەژوورەوە',
  },
  accessGranted: {
    en: 'Access granted!',
    ar: 'تم السماح بالدخول!',
    ku: 'دەستگەیشتن ڕێگەپێدرا!',
  },
  incorrectPassword: {
    en: 'Incorrect password',
    ar: 'كلمة المرور غير صحيحة',
    ku: 'وشەی نهێنی هەڵەیە',
  },
  wholesalePassword: {
    en: 'Wholesale Password',
    ar: 'كلمة مرور الجملة',
    ku: 'وشەی نهێنی کۆمەڵ',
  },
  wholesalePasswordDesc: {
    en: 'Set the password for customers to access wholesale products',
    ar: 'عيّن كلمة المرور ليتمكن العملاء من الوصول إلى المنتجات بالجملة',
    ku: 'وشەی نهێنی دابنێ بۆ کڕیارەکان بۆ دەستگەیشتن بە بەرهەمەکانی کۆمەڵ',
  },
  enterNewPassword: {
    en: 'Enter new password',
    ar: 'أدخل كلمة مرور جديدة',
    ku: 'وشەی نهێنی نوێ بنووسە',
  },
  savePassword: {
    en: 'Save Password',
    ar: 'حفظ كلمة المرور',
    ku: 'وشەی نهێنی پاشەکەوت بکە',
  },
  passwordSaved: {
    en: 'Password saved successfully!',
    ar: 'تم حفظ كلمة المرور بنجاح!',
    ku: 'وشەی نهێنی بە سەرکەوتوویی پاشەکەوت کرا!',
  },
  productsWithPrice: {
    en: 'Products with Price',
    ar: 'المنتجات مع السعر',
    ku: 'بەرهەمەکان لەگەڵ نرخ',
  },
  productsWithPriceDesc: {
    en: 'Browse daily uploaded products with prices',
    ar: 'تصفح المنتجات اليومية مع الأسعار',
    ku: 'بەرهەمە ڕۆژانەکان ببینە لەگەڵ نرخ',
  },
  productsWithoutPrice: {
    en: 'Products without Price',
    ar: 'المنتجات بدون سعر',
    ku: 'بەرهەمەکان بێ نرخ',
  },
  productsWithoutPriceDesc: {
    en: 'Browse categories with external links',
    ar: 'تصفح الفئات مع الروابط الخارجية',
    ku: 'پۆلەکان ببینە لەگەڵ لینکی دەرەکی',
  },
  externalLinks: {
    en: 'External Links',
    ar: 'الروابط الخارجية',
    ku: 'لینکە دەرەکییەکان',
  },
  manageExternalLinks: {
    en: 'Manage External Links',
    ar: 'إدارة الروابط الخارجية',
    ku: 'بەڕێوەبردنی لینکە دەرەکییەکان',
  },
  addLink: {
    en: 'Add Link',
    ar: 'إضافة رابط',
    ku: 'زیادکردنی لینک',
  },
  editLink: {
    en: 'Edit Link',
    ar: 'تعديل الرابط',
    ku: 'دەستکاریکردنی لینک',
  },
  linkName: {
    en: 'Link Name',
    ar: 'اسم الرابط',
    ku: 'ناوی لینک',
  },
  externalLink: {
    en: 'External Link',
    ar: 'الرابط الخارجي',
    ku: 'لینکی دەرەکی',
  },
  noLinksYet: {
    en: 'No links yet',
    ar: 'لا توجد روابط بعد',
    ku: 'هێشتا لینک نییە',
  },
  customerPasswords: {
    en: 'Customer Passwords',
    ar: 'كلمات مرور العملاء',
    ku: 'وشەی نهێنی کڕیارەکان',
  },
  createPassword: {
    en: 'Create Password',
    ar: 'إنشاء كلمة مرور',
    ku: 'دروستکردنی وشەی نهێنی',
  },
  customerName: {
    en: 'Customer Name',
    ar: 'اسم العميل',
    ku: 'ناوی کڕیار',
  },
  enterCustomerName: {
    en: 'Enter customer name',
    ar: 'أدخل اسم العميل',
    ku: 'ناوی کڕیار بنووسە',
  },
  generatedPassword: {
    en: 'Generated Password',
    ar: 'كلمة المرور المولدة',
    ku: 'وشەی نهێنی دروستکراو',
  },
  customerNameRequired: {
    en: 'Customer name is required',
    ar: 'اسم العميل مطلوب',
    ku: 'ناوی کڕیار پێویستە',
  },
  passwordCreated: {
    en: 'Password created successfully!',
    ar: 'تم إنشاء كلمة المرور بنجاح!',
    ku: 'وشەی نهێنی بە سەرکەوتوویی دروستکرا!',
  },
  noPasswordsYet: {
    en: 'No passwords yet',
    ar: 'لا توجد كلمات مرور بعد',
    ku: 'هێشتا وشەی نهێنی نییە',
  },
  deviceLinked: {
    en: 'Device linked',
    ar: 'الجهاز مرتبط',
    ku: 'ئامێر بەستراوە',
  },
  notUsedYet: {
    en: 'Not used yet',
    ar: 'لم يستخدم بعد',
    ku: 'هێشتا بەکارنەهاتووە',
  },
  usedAt: {
    en: 'Used at',
    ar: 'استخدم في',
    ku: 'بەکارهات لە',
  },
  resetDevice: {
    en: 'Reset Device',
    ar: 'إعادة تعيين الجهاز',
    ku: 'ڕیسێتکردنی ئامێر',
  },
  confirmResetDevice: {
    en: 'This will allow the password to be used on a different device. Continue?',
    ar: 'سيتيح هذا استخدام كلمة المرور على جهاز مختلف. متابعة؟',
    ku: 'ئەمە ڕێگە دەدات وشەی نهێنی لە ئامێرێکی تر بەکاربهێنرێت. بەردەوام بیت؟',
  },
  deviceReset: {
    en: 'Device reset successfully',
    ar: 'تم إعادة تعيين الجهاز بنجاح',
    ku: 'ئامێر بە سەرکەوتوویی ڕیسێت کرا',
  },
  confirmDelete: {
    en: 'Are you sure you want to delete this?',
    ar: 'هل أنت متأكد من الحذف؟',
    ku: 'دڵنیایت لە سڕینەوە؟',
  },
  copied: {
    en: 'Copied!',
    ar: 'تم النسخ!',
    ku: 'کۆپی کرا!',
  },
  enterYourPassword: {
    en: 'Enter your unique password',
    ar: 'أدخل كلمة المرور الخاصة بك',
    ku: 'وشەی نهێنی تایبەتی خۆت بنووسە',
  },
  passwordUsedByOther: {
    en: 'This password is already linked to another device',
    ar: 'كلمة المرور مرتبطة بجهاز آخر',
    ku: 'ئەم وشەی نهێنییە پێشتر بە ئامێرێکی تر بەستراوە',
  },
  noPasswordContact: {
    en: "Don't have a password? Contact us to get one:",
    ar: 'ليس لديك كلمة مرور؟ تواصل معنا للحصول على واحدة:',
    ku: 'وشەی نهێنیت نییە؟ پەیوەندیمان پێوە بکە بۆ وەرگرتنی:',
  },
  sharedPassword: {
    en: 'Shared Password',
    ar: 'كلمة مرور مشتركة',
    ku: 'وشەی نهێنی هاوبەش',
  },
  sharedPasswordDesc: {
    en: 'Anyone can use this password (no device lock)',
    ar: 'يمكن لأي شخص استخدام كلمة المرور (بدون قفل الجهاز)',
    ku: 'هەرکەسێک دەتوانێت ئەم وشەی نهێنییە بەکاربهێنێت (بەبێ قفڵی ئامێر)',
  },
  promoPassword: {
    en: 'Promo Password',
    ar: 'كلمة مرور ترويجية',
    ku: 'وشەی نهێنی پرۆمۆ',
  },
  passwordLabel: {
    en: 'Label',
    ar: 'التسمية',
    ku: 'ناونیشان',
  },
  optional: {
    en: 'optional',
    ar: 'اختياري',
    ku: 'ئارەزوومەندانە',
  },
  shopNote: {
    en: 'Shop Note',
    ar: 'ملاحظة المتجر',
    ku: 'تێبینی فرۆشگا',
  },
  // Bulk product upload
  bulkAdd: {
    en: 'Bulk Add',
    ar: 'إضافة متعددة',
    ku: 'زیادکردنی کۆمەڵ',
  },
  bulkAddProducts: {
    en: 'Bulk Add Products',
    ar: 'إضافة منتجات متعددة',
    ku: 'زیادکردنی بەرهەمەکانی کۆمەڵ',
  },
  sharedName: {
    en: 'Shared Name for All',
    ar: 'اسم موحد للجميع',
    ku: 'ناوی هاوبەش بۆ هەمووان',
  },
  sharedPrice: {
    en: 'Shared Price for All',
    ar: 'سعر موحد للجميع',
    ku: 'نرخی هاوبەش بۆ هەمووان',
  },
  selectImages: {
    en: 'Select Multiple Images',
    ar: 'اختر صور متعددة',
    ku: 'چەند وێنەیەک هەڵبژێرە',
  },
  bulkImageHint: {
    en: 'Each image will become a separate product',
    ar: 'كل صورة ستصبح منتج منفصل',
    ku: 'هەر وێنەیەک دەبێتە بەرهەمێکی جیا',
  },
  productsToCreate: {
    en: 'Products to Create',
    ar: 'المنتجات للإنشاء',
    ku: 'بەرهەمەکان بۆ دروستکردن',
  },
  createAll: {
    en: 'Create All',
    ar: 'إنشاء الكل',
    ku: 'دروستکردنی هەموو',
  },
  bulkProductsCreated: {
    en: '{count} products created successfully!',
    ar: 'تم إنشاء {count} منتج بنجاح!',
    ku: '{count} بەرهەم بە سەرکەوتوویی دروستکران!',
  },
  bulkSelectImages: {
    en: 'Please select at least one image',
    ar: 'يرجى اختيار صورة واحدة على الأقل',
    ku: 'تکایە لانیکەم یەک وێنە هەڵبژێرە',
  },
  duplicate: {
    en: 'Duplicate',
    ar: 'نسخ',
    ku: 'دووبارەکردنەوە',
  },
  add: {
    en: 'Add',
    ar: 'إضافة',
    ku: 'زیادکردن',
  },
  cancel: {
    en: 'Cancel',
    ar: 'إلغاء',
    ku: 'پاشگەزبوونەوە',
  },
  save: {
    en: 'Save',
    ar: 'حفظ',
    ku: 'پاشەکەوتکردن',
  },
  error: {
    en: 'Error',
    ar: 'خطأ',
    ku: 'هەڵە',
  },
  success: {
    en: 'Success',
    ar: 'نجاح',
    ku: 'سەرکەوتوو',
  },
  searchCustomer: {
    en: 'Search Registered Customer',
    ar: 'البحث عن عميل مسجل',
    ku: 'گەڕان بۆ کڕیاری تۆمارکراو',
  },
  searchByPhone: {
    en: 'Search by phone or name...',
    ar: 'البحث برقم الهاتف أو الاسم...',
    ku: 'گەڕان بە ژمارە یان ناو...',
  },
  noName: {
    en: 'No name',
    ar: 'بدون اسم',
    ku: 'بێ ناو',
  },
  noPhone: {
    en: 'No phone',
    ar: 'بدون رقم',
    ku: 'بێ ژمارە',
  },
  orEnterManually: {
    en: 'Or enter customer name manually',
    ar: 'أو أدخل اسم العميل يدوياً',
    ku: 'یان ناوی کڕیار بە دەست بنووسە',
  },
  noMoreProducts: {
    en: 'No more products',
    ar: 'لا توجد منتجات أخرى',
    ku: 'بەرهەمی تر نییە',
  },
  // Special Request
  specialRequest: {
    en: 'Special Request',
    ar: 'طلب خاص',
    ku: 'داواکاری تایبەت',
  },
  specialRequestDesc: {
    en: 'Request a custom product with details',
    ar: 'اطلب منتجاً مخصصاً مع التفاصيل',
    ku: 'داواکاری بەرهەمی تایبەت لەگەڵ وردەکارییەکان',
  },
  specialRequestInfo: {
    en: 'Please write the details and your needs clearly. Include:',
    ar: 'يرجى كتابة التفاصيل واحتياجاتك بوضوح. تضمين:',
    ku: 'تکایە وردەکارییەکان و پێویستییەکانت بە ڕوونی بنووسە. لەخۆبگرێت:',
  },
  specialRequestColor: {
    en: 'The exact color you want',
    ar: 'اللون المحدد الذي تريده',
    ku: 'ڕەنگی تایبەتی دەتەوێت',
  },
  specialRequestSize: {
    en: 'The exact size you need',
    ar: 'المقاس المحدد الذي تحتاجه',
    ku: 'قەبارەی تایبەتی پێویستت پێیە',
  },
  specialRequestWhy: {
    en: 'Why you want this specific item',
    ar: 'لماذا تريد هذا المنتج بالذات',
    ku: 'بۆچی ئەم بەرهەمە تایبەتە دەتەوێت',
  },
  specialRequestOther: {
    en: 'Any other important details',
    ar: 'أي تفاصيل مهمة أخرى',
    ku: 'هەر وردەکاریەکی گرنگی تر',
  },
  detailsAndRequirements: {
    en: 'Details & Requirements',
    ar: 'التفاصيل والمتطلبات',
    ku: 'وردەکارییەکان و پێداویستییەکان',
  },
  detailsPlaceholder: {
    en: 'Describe exactly what you need...\n\n• What color do you want?\n• What size do you need?\n• Any special features?\n• Why do you need this specific item?',
    ar: 'صف بالضبط ما تحتاجه...\n\n• ما اللون الذي تريده؟\n• ما المقاس الذي تحتاجه؟\n• أي ميزات خاصة؟\n• لماذا تحتاج هذا المنتج بالذات؟',
    ku: 'بە ورد بنووسە چیت پێویستە...\n\n• چ ڕەنگێکت دەوێت؟\n• چ قەبارەیەکت پێویستە؟\n• تایبەتمەندیەکی تایبەت؟\n• بۆچی ئەم بەرهەمە تایبەتە پێویستە؟',
  },
  attachmentPhotoVideo: {
    en: 'Attachment (Photo or Video)',
    ar: 'المرفق (صورة أو فيديو)',
    ku: 'هاوپێچ (وێنە یان ڤیدیۆ)',
  },
  clickToUpload: {
    en: 'Click to upload a photo or video',
    ar: 'انقر لرفع صورة أو فيديو',
    ku: 'کرتە بکە بۆ بارکردنی وێنە یان ڤیدیۆ',
  },
  maxSize: {
    en: 'Max size: 50MB',
    ar: 'الحد الأقصى: 50MB',
    ku: 'زۆرترین قەبارە: 50MB',
  },
  uploading: {
    en: 'Uploading...',
    ar: 'جاري الرفع...',
    ku: 'بارکردن...',
  },
  sending: {
    en: 'Sending...',
    ar: 'جاري الإرسال...',
    ku: 'ناردن...',
  },
  sendRequest: {
    en: 'Send Request',
    ar: 'إرسال الطلب',
    ku: 'ناردنی داواکاری',
  },
  pleaseLoginFirst: {
    en: 'Please login first',
    ar: 'يرجى تسجيل الدخول أولاً',
    ku: 'تکایە سەرەتا بچۆرەژوورەوە',
  },
  fillRequiredFields: {
    en: 'Please fill in all required fields',
    ar: 'يرجى ملء جميع الحقول المطلوبة',
    ku: 'تکایە هەموو خانەکانی پێویست پڕ بکەرەوە',
  },
  fileTooLarge: {
    en: 'File too large. Maximum size is 50MB.',
    ar: 'الملف كبير جداً. الحد الأقصى 50MB.',
    ku: 'فایلەکە زۆر گەورەیە. زۆرترین قەبارە 50MB.',
  },
  requestSentSuccess: {
    en: 'Request sent successfully!',
    ar: 'تم إرسال الطلب بنجاح!',
    ku: 'داواکاری بە سەرکەوتوویی نێردرا!',
  },
  failedToSendRequest: {
    en: 'Failed to send request',
    ar: 'فشل إرسال الطلب',
    ku: 'ناردنی داواکاری سەرکەوتوو نەبوو',
  },
  enterProductName: {
    en: 'Enter the product name...',
    ar: 'أدخل اسم المنتج...',
    ku: 'ناوی بەرهەم بنووسە...',
  },
  // Install Prompt
  addToHomeScreen: {
    en: 'Add to Home Screen',
    ar: 'أضف إلى الشاشة الرئيسية',
    ku: 'زیادکردن بۆ شاشەی سەرەکی',
  },
  installIOSInstructions: {
    en: 'Install this app on your iPhone for quick access:',
    ar: 'قم بتثبيت هذا التطبيق على جهاز iPhone للوصول السريع:',
    ku: 'ئەم ئەپە دابمەزرێنە لەسەر ئایفۆنەکەت بۆ دەستڕاگەیشتنی خێرا:',
  },
  installAndroidInstructions: {
    en: 'Install this app on your device for quick access anytime.',
    ar: 'قم بتثبيت هذا التطبيق على جهازك للوصول السريع في أي وقت.',
    ku: 'ئەم ئەپە دابمەزرێنە لەسەر ئامێرەکەت بۆ دەستڕاگەیشتنی خێرا لە هەر کاتێکدا.',
  },
  tapShare: {
    en: 'Tap the Share button',
    ar: 'اضغط على زر المشاركة',
    ku: 'دوگمەی هاوبەشکردن دابگرە',
  },
  inSafari: {
    en: 'In Safari browser toolbar',
    ar: 'في شريط أدوات متصفح Safari',
    ku: 'لە تووڵامرازی گەڕۆکی سافاری',
  },
  addToHome: {
    en: 'Add to Home Screen',
    ar: 'أضف إلى الشاشة الرئيسية',
    ku: 'زیادکردن بۆ شاشەی سەرەکی',
  },
  scrollAndTap: {
    en: 'Scroll down and tap',
    ar: 'مرر للأسفل واضغط',
    ku: 'بۆ خوار بڕۆ و دابگرە',
  },
  gotIt: {
    en: 'Got it!',
    ar: 'فهمت!',
    ku: 'تێگەیشتم!',
  },
  notNow: {
    en: 'Not now',
    ar: 'ليس الآن',
    ku: 'نا ئێستا',
  },
  install: {
    en: 'Install',
    ar: 'تثبيت',
    ku: 'دامەزراندن',
  },
  // Additional admin/tracking translations
  manageAllOrders: {
    en: 'Manage all orders',
    ar: 'إدارة جميع الطلبات',
    ku: 'بەڕێوەبردنی هەموو داواکارییەکان',
  },
  trackYourShipments: {
    en: 'Track your shipments',
    ar: 'تتبع شحناتك',
    ku: 'شوێنکەوتنی بارەکانت',
  },
  contactOnWhatsApp: {
    en: 'Contact on WhatsApp',
    ar: 'تواصل عبر واتساب',
    ku: 'پەیوەندی لە واتساپ',
  },
  openingWhatsApp: {
    en: 'Opening WhatsApp...',
    ar: 'جاري فتح واتساب...',
    ku: 'کردنەوەی واتساپ...',
  },
  newOrders: {
    en: 'New',
    ar: 'جديد',
    ku: 'نوێ',
  },
  activeOrders: {
    en: 'Active',
    ar: 'نشط',
    ku: 'چالاک',
  },
  archive: {
    en: 'Archive',
    ar: 'الأرشيف',
    ku: 'ئەرشیف',
  },
  finances: {
    en: 'Finances',
    ar: 'المالية',
    ku: 'دارایی',
  },
  quoteSent: {
    en: 'Quote sent successfully!',
    ar: 'تم إرسال السعر بنجاح!',
    ku: 'نرخ بە سەرکەوتوویی نێردرا!',
  },
  statusUpdated: {
    en: 'Status updated!',
    ar: 'تم تحديث الحالة!',
    ku: 'دۆخ نوێکرایەوە!',
  },
  failedToSendQuote: {
    en: 'Failed to send quote',
    ar: 'فشل إرسال السعر',
    ku: 'ناردنی نرخ سەرکەوتوو نەبوو',
  },
  failedToUpdateStatus: {
    en: 'Failed to update status',
    ar: 'فشل تحديث الحالة',
    ku: 'نوێکردنەوەی دۆخ سەرکەوتوو نەبوو',
  },
  airShippingCost: {
    en: 'Air Shipping Cost',
    ar: 'تكلفة الشحن الجوي',
    ku: 'تێچووی ناردن بە فڕۆکە',
  },
  seaShippingCost: {
    en: 'Sea Shipping Cost',
    ar: 'تكلفة الشحن البحري',
    ku: 'تێچووی ناردن بە دەریا',
  },
  adminBenefit: {
    en: 'Admin Benefit',
    ar: 'ربح الإدارة',
    ku: 'قازانجی بەڕێوەبەر',
  },
  trackingNumber: {
    en: 'Tracking Number',
    ar: 'رقم التتبع',
    ku: 'ژمارەی شوێنکەوتن',
  },
  receiptInvoice: {
    en: 'Receipt/Invoice URL',
    ar: 'رابط الإيصال/الفاتورة',
    ku: 'لینکی وەسڵ/فاکتورە',
  },
  amountPaidLabel: {
    en: 'Amount Paid ($)',
    ar: 'المبلغ المدفوع ($)',
    ku: 'بڕی پارەی دراو ($)',
  },
  paymentNotes: {
    en: 'Payment Notes',
    ar: 'ملاحظات الدفع',
    ku: 'تێبینییەکانی پارەدان',
  },
  completed: {
    en: 'Completed',
    ar: 'مكتمل',
    ku: 'تەواوبوو',
  },
  exchangeRate: {
    en: 'Exchange Rate',
    ar: 'سعر الصرف',
    ku: 'نرخی ئاڵوگۆڕ',
  },
  oneUsdEquals: {
    en: '1 USD = ? IQD',
    ar: '1 دولار = ؟ دينار عراقي',
    ku: '1 دۆلار = ؟ دیناری عێراقی',
  },
  saveExchangeRate: {
    en: 'Save Rate',
    ar: 'حفظ السعر',
    ku: 'نرخ پاشەکەوت بکە',
  },
  rmbExchangeRate: {
    en: 'RMB to USD Exchange Rate',
    ar: 'سعر صرف اليوان للدولار',
    ku: 'نرخی گۆڕین یوان بە دۆلار',
  },
  rmbExchangeRateDesc: {
    en: 'Set how many RMB equals 1 USD (e.g., 7 RMB = 1 USD)',
    ar: 'حدد كم يوان صيني يساوي 1 دولار (مثال: 7 يوان = 1 دولار)',
    ku: 'دیاری بکە چەند یوان یەک دۆلار دەکات (بۆ نموونە: 7 یوان = 1 دۆلار)',
  },
  rmbPerUsd: {
    en: '1 USD = ? RMB',
    ar: '1 دولار = ؟ يوان',
    ku: '1 دۆلار = ؟ یوان',
  },
  rmbExchangeRateSaved: {
    en: 'RMB exchange rate saved!',
    ar: 'تم حفظ سعر صرف اليوان!',
    ku: 'نرخی گۆڕین یوان پاشەکەوت کرا!',
  },
  exchangeRateUsdIqd: {
    en: 'Exchange Rate (USD to IQD)',
    ar: 'سعر الصرف (دولار إلى دينار عراقي)',
    ku: 'نرخی گۆڕین (دۆلار بۆ دینار)',
  },
  uploadedOn: {
    en: 'Uploaded on',
    ar: 'تم الرفع في',
    ku: 'بارکراوە لە',
  },
  noOrdersToTrack: {
    en: 'No active orders to track',
    ar: 'لا توجد طلبات نشطة للتتبع',
    ku: 'هیچ داواکاریەکی چالاک نییە بۆ شوێنکەوتن',
  },
  viewMyOrders: {
    en: 'View My Orders',
    ar: 'عرض طلباتي',
    ku: 'بینینی داواکارییەکانم',
  },
  onceOrderAccepted: {
    en: 'Once your order is accepted, you can track it here.',
    ar: 'بمجرد قبول طلبك، يمكنك تتبعه هنا.',
    ku: 'کاتێک داواکاریەکەت پەسەند کرا، دەتوانیت لێرە شوێنی بکەیتەوە.',
  },
  // NotFound page
  pageNotFound: {
    en: 'Oops! Page not found',
    ar: 'عذراً! الصفحة غير موجودة',
    ku: 'ببورە! پەڕە نەدۆزرایەوە',
  },
  returnToHome: {
    en: 'Return to Home',
    ar: 'العودة إلى الرئيسية',
    ku: 'گەڕانەوە بۆ سەرەتا',
  },
  // Special requests
  myRequests: {
    en: 'My Requests',
    ar: 'طلباتي',
    ku: 'داواکارییەکانم',
  },
  answered: {
    en: 'Answered',
    ar: 'تمت الإجابة',
    ku: 'وەڵام دراوە',
  },
  loading: {
    en: 'Loading...',
    ar: 'جاري التحميل...',
    ku: 'بارکردن...',
  },
  noRequestsYet: {
    en: 'No requests yet',
    ar: 'لا توجد طلبات بعد',
    ku: 'هێشتا داواکاری نییە',
  },
  addRequest: {
    en: 'Add Request',
    ar: 'إضافة طلب',
    ku: 'زیادکردنی داواکاری',
  },
  // Common toast messages
  failedToSave: {
    en: 'Failed to save',
    ar: 'فشل الحفظ',
    ku: 'پاشەکەوتکردن سەرکەوتوو نەبوو',
  },
  failedToDelete: {
    en: 'Failed to delete',
    ar: 'فشل الحذف',
    ku: 'سڕینەوە سەرکەوتوو نەبوو',
  },
  failedToUpdate: {
    en: 'Failed to update',
    ar: 'فشل التحديث',
    ku: 'نوێکردنەوە سەرکەوتوو نەبوو',
  },
  failedToAdd: {
    en: 'Failed to add',
    ar: 'فشل الإضافة',
    ku: 'زیادکردن سەرکەوتوو نەبوو',
  },
  deletedSuccessfully: {
    en: 'Deleted successfully',
    ar: 'تم الحذف بنجاح',
    ku: 'بە سەرکەوتوویی سڕایەوە',
  },
  savedSuccessfully: {
    en: 'Saved successfully',
    ar: 'تم الحفظ بنجاح',
    ku: 'بە سەرکەوتوویی پاشەکەوت کرا',
  },
  createdSuccessfully: {
    en: 'Created successfully',
    ar: 'تم الإنشاء بنجاح',
    ku: 'بە سەرکەوتوویی دروست کرا',
  },
  updatedSuccessfully: {
    en: 'Updated successfully',
    ar: 'تم التحديث بنجاح',
    ku: 'بە سەرکەوتوویی نوێکرایەوە',
  },
  nameRequired: {
    en: 'Name is required',
    ar: 'الاسم مطلوب',
    ku: 'ناو پێویستە',
  },
  linkRequired: {
    en: 'Name and link are required',
    ar: 'الاسم والرابط مطلوبان',
    ku: 'ناو و لینک پێویستن',
  },
  categoryCreated: {
    en: 'Category created',
    ar: 'تم إنشاء الفئة',
    ku: 'پۆل دروست کرا',
  },
  categoryUpdated: {
    en: 'Category updated',
    ar: 'تم تحديث الفئة',
    ku: 'پۆل نوێکرایەوە',
  },
  categoryDeleted: {
    en: 'Category deleted',
    ar: 'تم حذف الفئة',
    ku: 'پۆل سڕایەوە',
  },
  productCreated: {
    en: 'Product created',
    ar: 'تم إنشاء المنتج',
    ku: 'بەرهەم دروست کرا',
  },
  productUpdated: {
    en: 'Product updated',
    ar: 'تم تحديث المنتج',
    ku: 'بەرهەم نوێکرایەوە',
  },
  productDeleted: {
    en: 'Product deleted',
    ar: 'تم حذف المنتج',
    ku: 'بەرهەم سڕایەوە',
  },
  productNameRequired: {
    en: 'Product name is required',
    ar: 'اسم المنتج مطلوب',
    ku: 'ناوی بەرهەم پێویستە',
  },
  categoryNameRequired: {
    en: 'Category name is required',
    ar: 'اسم الفئة مطلوب',
    ku: 'ناوی پۆل پێویستە',
  },
  failedToReset: {
    en: 'Failed to reset',
    ar: 'فشل إعادة التعيين',
    ku: 'ڕیسێتکردن سەرکەوتوو نەبوو',
  },
  passwordExists: {
    en: 'Password already exists, new one generated. Try again.',
    ar: 'كلمة المرور موجودة، تم إنشاء واحدة جديدة. حاول مرة أخرى.',
    ku: 'وشەی نهێنی پێشتر هەیە، نوێیەک دروستکرا. دووبارە هەوڵبدەوە.',
  },
  failedToCreatePassword: {
    en: 'Failed to create password',
    ar: 'فشل إنشاء كلمة المرور',
    ku: 'دروستکردنی وشەی نهێنی سەرکەوتوو نەبوو',
  },
  open: {
    en: 'Open',
    ar: 'فتح',
    ku: 'کردنەوە',
  },
  download: {
    en: 'Download',
    ar: 'تحميل',
    ku: 'داگرتن',
  },
  noImage: {
    en: 'No Image',
    ar: 'لا توجد صورة',
    ku: 'وێنە نییە',
  },
  addOrderForCustomer: {
    en: 'Add Order for Customer',
    ar: 'إضافة طلب لعميل',
    ku: 'زیادکردنی داواکاری بۆ کڕیار',
  },
  createOrderOnBehalf: {
    en: 'Create order on behalf of WhatsApp customer',
    ar: 'إنشاء طلب نيابة عن عميل الواتساب',
    ku: 'دروستکردنی داواکاری بە ناوی کڕیاری واتساپ',
  },
  findCustomer: {
    en: 'Find Customer',
    ar: 'البحث عن عميل',
    ku: 'گەڕان بە دوای کڕیار',
  },
  searchByWhatsApp: {
    en: 'Search by WhatsApp number',
    ar: 'البحث برقم الواتساب',
    ku: 'گەڕان بە ژمارەی واتساپ',
  },
  enterWhatsAppNumber: {
    en: 'Enter WhatsApp number...',
    ar: 'أدخل رقم الواتساب...',
    ku: 'ژمارەی واتساپ بنووسە...',
  },
  customerNotFound: {
    en: 'Customer not found with this number',
    ar: 'لم يتم العثور على عميل بهذا الرقم',
    ku: 'کڕیار نەدۆزرایەوە بەم ژمارەیە',
  },
  selectCustomerFirst: {
    en: 'Please search and select a customer first',
    ar: 'يرجى البحث واختيار عميل أولاً',
    ku: 'تکایە سەرەتا بگەڕێ و کڕیارێک هەڵبژێرە',
  },
  orderCreatedForCustomer: {
    en: 'Order created for customer!',
    ar: 'تم إنشاء الطلب للعميل!',
    ku: 'داواکاری بۆ کڕیار دروست کرا!',
  },
  enterOrderInfo: {
    en: 'Enter the order information',
    ar: 'أدخل معلومات الطلب',
    ku: 'زانیاری داواکاری بنووسە',
  },
  createOrder: {
    en: 'Create Order',
    ar: 'إنشاء الطلب',
    ku: 'دروستکردنی داواکاری',
  },
  creating: {
    en: 'Creating...',
    ar: 'جاري الإنشاء...',
    ku: 'دروستکردن...',
  },
  change: {
    en: 'Change',
    ar: 'تغيير',
    ku: 'گۆڕین',
  },
  fillAllFields: {
    en: 'Please fill all required fields',
    ar: 'يرجى ملء جميع الحقول المطلوبة',
    ku: 'تکایە هەموو خانەکان پڕ بکەوە',
  },
  howManyPcs: {
    en: 'How many pieces?',
    ar: 'كم قطعة؟',
    ku: 'چەند دانە?',
  },
  selectShippingMethod: {
    en: 'Please select a shipping method',
    ar: 'يرجى اختيار طريقة الشحن',
    ku: 'تکایە شێوازی ناردن هەڵبژێرە',
  },
  transferMoney: {
    en: 'Transfer',
    ar: 'تحويل',
    ku: 'گواستنەوە',
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved as Language) || 'en';
  });

  const isRTL = language === 'ar' || language === 'ku';

  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
    document.documentElement.classList.remove('lang-en', 'lang-ar', 'lang-ku');
    document.documentElement.classList.add(`lang-${language}`);
  }, [language, isRTL]);

  const t = (key: string): string => {
    return translations[key]?.[language] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
