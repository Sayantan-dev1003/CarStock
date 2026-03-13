import dayjs from 'dayjs';

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (date: string | Date): string => {
  return dayjs(date).format('DD MMM YYYY');
};

export const formatDateTime = (date: string | Date): string => {
  return dayjs(date).format('DD MMM YYYY, hh:mm A');
};

export const formatMobile = (mobile: string): string => {
  if (!mobile) return '';
  const cleaned = mobile.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  }
  return mobile;
};

export const formatBillNumber = (billNumber: string): string => {
  return billNumber?.toUpperCase() || '';
};
