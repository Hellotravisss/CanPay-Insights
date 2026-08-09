/**
 * Salary-permutation pages allowed back into the index.
 *
 * BACKGROUND
 *   All 378 `$X-after-tax-<province>` pages were set to noindex in June 2026 to
 *   satisfy an AdSense review that flagged them as thin, templated pages.
 *   AdSense was abandoned for good in July, so the only reason for the block is
 *   gone — but releasing all 378 at once would recreate the doorway-page risk
 *   that made the complaint reasonable in the first place.
 *
 * HOW THIS LIST WAS CHOSEN
 *   Not by guessing which salaries look popular. Every page below earned real
 *   Search Console impressions WHILE NOINDEXED — measured demand, not a hunch.
 *
 *   Batch 1 (2026-08-08): >= 30 impressions over 77 days. 89 pages, 87% of all
 *   impressions the permutation set received.
 *   Batch 2 (2026-08-09): 15-29 impressions. 43 more pages carrying 53% of what
 *   was left (905 of 1,720). Several already rank on page one despite the block
 *   — 75000-after-tax-new-brunswick at 4.2, 90000-after-tax-pei at 4.3.
 *
 *   Cumulative: 132 pages, 94% of measured impressions. The remaining 129 pages
 *   averaged under 11 impressions each in 77 days and stay blocked; releasing
 *   them would add pages without adding demand, which is exactly the pattern
 *   that got the set flagged in the first place.
 *
 *   ⚠️ Read from the NON-www property (https://canpayinsights.ca/). The www
 *   property is also verified but holds almost nothing — 3 salary pages versus
 *   262 — so querying it makes the whole set look like it has no demand.
 *
 *   Several already rank on page one despite the block: 70000-after-tax-
 *   saskatchewan at 4.1, 70000-after-tax-manitoba at 4.4, 58000-after-tax-
 *   alberta at 4.9.
 *
 * MAINTENANCE
 *   Re-derive from the archive rather than editing by hand:
 *     select replace(page,'https://canpayinsights.ca/','')
 *     from gsc_pages where page ~ '/[0-9]+-after-tax-'
 *     group by page having sum(impressions) >= 30;
 *   Expand the list only after a released batch has been indexed cleanly for a
 *   few weeks — a slow ramp is what keeps this from reading as bulk generation.
 */
export const INDEXABLE_SALARY_PAGES = new Set<string>([
  '65000-after-tax-ontario', // 1365 impr, pos 9.5
  '52000-after-tax-ontario', // 876 impr, pos 7.5
  '70000-after-tax-alberta', // 433 impr, pos 8.3
  '120000-after-tax-alberta', // 348 impr, pos 9.6
  '72000-after-tax-ontario', // 341 impr, pos 7.8
  '100000-after-tax-ontario', // 335 impr, pos 8.8
  '68000-after-tax-ontario', // 310 impr, pos 5.7
  '95000-after-tax-ontario', // 280 impr, pos 7.4
  '78000-after-tax-ontario', // 247 impr, pos 9.9
  '80000-after-tax-ontario', // 229 impr, pos 5.8
  '85000-after-tax-ontario', // 209 impr, pos 6.2
  '175000-after-tax-ontario', // 206 impr, pos 9.8
  '58000-after-tax-ontario', // 192 impr, pos 10.5
  '78000-after-tax-bc', // 188 impr, pos 6.9
  '110000-after-tax-alberta', // 172 impr, pos 9.6
  '80000-after-tax-nova-scotia', // 160 impr, pos 8.4
  '48000-after-tax-alberta', // 155 impr, pos 5.3
  '68000-after-tax-bc', // 154 impr, pos 8.5
  '72000-after-tax-bc', // 152 impr, pos 10.6
  '68000-after-tax-alberta', // 152 impr, pos 6.7
  '130000-after-tax-alberta', // 147 impr, pos 9.6
  '130000-after-tax-ontario', // 147 impr, pos 7.3
  '110000-after-tax-bc', // 144 impr, pos 9.8
  '58000-after-tax-alberta', // 141 impr, pos 4.9
  '62000-after-tax-alberta', // 141 impr, pos 6.8
  '52000-after-tax-alberta', // 136 impr, pos 9.3
  '58000-after-tax-bc', // 131 impr, pos 9.4
  '130000-after-tax-bc', // 127 impr, pos 8.5
  '55000-after-tax-alberta', // 125 impr, pos 7.1
  '65000-after-tax-bc', // 123 impr, pos 8.8
  '78000-after-tax-alberta', // 115 impr, pos 8.5
  '85000-after-tax-quebec', // 109 impr, pos 9.6
  '65000-after-tax-nova-scotia', // 104 impr, pos 9.2
  '72000-after-tax-alberta', // 94 impr, pos 7.6
  '85000-after-tax-nova-scotia', // 93 impr, pos 9.0
  '62000-after-tax-ontario', // 93 impr, pos 6.4
  '62000-after-tax-bc', // 87 impr, pos 9.7
  '72000-after-tax-quebec', // 87 impr, pos 10.1
  '200000-after-tax-ontario', // 85 impr, pos 9.0
  '45000-after-tax-ontario', // 81 impr, pos 10.5
  '55000-after-tax-ontario', // 80 impr, pos 11.4
  '150000-after-tax-bc', // 80 impr, pos 8.8
  '75000-after-tax-alberta', // 80 impr, pos 10.2
  '95000-after-tax-alberta', // 77 impr, pos 10.3
  '175000-after-tax-bc', // 71 impr, pos 8.5
  '175000-after-tax-alberta', // 68 impr, pos 8.9
  '75000-after-tax-ontario', // 67 impr, pos 7.7
  '70000-after-tax-pei', // 66 impr, pos 6.0
  '78000-after-tax-quebec', // 64 impr, pos 7.6
  '55000-after-tax-nova-scotia', // 63 impr, pos 9.6
  '70000-after-tax-manitoba', // 62 impr, pos 4.4
  '52000-after-tax-bc', // 62 impr, pos 8.4
  '58000-after-tax-quebec', // 62 impr, pos 7.8
  '48000-after-tax-bc', // 61 impr, pos 9.8
  '45000-after-tax-bc', // 59 impr, pos 7.0
  '62000-after-tax-quebec', // 58 impr, pos 7.8
  '55000-after-tax-bc', // 57 impr, pos 8.8
  '70000-after-tax-quebec', // 57 impr, pos 6.8
  '35000-after-tax-bc', // 55 impr, pos 8.0
  '110000-after-tax-ontario', // 51 impr, pos 9.6
  '110000-after-tax-nova-scotia', // 49 impr, pos 8.4
  '95000-after-tax-quebec', // 49 impr, pos 7.3
  '120000-after-tax-quebec', // 49 impr, pos 7.9
  '80000-after-tax-northwest-territories', // 48 impr, pos 9.8
  '80000-after-tax-manitoba', // 48 impr, pos 7.2
  '120000-after-tax-new-brunswick', // 47 impr, pos 7.9
  '120000-after-tax-nova-scotia', // 46 impr, pos 9.3
  '72000-after-tax-manitoba', // 46 impr, pos 7.7
  '175000-after-tax-quebec', // 45 impr, pos 10.7
  '200000-after-tax-manitoba', // 44 impr, pos 9.3
  '55000-after-tax-manitoba', // 44 impr, pos 7.1
  '65000-after-tax-new-brunswick', // 44 impr, pos 5.7
  '52000-after-tax-saskatchewan', // 43 impr, pos 6.9
  '68000-after-tax-quebec', // 43 impr, pos 8.9
  '62000-after-tax-nova-scotia', // 43 impr, pos 6.9
  '150000-after-tax-quebec', // 42 impr, pos 8.8
  '68000-after-tax-nova-scotia', // 39 impr, pos 6.1
  '70000-after-tax-yukon', // 38 impr, pos 6.2
  '75000-after-tax-nova-scotia', // 37 impr, pos 10.5
  '72000-after-tax-saskatchewan', // 37 impr, pos 5.8
  '48000-after-tax-manitoba', // 36 impr, pos 8.0
  '120000-after-tax-manitoba', // 35 impr, pos 7.6
  '75000-after-tax-saskatchewan', // 35 impr, pos 10.5
  '70000-after-tax-saskatchewan', // 35 impr, pos 4.1
  '45000-after-tax-alberta', // 33 impr, pos 7.3
  '35000-after-tax-nova-scotia', // 33 impr, pos 9.7
  '72000-after-tax-nova-scotia', // 33 impr, pos 9.1
  '58000-after-tax-saskatchewan', // 31 impr, pos 8.1
  '100000-after-tax-manitoba', // 30 impr, pos 8.2

  // ---- Batch 2 (2026-08-09): 15-29 impressions while noindexed ----
  '130000-after-tax-saskatchewan', // 29 impr, pos 5.8
  '35000-after-tax-alberta', // 29 impr, pos 9.7
  '50000-after-tax-nova-scotia', // 29 impr, pos 7.9
  '75000-after-tax-manitoba', // 29 impr, pos 8.3
  '85000-after-tax-bc', // 29 impr, pos 7.8
  '200000-after-tax-bc', // 28 impr, pos 9.9
  '70000-after-tax-northwest-territories', // 28 impr, pos 6.2
  '90000-after-tax-saskatchewan', // 28 impr, pos 5.9
  '150000-after-tax-ontario', // 27 impr, pos 7.0
  '48000-after-tax-saskatchewan', // 27 impr, pos 8.1
  '200000-after-tax-alberta', // 25 impr, pos 12.6
  '52000-after-tax-nunavut', // 24 impr, pos 5.8
  '75000-after-tax-new-brunswick', // 24 impr, pos 4.2
  '100000-after-tax-saskatchewan', // 23 impr, pos 5.1
  '40000-after-tax-ontario', // 23 impr, pos 11.8
  '75000-after-tax-pei', // 23 impr, pos 5.2
  '48000-after-tax-quebec', // 22 impr, pos 8.3
  '95000-after-tax-manitoba', // 22 impr, pos 6.9
  '175000-after-tax-nova-scotia', // 21 impr, pos 8.9
  '78000-after-tax-manitoba', // 21 impr, pos 7.4
  '130000-after-tax-manitoba', // 20 impr, pos 8.7
  '90000-after-tax-pei', // 20 impr, pos 4.3
  '68000-after-tax-saskatchewan', // 19 impr, pos 8.5
  '40000-after-tax-manitoba', // 19 impr, pos 5.5
  '60000-after-tax-newfoundland', // 19 impr, pos 4.2
  '80000-after-tax-nunavut', // 19 impr, pos 6.4
  '85000-after-tax-manitoba', // 18 impr, pos 6.5
  '130000-after-tax-new-brunswick', // 18 impr, pos 9
  '200000-after-tax-nova-scotia', // 18 impr, pos 9.9
  '48000-after-tax-newfoundland', // 18 impr, pos 8.2
  '62000-after-tax-saskatchewan', // 18 impr, pos 7.7
  '95000-after-tax-new-brunswick', // 18 impr, pos 6
  '58000-after-tax-manitoba', // 16 impr, pos 5.9
  '48000-after-tax-ontario', // 16 impr, pos 12.1
  '100000-after-tax-nova-scotia', // 16 impr, pos 8.7
  '55000-after-tax-new-brunswick', // 16 impr, pos 10.6
  '65000-after-tax-newfoundland', // 16 impr, pos 7.4
  '110000-after-tax-saskatchewan', // 15 impr, pos 8.9
  '150000-after-tax-alberta', // 15 impr, pos 8.7
  '52000-after-tax-yukon', // 15 impr, pos 5.5
  '58000-after-tax-new-brunswick', // 15 impr, pos 8.9
  '62000-after-tax-manitoba', // 15 impr, pos 8.9
  '72000-after-tax-pei', // 15 impr, pos 3.1
]);

/** A permutation page is one whose slug starts with a digit. */
export const isSalaryPermutation = (slug: string) => /^\d/.test(slug);

/** Permutation pages are noindex unless they are on the measured-demand list. */
export const isIndexable = (slug: string) =>
  !isSalaryPermutation(slug) || INDEXABLE_SALARY_PAGES.has(slug);
