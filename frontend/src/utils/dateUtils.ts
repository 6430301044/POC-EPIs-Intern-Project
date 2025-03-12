/**
 * Utility functions for date formatting
 */

/**
 * Format a date string to show only day and month in Thai format
 * @param dateString - The date string to format (e.g., "2023-01-15T00:00:00.000Z")
 * @returns Formatted date string showing only day and month (e.g., "15 ม.ค.")
 */
export const formatDayMonth = (dateString: string): string => {
  if (!dateString) return "";
  
  const date = new Date(dateString);
  
  // Thai month abbreviations
  const thaiMonths = [
    'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
    'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
  ];
  
  const day = date.getDate();
  const month = date.getMonth(); // 0-indexed
  
  return `${day} ${thaiMonths[month]}`;
};