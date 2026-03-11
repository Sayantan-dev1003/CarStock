export const REMINDER_INTERVALS: Record<string, number> = {
    BRAKES: 180,       // 6 months in days
    TYRES: 365,        // 12 months
    BATTERIES: 365,    // 12 months
    OILS: 90,          // 3 months
    WIPERS: 180,       // 6 months
    LIGHTING: 365,     // 12 months
    ELECTRICAL: 365,   // 12 months
    SEAT_COVERS: 730,  // 24 months
    AUDIO: 730,        // 24 months
    OTHER: 365,        // 12 months default
};

export function getReminderDays(category: string): number {
    return REMINDER_INTERVALS[category] ?? REMINDER_INTERVALS['OTHER'];
}
