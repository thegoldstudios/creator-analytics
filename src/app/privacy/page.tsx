export default function PrivacyPolicy() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16 text-gray-800">
      {/* App icon + name */}
      <div className="flex items-center gap-3 mb-10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/tgs-logo.png" alt="Gold Studios Talent Analytics" width={40} height={40} className="object-contain" />
        <span className="text-[15px] font-semibold text-gray-900">Gold Studios Talent Analytics</span>
      </div>

      <h1 className="text-3xl font-bold mb-2">Gold Studios Talent Analytics Privacy Policy</h1>
      <p className="text-sm text-gray-400 mb-10">Last updated: 6 July 2026</p>

      <p className="mb-6">
        This Privacy Policy describes how The Gold Studios Ltd (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) collects, uses, and protects information obtained through <strong>Gold Studios Talent Analytics</strong> (&quot;the App&quot; or &quot;the Platform&quot;). By connecting your social media accounts or using the Platform, you agree to the terms of this policy.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">1. Who We Are</h2>
      <p className="mb-6">
        The Gold Studios Ltd is a talent management agency that represents social media creators across TikTok, Instagram, and YouTube. Gold Studios Talent Analytics is our creator analytics platform that enables creators we represent to securely connect their social media accounts so that we can track performance, prepare campaign reports, and support their professional development.
      </p>
      <p className="mb-6">
        Our registered address is: Unit 2, 2 Centric Close, Oval Road, London, NW1 7EP, United Kingdom.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">2. Information We Collect</h2>
      <p className="mb-4">When you connect your social media accounts to Gold Studios Talent Analytics, we may collect the following information:</p>
      <ul className="list-disc pl-6 mb-6 space-y-2">
        <li>TikTok account information including username, display name, follower count, and public profile data</li>
        <li>TikTok analytics data including video views, engagement rates, and audience demographics</li>
        <li>Instagram account information and performance analytics where authorised</li>
        <li>YouTube channel statistics, subscriber counts, and video performance data where authorised</li>
        <li>OAuth access tokens used to retrieve the above data on your behalf</li>
      </ul>
      <p className="mb-6">
        We only collect data that you explicitly authorise us to access through the official OAuth consent flows provided by each platform.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">3. How We Use Your Information</h2>
      <p className="mb-4">We use the data collected solely for the following purposes:</p>
      <ul className="list-disc pl-6 mb-6 space-y-2">
        <li>To display analytics dashboards within Gold Studios Talent Analytics showing your content performance across platforms</li>
        <li>To generate media kits and reports used in brand partnership discussions on your behalf</li>
        <li>To monitor performance trends and provide strategic guidance to support your career</li>
        <li>To identify growth opportunities and benchmark your performance within your content category</li>
      </ul>
      <p className="mb-6">
        We do not sell, rent, or share your personal data or analytics with any third parties for advertising or marketing purposes.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">4. Data Storage and Security</h2>
      <p className="mb-6">
        Your access tokens and analytics data are stored securely using industry-standard encryption. We use Vercel&apos;s cloud infrastructure for hosting and Upstash Redis for secure token storage. Access to your data is restricted to authorised members of The Gold Studios team who require it to perform their role.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">5. Data Retention</h2>
      <p className="mb-6">
        We retain your data for the duration of our working relationship. If you leave our representation or request deletion of your data, we will remove your access tokens and associated analytics data within 30 days of your request.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">6. Your Rights</h2>
      <p className="mb-4">You have the following rights regarding your personal data:</p>
      <ul className="list-disc pl-6 mb-6 space-y-2">
        <li>The right to access the data we hold about you</li>
        <li>The right to request correction or deletion of your data</li>
        <li>The right to withdraw consent and revoke platform access at any time through your TikTok, Instagram, or YouTube account settings</li>
        <li>The right to data portability — you may request a copy of your data in a readable format</li>
        <li>The right to lodge a complaint with the Information Commissioner&apos;s Office (ICO) if you believe your data has been mishandled</li>
      </ul>

      <h2 className="text-xl font-semibold mt-8 mb-3">7. Third-Party Platforms</h2>
      <p className="mb-6">
        Gold Studios Talent Analytics integrates with TikTok, Instagram (Meta), and YouTube (Google) via their official APIs. Your use of those platforms is governed by their respective privacy policies. We only request access to data scopes necessary for the purposes described in this policy.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">8. Cookies</h2>
      <p className="mb-6">
        The Platform uses a session cookie solely to maintain your authenticated session while you are logged in. We do not use tracking cookies or third-party advertising cookies.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">9. Changes to This Policy</h2>
      <p className="mb-6">
        We may update this Privacy Policy from time to time. Updates will be posted on this page with a revised date.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">10. Contact Us</h2>
      <p className="mb-2">If you have any questions about this Privacy Policy, please contact us:</p>
      <p className="mb-1">
        <strong>Email:</strong>{" "}
        <a href="mailto:blake@thegoldstudios.com" className="text-blue-600 underline">blake@thegoldstudios.com</a>
      </p>
      <p className="mb-6">
        <strong>Address:</strong> Unit 2, 2 Centric Close, Oval Road, London, NW1 7EP, United Kingdom
      </p>
    </div>
  );
}
