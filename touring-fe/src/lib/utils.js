import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Format số tiền VND
export function formatVND(amount) {
  if (typeof amount !== 'number' || !Number.isFinite(amount)) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', { 
    style: 'currency', 
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

// Format USD (giữ lại để backward compatible)
export function formatUSD(amount) {
  if (typeof amount !== 'number' || !Number.isFinite(amount)) return '$0.00';
  return new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'USD' 
  }).format(amount);
}

// Format currency dựa trên loại tiền tệ
export function formatCurrency(amount, currency = 'VND') {
  if (currency === 'USD') return formatUSD(amount);
  return formatVND(amount);
}
