import { payBehaviour } from '../../../lib/payBehaviour';
import { chart } from '../../../lib/researchCharts';

/**
 * The research charts, drawn live at the same URLs the committed SVG files used
 * to occupy, so anything already linking to them keeps working. The static page
 * segment (`pay-calculator-behaviour`) takes precedence over this dynamic one.
 */
export const revalidate = 3600;

export async function GET(_req: Request, { params }: { params: Promise<{ chart: string }> }) {
  const { chart: file } = await params;
  if (file === 'pay-behaviour.json') {
    const s = await payBehaviour();
    return new Response(JSON.stringify(s, null, 2) + '\n', {
      headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'public, max-age=3600' },
    });
  }
  if (!file.endsWith('.svg')) return new Response('Not found', { status: 404 });
  const svg = chart(file.replace(/\.svg$/, ''), await payBehaviour());
  if (!svg) return new Response('Not found', { status: 404 });
  return new Response(svg, {
    headers: { 'content-type': 'image/svg+xml; charset=utf-8', 'cache-control': 'public, max-age=3600' },
  });
}
