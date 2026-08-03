export default function LoadingCreatorPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Nav */}
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-gray-100 h-14" />

      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-8">
        {/* Back link skeleton */}
        <div className="h-4 w-24 bg-gray-100 rounded mb-6 animate-pulse" />

        {/* Creator header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 rounded-full bg-gray-200 animate-pulse shrink-0" />
          <div className="space-y-2">
            <div className="h-5 w-40 bg-gray-200 rounded animate-pulse" />
            <div className="h-3 w-24 bg-gray-100 rounded animate-pulse" />
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 p-4">
              <div className="h-3 w-16 bg-gray-100 rounded mb-2 animate-pulse" />
              <div className="h-6 w-20 bg-gray-200 rounded animate-pulse" />
            </div>
          ))}
        </div>

        {/* Chart area */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 mb-6">
          <div className="h-4 w-32 bg-gray-100 rounded mb-4 animate-pulse" />
          <div className="h-40 bg-gray-50 rounded animate-pulse" />
        </div>

        {/* Deals list */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="h-4 w-24 bg-gray-100 rounded mb-4 animate-pulse" />
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                <div className="h-4 flex-1 bg-gray-100 rounded animate-pulse" />
                <div className="h-4 w-16 bg-gray-100 rounded animate-pulse" />
                <div className="h-4 w-12 bg-gray-100 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
