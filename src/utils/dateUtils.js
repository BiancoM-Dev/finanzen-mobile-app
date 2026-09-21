/**
 * Utilidades para fechas, plazos y alertas de vencimientos
 */

export const formatDate = (isoOrDateString) => {
  if (!isoOrDateString) return '';
  const date = new Date(isoOrDateString);
  if (isNaN(date.getTime())) return isoOrDateString;
  
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

export const getDaysRemainingInMonth = (dueDay) => {
  const today = new Date();
  const currentDay = today.getDate();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  
  let targetDate = new Date(currentYear, currentMonth, dueDay);
  
  // Si el día ya pasó este mes, calcular para el próximo mes
  if (currentDay > dueDay) {
    targetDate = new Date(currentYear, currentMonth + 1, dueDay);
  }
  
  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

export const getDueAlertStatus = (dueDay, isPaid = false) => {
  if (isPaid) return { text: 'Al día', color: '#10B981', status: 'paid' };
  
  const days = getDaysRemainingInMonth(dueDay);
  
  if (days <= 0) {
    return { text: 'Vence hoy', color: '#EF4444', status: 'urgent' };
  } else if (days <= 3) {
    return { text: `Vence en ${days} día${days > 1 ? 's' : ''}`, color: '#F59E0B', status: 'warning' };
  } else if (days <= 7) {
    return { text: `Vence en ${days} días`, color: '#6366F1', status: 'upcoming' };
  }
  return { text: `Día ${dueDay} de cada mes`, color: '#6B7280', status: 'normal' };
};
