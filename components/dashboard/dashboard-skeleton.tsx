import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header Skeleton */}
      <div className="relative overflow-hidden bg-white border-b border-gray-200">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-indigo-600/5" />
        <div className="relative max-w-7xl mx-auto px-6 py-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Skeleton className="w-16 h-16 rounded-2xl" />
              <div>
                <Skeleton className="h-8 w-64 mb-2" />
                <div className="flex items-center gap-4">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
              </div>
            </div>
            <Skeleton className="h-10 w-24 rounded-md" />
          </div>

          {/* Stats Overview Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border">
                <div className="flex items-center justify-between">
                  <div>
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-8 w-12" />
                  </div>
                  <Skeleton className="w-10 h-10 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Class Cards Section Skeleton */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <Skeleton className="h-7 w-48 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Card key={i} className="border-0 shadow-md bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                {/* Badge Skeleton */}
                <div className="absolute top-4 right-4">
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>

                {/* Icon Section Skeleton */}
                <div className="relative mb-6">
                  <Skeleton className="w-full h-32 rounded-xl" />
                </div>

                {/* Title and Description Skeleton */}
                <div className="space-y-2">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Stats Grid Skeleton */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 p-3 bg-white/60 rounded-lg border border-gray-100">
                    <Skeleton className="w-4 h-4 rounded-full" />
                    <div>
                      <Skeleton className="h-3 w-8 mb-1" />
                      <Skeleton className="h-4 w-6" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-white/60 rounded-lg border border-gray-100">
                    <Skeleton className="w-4 h-4 rounded-full" />
                    <div>
                      <Skeleton className="h-3 w-12 mb-1" />
                      <Skeleton className="h-4 w-6" />
                    </div>
                  </div>
                </div>

                {/* Progress Section Skeleton */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-8" />
                  </div>
                  <Skeleton className="w-full h-2.5 rounded-full" />
                </div>

                {/* Action Button Skeleton */}
                <div className="pt-2">
                  <Skeleton className="w-full h-10 rounded-md" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

export function HeaderSkeleton() {
  return (
    <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-40">
      <div className="container px-4 py-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-9 w-9 rounded-full" />
        </div>
      </div>
    </header>
  )
}