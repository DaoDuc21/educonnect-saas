-- ============================================================================
-- EDUCONNECT SAAS - PRODUCTION INITIAL SEED DATA
-- Populate default system users, rooms, courses, schedule, quizzes
-- ============================================================================

-- 1. USERS & ACCOUNTS
INSERT INTO users (id, email, password_hash, full_name, avatar_url, role, admin_role, title, phone, department, status)
VALUES
('user-admin-1', 'dang.pham@educonnect.vn', 'admin123', 'Phạm Hồng Đăng', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80', 'admin', 'super_admin', 'Giám Đốc Trung Tâm (Super Admin)', '0903 888 999', 'Ban Giám Đốc', 'active'),
('user-admin-2', 'huong.vu@educonnect.vn', 'hocvu123', 'Vũ Thu Hương', 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150&auto=format&fit=crop&q=80', 'admin', 'academic_coordinator', 'Trưởng Ban Học Vụ & Điều Phối', '0912 333 444', 'Phòng Học Vụ', 'active'),
('user-admin-4', 'duc.do@educonnect.vn', 'tuyensinh123', 'Đỗ Minh Đức', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', 'admin', 'admissions', 'Chuyên Viên Tư Vấn Tuyển Sinh', '0934 111 222', 'Phòng Tuyển Sinh', 'active'),
('user-tutor-1', 'hoang.tran@educonnect.vn', 'giasu123', 'Thầy Trần Huy Hoàng', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', 'tutor', NULL, 'Gia Sư Chuyên Toán & Luyện Thi', '0912 345 678', 'Tổ Tự Nhiên', 'active'),
('user-student-1', 'quan.nguyen@educonnect.vn', 'hocsinh123', 'Nguyễn Minh Quân', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80', 'student', NULL, 'Học Sinh Lớp 12 Chuyên Tự Nhiên', '0909 112 233', 'Khối 12', 'active'),
('user-parent-1', 'my.hoang@educonnect.vn', 'phuhuynh123', 'Chị Hoàng Thảo My', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80', 'parent', NULL, 'Phụ Huynh Bé Nguyễn An & Minh Thư', '0918 889 900', 'Hội Phụ Huynh', 'active')
ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    password_hash = EXCLUDED.password_hash;

-- 2. CLASSROOMS
INSERT INTO classrooms (id, branch_id, name, type, capacity, facilities, location, status)
VALUES
('room-101', 'branch-main', 'Phòng 101 (Phòng Toán Chuyên)', 'physical', 25, ARRAY['Máy chiếu 4K', 'Bảng từ Hàn Quốc', 'Điều hòa Daikin', 'Camera điểm danh'], 'Tầng 1 - Tòa A', 'active'),
('room-102', 'branch-main', 'Phòng 102 (Phòng Ngoại Ngữ)', 'physical', 20, ARRAY['Tai nghe AudioLab', 'Smart TV 75 inch', 'Bảng tương tác'], 'Tầng 1 - Tòa A', 'active'),
('room-201', 'branch-main', 'Phòng 201 (Hội Trường Lớn)', 'physical', 60, ARRAY['Âm thanh vòm', 'Micro không dây', '2 Máy chiếu'], 'Tầng 2 - Tòa A', 'active'),
('room-online-1', 'branch-main', 'Google Meet Studio 01', 'online', 100, ARRAY['Google Meet Enterprise', 'Jamboard', 'Recording Cloud'], 'Trực Tuyến Cloud', 'active'),
('room-online-2', 'branch-main', 'Google Meet Studio 02', 'online', 100, ARRAY['Google Meet Enterprise', 'Quizlet Live', 'OBS Streaming'], 'Trực Tuyến Cloud', 'active')
ON CONFLICT (id) DO NOTHING;

-- 3. TUTOR PROFILES
INSERT INTO tutor_profiles (id, user_id, subject, hourly_rate, rating, completed_hours_month, total_earnings_month, active_classes_count, degrees, experience_years, quote, badge_title)
VALUES
('tutor-prof-1', 'user-tutor-1', 'Toán THPT & Luyện Thi ĐGNL', 450000, 4.95, 38.5, 17325000, 4, ARRAY['Cử nhân Sư Phạm Toán (ĐH Sư Phạm HN)', 'Thạc sĩ Toán Ứng Dụng'], 8, 'Học Toán không chỉ là điểm số, mà là rèn luyện tư duy logic trọn đời', 'Gia Sư Xuất Sắc')
ON CONFLICT (id) DO NOTHING;

-- 4. STUDENT PROFILES
INSERT INTO student_profiles (id, user_id, parent_id, grade, overall_progress, status, tuition_status, study_streak_days, exam_goal)
VALUES
('student-prof-1', 'user-student-1', 'user-parent-1', 'Lớp 12', 88, 'active', 'paid', 14, '{"examName": "Kỳ Thi Tốt Nghiệp THPT 2026", "targetScore": "Toán 9.2+", "targetDate": "2026-06-25"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- 5. COURSES
INSERT INTO courses (id, code, title, subject, grade_level, tutor_id, tutor_name, tutor_avatar, duration, price, original_price, schedule_description, rating, enrolled_count, max_students, features, banner_image, target_audience, course_overview, commitment_badge, status)
VALUES
('course-math-12', 'MATH-12-PRO', 'Luyện Thi THPT QG Môn Toán - Chinh Phục 9+', 'math', 'Lớp 12', 'user-tutor-1', 'Thầy Trần Huy Hoàng', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', '36 buổi (4.5 tháng)', 4500000, 5200000, 'Thứ 2 - Thứ 5 (19:30 - 21:00)', 4.96, 24, 30, ARRAY['Cam kết điểm 9+ mục tiêu', 'Thi thử trắc nghiệm hàng tuần', 'Chấm điểm rubric chi tiết', 'Phòng học Google Meet bản quyền'], 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&auto=format&fit=crop&q=80', 'Học sinh lớp 12 xét tuyển Đại học khối A, A1, B', 'Khoá học trọng tâm trang bị toàn diện kỹ năng giải toán vận dụng cao, bẫy trắc nghiệm và tối ưu thời gian bấm máy tính Casio.', 'Cam kết hoàn 100% học phí', 'active'),
('course-eng-ielts', 'ENG-IELTS-7', 'IELTS Intensive 7.0+ Toàn Diện 4 Kỹ Năng', 'english', 'Lớp 11 - 12', 'user-tutor-1', 'Cô Emily Nguyễn', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80', '32 buổi (4 tháng)', 6200000, 7500000, 'Thứ 3 - Thứ 7 (18:00 - 19:30)', 4.92, 18, 20, ARRAY['Sửa bài Writing 1-1 với Examiners', 'Phòng Lab Speaking trực tiếp', 'Ngân hàng đề thi Cambridge bản quyền'], 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&auto=format&fit=crop&q=80', 'Học sinh có nền tảng 5.5 - 6.0 cần bứt phá band 7.0+', 'Học sâu phương pháp luận Academic Writing, tư duy phản biện Speaking và mẹo đọc quét Reading.', 'Đảm bảo đầu ra', 'active'),
('course-phy-11', 'PHY-11-ADV', 'Vật Lý 11 Chuyên Sâu & Giải Bài Tập Thực Tế', 'science', 'Lớp 11', 'user-tutor-1', 'Thầy Lê Quốc Dũng', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80', '24 buổi (3 tháng)', 3600000, 4200000, 'Thứ 4 - Chủ Nhật (15:00 - 16:30)', 4.88, 15, 25, ARRAY['Thực hành mô phỏng thí nghiệm 3D', 'Bộ đề cương ôn tập độc quyền', 'Hỗ trợ giải đáp 24/7 qua chat'], 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=600&auto=format&fit=crop&q=80', 'Học sinh lớp 11 muốn làm chủ mạch điện, quang hình và dao động', 'Khóa học giúp củng cố bản chất vật lý, gắn liền hiện tượng thực tiễn cuộc sống.', 'Đổi gia sư miễn phí', 'active')
ON CONFLICT (id) DO NOTHING;

-- 6. SCHEDULE EVENTS
INSERT INTO schedule_events (id, course_id, title, subject, day_of_week, date_str, start_time, end_time, start_hour, duration_hours, tutor_id, tutor_name, tutor_avatar, room, room_capacity, status, student_ids, student_names, online_meeting_url, description)
VALUES
('event-sched-1', 'course-math-12', 'Toán 12: Tích Phân & Ứng Dụng Hình Học (Buổi 12)', 'math', 2, '2026-10-27', '19:30', '21:00', 19.5, 1.5, 'user-tutor-1', 'Thầy Trần Huy Hoàng', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', 'Google Meet Studio 01', 100, 'confirmed', ARRAY['user-student-1'], ARRAY['Nguyễn Minh Quân'], 'https://meet.google.com/abc-defg-hij', 'Chữa 15 câu vận dụng cao về diện tích hình phẳng và thể tích khối tròn xoay.'),
('event-sched-2', 'course-math-12', 'Toán 12: Số Phức & Bất Đẳng Thức Môđun (Buổi 13)', 'math', 5, '2026-10-30', '19:30', '21:00', 19.5, 1.5, 'user-tutor-1', 'Thầy Trần Huy Hoàng', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', 'Phòng 101 (Phòng Toán Chuyên)', 25, 'confirmed', ARRAY['user-student-1'], ARRAY['Nguyễn Minh Quân'], NULL, 'Phương pháp lượng giác hóa và tập hợp điểm biểu diễn số phức.')
ON CONFLICT (id) DO NOTHING;

-- 7. ATTENDANCE RECORDS
INSERT INTO attendance_records (id, session_id, student_id, student_name, student_avatar, date, status, remarks, comprehension_rating, homework_score)
VALUES
('att-rec-1', 'event-sched-1', 'user-student-1', 'Nguyễn Minh Quân', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80', '2026-10-27', 'present', 'Học sinh vào lớp đúng giờ, chủ động giơ tay giải bài tập khó.', 5, 9.5)
ON CONFLICT (id) DO NOTHING;

-- 8. TUITION INVOICES
INSERT INTO tuition_invoices (id, student_id, student_name, course_name, amount, discount_amount, due_date, status, payment_date, payment_code, sessions_count)
VALUES
('inv-tuition-001', 'user-student-1', 'Nguyễn Minh Quân', 'Luyện Thi THPT QG Môn Toán - Chinh Phục 9+', 4500000, 500000, '2026-11-05', 'paid', '2026-10-20', 'HP-MATH-12-882', 36)
ON CONFLICT (id) DO NOTHING;

-- 9. QUIZZES & ASSESSMENT
INSERT INTO quizzes (id, course_id, course_title, subject, title, description, duration_minutes, total_questions, passing_score, assigned_date, due_date, difficulty_breakdown)
VALUES
('quiz-math-01', 'course-math-12', 'Luyện Thi THPT QG Môn Toán - Chinh Phục 9+', 'math', 'Khảo Sát Chất Lượng Toán 12 - Chuyên Đề Tích Phân & Số Phức', 'Đề kiểm tra đánh giá lỗ hổng kiến thức 4 cấp độ nhận thức theo chuẩn Bộ GD&ĐT.', 45, 4, 5.0, '2026-10-25', '2026-10-31', '{"recognitionCount": 1, "comprehensionCount": 1, "applicationCount": 1, "advancedCount": 1}'::jsonb)
ON CONFLICT (id) DO NOTHING;

INSERT INTO quiz_questions (id, quiz_id, order_number, content, difficulty_level, topic, options, correct_option_id, explanation, points)
VALUES
('q-1', 'quiz-math-01', 1, 'Cho hàm số f(x) liên tục trên đoạn [a, b]. Mệnh đề nào sau đây đúng về nguyên hàm?', 'recognition', 'Nguyên hàm & Tích phân cơ bản', '[{"id":"opt-a","label":"A","content":"Tích phân f(x)dx từ a đến b bằng F(b) - F(a)"},{"id":"opt-b","label":"B","content":"Tích phân f(x)dx từ a đến b bằng F(a) - F(b)"},{"id":"opt-c","label":"C","content":"Tích phân f(x)dx từ a đến b bằng F(a) * F(b)"},{"id":"opt-d","label":"D","content":"Tích phân f(x)dx từ a đến b bằng F(b) / F(a)"}]'::jsonb, 'opt-a', 'Theo công thức Newton-Leibniz: Tích phân f(x)dx = F(b) - F(a).', 2.5),
('q-2', 'quiz-math-01', 2, 'Tìm môđun của số phức z = 3 - 4i.', 'comprehension', 'Số phức', '[{"id":"opt-a","label":"A","content":"|z| = 7"},{"id":"opt-b","label":"B","content":"|z| = 5"},{"id":"opt-c","label":"C","content":"|z| = 25"},{"id":"opt-d","label":"D","content":"|z| = 1"}]'::jsonb, 'opt-b', '|z| = căn(3^2 + (-4)^2) = căn(25) = 5.', 2.5)
ON CONFLICT (id) DO NOTHING;
