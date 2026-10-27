/**
 * EduConnect SaaS - Course Repository
 * Location: src/lib/db/repositories/courses.repository.ts
 * Uses Redis Cache + PostgreSQL Indexed Querying
 */

import { query } from '../client';
import { cache } from '../redis';
import { Course } from '@/types';

export class CourseRepository {
  private static CACHE_TTL = 300; // 5 minutes

  public static async listAll(): Promise<Course[]> {
    const cacheKey = 'courses:all';
    const cached = await cache.get<Course[]>(cacheKey);
    if (cached) return cached;

    const res = await query(`
      SELECT 
        id, code, title, subject, grade_level as "gradeLevel",
        tutor_id as "tutorId", tutor_name as "tutorName", tutor_avatar as "tutorAvatar",
        tutor_title as "tutorTitle", duration, price::float, original_price::float as "originalPrice",
        schedule_description as "scheduleDescription", rating::float, enrolled_count as "enrolledCount",
        max_students as "maxStudents", features, banner_image as "bannerImage",
        commitment_badge as "commitmentBadge", target_audience as "targetAudience",
        course_overview as "courseOverview", description, status
      FROM courses
      WHERE deleted_at IS NULL AND status = 'active'
      ORDER BY rating DESC, enrolled_count DESC
    `);

    const courses: Course[] = res.rows;
    await cache.set(cacheKey, courses, this.CACHE_TTL);
    return courses;
  }

  public static async getById(id: string): Promise<Course | null> {
    const cacheKey = `courses:${id}`;
    const cached = await cache.get<Course>(cacheKey);
    if (cached) return cached;

    const res = await query(
      `SELECT 
        id, code, title, subject, grade_level as "gradeLevel",
        tutor_id as "tutorId", tutor_name as "tutorName", tutor_avatar as "tutorAvatar",
        tutor_title as "tutorTitle", duration, price::float, original_price::float as "originalPrice",
        schedule_description as "scheduleDescription", rating::float, enrolled_count as "enrolledCount",
        max_students as "maxStudents", features, banner_image as "bannerImage",
        commitment_badge as "commitmentBadge", target_audience as "targetAudience",
        course_overview as "courseOverview", description, status
      FROM courses
      WHERE id = $1 AND deleted_at IS NULL`,
      [id]
    );

    const course = res.rows[0] || null;
    if (course) {
      await cache.set(cacheKey, course, this.CACHE_TTL);
    }
    return course;
  }

  public static async search(searchTerm: string): Promise<Course[]> {
    const res = await query(
      `SELECT 
        id, code, title, subject, grade_level as "gradeLevel",
        tutor_name as "tutorName", tutor_avatar as "tutorAvatar",
        duration, price::float, rating::float, enrolled_count as "enrolledCount",
        banner_image as "bannerImage", commitment_badge as "commitmentBadge"
      FROM courses
      WHERE deleted_at IS NULL
        AND (title ILIKE $1 OR subject ILIKE $1 OR grade_level ILIKE $1 OR tutor_name ILIKE $1)
      ORDER BY rating DESC LIMIT 20`,
      [`%${searchTerm}%`]
    );
    return res.rows;
  }
}
