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
    default: 'Free Canadian Payroll Calculator 2025/2026 - CanPay Insights',
    template: '%s | CanPay Insights',
  },
  description:
    'Free Canadian payroll calculator for 2025/2026. Estimate take-home pay by province with federal tax, provincial tax, CPP, EI, hourly wage, salary, and timesheet tools.',
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
              '@type': 'WebApplication',
              name: 'CanPay Insights',
              applicationCategory: 'FinanceApplication',
              operatingSystem: 'Web Browser',
              offers: { '@type': 'Offer', price: '0', priceCurrency: 'CAD' },
              description: 'Free Canadian payroll calculator for 2025/2026. Calculate net pay, taxes, CPP, and EI deductions.',
              url: 'https://canpayinsights.ca/',
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
