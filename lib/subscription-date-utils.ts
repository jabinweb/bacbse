/**
 * Utility functions for calculating subscription dates based on academic year
 * All subscriptions end on March 31st of the current financial year
 */

/**
 * Calculate the end date for a subscription
 * Returns March 31st of the current financial year
 * 
 * Financial year runs from April 1st to March 31st
 * - If current date is between Jan 1 - Mar 31: end date is Mar 31 of current year
 * - If current date is between Apr 1 - Dec 31: end date is Mar 31 of next year
 * 
 * @returns Date object set to March 31st at 23:59:59
 */
export function getAcademicYearEndDate(): Date {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-indexed (0 = January, 11 = December)
  
  // If we're in January, February, or March (months 0, 1, 2)
  // the subscription ends on March 31st of the current year
  // Otherwise, it ends on March 31st of the next year
  const endYear = currentMonth <= 2 ? currentYear : currentYear + 1;
  
  // Create date for March 31st at 23:59:59
  const endDate = new Date(endYear, 2, 31, 23, 59, 59, 999); // Month 2 = March (0-indexed)
  
  return endDate;
}

/**
 * Get a human-readable description of when subscriptions end
 * @returns String like "March 31, 2026"
 */
export function getAcademicYearEndDateString(): string {
  const endDate = getAcademicYearEndDate();
  return endDate.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
}

/**
 * Check if a subscription is still valid (hasn't passed March 31st)
 * @param endDate - The subscription end date
 * @returns true if subscription is still valid
 */
export function isSubscriptionValid(endDate: Date): boolean {
  return endDate > new Date();
}

/**
 * Calculate days remaining until subscription expires
 * @param endDate - The subscription end date
 * @returns Number of days remaining (negative if expired)
 */
export function getDaysUntilExpiry(endDate: Date): number {
  const now = new Date();
  const timeDiff = endDate.getTime() - now.getTime();
  return Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
}
