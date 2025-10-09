import { Check, Calendar, FileText, CreditCard } from "lucide-react";

export default function OrderStatusSteps({ step }) {
  const steps = [
    { id: 1, label: "Chọn tour", icon: Calendar },
    { id: 2, label: "Nhập thông tin", icon: FileText },
    { id: 3, label: "Thanh toán", icon: CreditCard },
    { id: 4, label: "Hoàn tất", icon: Check }
  ];

  return (
    <div className="w-full bg-white border-b border-gray-100">
      <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="relative">
            {/* Background line */}
            <div className="absolute top-5 left- *:0 w-full h-1 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100"></div>

            {/* Progress line with glass effect */}
            <div
              className="absolute top-5 left-0 h-1 bg-gradient-to-r from-blue-400 via-blue-500 to-emerald-400 transition-all duration-700 ease-in-out shadow-sm"
              style={{
                width: `${((step - 1) / (steps.length - 1)) * 120}%`,
              }}
            ></div>

            {/* Steps */}
            <div className="relative flex justify-between">
              {steps.map((s, index) => {
                const isCompleted = step > s.id;
                const isCurrent = step === s.id;
                const isPending = step < s.id;
                const Icon = s.icon;

                return (
                  <div
                    key={s.id}
                    className="flex flex-col items-center flex-1"
                  >
                    {/* Circle */}
                    <div
                      className={`
                        w-10 h-10 rounded-full flex items-center justify-center
                        transition-all duration-500 transform backdrop-blur-sm0
                        ${isCompleted ? "bg-gradient-to-br from-emerald-400 to-emerald-500 shadow-lg" : ""}
                        ${isCurrent ? "bg-gradient-to-br from-blue-500 to-blue-600 shadow-xl shadow-blue-200 scale-110" : ""}
                        ${isPending ? "bg-white border-2 border-gray-200" : ""}
                      `}
                    >
                      {isCompleted ? (
                        <Check size={18} className="text-white" strokeWidth={3} />
                      ) : isCurrent ? (
                        <Icon size={18} className="text-white" />
                      ) : (
                        <Icon size={16} className="text-gray-400" />
                      )}
                    </div>

                    {/* Label */}
                    <span
                      className={`
                        mt-3 text-sm font-medium text-center transition-all duration-300
                        ${isCompleted ? "text-emerald-600" : ""}
                        ${isCurrent ? "text-blue-600" : ""}
                        ${isPending ? "text-gray-500" : ""}
                      `}
                    >
                      {s.label}
                    </span>

                    {/* Status indicator with glass effect */}
                    {isCurrent && (
                      <div className="mt-2 px-3 py-1 bg-blue-50 backdrop-blur-sm rounded-full border border-blue-100">
                        <span className="text-xs font-medium text-blue-600">
                          {step === 1 ? "Chọn tour" : step === 2 ? "Điền thông tin" : step === 3 ? "Xác nhận thanh toán" : "Đã xong"}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
  );
}

// Example usage - you can cycle through steps
function App() {
  const [currentStep, setCurrentStep] = React.useState(2);

  return (
    <div className="min-h-screen bg-gray-50">
      <OrderStatusSteps step={currentStep} />
      
      {/* Demo controls */}
      <div className="max-w-4xl mx-auto px-6 mt-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Demo Controls</h3>
          <div className="flex gap-2 flex-wrap">
            {[1, 2, 3, 4].map(step => (
              <button
                key={step}
                onClick={() => setCurrentStep(step)}
                className={`px-5 py-2.5 rounded-xl font-medium transition-all ${
                  currentStep === step
                    ? "bg-blue-500 text-white shadow-lg shadow-blue-200"
                    : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                Bước {step}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}