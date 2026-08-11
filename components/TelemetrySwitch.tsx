'use client';
import { useEffect } from 'react';

// Mounted in the root layout so the opt-out switch works on EVERY page.
//
// It previously lived inside the telemetry module, which only the calculator
// imports — so "add ?notelemetry=1 to any page" was false anywhere else, and a
// tester who ran it on the blog was still being recorded. Instructions we hand
// people have to be true on the page they actually open.
const OPTOUT_KEY = 'canpay_no_telemetry';
const ENTRY_KEY = 'canpay_entry_path';

export default function TelemetrySwitch() {
  useEffect(() => {
    try {
      const param = new URLSearchParams(window.location.search).get('notelemetry');
      if (param === '1') {
        localStorage.setItem(OPTOUT_KEY, '1');
        console.info('CanPay: telemetry disabled on this device.');
      } else if (param === '0') {
        localStorage.removeItem(OPTOUT_KEY);
        console.info('CanPay: telemetry re-enabled on this device.');
      }
    } catch {
      /* private mode or blocked storage */
    }

    // Remember the first page of this visit, for the same reason the opt-out
    // switch lives here: the telemetry module is imported only by the
    // calculator, so anything that runs inside it never runs on an article.
    // Recorded there, "where did this visit start" would always answer "the
    // calculator" — which is precisely the question it exists to answer
    // differently. Written once per tab and cleared when the tab closes.
    try {
      if (!sessionStorage.getItem(ENTRY_KEY)) {
        sessionStorage.setItem(ENTRY_KEY, (window.location.pathname || '/').slice(0, 200));
      }
    } catch {
      /* private mode or blocked storage */
    }
  }, []);

  return null;
}
