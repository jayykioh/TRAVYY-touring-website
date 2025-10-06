import {
  Minus,
  Plus,
  Trash2,
  Calendar,
  MapPin,
  Clock,
  AlertCircle,
} from "lucide-react";

// ⬇️ NEW: helper mở trang chi tiết
function openTour(item, onOpen) {
  if (typeof onOpen === "function") return onOpen(item);
  const url = `/tours/${item.id}${
    item.date ? `?date=${encodeURIComponent(item.date)}` : ""
  }`;
  window.location.href = url;
}

export default function CartItemCard({
  item,
  onRemove,
  onUpdateQuantity,
  onToggleSelect,
  onOpen, // ⬅️ NEW (optional)
}) {
  const hasChildrenWithoutAdults =
    item.available && item.adults === 0 && item.children > 0;

  return (
    <div
      className={`bg-white rounded-2xl shadow-sm p-6 flex gap-4 transition hover:shadow-md ${
        !item.available ? "opacity-70" : ""
      }`}
    >
      {/* Tick chọn */}
      <div className="flex flex-col items-center pt-2">
        <input
          type="checkbox"
          checked={!!item.selected}
          disabled={!item.available}
          onChange={() => onToggleSelect(item.id, item.date)}
          className="w-5 h-5 accent-orange-500 cursor-pointer "
        />
      </div>

      {/* Image (clickable) */}
      <div
        className="relative flex-shrink-0 w-32 h-32 cursor-pointer group transition-transform duration-[2000ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-[1.08] active:scale-[0.96]"
        onClick={() => openTour(item, onOpen)}
        role="button"
        aria-label={`Xem chi tiết ${item.name}`}
        tabIndex={0}
        onKeyDown={(e) =>
          (e.key === "Enter" || e.key === " ") && openTour(item, onOpen)
        }
      >
        <img
          src={item.image}
          alt={item.name}
          className="w-32 h-32 object-cover rounded-xl group-hover:opacity-95"
        />
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
            {/* Title (clickable) */}
            <button
              type="button"
              onClick={() => openTour(item, onOpen)}
              className="font-semibold text-gray-900 line-clamp-2 text-left decoration-1 underline-offset-2 transition-transform duration-[700ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-[1.08] active:scale-[0.96]"
              title={item.name}
            >
              {item.name}
            </button>
            {item.subtitle && (
              <p className="text-sm text-gray-500">{item.subtitle}</p>
            )}
          </div>
          <button
            onClick={() => onRemove(item.itemId || item.id, item.date)}
            className="text-gray-400 hover:text-red-500"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-3">
          {item.date && <Tag label={item.date} Icon={Calendar} color="blue" />}
          {item.duration && (
            <Tag label={item.duration} Icon={Clock} color="green" />
          )}
          {item.locations && (
            <Tag label={item.locations} Icon={MapPin} color="indigo" />
          )}
        </div>

        {/* Cảnh báo hết chỗ */}
        {!item.available && (
          <div className="flex items-center gap-2 text-red-600 mb-3 bg-red-50 p-2 rounded-lg">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">
              Dịch vụ không hỗ trợ, vui lòng đặt lại
            </span>
          </div>
        )}

        {/* Controls */}
        {item.available && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <QuantityBox
                label="Người lớn"
                price={item.adultPrice}
                value={item.adults}
                disabled={!item.available}
                onChange={(nextVal) => {
                  const delta = nextVal - item.adults;
                  onUpdateQuantity(item.id, item.date, "adults", delta);
                  if (nextVal === 0 && item.children > 0) {
                    onUpdateQuantity(
                      item.id,
                      item.date,
                      "children",
                      -item.children
                    );
                  }
                }}
              />
              <QuantityBox
                label="Trẻ em ( < 14 tuổi )"
                price={item.childPrice}
                value={item.children}
                disabled={!item.available || item.adults === 0}
                onChange={(nextVal) =>
                  onUpdateQuantity(
                    item.id,
                    item.date,
                    "children",
                    nextVal - item.children
                  )
                }
              />
            </div>

            {hasChildrenWithoutAdults && (
              <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" /> Phải có ít nhất 1 người lớn
                đi cùng trẻ em
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function Tag({ label, Icon, color }) {
  const colors = {
    blue: "bg-blue-50 text-blue-700",
    green: "bg-green-50 text-green-700",
    indigo: "bg-indigo-50 text-indigo-700",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${colors[color]}`}
    >
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
}

function QuantityBox({ label, price = 0, value = 0, onChange, disabled }) {
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-sm text-gray-600">{label}</span>
        <span className="text-sm font-medium text-gray-900">
          ₫{Number(price).toLocaleString()}
        </span>
      </div>
      <div className="flex items-center justify-between bg-gray-50 rounded-lg p-1">
        <button
          onClick={() => onChange(Math.max(0, value - 1))}
          disabled={disabled || value === 0}
          className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white disabled:opacity-50"
        >
          <Minus className="w-4 h-4 text-gray-600" />
        </button>
        <span className="font-semibold text-gray-900 min-w-[2rem] text-center">
          {value}
        </span>
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
