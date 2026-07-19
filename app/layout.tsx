import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://canpayinsights.ca'),
  alternates: {
    canonical: 'https://canpayinsights.ca',
  },
  title: {
    default: 'Canadian Take-Home Pay & Paycheck Calculator 2026 | CanPay Insights',
    template: '%s | CanPay Insights',
  },
  description:
    'See how much of your salary or hourly wage you actually keep. CanPay Insights is a free take-home pay and paycheck calculator for Canadian employees — federal and provincial income tax, CPP/CPP2, and EI, by province, for 2026.',
  keywords: [
    'take-home pay calculator',
    'paycheck calculator Canada',
    'salary after tax Canada',
    'net pay calculator',
    'income tax calculator Canada',
    'CPP calculator',
    'EI calculator',
    'Ontario paycheck calculator',
    'BC take-home pay',
    'Alberta net pay',
    'hourly wage after tax',
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
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    shortcut: '/favicon-32x32.png',
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
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2057246579245289"
          crossOrigin="anonymous"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
            {
              '@context': 'https://schema.org',
              '@type': 'Organization',
              '@id': 'https://canpayinsights.ca/#org',
              name: 'CanPay Insights',
              url: 'https://canpayinsights.ca/',
              logo: 'https://canpayinsights.ca/apple-touch-icon.png',
              email: 'info@canpayinsights.ca',
              sameAs: [
                'https://apps.apple.com/app/canpayinsights/id6759822038',
                'https://github.com/Hellotravisss/canpay-open-data',
              ],
              description:
                'CanPay Insights is a free online take-home-pay and income-tax calculator for Canadian employees and hourly workers. It estimates the net pay you keep from a salary or wage after federal tax, provincial tax, CPP/CPP2, EI, and Quebec QPP/QPIP, for the 2026 tax year.',
              disambiguatingDescription:
                'A free consumer calculator website that shows individual employees and hourly workers how much take-home pay they keep from a salary or wage after Canadian income tax, CPP, and EI. It is NOT a payment processor, a payroll-processing service, or a merchant-services provider — it does not move money or process transactions.',
              slogan: 'Know your real take-home pay',
              founder: {
                '@type': 'Person',
                name: 'Travis Zhang',
                alternateName: 'Qi Zhang',
                sameAs: ['https://www.linkedin.com/in/travis-z'],
              },
              areaServed: 'CA',
              audience: {
                '@type': 'Audience',
                audienceType: 'Employees, hourly workers, and job seekers in Canada estimating take-home pay',
              },
              foundingLocation: {
                '@type': 'Place',
                address: { '@type': 'PostalAddress', addressLocality: 'Vancouver', addressRegion: 'BC', addressCountry: 'CA' },
              },
              address: { '@type': 'PostalAddress', addressLocality: 'Vancouver', addressRegion: 'BC', addressCountry: 'CA' },
              contactPoint: {
                '@type': 'ContactPoint',
                contactType: 'customer support',
                email: 'info@canpayinsights.ca',
                availableLanguage: ['en', 'fr', 'zh'],
              },
              knowsAbout: ['take-home pay', 'net pay', 'paycheck calculator', 'salary after tax', 'hourly wage after tax', 'income tax', 'payroll deductions', 'CPP', 'CPP2', 'EI', 'RRSP', 'TFSA', 'QPP', 'QPIP'],
            },
            {
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: 'CanPay Insights Take-Home Pay Calculator',
              applicationCategory: 'FinanceApplication',
              applicationSubCategory: 'Take-home pay & income tax calculator',
              operatingSystem: 'Web Browser',
              offers: { '@type': 'Offer', price: '0', priceCurrency: 'CAD' },
              description: 'Free take-home pay and paycheck calculator for Canadian employees — estimate the net pay you keep from a salary or hourly wage after income tax, CPP/CPP2, and EI, by province, for 2026.',
              featureList: ['Take-home pay by province', 'Hourly wage and annual salary modes', 'Federal and provincial income tax', 'CPP, CPP2 and EI deductions', 'Quebec QPP and QPIP', 'RRSP and TFSA planning'],
              url: 'https://canpayinsights.ca/',
              inLanguage: ['en', 'fr', 'zh'],
              publisher: { '@id': 'https://canpayinsights.ca/#org' },
            },
            {
              '@context': 'https://schema.org',
              '@type': 'Dataset',
              name: 'Canadian Take-Home Pay & Payroll Deductions 2026',
              description:
                "Net pay, federal and provincial income tax, CPP/CPP2, EI, and Quebec QPP/QPIP by province/territory and income level ($30k–$200k) for 2026. Computed from CanPay Insights' open rules engine using CRA and Revenu Québec 2026 rates.",
              creator: { '@id': 'https://canpayinsights.ca/#org' },
              license: 'https://creativecommons.org/licenses/by/4.0/',
              isAccessibleForFree: true,
              url: 'https://canpayinsights.ca/about',
              spatialCoverage: 'Canada',
              temporalCoverage: '2026',
              keywords: ['Canada payroll', 'take-home pay', 'net pay', 'CPP', 'CPP2', 'EI', 'income tax', 'provincial tax', '2026 tax'],
              distribution: [
                {
                  '@type': 'DataDownload',
                  encodingFormat: 'text/csv',
                  contentUrl: 'https://canpayinsights.ca/data/canpay-take-home-2026.csv',
                },
                {
                  '@type': 'DataDownload',
                  encodingFormat: 'application/json',
                  contentUrl: 'https://canpayinsights.ca/data/canpay-take-home-2026.json',
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
