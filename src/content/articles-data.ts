import type { Article } from './types';
import { salaryArticles } from './articles-salary';
import { provinceArticles } from './articles-province';
import { tipsArticles } from './articles-tips';
import { studyArticles } from './articles-studies';
import { frenchArticles } from './articles-fr';
import { provinceGuides2026 } from './articles-province-2026';

// Article 1: Ontario Tax Guide


// Article 3: Newcomer Tax Guide
const article3: Article = {
  id: "3",
  slug: "newcomer-tax-guide-canada-2025",
  title: "Newcomer Tax Guide 2026: Your First Year in Canada",
  subtitle: "Everything you need to know about filing taxes, credits, and benefits as a new permanent resident",
  excerpt: "Just arrived in Canada? This comprehensive guide explains your tax obligations, available benefits, and how to maximize your first-year returns. Learn about the GST/HST credit, CCB, and more.",
  metaTitle: "Newcomer Tax Guide 2026 - First Year in Canada",
  metaDescription: "Complete tax guide for newcomers to Canada 2025. Learn about filing requirements, available credits, and benefits for permanent residents.",
  keywords: ["newcomer tax guide", "first year canada tax", "new immigrant taxes", "canada tax filing new resident"],
  category: "tax",
  tags: ["Newcomers", "Immigration", "2025", "Tax Guide"],
  province: "Federal",
  publishedAt: "2025-01-17",
  updatedAt: "2026-08-11",
  readTime: 14,
  imageUrl: "/blog/covers/newcomer-tax-guide-canada-2025.png",
  directAnswer: "Newcomers to Canada in 2025 must file a tax return even with no income to access benefits like the GST/HST credit and Canada Child Benefit (CCB), which are based on family income.",
  faq: [
    { question: "Do I need to file taxes in my first year in Canada?", answer: "Yes, you should file a tax return for the year you arrive to establish your eligibility for various credits and benefits, even if you had no income." },
    { question: "What is the GST/HST credit?", answer: "It is a tax-free quarterly payment for individuals and families with low or modest incomes to help offset the sales tax they pay." },
    { question: "How do I claim the Canada Child Benefit (CCB)?", answer: "Newcomers can apply for CCB as soon as they become residents for tax purposes and have children under 18; the amount is based on your family income." },
    { question: "What are the tax residency rules for newcomers?", answer: "Generally, you become a resident of Canada for tax purposes on the date you arrive and establish significant residential ties." },
    { question: "Can I claim moving expenses to Canada?", answer: "Most newcomers cannot claim the cost of moving to Canada, but you may be able to claim moves within Canada for work or study later on." }
  ],
  content: `
## Newcomer Tax Guide 2026: Your First Year in Canada

Elena landed in Toronto on March 15th, 2026, with her husband and two children. As a software engineer from Ukraine, she secured a good job paying $75,000 per year. But the Canadian tax system seemed overwhelming compared to what she was used to. When should she file? What credits can she claim? What about her husband, who isn't working yet?

If you are new to Canada, you likely have similar questions. This guide will walk you through everything you need to know about your tax obligations and opportunities in your first year.

### When Do You Become a Tax Resident?

You become a Canadian tax resident when you establish significant residential ties. This typically happens on the day you:
- Sign a long-term lease or buy a home
- Move your family to Canada
- Obtain a permanent resident card
- Open bank accounts and register for healthcare

**Important:** Even if you arrive mid-year, you are taxed on worldwide income from that point forward. However, income earned before becoming a resident is not taxed in Canada.

### What do you need for your first tax filing in Canada?

**Deadline:** April 30, 2027 (for 2026 income)

**Documents to Gather:**
- T4 slip from employer (arrives by end of February 2027)
- Social Insurance Number (SIN)
- Record of landing date
- Income earned before arriving (for CRA records)
- Foreign bank account information (if applicable)

**Prorated Personal Amount:**

Elena arrived on March 15th, meaning she was a resident for 292 days of the year (March 15 to December 31, counting both days). Her federal basic personal amount is prorated:

$16,452 × (292 ÷ 365) = $13,162

This means she can earn about $13,162 before owing any federal income tax.

### Benefits You Can Claim Immediately

**1. Canada Groceries and Essentials Benefit (formerly the GST/HST credit)**

This tax-free quarterly payment replaced the GST/HST credit in July 2026. For July 2026 to June 2027:
- Single adult: Up to $679/year
- Married/common-law: Up to $890/year
- Plus $234 per child under 19
- **Newcomers apply with form RC151** once they have a SIN

Elena's family (2 adults, 2 children) could receive up to $1,358 per year.

**2. Canada Child Benefit (CCB)**

Monthly payments for children under 18:
- Up to $8,157 per year for children under 6 (July 2026 to June 2027)
- Up to $6,883 per year for children 6-17
- Income-tested (starts to decrease above $38,237 adjusted family net income)

With Elena's $75,000 income, her family would receive partial CCB:
- Estimated monthly: $300-400 for two children
- **Apply immediately after getting SIN**

**3. Provincial Benefits**

Each province has additional programs:
- Ontario: Ontario Child Benefit (up to $1,607/year per child)
- BC: BC Climate Action Tax Credit
- Alberta: Alberta Child and Family Benefit

### Special Considerations for Newcomers

**Foreign Income Reporting:**

After becoming a resident, you must report worldwide income. This includes:
- Employment income from outside Canada
- Rental income from foreign property
- Investment income
- Foreign pension income

**Foreign Assets:**

If you own foreign assets worth more than $100,000 CAD, you must file Form T1135 (Foreign Income Verification Statement).

**Tax Treaties:**

Canada has tax treaties with many countries to prevent double taxation. Check if your home country has one—you may be able to claim foreign tax credits.

### Filing Your First Return: Step by Step

**Step 1: Get Your SIN**

Visit Service Canada. Bring:
- Passport
- Permanent resident card or confirmation of permanent residence
- Proof of address

**Step 2: Open a Bank Account**

You'll need a Canadian bank account for direct deposit of refunds and benefits. Major banks have newcomer packages with no fees for the first year.

**Step 3: Apply for Benefits**

Use the CRA "Apply for child and family benefits" online service, or complete Form RC66. Do this as soon as you have your SIN.

**Step 4: Gather Documents Throughout the Year**

Keep records of:
- Medical expenses
- Moving expenses (if you moved 40km+ closer to work)
- Tuition receipts
- Charitable donations

**Step 5: Choose How to File**

Options for newcomers:
- **Certified tax software:** Simple and guided (e.g., TurboTax, Wealthsimple Tax)
- **Volunteer tax clinics:** Free help if your income is modest
- **Professional accountant:** Recommended if your situation is complex

### What tax mistakes do newcomers make?

**Mistake #1: Not Filing Because Income Is Low**

Even with no income, file a return to:
- Receive GST/HST credit
- Build RRSP contribution room
- Establish tax history for future loans/mortgages

**Mistake #2: Missing the Prorated Personal Amount**

Some tax software doesn't automatically calculate the prorated amount. Verify your basic personal amount reflects your actual residency period.

**Mistake #3: Not Reporting Foreign Assets**

Failure to report foreign property can result in penalties of $25 per day, up to $2,500.

**Mistake #4: Missing Medical Expense Claims**

You can claim medical expenses for any 12-month period ending in the tax year. This includes expenses from your home country if you paid them after becoming a Canadian resident.

### Elena's First Year: A Real Example

Income: $75,000 (March 15 - December 31 = 9.5 months)
Family: Married, two children (ages 4 and 7)

**Tax Calculation:**
- Prorated income for partial year: $75,000 × (290/365) = $59,589
- Federal tax: ~$7,200
- Ontario tax: ~$2,800
- CPP: ~$2,800
- EI: ~$850
- Less: Prorated credits (~$2,400)

**Estimated Tax Owing:** ~$11,250

**Benefits Received:**
- GST/HST credit: ~$800
- CCB: ~$3,600
- Ontario Child Benefit: ~$1,200

**Net Benefit:** ~$5,600 in tax-free benefits

### Tips for Tax Success in Your First Year

1. **File on time:** Even if you owe money, filing by April 30 avoids late-filing penalties
2. **Keep everything:** Keep tax documents for 6 years in case of audit
3. **Learn about RRSPs:** Start contributing as soon as possible to build retirement savings
4. **Understand TFSAs:** Unlike RRSPs, TFSA room starts accumulating when you become a resident
5. **Ask for help:** CRA offers newcomer tax help through their International Tax Services Office

### Resources for Newcomers

**Canada Revenue Agency (CRA):**
- Phone: 1-800-959-8281
- Newcomers to Canada tax guide (T4055)

**Settlement Services:**
- Many organizations offer free tax help for newcomers
- Search "settlement services" + your city

**Banking:**
- Most banks offer free newcomer accounts and tax advice

### Take Control of Your Canadian Finances

Understanding the Canadian tax system is key to financial success in your new home. While it may seem complex at first, the system is designed to support families and workers through various credits and benefits.

**Ready to calculate your specific tax situation?** Use our calculator designed for newcomers—it handles partial-year calculations automatically.

<b>Calculate Your First-Year Canadian Taxes →</b> (Use our calculator at the top of the page)

---

*Disclaimer: Tax rules change frequently. This guide reflects 2026 rates and regulations. For personalized advice, consult a qualified tax professional familiar with newcomer situations.*
`
};

// Article 4: CPP and EI Explained


// Article 5: $50K Salary After Tax


// Article 7: RRSP Tax Savings

// Article 8: TFSA vs RRSP


// Article 9: Ontario Overtime Rules
const article9: Article = {
  id: "9",
  slug: "ontario-overtime-rules-2025",
  title: "Ontario Overtime Rules 2026: Know Your Rights",
  subtitle: "Everything Ontario workers need to know about overtime pay, exemptions, and calculations",
  excerpt: "Are you getting paid correctly for overtime? Ontario has specific rules about overtime thresholds, rates, and exemptions. Learn your rights as an employee.",
  metaTitle: "Ontario Overtime Rules 2026 - Employee Rights Guide",
  metaDescription: "Complete guide to Ontario overtime rules 2026. Learn about overtime pay rates, exemptions, and how to calculate what you're owed.",
  keywords: ["ontario overtime rules", "overtime pay ontario", "ontario employment standards", "overtime exemption ontario"],
  category: "tax",
  tags: ["Ontario", "Overtime", "Employment Law", "2026"],
  province: "Ontario",
  publishedAt: "2025-01-23",
  updatedAt: "2026-08-11",
  readTime: 10,
  imageUrl: "/blog/covers/ontario-overtime-rules-2025.png",
  directAnswer: "In Ontario in 2026, most employees are entitled to overtime pay at 1.5 times their regular hourly rate for every hour worked in excess of 44 hours in a work week.",
  faq: [
    { question: "What is the overtime threshold in Ontario?", answer: "The standard overtime threshold in Ontario is 44 hours per week; any hours worked beyond this must be compensated at the overtime rate." },
    { question: "Are managers exempt from overtime in Ontario?", answer: "Yes, managers and supervisors are generally exempt from overtime pay if their work is primarily managerial and they perform non-managerial tasks only on an irregular basis." },
    { question: "Can my employer ask me to 'bank' overtime?", answer: "Yes, if you and your employer agree in writing, you can receive paid time off instead of overtime pay at a rate of 1.5 hours of time off for each hour of overtime worked." },
    { question: "Does Ontario have a daily overtime limit?", answer: "Ontario's standard overtime rule is based on a weekly threshold of 44 hours, not a daily limit, though individual employment contracts may vary." },
    { question: "Which professions are exempt from Ontario overtime rules?", answer: "Certain professions, such as IT professionals, doctors, lawyers, and architects, are exempt from the overtime pay provisions of the Employment Standards Act." }
  ],
  content: `
## Ontario Overtime Rules 2026: Know Your Rights

Priya works at a Toronto marketing agency. Her boss expects her to stay late "when needed" but never mentions overtime pay. Last month, she worked 50 hours one week during a campaign launch. Should she be getting overtime? How much? And what can she do if her employer refuses?

Many Ontario workers don't fully understand their overtime rights. This guide explains the rules, common exemptions, and what to do if you're not being paid correctly.

### The Basic Rule: 44 Hours

In Ontario, overtime kicks in after **44 hours in a work week**.

**Key Details:**
- Overtime rate: **1.5x your regular rate** (time and a half)
- Calculated weekly, not daily
- Some industries have different thresholds
- Managers and supervisors are often exempt

**Example:**
- Regular hourly rate: $25/hour
- Overtime rate: $37.50/hour (1.5 × $25)
- Work 48 hours in a week
- Regular pay: 44 × $25 = $1,100
- Overtime pay: 4 × $37.50 = $150
- **Total: $1,250**

### How is overtime pay calculated in Ontario?

**Hourly Workers:**

Simple calculation:
- Regular hours × regular rate
- Overtime hours × (regular rate × 1.5)

**Salaried Workers:**

First, determine your hourly equivalent:
- Annual salary ÷ 52 weeks ÷ 44 hours

Example:
- Salary: $60,000/year
- Hourly equivalent: $60,000 ÷ 52 ÷ 44 = $26.22/hour
- Overtime rate: $39.33/hour

**Commission Workers:**

Two methods (employer chooses):
1. Minimum wage for all hours, plus commission
2. Calculate regular rate based on total earnings ÷ hours, then 1.5x for hours over 44

### Who Qualifies for Overtime?

**Most Workers Are Covered:**

The Employment Standards Act (ESA) covers most Ontario employees. If you're covered, you're entitled to overtime unless you fall under a specific exemption.

**Common Exemptions:**

| Exemption Category | Examples | Why Exempt |
|-------------------|----------|------------|
| **Managers/Supervisors** | Store manager, team lead | Control over work hours |
| **Professionals** | Lawyers, doctors, engineers | Professional designation |
| **IT Professionals** | Software developers, IT consultants | Specific ESA exemption |
| **Salespeople** | Real estate agents, car sales | Commission-based |
| **Healthcare workers** | Doctors, nurses (some) | Special sector rules |
| **Transportation** | Truck drivers, taxi drivers | Special hours of service rules |

**IT Professional Exemption Details:**

To be exempt, the work itself has to qualify:
- Be employed as an information technology professional
- Be **primarily engaged** in the investigation, analysis, design, development,
  implementation, operation or management of information systems
- Apply specialized knowledge and professional judgment

**There is no salary threshold.** Ontario's exemption (O. Reg. 285/01, s. 8)
turns entirely on the nature of the work — whether you are paid hourly or on
salary, and how much, is not part of the test. A job title with "IT" in it is
not enough either; what matters is what you actually spend your time doing.

**Manager/Supervisor Test:**

Not just a title—you must actually:
- Supervise other employees
- Have authority to hire, fire, or discipline
- Exercise independent judgment

If you're called a "manager" but don't actually manage, you may still qualify for overtime.

### Special Rules by Industry

**Retail Workers:**
- Same 44-hour threshold
- Cannot be required to work on public holidays without agreement
- Special rules for Sundays/holidays

**Restaurant/Hospitality:**
- Same 44-hour threshold
- Tips don't count toward overtime calculation
- Split shifts count as total hours worked

**Healthcare:**
- Some professionals exempt
- Hospitals have averaging agreements (can average over 2 or 4 weeks)
- Nurses often have collective agreements with different rules

**Construction:**
- Ontario has no daily overtime rule, in construction or anywhere else
- Some construction work has a higher weekly threshold under O. Reg. 285/01 (for example, road building)
- Check the Ministry of Labour's industry-specific guide for your trade

**Agriculture:**
- Some workers exempt (harvesting, primary production)
- Others covered (processing, retail)

### Averaging Agreements

Employers and employees can agree to **average hours over periods longer than one week**:

**How It Works:**
- Written or electronic agreement required
- Can average over 2, 3, or 4 weeks (never more than 4)
- Must have an expiry date no more than two years out (non-union)
- Neither side can cancel it early unless both agree

**Example:**
4-week averaging agreement:
- Week 1: 50 hours
- Week 2: 38 hours
- Week 3: 48 hours
- Week 4: 36 hours
- Total: 172 hours
- 4-week threshold: 176 hours (44 × 4)
- No overtime owed (even though weeks 1 and 3 exceeded 44)

**Important:** You cannot agree to waive your right to overtime permanently. Averaging agreements must have end dates.

### What Counts as "Work Time"?

**Paid Time Includes:**
- Time spent at workplace waiting for work
- On-call time at workplace
- Training time (required by employer)
- Travel time between work locations
- Working lunches (if required)

**Not Paid Time:**
- Commuting to/from work
- Breaks (eating periods)
- On-call time at home (unless called in)
- Voluntary training

**Travel Time:**
- Normal commute: No
- Travel between job sites: Yes
- Travel as part of job (delivery driver): Yes
- Out-of-town travel: Usually yes

### Banked Overtime (Time Off in Lieu)

Instead of overtime pay, you can agree to **banked time**:

**Rules:**
- Must be agreed in writing or electronically
- 1.5 hours of paid time off for each overtime hour
- Must be taken within 3 months of the week it was earned, or within 12 months if you agree in writing
- If your job ends before you take it, you must be paid overtime pay for those hours

**Example:**
- Work 4 hours overtime
- Bank 6 hours (4 × 1.5)
- Take paid day off later (6 hours at regular rate)

**Warning:** Some employers pressure employees into banking time. You do not have to agree to it; without your written or electronic agreement, overtime must be paid in cash.

### Common Employer Violations

**1. "You're on salary, so no overtime"**

False. Salaried employees are entitled to overtime unless exempt. Your salary covers regular hours; overtime is additional.

**2. "We don't pay overtime, we offer time off instead"**

Not allowed unless you agree in writing or electronically. You can decline, and then overtime must be paid.

**3. "You're a manager" (when you're not)**

Titles don't determine status. Actual duties do.

**4. "You need to finish your work, however long it takes"**

If you're non-exempt, you must be paid for all hours worked, including overtime.

**5. "We average your hours over the year"**

Only valid with a written or electronic averaging agreement of two to four weeks, which expires after at most two years.

### What To Do If You're Not Paid Correctly

**Step 1: Document Everything**

Keep records of:
- Hours worked (sign-in sheets, emails with timestamps)
- Pay stubs
- Schedule changes
- Conversations with supervisors

**Step 2: Talk to Your Employer**

Often, mistakes are unintentional:
- Bring up the issue professionally
- Reference specific ESA sections
- Request correction of records

**Step 3: File a Claim**

If your employer refuses:

**Ministry of Labour:**
- File a claim online or by phone
- Free service
- No lawyer needed
- Can recover up to 2 years of unpaid wages

**Steps:**
1. Visit Ontario.ca/employmentstandards
2. Complete claim form
3. Submit supporting documents
4. Wait for investigation
5. Officer determines outcome

**Small Claims Court:**
- For amounts up to $35,000
- Can claim additional damages
- May need legal representation
- Takes longer but can award more

**Step 4: Protect Yourself**

Retaliation is illegal:
- You cannot be fired for claiming your rights
- You cannot be demoted or harassed
- Document any adverse actions

### Special Considerations

**Contract Workers:**

Misclassification is common. Even if called a "contractor," you may be an employee entitled to overtime. Factors:
- Who controls the work?
- Who provides tools/equipment?
- Can you subcontract?
- Is there risk of profit/loss?

**Unionized Workers:**

Collective agreements may have different overtime rules. Check your contract. If it provides less than ESA minimums, the ESA applies.

**Remote Workers:**

Same rules apply:
- Hours worked = hours entitled to pay
- Checking email counts as work
- Must track and report hours

### Calculating Your Potential Overtime

Use our calculator to:
✅ Determine your overtime rate
✅ Calculate what you're owed
✅ Compare scenarios (weekly vs averaged)
✅ See after-tax overtime pay

<b>Calculate Your Overtime Pay →</b> (Use our calculator at the top of the page)

---

*Disclaimer: Employment standards change. This guide reflects Ontario's Employment Standards Act as of August 2026. For specific situations, consult the Ministry of Labour or an employment lawyer.*
`
};


// Export all articles (combine original tax articles + new articles)
// Exported for build scripts (cover generation) that must see pruned entries too.
export const rawArticles: Article[] = [
  // Provincial guides, generated from StatCan wages + our 2026 engine
  ...provinceGuides2026,
  // Original Tax Guide Articles
  article3,
  article9,
  // Salary Insights Articles
  ...salaryArticles,
  // Provincial Guide Articles
  ...provinceArticles,
  // Money Tips Articles
  ...tipsArticles,
  // Original Data Studies
  ...studyArticles,
  // French articles (Québec market)
  ...frenchArticles,
];

// Retired articles are deleted outright (2026-09-23: 36 removed; they stay in
// git history). Pages that had search impressions keep a 301 in next.config.ts.
// Add a slug here only to hide an article temporarily without deleting it.
const PRUNED_SLUGS = new Set<string>([]);

// Newest first, always. The source arrays are concatenated in whatever order
// they happen to be written, which put thirteen province guides ahead of every
// news article — so the twice-weekly piece published today landed below the
// fold on the blog index, which is the opposite of what a news stream is for.
// Sorting here means every consumer (index, featured slot, related links,
// sitemap) agrees on the order without each one remembering to sort.
export const allArticles: Article[] = rawArticles
  .filter((article) => !PRUNED_SLUGS.has(article.slug))
  .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

// Helper functions
export const getArticleBySlug = (slug: string): Article | undefined => {
  return allArticles.find(article => article.slug === slug);
};

export const getArticlesByCategory = (category: string): Article[] => {
  return allArticles.filter(article => article.category === category);
};

export const getRecentArticles = (limit: number = 5): Article[] => {
  // No sort here: allArticles is already newest-first, and the previous version
  // called .sort() on it directly, which reorders the shared array in place for
  // every other caller depending on who runs first.
  return allArticles.slice(0, limit);
};

export const getRelatedArticles = (currentSlug: string, limit: number = 3): Article[] => {
  const current = getArticleBySlug(currentSlug);
  if (!current) return [];
  
  return allArticles
    .filter(article => article.slug !== currentSlug)
    .filter(article => 
      article.category === current.category || 
      article.province === current.province ||
      article.tags.some(tag => current.tags.includes(tag))
    )
    .slice(0, limit);
};

export default allArticles;
