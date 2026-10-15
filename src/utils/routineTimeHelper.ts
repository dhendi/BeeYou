import { Routine } from '../types';

/**
 * Parses time string like "7:00 AM" or "8:15 AM" into total minutes from midnight (0 - 1439).
 */
export function parseTimeToMinutes(timeStr?: string): number | null {
  if (!timeStr) return null;
  const match = timeStr.match(/(\d{1,2}):?(\d{2})?\s*(AM|PM)/i);
  if (!match) return null;
  let hour = parseInt(match[1], 10);
  const minutes = match[2] ? parseInt(match[2], 10) : 0;
  const period = match[3].toUpperCase();

  if (period === 'PM' && hour !== 12) {
    hour += 12;
  } else if (period === 'AM' && hour === 12) {
    hour = 0;
  }
  return hour * 60 + minutes;
}

/**
 * Parses a time range string like "7:00 AM – 8:00 AM" or "11:30 AM - 3:15 PM"
 * into [startMinutes, endMinutes].
 */
export function parseTimeRange(timeRangeStr?: string): [number | null, number | null] {
  if (!timeRangeStr) return [null, null];
  const parts = timeRangeStr.split(/[-–—to]+/i);
  const start = parseTimeToMinutes(parts[0]);
  const end = parts.length > 1 ? parseTimeToMinutes(parts[1]) : null;
  return [start, end];
}

/**
 * Selects the most relevant routine based on the current time of day.
 * 
 * Logic:
 * 1. Checks if current time falls within a routine's explicit time range.
 * 2. Checks time-of-day category:
 *    - Morning (5:00 AM - 8:30 AM): 'morning' -> routines like school prep / wake up
 *    - School / Midday (8:30 AM - 3:30 PM): 'school' -> classes / lunch / afternoon school
 *    - After school (3:30 PM - 8:00 PM): 'after-school' -> homework / dinner / play / unwind
 *    - Night / Bedtime (8:00 PM - 4:59 AM): 'bedtime' -> night hygiene / bedtime story / sleep
 * 3. Falls back to nearest upcoming routine or the first routine.
 */
export function getCurrentTimeRoutine(routines: Routine[], now: Date = new Date()): Routine | null {
  if (!routines || routines.length === 0) return null;

  // Filter out any legacy 20-step routines
  const validRoutines = routines.filter(
    (r) => r.id !== 'routine-school-full' && (r.steps?.length || 0) < 18
  );
  if (validRoutines.length === 0) return routines[0] || null;

  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTotalMinutes = currentHour * 60 + currentMinute;
  const currentDay = now.getDay(); // 0 is Sunday, 1 is Monday...

  // Filter routines assigned to today if assignedDays is specified
  const todayRoutines = validRoutines.filter((r) => {
    if (!r.assignedDays || r.assignedDays.length === 0) return true;
    return r.assignedDays.includes(currentDay);
  });

  const candidates = todayRoutines.length > 0 ? todayRoutines : validRoutines;

  // 1. Direct Time Range Match (e.g. 7:00 AM – 8:00 AM)
  for (const r of candidates) {
    const [start, end] = parseTimeRange(r.time);
    if (start !== null && end !== null) {
      if (start <= end) {
        if (currentTotalMinutes >= start && currentTotalMinutes < end) {
          return r;
        }
      } else {
        // Overnight range (e.g. 10:00 PM - 6:00 AM)
        if (currentTotalMinutes >= start || currentTotalMinutes < end) {
          return r;
        }
      }
    }
  }

  // 2. Category matching by current time of day
  // Morning: 5:00 AM (300 mins) to 8:30 AM (510 mins)
  // School: 8:30 AM (510 mins) to 3:30 PM (930 mins)
  // After school: 3:30 PM (930 mins) to 8:00 PM (1200 mins)
  // Bedtime: 8:00 PM (1200 mins) to 5:00 AM (300 mins)
  let preferredCategories: string[] = [];

  if (currentTotalMinutes >= 300 && currentTotalMinutes < 510) {
    preferredCategories = ['morning', 'school', 'after-school', 'bedtime'];
  } else if (currentTotalMinutes >= 510 && currentTotalMinutes < 930) {
    preferredCategories = ['school', 'after-school', 'morning', 'bedtime'];
  } else if (currentTotalMinutes >= 930 && currentTotalMinutes < 1200) {
    preferredCategories = ['after-school', 'bedtime', 'school', 'morning'];
  } else {
    preferredCategories = ['bedtime', 'after-school', 'morning', 'school'];
  }

  for (const cat of preferredCategories) {
    const matched = candidates.filter((r) => r.category === cat);
    if (matched.length > 0) {
      if (matched.length === 1) return matched[0];

      // Pick the one closest to current time
      let closest = matched[0];
      let smallestDiff = Infinity;
      for (const m of matched) {
        const [start] = parseTimeRange(m.time);
        if (start !== null) {
          const diff = Math.abs(currentTotalMinutes - start);
          if (diff < smallestDiff) {
            smallestDiff = diff;
            closest = m;
          }
        }
      }
      return closest;
    }
  }

  // 3. Fallback to first routine
  return candidates[0] || null;
}

/**
 * Returns current time-of-day category: 'morning' | 'school' | 'after-school' | 'bedtime'
 */
export function getTimePeriodCategory(now: Date = new Date()): 'morning' | 'school' | 'after-school' | 'bedtime' {
  const currentTotalMinutes = now.getHours() * 60 + now.getMinutes();
  if (currentTotalMinutes >= 300 && currentTotalMinutes < 510) {
    return 'morning';
  } else if (currentTotalMinutes >= 510 && currentTotalMinutes < 930) {
    return 'school';
  } else if (currentTotalMinutes >= 930 && currentTotalMinutes < 1200) {
    return 'after-school';
  } else {
    return 'bedtime';
  }
}

/**
 * Returns category IDs ordered starting with the current time of day.
 */
export function getTimeOrderedCategoryOrder(now: Date = new Date()): ('morning' | 'school' | 'after-school' | 'bedtime' | 'custom')[] {
  const period = getTimePeriodCategory(now);
  if (period === 'morning') {
    return ['morning', 'school', 'after-school', 'bedtime', 'custom'];
  } else if (period === 'school') {
    return ['school', 'after-school', 'bedtime', 'morning', 'custom'];
  } else if (period === 'after-school') {
    return ['after-school', 'bedtime', 'morning', 'school', 'custom'];
  } else {
    return ['bedtime', 'morning', 'school', 'after-school', 'custom'];
  }
}

/**
 * Sorts routines chronologically based on their start time.
 * Earlier routines appear first.
 */
export function sortRoutinesByTime(routines: Routine[]): Routine[] {
  return [...routines].sort((a, b) => {
    const [startA] = parseTimeRange(a.time);
    const [startB] = parseTimeRange(b.time);

    if (startA !== null && startB !== null) {
      return startA - startB;
    }
    if (startA !== null && startB === null) return -1;
    if (startA === null && startB !== null) return 1;
    return 0;
  });
}
