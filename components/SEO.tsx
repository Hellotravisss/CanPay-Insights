import React, { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonicalUrl?: string;
}

/**
 * SEO Component - Dynamically updates page meta tags
 * 用于动态更新页面的 SEO 标签
 */
const SEO: React.FC<SEOProps> = ({
  title = 'CanPay Insights - Canadian Payroll Calculator 2025/2026',
  description = 'Free Canadian payroll calculator with AI-powered financial insights. Calculate your net pay, taxes, CPP, and EI deductions across all provinces for 2025/2026.',
  keywords = 'Canada payroll calculator, Canadian salary calculator, net pay calculator, tax calculator Canada',
  canonicalUrl = 'https://www.canpayinsights.ca/',
}) => {
  useEffect(() => {
    // Update document title
    document.title = title;

    // Update or create meta tags
    const updateMetaTag = (name: string, content: string, attribute: 'name' | 'property' = 'name') => {
      let element = document.querySelector(`meta[${attribute}="${name}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Update meta tags
    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords);
    updateMetaTag('og:title', title, 'property');
    updateMetaTag('og:description', description, 'property');
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description);

    // Update canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', canonicalUrl);
  }, [title, description, keywords, canonicalUrl]);

  return null; // This component doesn't render anything
};

export default SEO;
