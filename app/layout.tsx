import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://www.canpayinsights.ca'),
  title: {
    default: 'CanPay Insights - Canadian Payroll Calculator 2025/2026',
    template: '%s | CanPay Insights',
  },
  description:
    'Free Canadian payroll calculator. Calculate your net pay, taxes, CPP, and EI deductions across all provinces for 2025/2026.',
  keywords: [
    'Canada payroll calculator',
    'Canadian salary calculator',
    'net pay calculator',
    'tax calculator Canada',
    'CPP calculator',
    'EI calculator',
    'Ontario tax',
    'Alberta tax',
    'BC tax',
    'take-home pay',
    '2025 tax calculator',
  ],
  authors: [{ name: 'CanPay Insights' }],
  openGraph: {
    type: 'website',
    siteName: 'CanPay Insights',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og-image.png'],
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  themeColor: '#dc2626',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
            {
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: 'CanPay Insights',
              applicationCategory: 'FinanceApplication',
              operatingSystem: 'Web Browser',
              offers: { '@type': 'Offer', price: '0', priceCurrency: 'CAD' },
              description: 'Free Canadian payroll calculator for 2025/2026. Calculate net pay, taxes, CPP, and EI deductions.',
              url: 'https://www.canpayinsights.ca/',
            },
            {
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: [
                {
                  '@type': 'Question',
                  name: 'How much tax do I pay in Canada?',
                  acceptedAnswer: { '@type': 'Answer', text: 'In Canada, income tax is calculated at both federal and provincial levels. For a $65,000 salary in Ontario in 2025, you pay approximately $11,500 in federal tax, $4,200 in provincial tax, $3,659 in CPP, and $1,066 in EI — taking home roughly $44,500. Use our free calculator to get exact numbers for your province and income.' },
                },
                {
                  '@type': 'Question',
                  name: 'How is CPP calculated in 2025?',
                  acceptedAnswer: { '@type': 'Answer', text: 'In 2025, CPP is calculated at 5.95% of your earnings between $3,500 and $73,200, for a maximum contribution of $4,034.10. A new CPP2 enhancement applies to earnings between $73,200 and $81,200 at 4%, adding up to $188 more. Both you and your employer contribute equally.' },
                },
                {
                  '@type': 'Question',
                  name: 'What is EI deduction in Canada 2025?',
                  acceptedAnswer: { '@type': 'Answer', text: 'Employment Insurance (EI) in 2025 is deducted at 1.64% of insurable earnings, up to a maximum of $1,077.48 per year (based on $65,700 maximum insurable earnings). EI provides income replacement if you lose your job, and covers parental, compassionate care, and sickness benefits.' },
                },
                {
                  '@type': 'Question',
                  name: 'Which Canadian province has the lowest income tax?',
                  acceptedAnswer: { '@type': 'Answer', text: 'Alberta has no provincial sales tax and the lowest flat provincial income tax rate starting at 10%, making it the most tax-friendly province for high earners. Nunavut has the lowest bottom rate at 4%. Quebec has the highest provincial income tax rates but offers more public services.' },
                },
                {
                  '@type': 'Question',
                  name: 'How do I calculate my take-home pay in Canada?',
                  acceptedAnswer: { '@type': 'Answer', text: 'To calculate take-home pay in Canada: start with gross income, subtract federal tax (15%–33% depending on bracket), provincial tax (varies by province), CPP contributions (5.95% up to $4,034.10), and EI premiums (1.64% up to $1,077.48). Use CanPay Insights free calculator to get an instant, accurate result for your province.' },
                },
                {
                  '@type': 'Question',
                  name: 'What is the RRSP contribution limit for 2025?',
                  acceptedAnswer: { '@type': 'Answer', text: 'The RRSP contribution limit for 2025 is 18% of your 2024 earned income, up to a maximum of $32,490. Unused contribution room from previous years carries forward. RRSP contributions reduce your taxable income dollar-for-dollar, making them one of the most powerful tax-saving tools for Canadians.' },
                },
              ],
            },
          ]),
          }}
        />
      </head>
      <body className={inter.className}>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
