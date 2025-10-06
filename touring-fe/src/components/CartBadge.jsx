import { AnimatePresence, motion } from "framer-motion";

export default function CartBadge({ count }) {
  if (!count) return null;
  const display = count > 99 ? "99+" : count;

  return (
    <AnimatePresence initial={false} mode="popLayout">
      <motion.span
        key={display}
        initial={{ scale: 0.6, y: -6, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.6, y: -6, opacity: 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 25, mass: 0.6 }}
        className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-[#02A0AA] text-white text-[11px] grid place-items-center shadow-sm will-change-transform"
      >
        <motion.span
          key={`n-${display}`}
          initial={{ y: 4, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -4, opacity: 0 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="font-medium"
        >
          {display}
        </motion.span>
      </motion.span>
    </AnimatePresence>
  );
}
