'use client';
import { useState } from 'react';
import {
  recordCalcEvent,
  type Expectation,
  type WorkArrangement,
  type AgeBand,
  type TenureBand,
  type UnionMember,
  type EmployerSize,
  type VacationBand,
} from '../lib/telemetry';
import type { CalculationMode as CalcMode } from '../types';

/**
 * A progressive prompt: one tap, one question, and the next question only
 * appears after the previous one is answered. Stop anywhere — nothing is
 * required, and whatever was answered is already recorded.
 *
 * Q1 (expectation) is the field no statistics agency can ever collect: nobody
 * records what people THOUGHT they would take home. Q2 (where you work) rides
 * on a real tax hook — remote and hybrid workers have a home-office deduction
 * question every March. Q3 (age band) is the softest ask, so it goes last;
 * whoever answers three questions in a row is engaged, not clicking through.
 *
 * PLACEMENT IS THE WHOLE DESIGN. The intent prompt two components below the
 * result was answered 0.4% of the time; this sits directly under the figure at
 * the moment of reaction. Progressive order also protects data quality: a
 * junk-clicker bails after one tap, so the later answers are self-selected
 * toward people answering honestly.
 *
 * Gender is deliberately not asked. No calculation uses it, an unmotivated
 * answer is indistinguishable from a real one, and gender × city × industry ×
 * bracket is a re-identification risk this dataset promised never to carry.
 */

const DICT: Record<string, Record<string, string>> = {
  en: {
    prompt: 'Is that more or less than you expected?',
    lower: 'Less than I thought',
    higher: 'More than I thought',
    'as-expected': 'About right',
    workPrompt: 'Where do you work? (Remote and hybrid workers may qualify for the home-office deduction.)',
    onsite: 'On-site',
    remote: 'Remote',
    hybrid: 'Hybrid',
    agePrompt: 'Last one — your age group. CPP and some credits differ by age.',
    'under-25': 'Under 25',
    '25-34': '25–34',
    '35-44': '35–44',
    '45-54': '45–54',
    '55-64': '55–64',
    '65-plus': '65+',
    q4tenure: 'How long have you been at this job?',
    'under-1': 'Under a year', '1-3': '1–3 yrs', '3-5': '3–5 yrs', '5-10': '5–10 yrs', '10-plus': '10+ yrs',
    q4union: 'Are you a union member?',
    yes: 'Yes', no: 'No', 'not-sure': 'Not sure',
    q4size: 'How big is your employer?',
    solo: 'Just me', '2-10': '2–10', '11-50': '11–50', '51-200': '51–200', '200-plus': '200+',
    q4vacation: 'How many paid vacation days do you actually get?',
    '0-10': '0–10', '11-15': '11–15', '16-20': '16–20', '21-25': '21–25', '26-plus': '26+',
    skip: 'Skip',
    thanks: 'Thanks — that helps.',
    hint: 'Anonymous. We publish only totals, never your figures.',
  },
  zh: {
    prompt: '这个数字比你预想的高还是低?',
    lower: '比我想的少',
    higher: '比我想的多',
    'as-expected': '差不多',
    workPrompt: '你在哪办公?(远程和混合办公可能符合家庭办公抵扣条件。)',
    onsite: '到岗',
    remote: '远程',
    hybrid: '混合',
    agePrompt: '最后一个 —— 年龄段。CPP 和部分税收抵免按年龄不同。',
    'under-25': '25 岁以下',
    '25-34': '25–34',
    '35-44': '35–44',
    '45-54': '45–54',
    '55-64': '55–64',
    '65-plus': '65 岁以上',
    q4tenure: '这份工作干了多久了?',
    'under-1': '不到一年', '1-3': '1–3 年', '3-5': '3–5 年', '5-10': '5–10 年', '10-plus': '10 年以上',
    q4union: '你是工会成员吗?',
    yes: '是', no: '不是', 'not-sure': '不确定',
    q4size: '你的雇主有多少人?',
    solo: '就我一个', '2-10': '2–10 人', '11-50': '11–50 人', '51-200': '51–200 人', '200-plus': '200 人以上',
    q4vacation: '你实际有几天带薪年假?',
    '0-10': '0–10 天', '11-15': '11–15 天', '16-20': '16–20 天', '21-25': '21–25 天', '26-plus': '26 天以上',
    skip: '跳过',
    thanks: '谢谢,这很有帮助。',
    hint: '匿名统计,只发布汇总数字,绝不公开你的金额。',
  },
  fr: {
    prompt: "Est-ce plus ou moins que ce que vous pensiez ?",
    lower: 'Moins que prévu',
    higher: 'Plus que prévu',
    'as-expected': 'À peu près juste',
    workPrompt: 'Où travaillez-vous ? (Le télétravail peut donner droit à la déduction pour bureau à domicile.)',
    onsite: 'Sur place',
    remote: 'À distance',
    hybrid: 'Hybride',
    agePrompt: 'Dernière question — votre groupe d’âge. Le RPC et certains crédits varient selon l’âge.',
    'under-25': 'Moins de 25 ans',
    '25-34': '25–34',
    '35-44': '35–44',
    '45-54': '45–54',
    '55-64': '55–64',
    '65-plus': '65 et plus',
    q4tenure: 'Depuis combien de temps occupez-vous cet emploi ?',
    'under-1': 'Moins d’un an', '1-3': '1–3 ans', '3-5': '3–5 ans', '5-10': '5–10 ans', '10-plus': '10 ans et plus',
    q4union: 'Êtes-vous syndiqué(e) ?',
    yes: 'Oui', no: 'Non', 'not-sure': 'Pas certain',
    q4size: 'Quelle est la taille de votre employeur ?',
    solo: 'Moi seul', '2-10': '2–10', '11-50': '11–50', '51-200': '51–200', '200-plus': '200+',
    q4vacation: 'Combien de jours de vacances payées avez-vous réellement ?',
    '0-10': '0–10', '11-15': '11–15', '16-20': '16–20', '21-25': '21–25', '26-plus': '26+',
    skip: 'Passer',
    thanks: 'Merci, cela nous aide.',
    hint: 'Anonyme. Nous publions uniquement des totaux.',
  },
  es: {
    prompt: '¿Es más o menos de lo que esperaba?',
    lower: 'Menos de lo que pensaba',
    higher: 'Más de lo que pensaba',
    'as-expected': 'Más o menos',
    workPrompt: '¿Dónde trabaja? (Quienes trabajan a distancia pueden tener derecho a la deducción por oficina en casa.)',
    onsite: 'Presencial',
    remote: 'A distancia',
    hybrid: 'Híbrido',
    agePrompt: 'Última pregunta: su grupo de edad. El CPP y algunos créditos varían con la edad.',
    'under-25': 'Menos de 25',
    '25-34': '25–34',
    '35-44': '35–44',
    '45-54': '45–54',
    '55-64': '55–64',
    '65-plus': '65+',
    q4tenure: '¿Cuánto lleva en este trabajo?',
    'under-1': 'Menos de un año', '1-3': '1–3 años', '3-5': '3–5 años', '5-10': '5–10 años', '10-plus': 'Más de 10 años',
    q4union: '¿Está afiliado a un sindicato?',
    yes: 'Sí', no: 'No', 'not-sure': 'No estoy seguro',
    q4size: '¿Qué tamaño tiene su empleador?',
    solo: 'Solo yo', '2-10': '2–10', '11-50': '11–50', '51-200': '51–200', '200-plus': '200+',
    q4vacation: '¿Cuántos días de vacaciones pagadas tiene realmente?',
    '0-10': '0–10', '11-15': '11–15', '16-20': '16–20', '21-25': '21–25', '26-plus': '26+',
    skip: 'Omitir',
    thanks: 'Gracias, nos ayuda.',
    hint: 'Anónimo. Publicamos solo totales, nunca sus cifras.',
  },
  pa: {
    prompt: 'ਕੀ ਇਹ ਤੁਹਾਡੀ ਉਮੀਦ ਤੋਂ ਵੱਧ ਹੈ ਜਾਂ ਘੱਟ?',
    lower: 'ਮੇਰੀ ਸੋਚ ਤੋਂ ਘੱਟ',
    higher: 'ਮੇਰੀ ਸੋਚ ਤੋਂ ਵੱਧ',
    'as-expected': 'ਲਗਭਗ ਸਹੀ',
    workPrompt: 'ਤੁਸੀਂ ਕਿੱਥੇ ਕੰਮ ਕਰਦੇ ਹੋ? (ਰਿਮੋਟ ਤੇ ਹਾਈਬ੍ਰਿਡ ਕਾਮਿਆਂ ਨੂੰ ਘਰੇਲੂ ਦਫ਼ਤਰ ਕਟੌਤੀ ਮਿਲ ਸਕਦੀ ਹੈ।)',
    onsite: 'ਦਫ਼ਤਰ ਵਿੱਚ',
    remote: 'ਰਿਮੋਟ',
    hybrid: 'ਹਾਈਬ੍ਰਿਡ',
    agePrompt: 'ਆਖਰੀ ਸਵਾਲ — ਤੁਹਾਡਾ ਉਮਰ ਵਰਗ। CPP ਤੇ ਕੁਝ ਛੋਟਾਂ ਉਮਰ ਨਾਲ ਬਦਲਦੀਆਂ ਹਨ।',
    'under-25': '25 ਤੋਂ ਘੱਟ',
    '25-34': '25–34',
    '35-44': '35–44',
    '45-54': '45–54',
    '55-64': '55–64',
    '65-plus': '65+',
    q4tenure: 'ਇਸ ਨੌਕਰੀ ਵਿੱਚ ਕਿੰਨਾ ਸਮਾਂ ਹੋ ਗਿਆ?',
    'under-1': 'ਇੱਕ ਸਾਲ ਤੋਂ ਘੱਟ', '1-3': '1–3 ਸਾਲ', '3-5': '3–5 ਸਾਲ', '5-10': '5–10 ਸਾਲ', '10-plus': '10+ ਸਾਲ',
    q4union: 'ਕੀ ਤੁਸੀਂ ਯੂਨੀਅਨ ਮੈਂਬਰ ਹੋ?',
    yes: 'ਹਾਂ', no: 'ਨਹੀਂ', 'not-sure': 'ਪੱਕਾ ਨਹੀਂ',
    q4size: 'ਤੁਹਾਡੇ ਮਾਲਕ ਕੋਲ ਕਿੰਨੇ ਲੋਕ ਹਨ?',
    solo: 'ਸਿਰਫ਼ ਮੈਂ', '2-10': '2–10', '11-50': '11–50', '51-200': '51–200', '200-plus': '200+',
    q4vacation: 'ਤੁਹਾਨੂੰ ਅਸਲ ਵਿੱਚ ਕਿੰਨੇ ਤਨਖਾਹੀ ਛੁੱਟੀ ਦੇ ਦਿਨ ਮਿਲਦੇ ਹਨ?',
    '0-10': '0–10', '11-15': '11–15', '16-20': '16–20', '21-25': '21–25', '26-plus': '26+',
    skip: 'ਛੱਡੋ',
    thanks: 'ਧੰਨਵਾਦ — ਇਸ ਨਾਲ ਮਦਦ ਮਿਲਦੀ ਹੈ।',
    hint: 'ਗੁਪਤ। ਅਸੀਂ ਸਿਰਫ਼ ਕੁੱਲ ਅੰਕੜੇ ਛਾਪਦੇ ਹਾਂ, ਤੁਹਾਡੀ ਰਕਮ ਕਦੇ ਨਹੀਂ।',
  },
  hi: {
    prompt: 'क्या यह आपकी उम्मीद से ज़्यादा है या कम?',
    lower: 'मेरी सोच से कम',
    higher: 'मेरी सोच से ज़्यादा',
    'as-expected': 'लगभग सही',
    workPrompt: 'आप कहाँ काम करते हैं? (रिमोट और हाइब्रिड कर्मचारियों को होम-ऑफ़िस कटौती मिल सकती है।)',
    onsite: 'ऑफ़िस में',
    remote: 'रिमोट',
    hybrid: 'हाइब्रिड',
    agePrompt: 'आख़िरी सवाल — आपका आयु वर्ग। CPP और कुछ छूट उम्र के अनुसार बदलती हैं।',
    'under-25': '25 से कम',
    '25-34': '25–34',
    '35-44': '35–44',
    '45-54': '45–54',
    '55-64': '55–64',
    '65-plus': '65+',
    q4tenure: 'इस नौकरी में कितना समय हो गया?',
    'under-1': 'एक साल से कम', '1-3': '1–3 साल', '3-5': '3–5 साल', '5-10': '5–10 साल', '10-plus': '10+ साल',
    q4union: 'क्या आप यूनियन सदस्य हैं?',
    yes: 'हाँ', no: 'नहीं', 'not-sure': 'पक्का नहीं',
    q4size: 'आपके नियोक्ता में कितने लोग हैं?',
    solo: 'सिर्फ़ मैं', '2-10': '2–10', '11-50': '11–50', '51-200': '51–200', '200-plus': '200+',
    q4vacation: 'आपको वास्तव में कितने सवेतन अवकाश दिन मिलते हैं?',
    '0-10': '0–10', '11-15': '11–15', '16-20': '16–20', '21-25': '21–25', '26-plus': '26+',
    skip: 'छोड़ें',
    thanks: 'धन्यवाद — इससे मदद मिलती है।',
    hint: 'गुमनाम। हम केवल कुल आँकड़े प्रकाशित करते हैं, आपकी राशि कभी नहीं।',
  },
  tl: {
    prompt: 'Mas mataas ba ito o mas mababa sa inaasahan mo?',
    lower: 'Mas mababa sa inakala ko',
    higher: 'Mas mataas sa inakala ko',
    'as-expected': 'Tama lang',
    workPrompt: 'Saan ka nagtatrabaho? (Ang remote at hybrid ay maaaring may home-office deduction.)',
    onsite: 'Sa opisina',
    remote: 'Remote',
    hybrid: 'Hybrid',
    agePrompt: 'Huling tanong — ang iyong pangkat ng edad. Nagbabago ang CPP at ilang credit ayon sa edad.',
    'under-25': 'Wala pang 25',
    '25-34': '25–34',
    '35-44': '35–44',
    '45-54': '45–54',
    '55-64': '55–64',
    '65-plus': '65+',
    q4tenure: 'Gaano ka na katagal sa trabahong ito?',
    'under-1': 'Wala pang isang taon', '1-3': '1–3 taon', '3-5': '3–5 taon', '5-10': '5–10 taon', '10-plus': '10+ taon',
    q4union: 'Miyembro ka ba ng unyon?',
    yes: 'Oo', no: 'Hindi', 'not-sure': 'Hindi sigurado',
    q4size: 'Gaano kalaki ang iyong employer?',
    solo: 'Ako lang', '2-10': '2–10', '11-50': '11–50', '51-200': '51–200', '200-plus': '200+',
    q4vacation: 'Ilang bayad na araw ng bakasyon talaga ang nakukuha mo?',
    '0-10': '0–10', '11-15': '11–15', '16-20': '16–20', '21-25': '21–25', '26-plus': '26+',
    skip: 'Laktawan',
    thanks: 'Salamat — malaking tulong ito.',
    hint: 'Anonymous. Kabuuan lang ang inilalathala namin, hindi kailanman ang iyong halaga.',
  },
  uk: {
    prompt: 'Це більше чи менше, ніж ви очікували?',
    lower: 'Менше, ніж я думав',
    higher: 'Більше, ніж я думав',
    'as-expected': 'Приблизно так',
    workPrompt: 'Де ви працюєте? (Віддалені та гібридні працівники можуть мати право на відрахування за домашній офіс.)',
    onsite: 'В офісі',
    remote: 'Віддалено',
    hybrid: 'Гібридно',
    agePrompt: 'Останнє питання — ваша вікова група. CPP і деякі кредити залежать від віку.',
    'under-25': 'До 25',
    '25-34': '25–34',
    '35-44': '35–44',
    '45-54': '45–54',
    '55-64': '55–64',
    '65-plus': '65+',
    q4tenure: 'Скільки ви вже на цій роботі?',
    'under-1': 'Менше року', '1-3': '1–3 роки', '3-5': '3–5 років', '5-10': '5–10 років', '10-plus': 'Понад 10 років',
    q4union: 'Ви член профспілки?',
    yes: 'Так', no: 'Ні', 'not-sure': 'Не впевнений',
    q4size: 'Наскільки великий ваш роботодавець?',
    solo: 'Лише я', '2-10': '2–10', '11-50': '11–50', '51-200': '51–200', '200-plus': '200+',
    q4vacation: 'Скільки оплачуваних днів відпустки ви маєте насправді?',
    '0-10': '0–10', '11-15': '11–15', '16-20': '16–20', '21-25': '21–25', '26-plus': '26+',
    skip: 'Пропустити',
    thanks: 'Дякуємо — це допомагає.',
    hint: 'Анонімно. Ми публікуємо лише підсумки, ніколи ваші суми.',
  },
  ko: {
    prompt: '예상보다 많나요, 적나요?',
    lower: '생각보다 적다',
    higher: '생각보다 많다',
    'as-expected': '비슷하다',
    workPrompt: '어디에서 일하시나요? (재택·하이브리드 근무자는 재택근무 공제 대상일 수 있습니다.)',
    onsite: '출근',
    remote: '재택',
    hybrid: '하이브리드',
    agePrompt: '마지막 질문 — 연령대입니다. CPP와 일부 세액공제는 나이에 따라 달라집니다.',
    'under-25': '25세 미만',
    '25-34': '25–34',
    '35-44': '35–44',
    '45-54': '45–54',
    '55-64': '55–64',
    '65-plus': '65세 이상',
    q4tenure: '현재 직장에서 얼마나 근무하셨나요?',
    'under-1': '1년 미만', '1-3': '1–3년', '3-5': '3–5년', '5-10': '5–10년', '10-plus': '10년 이상',
    q4union: '노동조합 조합원이신가요?',
    yes: '예', no: '아니요', 'not-sure': '잘 모르겠음',
    q4size: '회사 규모는 어느 정도인가요?',
    solo: '혼자', '2-10': '2–10명', '11-50': '11–50명', '51-200': '51–200명', '200-plus': '200명 이상',
    q4vacation: '실제로 유급휴가를 며칠 받으시나요?',
    '0-10': '0–10', '11-15': '11–15', '16-20': '16–20', '21-25': '21–25', '26-plus': '26일 이상',
    skip: '건너뛰기',
    thanks: '감사합니다 — 큰 도움이 됩니다.',
    hint: '익명입니다. 합계만 공개하며 개인 금액은 절대 공개하지 않습니다.',
  },
  vi: {
    prompt: 'Con số này cao hơn hay thấp hơn bạn nghĩ?',
    lower: 'Thấp hơn tôi nghĩ',
    higher: 'Cao hơn tôi nghĩ',
    'as-expected': 'Gần đúng',
    workPrompt: 'Bạn làm việc ở đâu? (Người làm từ xa và hybrid có thể được khấu trừ văn phòng tại nhà.)',
    onsite: 'Tại văn phòng',
    remote: 'Từ xa',
    hybrid: 'Kết hợp',
    agePrompt: 'Câu cuối — nhóm tuổi của bạn. CPP và một số khoản khấu trừ thay đổi theo tuổi.',
    'under-25': 'Dưới 25',
    '25-34': '25–34',
    '35-44': '35–44',
    '45-54': '45–54',
    '55-64': '55–64',
    '65-plus': '65+',
    q4tenure: 'Bạn đã làm công việc này bao lâu?',
    'under-1': 'Dưới một năm', '1-3': '1–3 năm', '3-5': '3–5 năm', '5-10': '5–10 năm', '10-plus': 'Trên 10 năm',
    q4union: 'Bạn có phải thành viên công đoàn không?',
    yes: 'Có', no: 'Không', 'not-sure': 'Không chắc',
    q4size: 'Nơi bạn làm việc có quy mô thế nào?',
    solo: 'Chỉ mình tôi', '2-10': '2–10', '11-50': '11–50', '51-200': '51–200', '200-plus': '200+',
    q4vacation: 'Thực tế bạn có bao nhiêu ngày phép có lương?',
    '0-10': '0–10', '11-15': '11–15', '16-20': '16–20', '21-25': '21–25', '26-plus': '26+',
    skip: 'Bỏ qua',
    thanks: 'Cảm ơn — điều này rất hữu ích.',
    hint: 'Ẩn danh. Chúng tôi chỉ công bố số liệu tổng hợp, không bao giờ số tiền của bạn.',
  },
};

const EXPECT_OPTIONS: { key: Expectation; emoji: string }[] = [
  { key: 'lower', emoji: '😖' },
  { key: 'as-expected', emoji: '😐' },
  { key: 'higher', emoji: '🙂' },
];
const WORK_OPTIONS: { key: WorkArrangement; emoji: string }[] = [
  { key: 'onsite', emoji: '🏢' },
  { key: 'remote', emoji: '🏠' },
  { key: 'hybrid', emoji: '🔀' },
];
const AGE_OPTIONS: AgeBand[] = ['under-25', '25-34', '35-44', '45-54', '55-64', '65-plus'];

/**
 * Q4 is a ROTATING slot: each visitor sees exactly one of four questions
 * (tenure, union, employer size, vacation days), picked at mount. Sample
 * speed per question drops 4x; the answer rate of Q1-Q3 is untouched, and
 * nobody ever faces a wall of questions. All four are skippable.
 */
type Q4 =
  | { kind: 'tenure'; prompt: 'q4tenure'; options: TenureBand[] }
  | { kind: 'union'; prompt: 'q4union'; options: UnionMember[] }
  | { kind: 'size'; prompt: 'q4size'; options: EmployerSize[] }
  | { kind: 'vacation'; prompt: 'q4vacation'; options: VacationBand[] };
const Q4_POOL: Q4[] = [
  { kind: 'tenure', prompt: 'q4tenure', options: ['under-1', '1-3', '3-5', '5-10', '10-plus'] },
  { kind: 'union', prompt: 'q4union', options: ['yes', 'no', 'not-sure'] },
  { kind: 'size', prompt: 'q4size', options: ['solo', '2-10', '11-50', '51-200', '200-plus'] },
  { kind: 'vacation', prompt: 'q4vacation', options: ['0-10', '11-15', '16-20', '21-25', '26-plus'] },
];

export default function ExpectationPrompt({
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
  const [expectation, setExpectation] = useState<Expectation | null>(null);
  const [workArrangement, setWorkArrangement] = useState<WorkArrangement | null>(null);
  const [ageBand, setAgeBand] = useState<AgeBand | null>(null);
  const [q4] = useState<Q4>(() => Q4_POOL[Math.floor(Math.random() * Q4_POOL.length)]);
  const [q4Done, setQ4Done] = useState(false);

  if (!annualIncome || annualIncome <= 0) return null;

  // Each answer records the cumulative state; the dedupe key inside
  // recordCalcEvent includes all three fields, so each step lands.
  const send = (ex: Expectation, wa: WorkArrangement | null, ab: AgeBand | null, q4v?: string) =>
    recordCalcEvent({
      mode: mode as CalcMode,
      province,
      annualIncome,
      lang,
      expectation: ex,
      workArrangement: wa,
      ageBand: ab,
      tenureBand: q4v && q4.kind === 'tenure' ? (q4v as TenureBand) : null,
      unionMember: q4v && q4.kind === 'union' ? (q4v as UnionMember) : null,
      employerSize: q4v && q4.kind === 'size' ? (q4v as EmployerSize) : null,
      vacationBand: q4v && q4.kind === 'vacation' ? (q4v as VacationBand) : null,
    });

  const answerQ4 = (v: string) => {
    setQ4Done(true);
    if (expectation) send(expectation, workArrangement, ageBand, v);
  };

  const pill =
    'inline-flex min-h-10 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-700';

  return (
    <div className="rounded-xl border border-slate-200 bg-white px-5 py-4">
      {!expectation ? (
        <>
          <p className="text-sm font-medium text-slate-700">{t.prompt}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {EXPECT_OPTIONS.map((o) => (
              <button key={o.key} onClick={() => { setExpectation(o.key); send(o.key, null, null); }} className={pill}>
                <span aria-hidden="true">{o.emoji}</span>
                {t[o.key]}
              </button>
            ))}
          </div>
          <p className="mt-2.5 text-[11px] leading-4 text-slate-400">{t.hint}</p>
        </>
      ) : !workArrangement ? (
        <>
          <p className="text-sm font-medium text-emerald-700">✓ {t.thanks}</p>
          <p className="mt-2 text-sm font-medium text-slate-700">{t.workPrompt}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {WORK_OPTIONS.map((o) => (
              <button
                key={o.key}
                onClick={() => { setWorkArrangement(o.key); send(expectation, o.key, null); }}
                className={pill}
              >
                <span aria-hidden="true">{o.emoji}</span>
                {t[o.key]}
              </button>
            ))}
          </div>
        </>
      ) : !ageBand ? (
        <>
          <p className="text-sm font-medium text-slate-700">{t.agePrompt}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {AGE_OPTIONS.map((k) => (
              <button
                key={k}
                onClick={() => { setAgeBand(k); send(expectation, workArrangement, k); }}
                className={pill}
              >
                {t[k]}
              </button>
            ))}
          </div>
        </>
      ) : !q4Done ? (
        <>
          <p className="text-sm font-medium text-slate-700">{t[q4.prompt]}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {(q4.options as string[]).map((k) => (
              <button key={k} onClick={() => answerQ4(k)} className={pill}>
                {t[k]}
              </button>
            ))}
            <button onClick={() => setQ4Done(true)} className="inline-flex min-h-10 items-center rounded-full px-3 py-2 text-sm text-slate-400 hover:text-slate-600">
              {t.skip}
            </button>
          </div>
        </>
      ) : (
        <p className="text-sm font-medium text-emerald-700">✓ {t.thanks}</p>
      )}
    </div>
  );
}
