'use client';
import { useEffect } from 'react';

// Mounted in the root layout so the opt-out switch works on EVERY page.
//
// It previously lived inside the telemetry module, which only the calculator
// imports — so "add ?notelemetry=1 to any page" was false anywhere else, and a
// tester who ran it on the blog was still being recorded. Instructions we hand
// people have to be true on the page they actually open.
const OPTOUT_KEY = 'canpay_no_telemetry';

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
  }, []);

  return null;
}
