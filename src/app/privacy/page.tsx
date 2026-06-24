export default function PrivacyPolicy() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16 text-gray-800">
      <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
      <p className="text-sm text-gray-400 mb-10">Last updated: 24 June 2026</p>

      <p className="mb-6">
        This Privacy Policy describes how The Gold Studios Ltd ("we", "us", or "our") collects, uses, and protects information obtained through our Creator Analytics platform ("the App"). By using the App, you agree to the terms of this policy.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">1. Who We Are</h2>
      <p className="mb-6">
        The Gold Studios is a talent management agency. The App is an internal tool used by our team to view and manage analytics for creators we represent. It is not a public-facing consumer product.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">2. Information We Collect</h2>
      <p className="mb-4">When creators connect their social media accounts, we may collect the following:</p>
      <ul className="list-disc pl-6 mb-6 space-y-2">
        <li>TikTok account information including username, follower count, and public profile data</li>
        <li>TikTok analytics data including video views, engagement rates, and audience demographics</li>
        <li>Instagram account information and analytics where authorised</li>
        <li>YouTube channel statistics where authorised</li>
        <li>OAuth access tokens used to retrieve the above data on an ongoing basis</li>
      </ul>

      <h2 className="text-xl font-semibold mt-8 mb-3">3. How We Use Your Information</h2>
      <p className="mb-4">We use the collected data solely for the following purposes:</p>
      <ul className="list-disc pl-6 mb-6 space-y-2">
        <li>To display analytics dashboards to authorised members of The Gold Studios team</li>
        <li>To generate reports used in brand partnership discussions on behalf of the creator</li>
        <li>To monitor performance trends to support the creator's career development</li>
      </ul>
      <p className="mb-6">We do not sell, rent, or share your data with any third parties for marketing or advertising purposes.</p>

      <h2 className="text-xl font-semibold mt-8 mb-3">4. Data Storage and Security</h2>
      <p className="mb-6">
        Access tokens and analytics data are stored securely using industry-standard encryption. Access is restricted to authorised personnel at The Gold Studios only. We use Vercel's infrastructure for hosting and Upstash Redis for secure token storage, both of which comply with industry security standards.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">5. Data Retention</h2>
      <p className="mb-6">
        We retain your data for as long as you are represented by The Gold Studios. Upon request or upon termination of our working relationship, we will delete your access tokens and associated data within 30 days.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">6. Your Rights</h2>
      <p className="mb-4">You have the right to:</p>
      <ul className="list-disc pl-6 mb-6 space-y-2">
        <li>Request access to the data we hold about you</li>
        <li>Request correction or deletion of your data</li>
        <li>Withdraw your consent and revoke platform access at any time via the respective platform's settings</li>
      </ul>

      <h2 className="text-xl font-semibold mt-8 mb-3">7. Third-Party Platforms</h2>
      <p className="mb-6">
        Our App integrates with TikTok, Instagram, and YouTube via their official APIs. Your use of those platforms is governed by their respective privacy policies. We only access data that you explicitly authorise through their OAuth flows.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">8. Changes to This Policy</h2>
      <p className="mb-6">
        We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated date. Continued use of the App constitutes acceptance of any changes.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">9. Contact Us</h2>
      <p className="mb-6">
        If you have any questions about this Privacy Policy, please contact us at:{" "}
        <a href="mailto:blake@thegoldstudios.com" className="text-blue-600 underline">
          blake@thegoldstudios.com
        </a>
      </p>
    </div>
  );
}
