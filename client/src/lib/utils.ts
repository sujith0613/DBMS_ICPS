import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number | string | { $numberDecimal: string } | null | undefined): string {
    if (amount === null || amount === undefined) return '₹0';
    
    let val: number;
    if (typeof amount === 'object' && '$numberDecimal' in amount) {
        val = parseFloat(amount.$numberDecimal);
    } else {
        val = Number(amount);
    }
    
    if (isNaN(val)) return '₹0';
    
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
}

export function formatDate(date: string | Date): string {
    return new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    }).format(new Date(date));
}

export function formatDateTime(date: string | Date): string {
    return new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    }).format(new Date(date));
}

export function maskAadhaar(aadhaar: string): string {
    if (!aadhaar) return 'XXXX-XXXX-XXXX';
    return `XXXX-XXXX-${aadhaar.slice(-4)}`;
}

export function getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
        case 'submitted': return 'var(--status-submitted)';
        case 'under review': return 'var(--status-review)';
        case 'approved': return 'var(--status-approved)';
        case 'rejected': return 'var(--status-rejected)';
        default: return 'var(--text-muted)';
    }
}

export function getStatusBg(status: string): string {
    switch (status.toLowerCase()) {
        case 'submitted': return 'var(--status-submitted-bg)';
        case 'under review': return 'var(--status-review-bg)';
        case 'approved': return 'var(--status-approved-bg)';
        case 'rejected': return 'var(--status-rejected-bg)';
        default: return 'var(--bg)';
    }
}
