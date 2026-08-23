/**
 * Landing guide for the Province Move Report: what to do after the move —
 * health card, licence, spouse's job search, kids' schools, and who helps.
 *
 * DATA RULE (same as everywhere on this site): only stable, verifiable facts —
 * the NAMES of official bodies and their entry points. No waiting periods,
 * fee amounts, or deadlines are printed, because those change and we refuse
 * to print a number the reader could act on and find stale. Where a deadline
 * exists (licence exchange, health-card wait), the guide says "check with X",
 * with X named precisely.
 */

export type ProvinceLanding = {
  health: string;        // public health-insurance plan + where to apply
  licence: string;       // driver's licence / vehicle registration body
  jobs: string;          // provincial career/employment service (spouse's search)
  schoolNote?: string;   // province-specific schooling note (only where real)
};

export const LANDING: Record<string, ProvinceLanding> = {
  'Alberta': {
    health: 'AHCIP — Alberta Health Care Insurance Plan; apply in person at a registry agent office',
    licence: 'Alberta registry agents (licence exchange and vehicle registration)',
    jobs: 'alis.alberta.ca — Alberta Supports career and employment services',
  },
  'British Columbia': {
    health: 'MSP — Medical Services Plan; enrol online via Health Insurance BC',
    licence: 'ICBC driver licensing offices',
    jobs: 'WorkBC centres',
  },
  'Manitoba': {
    health: 'Manitoba Health card; register with Manitoba Health, Seniors and Long-Term Care',
    licence: 'Manitoba Public Insurance (MPI) service centres',
    jobs: 'Manitoba Jobs and Skills Development Centres',
  },
  'New Brunswick': {
    health: 'New Brunswick Medicare; register through Service New Brunswick',
    licence: 'Service New Brunswick centres',
    jobs: 'WorkingNB',
  },
  'Newfoundland and Labrador': {
    health: 'MCP — Medical Care Plan; apply through the Department of Health and Community Services',
    licence: 'Motor Registration Division (Digital Government and Service NL)',
    jobs: 'Employment centres via the Department of Immigration, Population Growth and Skills',
  },
  'Nova Scotia': {
    health: 'MSI — Medical Services Insurance; register by phone with MSI',
    licence: 'Access Nova Scotia (Registry of Motor Vehicles)',
    jobs: 'Nova Scotia Works employment centres',
  },
  'Ontario': {
    health: 'OHIP — apply in person at a ServiceOntario centre',
    licence: 'ServiceOntario (licence exchange) and DriveTest centres',
    jobs: 'Employment Ontario',
  },
  'Prince Edward Island': {
    health: 'PEI Health Card; apply through Health PEI',
    licence: 'Access PEI locations',
    jobs: 'WorkPEI and SkillsPEI programs',
  },
  'Quebec': {
    health: 'RAMQ — Régie de l’assurance maladie du Québec; register on arrival',
    licence: 'SAAQ — Société de l’assurance automobile du Québec',
    jobs: 'Services Québec local offices (job search and training)',
    schoolNote:
      'Public instruction in Quebec is in French by default; eligibility for English public school is certificate-based — ask the school board about a certificate of eligibility before choosing a neighbourhood.',
  },
  'Saskatchewan': {
    health: 'Saskatchewan Health Card, issued by eHealth Saskatchewan',
    licence: 'SGI motor licence issuers',
    jobs: 'saskjobs.ca and Labour Market Services offices',
  },
  'Northwest Territories': {
    health: 'NWT Health Care Plan; register with the Department of Health and Social Services',
    licence: 'Department of Infrastructure driver and vehicle services',
    jobs: 'ECE Regional Service Centres (Education, Culture and Employment)',
  },
  'Nunavut': {
    health: 'Nunavut Health Care Plan; register with the Department of Health',
    licence: 'Motor Vehicles Division, Department of Economic Development and Transportation',
    jobs: 'Department of Family Services career development offices',
  },
  'Yukon': {
    health: 'Yukon Health Care Insurance Plan; register with Insured Health Services',
    licence: 'Motor Vehicles, Department of Highways and Public Works',
    jobs: 'Yukon government Employment Central (Whitehorse)',
  },
};

/** Steps that are true in every province — the order of operations. */
export const FIRST_WEEKS: { title: string; body: (to: string) => string }[] = [
  {
    title: 'Health coverage first',
    body: (to) =>
      `Register for ${LANDING[to]?.health ?? 'the provincial health plan'} as soon as you have an address. Some provinces impose a waiting period before coverage starts — ask when you register, and keep your old province's coverage (or private travel coverage) until the new card is active.`,
  },
  {
    title: 'Driver’s licence and plates',
    body: (to) =>
      `Exchange your licence and re-register your vehicle at ${LANDING[to]?.licence ?? 'the provincial licensing body'}. Every province sets a deadline for new residents — typically measured in days, not months — so do this in the first weeks, and ask about insurance at the same time (in BC, SK, MB and QC, public insurers are part of the same visit).`,
  },
  {
    title: 'Tell the CRA and Service Canada',
    body: () =>
      'Update your address with the CRA (benefits like the GST/HST credit and the Canada Child Benefit follow your address) and with Service Canada — an existing EI claim moves with you. Update your bank, employer payroll, and voter registration while you are at it.',
  },
  {
    title: 'Keep every moving receipt',
    body: () =>
      'If the move brings you at least 40 km closer to your new work, moving expenses are deductible against income at the new location — transport, storage, travel, up to 15 days of temporary lodging near either home, and costs of breaking a lease. The receipts are the deduction.',
  },
];

/** Spouse's job search — same resources in every province, plus the local body. */
export const SPOUSE_JOB: (to: string) => string[] = (to) => [
  `Job Bank (jobbank.gc.ca) — the federal listing site; set an alert for the new city before the move.`,
  `${LANDING[to]?.jobs ?? 'The provincial employment service'} — free help that local employers actually use.`,
  'Regulated professions (nursing, teaching, trades, engineering, law…) are licensed per province — contact the new province’s regulator early; transferring a licence can take longer than finding the job.',
  'Settlement agencies (below) run job-search programs that are open to internal migrants in many locations, not only to newcomers to Canada.',
];

/** Kids' schools — how enrolment actually works. */
export const SCHOOLS: (to: string) => string[] = (to) => [
  'Public schools assign places by home address (catchment). If schools matter to you, pick the school before the house: look up the catchment on the local school board’s website, then rent or buy inside it.',
  'To enrol, contact the school board (not the individual school) with proof of address, the child’s birth certificate or passport, immunization records, and the latest report card.',
  'Enrolment is year-round for new arrivals — boards must place resident children even mid-year, though the assigned school may differ from the closest one when classes are full.',
  ...(LANDING[to]?.schoolNote ? [LANDING[to].schoolNote] : []),
];

/** Who can help — real, national bodies with local presence. */
export const WHO_HELPS: string[] = [
  '211 (phone and 211.ca) — free referral line for local services in every province: housing help, child care, language classes, employment programs.',
  'YMCA/YWCA and local immigrant-serving agencies — many of their settlement and employment programs serve anyone new to the city; IRCC keeps a searchable directory of funded agencies.',
  'The public library — free resume help, printing, language conversation circles, and often a newcomer desk; the fastest free orientation to any Canadian city.',
  'Provincial nominee and newcomer offices publish relocation guides for their province — written for immigrants, equally useful for interprovincial movers.',
];
