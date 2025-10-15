import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export function ClassPageSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header Section Skeleton */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-9 w-32" /> {/* Back button */}
            <Skeleton className="h-9 w-24" /> {/* Action button */}
          </div>
          
          <div className="bg-white rounded-2xl p-6 border shadow-sm">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <Skeleton className="w-16 h-16 rounded-2xl" /> {/* Class icon */}
                  <div className="flex-1">
                    <Skeleton className="h-8 w-64 mb-2" /> {/* Class title */}
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-6 w-24 rounded-full" /> {/* Access badge */}
                    </div>
                  </div>
                </div>
                <Skeleton className="h-4 w-full mb-2" /> {/* Description line 1 */}
                <Skeleton className="h-4 w-3/4 mb-2" /> {/* Description line 2 */}
                <Skeleton className="h-4 w-48" /> {/* Access message */}
              </div>
              
              <div className="hidden md:flex items-center gap-4">
                <div className="text-center">
                  <Skeleton className="h-8 w-8 mx-auto mb-1" /> {/* Stat number */}
                  <Skeleton className="h-3 w-12" /> {/* Stat label */}
                </div>
                <div className="text-center">
                  <Skeleton className="h-8 w-8 mx-auto mb-1" /> {/* Stat number */}
                  <Skeleton className="h-3 w-16" /> {/* Stat label */}
                </div>
                <Skeleton className="h-9 w-28" /> {/* Manage access button */}
              </div>
            </div>
          </div>
        </div>

        {/* Section Title */}
        <div className="mb-8">
          <Skeleton className="h-7 w-48 mb-2" /> {/* Section title */}
          <Skeleton className="h-4 w-96" /> {/* Section description */}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Subject Sidebar Skeleton */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <Skeleton className="h-6 w-20" /> {/* "Subjects" title */}
              </CardHeader>
              <CardContent className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="p-3 rounded-xl bg-gray-50">
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-6 h-6 rounded" /> {/* Subject icon */}
                      <div className="flex-1">
                        <Skeleton className="h-4 w-20 mb-1" /> {/* Subject name */}
                        <Skeleton className="h-3 w-16" /> {/* Chapters count */}
                      </div>
                      <div className="text-right">
                        <Skeleton className="h-3 w-8 mb-1" /> {/* Progress % */}
                        <Skeleton className="w-8 h-1 rounded-full" /> {/* Progress bar */}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area Skeleton */}
          <div className="lg:col-span-3">
            <Card className="overflow-hidden">
              {/* Subject Header */}
              <CardHeader className="bg-gray-100">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-12 h-12 rounded" /> {/* Subject icon */}
                  <div className="flex-1">
                    <Skeleton className="h-7 w-32 mb-1" /> {/* Subject name */}
                    <Skeleton className="h-4 w-48" /> {/* Subject description */}
                  </div>
                  <div className="text-right">
                    <Skeleton className="h-7 w-12 mb-1" /> {/* Progress % */}
                    <Skeleton className="h-4 w-16" /> {/* Complete text */}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-0">
                <div className="p-6 space-y-6">
                  {/* Chapter Skeletons */}
                  {[1, 2, 3].map((chapterIndex) => (
                    <div key={chapterIndex} className="border border-gray-200 rounded-2xl overflow-hidden">
                      {/* Chapter Header */}
                      <div className="bg-gray-50 px-6 py-4 border-b">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Skeleton className="w-8 h-8 rounded-full" /> {/* Chapter number */}
                            <div>
                              <Skeleton className="h-5 w-32 mb-1" /> {/* Chapter name */}
                              <Skeleton className="h-3 w-20" /> {/* Topics count */}
                            </div>
                          </div>
                          <div className="text-right">
                            <Skeleton className="h-4 w-8 mb-1" /> {/* Progress % */}
                            <Skeleton className="w-20 h-2 rounded-full" /> {/* Progress bar */}
                          </div>
                        </div>
                      </div>

                      {/* Topics Grid */}
                      <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                        {[1, 2, 3, 4, 5, 6].map((topicIndex) => (
                          <div 
                            key={topicIndex} 
                            className="p-4 border border-gray-200 rounded-xl bg-white hover:shadow-md transition-all"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <Skeleton className="w-8 h-8 rounded-full" /> {/* Topic status icon */}
                                <div className="flex-1">
                                  <Skeleton className="h-4 w-24 mb-1" /> {/* Topic name */}
                                  <Skeleton className="h-3 w-16" /> {/* Topic type */}
                                </div>
                              </div>
                              <Skeleton className="w-6 h-6 rounded" /> {/* Play/lock icon */}
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <Skeleton className="h-3 w-16" /> {/* Progress label */}
                                <Skeleton className="h-3 w-8" /> {/* Progress % */}
                              </div>
                              <Skeleton className="w-full h-1.5 rounded-full" /> {/* Progress bar */}
                            </div>

                            <div className="flex items-center justify-between mt-3 pt-3 border-t">
                              <div className="flex items-center gap-2">
                                <Skeleton className="w-4 h-4 rounded" /> {/* Star icon */}
                                <Skeleton className="h-3 w-8" /> {/* Rating */}
                                <Skeleton className="h-3 w-12" /> {/* Rating count */}
                              </div>
                              <Skeleton className="h-3 w-12" /> {/* Duration */}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}