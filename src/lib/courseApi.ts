// API utilities for fetching course data from Langara API

import { 
  Semester, 
  SemesterResponse, 
  SearchSectionResponse, 
  SectionResponse,
  Section 
} from '@/types/Planner';
import { safeFetch, parseJSONResponse, APIError, API_BASE_URL } from './api-config';

export class CourseAPI {
  static async getLatestSemester(): Promise<Semester> {
    try {
      const response = await safeFetch(`${API_BASE_URL}/v1/index/latest_semester`);
      return await parseJSONResponse<Semester>(response);
    } catch (error) {
      if (error instanceof APIError) {
        throw new Error(`Failed to fetch latest semester: ${error.message}`);
      }
      throw new Error('Failed to fetch latest semester: Network error');
    }
  }

  static async getAllSemesters(): Promise<Semester[]> {
    try {
      const response = await safeFetch(`${API_BASE_URL}/v1/index/semesters`);
      const data: SemesterResponse = await parseJSONResponse<SemesterResponse>(response);
      return data.semesters;
    } catch (error) {
      if (error instanceof APIError) {
        throw new Error(`Failed to fetch semesters: ${error.message}`);
      }
      throw new Error('Failed to fetch semesters: Network error');
    }
  }

  static async getSections(year: number, term: number): Promise<Section[]> {
    try {
      const response = await safeFetch(`${API_BASE_URL}/v1/semester/${year}/${term}/sections`);
      const data: SectionResponse = await parseJSONResponse<SectionResponse>(response);
      return data.sections;
    } catch (error) {
      if (error instanceof APIError) {
        throw new Error(`Failed to fetch sections: ${error.message}`);
      }
      throw new Error('Failed to fetch sections: Network error');
    }
  }

  static async searchSections(
    query: string = '', 
    year?: number, 
    term?: number
  ): Promise<SearchSectionResponse> {
    const params = new URLSearchParams();
    if (query) params.append('query', query);
    if (year) params.append('year', year.toString());
    if (term) params.append('term', term.toString());

    try {
      const response = await safeFetch(`${API_BASE_URL}/v1/search/sections?${params.toString()}`);
      return await parseJSONResponse<SearchSectionResponse>(response);
    } catch (error) {
      if (error instanceof APIError) {
        throw new Error(`Failed to search sections: ${error.message}`);
      }
      throw new Error('Failed to search sections: Network error');
    }
  }

  static termToSeason(term: number): string {
    switch (term) {
      case 10:
        return 'Spring';
      case 20:
        return 'Summer';
      case 30:
        return 'Fall';
      default:
        return 'Unknown';
    }
  }

  static getSemesterDates(year: number, term: number): { firstDay: Date; lastDay: Date } {
    // Default dates based on typical Langara schedule
    let firstDay: Date;
    let lastDay: Date;

    if (year === 2025 && term === 10) {
      firstDay = new Date('2025-01-08');
      lastDay = new Date('2025-04-04');
    } else if (year === 2025 && term === 20) {
      firstDay = new Date('2025-05-05');
      lastDay = new Date('2025-08-01');
    } else if (year === 2025 && term === 30) {
      firstDay = new Date('2025-09-02');
      lastDay = new Date('2025-12-01');
    } else {
      // Fallback dates based on term
      switch (term) {
        case 10: // Spring
          firstDay = new Date(`${year}-01-08`);
          lastDay = new Date(`${year}-04-04`);
          break;
        case 20: // Summer
          firstDay = new Date(`${year}-05-05`);
          lastDay = new Date(`${year}-08-01`);
          break;
        case 30: // Fall
          firstDay = new Date(`${year}-09-02`);
          lastDay = new Date(`${year}-12-01`);
          break;
        default:
          throw new Error('Unknown term');
      }
    }

    return { firstDay, lastDay };
  }
}
