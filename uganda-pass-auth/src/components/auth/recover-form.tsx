"use client"

import { Card, CardContent } from "@/components/ui/card"

export function RecoverForm() {
  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="h-3 bg-gradient-to-r from-black via-yellow-400 to-red-600 rounded-t-lg"></div>

      <Card className="shadow-xl rounded-t-none">
        <CardContent className="p-12">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-4 text-balance">
              Recover your account or register a new device
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-red-600 mx-auto rounded-full"></div>
          </div>

          {/* Step 1 */}
          <div className="mb-16">
            <div className="flex items-center justify-center mb-6">
              <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-black px-4 py-2 rounded-full font-bold text-lg shadow-lg">
                Step 1
              </div>
            </div>

            <p className="text-center text-gray-600 mb-8 text-lg">Open Pass mobile app or scan QR code to download</p>

            <div className="flex justify-center mb-8">
              <div className="bg-white p-6 rounded-2xl shadow-lg border-4 border-gradient-to-r from-yellow-400 to-red-600">
                <div className="w-48 h-48 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                  {/* QR Code placeholder with Uganda colors */}
                  <div className="grid grid-cols-8 gap-1 p-4">
                    {Array.from({ length: 64 }).map((_, i) => (
                      <div
                        key={i}
                        className={`w-3 h-3 ${
                          Math.random() > 0.5
                            ? "bg-black"
                            : i % 3 === 0
                              ? "bg-yellow-400"
                              : i % 3 === 1
                                ? "bg-red-600"
                                : "bg-white"
                        } rounded-sm`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <div className="bg-black rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
                <div className="flex items-center px-6 py-3">
                  <div className="text-white mr-3">
                    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                    </svg>
                  </div>
                  <div className="text-white">
                    <div className="text-xs">Download on the</div>
                    <div className="text-lg font-semibold">App Store</div>
                  </div>
                </div>
              </div>

              <div className="bg-black rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
                <div className="flex items-center px-6 py-3">
                  <div className="text-white mr-3">
                    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
                    </svg>
                  </div>
                  <div className="text-white">
                    <div className="text-xs">GET IT ON</div>
                    <div className="text-lg font-semibold">Google Play</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="border-t-2 border-gray-100 pt-12">
            <div className="flex items-center justify-center mb-6">
              <div className="bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-2 rounded-full font-bold text-lg shadow-lg">
                Step 2
              </div>
            </div>

            <p className="text-center text-gray-600 text-lg leading-relaxed">
              On the initial start-up screen, tap{" "}
              <span className="font-semibold text-red-600">&quot;I have an account&quot;</span> to recover your account or
              register a new device
            </p>

            <div className="flex justify-center mt-8">
              <div className="bg-gray-100 px-4 py-2 rounded-lg border-2 border-dashed border-gray-300">
                <span className="text-sm text-gray-500 font-mono">pass.recovery</span>
              </div>
            </div>
          </div>

          <div className="text-center mt-12 pt-8 border-t border-gray-100">
        
            <p className="text-xs text-gray-400 mt-2">Digital Identity System</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
