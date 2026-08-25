'use client';
import { ThinkingOrb } from 'thinking-orbs';
import { useMemo, useState } from 'react';
import { recordCalcEvent, type ProductInterest } from '../lib/telemetry';
import { OFFER_LIMITS } from '../lib/offerReport';
import { Province, PayFrequency, type CalculationMode as CalcMode } from '../types';
import { calculateFromAnnualSalary } from '../utils/taxEngine';

/**
 * Paid products under the result. Both are REAL (Stripe Checkout): the
 * Province Move Report and the Offer Comparison. The RRSP door was
 * retired — the free deep report already computes the RRSP optimum, and
 * charging for what is given away two scrolls up is the wrong kind of money.
 *
 * Design rule for this block: show a NUMBER, not a paragraph. The relocation
 * card computes the take-home gap for the chosen province live, in the
 * browser, with the same engine as the calculator — the report then sells
 * what the free number cannot show (the Dec 31 rule, the deduction, the tax
 * at the till).
 *
 * The wall is deliberately NOT on the result. Take-home pay stays free.
 */

const DICT: Record<string, Record<string, string>> = {
  en: {
    kicker: 'Going further',
    relocation: 'Province move report',
    relocationLine: 'Same salary, another province — what actually changes.',
    moveTo: 'Moving to',
    pick: 'Pick a province to see the gap',
    perYear: 'a year',
    chips: 'Dec 31 rule · Moving deduction · Sales tax · Printable',
    buy: 'Full report — $9',
    buying: 'Opening secure checkout…',
    offer: 'Offer comparison',
    offerLine: 'Two offers, after tax, with the match and vacation priced in.',
    offerChips: 'Total comp · RRSP match · Questions for HR',
    price9: '$9',
    once: 'one-time',
    soon: 'Coming soon — want to hear when it launches?',
    email: 'Email',
    notify: 'Notify me',
    thanks: 'Got it — one email when it ships.',
    offerCta: 'Compare my offers — $9',
    offerA: 'Offer A (this one)',
    offerB: 'Offer B',
    salary: 'Salary',
    bonusL: 'Bonus',
    matchL: 'RRSP match (% of salary)',
    vacL: 'Vacation days / year',
    provinceL: 'Province',
    offerStart: 'Set up the comparison →',
    needProvince: 'Pick a province for both offers.',
    badSalary: `salary must be between $1,000 and $5,000,000.`,
    badBonus: 'bonus looks too large.',
    badMatch: 'RRSP match is a % of salary — 20% is the maximum here.',
    badVacation: 'vacation is in DAYS per year — 60 is the maximum here.',
    identical: 'Both offers are identical — change something to compare them.',
    secure: 'Paid through Stripe · link works forever',
  },
  zh: {
    kicker: '更进一步',
    relocation: '省际搬迁报告',
    relocationLine: '同样的工资,换个省 —— 到底什么会变。',
    moveTo: '搬去',
    pick: '选一个省,看差多少',
    perYear: '每年',
    chips: '12 月 31 日规则 · 搬家费抵扣 · 消费税 · 可打印',
    buy: '完整报告 —— $9',
    buying: '正在打开安全支付页…',
    offer: 'Offer 对比',
    offerLine: '两份 offer 税后并排,配比和年假都折成钱。',
    offerChips: '总薪酬 · RRSP 配比 · 该问 HR 的问题',
    price9: '$9',
    once: '一次性',
    soon: '即将上线 —— 上线时通知你?',
    email: '邮箱',
    notify: '通知我',
    thanks: '收到,上线时发一封邮件。',
    offerCta: '对比我的两份 offer —— $9',
    offerA: 'Offer A(当前这份)',
    offerB: 'Offer B',
    salary: '年薪',
    bonusL: '奖金',
    matchL: 'RRSP 配比(占年薪 %)',
    vacL: '年假天数 / 年',
    provinceL: '省份',
    offerStart: '填写两份 offer →',
    needProvince: '两份 offer 都要选省份。',
    badSalary: '年薪需在 $1,000 到 $5,000,000 之间。',
    badBonus: '奖金数额过大。',
    badMatch: 'RRSP 配比按占年薪的百分比填 —— 这里最高 20%。',
    badVacation: '年假按「天数」填 —— 这里最高 60 天。',
    identical: '两份 offer 完全相同 —— 改一处再对比。',
    secure: '通过 Stripe 付款 · 链接永久有效',
  },
  fr: {
    kicker: 'Aller plus loin',
    relocation: 'Rapport de déménagement',
    relocationLine: 'Même salaire, autre province — ce qui change vraiment.',
    moveTo: 'Déménager vers',
    pick: 'Choisissez une province pour voir l’écart',
    perYear: 'par an',
    chips: 'Règle du 31 déc. · Déduction déménagement · Taxes de vente · Imprimable',
    buy: 'Rapport complet — 9 $',
    buying: 'Ouverture du paiement sécurisé…',
    offer: 'Comparaison d’offres',
    offerLine: 'Deux offres, après impôt, cotisation et vacances incluses.',
    offerChips: 'Rémunération totale · REER · Questions aux RH',
    price9: '9 $',
    once: 'paiement unique',
    soon: 'Bientôt — voulez-vous être averti ?',
    email: 'Courriel',
    notify: 'Prévenez-moi',
    thanks: 'Noté — un seul courriel au lancement.',
    offerCta: 'Comparer mes offres — 9 $',
    offerA: 'Offre A (celle-ci)',
    offerB: 'Offre B',
    salary: 'Salaire',
    bonusL: 'Prime',
    matchL: 'REER (% du salaire)',
    vacL: 'Jours de vacances / an',
    provinceL: 'Province',
    offerStart: 'Saisir les deux offres →',
    needProvince: 'Choisissez une province pour les deux offres.',
    badSalary: 'le salaire doit être entre 1 000 $ et 5 000 000 $.',
    badBonus: 'la prime semble trop élevée.',
    badMatch: 'la cotisation REER est un % du salaire — 20 % au maximum ici.',
    badVacation: 'les vacances se comptent en JOURS par an — 60 au maximum ici.',
    identical: 'Les deux offres sont identiques — modifiez quelque chose.',
    secure: 'Paiement via Stripe · lien permanent',
  },
  es: {
    kicker: 'Ir más lejos',
    relocation: 'Informe de mudanza de provincia',
    relocationLine: 'El mismo salario, otra provincia: qué cambia realmente.',
    moveTo: 'Mudarse a',
    pick: 'Elija una provincia para ver la diferencia',
    perYear: 'al año',
    chips: 'Regla del 31 de dic. · Deducción por mudanza · Impuesto a las ventas · Imprimible',
    buy: 'Informe completo — $9',
    buying: 'Abriendo el pago seguro…',
    offer: 'Comparación de ofertas',
    offerLine: 'Dos ofertas, después de impuestos, con el aporte y las vacaciones valorados.',
    offerChips: 'Compensación total · Aporte RRSP · Preguntas para RR. HH.',
    price9: '$9',
    once: 'pago único',
    soon: 'Próximamente: ¿quiere que le avisemos?',
    email: 'Correo',
    notify: 'Avisarme',
    thanks: 'Listo: un correo cuando esté disponible.',
    offerCta: 'Comparar mis ofertas — $9',
    offerA: 'Oferta A (esta)',
    offerB: 'Oferta B',
    salary: 'Salario',
    bonusL: 'Bono',
    matchL: 'Aporte RRSP (% del salario)',
    vacL: 'Días de vacaciones / año',
    provinceL: 'Provincia',
    offerStart: 'Configurar la comparación →',
    needProvince: 'Elija una provincia para ambas ofertas.',
    badSalary: 'el salario debe estar entre $1,000 y $5,000,000.',
    badBonus: 'el bono parece demasiado alto.',
    badMatch: 'el aporte RRSP es un % del salario: aquí el máximo es 20 %.',
    badVacation: 'las vacaciones se cuentan en DÍAS por año: aquí el máximo es 60.',
    identical: 'Las dos ofertas son idénticas: cambie algo para compararlas.',
    secure: 'Pago con Stripe · el enlace funciona siempre',
  },
  pa: {
    kicker: 'ਹੋਰ ਅੱਗੇ',
    relocation: 'ਸੂਬਾ ਬਦਲਣ ਦੀ ਰਿਪੋਰਟ',
    relocationLine: 'ਓਹੀ ਤਨਖਾਹ, ਵੱਖਰਾ ਸੂਬਾ — ਅਸਲ ਵਿੱਚ ਕੀ ਬਦਲਦਾ ਹੈ।',
    moveTo: 'ਇੱਥੇ ਜਾਣਾ',
    pick: 'ਫ਼ਰਕ ਵੇਖਣ ਲਈ ਸੂਬਾ ਚੁਣੋ',
    perYear: 'ਪ੍ਰਤੀ ਸਾਲ',
    chips: '31 ਦਸੰਬਰ ਨਿਯਮ · ਸ਼ਿਫ਼ਟਿੰਗ ਕਟੌਤੀ · ਸੇਲਜ਼ ਟੈਕਸ · ਪ੍ਰਿੰਟ ਯੋਗ',
    buy: 'ਪੂਰੀ ਰਿਪੋਰਟ — $9',
    buying: 'ਸੁਰੱਖਿਅਤ ਭੁਗਤਾਨ ਖੁੱਲ੍ਹ ਰਿਹਾ ਹੈ…',
    offer: 'ਆਫ਼ਰ ਦੀ ਤੁਲਨਾ',
    offerLine: 'ਦੋ ਆਫ਼ਰ, ਟੈਕਸ ਤੋਂ ਬਾਅਦ, RRSP ਯੋਗਦਾਨ ਤੇ ਛੁੱਟੀਆਂ ਸਮੇਤ।',
    offerChips: 'ਕੁੱਲ ਤਨਖਾਹ · RRSP ਯੋਗਦਾਨ · HR ਲਈ ਸਵਾਲ',
    price9: '$9',
    once: 'ਇੱਕ ਵਾਰ',
    soon: 'ਜਲਦੀ ਆ ਰਿਹਾ ਹੈ — ਦੱਸੀਏ?',
    email: 'ਈਮੇਲ',
    notify: 'ਮੈਨੂੰ ਦੱਸੋ',
    thanks: 'ਠੀਕ ਹੈ — ਸ਼ੁਰੂ ਹੋਣ ਤੇ ਇੱਕ ਈਮੇਲ।',
    offerCta: 'ਮੇਰੇ ਆਫ਼ਰਾਂ ਦੀ ਤੁਲਨਾ — $9',
    offerA: 'ਆਫ਼ਰ A (ਇਹ ਵਾਲਾ)',
    offerB: 'ਆਫ਼ਰ B',
    salary: 'ਤਨਖਾਹ',
    bonusL: 'ਬੋਨਸ',
    matchL: 'RRSP ਯੋਗਦਾਨ (ਤਨਖਾਹ ਦਾ %)',
    vacL: 'ਛੁੱਟੀ ਦੇ ਦਿਨ / ਸਾਲ',
    provinceL: 'ਸੂਬਾ',
    offerStart: 'ਤੁਲਨਾ ਸ਼ੁਰੂ ਕਰੋ →',
    needProvince: 'ਦੋਵਾਂ ਆਫ਼ਰਾਂ ਲਈ ਸੂਬਾ ਚੁਣੋ।',
    badSalary: 'ਤਨਖਾਹ $1,000 ਤੋਂ $5,000,000 ਵਿਚਕਾਰ ਹੋਣੀ ਚਾਹੀਦੀ ਹੈ।',
    badBonus: 'ਬੋਨਸ ਬਹੁਤ ਵੱਡਾ ਲੱਗਦਾ ਹੈ।',
    badMatch: 'RRSP ਯੋਗਦਾਨ ਤਨਖਾਹ ਦਾ % ਹੈ — ਇੱਥੇ ਵੱਧ ਤੋਂ ਵੱਧ 20% ਹੈ।',
    badVacation: 'ਛੁੱਟੀਆਂ ਪ੍ਰਤੀ ਸਾਲ ਦਿਨਾਂ ਵਿੱਚ — ਇੱਥੇ ਵੱਧ ਤੋਂ ਵੱਧ 60 ਹੈ।',
    identical: 'ਦੋਵੇਂ ਆਫ਼ਰ ਇੱਕੋ ਜਿਹੇ ਹਨ — ਤੁਲਨਾ ਲਈ ਕੁਝ ਬਦਲੋ।',
    secure: 'Stripe ਰਾਹੀਂ ਭੁਗਤਾਨ · ਲਿੰਕ ਹਮੇਸ਼ਾ ਚੱਲਦਾ ਹੈ',
  },
  hi: {
    kicker: 'और आगे',
    relocation: 'प्रांत बदलने की रिपोर्ट',
    relocationLine: 'वही वेतन, दूसरा प्रांत — असल में क्या बदलता है।',
    moveTo: 'यहाँ जाना',
    pick: 'अंतर देखने के लिए प्रांत चुनें',
    perYear: 'प्रति वर्ष',
    chips: '31 दिसंबर नियम · स्थानांतरण कटौती · बिक्री कर · प्रिंट योग्य',
    buy: 'पूरी रिपोर्ट — $9',
    buying: 'सुरक्षित भुगतान खुल रहा है…',
    offer: 'ऑफ़र तुलना',
    offerLine: 'दो ऑफ़र, कर के बाद, RRSP योगदान और छुट्टियों सहित।',
    offerChips: 'कुल वेतन · RRSP योगदान · HR से पूछने के सवाल',
    price9: '$9',
    once: 'एक बार',
    soon: 'जल्द आ रहा है — सूचित करें?',
    email: 'ईमेल',
    notify: 'मुझे बताएं',
    thanks: 'ठीक है — लॉन्च पर एक ईमेल।',
    offerCta: 'मेरे ऑफ़र की तुलना करें — $9',
    offerA: 'ऑफ़र A (यही वाला)',
    offerB: 'ऑफ़र B',
    salary: 'वेतन',
    bonusL: 'बोनस',
    matchL: 'RRSP योगदान (वेतन का %)',
    vacL: 'छुट्टी के दिन / वर्ष',
    provinceL: 'प्रांत',
    offerStart: 'तुलना सेट करें →',
    needProvince: 'दोनों ऑफ़र के लिए प्रांत चुनें।',
    badSalary: 'वेतन $1,000 और $5,000,000 के बीच होना चाहिए।',
    badBonus: 'बोनस बहुत बड़ा लग रहा है।',
    badMatch: 'RRSP योगदान वेतन का % है — यहाँ अधिकतम 20% है।',
    badVacation: 'छुट्टियाँ प्रति वर्ष दिनों में — यहाँ अधिकतम 60 है।',
    identical: 'दोनों ऑफ़र एक जैसे हैं — तुलना के लिए कुछ बदलें।',
    secure: 'Stripe से भुगतान · लिंक हमेशा काम करता है',
  },
  tl: {
    kicker: 'Higit pa',
    relocation: 'Ulat sa paglipat ng probinsya',
    relocationLine: 'Parehong sahod, ibang probinsya — ano talaga ang nagbabago.',
    moveTo: 'Lilipat sa',
    pick: 'Pumili ng probinsya para makita ang pagkakaiba',
    perYear: 'kada taon',
    chips: 'Panuntunang Dis. 31 · Bawas sa paglipat · Sales tax · Naipi-print',
    buy: 'Buong ulat — $9',
    buying: 'Binubuksan ang ligtas na bayad…',
    offer: 'Paghahambing ng alok',
    offerLine: 'Dalawang alok, matapos ang buwis, kasama ang RRSP match at bakasyon.',
    offerChips: 'Kabuuang sahod · RRSP match · Itanong sa HR',
    price9: '$9',
    once: 'isang beses',
    soon: 'Malapit na — gusto mong maabisuhan?',
    email: 'Email',
    notify: 'Abisuhan ako',
    thanks: 'Salamat — isang email kapag handa na.',
    offerCta: 'Ihambing ang aking mga alok — $9',
    offerA: 'Alok A (ito)',
    offerB: 'Alok B',
    salary: 'Sahod',
    bonusL: 'Bonus',
    matchL: 'RRSP match (% ng sahod)',
    vacL: 'Araw ng bakasyon / taon',
    provinceL: 'Probinsya',
    offerStart: 'Ihanda ang paghahambing →',
    needProvince: 'Pumili ng probinsya para sa dalawang alok.',
    badSalary: 'ang sahod ay dapat nasa $1,000 hanggang $5,000,000.',
    badBonus: 'masyadong malaki ang bonus.',
    badMatch: 'ang RRSP match ay % ng sahod — 20% ang maximum dito.',
    badVacation: 'ang bakasyon ay sa ARAW kada taon — 60 ang maximum dito.',
    identical: 'Magkapareho ang dalawang alok — palitan ang isang bagay.',
    secure: 'Bayad sa Stripe · gumagana ang link magpakailanman',
  },
  uk: {
    kicker: 'Далі',
    relocation: 'Звіт про переїзд до іншої провінції',
    relocationLine: 'Та сама зарплата, інша провінція — що насправді змінюється.',
    moveTo: 'Переїзд до',
    pick: 'Оберіть провінцію, щоб побачити різницю',
    perYear: 'на рік',
    chips: 'Правило 31 грудня · Відрахування за переїзд · Податок з продажу · Для друку',
    buy: 'Повний звіт — $9',
    buying: 'Відкриваємо захищену оплату…',
    offer: 'Порівняння пропозицій',
    offerLine: 'Дві пропозиції після податків, з внеском RRSP і відпусткою.',
    offerChips: 'Загальна винагорода · Внесок RRSP · Питання до HR',
    price9: '$9',
    once: 'разово',
    soon: 'Незабаром — повідомити вас?',
    email: 'Email',
    notify: 'Повідомити мене',
    thanks: 'Готово — один лист після запуску.',
    offerCta: 'Порівняти мої пропозиції — $9',
    offerA: 'Пропозиція A (ця)',
    offerB: 'Пропозиція B',
    salary: 'Зарплата',
    bonusL: 'Бонус',
    matchL: 'Внесок RRSP (% від зарплати)',
    vacL: 'Днів відпустки / рік',
    provinceL: 'Провінція',
    offerStart: 'Налаштувати порівняння →',
    needProvince: 'Оберіть провінцію для обох пропозицій.',
    badSalary: 'зарплата має бути від $1,000 до $5,000,000.',
    badBonus: 'бонус виглядає завеликим.',
    badMatch: 'внесок RRSP — це % від зарплати; тут максимум 20%.',
    badVacation: 'відпустка рахується у ДНЯХ на рік; тут максимум 60.',
    identical: 'Обидві пропозиції однакові — змініть щось для порівняння.',
    secure: 'Оплата через Stripe · посилання діє завжди',
  },
  ko: {
    kicker: '더 나아가기',
    relocation: '주 이동 리포트',
    relocationLine: '같은 연봉, 다른 주 — 실제로 무엇이 달라지는가.',
    moveTo: '이주할 주',
    pick: '차이를 보려면 주를 선택하세요',
    perYear: '연간',
    chips: '12월 31일 규정 · 이사 비용 공제 · 판매세 · 인쇄 가능',
    buy: '전체 리포트 — $9',
    buying: '보안 결제를 여는 중…',
    offer: '오퍼 비교',
    offerLine: '두 오퍼를 세후로, RRSP 매칭과 휴가까지 금액으로 환산.',
    offerChips: '총보상 · RRSP 매칭 · HR에 물어볼 질문',
    price9: '$9',
    once: '1회 결제',
    soon: '곧 출시 — 알려드릴까요?',
    email: '이메일',
    notify: '알려주세요',
    thanks: '확인했습니다 — 출시되면 메일 한 통 보내드립니다.',
    offerCta: '내 오퍼 비교하기 — $9',
    offerA: '오퍼 A (현재)',
    offerB: '오퍼 B',
    salary: '연봉',
    bonusL: '보너스',
    matchL: 'RRSP 매칭 (연봉 대비 %)',
    vacL: '연간 휴가 일수',
    provinceL: '주',
    offerStart: '비교 설정하기 →',
    needProvince: '두 오퍼 모두 주를 선택하세요.',
    badSalary: '연봉은 $1,000에서 $5,000,000 사이여야 합니다.',
    badBonus: '보너스가 너무 큽니다.',
    badMatch: 'RRSP 매칭은 연봉 대비 %입니다 — 여기서는 최대 20%입니다.',
    badVacation: '휴가는 연간 일수로 입력합니다 — 여기서는 최대 60일입니다.',
    identical: '두 오퍼가 동일합니다 — 비교하려면 하나를 바꾸세요.',
    secure: 'Stripe 결제 · 링크는 영구적으로 유효',
  },
  vi: {
    kicker: 'Đi xa hơn',
    relocation: 'Báo cáo chuyển tỉnh bang',
    relocationLine: 'Cùng mức lương, tỉnh bang khác — điều gì thực sự thay đổi.',
    moveTo: 'Chuyển đến',
    pick: 'Chọn một tỉnh bang để xem chênh lệch',
    perYear: 'mỗi năm',
    chips: 'Quy tắc 31/12 · Khấu trừ chi phí chuyển nhà · Thuế bán hàng · In được',
    buy: 'Báo cáo đầy đủ — $9',
    buying: 'Đang mở trang thanh toán bảo mật…',
    offer: 'So sánh hai lời mời làm việc',
    offerLine: 'Hai offer sau thuế, tính cả RRSP match và ngày phép.',
    offerChips: 'Tổng thu nhập · RRSP match · Câu hỏi cho HR',
    price9: '$9',
    once: 'một lần',
    soon: 'Sắp ra mắt — bạn muốn được thông báo?',
    email: 'Email',
    notify: 'Báo cho tôi',
    thanks: 'Đã nhận — một email khi ra mắt.',
    offerCta: 'So sánh offer của tôi — $9',
    offerA: 'Offer A (cái này)',
    offerB: 'Offer B',
    salary: 'Lương',
    bonusL: 'Thưởng',
    matchL: 'RRSP match (% lương)',
    vacL: 'Số ngày phép / năm',
    provinceL: 'Tỉnh bang',
    offerStart: 'Thiết lập so sánh →',
    needProvince: 'Chọn tỉnh bang cho cả hai offer.',
    badSalary: 'lương phải từ $1,000 đến $5,000,000.',
    badBonus: 'tiền thưởng có vẻ quá lớn.',
    badMatch: 'RRSP match là % của lương — tối đa 20% ở đây.',
    badVacation: 'ngày phép tính theo NGÀY mỗi năm — tối đa 60 ở đây.',
    identical: 'Hai offer giống hệt nhau — hãy thay đổi một chi tiết.',
    secure: 'Thanh toán qua Stripe · liên kết dùng được mãi mãi',
  },
};


type OfferDraft = { province: string; salary: string; bonus: string; matchPct: string; vacationDays: string };

/** Defined OUTSIDE the page component: an inner component type would be
 *  recreated on every keystroke and the focused input would blur. */
function OfferFields({ o, set, title, t }: { o: OfferDraft; set: (v: OfferDraft) => void; title: string; t: Record<string, string> }) {
  return (
    <fieldset className="rounded-md border border-slate-200 p-2.5">
      <legend className="px-1 text-[11px] font-bold uppercase tracking-wide text-slate-500">{title}</legend>
      <div className="grid grid-cols-2 gap-1.5">
        <select value={o.province} onChange={(e) => set({ ...o, province: e.target.value })} className="col-span-2 rounded border border-slate-200 bg-white px-1.5 py-1 text-xs">
          <option value="">{t.provinceL} —</option>
          {Object.values(Province).map((pv) => <option key={pv} value={pv}>{pv}</option>)}
        </select>
        <input inputMode="numeric" placeholder={t.salary} value={o.salary} onChange={(e) => set({ ...o, salary: e.target.value.replace(/[^0-9]/g, '') })} className="rounded border border-slate-200 px-1.5 py-1 text-xs" />
        <input inputMode="numeric" placeholder={t.bonusL} value={o.bonus} onChange={(e) => set({ ...o, bonus: e.target.value.replace(/[^0-9]/g, '') })} className="rounded border border-slate-200 px-1.5 py-1 text-xs" />
        <input inputMode="numeric" placeholder={t.matchL} value={o.matchPct} onChange={(e) => set({ ...o, matchPct: e.target.value.replace(/[^0-9.]/g, '') })} className="rounded border border-slate-200 px-1.5 py-1 text-xs" />
        <input inputMode="numeric" placeholder={t.vacL} value={o.vacationDays} onChange={(e) => set({ ...o, vacationDays: e.target.value.replace(/[^0-9]/g, '') })} className="rounded border border-slate-200 px-1.5 py-1 text-xs" />
      </div>
    </fieldset>
  );
}

const money = (n: number) => `$${Math.abs(Math.round(n)).toLocaleString('en-CA')}`;

export default function FakeDoors({
  mode, province, annualIncome, lang,
}: { mode: string; province: string; annualIncome: number; lang: string }) {
  const t = DICT[lang] ?? DICT.en;
  const [dest, setDest] = useState<string>('');
  const [buying, setBuying] = useState(false);
  const [buyError, setBuyError] = useState<string | null>(null);
  const [offerOpen, setOfferOpen] = useState(false);
  const [offerBuying, setOfferBuying] = useState(false);
  const [offerError, setOfferError] = useState<string | null>(null);
  const [a, setA] = useState({ province: '', salary: '', bonus: '', matchPct: '', vacationDays: '' });
  const [b, setB] = useState({ province: '', salary: '', bonus: '', matchPct: '', vacationDays: '' });

  // The free number: take-home gap, computed here with the calculator's engine.
  const gap = useMemo(() => {
    if (!dest || !annualIncome) return null;
    const net = (p: string) =>
      calculateFromAnnualSalary({ province: p, annualSalary: annualIncome, payFrequency: PayFrequency.MONTHLY }).netPayAnnual;
    // Round each side first, exactly as the report does, so the teaser and
    // the paid page never disagree by a dollar.
    return Math.round(net(dest)) - Math.round(net(province));
  }, [dest, province, annualIncome]);

  if (!annualIncome || annualIncome <= 0) return null;

  const buyRelocation = async () => {
    if (!dest || dest === province) return;
    setBuying(true);
    setBuyError(null);
    recordCalcEvent({ mode: mode as CalcMode, province, annualIncome, lang, productInterest: 'relocation' });
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ product: 'relocation', from: province, to: dest, income: Math.round(annualIncome), lang }),
      });
      let data: { url?: string; error?: string } = {};
      try { data = await res.json(); } catch { /* empty body */ }
      if (!res.ok || !data.url) throw new Error(data.error || 'Payments are unavailable right now. Please try again in a few minutes.');
      window.location.href = data.url;
    } catch (e) {
      setBuyError((e as Error).message);
      setBuying(false);
    }
  };

  const tapOffer = () => {
    setOfferOpen(true);
    // Offer A defaults to what the calculator already shows.
    setA((cur) => cur.salary ? cur : { ...cur, province, salary: String(Math.round(annualIncome)) });
    recordCalcEvent({ mode: mode as CalcMode, province, annualIncome, lang, productInterest: 'offer-compare' as ProductInterest });
  };
  const toOffer = (o: typeof a) => ({
    province: o.province, salary: Number(o.salary),
    bonus: Number(o.bonus) || 0, matchPct: Number(o.matchPct) || 0, vacationDays: Number(o.vacationDays) || 0,
  });
  // Mirrors lib/offerReport.ts OFFER_LIMITS. The server rejects out-of-range
  // values outright; this catches them before the customer reaches Stripe.
  const offerProblem = (() => {
    for (const [o, name] of [[a, t.offerA], [b, t.offerB]] as const) {
      if (!o.province) return t.needProvince;
      const sal = Number(o.salary);
      if (!sal || sal < OFFER_LIMITS.salary.min || sal > OFFER_LIMITS.salary.max) return `${name}: ${t.badSalary}`;
      if (o.bonus && Number(o.bonus) > OFFER_LIMITS.bonus.max) return `${name}: ${t.badBonus}`;
      if (o.matchPct && Number(o.matchPct) > OFFER_LIMITS.matchPct.max) return `${name}: ${t.badMatch}`;
      if (o.vacationDays && Number(o.vacationDays) > OFFER_LIMITS.vacationDays.max) return `${name}: ${t.badVacation}`;
    }
    const same = a.province === b.province && Number(a.salary) === Number(b.salary)
      && Number(a.bonus || 0) === Number(b.bonus || 0) && Number(a.matchPct || 0) === Number(b.matchPct || 0)
      && Number(a.vacationDays || 0) === Number(b.vacationDays || 0);
    if (same) return t.identical;
    return null;
  })();
  const offerReady = !offerProblem;
  const buyOffer = async () => {
    if (!offerReady) return;
    setOfferBuying(true);
    setOfferError(null);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ product: 'offer-compare', a: toOffer(a), b: toOffer(b), lang }),
      });
      let data: { url?: string; error?: string } = {};
      try { data = await res.json(); } catch { /* empty body */ }
      if (!res.ok || !data.url) throw new Error(data.error || 'Payments are unavailable right now. Please try again in a few minutes.');
      window.location.href = data.url;
    } catch (e) {
      setOfferError((e as Error).message);
      setOfferBuying(false);
    }
  };

  const Chips = ({ text }: { text: string }) => (
    <p className="mt-2 text-[11px] tracking-wide text-slate-400">{text}</p>
  );
  const Price = () => (
    <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold tabular-nums text-slate-700">
      {t.price9} <span className="font-medium text-slate-400">{t.once}</span>
    </span>
  );

  return (
    <div className="rounded-xl border border-slate-200 bg-white px-5 py-4">
      <p className="text-xs font-bold uppercase tracking-[0.15em] text-red-600">{t.kicker}</p>
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        {/* Province move — real */}
        <div className="rounded-lg border border-slate-200 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">{t.relocation}</h3>
              <p className="mt-0.5 text-sm text-slate-500">{t.relocationLine}</p>
            </div>
            <Price />
          </div>

          <div className="mt-3 flex items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{t.moveTo}</span>
            <select
              value={dest}
              onChange={(e) => setDest(e.target.value)}
              className="min-w-0 flex-1 rounded-md border border-slate-200 bg-white px-2 py-1.5 text-sm"
            >
              <option value="">—</option>
              {Object.values(Province)
                .filter((pv) => pv !== province)
                .map((pv) => (
                  <option key={pv} value={pv}>{pv}</option>
                ))}
            </select>
          </div>

          {/* The live number */}
          <div className="mt-3 rounded-lg bg-slate-50 px-4 py-3">
            {gap === null ? (
              <p className="text-sm text-slate-400">{t.pick}</p>
            ) : (
              <p className="flex items-baseline gap-2">
                <span className={`text-3xl font-extrabold tabular-nums ${gap >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                  {gap >= 0 ? '+' : '−'}{money(gap)}
                </span>
                <span className="text-sm text-slate-500">{t.perYear}</span>
              </p>
            )}
          </div>
          <Chips text={t.chips} />

          <button
            onClick={buyRelocation}
            disabled={!dest || buying}
            className="mt-3 w-full rounded-md bg-red-600 px-3 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:bg-slate-200 disabled:text-slate-400"
          >
            {buying ? (<span className="inline-flex items-center gap-2"><ThinkingOrb state="connecting" size={20} theme="dark" aria-label={t.buying} />{t.buying}</span>) : t.buy}
          </button>
          {buyError && <p className="mt-1.5 text-[11px] text-red-600">{buyError}</p>}
          <p className="mt-1.5 text-[10px] text-slate-400">{t.secure}</p>
        </div>

        {/* Offer comparison — real */}
        <div className="flex flex-col rounded-lg border border-slate-200 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">{t.offer}</h3>
              <p className="mt-0.5 text-sm text-slate-500">{t.offerLine}</p>
            </div>
            <Price />
          </div>
          <Chips text={t.offerChips} />
          <div className="mt-auto pt-3">
            {!offerOpen ? (
              <button
                onClick={tapOffer}
                className="w-full rounded-md bg-slate-900 px-3 py-2.5 text-sm font-semibold text-white hover:bg-red-600"
              >
                {t.offerStart}
              </button>
            ) : (
              <div className="space-y-2">
                <OfferFields o={a} set={setA} title={t.offerA} t={t} />
                <OfferFields o={b} set={setB} title={t.offerB} t={t} />
                <button
                  onClick={buyOffer}
                  disabled={!offerReady || offerBuying}
                  className="w-full rounded-md bg-red-600 px-3 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:bg-slate-200 disabled:text-slate-400"
                >
                  {offerBuying ? (<span className="inline-flex items-center gap-2"><ThinkingOrb state="connecting" size={20} theme="dark" aria-label={t.buying} />{t.buying}</span>) : t.offerCta}
                </button>
                {(offerError || (offerProblem && (a.salary || b.salary))) && (
                  <p className="text-[11px] text-red-600">{offerError || offerProblem}</p>
                )}
                <p className="text-[10px] text-slate-400">{t.secure}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
