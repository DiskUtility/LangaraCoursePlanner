# Monday/Tuesday/Thursday Schedule Optimizer

## 🎯 Overview

The MTR Schedule Optimizer is an intelligent algorithm designed to help students find the best class sections that fit a Monday, Tuesday, and Thursday schedule preference. This is perfect for students who want to keep Wednesdays and Fridays free for work, internships, or personal commitments.

## ✨ Features

### 🔍 Smart Section Analysis
- **Day Matching**: Prioritizes sections that only meet on Monday, Tuesday, and Thursday
- **Time Preferences**: Respects your earliest start and latest end time preferences
- **Gap Management**: Avoids long gaps between classes or schedules them optimally
- **Lunch Break Avoidance**: Can avoid scheduling during lunch time (12:00-13:00)
- **Compact Scheduling**: Prioritizes fewer days on campus

### 📊 Scoring System
Each section receives a score from 0-100 based on:
- **Day Preference Match** (40 points): Perfect match for Mon/Tues/Thurs only
- **Time Preferences** (30 points): Fits within your time constraints
- **Schedule Compactness** (20 points): Fewer days, better gaps
- **Seat Availability** (10 points): Available seats vs waitlist status

### 🎯 Schedule Optimization
- **Conflict Detection**: Automatically prevents time conflicts
- **Multiple Course Planning**: Finds optimal combinations across multiple courses
- **Recommendations**: Provides suggestions for schedule improvements
- **Flexible Preferences**: Customizable time and gap preferences

## 🚀 Usage

### Basic Usage

```typescript
import { createMTRScheduler } from '@/utils/smartScheduler';
import { Section } from '@/types/Planner';

// Create scheduler with default Mon/Tues/Thurs preferences
const scheduler = createMTRScheduler();

// Analyze and filter sections
const sections: Section[] = [/* your available sections */];
const optimizedSections = scheduler.filterPreferredDaySections(sections);

// Get top recommendations
console.log('Best MTR sections:', optimizedSections.slice(0, 5));
```

### Advanced Configuration

```typescript
import { createMTRScheduler } from '@/utils/smartScheduler';

// Create scheduler with custom preferences
const scheduler = createMTRScheduler({
  timePreferences: {
    earliestStart: '09:00',    // Don't start before 9 AM
    latestEnd: '17:00',       // Don't end after 5 PM
    avoidTimeSlots: [
      '12:00-13:00',          // Avoid lunch time
      '15:30-16:00'           // Avoid coffee break time
    ]
  },
  gapPreferences: {
    maxGapBetweenClasses: 120, // Max 2-hour gaps
    minGapBetweenClasses: 15   // Min 15-minute gaps
  },
  prioritizeCompactSchedule: true
});
```

### Finding Optimal Schedule Combinations

```typescript
// For multiple courses
const coursesSections: Section[][] = [
  mathSections,
  englishSections,
  chemistrySections
];

// Find best combinations
const combinations = scheduler.findOptimalCombinations(coursesSections, 10);

// Get the best schedule
const bestSchedule = combinations[0];
console.log('Recommended schedule:', bestSchedule);
console.log('Total score:', bestSchedule.totalScore);
console.log('Days used:', bestSchedule.scheduleAnalysis.daysUsed);
```

### React Component Usage

```tsx
import MTRScheduleOptimizer from '@/components/MTRScheduleOptimizer';
import { Section } from '@/types/Planner';

function CoursePlanner() {
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedSections, setSelectedSections] = useState<Section[]>([]);

  const handleSectionSelect = (section: OptimizedSection) => {
    setSelectedSections(prev => [...prev, section]);
  };

  const handleCombinationSelect = (combination: ScheduleCombination) => {
    setSelectedSections(combination.sections);
  };

  return (
    <MTRScheduleOptimizer
      availableSections={sections}
      coursesSections={[sections]} // or multiple course arrays
      onSectionSelect={handleSectionSelect}
      onCombinationSelect={handleCombinationSelect}
    />
  );
}
```

## 📋 API Reference

### `createMTRScheduler(preferences?)`

Creates a new scheduler optimized for Monday/Tuesday/Thursday schedules.

**Parameters:**
- `preferences` (optional): `Partial<SchedulePreferences>`

**Returns:** `SmartScheduler`

### `SmartScheduler` Methods

#### `analyzeSections(sections: Section[]): OptimizedSection[]`

Analyzes and scores sections based on preferences.

#### `filterPreferredDaySections(sections: Section[]): OptimizedSection[]`

Filters sections that best match the Mon/Tues/Thurs preference.

#### `findOptimalCombinations(coursesSections: Section[][], maxCombinations?: number): ScheduleCombination[]`

Finds optimal schedule combinations across multiple courses.

### Type Definitions

```typescript
interface SchedulePreferences {
  preferredDays: string[];           // ['M', 'T', 'R']
  timePreferences?: {
    earliestStart?: string;          // "08:00"
    latestEnd?: string;             // "18:00"
    avoidTimeSlots?: string[];      // ["12:00-13:00"]
  };
  gapPreferences?: {
    maxGapBetweenClasses?: number;  // in minutes
    minGapBetweenClasses?: number;  // in minutes
  };
  prioritizeCompactSchedule?: boolean;
}

interface OptimizedSection extends Section {
  scheduleScore: ScheduleScore;
  dayAnalysis: DayAnalysis;
}

interface ScheduleScore {
  score: number;                    // 0-100
  reasons: string[];               // Why it scored well
  warnings: string[];              // Potential issues
}

interface ScheduleCombination {
  sections: OptimizedSection[];
  totalScore: number;
  scheduleAnalysis: {
    daysUsed: string[];
    totalHoursPerWeek: number;
    longestDay: number;
    shortestDay: number;
    averageGapTime: number;
    hasConflicts: boolean;
  };
  recommendations: string[];
}
```

## 💡 Examples

### Example 1: Find Best Computer Science Sections

```typescript
import { CourseAPI } from '@/lib/courseApi';
import { createMTRScheduler } from '@/utils/smartScheduler';

async function findBestCSClasses() {
  // Get all CS sections for current semester
  const sections = await CourseAPI.getSections(2025, 10);
  const csSections = sections.filter(s => s.subject === 'CPSC');
  
  // Create MTR scheduler
  const scheduler = createMTRScheduler({
    timePreferences: {
      earliestStart: '09:00',
      latestEnd: '16:00'
    }
  });
  
  // Find best sections
  const optimized = scheduler.filterPreferredDaySections(csSections);
  
  optimized.slice(0, 3).forEach(section => {
    console.log(`${section.subject} ${section.course_code}`);
    console.log(`Days: ${section.dayAnalysis.daysOfWeek.join(', ')}`);
    console.log(`Score: ${section.scheduleScore.score}/100`);
    console.log(`Reasons: ${section.scheduleScore.reasons.join(', ')}`);
    console.log('---');
  });
}
```

### Example 2: Optimize Full-Time Schedule

```typescript
async function planFullSchedule() {
  // Get sections for multiple courses
  const mathSections = await getCourse('MATH', '1171');
  const englishSections = await getCourse('ENGL', '1123');
  const physicsSections = await getCourse('PHYS', '1107');
  const chemistrySections = await getCourse('CHEM', '1108');
  
  const scheduler = createMTRScheduler({
    prioritizeCompactSchedule: true,
    timePreferences: {
      earliestStart: '08:30',
      latestEnd: '17:30',
      avoidTimeSlots: ['12:00-13:00'] // Keep lunch free
    }
  });
  
  // Find optimal combinations
  const combinations = scheduler.findOptimalCombinations([
    mathSections,
    englishSections,
    physicsSections,
    chemistrySections
  ], 5);
  
  const best = combinations[0];
  console.log(`Best schedule uses ${best.scheduleAnalysis.daysUsed.length} days:`);
  console.log(`Days: ${best.scheduleAnalysis.daysUsed.join(', ')}`);
  console.log(`Total hours: ${best.scheduleAnalysis.totalHoursPerWeek}h/week`);
  console.log(`Score: ${best.totalScore}/100`);
  
  if (best.recommendations.length > 0) {
    console.log('Recommendations:');
    best.recommendations.forEach(rec => console.log(`- ${rec}`));
  }
}
```

### Example 3: Working Student Schedule

```typescript
// Perfect for students who work Wed/Fri
const workingStudentScheduler = createMTRScheduler({
  preferredDays: ['M', 'T', 'R'], // Keep Wed/Fri free for work
  timePreferences: {
    earliestStart: '08:00',
    latestEnd: '15:00', // Need to leave for work
    avoidTimeSlots: []  // No lunch break needed
  },
  gapPreferences: {
    maxGapBetweenClasses: 30, // Minimal gaps
    minGapBetweenClasses: 10
  },
  prioritizeCompactSchedule: true // Maximize free time
});
```

## 🎛️ Customization Options

### Time Preferences
- **Earliest Start**: Don't schedule classes before this time
- **Latest End**: Don't schedule classes after this time
- **Avoid Time Slots**: Block out specific time periods

### Gap Management
- **Max Gap**: Maximum time between consecutive classes
- **Min Gap**: Minimum time needed between classes (for travel, etc.)

### Schedule Priorities
- **Compact Schedule**: Prefer fewer days on campus
- **Preferred Days**: Customize which days are preferred (default: Mon/Tues/Thurs)

## 🔧 Integration Tips

1. **Combine with Course API**: Use with `CourseAPI` to get real-time section data
2. **Save Preferences**: Store user preferences in localStorage or database
3. **Real-time Updates**: Refresh when seat availability changes
4. **Export Schedules**: Export optimized schedules to calendar formats

## 📈 Performance

- **Section Analysis**: O(n) where n = number of sections
- **Combination Generation**: O(m^k) where m = sections per course, k = number of courses
- **Optimization**: Limits combinations to prevent exponential explosion
- **Memory Usage**: Efficient for typical course loads (3-6 courses)

## 🐛 Troubleshooting

### No Sections Found
- Check if sections actually meet on Mon/Tues/Thurs
- Adjust time preferences to be more flexible
- Consider sections that meet mostly on preferred days

### Poor Scores
- Review time preferences - they might be too restrictive
- Check if lunch break avoidance is necessary
- Consider adjusting gap preferences

### Combination Generation Takes Too Long
- Reduce the number of sections per course before analysis
- Limit `maxCombinations` parameter
- Pre-filter sections by basic criteria first

---

**Pro Tip**: Start with loose preferences and gradually tighten them based on available options. The algorithm works best when there are multiple viable options to choose from!
