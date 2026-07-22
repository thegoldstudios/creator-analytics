import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Gold Studios Talent Analytics",
  description: "Live creator analytics dashboard",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geist.className} bg-[#f4f4f2] text-gray-900 min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
