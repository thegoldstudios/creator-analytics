export default function TermsOfService() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16 text-gray-800">
      {/* App icon + name */}
      <div className="flex items-center gap-3 mb-10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/tgs-logo.png" alt="Gold Studios Talent Analytics" width={40} height={40} className="object-contain" />
        <span className="text-[15px] font-semibold text-gray-900">Gold Studios Talent Analytics</span>
      </div>

      <h1 className="text-3xl font-bold mb-2">Gold Studios Talent Analytics Terms of Service</h1>
      <p className="text-sm text-gray-400 mb-10">Last updated: 6 July 2026</p>

      <p className="mb-6">
        These Terms of Service (&quot;Terms&quot;) govern your use of <strong>Gold Studios Talent Analytics</strong> (&quot;the App&quot; or &quot;the Platform&quot;) operated by The Gold Studios Ltd (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;), registered at Unit 2, 2 Centric Close, Oval Road, London, NW1 7EP, United Kingdom. By connecting your social media accounts or accessing the Platform, you agree to these Terms.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">1. About the Platform</h2>
      <p className="mb-6">
        Gold Studios Talent Analytics is a talent management tool that allows creators represented by The Gold Studios to securely connect their social media accounts. The Platform enables our team to track content performance, prepare brand partnership materials, and support the professional development of the creators we represent.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">2. Eligibility</h2>
      <p className="mb-6">
        The Platform is available to creators who are represented by The Gold Studios and to authorised members of our team. By using the Platform, you confirm that you have been invited to do so by The Gold Studios and that you are at least 18 years of age.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">3. Account Connection</h2>
      <p className="mb-6">
        By connecting your TikTok, Instagram, or YouTube account to Gold Studios Talent Analytics, you authorise The Gold Studios to access your account analytics and profile data via each platform&apos;s official API. You may revoke this access at any time through your account settings on the respective platform.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">4. Use of Data</h2>
      <p className="mb-6">
        Data accessed through your connected accounts will be used solely to support your representation by The Gold Studios. This includes preparing performance reports, brand partnership proposals, and strategic career guidance. We will not sell, share, or disclose your data to any third party without your explicit consent, except where required by law.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">5. Acceptable Use</h2>
      <p className="mb-4">You agree not to:</p>
      <ul className="list-disc pl-6 mb-6 space-y-2">
        <li>Access the Platform using credentials that do not belong to you</li>
        <li>Attempt to reverse engineer, copy, or reproduce any part of the Platform</li>
        <li>Use the Platform for any unlawful purpose or in violation of any applicable platform policies</li>
        <li>Interfere with the security or integrity of the Platform</li>
      </ul>

      <h2 className="text-xl font-semibold mt-8 mb-3">6. Intellectual Property</h2>
      <p className="mb-6">
        All content, design, code, and functionality of Gold Studios Talent Analytics is the property of The Gold Studios Ltd. Your social media content and data remain your own property at all times.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">7. Limitation of Liability</h2>
      <p className="mb-6">
        The Gold Studios is not liable for any inaccuracies in data provided by third-party platforms including TikTok, Instagram, or YouTube. To the fullest extent permitted by law, our total liability to you shall not exceed £100.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">8. Termination</h2>
      <p className="mb-6">
        We reserve the right to suspend or terminate your access to the Platform at any time, including if our representation agreement with you ends. Upon termination, we will delete your access tokens and associated data within 30 days in accordance with our Privacy Policy.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">9. Governing Law</h2>
      <p className="mb-6">
        These Terms are governed by the laws of England and Wales. Any disputes arising from these Terms shall be subject to the exclusive jurisdiction of the courts of England and Wales.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">10. Changes to Terms</h2>
      <p className="mb-6">
        We reserve the right to update these Terms at any time. Changes will be posted on this page with an updated date.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">11. Contact</h2>
      <p className="mb-2">For questions about these Terms, please contact us:</p>
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
