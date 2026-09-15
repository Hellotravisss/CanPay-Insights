# Privacy impact assessment — neighbourhood (FSA) and device-location collection

**Project:** optional postal-code prefix and on-device rounded location on the CanPay Insights web calculator, with aggregated neighbourhood statistics published and licensed.
**Date:** 2026-09-15 · **Owner / person in charge of personal information:** Qi Zhang (info@canpayinsights.ca)
**Why this document exists:** Quebec's Act respecting the protection of personal information in the private sector, s. 3.3, requires an assessment for any project to develop a system involving the collection of personal information, proportionate to its sensitivity. Location and income are both treated as sensitive by the federal Commissioner. This is that assessment, kept with the code so it changes when the code does.

## 1. What is collected, and how

| Element | Source | Precision kept | Where reduced |
| --- | --- | --- | --- |
| Postal-code prefix (FSA) | typed by the visitor | 3 characters (thousands of households) | browser validates 3 characters; server re-validates; a 6-character code is never accepted |
| Device position | browser Geolocation API after the visitor presses a button and accepts the browser prompt | 2 decimals (~1 km) urban; 1 decimal (~11 km) rural or unmatched | rounded in the browser before sending; server re-rounds |
| FSA from position | nearest centroid, computed in the browser | 3 characters | — |
| Time-zone name | browser | zone name only | — |
| Returning-device flag | localStorage | boolean | — |

Joined to the existing anonymous record: province, income **bracket**, calculator mode, device class, browser family, optional survey answers. **Not** joined: account id, email, IP address, exact income, raw user-agent, precise coordinates, full postal code.

## 2. Purposes, stated to the visitor at the point of collection

1. Show the visitor where their income sits among the tax filers of that FSA (CRA Table 1b, 2021 tax year). Immediate, visible, the reason to answer.
2. Publish aggregated statistics by FSA (counts by income bracket, intent, etc.) on the public data page.
3. License the same aggregated statistics to third parties — named in the consent text as "researchers, journalists, and real-estate or financial companies".

The consent line sits directly above the input and the button, says the purpose including licensing, says what is kept and what is rounded on the device, and links to the policy section. Nothing is gated on answering.

## 3. Legal basis

- **PIPEDA / OPC consent guidelines:** express, opt-in consent for sensitive information and for disclosure to third parties for their own purposes. Met: the function is off until the visitor acts; the purpose and buyer class are stated before the act; the calculator is unchanged if they decline.
- **Quebec s. 8.1:** technology that can locate a person must be deactivated by default and the person informed of how to activate it. Met by construction (button + browser prompt) and by the notice.
- **Quebec s. 12 / s. 14:** consent per purpose, presented separately. Met: the consent text is specific to this collection and not bundled with the terms.
- **Apple 5.1.2:** the iOS app does **not** implement this collection; app data is not licensed. Decision recorded in `docs/telemetry-methodology.md`.
- **French:** the policy exists in French (`/fr/confidentialite`) on equal terms; the prompt is translated in all ten interface languages.

## 4. Risks and mitigations

| Risk | Likelihood before | Mitigation | Residual |
| --- | --- | --- | --- |
| Re-identification of a person from FSA × bracket × device × hour in a small area | medium | rural rounding to ~11 km; no account or IP in the row; **output suppression** — bracket mix needs ≥20 rows per FSA, bare count needs ≥5, smaller cells folded into one withheld total; the same rule for any licensed extract | low |
| A licensee attempts re-identification or resells | low | statistics only, never rows; licence terms prohibit re-identification and onward transfer; policy states this | low |
| Precise coordinate leaks in transit or logs | low | rounding happens in the browser; the precise value never exists server-side; Cloudflare logs are not retained by us | very low |
| Visitor did not understand the licensing purpose | medium | purpose in one plain sentence at the input, in the visitor's language, plus the policy section; nothing gated | low |
| Remembered FSA follows the device without a fresh prompt | low | shown as "📍 V6X · Change" on every result; removable by "Change" or clearing site data; disclosed in policy | low |
| Full postal code entered by mistake | medium | input is capped at 3 characters and validated against the FSA pattern on both sides | very low |
| Quebec anonymization standard for a *sold* dataset | — | a licensed extract will be produced as de-identified aggregates under the suppression rule; if it is to be represented as "anonymized" under s. 23, the regulation's process (qualified person, criteria, register) must be run first — **open item before the first licence** | open |

## 5. Retention and access

Rows are kept indefinitely as part of the dataset; they contain no identity. Access to the raw table: the owner only (data room behind a key; D1 via API token). Licensees and the public receive aggregates only.

## 6. Decision

Proceed. The collection is opt-in, purpose-stated, reduced at the source, and suppressed at the output. Reassess when: a first licence is negotiated (s. 23 process), the app is considered for the same feature (Apple 5.1.2), or output granularity finer than FSA is proposed (it should not be).

*Status of this assessment: written by the operator with AI assistance; not reviewed by a lawyer. A lawyer's review is recommended before the first licensing agreement, and is noted as such in the project's task list.*
