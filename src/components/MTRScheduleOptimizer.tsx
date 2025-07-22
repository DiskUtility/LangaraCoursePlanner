'use client';

import React, { useState, useMemo } from 'react';
import { Section } from '@/types/Planner';
import { createMTRScheduler, OptimizedSection, ScheduleCombination } from '@/utils/smartScheduler';

interface MTRScheduleOptimizerProps {
  availableSections: Section[];
  coursesSections?: Section[][]; // For multiple courses
  onSectionSelect?: (section: OptimizedSection) => void;
  onCombinationSelect?: (combination: ScheduleCombination) => void;
}

export default function MTRScheduleOptimizer({
  availableSections,
  coursesSections,
  onSectionSelect,
  onCombinationSelect
}: MTRScheduleOptimizerProps) {
  const [preferences, setPreferences] = useState({
    earliestStart: '08:00',
    latestEnd: '18:00',
    avoidLunch: true,
    maxGap: 90,
    prioritizeCompact: true
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [activeTab, setActiveTab] = useState<'sections' | 'combinations'>('sections');

  // Create scheduler with preferences
  const scheduler = useMemo(() => {
    return createMTRScheduler({
      timePreferences: {
        earliestStart: preferences.earliestStart,
        latestEnd: preferences.latestEnd,
        avoidTimeSlots: preferences.avoidLunch ? ['12:00-13:00'] : []
      },
      gapPreferences: {
        maxGapBetweenClasses: preferences.maxGap,
        minGapBetweenClasses: 10
      },
      prioritizeCompactSchedule: preferences.prioritizeCompact
    });
  }, [preferences]);

  // Analyze individual sections
  const optimizedSections = useMemo(() => {
    if (!availableSections.length) return [];
    return scheduler.filterPreferredDaySections(availableSections);
  }, [scheduler, availableSections]);

  // Find optimal combinations for multiple courses
  const optimalCombinations = useMemo(() => {
    if (!coursesSections || coursesSections.length === 0) return [];
    return scheduler.findOptimalCombinations(coursesSections, 5);
  }, [scheduler, coursesSections]);

  const ScoreBar = ({ score }: { score: number }) => (
    <div className="flex items-center gap-2">
      <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-300 ${
            score >= 80 ? 'bg-green-500' :
            score >= 60 ? 'bg-yellow-500' :
            score >= 40 ? 'bg-orange-500' : 'bg-red-500'
          }`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="text-sm font-medium text-gray-600">{score.toFixed(0)}</span>
    </div>
  );

  const DayBadges = ({ days, preferredDays = ['M', 'T', 'R'] }: { days: string[], preferredDays?: string[] }) => (
    <div className="flex gap-1">
      {days.map(day => (
        <span
          key={day}
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            preferredDays.includes(day)
              ? 'bg-blue-100 text-blue-700'
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          {day}
        </span>
      ))}
    </div>
  );

  return (
    <div className="w-full max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          📅 Mon/Tues/Thurs Schedule Optimizer
        </h2>
        <p className="text-gray-600">
          Find the best class sections that fit your Monday, Tuesday, Thursday preference.
        </p>
      </div>

      {/* Preferences Panel */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-700">Preferences</h3>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            {showAdvanced ? '▼ Hide Advanced' : '▶ Show Advanced'}
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Earliest Start
            </label>
            <input
              type="time"
              value={preferences.earliestStart}
              onChange={(e) => setPreferences(prev => ({ ...prev, earliestStart: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Latest End
            </label>
            <input
              type="time"
              value={preferences.latestEnd}
              onChange={(e) => setPreferences(prev => ({ ...prev, latestEnd: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="avoidLunch"
              checked={preferences.avoidLunch}
              onChange={(e) => setPreferences(prev => ({ ...prev, avoidLunch: e.target.checked }))}
              className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="avoidLunch" className="text-sm text-gray-600">
              Avoid 12-1 PM (lunch)
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="prioritizeCompact"
              checked={preferences.prioritizeCompact}
              onChange={(e) => setPreferences(prev => ({ ...prev, prioritizeCompact: e.target.checked }))}
              className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="prioritizeCompact" className="text-sm text-gray-600">
              Prioritize compact schedule
            </label>
          </div>
        </div>

        {showAdvanced && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Max gap between classes (minutes): {preferences.maxGap}
              </label>
              <input
                type="range"
                min="30"
                max="240"
                step="15"
                value={preferences.maxGap}
                onChange={(e) => setPreferences(prev => ({ ...prev, maxGap: parseInt(e.target.value) }))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>30 min</span>
                <span>4 hours</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('sections')}
          className={`px-6 py-3 font-medium text-sm ${
            activeTab === 'sections'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Individual Sections ({optimizedSections.length})
        </button>
        {coursesSections && coursesSections.length > 1 && (
          <button
            onClick={() => setActiveTab('combinations')}
            className={`px-6 py-3 font-medium text-sm ${
              activeTab === 'combinations'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Schedule Combinations ({optimalCombinations.length})
          </button>
        )}
      </div>

      {/* Content */}
      {activeTab === 'sections' && (
        <div className="space-y-4">
          {optimizedSections.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="text-lg mb-2">No sections found matching your Mon/Tues/Thurs preference</p>
              <p className="text-sm">Try adjusting your time preferences or check back later for new sections.</p>
            </div>
          ) : (
            optimizedSections.map((section, index) => (
              <div key={section.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-lg text-gray-800">
                        {section.subject} {section.course_code} - {section.section}
                      </h4>
                      <DayBadges days={section.dayAnalysis.daysOfWeek} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                      <div>
                        <span className="text-sm text-gray-600">Schedule:</span>
                        <div className="text-sm">
                          {section.schedule.map((sched, idx) => (
                            <div key={idx}>
                              {sched.days} {sched.time}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <span className="text-sm text-gray-600">Instructor:</span>
                        <div className="text-sm">
                          {section.schedule[0]?.instructor || 'TBA'}
                        </div>
                      </div>

                      <div>
                        <span className="text-sm text-gray-600">Availability:</span>
                        <div className="text-sm">
                          {section.seats > 0 
                            ? `${section.seats} seats available`
                            : section.waitlist > 0
                            ? `Waitlist (${section.waitlist})`
                            : 'Full'
                          }
                        </div>
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-600">Match Score:</span>
                        <ScoreBar score={section.scheduleScore.score} />
                      </div>
                      
                      {section.scheduleScore.reasons.length > 0 && (
                        <div className="text-xs text-green-600 mb-1">
                          ✅ {section.scheduleScore.reasons.join(', ')}
                        </div>
                      )}
                      
                      {section.scheduleScore.warnings.length > 0 && (
                        <div className="text-xs text-orange-600">
                          ⚠️ {section.scheduleScore.warnings.join(', ')}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => onSectionSelect?.(section)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                    >
                      Select Section
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'combinations' && (
        <div className="space-y-6">
          {optimalCombinations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="text-lg mb-2">No valid schedule combinations found</p>
              <p className="text-sm">Try adjusting your preferences or check for time conflicts.</p>
            </div>
          ) : (
            optimalCombinations.map((combination, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="text-xl font-bold text-gray-800 mb-2">
                      Schedule Option {index + 1}
                    </h4>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>📅 Days: {combination.scheduleAnalysis.daysUsed.join(', ')}</span>
                      <span>⏱️ {combination.scheduleAnalysis.totalHoursPerWeek.toFixed(1)}h/week</span>
                      <span>📊 Score: {combination.totalScore.toFixed(0)}/100</span>
                    </div>
                  </div>
                  <button
                    onClick={() => onCombinationSelect?.(combination)}
                    className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    Use This Schedule
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h5 className="font-semibold text-gray-700 mb-3">Classes in This Schedule:</h5>
                    <div className="space-y-2">
                      {combination.sections.map((section) => (
                        <div key={section.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div>
                            <span className="font-medium">{section.subject} {section.course_code}</span>
                            <div className="text-sm text-gray-600">
                              {section.schedule[0]?.days} {section.schedule[0]?.time}
                            </div>
                          </div>
                          <DayBadges days={section.dayAnalysis.daysOfWeek} />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h5 className="font-semibold text-gray-700 mb-3">Analysis & Recommendations:</h5>
                    <div className="space-y-2">
                      <div className="text-sm">
                        <strong>Schedule Overview:</strong>
                        <ul className="list-disc list-inside text-gray-600 mt-1">
                          <li>Longest day: {combination.scheduleAnalysis.longestDay.toFixed(1)} hours</li>
                          <li>Shortest day: {combination.scheduleAnalysis.shortestDay.toFixed(1)} hours</li>
                          <li>Average gap: {combination.scheduleAnalysis.averageGapTime.toFixed(0)} minutes</li>
                          <li className={combination.scheduleAnalysis.hasConflicts ? 'text-red-600' : 'text-green-600'}>
                            {combination.scheduleAnalysis.hasConflicts ? '❌ Has conflicts' : '✅ No conflicts'}
                          </li>
                        </ul>
                      </div>

                      {combination.recommendations.length > 0 && (
                        <div className="text-sm">
                          <strong>Recommendations:</strong>
                          <ul className="list-disc list-inside text-orange-600 mt-1">
                            {combination.recommendations.map((rec, idx) => (
                              <li key={idx}>{rec}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
