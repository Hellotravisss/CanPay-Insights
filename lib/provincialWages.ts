// Median HOURLY wage of full-time employees, by industry and province.
// Source: Statistics Canada Table 14-10-0064-01 "Employee wages by industry,
// annual", reference year 2025, downloaded from the StatCan Web Data Service.
// These are OFFICIAL figures, not estimates — do not hand-edit; refresh from the
// same table (the semi-annual benchmark routine does this).

export const WAGE_DATA_YEAR = '2025';

export const PROVINCE_LABELS: Record<string, string> = {
  CA: 'Canada',
  NL: 'Newfoundland and Labrador',
  PE: 'Prince Edward Island',
  NS: 'Nova Scotia',
  NB: 'New Brunswick',
  QC: 'Quebec',
  ON: 'Ontario',
  MB: 'Manitoba',
  SK: 'Saskatchewan',
  AB: 'Alberta',
  BC: 'British Columbia',
};

export const INDUSTRY_LABELS: Record<string, string> = {
  'all-industries': 'All industries',
  'utilities': 'Utilities',
  'resources': 'Forestry, fishing, mining, oil & gas',
  'public-admin': 'Public administration',
  'professional': 'Professional, scientific & technical services',
  'finance': 'Finance, insurance & real estate',
  'education': 'Educational services',
  'construction': 'Construction',
  'manufacturing': 'Manufacturing',
  'healthcare': 'Healthcare & social assistance',
  'transportation': 'Transportation & warehousing',
  'arts-media': 'Information, culture & recreation',
  'support-services': 'Business & support services',
  'agriculture': 'Agriculture',
  'other-services': 'Other services',
  'retail': 'Wholesale & retail trade',
  'food-hospitality': 'Food service & hospitality',
};

// [industry slug][province code] = median hourly wage, full-time employees.
export const PROVINCIAL_WAGES: Record<string, Record<string, number>> = {
  'all-industries': { CA: 33.65, NL: 30.07, PE: 28.21, NS: 29.8, NB: 28.85, QC: 33.0, ON: 34.62, MB: 28.74, SK: 31.25, AB: 34.97, BC: 35.0 },
  'utilities': { CA: 53.37, NL: 51.0, PE: 43.27, NS: 45.05, NB: 46.15, QC: 53.11, ON: 56.0, MB: 46.15, SK: 46.0, AB: 56.0, BC: 51.63 },
  'resources': { CA: 47.0, NL: 50.0, PE: 22.61, NS: 25.0, NB: 28.46, QC: 40.0, ON: 43.0, MB: 43.0, SK: 50.0, AB: 52.88, BC: 45.0 },
  'public-admin': { CA: 44.71, NL: 38.46, PE: 39.49, NS: 41.21, NB: 39.0, QC: 42.0, ON: 48.0, MB: 41.36, SK: 42.0, AB: 45.67, BC: 45.0 },
  'professional': { CA: 43.27, NL: 39.38, PE: 35.65, NS: 38.46, NB: 34.0, QC: 40.0, ON: 46.15, MB: 35.0, SK: 38.46, AB: 41.81, BC: 43.78 },
  'finance': { CA: 38.46, NL: 30.77, PE: 29.47, NS: 32.05, NB: 30.0, QC: 38.46, ON: 41.03, MB: 32.97, SK: 33.85, AB: 38.15, BC: 38.0 },
  'education': { CA: 41.76, NL: 40.87, PE: 34.62, NS: 39.42, NB: 33.65, QC: 43.79, ON: 44.18, MB: 35.38, SK: 39.23, AB: 40.46, BC: 40.0 },
  'construction': { CA: 36.0, NL: 30.4, PE: 28.0, NS: 28.21, NB: 28.85, QC: 38.0, ON: 35.19, MB: 30.0, SK: 32.0, AB: 37.0, BC: 37.5 },
  'manufacturing': { CA: 31.0, NL: 26.0, PE: 24.0, NS: 28.0, NB: 26.11, QC: 31.61, ON: 30.0, MB: 27.0, SK: 32.66, AB: 32.0, BC: 35.0 },
  'healthcare': { CA: 30.85, NL: 28.85, PE: 32.0, NS: 32.0, NB: 28.41, QC: 29.0, ON: 32.91, MB: 27.0, SK: 28.05, AB: 30.0, BC: 33.33 },
  'transportation': { CA: 30.46, NL: 30.0, PE: 26.0, NS: 28.85, NB: 26.44, QC: 29.0, ON: 30.0, MB: 28.75, SK: 30.0, AB: 34.2, BC: 34.0 },
  'arts-media': { CA: 34.19, NL: 30.0, PE: 22.0, NS: 29.0, NB: 29.0, QC: 35.0, ON: 35.58, MB: 27.97, SK: 31.5, AB: 30.0, BC: 38.46 },
  'support-services': { CA: 25.0, NL: 22.51, PE: 20.0, NS: 21.0, NB: 22.0, QC: 25.0, ON: 25.0, MB: 21.0, SK: 21.0, AB: 25.26, BC: 27.5 },
  'agriculture': { CA: 24.14, NL: 21.37, PE: 20.0, NS: 20.0, NB: 21.0, QC: 24.0, ON: 23.0, MB: 24.0, SK: 28.0, AB: 29.1, BC: 25.0 },
  'other-services': { CA: 28.57, NL: 25.0, PE: 22.0, NS: 27.0, NB: 26.0, QC: 30.0, ON: 28.0, MB: 24.25, SK: 27.5, AB: 28.85, BC: 30.0 },
  'retail': { CA: 25.0, NL: 21.4, PE: 21.0, NS: 22.0, NB: 22.5, QC: 25.0, ON: 25.64, MB: 24.0, SK: 24.61, AB: 26.92, BC: 26.44 },
  'food-hospitality': { CA: 20.0, NL: 17.75, PE: 18.0, NS: 18.0, NB: 18.0, QC: 21.0, ON: 20.0, MB: 17.0, SK: 17.0, AB: 18.0, BC: 22.0 },
};

/** Annualised at 2,080 hours (40 h/week, 52 weeks) — the same basis the site uses. */
export function annualFromHourly(hourly: number): number {
  return Math.round((hourly * 2080) / 100) * 100;
}
