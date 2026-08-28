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
import { PayFrequency, type CalculationMode as CalcMode } from '../types';
import { calculateFromAnnualSalary } from '../utils/taxEngine';

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
    payPeers: 'Of the {n} people who answered this, {pct} said the same as you.',
    payRate: 'While you are here: your all-in deduction rate in {p} is {r} — that is federal tax, provincial tax, CPP and EI together.',
    payVacation: '{d} paid days off is worth about {v} of your pay — that is what the time itself is paid at.',
    oneMore: 'One more →',
    noThanks: 'That is enough',
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
  },
  zh: {
    payPeers: '回答过这题的 {n} 个人里,{pct} 和你选了一样的。',
    payRate: '顺便告诉你:你在{p}的总扣除率是 {r} —— 联邦税、省税、CPP 和 EI 加起来。',
    payVacation: '{d} 天带薪年假约合 {v} —— 这是那些休息日本身值的钱。',
    oneMore: '再答一题 →',
    noThanks: '够了',
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
  },
  fr: {
    payPeers: 'Sur les {n} personnes ayant répondu, {pct} ont dit la même chose que vous.',
    payRate: 'Au passage : votre taux de retenue total en {p} est de {r} — impôt fédéral, provincial, RPC et AE réunis.',
    payVacation: '{d} jours de congés payés valent environ {v} — c’est ce que vaut ce temps.',
    oneMore: 'Une de plus →',
    noThanks: 'Ça suffit',
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
  },
  es: {
    payPeers: 'De las {n} personas que respondieron, {pct} dijo lo mismo que usted.',
    payRate: 'De paso: su tasa total de retenciones en {p} es {r} — impuesto federal, provincial, CPP y EI juntos.',
    payVacation: '{d} días de vacaciones pagadas valen unos {v} — eso vale ese tiempo.',
    oneMore: 'Una más →',
    noThanks: 'Es suficiente',
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
  },
  pa: {
    payPeers: 'ਇਸ ਦਾ ਜਵਾਬ ਦੇਣ ਵਾਲੇ {n} ਲੋਕਾਂ ਵਿੱਚੋਂ {pct} ਨੇ ਤੁਹਾਡੇ ਵਾਂਗ ਕਿਹਾ।',
    payRate: 'ਨਾਲੇ: {p} ਵਿੱਚ ਤੁਹਾਡੀ ਕੁੱਲ ਕਟੌਤੀ ਦਰ {r} ਹੈ — ਫ਼ੈਡਰਲ ਟੈਕਸ, ਸੂਬਾਈ ਟੈਕਸ, CPP ਤੇ EI ਮਿਲਾ ਕੇ।',
    payVacation: '{d} ਤਨਖਾਹੀ ਛੁੱਟੀ ਦੇ ਦਿਨ ਲਗਭਗ {v} ਦੇ ਬਰਾਬਰ ਹਨ।',
    oneMore: 'ਇੱਕ ਹੋਰ →',
    noThanks: 'ਬਸ',
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
  },
  hi: {
    payPeers: 'इसका उत्तर देने वाले {n} लोगों में से {pct} ने आपके जैसा ही कहा।',
    payRate: 'साथ ही: {p} में आपकी कुल कटौती दर {r} है — संघीय कर, प्रांतीय कर, CPP और EI मिलाकर।',
    payVacation: '{d} सवेतन अवकाश दिन लगभग {v} के बराबर हैं।',
    oneMore: 'एक और →',
    noThanks: 'बस',
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
  },
  tl: {
    payPeers: 'Sa {n} sumagot, {pct} ang katulad mo ang sinabi.',
    payRate: 'Bilang dagdag: ang kabuuang bawas mo sa {p} ay {r} — federal, provincial, CPP at EI na pinagsama.',
    payVacation: 'Ang {d} bayad na araw ng bakasyon ay nagkakahalaga ng humigit-kumulang {v}.',
    oneMore: 'Isa pa →',
    noThanks: 'Tama na',
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
  },
  uk: {
    payPeers: 'Із {n} тих, хто відповів, {pct} сказали те саме, що й ви.',
    payRate: 'До речі: ваша загальна ставка утримань у {p} — {r} (федеральний і провінційний податок, CPP та EI разом).',
    payVacation: '{d} оплачуваних днів відпустки коштують близько {v}.',
    oneMore: 'Ще одне →',
    noThanks: 'Досить',
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
  },
  ko: {
    payPeers: '이 질문에 답한 {n}명 중 {pct}가 같은 선택을 했습니다.',
    payRate: '참고로 {p}의 총 공제율은 {r}입니다 — 연방세, 주세, CPP, EI를 합친 값입니다.',
    payVacation: '유급휴가 {d}일은 약 {v}의 가치가 있습니다.',
    oneMore: '하나 더 →',
    noThanks: '충분합니다',
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
  },
  vi: {
    payPeers: 'Trong {n} người đã trả lời, {pct} chọn giống bạn.',
    payRate: 'Nhân tiện: tổng tỷ lệ khấu trừ của bạn ở {p} là {r} — thuế liên bang, thuế tỉnh bang, CPP và EI cộng lại.',
    payVacation: '{d} ngày phép có lương trị giá khoảng {v}.',
    oneMore: 'Thêm một câu →',
    noThanks: 'Vậy là đủ',
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
 * Every question the site can ask, in one pool. A visit gets ONE at random;
 * answering unlocks the payoff and an optional next one. Order is not fixed,
 * so no single question monopolises the only slot a visitor will ever see.
 */
type QKey =
  | 'expectation' | 'work_arrangement' | 'age_band'
  | 'tenure_band' | 'union_member' | 'employer_size' | 'vacation_band';

const POOL: { key: QKey; prompt: string; options: string[] }[] = [
  { key: 'expectation', prompt: 'prompt', options: ['lower', 'as-expected', 'higher'] },
  { key: 'work_arrangement', prompt: 'workPrompt', options: ['onsite', 'remote', 'hybrid'] },
  { key: 'age_band', prompt: 'agePrompt', options: ['under-25', '25-34', '35-44', '45-54', '55-64', '65-plus'] },
  { key: 'tenure_band', prompt: 'q4tenure', options: ['under-1', '1-3', '3-5', '5-10', '10-plus'] },
  { key: 'union_member', prompt: 'q4union', options: ['yes', 'no', 'not-sure'] },
  { key: 'employer_size', prompt: 'q4size', options: ['solo', '2-10', '11-50', '51-200', '200-plus'] },
  { key: 'vacation_band', prompt: 'q4vacation', options: ['0-10', '11-15', '16-20', '21-25', '26-plus'] },
];

const EMOJI: Record<string, string> = {
  lower: '😖', 'as-expected': '😐', higher: '🙂',
  onsite: '🏢', remote: '🏠', hybrid: '🔀',
};

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

  /**
   * ONE question, then a payoff, then an optional next one.
   *
   * The old design chained four questions and thanked you at the end. Measured
   * on this site: the one question that hands something back (industry: your
   * pay vs the industry median) is answered 9.5% of the time; the chained ones
   * sat at 1-3%. So the deal is now explicit — you answer, you immediately get
   * a real number back.
   *
   * Where the peer distribution is too thin to quote (n < 30 server-side), the
   * payoff is computed from the tax engine instead. Never a fabricated share.
   */
  const [asked, setAsked] = useState<QKey[]>([]);
  const [current, setCurrent] = useState<QKey>(() => POOL[Math.floor(Math.random() * POOL.length)].key);
  const [payoff, setPayoff] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  if (!annualIncome || annualIncome <= 0) return null;

  const q = POOL.find((x) => x.key === current)!;

  const engineFallback = (key: QKey, value: string): string => {
    const net = calculateFromAnnualSalary({ province, annualSalary: annualIncome, payFrequency: PayFrequency.MONTHLY });
    const rate = Math.round((1 - net.netPayAnnual / annualIncome) * 1000) / 10;
    if (key === 'vacation_band') {
      // The pay attached to the days off — the same maths the offer report uses.
      const days = { '0-10': 8, '11-15': 13, '16-20': 18, '21-25': 23, '26-plus': 28 }[value] ?? 15;
      const worth = Math.round((days * annualIncome) / 260);
      return t.payVacation.replace('{d}', String(days)).replace('{v}', `$${worth.toLocaleString('en-CA')}`);
    }
    return t.payRate.replace('{r}', `${rate}%`).replace('{p}', province);
  };

  const answer = async (value: string) => {
    setBusy(true);
    recordCalcEvent({
      mode: mode as CalcMode, province, annualIncome, lang,
      expectation: current === 'expectation' ? (value as Expectation) : null,
      workArrangement: current === 'work_arrangement' ? (value as WorkArrangement) : null,
      ageBand: current === 'age_band' ? (value as AgeBand) : null,
      tenureBand: current === 'tenure_band' ? (value as TenureBand) : null,
      unionMember: current === 'union_member' ? (value as UnionMember) : null,
      employerSize: current === 'employer_size' ? (value as EmployerSize) : null,
      vacationBand: current === 'vacation_band' ? (value as VacationBand) : null,
    });
    let line: string | null = null;
    try {
      const r = await fetch(`/api/peers?q=${current}`, { cache: 'no-store' });
      const d = (await r.json()) as { ready?: boolean; n?: number; dist?: { k: string; pct: number }[] };
      if (d.ready && d.dist) {
        const mine = d.dist.find((x) => x.k === value);
        if (mine) line = t.payPeers.replace('{pct}', `${mine.pct}%`).replace('{n}', String(d.n));
      }
    } catch { /* fall through to the engine payoff */ }
    setPayoff(line ?? engineFallback(current, value));
    setAsked((a) => [...a, current]);
    setBusy(false);
  };

  const next = () => {
    const left = POOL.filter((x) => x.key !== current && !asked.includes(x.key));
    if (!left.length) { setDone(true); return; }
    setCurrent(left[Math.floor(Math.random() * left.length)].key);
    setPayoff(null);
  };

  const pill =
    'inline-flex min-h-10 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-700 disabled:opacity-50';

  return (
    <div className="rounded-xl border border-slate-200 bg-white px-5 py-4">
      {done ? (
        <p className="text-sm font-medium text-emerald-700">✓ {t.thanks}</p>
      ) : payoff ? (
        <>
          {/* The payoff. This is the whole point of asking. */}
          <div className="rounded-lg bg-slate-50 px-4 py-3">
            <p className="text-sm leading-6 text-slate-800">{payoff}</p>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button onClick={next} className={pill}>{t.oneMore}</button>
            <button onClick={() => setDone(true)} className="px-2 py-2 text-sm text-slate-400 hover:text-slate-600">
              {t.noThanks}
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="text-sm font-medium text-slate-700">{t[q.prompt]}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {q.options.map((o) => (
              <button key={o} onClick={() => answer(o)} disabled={busy} className={pill}>
                {EMOJI[o] && <span aria-hidden="true">{EMOJI[o]}</span>}
                {t[o]}
              </button>
            ))}
            <button onClick={() => setDone(true)} className="px-2 py-2 text-sm text-slate-400 hover:text-slate-600">
              {t.skip}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
