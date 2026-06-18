interface Props {
  label: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
}

export default function StatCard({ label, value, sub, icon }: Props) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-gray-400">
          {icon}
          {label}
        </span>
        <svg className="w-3.5 h-3.5 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <p className="text-[28px] font-bold text-gray-900 tracking-tight leading-none">{value}</p>
      {sub && (
        <p className="text-[12px] font-semibold mt-2" style={{ color: "#3ddc6e" }}>
          {sub}
        </p>
      )}
    </div>
  );
}
