# 增长计划 · 2026-09-15（来自数据室 + Search Console 审阅）

> 6 个分析视角 → 合并 → 每条由「证据核查」和「可行性核查」两个对手审过 → 排序。13 条保留、21 条推翻、5 条因额度未核完。
> 数字口径：GSC 近 28 天 = 2026-08-16..09-12；数据室事件 2026-08-07 起。约 38% 的点击 Google 不提供查询词。

## 关键事实
- Google is the only working acquisition channel, and three pages carry nearly all of it. '/' (342) plus /ontario-paycheck-calculator (359) = 701 of 867 GSC clicks in 28d (80.9%). Entries: '/' 454 + Ontario 403 + /zh 72 = 929 of 1,051 calc sessions (88.4%). Web calc sessions (827) roughly match Google clicks (880) for 08-16..09-12. Telemetry drops external referrers by design, so no off-site channel can be measured.
- The organic jump came from two calculator pages ranking higher, not from content. '/' went from pos 24.0 to 10.4 (63 to 342 clicks); Ontario from pos 17 to 9.2 (215 to 359); site-wide 331 to 867 clicks per 28d. Articles produced 55 calcs across 44 articles in 90d. The top article (CPP 2027: 42 clicks, 2,747 impr) produced 2 entry sessions.
- Head terms rank on page one but barely click, and the data points to intent or geography more than title wording. 'payroll calculator': 46 clicks / 17,668 impr, pos 8.5, while Canadian-modified payroll variants rank 20-24. Employer-intent queries: 157 impr (0.8% of payroll impr). 'salary calculator canada': 1 / 3,748. The only testable wording gap: Ontario salary-calculator queries 29 / 4,201 (0.69%) at pos ~10 vs Ontario take-home queries 23 / 1,727 (1.33%) at pos 9.0.
- Six hub URLs (/bc- and /alberta-paycheck-calculator, /hourly-wage-calculator, /salary-calculator, /cpp-ei-calculator, /timesheet-tracker) have had 0 impressions over ~114 days. All return 200 with a self canonical and no noindex, and the Ontario page (25,213 impr) already links to them. The NS/MB/SK hubs added 2026-08-19 got 186/143/106 impr. That points to an indexing or canonical judgement, not discovery. Demand behind them is small: Alberta calculator-intent queries 556 impr / 18 clicks, BC 38 impr.
- A dated deadline is live now. Canada.ca published 2027 EI on 2026-09-14 ($1.64 per $100, MIE $70,800, max worker premium $1,161.12). The site's best blog page, /blog/cpp-contribution-rate-cut-2027 (42 clicks = 48.8% of 86 blog clicks), mentions neither '70,800' nor '1.64'. 2027 CPP/EI queries are brand new: 748 impr / 10 clicks, 305 impr on 'max' wording.
- Template bulk is still 79.5% of the sitemap (302/380) and returns almost nothing. Salary pages: 15 clicks / 5,152 impr. Wage pages: 7 / 2,420, with 3 entry sessions across both templates. Wage titles label the gross StatCan median as 'Take-Home' (e.g. '$35.19/hr Take-Home').
- Measurement has blind spots. No app build has written a D1 row since 2026-08-23: the 61 app rows from 08-24..27 are the Supabase backfill. The likely cause is the events route binding NULL into NOT NULL schema_version. The data room counts only sessions that calculate (visits 1,051 = sessions 1,051). The Sep dip (0.66 sessions/click on 09-06..10) recovered to 1.21 on 09-11..12.
- Live breaches of the engine-only rule passed the number audit. /compare-provinces says Alberta has a 'flat 10%' rate (engine: 8% to $61,200). The minimum-wage study prints Ontario at both $30,179 and $30,516, and Nunavut at $19.75 (now $20.17), and llms.txt repeats that figure. The audit accepts a value that matches any province, which is how these got through.

## 排序后的计划

### #1 · One GSC API run: inspect the 6 zero-impression hubs, and pull query×page×country for the head terms plus page×day for the Sep dip
- **阶段**：this-week · **谁做**：Claude (repo, no Travis) · **工作量**：S (1-2h)
- **为什么**：The 6 hubs have 0 impressions in both page exports (which go down to 1 impr) despite 200, self canonical and inbound links; NS/MB/SK got 186/143/106 within weeks. Only URL Inspection can say whether this is 'crawled/not indexed' or a Google-chosen canonical. The exports have no page or country dimension. So nobody knows which URL collects 'payroll calculator' (46/17,668) or the Ontario salary queries (29/4,201), or whether the 17,668 impressions are Canadian. Without that, every title decision is a guess.
- **怎么做**：Write a one-off Python script, or extend /Users/travis/Documents/Vibe_Coding/CanPay-Insights/scripts/archiveGsc.py, using the existing service account (~/.canpay-secrets/gsc-service-account.json; webmasters.readonly covers urlInspection.index.inspect). Python only, so the broken tsx doesn't block it.
(a) URL Inspection on the 6 hubs, with /ontario-paycheck-calculator and /nova-scotia-paycheck-calculator as controls. Record coverageState, googleCanonical, lastCrawlTime, robotsTxtState and referringUrls.
(b) searchAnalytics, last 28d, dimensions [query, page, country], for: 'payroll calculator', 'salary calculator canada', 'salary calculator ontario', 'ontario salary calculator', 'paycheck calculator ontario', 'take home pay calculator ontario'.
(c) Dimensions [date, page] for 08-28..09-12, to see whether the 09-04..09-10 extra clicks went to non-calculator pages such as the CPP 2027 article.
Save results to a dated note. Change no content until they are read.
- **预期**：0 new users directly. It decides items 2, 9 and 12, and whether the ~+3-5 calcs/day Alberta ceiling is reachable. It also stops a 'Payroll' retitle aimed at impressions that may not be Canadian.
- **怎么衡量**：coverageState and googleCanonical per hub; CA share of 'payroll calculator' impressions; which URL ranks the Ontario salary queries; share of 09-04..09-10 clicks landing on non-calculator pages

### #2 · Ontario-only title test: keep the 'Ontario Paycheck Calculator 2026' prefix and add 'Salary & Hourly' to the tail
- **阶段**：this-week · **谁做**：Claude (repo) · **工作量**：S
- **为什么**：Ontario salary-calculator queries get 29 clicks / 4,201 impr (0.69%) at pos ~10.1, against the Ontario take-home control at 23 / 1,727 (1.33%), pos 9.0. The 12x paycheck-vs-salary gap in the proposal was refuted: at pos 9-11 it is 2.29% vs 0.37%, mostly explained by position. Home dropped 'Payroll' on purpose in commit 639e277 (AI engines were classifying the site as a payments company), and ChatGPT and Gemini still mention it 0%. So 'Payroll' stays out.
- **怎么做**：Only if rank 1 shows /ontario-paycheck-calculator collects the Ontario salary impressions:
- In app/landing-page-data.ts:306, set the title to 'Ontario Paycheck Calculator 2026: Salary & Hourly Take-Home' (59 chars + suffix = 77, vs 74 today).
- Leave the H1 and the engine description ($59,994) unchanged.
- Log the date in /changelog.
If rank 1 shows '/' ranks these queries, run the equivalent on home instead: 'Canadian Salary & Take-Home Pay Calculator 2026', with the H1 changed at App.tsx:576 (not :508) and no 'Payroll'. If both pages split the impressions, skip the test. Do not put 'Payroll' in the home title. Merge origin/main before pushing.
- **预期**：Low: about +13 to +25 clicks per 28d, roughly +1-3 calcs/day at 3.30 calcs per Ontario-entry session
- **怎么衡量**：Ontario salary-calculator query CTR within pos 9-11: baseline 0.69% (29/4,201), success ≥1.0% (~42 clicks/28d). Control: Ontario take-home at 1.33%. Revert if 'paycheck calculator ontario' (64/980, pos 5.6) falls below pos 7 or its CTR drops under 4%.

### #3 · Add the official 2027 EI figures to the CPP 2027 article within 72h, through 2027 constants and a 2027 audit set
- **阶段**：this-week，截止 2026-09-17 · **谁做**：Claude (repo) · **工作量**：S-M (half day including the audit set)
- **为什么**：/blog/cpp-contribution-rate-cut-2027 has 42 clicks / 2,747 impr at pos 7.1 (48.8% of blog clicks). 2027 CPP/EI queries: 748 impr / 10 clicks, with 'max' wording 305 impr / 7 clicks. Canada.ca published 2027 EI on 2026-09-14: $1.64 per $100, MIE $70,800, max worker premium $1,161.12, Quebec $1.29 / $913.32. The article has none of it and says the YMPE comes 'each November' (the 2026 YMPE was announced 2025-10-30). Click-to-session is ~5% (42 clicks → 2 sessions), so this protects an asset rather than growing calcs.
- **怎么做**：Merge origin/main first; the robot commits to src/content/articles-studies.ts.
(1) constants.ts: add a separate 2027 block: EI_RATE_2027 = 0.0164, EI_MAX_INSURABLE_EARNINGS_2027 = 70800, QC_EI_RATE_2027 = 0.0129, derived max premiums checked against 1,161.12 and 913.32, and the base CPP employee rate of 4.75%. TAX_YEAR stays 2026 and the engine is untouched.
(2) scripts/auditNumbers.ts: add a 2027 value set that applies only to sentences or rows dated 2027, plus a selftest case ('2027 EI rate is 1.65%' must fail).
(3) Article:
- updatedAt 2026-09-15.
- H2 '2027 EI premiums' citing canada.ca rates2027, with '2027' in every sentence or row that carries a figure. Re-verify the Quebec figure first.
- metaTitle 'CPP & EI 2027: Rate Cut, New EI Maximum'; keep the H1.
- Move the existing '/' and '/cpp-ei-calculator' links to just after directAnswer.
- Change 'each November' to 'around the end of October'.
- Add a one-line pointer from how-much-ei-will-i-pay-2026.
No tax-year switch and no 2027 take-home figure. Record current query positions so the change can be reverted.
- **预期**：Low for usage (~+1 calc session per 28d). It keeps the top blog page fresh through the Oct-Jan 2027 query season.
- **怎么衡量**：Article CTR baseline 1.53% (42/2,747). Clicks on 2027 CPP/EI queries: baseline 10 on 748 impr; 'max' queries 7/305. Read out 2026-10-15.

### #4 · Fix the wage-page titles that call a gross median 'Take-Home', and noindex the 122 wage pages with no demand
- **阶段**：this-week · **谁做**：Claude (repo) · **工作量**：S
- **为什么**：Wage pages are 170 of 380 sitemap URLs and got 7 clicks / 2,420 impr in 28d, with 1 entry session. Template share is 79.5% (302/380). Both this site and the US sister site were demoted for template bulk, and Google carries ~95% of acquisition. A gate that keeps every clicked page plus pages with ≥15 impr keeps 48 pages, 1,728 impr and all 7 clicks (recomputed from gsc_pages_28d.json). The earlier ≥20 cut would have dropped 4 of the 7 clicks. Titles print the gross StatCan median as '$35.19/hr Take-Home', which is a mislabelled figure.
- **怎么做**：(A) In app/wages/[slug]/page.tsx generateMetadata, call getSalaryFigures(annual, ENGINE_PROVINCE[...]). Set the title to `${industry} Salary in ${province}: $${hourly}/hr Median, ${netAnnual}/yr Take-Home`. Keep 'Salary' (42 vs 18 impr for 'wage' wording). Move 'Statistics Canada 2025' into the description, and check the longest industry labels still read sensibly.
(B) Add lib/indexableWagePages.ts, shaped like indexableSalaryPages.ts, listing the 48 slugs with per-page impr, clicks and pos in comments, and a note that it is provisional (launched 2026-08-08).
- Add robots {index:false, follow:true} for the rest.
- Filter the wage block in app/sitemap.ts (lines 41-54) through the same function.
- Keep the /wages hub linking all 170 pages.
- Re-derive the list on 2026-10-24 (77 days after launch) from lifetime GSC data, add-only.
- **预期**：About 0 new users. Defensive: template share goes from 79.5% to 69.8% (180/258) at a cost of 0 clicks, lowering doorway risk to the pages behind 88% of calcs.
- **怎么衡量**：Template share 79.5% → 69.8%. Clicks on kept wage pages: baseline 7/28d. Guardrail: '/' 342 and Ontario 359 clicks/28d do not fall.

### #5 · Remove the false 'enter below' copy on hubs, and make hub CTAs open the calculator in the page's province and language via fragment links
- **阶段**：this-week · **谁做**：Claude (repo). The D1 migration needs a D1-scoped token from cf-token-minter, or Travis runs wrangler login. · **工作量**：S for the copy fix; M for the deep links
- **为什么**：Every hub intro says 'Enter your own wage or salary below', but hubs have no inputs; both CTAs go to '/', which opens on Ontario in the browser's language (landing-page-data.ts lines 53, 149, 190, 272, 313, 359, 410, 451, 501, 547). Non-Ontario calcs are 1,320 of 3,734; only 114 of 1,051 sessions change province; /zh has 72 entry sessions. No leak is measured, though: /ontario has ~400 clicks vs 403 entry sessions since 08-11, and non-Ontario hubs plus /fr get only 17 clicks per 28d. Impact is correctness first.
- **怎么做**：(1) Copy fix, zero risk: change every hub intro to point at the calculator button, and check the /fr and /zh equivalents.
(2) Same PR: point provinceGuideLinks (landing-page-data.ts:1069-1070) at /blog/bc-take-home-pay-guide-2026 and /blog/alberta-take-home-pay-guide-2026 (the current targets are 2025 URLs that 301). Remove the doubled brand in the /zh title (app/zh/page.tsx:10); that is hygiene, with no CTR claim.
(3) Deep links: App.tsx reads a fragment (/#province=BC, /#lang=zh; whitelist 13 provinces, 3 modes, 10 languages).
- Apply it only when nothing is saved, then open the calculator and clear it with history.replaceState.
- Add a non-persisting language setter in lib/i18n.tsx; never overwrite canpay_lang.
- The preset must not log an event until the user edits something; otherwise it creates fake BC/$20 rows.
- Do NOT 'fix' the untouched-default guard: a live test showed untouched defaults emit nothing for anonymous visitors.
(4) Point hub CTAs at /#province=XX, the /fr hub at /#province=QC&lang=fr, and /zh at /#lang=zh.
(5) Add a new telemetry column entry_preset (not province_changed, which lib/d1/events.ts:209 reads). Apply the D1 migration to the remote database before the code deploys, because the insert has no try/catch. Log the date in /changelog so the by_province shift is explained.
(6) No IP-region preset.
- **预期**：Low and unproven. Fixes a false promise on the #1 landing page and correct-province and correct-language handoff for ~17 non-Ontario hub clicks/28d plus /zh visitors.
- **怎么衡量**：Calc sessions per GSC click for /ontario entries (proxy baseline ~403 sessions vs ~400 clicks since 08-11). /zh-entry sessions with lang=zh (pull from D1). Province-varied sessions 114/1,051. Ontario share of events 64.6%, annotated as a break.

### #6 · Engine-accuracy sweep: Alberta 'flat 10%', the audit gap that let it through, and the minimum-wage contradictions before Oct 1
- **阶段**：this-week，截止 2026-09-30 · **谁做**：Claude (repo) · **工作量**：S for steps 1-4; M with step 5
- **为什么**：ProvinceComparison.tsx:375 says Alberta has a 'flat 10%' rate, and articles-data.ts:2288 says '10% on all taxable income'. constants.ts:156 has 8% to $61,200, then 10-15%. Both passed the audit, because SURFACE_SOURCES omits ProvinceComparison.tsx and accepted rates are the union of every province's rates. The same gap let through verified minimum-wage study contradictions: Ontario $30,179 in the table vs $30,516 at lines 42 and 52, $14.51 vs $14.67, Nunavut $19.75 (now $20.17), and the same Nunavut figure at llms.txt line 46. Growth is ~0: the province-tax cluster has 354 impr at pos 48.8 with 0% CTR at positions 20-50.
- **怎么做**：(1) Delete the Alberta sentence, or generate it from PROVINCIAL_DATA.AB.brackets (tier count, lowest and highest rate). Take BC's tier count from the array length.
(2) Fix articles-data.ts:2288.
(3) Add src/content/components/ProvinceComparison.tsx to SURFACE_SOURCES (scripts/auditNumbers.ts:511-518), and make rate and take-home checks jurisdiction-specific.
(4) Remove the client <SEO> document.title override ('Compare Canadian Provincial Taxes 2025/2026'), so the page.tsx metadata is the only title.
(5) Before 2026-10-01, once tsx works:
- Regenerate the minimum-wage study with scripts/minwage-takehome.ts using Oct-1 rates, including SK $15.70.
- Regenerate the Oct-1 article's Ontario $31,060 / +$545, which look like figures from before the Ontario Health Premium was added.
- Fix llms.txt line 46.
Later and optional: an engine-rendered 2026 bracket table on /compare-provinces, with footnotes for the Ontario surtax, the health premium and the Quebec abatement.
- **预期**：About 0 new users. Removes live breaches of the engine-only rule on pages and in llms.txt, which AI engines read.
- **怎么衡量**：Audit selftest fails on 'Alberta flat 10%' and on Ontario $30,516. Zero contradicting figures across the study, the Oct-1 article and llms.txt. /compare-provinces kept as the baseline: 4 clicks / 973 impr, pos 34.9.

### #7 · Fix the events route so app POSTs stop failing on schema_version, and add a 'last event per source' alarm
- **阶段**：this-week · **谁做**：Claude (repo) + Travis (App Store Connect, one test calc) · **工作量**：S
- **为什么**：App rows for 08-24..08-27 total 2+31+22+6 = 61, exactly the Supabase backfill. So builds 1.2.0 (live 08-27) and 1.2.1 (live 09-10), which already POST to /api/events, have written 0 rows. The route binds norm(body.schema_version) for every column, the app never sends it, and schema.sql declares it NOT NULL DEFAULT 1. An explicit NULL fails in SQLite (reproduced), and without a try/catch that becomes a 500 the app swallows. Before this, the app was 143 calcs (3.8%) over 31-32 sessions.
- **怎么做**：(a) Claude, no-write probe: POST https://canpayinsights.ca/api/events with UA 'CanPayApp/1.2.1 (iOS)' and body {}. A JSON 400 means the WAF lets the app through. An HTML 403/1010 means add a WAF skip for /api/events and /api/me/*.
(b) app/api/events/route.ts: default schema_version to 1 when absent (or omit null columns), and wrap the insert in try/catch returning a 4xx that names the constraint.
(c) Travis: check App Store Connect → App Analytics for 1.2.x sessions since 08-27.
(d) After deploy, Travis runs one calc on 1.2.1; Claude confirms a source='app' row and sets excluded=1.
(e) Data room: show max(created_at) per source and flag any source silent for 7 days.
No backfill, no special rebuild, no persistent app id. No app promotion until 4 weeks and more than 100 sessions of clean app data.
- **预期**：0 new users. Restores a dead data source (~8 calcs/day in 08-11..08-27) and catches the next silent failure within a day instead of 18.
- **怎么衡量**：source='app' rows per day: baseline 0 since 2026-08-23. Days a source can stay silent before the alarm fires: ≤7.

### #8 · Measure landing views → first calculation for /, Ontario and /zh in the Access-protected cockpit, after fixing the page-tag privacy gap
- **阶段**：next-30-days · **谁做**：Claude drafts code and policy text; Travis approves the wording and deploys the GEO workers · **工作量**：S-M
- **为什么**：The data room counts only sessions that calculated (fake_doors visits 1,051 = sessions 1,051), so drop-off on the three pages behind 88% of entries is invisible. The avowd t.js tag (app/layout.tsx:186, since 2026-08-26) is the only pageview source. For canpay it sends path plus query string and the full external referrer. CanPay's own telemetry promises neither, and PrivacyPolicy.tsx:72 still says 'Vercel Analytics'.
- **怎么做**：(1) Confirm that site=canpay rows are landing in the avowd-analytics D1 since 08-26 (t.js once failed silently for months), and check what is stored.
(2) In GEO/analytics-worker or t.js, for site=canpay only: strip location.search and cut the referrer to hostname. Replace the stale Vercel sentence in components/PrivacyPolicy.tsx:72 with an accurate description; Travis approves the wording.
(3) Add a weekly table in GEO/cockpit-worker /site/canpay (already behind Cloudflare Access and bound to both D1 databases) for /, /ontario-paycheck-calculator and /zh. Columns: GSC clicks, landing sessions (is_bot=0), calc sessions with entry_path=P and referrer_path IS NULL, and the ratio.
- Label the ratio an upper-bound trend, flag cells under 30 as small-n, and add a note that the two sources filter bots differently.
- Do not expose it in the public data room, and do not join at row level.
- **预期**：0 new users directly. It is the only way to judge rank 5 and the deferred inline calculator, and it closes a privacy-disclosure mismatch.
- **怎么衡量**：Weekly landing→calc-session ratio per path (not computable today). Policy text matches what is actually collected.

### #9 · Act on the inspection result: rewrite Alberta (the only hub with demand and thin content), consolidate dead hubs, then request indexing
- **阶段**：next-30-days · **谁做**：Claude (repo) + Travis (Request indexing in the GSC UI) · **工作量**：M
- **为什么**：Alberta calculator-intent queries: 556 impr / 18 clicks per 28d, already served by some other URL ('paycheck calculator alberta' 110 impr, 12 clicks, pos 9.2). The Alberta hub is the one clearly thin page (366 words, 2 FAQs with no figures), while BC is already at Ontario depth (481 vs 496 words) with only 38 impr of demand. /salary-calculator had 1 entry session; timesheet has 0 matching queries. Title format isn't the cause: /quebec-paycheck-calculator uses the old format and has 930 impr.
- **怎么做**：Based on rank 1's coverageState:
- If Alberta is 'Crawled/Discovered - not indexed' or 'Duplicate, Google chose different canonical': rewrite its entry in app/landing-page-data.ts with engine-generated FAQs with figures (as BC has), AB brackets rendered from constants.ts, and Calgary/Edmonton FAQs, all passing the audit. Travis then clicks 'Request indexing' for that URL only.
- If googleCanonical for /salary-calculator or /timesheet-tracker is '/': 301 them to '/' and remove them from the sitemap and relatedLinks.
- Keep /hourly-wage-calculator (hourly queries 1,708 impr) and /cpp-ei-calculator (16 referred calcs). Retitle hourly toward 'hourly to salary' (229 impr) only if it shows as indexed but not served.
- No home link block, no extra hub links (they already exist), and don't retarget permutation CTAs away from '/'.
- If BC/AB come back as duplicates, consider rendering the real calculator preset to the province on those hubs, building on rank 5's fragment presets.
- **预期**：Low: at most about +30-40 clicks per 28d, roughly +3-5 calcs/day
- **怎么衡量**：coverageState flips to indexed; Alberta hub impressions >0 within 28 days of the request (baseline 0 over 114 days); Alberta calculator-intent clicks baseline 18 / 556 impr; Alberta hub entry sessions baseline 0

### #10 · Update 2027 CPP figures on the day CRA publishes the 2027 YMPE/YAMPE
- **阶段**：calendar-dated，截止 2026-10-30 · **谁做**：Claude (repo) · **工作量**：S
- **为什么**：The 2026 YMPE was announced 2025-10-30. The CPP article's $142.20 saving and '2026 ceiling' caveat are estimates until the 2027 YMPE is out, and 2027 'max' queries (305 impr) are asking for exactly that figure. Publishing on release day keeps the page the freshest answer through the Nov-Jan peak. The peak can't be sized because the GSC archive starts 2026-05-22.
- **怎么做**：Set a check (a scheduled routine or Claude reminder) for 2026-10-28..11-06 against canada.ca/CRA 'What's new'. On release:
- Add YMPE/YAMPE 2027 to the 2027 constants block and the audit set first.
- Replace the '2026 ceiling' caveat and recompute the savings rows with the engine.
- If rank 1 showed /cpp-ei-calculator is indexed, add a maximums section there, one row per year (2026 from constants; 2027 official EI plus the new YMPE), with no side-by-side columns and no tax-year switch.
The 2027 audit set also stops the Mon/Thu robot from printing unaudited 2027 numbers.
- **预期**：Low for usage; keeps the site's most-clicked article accurate on the day the query peaks
- **怎么衡量**：Hours from CRA publication to live update (target <24h); clicks on 2027 'max' queries, baseline 7/305 per 28d

### #11 · If the Ontario title test holds, run the same 'Salary' test on home, still without 'Payroll'
- **阶段**：calendar-dated，截止 2026-10-19 · **谁做**：Claude (repo) · **工作量**：S
- **为什么**：'/' has 342 clicks / 37,125 impr at pos 10.4 and converts best (3.71 calcs/session). A home retitle should only happen after the Ontario test shows its guardrail query ('paycheck calculator ontario', 64/980) survives, and it should keep the 639e277 entity fix intact.
- **怎么做**：Read the Ontario test on 2026-10-19, after the Thanksgiving dip on Mon 10-12, comparing within the position band against the control.
- If it passed and guardrails held: change the app/page.tsx title and openGraph.title to 'Canadian Salary & Take-Home Pay Calculator 2026'.
- Demote the brand H1 at App.tsx:576 to a non-heading element and make the H1 descriptive. Don't add a second H1.
- Leave the 10-language taglines alone.
'Payroll' in the home title is a separate test, run only after the next Avowd run confirms AI engines still classify CanPay as an employee calculator.
- **预期**：Low, unproven: probably a few calcs/day at most
- **怎么衡量**：Salary-query CTR on '/' within its position band (baseline from rank 1). Guardrails: 'paycheck calculator' 115/2,315 at pos 5.7 and 'take home pay calculator' 20/994 do not drop.

### #12 · Employer CPP/EI share view, only if GSC shows Canadian employer demand
- **阶段**：longer-term · **谁做**：Claude (repo) · **工作量**：M-L
- **为什么**：Employer-intent queries total 157 impr / 0 clicks (0.8% of payroll impressions). Every CRA-style query ranks 21-34. The bare term ranks 8.5 while 'payroll calculator canada' ranks 20.8, which fits non-Canadian impressions. An on-page panel can't change search CTR, because searchers never see it before clicking.
- **怎么做**：Gate on rank 1: most 'payroll calculator' impressions come from country=can, home is the ranking URL, and employer-intent queries later show page-one volume.
If the gate passes:
- Add a pure function in utils/taxEngine.ts with tests (employer CPP1/CPP2 match, EI × 1.4), with per-period figures from the lib/capTimeline.ts simulation.
- Leave Quebec out of v1.
- Check against T4127/PDOC and run it through the audit.
- Put it behind a collapsed toggle labelled 'Estimated CRA source-deduction remittance' (excludes EHT, HSF and WCB), with one boolean open event.
No home title or description rewrite.
- **预期**：Low; insufficient evidence today
- **怎么衡量**：CA-only CTR for 'payroll calculator' (baseline from rank 1); employer-share opens per week, baseline 0

### #13 · Inline quick calculator on /ontario-paycheck-calculator, only if the funnel panel shows a real leak
- **阶段**：longer-term · **谁做**：Claude (repo) · **工作量**：M
- **为什么**：The #1 search landing page (359 clicks/28d) has no inputs, but ~400 clicks vs 403 entry sessions shows no measurable leak. The page just climbed from pos 17 to 9.2, so layout changes put a winning page at risk. EmbedCalculator as it stands would log source 'widget', record google.com as embed_host, and annualise at 2,080h ($41,600) vs the app's 1,950h ($39,000).
- **怎么做**：Build only if rank 8 shows fewer than 0.7 calc sessions per landing session on /ontario for 3+ weeks. Then:
- Add a variant prop with source 'inline' and embedHost null.
- Log nothing until the user touches it.
- Match the full calculator's hours, or print the assumption.
- Use a fixed-height container so there is no layout shift.
- Use a slug allowlist of ['ontario-paycheck-calculator'], so the NNNN-after-tax pages never get it.
- Leave the H1, intro, FAQ and JSON-LD unchanged.
- **预期**：Unknown until measured
- **怎么衡量**：Full-calculator sessions per GSC click for /ontario entries vs the pre-change ratio; inline-only engagement tracked separately (small-n, ~90 clicks/week)

## 推翻的想法（别再提）

- Fix /zh title/hreflang/add salary table: killed. /zh is already the best page in its position band (1.88% vs 0.89% for peers). The hreflang pair was set deliberately in 7589a6a, and the salary table already exists. Only the doubled brand is real; it is folded into rank 5 as hygiene.
- Freeze salary rollout and re-noindex 43 pages: killed. Zero impressions may just mean the pages haven't been re-indexed yet. There is no demotion signal (site-wide impressions rose every week), the change only moves template share from 79.5% to 76.9%, and the freeze is already in effect.
- Open '/' straight into the calculator: killed. There is no measured leak ('/' has 454 sessions vs 342-405 clicks). The 'last mode restored' premise is false in production, and queries don't favour hourly (45 vs 42 clicks).
- Pin take-home on screen on mobile: killed. Mobile and desktop do the same calcs per session (3.51 vs 3.52). It would deepen existing sessions rather than add users, and bucket dedupe hides the effect anyway.
- Pin & compare share link: killed. The '2 shares' figure counts Stripe coupon mints, not share taps. At ~34 sessions/day, even a 10x lift is a few sessions a week, and the link would carry the wage.
- Widget growth loop: killed. The widget has been live 38 days with 0 third-party embeds, and 9 earlier link asks have 0 logged placements. Separately, the followed keyword-rich widget anchor is a link-spam risk and should become branded and nofollow.
- Gated Chinese section (/zh/ontario and salary page): killed. Visible Chinese Ontario plus 'annual salary X' queries total 64 impr/28d, and /zh already ranks at pos 4-6 with Ontario content, so new URLs would cannibalise it.
- French Quebec real calculator: killed. 'French pages fell' is an artefact of comparing an 86-day window with a 28-day one (the French hub actually rose from 4.7 to 19.4 impr/day). The upside is ~0.9 calcs/day. The real defect is non-reciprocal hreflang (the Quebec page has no fr-CA alternate).
- Hourly/overtime retarget: killed. There is no overtime input (the bucket is derived from the schedule), and overtime queries are 22 impr / 0 clicks. The page's zero impressions is the batch indexing issue handled in ranks 1 and 9.
- Geo-gate the US sister-site card and use the space for hub links: killed. There is no card click data, and the card opens in a new tab below the mode selector. Server-side geo-gating would force dynamic rendering of the top pages and hide the links from US-IP Googlebot.
- Referrer channel on every calculation: killed. The avowd t.js tag already records source and UTM per visit, no non-Google channel has meaningful volume, and the change would contradict the privacy policy (that tag's own privacy gap is handled in rank 8).
- Minimum-wage study refresh plus a prefilled $17.95 link: killed as a growth lever. Minimum-wage queries are 33 impr / 0 clicks, the study produced 0 calcs, and no prefill mechanism exists. Its verified contradictions are a live breach of the engine rule and are folded into rank 6, due by 2026-09-30.
- Press pitches on Oct 1 / OAS / 2027 CPP: killed. The OAS and 2027 CPP quotes are not engine output, and the linked Oct-1 article prints Ontario figures from before the health premium was added. All 6 June pitches are still pending, and articles convert only ~5% of clicks to sessions.
- Reddit/RFD answer kit: killed. The 'hourly majority' is an artefact of the calculator's default mode. The CSV has no hourly or overtime rows, the channel can't be measured, and the playbook already exists (only its stale hand-typed figures need regenerating).
- Xiaohongshu/Zhihu notes: killed. 'zh' means browser locale, and those users already arrive via Google (/zh went from 0.37 to 2.32 clicks/day). The ~+1.6 sessions/day ceiling can't be measured, and Travis's posting time is the bottleneck.
- Get into 'best calculator' roundups: killed. The 22-prompt set is already in use (36.4% = 16/44). Two of the June asks were exactly this and are still pending, and there is no link from roundups to calcs.
- IndexNow ping plus Bing Webmaster Tools: killed as already done. The article routine pings IndexNow on publish (HTTP 200 on 2026-09-14), and Bing Webmaster Tools was imported from GSC on 2026-07-02.
- Build the 2027 engine before Jan 1: excluded because no verification verdict came back. It is calendar-critical (T4127-JAN around Nov 20; 2025 queries got 0 clicks against 2026 titles), so resubmit it for verification by mid-October.
- Drive the Mon/Thu robot from a dated calendar: excluded, no verification verdict. Resubmit; the rank 3 and 10 audit sets already stop it printing unaudited 2027 figures.
- Refresh the RRSP article by late January: excluded, no verification verdict. The archive has 0 RRSP queries (it doesn't cover RRSP season), so resubmit in December.
- Post TikTok clips Tue-Thu 15:00-18:00 ET: excluded, no verification verdict. Also, the clips built 2026-08-13 print $60,744 for Ontario at $80k, which predates the 09-02 health-premium fix, so they need regenerating before any posting.

## 未核完（额度中断）
- 2027 税年切换（11 月下旬 T4127 一出就要做；10 月中重新核查排期）
- 机器人文章按薪酬日历排期
- RRSP 文章 1 月底前刷新
- TikTok 发布时间（先重生成，片里安省 $60,744 是健康保费修正前的数）
- 进「最佳计算器」榜单

## 查漏结果
- 缺口：Anonymised queries are never mentioned. gsc_queries_28d_all.json adds up to 543 clicks / 49,339 impr, but gsc_daily_all.json shows 880 / 80,113 for the same 28 days. About 38% of clicks have no query attached, so every query-level CTR baseline (ranks 2, 9, 11, 12) covers only ~62% of traffic. Rank 1(b)'s query x page x country pull will drop the same rows.
- 缺口：Bing was never read. The plan kills 'IndexNow + BWT' as already done, but never pulls Bing Webmaster Tools performance data, even though it was imported on 2026-07-02. ChatGPT search draws on Bing's index and the ChatGPT mention rate is 0%. No ranked item works on AI-engine visibility except accuracy fixes (rank 6's llms.txt).
- 缺口：Off-site channel volume is asserted, not measured. The claim 'no non-Google channel has meaningful volume' (referrer kill) quotes no number, and no file in the room holds avowd t.js source/UTM data. Pull t.js sources (chatgpt.com, perplexity.ai, bing, reddit) before killing any channel.
- 缺口：The biggest dated item is not ranked. The 2027 tax-year switch (T4127-JAN edition) is only 'excluded, no verdict'. Every calculator title and description says 2026, and the '2026' query cluster is 515 impr / 28d (gsc_queries_28d_all). It needs a ranked slot with a date, not a resubmit note.
- 缺口：Recent site changes are not annotated as confounders in the measurement plan. c43888b (09-10) changed the engine's BC rate and PEI threshold, so figures in titles and snippets moved. 24ed289 (09-10) resized the US sister card on home. 9f8eef4 (09-13) put an outbound target=_blank Wealthsimple referral under the deductions on every landing page and in the calculator. That last one lands while rank 2 and rank 5 baselines are being set.
- 缺口：No retention or return-use lens. intent.json cadence is 16 / 5 / 1 returns, active_users_30d is 22, and accounts.json shows 18 registered (all small-n). Say 'insufficient evidence' explicitly rather than skip it.
- 缺口：Data files the plan never cites: candles.json, income_barometer.json, industry_income.json, comp_structure.json, crosstab.json, prov_bracket.json, cities_geo.json, devices.json, accounts.json, gsc_queries_before.json, plus most of stats_extra.json (shift start, browser, age, work arrangement).
- 缺口：Owner and bot traffic is not sanity-checked beyond the 17 excluded rows. Suspicious cells: Greater Sudbury 69 calcs (stats.json by_city); /about entry 5 sessions / 27 calcs and /affiliate-disclosure 1 session / 8 calcs (entry_paths.json); /changelog as referrer 18 calcs and /insights-Mi9kcqgRDRCM 1 entry session (referrer_paths.json and entry_paths.json).
- 缺口：Template share is counted on the sitemap only. gsc_pages_28d.json has 88 URLs outside the sitemap that still get impressions (600 impr, 0 clicks). They include /fr/70000-apres-impot-quebec (86), /fr/150000-apres-impot-quebec (72) and /40000-after-tax-bc (68). In total 167 salary-template URLs have impressions, against 132 in the sitemap. Rank 4's 79.5% → 69.8% metric understates what Google sees.
- 缺口：URL Inspection access is unverified. ~/.canpay-secrets/gsc-service-account.json exists and scripts/archiveGsc.py:60 uses webmasters.readonly, but nobody confirmed the service account's permission level on the property. Rank 1 depends on it.
- 缺口：The t.js privacy check is unverified. Rank 8 says to 'check what is stored' in avowd-analytics, but its is_bot filter implies user-agent inspection. Whether it stores IP or the full UA (a hard red line) was not checked; the GEO repo is out of scope here.
- 缺口：Alternative explanations and channels never considered: SERP features or AI Overviews as a cause of 'payroll calculator' CTR of 0.26% (46/17,668 at pos 8.5); mobile page experience / Core Web Vitals, although 72% of calcs are mobile (2,688/3,734, stats.json); iOS App Store search (ASO); Chinese AI engines (all 5 'not found' while zh is 513/3,734 calcs and zh Google queries are 218 impr/28d — insufficient evidence, but unexamined).
- 缺口：/salary-after-tax-canada is unexamined. It fell from 912 impr (pos 57.7, 86-day before-export) to 48 impr (pos 22.9, 28d) in gsc_pages_*.json.
- 缺口：The daily baseline is stale. The plan uses ~104 calcs/day, but stats.json last_7d is 873 and web rows for 09-08..09-14 total 866 (daily_by_source.json). Series 09-13 = 135 and 09-14 = 171 are not folded into the dip/recovery reading.
- 更正：The north-star 'calcs' and 'calc sessions' are contaminated from 2026-09-13. PartnerSlot's onClick calls recordCalcEvent, so each click writes a normal events row: in App.tsx it duplicates the user's inputs, and on every /[slug] salary page it writes mode 'annual', lang 'en' with the page's amount. calcStats counts total = every non-excluded row (lib/d1/events.ts:108) and does not filter product_interest. A referral click on a salary page therefore creates a 'calc session' with that entry_path, and the 5 offer-compare fake-door clicks are already inside 3,734. Readouts must exclude product_interest rows. Ranks 5, 8 and 13 and the entry-session baselines are affected.
- 更正：Privacy red-line and disclosure gap that rank 8 does not cover. app/api/events/route.ts stores raw cf.latitude and cf.longitude per event, unrounded (cloudflare/schema.sql:10 'lat real, lon real'), while components/PrivacyPolicy.tsx says location is 'country, region, and city only'. The route also stores browser, os_family and device_brand, but the policy says 'device type (phone, tablet, or computer)'. Round or drop lat/lon at write time (reporting already rounds, events.ts:337) and fix the policy in the same PR as rank 8.
- 更正：Rank 3 overstates how official the 2027 EI numbers are. The canada.ca rates2027 page (modified 2026-09-14) gives $1.64 as the Senior Actuary's forecast 7-year break-even rate; it does not say the Commission has set the rate. MIE $70,800 is firm. Before $1.64, $1,161.12, $1.29 or $913.32 go into constants or the audit set as final, confirm the Commission's rate-setting release, or label them as the forecast rate.
- 更正：Headline 2 compares mismatched windows. gsc_pages_before.json covers 86 days (05-22..08-15: daily sum 409 clicks), but '/' 63 → 342 and Ontario 215 → 359 are set against 28-day figures. The plan kills the French item for exactly this artefact. Per 28 days it is about 20 → 342 for '/' and about 70 → 359 for Ontario. The direction holds; the numbers as printed are wrong.
- 更正：Internal contradiction on channel measurement. Headline 1 says 'no off-site channel can be measured', while the killed referrer item says 'the avowd t.js tag already records source and UTM per visit'.
- 更正：Rank 9's 'hourly queries 1,708 impr' matches no stated window. The 28d export gives 1,024 impr / 43 clicks for queries containing 'hourly'; all-time gives 1,658. State the window.
- 更正：Rank 12's employer-intent total of 157 impr is understated. Adding 'payroll deduction(s) calculator', 'payroll remittance calculator' and 'small business payroll calculator' gives 347 impr / 0 clicks over 92 queries (pos 22-50) in the 28d export. The conclusion still holds.
- 更正：Position figures disagree between files. gsc.json near_miss has 'salary calculator canada' at pos 16.1; gsc_queries_28d_all.json has pos 9.9, and gsc_queries_28d.json shows it on only 21 of 29 days. Ranks 2 and 11 test CTR 'within a position band' and must name the aggregation used.
- 更正：The content window is wrong. Headline 2's 'Articles produced 55 calcs across 44 articles in 90d' is really about 35 days: content.json entry_tracking_started is 2026-08-11. Its own figures also show 86 of the 102 '90-day' blog clicks fell in the last 28 days.
- 更正：Rank 5's '~400 clicks vs 403 entry sessions since 08-11' cannot be checked from the room. There is no page x day GSC file. The Ontario page export is 359 clicks for 08-16..09-12, while the 403 entry sessions run 08-11..09-15. The claimed 'no leak' rests on mismatched windows.

## 衡量方法

PRECONDITIONS (before any code push):
(1) Restore the local toolchain.
- Run `find /Users/travis/Documents/Vibe_Coding/CanPay-Insights/node_modules -type f -flags +dataless`, then `brctl download` each file and re-run find until it returns nothing. Run `npm ci` only if the whole folder was moved out.
- Then `npm run audit:numbers:selftest && npm run audit:numbers` must pass locally. The CI deploy runs the same audit, and a red push blocks the Mon/Thu robot articles too.
(2) Always `git fetch && git merge origin/main` before pushing. The robot pushes around 16:15 UTC Mon/Thu, and deploying an old tree 404s its articles.

NORTH STAR:
- Weekly calc sessions and calcs (series.json; week of 09-07 = 774 calcs / 217 visitors; peak week 08-24 = 941 / 284).
- GSC clicks per 28d (867; previous 28d 331).
- Report both every Monday after the robot run, from D1 (excluded=0) plus the GSC API.

ATTRIBUTION RULES:
- Change one variable per page and date every change in /changelog.
- Never overlap two tests on the same URL.
- Site-wide impressions/day grew 4.8x (595 → 2,861), so no raw before/after comparisons. Compare CTR within a position band against a same-period control query set.
- Do not judge anything across Thanksgiving (Mon 2026-10-12), Dec 24-Jan 1, Family Day (2027-02-15) or Good Friday. Labour Day Saturday ran at 0.38 of its week's mean.
- Label any cell with n<30 as small-n. Only '/' and /ontario have weekly entry volumes worth reading.

PER-ITEM BASELINES AND READOUTS:
- Rank 1: coverageState for the 6 hubs plus 2 controls; CA share of 'payroll calculator' impressions; which URL owns the Ontario salary queries. Result this week.
- Rank 2: Ontario salary-calculator CTR at pos 9-11 = 0.69% (29/4,201); control Ontario take-home 1.33% (23/1,727). Success ≥1.0%. Revert if 'paycheck calculator ontario' (64/980, pos 5.6) drops below pos 7 or under 4% CTR. Readout 2026-10-19.
- Rank 3: article CTR 1.53% (42/2,747); 2027 CPP/EI queries 10 clicks / 748 impr; 'max' 7/305. Readout 2026-10-15.
- Rank 4: template share 79.5% → 69.8%; kept wage-page clicks 7/28d. Guardrail: '/' 342 and Ontario 359 clicks/28d. Re-derive the list 2026-10-24.
- Rank 5: /ontario entry sessions per GSC click (~403 vs ~400 since 08-11); lang=zh share of /zh entries (pull from D1); province-varied sessions 114/1,051. The Ontario share of 64.6% will break at the deploy date; annotate it.
- Rank 6: audit selftest must fail on 'Alberta flat 10%' and Ontario $30,516; zero contradicting minimum-wage figures by 2026-09-30.
- Rank 7: source='app' rows/day, baseline 0 since 2026-08-23; the silent-source alarm fires at 7 days.
- Rank 8: weekly landing→calc-session ratio for /, /ontario and /zh as an upper-bound trend (session ids differ, bot filters differ). /zh weekly is small-n (~14).
- Rank 9: Alberta hub impressions >0 within 28 days of the indexing request (baseline 0 over 114 days); Alberta calculator-intent clicks 18 / 556 impr.
- Rank 10: hours from CRA's YMPE release to live update (<24h); watch window 2026-10-28..11-06.

SOURCES:
- GSC API via the service account (query×page×country, date×page, URL Inspection).
- D1 canpay events (excluded=0; source; entry_path; referrer_path IS NULL for landing sessions).
- avowd-analytics landing sessions (is_bot=0), only after the rank 8 privacy fix.
- App Store Connect for app usage.

HONESTY GUARDRAIL: the combined realistic upside of ranks 2, 5, 9 and 11 is single-digit calcs/day against ~104/day. Report results as measured deltas with windows and n; never present the self-selected sample as national statistics.

## 2026-09-15 已执行
- GSC 诊断（docs/gsc-diagnostics-2026-09-15.md）：6 个零曝光页 = 3 个 Google 未知 + 3 个发现未收录；payroll calculator 曝光 99.9% 加拿大；安省年薪查询落在安省页
- 首页页脚加计算器链接行；安省页标题加 Salary & Hourly；首页描述加 payroll deductions；IndexNow 已 ping 6 页
- App 事件写入修复（schema_version 默认值 + 422 报错）；点击型事件不再计入计算数
- 经纬度写入与存量均截到 1 位小数；隐私政策改为如实描述
- Alberta「flat 10%」两处改正；ProvinceComparison 纳入数字审计
