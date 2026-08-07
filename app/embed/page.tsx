import type { Metadata } from 'next';
import EmbedClient from './EmbedClient';

// The iframe payload for third-party sites. Deliberately noindex: the
// indexable, marketing-facing page lives at /widget.
export const metadata: Metadata = {
  title: 'Embedded Take-Home Pay Calculator',
  robots: { index: false, follow: true },
};

export default function EmbedPage() {
  return <EmbedClient />;
}
