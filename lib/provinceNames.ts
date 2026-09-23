// Province and territory names in the widget's languages, in the order of
// PROVINCE_SEO_CONFIGS slugs. English is the fallback for any language
// missing here. Telemetry keeps using the English name.
const SLUGS = [
  'ontario', 'bc', 'alberta', 'quebec', 'manitoba', 'saskatchewan', 'nova-scotia',
  'new-brunswick', 'newfoundland', 'pei', 'yukon', 'northwest-territories', 'nunavut',
] as const;

const NAMES: Record<string, string[]> = {
  fr: ['Ontario', 'Colombie-Britannique', 'Alberta', 'Québec', 'Manitoba', 'Saskatchewan', 'Nouvelle-Écosse',
    'Nouveau-Brunswick', 'Terre-Neuve-et-Labrador', 'Île-du-Prince-Édouard', 'Yukon', 'Territoires du Nord-Ouest', 'Nunavut'],
  zh: ['安大略省', '不列颠哥伦比亚省（BC 省）', '阿尔伯塔省', '魁北克省', '曼尼托巴省', '萨斯喀彻温省', '新斯科舍省',
    '新不伦瑞克省', '纽芬兰与拉布拉多省', '爱德华王子岛省', '育空地区', '西北地区', '努纳武特地区'],
  es: ['Ontario', 'Columbia Británica', 'Alberta', 'Quebec', 'Manitoba', 'Saskatchewan', 'Nueva Escocia',
    'Nuevo Brunswick', 'Terranova y Labrador', 'Isla del Príncipe Eduardo', 'Yukón', 'Territorios del Noroeste', 'Nunavut'],
  ko: ['온타리오', '브리티시컬럼비아', '앨버타', '퀘벡', '매니토바', '서스캐처원', '노바스코샤',
    '뉴브런즈윅', '뉴펀들랜드 래브라도', '프린스에드워드아일랜드', '유콘', '노스웨스트 준주', '누나부트'],
  vi: ['Ontario', 'British Columbia', 'Alberta', 'Quebec', 'Manitoba', 'Saskatchewan', 'Nova Scotia',
    'New Brunswick', 'Newfoundland và Labrador', 'Đảo Hoàng tử Edward', 'Yukon', 'Lãnh thổ Tây Bắc', 'Nunavut'],
  uk: ['Онтаріо', 'Британська Колумбія', 'Альберта', 'Квебек', 'Манітоба', 'Саскачеван', 'Нова Шотландія',
    'Нью-Брансвік', 'Ньюфаундленд і Лабрадор', 'Острів Принца Едварда', 'Юкон', 'Північно-Західні території', 'Нунавут'],
  pa: ['ਓਨਟਾਰੀਓ', 'ਬ੍ਰਿਟਿਸ਼ ਕੋਲੰਬੀਆ', 'ਅਲਬਰਟਾ', 'ਕਿਊਬੈਕ', 'ਮੈਨੀਟੋਬਾ', 'ਸਸਕੈਚਵਨ', 'ਨੋਵਾ ਸਕੋਸ਼ੀਆ',
    'ਨਿਊ ਬਰੰਜ਼ਵਿਕ', 'ਨਿਊਫਾਊਂਡਲੈਂਡ ਅਤੇ ਲੈਬਰਾਡੋਰ', 'ਪ੍ਰਿੰਸ ਐਡਵਰਡ ਆਈਲੈਂਡ', 'ਯੂਕੋਨ', 'ਨਾਰਥਵੈਸਟ ਟੈਰੀਟਰੀਜ਼', 'ਨੂਨਾਵੁਤ'],
  hi: ['ओंटारियो', 'ब्रिटिश कोलंबिया', 'अल्बर्टा', 'क्यूबेक', 'मैनिटोबा', 'सस्केचेवान', 'नोवा स्कोशिया',
    'न्यू ब्रंसविक', 'न्यूफ़ाउंडलैंड और लैब्राडोर', 'प्रिंस एडवर्ड आइलैंड', 'युकॉन', 'नॉर्थवेस्ट टेरिटरीज़', 'नुनावुत'],
};

export function provinceLabel(slug: string, lang: string, english: string): string {
  const i = (SLUGS as readonly string[]).indexOf(slug);
  return (i >= 0 && NAMES[lang]?.[i]) || english;
}
