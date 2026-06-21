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
    default: 'Free Canadian Payroll Calculator 2026 - CanPay Insights',
    template: '%s | CanPay Insights',
  },
  description:
    'Free Canadian payroll calculator for 2026. Estimate take-home pay by province with federal tax, provincial tax, CPP, EI, hourly wage, salary, and timesheet tools.',
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
              description:
                'Free Canadian payroll and take-home pay calculator covering federal tax, provincial tax, CPP/CPP2, EI, and Quebec QPP/QPIP for 2026.',
              founder: {
                '@type': 'Person',
                name: 'Travis Zhang',
                alternateName: 'Qi Zhang',
                sameAs: ['https://www.linkedin.com/in/qharbert'],
              },
              areaServed: 'CA',
              knowsAbout: ['Canadian payroll', 'take-home pay', 'income tax', 'CPP', 'CPP2', 'EI', 'RRSP', 'TFSA', 'QPP', 'QPIP'],
            },
            {
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: 'CanPay Insights',
              applicationCategory: 'FinanceApplication',
              operatingSystem: 'Web Browser',
              offers: { '@type': 'Offer', price: '0', priceCurrency: 'CAD' },
              description: 'Free Canadian payroll calculator for 2026. Calculate net pay, taxes, CPP, and EI deductions.',
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
