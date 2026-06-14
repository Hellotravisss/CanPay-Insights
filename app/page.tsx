import type { Metadata } from 'next';
import App from '../App';

export const metadata: Metadata = {
  title: 'Free Canadian Payroll Calculator 2025/2026 - CPP, EI & Take-Home Pay',
  description:
    'Calculate Canadian take-home pay by province with federal tax, provincial tax, CPP, EI, hourly wage, annual salary, overtime, and timesheet tools.',
  alternates: {
    canonical: 'https://canpayinsights.ca/',
  },
  openGraph: {
    title: 'Free Canadian Payroll Calculator 2025/2026',
    description: 'Calculate Canadian take-home pay by province with CPP, EI, income tax, salary, hourly wage, and timesheet tools.',
    url: 'https://canpayinsights.ca/',
  },
};

export default function HomePage() {
  return (
    <>
      <App />
      <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-3xl px-4 py-12">
          <h2 className="mb-3 text-2xl font-bold text-slate-900">
            How CPP deductions work in 2025/2026
          </h2>
          <p className="mb-6 leading-7 text-slate-600">
            The Canada Pension Plan (CPP) takes 5.95% of your earnings between the $3,500 basic
            exemption and the yearly maximum ($73,200 in 2025), for a maximum employee contribution
            of about $4,034. Higher earners also pay CPP2 — an extra 4% on income between $73,200 and
            roughly $81,200. You and your employer contribute the same amount. Our calculator applies
            these brackets automatically for every province and territory.
          </p>

          <h2 className="mb-3 text-2xl font-bold text-slate-900">
            EI premiums and rates across Canada
          </h2>
          <p className="mb-6 leading-7 text-slate-600">
            Employment Insurance (EI) is deducted at 1.64% of insurable earnings in 2025, up to a
            maximum of about $1,077 per year. Quebec uses a lower EI rate because it runs its own
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
            calculator above to compare your real take-home pay by province for 2025 and 2026.
          </p>
        </div>
      </section>
    </>
  );
}
