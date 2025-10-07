import { Check } from "lucide-react";

export default function BookingSteps({ step }) {
  return (
    <div className="w-full bg-white border-b">
      <div className="max-w-5xl mx-auto px-6 py-6">
        <div className="relative flex items-center">
          {/* Line background */}
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -translate-y-1/2"></div>

          {/* Line progress */}
          <div
            className="absolute top-1/2 left-0 h-0.5 bg-green-500 -translate-y-1/2 transition-all duration-500"
            style={{
              width: step === 1 ? "0%" : step === 2 ? "50%" : "100%",
            }}
          ></div>

          {/* Step 1 */}
          <div className="flex-1 flex flex-col items-center z-10">
            <div className="w-8 h-8 flex items-center justify-center rounded-full bg-green-500 text-white">
              <Check size={18} />
            </div>
            <span className="mt-2 text-sm font-medium text-black">
              Choose booking
            </span>
          </div>

          {/* Step 2 */}
          <div className="flex-1 flex flex-col items-center z-10">
            <div
              className={`w-8 h-8 flex items-center justify-center rounded-full 
                ${step === 2 ? "bg-orange-500 text-white" : step > 2 ? "bg-green-500 text-white" : "bg-gray-300 text-gray-500"}`}
            >
              {step === 2 ? "…" : step > 2 ? <Check size={18} /> : "2"}
            </div>
            <span
              className={`mt-2 text-sm font-medium ${
                step >= 2 ? "text-black" : "text-gray-400"
              }`}
            >
              Enter info
            </span>
          </div>

          {/* Step 3 */}
          <div className="flex-1 flex flex-col items-center z-10">
            <div
              className={`w-8 h-8 flex items-center justify-center rounded-full 
                ${step === 3 ? "bg-orange-500 text-white" : "bg-gray-300 text-gray-500"}`}
            >
              {step === 3 ? "…" : "3"}
            </div>
            <span
              className={`mt-2 text-sm font-medium ${
                step === 3 ? "text-black" : "text-gray-400"
              }`}
            >
              Pay
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
