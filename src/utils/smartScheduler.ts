// Smart Scheduler Algorithm for Monday, Tuesday, Thursday Classes
// Helps students optimize their schedule to have classes on specific days

import { Section } from '@/types/Planner';

export interface SchedulePreferences {
  preferredDays: string[]; // ['M', 'T', 'R'] for Mon, Tues, Thurs
  timePreferences?: {
    earliestStart?: string; // "08:00"
    latestEnd?: string; // "18:00"
    avoidTimeSlots?: string[]; // ["12:00-13:00"] for lunch break
  };
  gapPreferences?: {
    maxGapBetweenClasses?: number; // in minutes
    minGapBetweenClasses?: number; // in minutes
  };
  prioritizeCompactSchedule?: boolean; // true to minimize days on campus
}

export interface ScheduleScore {
  score: number; // 0-100, higher is better
  reasons: string[];
  warnings: string[];
}

export interface OptimizedSection extends Section {
  scheduleScore: ScheduleScore;
  dayAnalysis: DayAnalysis;
}

export interface DayAnalysis {
  daysOfWeek: string[];
  matchesPreferredDays: boolean;
  preferredDayCount: number;
  nonPreferredDayCount: number;
  timeSlots: TimeSlot[];
}

export interface TimeSlot {
  day: string;
  startTime: string;
  endTime: string;
  duration: number; // in minutes
}

export interface ScheduleCombination {
  sections: OptimizedSection[];
  totalScore: number;
  scheduleAnalysis: {
    daysUsed: string[];
    totalHoursPerWeek: number;
    longestDay: number; // hours
    shortestDay: number; // hours
    averageGapTime: number; // minutes
    hasConflicts: boolean;
  };
  recommendations: string[];
}

/**
 * Main class for smart course scheduling
 */
export class SmartScheduler {
  private preferences: SchedulePreferences;

  constructor(preferences: SchedulePreferences = { preferredDays: ['M', 'T', 'R'] }) {
    this.preferences = preferences;
  }

  /**
   * Analyze and score individual sections based on preferences
   */
  public analyzeSections(sections: Section[]): OptimizedSection[] {
    return sections.map(section => {
      const dayAnalysis = this.analyzeSectionDays(section);
      const scheduleScore = this.calculateSectionScore(section, dayAnalysis);
      
      return {
        ...section,
        scheduleScore,
        dayAnalysis
      };
    }).sort((a, b) => b.scheduleScore.score - a.scheduleScore.score);
  }

  /**
   * Find optimal schedule combinations for multiple courses
   */
  public findOptimalCombinations(
    coursesSections: Section[][],
    maxCombinations: number = 10
  ): ScheduleCombination[] {
    const combinations = this.generateScheduleCombinations(coursesSections);
    const scoredCombinations = combinations.map(combo => 
      this.evaluateScheduleCombination(combo)
    );

    return scoredCombinations
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, maxCombinations);
  }

  /**
   * Filter sections that meet Mon/Tues/Thurs criteria
   */
  public filterPreferredDaySections(sections: Section[]): OptimizedSection[] {
    const analyzedSections = this.analyzeSections(sections);
    
    return analyzedSections.filter(section => {
      const { dayAnalysis } = section;
      
      // Must have classes only on preferred days or be flexible
      return dayAnalysis.matchesPreferredDays || 
             dayAnalysis.nonPreferredDayCount === 0 ||
             (dayAnalysis.preferredDayCount >= 2 && dayAnalysis.nonPreferredDayCount <= 1);
    });
  }

  /**
   * Analyze which days a section meets
   */
  private analyzeSectionDays(section: Section): DayAnalysis {
    const daysOfWeek = new Set<string>();
    const timeSlots: TimeSlot[] = [];
    
    section.schedule.forEach(schedule => {
      const days = this.parseDaysString(schedule.days);
      days.forEach(day => {
        daysOfWeek.add(day);
        if (schedule.time && schedule.time !== 'TBA') {
          const { startTime, endTime, duration } = this.parseTimeString(schedule.time);
          timeSlots.push({ day, startTime, endTime, duration });
        }
      });
    });

    const daysArray = Array.from(daysOfWeek);
    const preferredDayCount = daysArray.filter(day => 
      this.preferences.preferredDays.includes(day)
    ).length;
    const nonPreferredDayCount = daysArray.length - preferredDayCount;
    const matchesPreferredDays = nonPreferredDayCount === 0 && preferredDayCount > 0;

    return {
      daysOfWeek: daysArray,
      matchesPreferredDays,
      preferredDayCount,
      nonPreferredDayCount,
      timeSlots
    };
  }

  /**
   * Calculate score for a section based on preferences
   */
  private calculateSectionScore(section: Section, dayAnalysis: DayAnalysis): ScheduleScore {
    let score = 0;
    const reasons: string[] = [];
    const warnings: string[] = [];

    // Day preference scoring (0-40 points)
    if (dayAnalysis.matchesPreferredDays) {
      score += 40;
      reasons.push(`Perfect match: Only meets on ${dayAnalysis.daysOfWeek.join(', ')}`);
    } else if (dayAnalysis.preferredDayCount >= 2) {
      score += 25;
      reasons.push(`Good match: ${dayAnalysis.preferredDayCount} preferred days`);
      if (dayAnalysis.nonPreferredDayCount > 0) {
        warnings.push(`Also meets on ${dayAnalysis.nonPreferredDayCount} non-preferred day(s)`);
      }
    } else if (dayAnalysis.preferredDayCount === 1) {
      score += 10;
      warnings.push('Only meets on 1 preferred day');
    } else {
      warnings.push('Does not meet on any preferred days');
    }

    // Time preference scoring (0-30 points)
    if (this.preferences.timePreferences) {
      const timeScore = this.calculateTimeScore(dayAnalysis.timeSlots);
      score += timeScore.score;
      reasons.push(...timeScore.reasons);
      warnings.push(...timeScore.warnings);
    }

    // Compact schedule bonus (0-20 points)
    if (this.preferences.prioritizeCompactSchedule) {
      const compactScore = this.calculateCompactScore(dayAnalysis);
      score += compactScore.score;
      reasons.push(...compactScore.reasons);
    }

    // Availability bonus (0-10 points)
    if (section.seats && section.seats > 0) {
      score += 10;
      reasons.push(`${section.seats} seats available`);
    } else if (section.waitlist && section.waitlist > 0) {
      score += 5;
      warnings.push(`Waitlisted (${section.waitlist} on waitlist)`);
    } else {
      warnings.push('No seats available');
    }

    return {
      score: Math.min(100, Math.max(0, score)),
      reasons,
      warnings
    };
  }

  /**
   * Calculate time preference score
   */
  private calculateTimeScore(timeSlots: TimeSlot[]): { score: number; reasons: string[]; warnings: string[] } {
    let score = 0;
    const reasons: string[] = [];
    const warnings: string[] = [];
    const { earliestStart, latestEnd, avoidTimeSlots } = this.preferences.timePreferences!;

    timeSlots.forEach(slot => {
      // Check earliest start time
      if (earliestStart && slot.startTime >= earliestStart) {
        score += 5;
        reasons.push(`Starts after ${earliestStart}`);
      } else if (earliestStart) {
        warnings.push(`Starts before preferred time (${slot.startTime})`);
      }

      // Check latest end time
      if (latestEnd && slot.endTime <= latestEnd) {
        score += 5;
        reasons.push(`Ends before ${latestEnd}`);
      } else if (latestEnd) {
        warnings.push(`Ends after preferred time (${slot.endTime})`);
      }

      // Check avoided time slots
      if (avoidTimeSlots) {
        const conflictsWithAvoidedTime = avoidTimeSlots.some(avoided => 
          this.timeSlotOverlaps(slot, avoided)
        );
        if (!conflictsWithAvoidedTime) {
          score += 5;
        } else {
          warnings.push(`Conflicts with avoided time slot`);
        }
      }
    });

    return { score: Math.min(20, score), reasons, warnings };
  }

  /**
   * Calculate compact schedule score
   */
  private calculateCompactScore(dayAnalysis: DayAnalysis): { score: number; reasons: string[] } {
    const reasons: string[] = [];
    let score = 0;

    // Prefer fewer days
    const dayCount = dayAnalysis.daysOfWeek.length;
    if (dayCount <= 3) {
      score += 15;
      reasons.push(`Compact: Only ${dayCount} days per week`);
    } else if (dayCount === 4) {
      score += 8;
      reasons.push(`Moderate: ${dayCount} days per week`);
    }

    // Prefer consecutive time slots on the same day
    const dayTimeSlots = this.groupTimeSlotsByDay(dayAnalysis.timeSlots);
    Object.values(dayTimeSlots).forEach(slots => {
      if (slots.length > 1) {
        const hasMinimalGaps = this.hasMinimalGaps(slots);
        if (hasMinimalGaps) {
          score += 5;
          reasons.push('Consecutive classes on same day');
        }
      }
    });

    return { score: Math.min(20, score), reasons };
  }

  /**
   * Generate all possible schedule combinations
   */
  private generateScheduleCombinations(coursesSections: Section[][]): Section[][] {
    if (coursesSections.length === 0) return [];
    if (coursesSections.length === 1) return coursesSections[0].map(section => [section]);

    const combinations: Section[][] = [];
    
    const generate = (index: number, currentCombination: Section[]) => {
      if (index === coursesSections.length) {
        combinations.push([...currentCombination]);
        return;
      }

      coursesSections[index].forEach(section => {
        // Check for time conflicts with current combination
        if (!this.hasTimeConflicts([...currentCombination, section])) {
          currentCombination.push(section);
          generate(index + 1, currentCombination);
          currentCombination.pop();
        }
      });
    };

    generate(0, []);
    return combinations;
  }

  /**
   * Evaluate a complete schedule combination
   */
  private evaluateScheduleCombination(sections: Section[]): ScheduleCombination {
    const optimizedSections = this.analyzeSections(sections);
    const scheduleAnalysis = this.analyzeCompleteSchedule(optimizedSections);
    const totalScore = this.calculateCombinationScore(optimizedSections, scheduleAnalysis);
    const recommendations = this.generateRecommendations(optimizedSections, scheduleAnalysis);

    return {
      sections: optimizedSections,
      totalScore,
      scheduleAnalysis,
      recommendations
    };
  }

  /**
   * Analyze complete schedule for metrics
   */
  private analyzeCompleteSchedule(sections: OptimizedSection[]) {
    const daysUsed = new Set<string>();
    let totalHoursPerWeek = 0;
    const dailyHours: { [day: string]: number } = {};

    sections.forEach(section => {
      section.dayAnalysis.daysOfWeek.forEach(day => daysUsed.add(day));
      section.dayAnalysis.timeSlots.forEach(slot => {
        totalHoursPerWeek += slot.duration / 60;
        dailyHours[slot.day] = (dailyHours[slot.day] || 0) + slot.duration / 60;
      });
    });

    const dayHours = Object.values(dailyHours);
    const longestDay = dayHours.length > 0 ? Math.max(...dayHours) : 0;
    const shortestDay = dayHours.length > 0 ? Math.min(...dayHours) : 0;

    return {
      daysUsed: Array.from(daysUsed),
      totalHoursPerWeek,
      longestDay,
      shortestDay,
      averageGapTime: this.calculateAverageGapTime(sections),
      hasConflicts: this.hasTimeConflicts(sections)
    };
  }

  /**
   * Calculate combination score
   */
  private calculateCombinationScore(
    sections: OptimizedSection[], 
    scheduleAnalysis: any
  ): number {
    const avgSectionScore = sections.reduce((sum, s) => sum + s.scheduleScore.score, 0) / sections.length;
    
    let bonusScore = 0;
    
    // Preferred days bonus
    const preferredDaysUsed = scheduleAnalysis.daysUsed.filter((day: string) => 
      this.preferences.preferredDays.includes(day)
    ).length;
    bonusScore += preferredDaysUsed * 5;

    // Compact schedule bonus
    if (scheduleAnalysis.daysUsed.length <= 3) {
      bonusScore += 15;
    }

    // No conflicts bonus
    if (!scheduleAnalysis.hasConflicts) {
      bonusScore += 10;
    }

    return Math.min(100, avgSectionScore + bonusScore);
  }

  /**
   * Generate recommendations for schedule improvement
   */
  private generateRecommendations(
    sections: OptimizedSection[], 
    scheduleAnalysis: any
  ): string[] {
    const recommendations: string[] = [];

    // Day optimization recommendations
    const nonPreferredDays = scheduleAnalysis.daysUsed.filter((day: string) => 
      !this.preferences.preferredDays.includes(day)
    );

    if (nonPreferredDays.length > 0) {
      recommendations.push(
        `Consider finding alternatives to avoid classes on ${nonPreferredDays.join(', ')}`
      );
    }

    if (scheduleAnalysis.daysUsed.length > 3) {
      recommendations.push('Look for sections that meet fewer days per week');
    }

    // Time optimization recommendations
    if (scheduleAnalysis.averageGapTime > 90) {
      recommendations.push('Consider sections with shorter gaps between classes');
    }

    if (scheduleAnalysis.longestDay > 8) {
      recommendations.push('Your longest day has over 8 hours - consider redistributing classes');
    }

    // Availability recommendations
    const waitlistedSections = sections.filter(s => 
      s.scheduleScore.warnings.some(w => w.includes('Waitlisted'))
    );
    
    if (waitlistedSections.length > 0) {
      recommendations.push(
        `${waitlistedSections.length} section(s) require waitlisting - have backup options ready`
      );
    }

    return recommendations;
  }

  // Utility methods

  private parseDaysString(daysStr: string): string[] {
    if (!daysStr || daysStr === 'TBA') return [];
    
    const dayMap: { [key: string]: string } = {
      'M': 'M', 'Mo': 'M', 'Mon': 'M', 'Monday': 'M',
      'T': 'T', 'Tu': 'T', 'Tue': 'T', 'Tuesday': 'T',
      'W': 'W', 'We': 'W', 'Wed': 'W', 'Wednesday': 'W',
      'R': 'R', 'Th': 'R', 'Thu': 'R', 'Thursday': 'R',
      'F': 'F', 'Fr': 'F', 'Fri': 'F', 'Friday': 'F'
    };

    const days: string[] = [];
    
    // Handle common formats like "MWF", "TR", "M W F"
    const cleanStr = daysStr.replace(/[,\s]/g, '');
    
    if (cleanStr.includes('TR')) {
      days.push('T', 'R');
    } else if (cleanStr.includes('MWF')) {
      days.push('M', 'W', 'F');
    } else {
      // Parse individual day characters/abbreviations
      for (const [pattern, day] of Object.entries(dayMap)) {
        if (cleanStr.includes(pattern)) {
          days.push(day);
        }
      }
    }

    return [...new Set(days)]; // Remove duplicates
  }

  private parseTimeString(timeStr: string): { startTime: string; endTime: string; duration: number } {
    if (!timeStr || timeStr === 'TBA') {
      return { startTime: '00:00', endTime: '00:00', duration: 0 };
    }

    // Handle formats like "10:30-11:20", "2:00PM-3:50PM"
    const timeRegex = /(\d{1,2}):(\d{2})\s*(AM|PM)?\s*-\s*(\d{1,2}):(\d{2})\s*(AM|PM)?/i;
    const match = timeStr.match(timeRegex);

    if (!match) {
      return { startTime: '00:00', endTime: '00:00', duration: 0 };
    }

    const [, startHour, startMin, startAmPm, endHour, endMin, endAmPm] = match;
    
    const startTime24 = this.convertTo24Hour(parseInt(startHour), parseInt(startMin), startAmPm);
    const endTime24 = this.convertTo24Hour(parseInt(endHour), parseInt(endMin), endAmPm);
    
    const startMinutes = this.timeToMinutes(startTime24);
    const endMinutes = this.timeToMinutes(endTime24);
    const duration = endMinutes - startMinutes;

    return {
      startTime: startTime24,
      endTime: endTime24,
      duration: duration > 0 ? duration : duration + 24 * 60 // Handle overnight classes
    };
  }

  private convertTo24Hour(hour: number, minute: number, amPm?: string): string {
    let hour24 = hour;
    
    if (amPm) {
      if (amPm.toUpperCase() === 'PM' && hour !== 12) {
        hour24 += 12;
      } else if (amPm.toUpperCase() === 'AM' && hour === 12) {
        hour24 = 0;
      }
    }

    return `${hour24.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  }

  private timeToMinutes(timeStr: string): number {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private timeSlotOverlaps(slot: TimeSlot, avoidedTimeSlot: string): boolean {
    // Parse avoided time slot format "12:00-13:00"
    const [startTime, endTime] = avoidedTimeSlot.split('-');
    const slotStart = this.timeToMinutes(slot.startTime);
    const slotEnd = this.timeToMinutes(slot.endTime);
    const avoidStart = this.timeToMinutes(startTime);
    const avoidEnd = this.timeToMinutes(endTime);

    return slotStart < avoidEnd && slotEnd > avoidStart;
  }

  private groupTimeSlotsByDay(timeSlots: TimeSlot[]): { [day: string]: TimeSlot[] } {
    const grouped: { [day: string]: TimeSlot[] } = {};
    
    timeSlots.forEach(slot => {
      if (!grouped[slot.day]) {
        grouped[slot.day] = [];
      }
      grouped[slot.day].push(slot);
    });

    // Sort time slots by start time for each day
    Object.keys(grouped).forEach(day => {
      grouped[day].sort((a, b) => this.timeToMinutes(a.startTime) - this.timeToMinutes(b.startTime));
    });

    return grouped;
  }

  private hasMinimalGaps(timeSlots: TimeSlot[]): boolean {
    if (timeSlots.length <= 1) return true;

    const maxGap = this.preferences.gapPreferences?.maxGapBetweenClasses || 60; // 1 hour default
    
    for (let i = 0; i < timeSlots.length - 1; i++) {
      const currentEnd = this.timeToMinutes(timeSlots[i].endTime);
      const nextStart = this.timeToMinutes(timeSlots[i + 1].startTime);
      const gap = nextStart - currentEnd;
      
      if (gap > maxGap) {
        return false;
      }
    }

    return true;
  }

  private hasTimeConflicts(sections: Section[]): boolean {
    const timeSlots: { day: string; start: number; end: number }[] = [];

    sections.forEach(section => {
      section.schedule.forEach(schedule => {
        const days = this.parseDaysString(schedule.days);
        if (schedule.time && schedule.time !== 'TBA') {
          const { startTime, endTime } = this.parseTimeString(schedule.time);
          const startMinutes = this.timeToMinutes(startTime);
          const endMinutes = this.timeToMinutes(endTime);
          
          days.forEach(day => {
            timeSlots.push({ day, start: startMinutes, end: endMinutes });
          });
        }
      });
    });

    // Check for overlaps
    for (let i = 0; i < timeSlots.length; i++) {
      for (let j = i + 1; j < timeSlots.length; j++) {
        const slot1 = timeSlots[i];
        const slot2 = timeSlots[j];
        
        if (slot1.day === slot2.day) {
          if (slot1.start < slot2.end && slot1.end > slot2.start) {
            return true; // Conflict found
          }
        }
      }
    }

    return false;
  }

  private calculateAverageGapTime(sections: OptimizedSection[]): number {
    let totalGapTime = 0;
    let gapCount = 0;

    const dayTimeSlots = this.groupTimeSlotsByDay(
      sections.flatMap(s => s.dayAnalysis.timeSlots)
    );

    Object.values(dayTimeSlots).forEach(slots => {
      for (let i = 0; i < slots.length - 1; i++) {
        const currentEnd = this.timeToMinutes(slots[i].endTime);
        const nextStart = this.timeToMinutes(slots[i + 1].startTime);
        const gap = nextStart - currentEnd;
        
        if (gap > 0) {
          totalGapTime += gap;
          gapCount++;
        }
      }
    });

    return gapCount > 0 ? totalGapTime / gapCount : 0;
  }
}

/**
 * Helper function to create a scheduler optimized for Mon/Tues/Thurs classes
 */
export function createMTRScheduler(additionalPreferences?: Partial<SchedulePreferences>): SmartScheduler {
  const defaultPreferences: SchedulePreferences = {
    preferredDays: ['M', 'T', 'R'], // Monday, Tuesday, Thursday
    timePreferences: {
      earliestStart: '08:00',
      latestEnd: '18:00',
      avoidTimeSlots: ['12:00-13:00'] // Avoid lunch time
    },
    gapPreferences: {
      maxGapBetweenClasses: 90, // 1.5 hours max gap
      minGapBetweenClasses: 10   // 10 minutes min gap
    },
    prioritizeCompactSchedule: true
  };

  const mergedPreferences = { ...defaultPreferences, ...additionalPreferences };
  return new SmartScheduler(mergedPreferences);
}

export default SmartScheduler;
