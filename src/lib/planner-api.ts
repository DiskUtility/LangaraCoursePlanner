import {
  PlannerApiResponse,
  SemestersResponse,
  LatestSemesterResponse,
  SectionsSearchResponse,
  CoursesApiResponse,
  SectionsApiResponse,
  Section
} from '@/types/Planner2';
import { safeFetch, parseJSONResponse, APIError, API_BASE_URL } from './api-config';

const API_BASE = API_BASE_URL;

export const plannerApi = {
  // Get courses and sections for a specific semester
  getCoursesForSemester: async (year: number, term: number): Promise<PlannerApiResponse> => {
    try {
      const [coursesRes, sectionsRes] = await Promise.all([
        safeFetch(`${API_BASE}/v1/semester/${year}/${term}/courses`),
        safeFetch(`${API_BASE}/v1/semester/${year}/${term}/sections`)
      ]);

      const [coursesData, sectionsData]: [CoursesApiResponse, SectionsApiResponse] = await Promise.all([
        parseJSONResponse<CoursesApiResponse>(coursesRes),
        parseJSONResponse<SectionsApiResponse>(sectionsRes)
      ]);

      // Map sections to courses like in the original Flask code
      const sectionsDict: { [key: string]: Section[] } = {};

      for (const section of sectionsData.sections) {
        const key = `${section.subject}-${section.course_code}`;
        if (!sectionsDict[key]) {
          sectionsDict[key] = [];
        }
        sectionsDict[key].push(section);
      }

      // Add sections to courses
      const coursesWithSections = coursesData.courses.map(course => ({
        ...course,
        sections: sectionsDict[`${course.subject}-${course.course_code}`] ?? []
      }));

      return { courses: coursesWithSections };
    } catch (error) {
      if (error instanceof APIError) {
        throw new Error(`Failed to fetch semester data: ${error.message}`);
      }
      throw new Error('Failed to fetch semester data: Network error');
    }
  },

  // Get available semesters
  getSemesters: async (): Promise<SemestersResponse> => {
    try {
      const response = await safeFetch(`${API_BASE}/v1/index/semesters`);
      return await parseJSONResponse<SemestersResponse>(response);
    } catch (error) {
      if (error instanceof APIError) {
        throw new Error(`Failed to fetch semesters: ${error.message}`);
      }
      throw new Error('Failed to fetch semesters: Network error');
    }
  },

  // Get latest semester
  getLatestSemester: async (): Promise<LatestSemesterResponse> => {
    try {
      const response = await safeFetch(`${API_BASE}/v1/index/latest_semester`);
      return await parseJSONResponse<LatestSemesterResponse>(response);
    } catch (error) {
      if (error instanceof APIError) {
        throw new Error(`Failed to fetch latest semester: ${error.message}`);
      }
      throw new Error('Failed to fetch latest semester: Network error');
    }
  },

  // Search sections
  searchSections: async (query: string, year: number, term: number): Promise<SectionsSearchResponse> => {
    try {
      const response = await safeFetch(`${API_BASE}/v1/search/sections?query=${query}&year=${year}&term=${term}`);
      return await parseJSONResponse<SectionsSearchResponse>(response);
    } catch (error) {
      if (error instanceof APIError) {
        throw new Error(`Failed to search sections: ${error.message}`);
      }
      throw new Error('Failed to search sections: Network error');
    }
  }
};

// Utility functions
export const termToSeason = (term: number): string => {
  switch (term) {
    case 10: return "Spring";
    case 20: return "Summer";
    case 30: return "Fall";
    default: return "Unknown";
  }
};

export const getSemesterDates = (year: number, term: number): { start: Date; end: Date } => {

  switch (term) {
    case 10:
      return {
        start: new Date(`${year}-01-08`),
        end: new Date(`${year}-04-04`)
      };
    case 20:
      return {
        start: new Date(`${year}-05-05`),
        end: new Date(`${year}-08-01`)
      };
    case 30:
      return {
        start: new Date(`${year}-09-02`),
        end: new Date(`${year}-12-01`)
      };
    default:
      throw new Error("Invalid term");
  }
};
