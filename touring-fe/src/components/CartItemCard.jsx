import { Minus, Plus, Trash2, Calendar, MapPin, Clock, AlertCircle} from "lucide-react";

export default function CartItemCard({
  item,
  onRemove,
  onUpdateQuantity,
  onToggleSelect,
}) {
  // CHANGED: only consider warning when available
  const hasChildrenWithoutAdults =
    item.available && item.adults === 0 && item.children > 0;

  return (
    <div className={`bg-white rounded-2xl shadow-sm p-6 flex gap-4 transition hover:shadow-md ${!item.available ? "opacity-70" : ""}`}>
      {/* Tick chọn */}
      <div className="flex flex-col items-center pt-2">
        <input
          type="checkbox"
          checked={item.selected}
          disabled={!item.available}
          onChange={() => onToggleSelect(item.id)}
          className="w-5 h-5 accent-orange-500 cursor-pointer"
        />
      </div>

      {/* Image */}
      <div className="relative flex-shrink-0 w-32 h-32">
        <img src={item.image} alt={item.name} className="w-32 h-32 object-cover rounded-xl" />
        {!item.available && (
          <div className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center">
            <span className="text-white text-xs font-medium">Hết chỗ</span>
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between mb-2">
          <div>
            <h3 className="font-semibold text-gray-900 line-clamp-2">{item.name}</h3>
            <p className="text-sm text-gray-500">{item.subtitle}</p>
          </div>
          <button onClick={() => onRemove(item.id)} className="text-gray-400 hover:text-red-500">
            <Trash2 className="w-5 h-5" />
          </button>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-3">
          <Tag label={item.date} Icon={Calendar} color="blue" />
          <Tag label={item.duration} Icon={Clock} color="green" />
          <Tag label={item.locations} Icon={MapPin} color="indigo" />
        </div>

        {/* Cảnh báo hết chỗ */}
        {!item.available && (
          <div className="flex items-center gap-2 text-red-600 mb-3 bg-red-50 p-2 rounded-lg">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">Dịch vụ không hỗ trợ, vui lòng đặt lại</span>
          </div>
        )}

        {/* CHANGED: Only show quantities when available */}
        {item.available && (
          <>
            {/* Quantity */}
            <div className="grid grid-cols-2 gap-4">
              <QuantityBox
                label="Người lớn"
                price={item.adultPrice}
                value={item.adults}
                disabled={!item.available}
                onChange={(val) => {
                  onUpdateQuantity(item.id, "adults", val - item.adults);
                  if (val === 0 && item.children > 0) {
                    onUpdateQuantity(item.id, "children", -item.children);
                  }
                }}
              />
              <QuantityBox
                label="Trẻ em ( < 14 tuổi )"
                price={item.childPrice}
                value={item.children}
                disabled={!item.available || item.adults === 0}
                onChange={(val) => onUpdateQuantity(item.id, "children", val - item.children)}
              />
            </div>

            {/* Cảnh báo trẻ em cần người lớn */}
            {hasChildrenWithoutAdults && (
              <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" /> Phải có ít nhất 1 người lớn đi cùng trẻ em
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/* --- Helper components --- */
function Tag({ label, Icon, color }) {
  const colors = {
    blue: "bg-blue-50 text-blue-700",
    green: "bg-green-50 text-green-700",
    indigo: "bg-indigo-50 text-indigo-700",
  };
  return (
    <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${colors[color]}`}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
}

function QuantityBox({ label, price, value, onChange, disabled }) {
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-sm text-gray-600">{label}</span>
        <span className="text-sm font-medium text-gray-900">₫{price.toLocaleString()}</span>
      </div>
      <div className="flex items-center justify-between bg-gray-50 rounded-lg p-1">
        <button
          onClick={() => onChange(Math.max(0, value - 1))}
          disabled={disabled || value === 0}
          className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white disabled:opacity-50"
        >
          <Minus className="w-4 h-4 text-gray-600" />
        </button>
        <span className="font-semibold text-gray-900 min-w-[2rem] text-center">{value}</span>
        <button
          onClick={() => onChange(value + 1)}
          disabled={disabled}
          className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white disabled:opacity-50"
        >
          <Plus className="w-4 h-4 text-gray-600" />
        </button>
      </div>
    </div>
  );
}
