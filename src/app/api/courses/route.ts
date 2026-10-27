import { NextRequest, NextResponse } from 'next/server';
import { CourseRepository } from '@/lib/db/repositories/courses.repository';
import { mockCoursesCatalog } from '@/data/mockData';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const q = req.nextUrl.searchParams.get('q');
    let courses;

    try {
      if (q) {
        courses = await CourseRepository.search(q);
      } else {
        courses = await CourseRepository.listAll();
      }
    } catch {
      // Graceful fallback to static catalog if DB is momentarily unavailable
      courses = mockCoursesCatalog;
    }

    return NextResponse.json({
      success: true,
      count: courses.length,
      data: courses,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
