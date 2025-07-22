import { notFound, permanentRedirect } from "next/navigation";
import { safeFetch, ENDPOINTS } from "@/lib/api-config";

type ExpectedParams = Promise<{ course: string; redirect: string }>;

interface c_index {
    course_code: string;
    on_langara_website: boolean;
    subject: string;
    title: string;
}

// revalidate every 24 hours
const courses_data: Promise<c_index[]> = safeFetch(ENDPOINTS.courses.index, { 
    next: { revalidate: 86400 }
}).then((res) => res.json())
    .then((data: { courses: c_index[] }) => data.courses)
    .catch((error) => {
        console.warn('Failed to fetch courses data during build:', error.message);
        return []; // Return empty array as fallback
    });

const courses = (await courses_data).map(
    (course) => `${course.subject}-${course.course_code}`.toLowerCase()
);

export default async function RedirectPage({ params }: { params: ExpectedParams }) {
    const { course: subject, redirect: code } = await params;
    
    if (!courses.includes(`${subject}-${code}`.toLowerCase())) {
        notFound();
    }
    
    // Redirect from old format /courses/[subject]/[code] to new format /courses/[subject]-[code]
    const newPath = `/courses/${subject.toLowerCase()}-${code.toLowerCase()}`;
    
    permanentRedirect(newPath);
}
