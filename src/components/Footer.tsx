import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-gray-100 mt-16 py-6 px-6">
      <div className="max-w-5xl mx-auto flex items-center justify-between flex-wrap gap-3">
        <p className="text-[11px] text-gray-300">
          © {new Date().getFullYear()} The Gold Studios Ltd
        </p>
        <div className="flex items-center gap-4">
          <Link href="/privacy" className="text-[11px] text-gray-300 hover:text-gray-500 transition-colors">
            Privacy Policy
          </Link>
          <Link href="/terms" className="text-[11px] text-gray-300 hover:text-gray-500 transition-colors">
            Terms of Service
          </Link>
        </div>
      </div>
    </footer>
  );
}
