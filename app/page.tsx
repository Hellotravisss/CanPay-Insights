import type { Metadata } from 'next';
import App from '../App';

export const metadata: Metadata = {
  title: 'Free Canadian Payroll Calculator 2026 - CPP, EI & Take-Home Pay',
  description:
    'Calculate Canadian take-home pay by province with federal tax, provincial tax, CPP, EI, hourly wage, annual salary, overtime, and timesheet tools.',
  alternates: {
    canonical: 'https://canpayinsights.ca/',
  },
  openGraph: {
    title: 'Free Canadian Payroll Calculator 2026',
    description: 'Calculate Canadian take-home pay by province with CPP, EI, income tax, salary, hourly wage, and timesheet tools.',
    url: 'https://canpayinsights.ca/',
  },
};

const homeFaqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How much tax do I pay in Canada?',
      acceptedAnswer: { '@type': 'Answer', text: 'In Canada, income tax is calculated at both federal and provincial levels. On a $65,000 salary in Ontario in 2026, you keep about $50,880 in take-home pay (roughly $4,240 a month) after federal tax, provincial tax, CPP, and EI. Use our free calculator to get exact numbers for your province and income.' },
    },
    {
      '@type': 'Question',
      name: 'How is CPP calculated in 2026?',
      acceptedAnswer: { '@type': 'Answer', text: 'CPP is 5.95% of your earnings between $3,500 and the first ceiling (YMPE, about $74,600 in 2026). Higher earners also pay CPP2 — an extra 4% between the first ceiling and a second ceiling (YAMPE, about $85,000). You and your employer contribute equally.' },
    },
    {
      '@type': 'Question',
      name: 'What is the EI deduction in Canada?',
      acceptedAnswer: { '@type': 'Answer', text: 'Employment Insurance (EI) is deducted at 1.63% of insurable earnings in 2026, up to a yearly maximum of about $1,123. Quebec workers pay a lower EI rate because the province runs its own parental insurance plan (QPIP).' },
    },
    {
      '@type': 'Question',
      name: 'Which Canadian province has the lowest income tax?',
      acceptedAnswer: { '@type': 'Answer', text: 'Alberta has the highest basic personal amount and no provincial sales tax, making it very tax-friendly for higher earners. Quebec has the highest provincial income tax rates but offers more public services. Use the calculator to compare your take-home pay by province.' },
    },
    {
      '@type': 'Question',
      name: 'How do I calculate my take-home pay in Canada?',
      acceptedAnswer: { '@type': 'Answer', text: 'Start with gross income, then subtract federal tax (14% on the first bracket in 2026, up to 33%), provincial tax, CPP/CPP2 contributions, and EI premiums. CanPay Insights gives an instant, accurate result for your province and pay frequency.' },
    },
    {
      '@type': 'Question',
      name: 'What is the RRSP contribution limit for 2026?',
      acceptedAnswer: { '@type': 'Answer', text: 'The RRSP contribution limit for 2026 is 18% of your earned income, up to a maximum of $33,810. Unused room carries forward. RRSP contributions reduce your taxable income dollar-for-dollar, lowering your federal and provincial tax.' },
    },
  ],
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeFaqJsonLd) }}
      />
      <App />
      <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-3xl px-4 py-12">
          <h2 className="mb-3 text-2xl font-bold text-slate-900">
            How CPP deductions work in 2026
          </h2>
          <p className="mb-6 leading-7 text-slate-600">
            The Canada Pension Plan (CPP) takes 5.95% of your earnings between the $3,500 basic
            exemption and the yearly maximum ($74,600 in 2026), for a maximum employee contribution
            of about $4,230. Higher earners also pay CPP2 — an extra 4% on income between $74,600 and
            $85,000. You and your employer contribute the same amount. Our calculator applies
            these brackets automatically for every province and territory.
          </p>

          <h2 className="mb-3 text-2xl font-bold text-slate-900">
            EI premiums and rates across Canada
          </h2>
          <p className="mb-6 leading-7 text-slate-600">
            Employment Insurance (EI) is deducted at 1.63% of insurable earnings in 2026, up to a
            maximum of about $1,123 per year. Quebec uses a lower EI rate because it runs its own
            parental insurance plan (QPIP) separately. CanPay Insights applies the correct EI and
            QPIP rates based on the province you select.
          </p>

          <h2 className="mb-3 text-2xl font-bold text-slate-900">
            How provincial tax changes your take-home pay
          </h2>
          <p className="leading-7 text-slate-600">
            Your net pay depends heavily on where you live. The same $65,000 salary keeps a different
            amount in Alberta, Ontario, BC, or Quebec, because each province sets its own tax
            brackets and basic personal amount. Alberta has the highest basic personal amount and no
            provincial sales tax, while Quebec runs its own system with QPP and QPIP. Use the
            calculator above to compare your real take-home pay by province in 2026.
          </p>
        </div>
      </section>

      <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-3xl px-4 py-12">
          <h2 className="mb-3 text-2xl font-bold text-slate-900">
            2026 take-home pay by province: an $80,000 salary compared
          </h2>
          <p className="mb-6 leading-7 text-slate-600">
            On an $80,000 salary in 2026, your take-home pay ranges from about $57,077 in Quebec to
            about $61,038 in British Columbia — a gap of nearly $5,000 a year on the exact same gross
            salary, simply because of where you live. The table below shows the annual take-home,
            monthly pay, and total deductions (federal tax, provincial tax, CPP/CPP2, and EI) for a
            single employee in six provinces.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b-2 border-slate-300 text-slate-900">
                  <th scope="col" className="py-2 pr-4 font-bold">Province</th>
                  <th scope="col" className="py-2 pr-4 font-bold">Take-home (year)</th>
                  <th scope="col" className="py-2 pr-4 font-bold">Per month</th>
                  <th scope="col" className="py-2 font-bold">Total deductions</th>
                </tr>
              </thead>
              <tbody className="text-slate-600">
                <tr className="border-b border-slate-200"><td className="py-2 pr-4 font-medium text-slate-800">British Columbia</td><td className="py-2 pr-4">$61,038</td><td className="py-2 pr-4">$5,086</td><td className="py-2">$18,962</td></tr>
                <tr className="border-b border-slate-200"><td className="py-2 pr-4 font-medium text-slate-800">Ontario</td><td className="py-2 pr-4">$60,744</td><td className="py-2 pr-4">$5,062</td><td className="py-2">$19,256</td></tr>
                <tr className="border-b border-slate-200"><td className="py-2 pr-4 font-medium text-slate-800">Alberta</td><td className="py-2 pr-4">$60,409</td><td className="py-2 pr-4">$5,034</td><td className="py-2">$19,591</td></tr>
                <tr className="border-b border-slate-200"><td className="py-2 pr-4 font-medium text-slate-800">Manitoba</td><td className="py-2 pr-4">$57,940</td><td className="py-2 pr-4">$4,828</td><td className="py-2">$22,060</td></tr>
                <tr className="border-b border-slate-200"><td className="py-2 pr-4 font-medium text-slate-800">Quebec</td><td className="py-2 pr-4">$57,077</td><td className="py-2 pr-4">$4,756</td><td className="py-2">$22,923</td></tr>
                <tr><td className="py-2 pr-4 font-medium text-slate-800">Nova Scotia</td><td className="py-2 pr-4">$56,095</td><td className="py-2 pr-4">$4,675</td><td className="py-2">$23,905</td></tr>
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs leading-5 text-slate-400">
            2026 estimates for employment income, single with no additional credits, from the CanPay
            Insights rules engine using CRA and provincial rates. Your own result will vary with RRSP
            contributions, dependants, and other credits.
          </p>

          <h2 className="mb-3 mt-12 text-2xl font-bold text-slate-900">
            How take-home pay changes as your salary rises
          </h2>
          <p className="mb-6 leading-7 text-slate-600">
            Canada uses progressive tax brackets, so each extra dollar is taxed at a higher rate and a
            larger salary keeps a smaller share. Here is the 2026 annual take-home pay at three income
            levels in the four largest provinces.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b-2 border-slate-300 text-slate-900">
                  <th scope="col" className="py-2 pr-4 font-bold">Gross salary</th>
                  <th scope="col" className="py-2 pr-4 font-bold">BC</th>
                  <th scope="col" className="py-2 pr-4 font-bold">Ontario</th>
                  <th scope="col" className="py-2 pr-4 font-bold">Alberta</th>
                  <th scope="col" className="py-2 font-bold">Quebec</th>
                </tr>
              </thead>
              <tbody className="text-slate-600">
                <tr className="border-b border-slate-200"><td className="py-2 pr-4 font-medium text-slate-800">$50,000</td><td className="py-2 pr-4">$40,543</td><td className="py-2 pr-4">$40,535</td><td className="py-2 pr-4">$40,331</td><td className="py-2">$38,857</td></tr>
                <tr className="border-b border-slate-200"><td className="py-2 pr-4 font-medium text-slate-800">$75,000</td><td className="py-2 pr-4">$57,609</td><td className="py-2 pr-4">$57,389</td><td className="py-2 pr-4">$57,090</td><td className="py-2">$54,053</td></tr>
                <tr><td className="py-2 pr-4 font-medium text-slate-800">$100,000</td><td className="py-2 pr-4">$75,236</td><td className="py-2 pr-4">$74,617</td><td className="py-2 pr-4">$74,153</td><td className="py-2">$69,619</td></tr>
              </tbody>
            </table>
          </div>

          <h2 className="mb-5 mt-12 text-2xl font-bold text-slate-900">
            Frequently asked questions
          </h2>
          <div className="space-y-6">
            {homeFaqJsonLd.mainEntity.map((item) => (
              <div key={item.name}>
                <h3 className="mb-2 text-lg font-bold text-slate-900">{item.name}</h3>
                <p className="leading-7 text-slate-600">{item.acceptedAnswer.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
