export default function ProductLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Header Skeleton */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-7 bg-gray-200 rounded-sm animate-pulse"></div>
            <div className="w-32 h-6 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-24 h-8 bg-gray-200 rounded animate-pulse"></div>
            <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb Skeleton */}
        <div className="flex items-center gap-2 mb-8">
          <div className="w-12 h-4 bg-gray-200 rounded animate-pulse"></div>
          <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
          <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
          <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
          <div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
        </div>

        {/* Back Button Skeleton */}
        <div className="w-20 h-10 bg-gray-200 rounded animate-pulse mb-6"></div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Image Skeleton */}
          <div className="space-y-4">
            <div className="aspect-square bg-gray-200 rounded-2xl animate-pulse"></div>
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="aspect-square bg-gray-200 rounded-lg animate-pulse"></div>
              ))}
            </div>
          </div>

          {/* Product Details Skeleton */}
          <div className="space-y-6">
            <div>
              <div className="w-3/4 h-8 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="w-1/2 h-6 bg-gray-200 rounded animate-pulse mb-4"></div>
            </div>

            <div className="w-1/3 h-12 bg-gray-200 rounded animate-pulse"></div>

            <div className="w-1/4 h-6 bg-gray-200 rounded animate-pulse"></div>

            <div className="space-y-2">
              <div className="w-full h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-5/6 h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-4/5 h-4 bg-gray-200 rounded animate-pulse"></div>
            </div>

            <div className="space-y-3">
              <div className="w-full h-12 bg-gray-200 rounded animate-pulse"></div>
              <div className="flex gap-3">
                <div className="flex-1 h-12 bg-gray-200 rounded animate-pulse"></div>
                <div className="flex-1 h-12 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Skeleton */}
        <div className="mt-16">
          <div className="flex gap-4 mb-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-24 h-10 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
          <div className="w-full h-64 bg-gray-200 rounded animate-pulse"></div>
        </div>

        {/* Related Products Skeleton */}
        <div className="mt-16">
          <div className="w-48 h-8 bg-gray-200 rounded animate-pulse mx-auto mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-4">
                <div className="aspect-square bg-gray-200 rounded-lg animate-pulse"></div>
                <div className="w-3/4 h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="w-1/2 h-6 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
