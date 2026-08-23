/**
 * Income bracketing, shared by the client-side telemetry and server routes.
 * Lives outside lib/telemetry.ts on purpose: that module is 'use client',
 * and a server route importing it gets a stub instead of a function.
 */
export function bracketIncome(annual: number): string {
  if (annual < 30_000) return 'under-30k';
  if (annual < 50_000) return '30-50k';
  if (annual < 70_000) return '50-70k';
  if (annual < 90_000) return '70-90k';
  if (annual < 120_000) return '90-120k';
  if (annual < 160_000) return '120-160k';
  return '160k-plus';
}
