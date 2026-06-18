import Image from "next/image";
import Link from "next/link";

interface Props {
  isShare?: boolean;
}

export default function TopNav({ isShare = false }: Props) {
  return (
    <header className="bg-white border-b border-gray-100 px-6 h-14 flex items-center justify-between sticky top-0 z-50">
      <Link href={isShare ? "#" : "/"} className="flex items-center gap-2.5">
        <Image
          src="/tgs-logo.png"
          alt="The Gold Studios"
          width={28}
          height={28}
          className="object-contain"
        />
        <span className="text-[13px] font-semibold text-gray-800 tracking-tight">The Gold Studios</span>
        <span className="text-gray-200 text-sm">|</span>
        <span className="text-[13px] text-gray-400 tracking-tight">Creator Analytics</span>
      </Link>

      <div className="flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-[#3ddc6e] animate-pulse inline-block" />
        <span className="text-[11px] font-medium text-gray-400 tracking-wide">Live</span>
      </div>
    </header>
  );
}
