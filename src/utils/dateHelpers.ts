/**
 * Get the start and end of the current week (Sunday to Saturday)
 */
export function getCurrentWeekBounds(): { start: Date; end: Date } {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Sunday, 6 = Saturday
  
  const start = new Date(now);
  start.setDate(now.getDate() - dayOfWeek);
  start.setHours(0, 0, 0, 0);
  
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  
  return { start, end };
}

/**
 * Get today's date at midnight (for date comparisons)
 */
export function getTodayMidnight(): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

/**
 * Get a formatted greeting based on time of day
 */
export function getGreeting(firstName: string): string {
  const hour = new Date().getHours();
  
  if (hour < 12) {
    return `Good morning, ${firstName}`;
  } else if (hour < 18) {
    return `Good afternoon, ${firstName}`;
  } else {
    return `Good evening, ${firstName}`;
  }
}

/**
 * Convert a date to YYYY-MM-DD format for database queries
 */
export function formatDateOnly(date: Date): string {
  return date.toISOString().split('T')[0];
}
