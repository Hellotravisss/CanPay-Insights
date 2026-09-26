'use client';
import { useEffect, useRef, useState } from 'react';
import { recordCalcEvent, parseFsa, rememberFsa, rememberedFsa, type Neighbourhood } from '../lib/telemetry';
import type { CalculationMode as CalcMode } from '../types';

/**
 * "Where does your pay sit in your neighbourhood?" — the site's first
 * deliberately-given location field, built on the rule every other prompt
 * here learned the hard way: hand something real back FIRST.
 *
 * What the visitor gets: their income placed against the people who actually
 * file taxes in their own FSA (the first three characters of a postal code),
 * from the Canada Revenue Agency's tax-filer table. Nobody else on the web
 * answers "am I above or below my street's median" from the tax rolls.
 *
 * What the dataset gets: the FSA, which turns "Vancouver" into "Richmond
 * centre vs. Kerrisdale" — the unit real-estate and census reports use, a few
 * thousand households each.
 *
 * Two ways in, both opt-in, neither on by default (Quebec s.8.1):
 *   - type the three characters;
 *   - press the location button. The browser's position is rounded to two
 *     decimals (~1 km) HERE, on the device, mapped to the nearest FSA centroid
 *     HERE, and only those two things are sent. In rural FSAs (second
 *     character 0) it is rounded further, to one decimal, because a 1 km cell
 *     in a village is a house.
 *
 * Never a full postal code: six characters name fifteen households.
 * Never gated: the payoff is identical whichever way the FSA arrived, and
 * declining leaves the calculator exactly as it was.
 */

type IncomeTable = {
  year: number;
  brackets: (number | null)[];
  fsa: Record<string, { n: number; c: number[]; med: number | null }>;
};
type CentroidTable = { fsa: Record<string, [number, number]> };

let incomeCache: Promise<IncomeTable | null> | null = null;
let centroidCache: Promise<CentroidTable | null> | null = null;
function loadIncome(): Promise<IncomeTable | null> {
  incomeCache ??= fetch('/data/fsa-income.json').then((r) => (r.ok ? r.json() : null)).catch(() => null);
  return incomeCache;
}
function loadCentroids(): Promise<CentroidTable | null> {
  centroidCache ??= fetch('/data/fsa-centroids.json').then((r) => (r.ok ? r.json() : null)).catch(() => null);
  return centroidCache;
}

/**
 * Percentile of `income` among the FSA's tax filers, interpolating inside the
 * income class it falls in (CRA publishes counts per class, not a median).
 * The top class is open-ended, so an income above $250k reports "at least".
 */
export function placeInFsa(rec: { n: number; c: number[] }, brackets: (number | null)[], income: number) {
  let below = 0;
  let median: number | null = null;
  let pct: number | null = null;
  let cum = 0;
  const half = rec.n / 2;
  for (let i = 0; i < brackets.length; i++) {
    const lo = i === 0 ? 0 : (brackets[i - 1] as number);
    const hi = brackets[i];
    const count = rec.c[i] ?? 0;
    if (median === null && cum + count >= half && count > 0) {
      median = hi === null ? lo : lo + ((hi - lo) * (half - cum)) / count;
    }
    if (pct === null) {
      if (hi === null || income < hi) {
        const frac = hi === null ? 1 : Math.max(0, Math.min(1, (income - lo) / (hi - lo)));
        below = cum + count * frac;
        pct = rec.n > 0 ? Math.round((100 * below) / rec.n) : null;
      } else {
        cum += count;
      }
    } else {
      cum += count;
    }
  }
  return { pct, median: median === null ? null : Math.round(median / 100) * 100 };
}

/** Great-circle distance in km — good enough to pick the nearest of 1,600 centroids. */
function km(aLat: number, aLon: number, bLat: number, bLon: number): number {
  const r = Math.PI / 180;
  const x = (bLon - aLon) * r * Math.cos(((aLat + bLat) / 2) * r);
  const y = (bLat - aLat) * r;
  return Math.sqrt(x * x + y * y) * 6371;
}
export function nearestFsa(t: CentroidTable, lat: number, lon: number): { fsa: string; km: number } | null {
  let best: { fsa: string; km: number } | null = null;
  for (const [f, [cLat, cLon]] of Object.entries(t.fsa)) {
    const d = km(lat, lon, cLat, cLon);
    if (!best || d < best.km) best = { fsa: f, km: d };
  }
  // Beyond 30 km from every centroid the visitor is not in any FSA we know —
  // offshore, abroad, or a VPN exit. No FSA is better than a wrong one.
  return best && best.km <= 30 ? best : null;
}

const isRural = (fsa: string) => fsa[1] === '0';

const DICT: Record<string, Record<string, string>> = {
  en: {
    title: 'Where does your pay sit in your neighbourhood?',
    hint: 'First three characters of your postal code, or share your location.',
    placeholder: 'V6X',
    compare: 'Compare',
    useLocation: 'Use my location',
    locating: 'Locating…',
    consent:
      'Optional. Only the first three characters of a postal code are kept, and a shared location is rounded to about 1 km on your device before it is sent. Used for neighbourhood statistics we publish and license to others, such as researchers and real-estate or financial companies — always as counts for areas of thousands of households, never your own record.',
    privacy: 'Privacy policy',
    payoff: 'Among the {n} people who filed a {year} tax return in {fsa}, an income of {income} is higher than about {pct}%. The local median is around {med}.',
    payoffTop: 'Among the {n} people who filed a {year} tax return in {fsa}, an income of {income} is in the top {top}%. The local median is around {med}.',
    basis: 'Canada Revenue Agency tax-filer statistics, {year} tax year — the newest published. Total income of all filers, not just wages.',
    noData: 'The CRA publishes no figures for {fsa} — usually a business-only or very small area. Thank you all the same; it still helps map where pay is checked.',
    invalid: 'That is not a Canadian postal-code prefix (three characters, like V6X or M5V).',
    denied: 'Location not shared — you can type the first three characters of your postal code instead.',
    farAway: 'That position is outside any Canadian postal area we know, so no neighbourhood was recorded.',
    change: 'Change',
    thanks: 'Thanks — that helps.',
  },
  zh: {
    title: '你的工资在本区处于什么位置?',
    hint: '输入邮编前三位,或分享你的位置。',
    placeholder: 'V6X',
    compare: '对比',
    useLocation: '使用我的位置',
    locating: '定位中…',
    consent:
      '可选。只保留邮编的前三位;分享的位置会先在你的设备上四舍五入到约 1 公里再发送。用于我们发布并授权给研究机构、地产或金融公司等第三方的社区级统计 —— 始终是覆盖数千户区域的计数,绝不是你个人的记录。',
    privacy: '隐私政策',
    payoff: '在 {fsa} 报 {year} 年税的 {n} 人中,{income} 的收入高于约 {pct}%。本区中位数约 {med}。',
    payoffTop: '在 {fsa} 报 {year} 年税的 {n} 人中,{income} 的收入位于前 {top}%。本区中位数约 {med}。',
    basis: '加拿大税务局报税人统计,{year} 税务年度 —— 已发布的最新一期。口径是所有报税人的总收入,不只是工资。',
    noData: 'CRA 没有发布 {fsa} 的数据 —— 通常是纯商业区或人口极少的区域。仍然谢谢你,这有助于绘制大家在哪里算工资。',
    invalid: '这不是加拿大邮编前缀(三位,例如 V6X 或 M5V)。',
    denied: '未分享位置 —— 你可以改为输入邮编前三位。',
    farAway: '这个位置不在我们已知的任何加拿大邮政区内,所以没有记录社区。',
    change: '更改',
    thanks: '谢谢,这很有帮助。',
  },
  fr: {
    title: 'Où se situe votre salaire dans votre quartier ?',
    hint: 'Les trois premiers caractères de votre code postal, ou partagez votre position.',
    placeholder: 'H2X',
    compare: 'Comparer',
    useLocation: 'Utiliser ma position',
    locating: 'Localisation…',
    consent:
      'Facultatif. Seuls les trois premiers caractères du code postal sont conservés, et une position partagée est arrondie à environ 1 km sur votre appareil avant l’envoi. Sert à des statistiques de quartier que nous publions et concédons sous licence à des tiers, comme des chercheurs ou des entreprises immobilières ou financières — toujours sous forme de décomptes pour des zones de milliers de ménages, jamais votre propre fiche.',
    privacy: 'Politique de confidentialité',
    payoff: 'Parmi les {n} personnes ayant produit une déclaration {year} dans {fsa}, un revenu de {income} dépasse environ {pct} %. La médiane locale est d’environ {med}.',
    payoffTop: 'Parmi les {n} personnes ayant produit une déclaration {year} dans {fsa}, un revenu de {income} se situe dans le {top} % supérieur. La médiane locale est d’environ {med}.',
    basis: 'Statistiques des déclarants de l’Agence du revenu du Canada, année d’imposition {year} — les plus récentes publiées. Revenu total de tous les déclarants, pas seulement les salaires.',
    noData: 'L’ARC ne publie aucun chiffre pour {fsa} — généralement un secteur commercial ou très peu peuplé. Merci quand même ; cela aide à cartographier où l’on vérifie sa paie.',
    invalid: 'Ce n’est pas un préfixe de code postal canadien (trois caractères, comme H2X ou G1R).',
    denied: 'Position non partagée — vous pouvez saisir les trois premiers caractères de votre code postal.',
    farAway: 'Cette position est en dehors de toute zone postale canadienne connue ; aucun quartier n’a été enregistré.',
    change: 'Modifier',
    thanks: 'Merci, cela nous aide.',
  },
  es: {
    title: '¿Dónde se ubica su salario en su vecindario?',
    hint: 'Los tres primeros caracteres de su código postal, o comparta su ubicación.',
    placeholder: 'V6X',
    compare: 'Comparar',
    useLocation: 'Usar mi ubicación',
    locating: 'Ubicando…',
    consent:
      'Opcional. Solo se guardan los tres primeros caracteres del código postal, y una ubicación compartida se redondea a aproximadamente 1 km en su dispositivo antes de enviarse. Se usa para estadísticas por vecindario que publicamos y licenciamos a terceros, como investigadores o empresas inmobiliarias o financieras — siempre como recuentos de zonas de miles de hogares, nunca su registro individual.',
    privacy: 'Política de privacidad',
    payoff: 'Entre las {n} personas que declararon impuestos de {year} en {fsa}, un ingreso de {income} supera a cerca del {pct}%. La mediana local ronda {med}.',
    payoffTop: 'Entre las {n} personas que declararon impuestos de {year} en {fsa}, un ingreso de {income} está en el {top}% superior. La mediana local ronda {med}.',
    basis: 'Estadísticas de declarantes de la Agencia de Ingresos de Canadá, año fiscal {year} — las más recientes publicadas. Ingreso total de todos los declarantes, no solo salarios.',
    noData: 'La CRA no publica cifras para {fsa} — suele ser una zona solo comercial o muy pequeña. Gracias de todos modos; ayuda a mapear dónde se consulta el salario.',
    invalid: 'Eso no es un prefijo de código postal canadiense (tres caracteres, como V6X o M5V).',
    denied: 'Ubicación no compartida — puede escribir los tres primeros caracteres de su código postal.',
    farAway: 'Esa posición está fuera de cualquier zona postal canadiense conocida; no se registró ningún vecindario.',
    change: 'Cambiar',
    thanks: 'Gracias, nos ayuda.',
  },
  pa: {
    title: 'ਤੁਹਾਡੀ ਤਨਖਾਹ ਤੁਹਾਡੇ ਇਲਾਕੇ ਵਿੱਚ ਕਿੱਥੇ ਖੜ੍ਹੀ ਹੈ?',
    hint: 'ਆਪਣੇ ਪੋਸਟਲ ਕੋਡ ਦੇ ਪਹਿਲੇ ਤਿੰਨ ਅੱਖਰ, ਜਾਂ ਆਪਣੀ ਲੋਕੇਸ਼ਨ ਸਾਂਝੀ ਕਰੋ।',
    placeholder: 'V6X',
    compare: 'ਤੁਲਨਾ ਕਰੋ',
    useLocation: 'ਮੇਰੀ ਲੋਕੇਸ਼ਨ ਵਰਤੋ',
    locating: 'ਲੱਭ ਰਹੇ ਹਾਂ…',
    consent:
      'ਵਿਕਲਪਿਕ। ਪੋਸਟਲ ਕੋਡ ਦੇ ਸਿਰਫ਼ ਪਹਿਲੇ ਤਿੰਨ ਅੱਖਰ ਰੱਖੇ ਜਾਂਦੇ ਹਨ, ਅਤੇ ਸਾਂਝੀ ਕੀਤੀ ਲੋਕੇਸ਼ਨ ਭੇਜਣ ਤੋਂ ਪਹਿਲਾਂ ਤੁਹਾਡੇ ਡਿਵਾਈਸ ਉੱਤੇ ਲਗਭਗ 1 ਕਿ.ਮੀ. ਤੱਕ ਗੋਲ ਕੀਤੀ ਜਾਂਦੀ ਹੈ। ਇਹ ਇਲਾਕਾ-ਪੱਧਰ ਦੇ ਅੰਕੜਿਆਂ ਲਈ ਵਰਤੀ ਜਾਂਦੀ ਹੈ ਜੋ ਅਸੀਂ ਪ੍ਰਕਾਸ਼ਿਤ ਕਰਦੇ ਹਾਂ ਅਤੇ ਖੋਜਕਾਰਾਂ ਜਾਂ ਰੀਅਲ-ਅਸਟੇਟ/ਵਿੱਤੀ ਕੰਪਨੀਆਂ ਵਰਗੇ ਤੀਜੇ ਪੱਖਾਂ ਨੂੰ ਲਾਇਸੈਂਸ ਦਿੰਦੇ ਹਾਂ — ਹਮੇਸ਼ਾ ਹਜ਼ਾਰਾਂ ਘਰਾਂ ਵਾਲੇ ਇਲਾਕਿਆਂ ਦੀ ਗਿਣਤੀ ਵਜੋਂ, ਕਦੇ ਵੀ ਤੁਹਾਡਾ ਆਪਣਾ ਰਿਕਾਰਡ ਨਹੀਂ।',
    privacy: 'ਪਰਾਈਵੇਸੀ ਨੀਤੀ',
    payoff: '{fsa} ਵਿੱਚ {year} ਦੀ ਟੈਕਸ ਰਿਟਰਨ ਭਰਨ ਵਾਲੇ {n} ਲੋਕਾਂ ਵਿੱਚੋਂ, {income} ਦੀ ਆਮਦਨ ਲਗਭਗ {pct}% ਤੋਂ ਵੱਧ ਹੈ। ਸਥਾਨਕ ਮੱਧਮਾਨ ਲਗਭਗ {med} ਹੈ।',
    payoffTop: '{fsa} ਵਿੱਚ {year} ਦੀ ਟੈਕਸ ਰਿਟਰਨ ਭਰਨ ਵਾਲੇ {n} ਲੋਕਾਂ ਵਿੱਚੋਂ, {income} ਦੀ ਆਮਦਨ ਸਿਖਰਲੇ {top}% ਵਿੱਚ ਹੈ। ਸਥਾਨਕ ਮੱਧਮਾਨ ਲਗਭਗ {med} ਹੈ।',
    basis: 'ਕੈਨੇਡਾ ਰੈਵੇਨਿਊ ਏਜੰਸੀ ਦੇ ਟੈਕਸ-ਫਾਈਲਰ ਅੰਕੜੇ, {year} ਟੈਕਸ ਸਾਲ — ਸਭ ਤੋਂ ਨਵੇਂ ਪ੍ਰਕਾਸ਼ਿਤ। ਸਾਰੇ ਫਾਈਲਰਾਂ ਦੀ ਕੁੱਲ ਆਮਦਨ, ਸਿਰਫ਼ ਤਨਖਾਹ ਨਹੀਂ।',
    noData: 'CRA {fsa} ਲਈ ਕੋਈ ਅੰਕੜੇ ਨਹੀਂ ਛਾਪਦੀ — ਆਮ ਤੌਰ ’ਤੇ ਸਿਰਫ਼ ਕਾਰੋਬਾਰੀ ਜਾਂ ਬਹੁਤ ਛੋਟਾ ਇਲਾਕਾ। ਫਿਰ ਵੀ ਧੰਨਵਾਦ; ਇਸ ਨਾਲ ਪਤਾ ਲੱਗਦਾ ਹੈ ਕਿ ਤਨਖਾਹ ਕਿੱਥੇ ਦੇਖੀ ਜਾਂਦੀ ਹੈ।',
    invalid: 'ਇਹ ਕੈਨੇਡੀਅਨ ਪੋਸਟਲ-ਕੋਡ ਪ੍ਰੀਫਿਕਸ ਨਹੀਂ ਹੈ (ਤਿੰਨ ਅੱਖਰ, ਜਿਵੇਂ V6X ਜਾਂ M5V)।',
    denied: 'ਲੋਕੇਸ਼ਨ ਸਾਂਝੀ ਨਹੀਂ ਹੋਈ — ਤੁਸੀਂ ਆਪਣੇ ਪੋਸਟਲ ਕੋਡ ਦੇ ਪਹਿਲੇ ਤਿੰਨ ਅੱਖਰ ਲਿਖ ਸਕਦੇ ਹੋ।',
    farAway: 'ਇਹ ਥਾਂ ਕਿਸੇ ਵੀ ਜਾਣੇ-ਪਛਾਣੇ ਕੈਨੇਡੀਅਨ ਪੋਸਟਲ ਇਲਾਕੇ ਤੋਂ ਬਾਹਰ ਹੈ, ਇਸ ਲਈ ਕੋਈ ਇਲਾਕਾ ਦਰਜ ਨਹੀਂ ਹੋਇਆ।',
    change: 'ਬਦਲੋ',
    thanks: 'ਧੰਨਵਾਦ — ਇਸ ਨਾਲ ਮਦਦ ਮਿਲਦੀ ਹੈ।',
  },
  hi: {
    title: 'आपका वेतन आपके इलाके में कहाँ ठहरता है?',
    hint: 'अपने पोस्टल कोड के पहले तीन अक्षर, या अपनी लोकेशन साझा करें।',
    placeholder: 'V6X',
    compare: 'तुलना करें',
    useLocation: 'मेरी लोकेशन इस्तेमाल करें',
    locating: 'खोज रहे हैं…',
    consent:
      'वैकल्पिक। पोस्टल कोड के केवल पहले तीन अक्षर रखे जाते हैं, और साझा की गई लोकेशन भेजने से पहले आपके डिवाइस पर लगभग 1 किमी तक गोल कर दी जाती है। इसका उपयोग इलाका-स्तर के आँकड़ों के लिए होता है जिन्हें हम प्रकाशित करते हैं और शोधकर्ताओं या रियल-एस्टेट/वित्तीय कंपनियों जैसे तीसरे पक्षों को लाइसेंस देते हैं — हमेशा हज़ारों घरों वाले क्षेत्रों की गिनती के रूप में, कभी आपका अपना रिकॉर्ड नहीं।',
    privacy: 'गोपनीयता नीति',
    payoff: '{fsa} में {year} का टैक्स रिटर्न भरने वाले {n} लोगों में, {income} की आय लगभग {pct}% से अधिक है। स्थानीय माध्यिका लगभग {med} है।',
    payoffTop: '{fsa} में {year} का टैक्स रिटर्न भरने वाले {n} लोगों में, {income} की आय शीर्ष {top}% में है। स्थानीय माध्यिका लगभग {med} है।',
    basis: 'कनाडा रेवेन्यू एजेंसी के टैक्स-फाइलर आँकड़े, {year} कर वर्ष — प्रकाशित सबसे नए। सभी फाइलरों की कुल आय, केवल वेतन नहीं।',
    noData: 'CRA {fsa} के लिए कोई आँकड़े प्रकाशित नहीं करती — आमतौर पर केवल-व्यावसायिक या बहुत छोटा क्षेत्र। फिर भी धन्यवाद; इससे पता चलता है कि वेतन कहाँ जाँचा जाता है।',
    invalid: 'यह कनाडाई पोस्टल-कोड प्रीफ़िक्स नहीं है (तीन अक्षर, जैसे V6X या M5V)।',
    denied: 'लोकेशन साझा नहीं हुई — आप अपने पोस्टल कोड के पहले तीन अक्षर लिख सकते हैं।',
    farAway: 'यह स्थान किसी भी ज्ञात कनाडाई पोस्टल क्षेत्र से बाहर है, इसलिए कोई इलाका दर्ज नहीं हुआ।',
    change: 'बदलें',
    thanks: 'धन्यवाद — इससे मदद मिलती है।',
  },
  tl: {
    title: 'Saan nakatayo ang sahod mo sa inyong lugar?',
    hint: 'Unang tatlong karakter ng postal code mo, o ibahagi ang lokasyon mo.',
    placeholder: 'V6X',
    compare: 'Ihambing',
    useLocation: 'Gamitin ang lokasyon ko',
    locating: 'Hinahanap…',
    consent:
      'Opsyonal. Tanging ang unang tatlong karakter ng postal code ang itinatabi, at ang ibinahaging lokasyon ay ini-round sa humigit-kumulang 1 km sa device mo bago ipadala. Ginagamit para sa estadistika ng lugar na inilalathala namin at nililisensya sa iba, gaya ng mga mananaliksik o kumpanya ng real estate o pananalapi — palaging bilang bilangan para sa mga lugar na libu-libong sambahayan, hindi kailanman ang sarili mong rekord.',
    privacy: 'Patakaran sa privacy',
    payoff: 'Sa {n} taong nag-file ng {year} tax return sa {fsa}, ang kitang {income} ay mas mataas sa humigit-kumulang {pct}%. Ang lokal na median ay nasa {med}.',
    payoffTop: 'Sa {n} taong nag-file ng {year} tax return sa {fsa}, ang kitang {income} ay nasa top {top}%. Ang lokal na median ay nasa {med}.',
    basis: 'Estadistika ng mga tax filer ng Canada Revenue Agency, tax year {year} — ang pinakabagong nailathala. Kabuuang kita ng lahat ng filer, hindi lang sahod.',
    noData: 'Walang inilalathalang datos ang CRA para sa {fsa} — kadalasang pang-negosyo lang o napakaliit na lugar. Salamat pa rin; nakakatulong itong imapa kung saan tinitingnan ang sahod.',
    invalid: 'Hindi iyan prefix ng Canadian postal code (tatlong karakter, gaya ng V6X o M5V).',
    denied: 'Hindi naibahagi ang lokasyon — maaari mong i-type ang unang tatlong karakter ng postal code mo.',
    farAway: 'Nasa labas ang posisyong iyon ng anumang kilalang Canadian postal area, kaya walang lugar na naitala.',
    change: 'Baguhin',
    thanks: 'Salamat — malaking tulong ito.',
  },
  uk: {
    title: 'Де ваша зарплата стоїть у вашому районі?',
    hint: 'Перші три символи вашого поштового індексу або поділіться місцезнаходженням.',
    placeholder: 'V6X',
    compare: 'Порівняти',
    useLocation: 'Використати моє місцезнаходження',
    locating: 'Визначаємо…',
    consent:
      'Необов’язково. Зберігаються лише перші три символи поштового індексу, а надане місцезнаходження округлюється приблизно до 1 км на вашому пристрої перед надсиланням. Використовується для статистики за районами, яку ми публікуємо та ліцензуємо третім сторонам, як-от дослідникам чи компаніям з нерухомості або фінансів — завжди як підрахунки для територій із тисячами домогосподарств, ніколи як ваш власний запис.',
    privacy: 'Політика конфіденційності',
    payoff: 'Серед {n} людей, які подали податкову декларацію за {year} рік у {fsa}, дохід {income} вищий приблизно за {pct}%. Місцева медіана — близько {med}.',
    payoffTop: 'Серед {n} людей, які подали податкову декларацію за {year} рік у {fsa}, дохід {income} входить до верхніх {top}%. Місцева медіана — близько {med}.',
    basis: 'Статистика платників податків Канадського податкового агентства, податковий рік {year} — найновіша опублікована. Загальний дохід усіх платників, не лише зарплата.',
    noData: 'CRA не публікує дані для {fsa} — зазвичай це суто діловий або дуже малий район. Усе одно дякуємо; це допомагає побачити, де перевіряють зарплату.',
    invalid: 'Це не префікс канадського поштового індексу (три символи, як V6X або M5V).',
    denied: 'Місцезнаходження не надано — можете ввести перші три символи поштового індексу.',
    farAway: 'Ця позиція поза будь-якою відомою канадською поштовою зоною, тож район не записано.',
    change: 'Змінити',
    thanks: 'Дякуємо — це допомагає.',
  },
  ko: {
    title: '내 급여는 우리 동네에서 어느 위치일까요?',
    hint: '우편번호 앞 세 글자를 입력하거나 위치를 공유하세요.',
    placeholder: 'V6X',
    compare: '비교',
    useLocation: '내 위치 사용',
    locating: '위치 확인 중…',
    consent:
      '선택 사항입니다. 우편번호의 앞 세 글자만 보관되며, 공유된 위치는 전송 전에 기기에서 약 1km 단위로 반올림됩니다. 저희가 발표하고 연구자나 부동산·금융 회사 등 제3자에게 라이선스하는 동네 단위 통계에 사용됩니다 — 항상 수천 가구 규모 지역의 집계일 뿐, 귀하의 개인 기록은 결코 아닙니다.',
    privacy: '개인정보 처리방침',
    payoff: '{fsa}에서 {year}년 세금 신고를 한 {n}명 중 {income}의 소득은 약 {pct}%보다 높습니다. 지역 중앙값은 약 {med}입니다.',
    payoffTop: '{fsa}에서 {year}년 세금 신고를 한 {n}명 중 {income}의 소득은 상위 {top}%에 해당합니다. 지역 중앙값은 약 {med}입니다.',
    basis: '캐나다 국세청 세금 신고자 통계, {year} 과세연도 — 발표된 최신 자료. 급여만이 아닌 모든 신고자의 총소득 기준입니다.',
    noData: 'CRA는 {fsa}에 대한 수치를 발표하지 않습니다 — 보통 상업 전용이거나 매우 작은 지역입니다. 그래도 감사합니다. 급여를 확인하는 지역을 파악하는 데 도움이 됩니다.',
    invalid: '캐나다 우편번호 접두어가 아닙니다 (V6X, M5V처럼 세 글자).',
    denied: '위치가 공유되지 않았습니다 — 대신 우편번호 앞 세 글자를 입력할 수 있습니다.',
    farAway: '해당 위치는 알려진 캐나다 우편 구역 밖이어서 동네가 기록되지 않았습니다.',
    change: '변경',
    thanks: '감사합니다 — 큰 도움이 됩니다.',
  },
  vi: {
    title: 'Lương của bạn đứng ở đâu trong khu phố của bạn?',
    hint: 'Ba ký tự đầu của mã bưu điện, hoặc chia sẻ vị trí của bạn.',
    placeholder: 'V6X',
    compare: 'So sánh',
    useLocation: 'Dùng vị trí của tôi',
    locating: 'Đang định vị…',
    consent:
      'Không bắt buộc. Chỉ giữ ba ký tự đầu của mã bưu điện, và vị trí được chia sẻ sẽ được làm tròn khoảng 1 km ngay trên thiết bị của bạn trước khi gửi. Dùng cho thống kê theo khu phố mà chúng tôi công bố và cấp phép cho bên thứ ba như nhà nghiên cứu hoặc công ty bất động sản, tài chính — luôn là số đếm cho khu vực hàng nghìn hộ gia đình, không bao giờ là hồ sơ riêng của bạn.',
    privacy: 'Chính sách quyền riêng tư',
    payoff: 'Trong {n} người khai thuế năm {year} tại {fsa}, thu nhập {income} cao hơn khoảng {pct}%. Trung vị địa phương khoảng {med}.',
    payoffTop: 'Trong {n} người khai thuế năm {year} tại {fsa}, thu nhập {income} nằm trong top {top}%. Trung vị địa phương khoảng {med}.',
    basis: 'Thống kê người khai thuế của Cơ quan Thuế Canada, năm thuế {year} — bản mới nhất được công bố. Tổng thu nhập của mọi người khai, không chỉ tiền lương.',
    noData: 'CRA không công bố số liệu cho {fsa} — thường là khu thương mại hoặc rất nhỏ. Dù vậy vẫn cảm ơn bạn; điều này giúp lập bản đồ nơi mọi người kiểm tra lương.',
    invalid: 'Đó không phải tiền tố mã bưu điện Canada (ba ký tự, như V6X hoặc M5V).',
    denied: 'Chưa chia sẻ vị trí — bạn có thể nhập ba ký tự đầu của mã bưu điện.',
    farAway: 'Vị trí đó nằm ngoài mọi khu bưu điện Canada đã biết, nên không ghi nhận khu phố nào.',
    change: 'Thay đổi',
    thanks: 'Cảm ơn — điều này rất hữu ích.',
  },
};

const money = (n: number) => '$' + Math.round(n).toLocaleString('en-CA');
const fill = (s: string, vars: Record<string, string | number>) =>
  Object.entries(vars).reduce((acc, [k, v]) => acc.split(`{${k}}`).join(String(v)), s);

export default function NeighbourhoodPrompt({
  mode,
  province,
  annualIncome,
  lang,
}: {
  mode: string;
  province: string;
  annualIncome: number;
  lang: string;
}) {
  const t = DICT[lang] ?? DICT.en;
  const [fsa, setFsa] = useState<string | null>(null);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [payoff, setPayoff] = useState<{ line: string; basis: string } | null>(null);
  const [editing, setEditing] = useState(false);
  const geoSupported = useRef(false);

  // A remembered FSA shows its payoff immediately — the reason to come back.
  useEffect(() => {
    const r = rememberedFsa();
    if (r) setFsa(r);
    geoSupported.current = typeof navigator !== 'undefined' && 'geolocation' in navigator && window.isSecureContext;
  }, []);

  useEffect(() => {
    if (!fsa || !annualIncome) { setPayoff(null); return; }
    let live = true;
    loadIncome().then((tab) => {
      if (!live) return;
      const rec = tab?.fsa[fsa];
      if (!tab || !rec) { setPayoff({ line: fill(t.noData, { fsa }), basis: '' }); return; }
      const { pct, median } = placeInFsa(rec, tab.brackets, annualIncome);
      const vars = { n: rec.n.toLocaleString('en-CA'), year: tab.year, fsa, income: money(annualIncome), pct: pct ?? 0, top: Math.max(1, 100 - (pct ?? 0)), med: median === null ? '—' : money(median) };
      const line = fill((pct ?? 0) >= 90 ? t.payoffTop : t.payoff, vars);
      setPayoff({ line, basis: fill(t.basis, { year: tab.year }) });
    });
    return () => { live = false; };
  }, [fsa, annualIncome, t]);

  if (!annualIncome || annualIncome <= 0) return null;

  const record = (hood: Neighbourhood) => {
    recordCalcEvent({ mode: mode as CalcMode, province, annualIncome, lang, neighbourhood: hood });
  };

  const submitTyped = () => {
    const v = parseFsa(text);
    if (!v) { setNote(t.invalid); return; }
    setNote(null);
    rememberFsa(v);
    setFsa(v);
    setEditing(false);
    record({ fsa: v, source: 'typed' });
  };

  const useDevice = () => {
    if (!geoSupported.current) { setNote(t.denied); return; }
    setBusy(true);
    setNote(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        // Two decimals HERE. The precise reading is discarded on this line.
        let lat2 = Math.round(pos.coords.latitude * 100) / 100;
        let lon2 = Math.round(pos.coords.longitude * 100) / 100;
        const cent = await loadCentroids();
        const near = cent ? nearestFsa(cent, lat2, lon2) : null;
        setBusy(false);
        if (!near) {
          // Outside every Canadian FSA — nothing worth keeping.
          setNote(t.farAway);
          return;
        }
        if (isRural(near.fsa)) {
          // A 1 km cell in the countryside is a household; one decimal (~11 km) is the rural grain.
          lat2 = Math.round(lat2 * 10) / 10;
          lon2 = Math.round(lon2 * 10) / 10;
        }
        rememberFsa(near.fsa);
        setFsa(near.fsa);
        setEditing(false);
        record({ fsa: near.fsa, source: 'device', lat2, lon2 });
      },
      () => { setBusy(false); setNote(t.denied); },
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 600_000 }
    );
  };

  const pill =
    'inline-flex min-h-10 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-700 disabled:opacity-50';

  return (
    <div className="rounded-xl border border-slate-200 bg-white px-5 py-4">
      {fsa && !editing ? (
        <>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="text-sm font-medium text-slate-700">
              <span aria-hidden="true">📍</span> {fsa}
            </p>
            <button type="button" onClick={() => { setEditing(true); setText(''); }} className="text-xs text-slate-500 hover:text-slate-600">
              {t.change}
            </button>
          </div>
          {payoff && (
            <div className="mt-3 rounded-lg bg-slate-50 px-4 py-3" aria-live="polite">
              <p className="text-sm leading-6 text-slate-800">{payoff.line}</p>
              {payoff.basis && <p className="mt-1 text-xs leading-5 text-slate-500">{payoff.basis}</p>}
            </div>
          )}
        </>
      ) : (
        <>
          <p className="text-sm font-medium text-slate-700">
            <span aria-hidden="true">📍</span> {t.title}
          </p>
          <p className="mt-0.5 text-xs text-slate-500">{t.hint}</p>
          <form
            className="mt-3 flex flex-wrap items-center gap-2"
            onSubmit={(e) => { e.preventDefault(); submitTyped(); }}
          >
            <label htmlFor="fsa-input" className="sr-only">{t.hint}</label>
            <input
              id="fsa-input"
              value={text}
              onChange={(e) => setText(e.target.value.toUpperCase().slice(0, 3))}
              placeholder={t.placeholder}
              maxLength={3}
              autoComplete="postal-code"
              inputMode="text"
              className="w-24 rounded-full border border-slate-200 px-4 py-2 text-center text-sm font-semibold uppercase tracking-widest text-slate-800 focus:border-red-400 focus:outline-none"
            />
            <button type="submit" className={pill} disabled={busy || text.length < 3}>{t.compare}</button>
            <button type="button" onClick={useDevice} className={pill} disabled={busy}>
              <span aria-hidden="true">🧭</span> {busy ? t.locating : t.useLocation}
            </button>
          </form>
          {note && <p className="mt-2 text-xs text-red-600" role="status">{note}</p>}
          <p className="mt-3 text-[11px] leading-4 text-slate-500">
            {t.consent}{' '}
            <a href="/privacy#location" className="underline decoration-slate-300 underline-offset-2 hover:text-slate-600">{t.privacy}</a>
          </p>
        </>
      )}
    </div>
  );
}
