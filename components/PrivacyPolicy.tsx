'use client';
import React from 'react';
import LegalChrome, { Section } from './LegalChrome';

interface PrivacyPolicyProps {
  onBackToHome?: () => void;
}

/**
 * The privacy policy, written to be true in every sentence rather than safe
 * in every sentence. Each data field the site records has a line here that
 * says what it is, what it is not, and what it is for — including the one
 * purpose most privacy policies bury: aggregated neighbourhood statistics are
 * published and may be licensed to other organisations.
 *
 * Structure follows what Quebec's private-sector Act (s. 8.2) and the federal
 * consent guidelines ask a policy to make findable: what is collected, why,
 * who it goes to, how to say no, who to write to.
 */
const PrivacyPolicy: React.FC<PrivacyPolicyProps> = () => {
  return (
    <LegalChrome
      title="Privacy Policy for CanPay Insights"
      effective="Effective date: September 25, 2026 (replaces the version of September 22, 2026)"
      links={[
        { href: '/fr/confidentialite', label: 'Version française' },
        { href: '/terms', label: 'Terms of Service' },
        { href: '/refunds', label: 'Refund Policy' },
      ]}
      intro={
        <p>
          CanPay Insights (“we”, “our”, “us”) is a free Canadian take-home pay calculator, with two optional paid reports, published at
          canpayinsights.ca and as the CanPay Insights app for iPhone (together, the “Service”). It is
          operated by Qi (Travis) Zhang, doing business as Avowd, in Vancouver, British Columbia. This
          policy explains what we collect, why, who it goes to, and how to say no. It is written to be read.
        </p>
      }
    >
      <Section n={1} id="local" title="What stays on your device, and what does not">
        <p>
          Every payroll and tax calculation runs <strong className="text-slate-800">entirely in your browser or on your phone</strong>.
          The exact money amounts you type — hourly wage, salary, tips, RRSP amounts — are never sent to us,
          with one exception you choose: buying a report, which is built from the salary you enter for it
          (section 5). If you save a calculation to an account, that one calculation is stored so you can reopen it on
          another device, and you can delete it at any time.
        </p>
        <p>
          What <strong className="text-slate-800">is</strong> sent is an anonymous record of each calculation, listed in full in section 2.
          Money appears in it only as ranges. Your work pattern is the one thing sent as plain numbers: when you
          use the shift or timesheet calculator, the usual start and end hour, days per week, average shift
          length and unpaid break. You can switch all of it off (section 2).
        </p>
        <p>
          <strong className="text-slate-800">The calculator other websites embed (our “widget”) sends less:</strong> the province,
          income as a range, annual or hourly, language, device and browser family, the hour and weekday, the
          time-zone name, a temporary visit identifier and the domain it is embedded on. It sends no work
          pattern, stores nothing in the browser, and loads nothing from any other website. A website that
          embeds it with <code>&amp;notelemetry=1</code> turns even that off: the widget then sends nothing at all.
        </p>
      </Section>

      <Section n={2} id="statistics" title="Anonymous usage statistics">
        <p>
          To understand how the calculator is used and to publish research such as “which income ranges
          Canadians calculate most, by province”, we record <strong className="text-slate-800">one anonymous
          record per settled calculation</strong>. It contains:
        </p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>the calculator used, the province selected, and your gross income as a <strong className="text-slate-800">range</strong> (such as “$50k–$70k”) — never the amount;</li>
          <li>the interface language, your device type (phone, tablet or computer), browser family, operating-system family and, on some phones, the handset maker — never the full browser signature or a device fingerprint;</li>
          <li>the pay frequency you chose, a work-type label worked out from what you entered (full-time or part-time hourly, salaried, tipped, shift) — worked out, never asked — and where your pay sits against Statistics Canada’s median for your province, as a range, together with the median we compared it with;</li>
          <li>whether you opened the detailed breakdown, and, if you tap a paid report, which one — never anything about a purchase;</li>
          <li>which page of our own site you were on before calculating (the path only — never a link from another site and never anything after a “?”);</li>
          <li>optional answers you choose to give: the industry you compare against (and its position in the list, and whether this browser had chosen it before), why you are calculating, whether the result matched your expectation, where you work (on-site, remote, hybrid), your age group, tenure, union membership, employer size and vacation days;</li>
          <li>your typical work pattern when you use the shift or timesheet calculators (usual start and end hour, days per week, average shift length, unpaid break) — never the calendar dates you worked;</li>
          <li>broad ranges for entries you make (RRSP contribution as a share of pay, shift premium, overtime hours, tips as a share of pay) — always ranges;</li>
          <li>whether you were signed in (yes/no — never which account), and if you reopen a saved calculation and change it, the direction and rough size of the change and how long ago the original was saved — never the amounts;</li>
          <li>the hour and weekday on your own clock, and the time-zone name your browser reports (such as “America/Toronto”), which we use to check the map, not to place you;</li>
          <li>whether this device has recorded a calculation before — a single yes/no flag stored on the device, not an identifier;</li>
          <li>on the calculator other websites embed (our “widget”): the domain of the website it is embedded on — never the page, and never the visitor’s own address. The widget stores nothing in the browser, so it records no “before” flag;</li>
          <li>your approximate location, described in section 3.</li>
        </ul>
        <p>
          Records from one visit are grouped by a random temporary identifier that is discarded when you
          leave and is never reused. These records contain <strong className="text-slate-800">no names, no account
          identifiers, no IP addresses and no device fingerprints</strong>, and are not linked back to you.
        </p>
        <p>
          <strong className="text-slate-800">Opting out.</strong> Open any page of this site with <code>?notelemetry=1</code>{' '}
          added to the address and this browser will record nothing from then on — no calculation records and no page-view
          counting (<code>?notelemetry=0</code> turns it back on). The calculator works identically either way. The choice is
          stored in this browser for this site, so it does not follow you to other browsers or into our calculator where
          another website embeds it; a website that embeds it can switch recording off for all its visitors by adding{' '}
          <code>&amp;notelemetry=1</code> to the widget’s address. The iPhone app has no switch yet (section 6).
        </p>
      </Section>

      <Section n={3} id="location" title="Location and neighbourhood">
        <p>There are three levels, and only the first happens without you doing anything.</p>
        <ol className="list-decimal space-y-3 pl-5">
          <li>
            <strong className="text-slate-800">From your connection.</strong> Our hosting provider tells our server the
            country, region and city your connection appears to come from, and an approximate point for
            that connection, which is usually somewhere in that city. We keep that point rounded to about 11 km. <strong className="text-slate-800">Your IP address is
            not stored</strong> — not in these records, not in logs we keep. This is city-level and it is the
            same whether or not you answer anything below.
          </li>
          <li>
            <strong className="text-slate-800">Your postal-code prefix, if you type it.</strong> Under the result you may enter
            the first three characters of your postal code (a “forward sortation area”, an area of a few
            thousand households). In return you see where that income sits among the people who file
            taxes in that area, from Canada Revenue Agency statistics. We keep the three characters only.
            A full six-character postal code, which identifies about fifteen households, is never accepted.
            The prefix is remembered on your device so you are not asked again, and it is then included with
            each later calculation you make in this browser; press “Change” to replace it, or clear your
            browser’s site data to remove it and stop that.
          </li>
          <li>
            <strong className="text-slate-800">Your device location, if you press “Use my location”.</strong> This is off until
            you press the button, and your browser then asks you as well. The position is{' '}
            <strong className="text-slate-800">rounded on your device before anything is sent</strong>: to two decimal places
            (about 1 km) in urban areas, and to one decimal place (about 11 km) in rural areas, where a
            1 km square could be a single home. It is also matched, on your device, to the nearest
            postal-code prefix. What reaches us is that rounded point and that prefix — never the precise
            reading, and never more than once per calculation. Declining changes nothing about the
            calculator, and typing the prefix is always available instead.
          </li>
        </ol>
        <p>
          <strong className="text-slate-800">Why we ask, stated plainly.</strong> Neighbourhood-level answers let us publish and
          license <strong className="text-slate-800">aggregated statistics</strong> — for example, how many people in a given
          postal-code area calculated pay in a given income range this quarter — to organisations that
          have a use for them, including researchers, journalists, and real-estate or financial companies.
          Every figure we publish or license is a count for an area of thousands of households and is
          withheld unless at least twenty people are behind it. Licensees receive statistics, never
          records; their agreements prohibit attempting to identify anyone and prohibit reselling the
          data. We do not sell, rent or share personal information.
        </p>
        <p>
          <strong className="text-slate-800">Quebec residents.</strong> The location function is deactivated by default and
          activated only by your action, as the Act respecting the protection of personal information in
          the private sector requires; the paragraph above is the notice that Act calls for. A French
          version of this policy is at <a href="/fr/confidentialite">/fr/confidentialite</a>.
        </p>
      </Section>

      <Section n={4} id="cookies" title="Cookies, local storage and analytics">
        <p>
          <strong className="text-slate-800">Cookies only if you sign in.</strong> Signing in sets a cookie named{' '}
          <code>cp_session</code> that keeps you signed in for 30 days. While you sign in with Google or Apple, a
          second cookie (<code>cp_oauth</code> or <code>cp_apple</code>) carries the sign-in request for up to ten
          minutes and is then removed. They are essential to that feature, are not used for tracking or
          advertising, and are not set unless you sign in. We use no advertising or third-party tracking
          cookies, which is why this site has no cookie banner.
        </p>
        <p>
          <strong className="text-slate-800">Local storage on your device</strong> holds your language choice, your calculator
          settings when signed out, the calculations and timesheet entries you save while signed out, the
          industry you last compared against, the telemetry opt-out flag, the remembered postal-code prefix and the
          “has calculated before” flag, plus three entries for page-view counting (below): a session number
          for the tab (<code>_av_sid</code>), a “visited before” flag (<code>_av_seen</code>) and an off switch
          (<code>_av_off</code>). The tab’s session storage also holds the page your visit started on, and is
          cleared when you close the tab. None of it identifies you, it stays on your device, and clearing your
          browser’s site data removes all of it. The calculator other websites embed stores nothing.
        </p>
        <p>
          <strong className="text-slate-800">Page-view counting.</strong> Two cookieless counters run on this site. The first is
          ours, served from <code>avowd-analytics.qharbert.workers.dev</code> — a Cloudflare Worker on our own
          account, shared with our sister site Avowd. For each page it records the address (including anything
          after a “?”), the address of the page that linked here, your browser window’s size and language, how
          far down you scrolled, and, when you click a link to another website, an email address or a phone
          number, where that link goes and its text; it groups one tab’s pages by a random session number and
          notes whether this browser has visited before. The second is Cloudflare Web Analytics, our hosting
          provider’s page-view counter. Neither sets a cookie or stores an IP address. Neither runs when you
          have opted out, on the calculator other websites embed, or on report pages — whose address carries
          the key to your report. We do not use Google Analytics or any advertising network.
        </p>
        <p>
          <strong className="text-slate-800">Hosting.</strong> The site runs on Cloudflare, which processes every request to
          deliver it and protect it from abuse; Cloudflare may keep short-lived connection logs under its
          own privacy policy. Our own database never receives your IP address.
        </p>
      </Section>

      <Section n={5} id="accounts" title="Accounts and purchases">
        <p>
          An account is optional; every calculator feature works without one. You can sign in with Google,
          with Apple, or with a one-time link we email you. With Google or Apple we receive the name, email
          address and profile picture that provider shares; with an emailed link, only your email address. We store
          your saved calculations, timesheets and settings so they follow you across devices. Sign-in
          providers see that you signed in to our site under their own policies.
        </p>
        <p>
          If you buy a report, payment is taken by Stripe on Stripe’s page; we never see your card number.
          We keep the purchase record (product, amount, date, the email Stripe gives us, and the province
          and income range the report was about) because tax law requires a seller to keep sales records —
          currently for six years. The report itself is built from what you entered for it — your salary and
          the two provinces, or the two job offers — which is sent to us to create the payment and is held
          by Stripe with that payment, so the report can be rebuilt whenever you open its link. Our own
          records keep only the income range. See the <a href="/refunds">Refund Policy</a>.
        </p>
        <p>
          <strong className="text-slate-800">Deleting your account.</strong> Open the account menu on this site, or the history
          drawer in the app, and choose “Delete Account”. Your account, saved calculations, timesheets and
          settings are removed immediately and permanently. Purchase records are kept with your name and
          email stripped. The anonymous statistics in sections 2 and 3 are unaffected — they carry nothing
          that could be traced to you in the first place.
        </p>
      </Section>

      <Section n={6} id="app" title="The iPhone app">
        <p>
          The CanPay Insights app asks for no location permission and no contacts, camera or microphone
          access. It asks for photo-library access only when you save a report image. It records the same
          anonymous statistics as the website (section 2), placed at city level from the connection
          (section 3, level 1); the postal-code and device-location options in section 3 exist on the
          website only. The app does not yet have a switch to turn these statistics off; until it does, if you
          do not want them recorded, use the website with the opt-out in section 2.
        </p>
      </Section>

      <Section n={7} id="sharing" title="Who receives data">
        <ul className="list-disc space-y-1.5 pl-5">
          <li><strong className="text-slate-800">Service providers</strong> that process data on our behalf: Cloudflare (hosting, database, email delivery and both page-view counters), Stripe (payments), Google and Apple (sign-in). Each acts under its own privacy commitments and receives only what its function needs.</li>
          <li><strong className="text-slate-800">Licensees of aggregated statistics</strong>, as described in section 3 — statistics only, never records, under agreements that prohibit re-identification and resale.</li>
          <li><strong className="text-slate-800">The public</strong>, through the open datasets on our <a href="/data">data page</a>, which contain the same aggregated statistics with small groups withheld.</li>
          <li><strong className="text-slate-800">Authorities</strong>, where the law requires it.</li>
        </ul>
        <p>Data is processed in Canada and the United States, where our providers operate.</p>
      </Section>

      <Section n={8} id="retention" title="How long we keep things">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>Anonymous calculation records: kept indefinitely, because they are the dataset and contain nothing that identifies you.</li>
          <li>Account data: until you delete the account.</li>
          <li>Purchase records: six years after the tax year of the sale, then deleted.</li>
          <li>Emails you send us: as long as needed to answer, then archived or deleted.</li>
        </ul>
      </Section>

      <Section n={9} id="rights" title="Your rights and who to write to">
        <p>
          You may ask what personal information we hold about you, ask us to correct it, withdraw consent,
          or ask for deletion. Because the statistical records carry no identity, requests about them
          cannot be matched to a person — but the opt-out in section 2 stops any further recording from
          your browser, and “Change” or clearing site data removes a stored postal-code prefix.
        </p>
        <p>
          <strong className="text-slate-800">Person in charge of personal information (privacy officer):</strong> Qi Zhang,{' '}
          <a href="mailto:info@canpayinsights.ca">info@canpayinsights.ca</a>. We answer within 30 days.
        </p>
        <p>
          If you are not satisfied, you may complain to the Office of the Privacy Commissioner of Canada
          (priv.gc.ca) or, in Quebec, to the Commission d’accès à l’information (cai.gouv.qc.ca).
        </p>
        <p>The Service is not directed at children under 13, and we do not knowingly collect their information.</p>
      </Section>

      <Section n={10} id="changes" title="Changes to this policy">
        <p>
          We change this page when what we collect changes, and we say so on the{' '}
          <a href="/changelog">changelog</a>. This version (September 25, 2026) collects nothing new.
          It rewrites section 1 so that it no longer contradicts section 2 about the work pattern, describes
          what the embedded widget sends, and completes the list of what is kept in your browser (section 4).
        </p>
      </Section>

      <Section n={11} id="contact" title="Contact">
        <p>
          Questions and requests:{' '}
          <a href="mailto:info@canpayinsights.ca" className="font-medium text-red-600 underline underline-offset-2 hover:text-red-700">
            info@canpayinsights.ca
          </a>
          . CanPay Insights is operated by Qi Zhang (Avowd), Vancouver, British Columbia, Canada.
        </p>
      </Section>
    </LegalChrome>
  );
};

export default PrivacyPolicy;
