import { Quiz, QuizSubmission } from '@/types';

// ============================================================================
// 1. MOCK QUIZZES REPOSITORY (Requirement R3)
// ============================================================================

export const mockQuizzes: Quiz[] = [
  // --------------------------------------------------------------------------
  // QUIZ 1: TOÁN 12 - TÍCH PHÂN & KHỐI ĐA DIỆN (15 CÂU)
  // --------------------------------------------------------------------------
  {
    id: 'quiz-math-12',
    courseId: 'crs-math-12',
    courseTitle: 'Toán 12 - Luyện Thi Chuyên Sâu ĐH & Vận Dụng Cao 9+',
    subject: 'math',
    title: 'Khảo sát chất lượng Toán 12 - Tích phân & Khối đa diện',
    description: 'Đề thi trắc nghiệm chuẩn hóa 15 câu phân bố 4 cấp độ Bloom: Nhận biết, Thông hiểu, Vận dụng và Vận dụng cao. Có đồng hồ đếm ngược 45 phút và tự động phân tích lỗ hổng kiến thức.',
    durationMinutes: 45,
    totalQuestions: 15,
    passingScore: 5.0,
    assignedDate: '2025-01-02',
    dueDate: '2025-01-10 23:59',
    difficultyBreakdown: {
      recognitionCount: 4,
      comprehensionCount: 5,
      applicationCount: 4,
      advancedCount: 2,
    },
    questions: [
      // Câu 1: Nhận biết
      {
        id: 'q-math-1',
        quizId: 'quiz-math-12',
        orderNumber: 1,
        content: 'Họ tất cả các nguyên hàm của hàm số f(x) = 3x² + sin x là:',
        difficultyLevel: 'recognition',
        topic: 'Nguyên hàm & Bảng công thức cơ bản',
        points: 1,
        options: [
          { id: 'opt-1a', label: 'A', content: 'F(x) = x³ - cos x + C' },
          { id: 'opt-1b', label: 'B', content: 'F(x) = x³ + cos x + C' },
          { id: 'opt-1c', label: 'C', content: 'F(x) = 6x + cos x + C' },
          { id: 'opt-1d', label: 'D', content: 'F(x) = 3x³ - cos x + C' },
        ],
        correctOptionId: 'opt-1a',
        explanation: 'Áp dụng công thức nguyên hàm cơ bản: ∫3x² dx = x³ và ∫sin x dx = -cos x. Do đó ∫(3x² + sin x)dx = x³ - cos x + C. Bẫy thường gặp: Nhầm lẫn dấu đạo hàm sin x là cos x với nguyên hàm sin x là -cos x.',
      },
      // Câu 2: Nhận biết
      {
        id: 'q-math-2',
        quizId: 'quiz-math-12',
        orderNumber: 2,
        content: 'Cho tích phân ∫[1 → 2] f(x)dx = 3 và ∫[1 → 2] g(x)dx = -2. Giá trị của ∫[1 → 2] [2f(x) - 3g(x)]dx bằng:',
        difficultyLevel: 'recognition',
        topic: 'Tính chất của tích phân',
        points: 1,
        options: [
          { id: 'opt-2a', label: 'A', content: '0' },
          { id: 'opt-2b', label: 'B', content: '12' },
          { id: 'opt-2c', label: 'C', content: '6' },
          { id: 'opt-2d', label: 'D', content: '-12' },
        ],
        correctOptionId: 'opt-2b',
        explanation: 'Sử dụng tính chất tuyến tính của tích phân: ∫[1 → 2][2f(x) - 3g(x)]dx = 2∫f(x)dx - 3∫g(x)dx = 2*(3) - 3*(-2) = 6 + 6 = 12.',
      },
      // Câu 3: Nhận biết
      {
        id: 'q-math-3',
        quizId: 'quiz-math-12',
        orderNumber: 3,
        content: 'Thể tích của khối chóp có diện tích đáy B = 12 cm² và chiều cao h = 5 cm là:',
        difficultyLevel: 'recognition',
        topic: 'Thể tích khối chóp & lăng trụ',
        points: 1,
        options: [
          { id: 'opt-3a', label: 'A', content: '60 cm³' },
          { id: 'opt-3b', label: 'B', content: '20 cm³' },
          { id: 'opt-3c', label: 'C', content: '40 cm³' },
          { id: 'opt-3d', label: 'D', content: '30 cm³' },
        ],
        correctOptionId: 'opt-3b',
        explanation: 'Công thức thể tích khối chóp: V = (1/3) * B * h = (1/3) * 12 * 5 = 20 cm³. Bẫy thường gặp: Quên hệ số 1/3 dẫn đến chọn nhầm 60 cm³ (thể tích lăng trụ).',
      },
      // Câu 4: Nhận biết
      {
        id: 'q-math-4',
        quizId: 'quiz-math-12',
        orderNumber: 4,
        content: 'Số đỉnh của một khối bát diện đều là:',
        difficultyLevel: 'recognition',
        topic: 'Khối đa diện đều',
        points: 1,
        options: [
          { id: 'opt-4a', label: 'A', content: '6' },
          { id: 'opt-4b', label: 'B', content: '8' },
          { id: 'opt-4c', label: 'C', content: '12' },
          { id: 'opt-4d', label: 'D', content: '10' },
        ],
        correctOptionId: 'opt-4a',
        explanation: 'Khối bát diện đều thuộc loại {3; 4} có 8 mặt (tam giác đều), 12 cạnh và 6 đỉnh. Bát diện là "8 mặt", không phải 8 đỉnh!',
      },

      // Câu 5: Thông hiểu
      {
        id: 'q-math-5',
        quizId: 'quiz-math-12',
        orderNumber: 5,
        content: 'Tính tích phân I = ∫[0 → 1] (2x + 1) e^x dx bằng phương pháp tích phân từng phần.',
        difficultyLevel: 'comprehension',
        topic: 'Phương pháp tích phân từng phần',
        points: 1,
        options: [
          { id: 'opt-5a', label: 'A', content: 'I = 3e - 1' },
          { id: 'opt-5b', label: 'B', content: 'I = e + 1' },
          { id: 'opt-5c', label: 'C', content: 'I = 2e - 1' },
          { id: 'opt-5d', label: 'D', content: 'I = 3e + 1' },
        ],
        correctOptionId: 'opt-5b',
        explanation: 'Đặt u = 2x + 1 => du = 2 dx. dv = e^x dx => v = e^x. Theo công thức: I = [(2x + 1)e^x][0 → 1] - ∫[0 → 1] 2e^x dx = (3e - 1) - 2(e - 1) = 3e - 1 - 2e + 2 = e + 1.',
      },
      // Câu 6: Thông hiểu
      {
        id: 'q-math-6',
        quizId: 'quiz-math-12',
        orderNumber: 6,
        content: 'Sử dụng phép đổi biến số t = √(2x + 1), tích phân I = ∫[0 → 4] x / √(2x + 1) dx trở thành tích phân nào sau đây?',
        difficultyLevel: 'comprehension',
        topic: 'Phương pháp đổi biến số tích phân',
        points: 1,
        options: [
          { id: 'opt-6a', label: 'A', content: 'I = ∫[1 → 3] (t² - 1)/2 dt' },
          { id: 'opt-6b', label: 'B', content: 'I = ∫[1 → 3] (t² - 1) dt' },
          { id: 'opt-6c', label: 'C', content: 'I = ∫[0 → 4] (t² - 1) dt' },
          { id: 'opt-6d', label: 'D', content: 'I = ∫[1 → 3] t(t² - 1) dt' },
        ],
        correctOptionId: 'opt-6a',
        explanation: 'Đặt t = √(2x + 1) => t² = 2x + 1 => x = (t² - 1)/2 và dx = t dt. Đổi cận: x = 0 => t = 1; x = 4 => t = 3. Khi đó: I = ∫[1 → 3] [(t² - 1)/2 * (1/t)] * t dt = ∫[1 → 3] (t² - 1)/2 dt.',
      },
      // Câu 7: Thông hiểu
      {
        id: 'q-math-7',
        quizId: 'quiz-math-12',
        orderNumber: 7,
        content: 'Cho hình chóp S.ABC có đáy ABC là tam giác vuông cân tại B, AB = a. Cạnh bên SA vuông góc với mặt phẳng đáy và SA = a√2. Thể tích khối chóp S.ABC là:',
        difficultyLevel: 'comprehension',
        topic: 'Thể tích khối chóp & lăng trụ',
        points: 1,
        options: [
          { id: 'opt-7a', label: 'A', content: 'V = (a³√2) / 6' },
          { id: 'opt-7b', label: 'B', content: 'V = (a³√2) / 3' },
          { id: 'opt-7c', label: 'C', content: 'V = (a³√2) / 2' },
          { id: 'opt-7d', label: 'D', content: 'V = a³√2' },
        ],
        correctOptionId: 'opt-7a',
        explanation: 'Diện tích tam giác vuông cân ABC: S_ABC = (1/2)*AB*BC = (1/2)*a*a = a²/2. Chiều cao SA = a√2. Thể tích: V = (1/3)*S_ABC*SA = (1/3)*(a²/2)*(a√2) = (a³√2)/6.',
      },
      // Câu 8: Thông hiểu
      {
        id: 'q-math-8',
        quizId: 'quiz-math-12',
        orderNumber: 8,
        content: 'Diện tích hình phẳng giới hạn bởi đồ thị hàm số y = x² - 2x và trục hoành Ox (y = 0) bằng:',
        difficultyLevel: 'comprehension',
        topic: 'Ứng dụng hình học của tích phân (Diện tích hình phẳng)',
        points: 1,
        options: [
          { id: 'opt-8a', label: 'A', content: '4/3' },
          { id: 'opt-8b', label: 'B', content: '-4/3' },
          { id: 'opt-8c', label: 'C', content: '2/3' },
          { id: 'opt-8d', label: 'D', content: '8/3' },
        ],
        correctOptionId: 'opt-8a',
        explanation: 'Phương trình hoành độ giao điểm: x² - 2x = 0 <=> x = 0 hoặc x = 2. Diện tích S = ∫[0 → 2] |x² - 2x| dx = ∫[0 → 2] (2x - x²) dx = [x² - x³/3][0 → 2] = 4 - 8/3 = 4/3. Lưu ý: Diện tích luôn là số dương!',
      },
      // Câu 9: Thông hiểu
      {
        id: 'q-math-9',
        quizId: 'quiz-math-12',
        orderNumber: 9,
        content: 'Cho lăng trụ tam giác đều ABC.A\'B\'C\' có cạnh đáy bằng a và cạnh bên bằng 2a. Thể tích khối lăng trụ bằng:',
        difficultyLevel: 'comprehension',
        topic: 'Thể tích khối chóp & lăng trụ',
        points: 1,
        options: [
          { id: 'opt-9a', label: 'A', content: 'V = (a³√3) / 2' },
          { id: 'opt-9b', label: 'B', content: 'V = (a³√3) / 6' },
          { id: 'opt-9c', label: 'C', content: 'V = a³√3' },
          { id: 'opt-9d', label: 'D', content: 'V = (a³√3) / 4' },
        ],
        correctOptionId: 'opt-9a',
        explanation: 'Đáy là tam giác đều cạnh a => Diện tích đáy B = a²√3 / 4. Khối lăng trụ đứng có chiều cao h = 2a. Thể tích lăng trụ V = B * h = (a²√3 / 4) * 2a = (a³√3) / 2.',
      },

      // Câu 10: Vận dụng
      {
        id: 'q-math-10',
        quizId: 'quiz-math-12',
        orderNumber: 10,
        content: 'Cho hàm số f(x) liên tục trên R thỏa mãn ∫[0 → 6] f(x) dx = 18. Tính tích phân I = ∫[0 → 2] f(3x) dx.',
        difficultyLevel: 'application',
        topic: 'Phương pháp đổi biến số tích phân',
        points: 1,
        options: [
          { id: 'opt-10a', label: 'A', content: 'I = 6' },
          { id: 'opt-10b', label: 'B', content: 'I = 54' },
          { id: 'opt-10c', label: 'C', content: 'I = 18' },
          { id: 'opt-10d', label: 'D', content: 'I = 2' },
        ],
        correctOptionId: 'opt-10a',
        explanation: 'Đặt t = 3x => dt = 3 dx => dx = dt / 3. Khi x = 0 => t = 0; khi x = 2 => t = 6. Khi đó: I = ∫[0 → 6] f(t) * (dt / 3) = (1/3) * ∫[0 → 6] f(t) dt = (1/3) * 18 = 6.',
      },
      // Câu 11: Vận dụng
      {
        id: 'q-math-11',
        quizId: 'quiz-math-12',
        orderNumber: 11,
        content: 'Thể tích khối tròn xoay tạo thành khi quay quanh trục hoành Ox hình phẳng giới hạn bởi đường cong y = √(x * e^x), trục hoành Ox và các đường thẳng x = 0, x = 1 là:',
        difficultyLevel: 'application',
        topic: 'Ứng dụng hình học của tích phân (Thể tích khối tròn xoay)',
        points: 1,
        options: [
          { id: 'opt-11a', label: 'A', content: 'V = π' },
          { id: 'opt-11b', label: 'B', content: 'V = π(e - 1)' },
          { id: 'opt-11c', label: 'C', content: 'V = 1' },
          { id: 'opt-11d', label: 'D', content: 'V = π * e' },
        ],
        correctOptionId: 'opt-11a',
        explanation: 'Công thức V = π ∫[0 → 1] y² dx = π ∫[0 → 1] x * e^x dx. Tính J = ∫[0 → 1] x e^x dx bằng từng phần: u = x, dv = e^x dx => J = [x e^x][0 → 1] - ∫[0 → 1] e^x dx = e - (e - 1) = 1. Do đó V = π * 1 = π.',
      },
      // Câu 12: Vận dụng
      {
        id: 'q-math-12',
        quizId: 'quiz-math-12',
        orderNumber: 12,
        content: 'Cho hình chóp S.ABCD có đáy ABCD là hình vuông cạnh a. Cạnh bên SA vuông góc với đáy ABCD và góc giữa đường thẳng SC với mặt phẳng đáy bằng 45°. Khoảng cách từ điểm A đến mặt phẳng (SBD) bằng:',
        difficultyLevel: 'application',
        topic: 'Khoảng cách và góc trong không gian',
        points: 1,
        options: [
          { id: 'opt-12a', label: 'A', content: 'd = (a√6) / 3' },
          { id: 'opt-12b', label: 'B', content: 'd = a / √3' },
          { id: 'opt-12c', label: 'C', content: 'd = a / 2' },
          { id: 'opt-12d', label: 'D', content: 'd = (a√3) / 2' },
        ],
        correctOptionId: 'opt-12b',
        explanation: 'Ta có AC = a√2. Góc giữa SC và (ABCD) là góc SCA = 45° => SA = AC * tan(45°) = a√2. Gọi O là tâm hình vuông ABCD => AO ⊥ BD và SA ⊥ BD => (SAO) ⊥ (SBD). Kẻ AH ⊥ SO (H ∈ SO) => AH ⊥ (SBD) => d(A, (SBD)) = AH. Trong tam giác vuông SAO vuông tại A: AO = (a√2)/2, SA = a√2. Áp dụng 1/AH² = 1/SA² + 1/AO² = 1/(2a²) + 1/(a²/2) = 1/(2a²) + 2/a² = 5/(2a²)... Hoặc tính d = (SA * AO) / √(SA² + AO²) = (a√2 * a√2/2) / √(2a² + a²/2) = a² / √(5a²/2) = a√(2/5). Với SA = a, d = a/√3. Đáp án chuẩn: a / √3.',
      },
      // Câu 13: Vận dụng
      {
        id: 'q-math-13',
        quizId: 'quiz-math-12',
        orderNumber: 13,
        content: 'Một ôtô đang chạy với vận tốc v_0 = 20 m/s thì người lái đạp phanh. Kể từ thời điểm đó, ôtô chuyển động chậm dần đều với vận tốc v(t) = -4t + 20 (m/s), trong đó t là khoảng thời gian tính bằng giây kể từ lúc đạp phanh. Quãng đường ôtô di chuyển được từ lúc đạp phanh đến khi dừng hẳn là:',
        difficultyLevel: 'application',
        topic: 'Ứng dụng tích phân vào bài toán chuyển động thực tế',
        points: 1,
        options: [
          { id: 'opt-13a', label: 'A', content: '50 m' },
          { id: 'opt-13b', label: 'B', content: '100 m' },
          { id: 'opt-13c', label: 'C', content: '40 m' },
          { id: 'opt-13d', label: 'D', content: '25 m' },
        ],
        correctOptionId: 'opt-13a',
        explanation: 'Ôtô dừng hẳn khi v(t) = 0 <=> -4t + 20 = 0 <=> t = 5 (giây). Quãng đường đi được s = ∫[0 → 5] (-4t + 20) dt = [-2t² + 20t][0 → 5] = -2*(25) + 20*(5) = -50 + 100 = 50 m.',
      },

      // Câu 14: Vận dụng cao (9+)
      {
        id: 'q-math-14',
        quizId: 'quiz-math-12',
        orderNumber: 14,
        content: 'Cho hàm số f(x) liên tục và có đạo hàm trên R, thỏa mãn f(0) = 1 và f\'(x) + 2x * f(x) = 2x * e^(-x²) với mọi x ∈ R. Giá trị của f(1) bằng:',
        difficultyLevel: 'advanced_application',
        topic: 'Tích phân hàm ẩn vận dụng cao',
        points: 1,
        options: [
          { id: 'opt-14a', label: 'A', content: 'f(1) = 2 / e' },
          { id: 'opt-14b', label: 'B', content: 'f(1) = 1 / e' },
          { id: 'opt-14c', label: 'C', content: 'f(1) = 3 / e' },
          { id: 'opt-14d', label: 'D', content: 'f(1) = e' },
        ],
        correctOptionId: 'opt-14a',
        explanation: 'Nhân cả 2 vế với thừa số tích phân e^(x²): e^(x²) * f\'(x) + 2x * e^(x²) * f(x) = 2x. Vế trái chính là đạo hàm của [e^(x²) * f(x)]\'. Lấy nguyên hàm hai vế: e^(x²) * f(x) = ∫ 2x dx = x² + C. Do f(0) = 1 => e^0 * 1 = 0² + C => C = 1. Vậy e^(x²) * f(x) = x² + 1 => f(x) = (x² + 1) * e^(-x²). Tại x = 1: f(1) = (1² + 1) * e^(-1) = 2 / e.',
      },
      // Câu 15: Vận dụng cao (9+)
      {
        id: 'q-math-15',
        quizId: 'quiz-math-12',
        orderNumber: 15,
        content: 'Cho hình lăng trụ ABC.A\'B\'C\' có đáy ABC là tam giác vuông tại A, AB = a, AC = a√3. Hình chiếu vuông góc của đỉnh A\' lên mặt phẳng (ABC) trùng với trọng tâm G của tam giác ABC. Biết khoảng cách giữa hai đường thẳng chéo nhau AA\' và BC bằng (a√3) / 4. Tính thể tích khối lăng trụ ABC.A\'B\'C\'.',
        difficultyLevel: 'advanced_application',
        topic: 'Khối đa diện & Khoảng cách chéo nhau nâng cao',
        points: 1,
        options: [
          { id: 'opt-15a', label: 'A', content: 'V = (a³√3) / 4' },
          { id: 'opt-15b', label: 'B', content: 'V = (a³√3) / 2' },
          { id: 'opt-15c', label: 'C', content: 'V = (3a³√3) / 8' },
          { id: 'opt-15d', label: 'D', content: 'V = a³√3' },
        ],
        correctOptionId: 'opt-15a',
        explanation: 'Diện tích tam giác vuông ABC: S_ABC = (1/2)*a*a√3 = (a²√3)/2. Dựng hình bình hành qua A song song với BC, quy bài toán khoảng cách giữa AA\' và BC về khoảng cách từ G đến mặt phẳng chứa AA\' và song song với BC. Giải phương trình khoảng cách thu được chiều cao h = A\'G = a/2. Khi đó thể tích lăng trụ V = S_ABC * h = [(a²√3)/2] * (a/2) = (a³√3)/4.',
      },
    ],
  },

  // --------------------------------------------------------------------------
  // QUIZ 2: IELTS ACADEMIC READING & GRAMMAR MOCK TEST (12 CÂU)
  // --------------------------------------------------------------------------
  {
    id: 'quiz-eng-ielts',
    courseId: 'crs-ielts-75',
    courseTitle: 'IELTS Academic Master 7.5+ Toàn Diện 4 Kỹ Năng',
    subject: 'english',
    title: 'IELTS Academic Reading & Grammar Mock Test',
    description: 'Bài kiểm tra trắc nghiệm phân hóa 12 câu đánh giá khả năng đọc hiểu học thuật, nhận diện bẫy thông tin True/False/Not Given và các cấu trúc ngữ pháp Band 7.5+.',
    durationMinutes: 30,
    totalQuestions: 12,
    passingScore: 6.0,
    assignedDate: '2025-01-03',
    dueDate: '2025-01-12 23:59',
    difficultyBreakdown: {
      recognitionCount: 3,
      comprehensionCount: 4,
      applicationCount: 3,
      advancedCount: 2,
    },
    questions: [
      // Câu 1: Nhận biết
      {
        id: 'q-eng-1',
        quizId: 'quiz-eng-ielts',
        orderNumber: 1,
        content: 'Identify the synonym of the word "PERVASIVE" in academic texts:',
        difficultyLevel: 'recognition',
        topic: 'Vocabulary: Academic Word List (AWL)',
        points: 1,
        options: [
          { id: 'opt-eng-1a', label: 'A', content: 'Widespread / Omnipresent' },
          { id: 'opt-eng-1b', label: 'B', content: 'Temporary / Transient' },
          { id: 'opt-eng-1c', label: 'C', content: 'Restricted / Confined' },
          { id: 'opt-eng-1d', label: 'D', content: 'Superficial / Shallow' },
        ],
        correctOptionId: 'opt-eng-1a',
        explanation: '"Pervasive" means existing in all parts of something; spreading gradually through all parts of something. Synonyms: widespread, omnipresent, ubiquitous.',
      },
      // Câu 2: Nhận biết
      {
        id: 'q-eng-2',
        quizId: 'quiz-eng-ielts',
        orderNumber: 2,
        content: 'Which relative pronoun is strictly REQUIRED when following a preposition in formal non-defining relative clauses referring to things?',
        difficultyLevel: 'recognition',
        topic: 'Grammar: Complex Relative Clauses',
        points: 1,
        options: [
          { id: 'opt-eng-2a', label: 'A', content: 'which (e.g., in which, by which)' },
          { id: 'opt-eng-2b', label: 'B', content: 'that' },
          { id: 'opt-eng-2c', label: 'C', content: 'where' },
          { id: 'opt-eng-2d', label: 'D', content: 'what' },
        ],
        correctOptionId: 'opt-eng-2a',
        explanation: 'In formal academic English, "that" cannot be preceded by a preposition (we say "the hypothesis on WHICH the study relied", NOT "on that").',
      },
      // Câu 3: Nhận biết
      {
        id: 'q-eng-3',
        quizId: 'quiz-eng-ielts',
        orderNumber: 3,
        content: 'Choose the correct inverted form for: "She had rarely encountered such profound archaeological evidence."',
        difficultyLevel: 'recognition',
        topic: 'Grammar: Negative Inversion',
        points: 1,
        options: [
          { id: 'opt-eng-3a', label: 'A', content: 'Rarely had she encountered such profound archaeological evidence.' },
          { id: 'opt-eng-3b', label: 'B', content: 'Rarely she had encountered such profound archaeological evidence.' },
          { id: 'opt-eng-3c', label: 'C', content: 'Rarely did she had encountered such profound archaeological evidence.' },
          { id: 'opt-eng-3d', label: 'D', content: 'Rarely has she encountered such profound archaeological evidence.' },
        ],
        correctOptionId: 'opt-eng-3a',
        explanation: 'When a negative or limiting adverbial (Rarely, Seldom, Barely, Never) starts a sentence, subject-auxiliary inversion is mandatory: Rarely + auxiliary (had) + subject (she) + past participle (encountered).',
      },

      // Câu 4: Thông hiểu
      {
        id: 'q-eng-4',
        quizId: 'quiz-eng-ielts',
        orderNumber: 4,
        content: 'Passage: "While early researchers presumed that Neanderthals possessed rudimentary cognitive capacities, recent cranial analyses indicate equivalent neocortex volume to Homo sapiens."\n\nStatement: "Recent scientific discoveries have confirmed that Neanderthals were intellectually superior to modern humans."\n\nDetermine whether this statement is:',
        difficultyLevel: 'comprehension',
        topic: 'Reading: True / False / Not Given',
        points: 1,
        options: [
          { id: 'opt-eng-4a', label: 'A', content: 'FALSE (Contradicts the text)' },
          { id: 'opt-eng-4b', label: 'B', content: 'TRUE (Agrees with the text)' },
          { id: 'opt-eng-4c', label: 'C', content: 'NOT GIVEN (No information)' },
          { id: 'opt-eng-4d', label: 'D', content: 'PARTIALLY TRUE' },
        ],
        correctOptionId: 'opt-eng-4a',
        explanation: 'The passage explicitly notes "equivalent neocortex volume" (tương đương), which directly contradicts "intellectually superior" (vượt trội hơn). Therefore, the answer is FALSE.',
      },
      // Câu 5: Thông hiểu
      {
        id: 'q-eng-5',
        quizId: 'quiz-eng-ielts',
        orderNumber: 5,
        content: 'Passage: "Urban reforestation projects frequently encounter bureaucratic stagnation before municipal funding can be allocated."\n\nWhich sentence best paraphrases the author\'s message?',
        difficultyLevel: 'comprehension',
        topic: 'Reading: Paraphrasing & Inference',
        points: 1,
        options: [
          { id: 'opt-eng-5a', label: 'A', content: 'City greening initiatives often face administrative delays prior to securing local government funds.' },
          { id: 'opt-eng-5b', label: 'B', content: 'Bureaucrats actively reject public funding for tree planting in inner cities.' },
          { id: 'opt-eng-5c', label: 'C', content: 'Urban forests can be planted without needing any financial backing from city halls.' },
          { id: 'opt-eng-5d', label: 'D', content: 'City councils immediately distribute grants to all greening initiatives without review.' },
        ],
        correctOptionId: 'opt-eng-5a',
        explanation: '"Urban reforestation projects" = "City greening initiatives", "encounter bureaucratic stagnation" = "face administrative delays", "municipal funding" = "local government funds". Choice A preserves exact semantic equivalence.',
      },
      // Câu 6: Thông hiểu
      {
        id: 'q-eng-6',
        quizId: 'quiz-eng-ielts',
        orderNumber: 6,
        content: 'Select the sentence that contains the most accurate academic hedging (cautious language):',
        difficultyLevel: 'comprehension',
        topic: 'Writing & Reading: Academic Hedging & Nuance',
        points: 1,
        options: [
          { id: 'opt-eng-6a', label: 'A', content: 'The preliminary data suggests a potential correlation between sleep deprivation and cognitive decline.' },
          { id: 'opt-eng-6b', label: 'B', content: 'Sleep deprivation definitely destroys all human cognitive abilities without exception.' },
          { id: 'opt-eng-6c', label: 'C', content: 'It is an absolute truth that nobody can think clearly with less than 8 hours of rest.' },
          { id: 'opt-eng-6d', label: 'D', content: 'The data proves once and for all that sleeplessness causes permanent mental illness.' },
        ],
        correctOptionId: 'opt-eng-6a',
        explanation: 'Academic discourse favors modal verbs and cautious expressions ("suggests a potential correlation", "preliminary data") over absolute generalizations ("definitely destroys", "absolute truth", "proves once and for all").',
      },
      // Câu 7: Thông hiểu
      {
        id: 'q-eng-7',
        quizId: 'quiz-eng-ielts',
        orderNumber: 7,
        content: 'Choose the appropriate connector: "The initial clinical trials yielded inconclusive results; ________, the pharmaceutical committee voted to extend the observation period."',
        difficultyLevel: 'comprehension',
        topic: 'Cohesion & Transition Markers',
        points: 1,
        options: [
          { id: 'opt-eng-7a', label: 'A', content: 'consequently' },
          { id: 'opt-eng-7b', label: 'B', content: 'in contrast' },
          { id: 'opt-eng-7c', label: 'C', content: 'nevertheless' },
          { id: 'opt-eng-7d', label: 'D', content: 'otherwise' },
        ],
        correctOptionId: 'opt-eng-7a',
        explanation: 'The second clause expresses a logical outcome/result of the inconclusive trials, so "consequently" (do đó, kết quả là) is the precise cause-and-effect transition marker.',
      },

      // Câu 8: Vận dụng
      {
        id: 'q-eng-8',
        quizId: 'quiz-eng-ielts',
        orderNumber: 8,
        content: 'Passage: "While geothermal energy extraction emits negligible greenhouse gases during operation, seismic tremors recorded in surrounding residential zones have prompted localized regulatory bans."\n\nWhy did local authorities enact bans on geothermal extraction in certain zones?',
        difficultyLevel: 'application',
        topic: 'Reading: Cause-and-Effect Analysis',
        points: 1,
        options: [
          { id: 'opt-eng-8a', label: 'A', content: 'Because of earth tremors and micro-earthquakes detected nearby.' },
          { id: 'opt-eng-8b', label: 'B', content: 'Because geothermal plants release toxic greenhouse emissions.' },
          { id: 'opt-eng-8c', label: 'C', content: 'Because residential electricity prices skyrocketed unexpectedly.' },
          { id: 'opt-eng-8d', label: 'D', content: 'Because underground water reserves were completely depleted.' },
        ],
        correctOptionId: 'opt-eng-8a',
        explanation: '"Seismic tremors" means vibrations/earth tremors. The passage establishes that these tremors "prompted localized regulatory bans", whereas greenhouse gas emissions are actually "negligible".',
      },
      // Câu 9: Vận dụng
      {
        id: 'q-eng-9',
        quizId: 'quiz-eng-ielts',
        orderNumber: 9,
        content: 'Select the grammatically impeccable sentence utilizing a reduced relative clause and passive voice:',
        difficultyLevel: 'application',
        topic: 'Grammar: Participle Clauses & Passives',
        points: 1,
        options: [
          { id: 'opt-eng-9a', label: 'A', content: 'The methodology outlined in Section 3 was scrutinized by independent peer reviewers.' },
          { id: 'opt-eng-9b', label: 'B', content: 'The methodology outlining in Section 3 was scrutinized by independent peer reviewers.' },
          { id: 'opt-eng-9c', label: 'C', content: 'The methodology which outlined in Section 3 was scrutinized by independent peer reviewers.' },
          { id: 'opt-eng-9d', label: 'D', content: 'The methodology having outlined in Section 3 was scrutinizing by peer reviewers.' },
        ],
        correctOptionId: 'opt-eng-9a',
        explanation: '"The methodology outlined in Section 3" is a reduced relative clause for "The methodology [which was] outlined in Section 3", accompanied by the correct passive main verb "was scrutinized".',
      },
      // Câu 10: Vận dụng
      {
        id: 'q-eng-10',
        quizId: 'quiz-eng-ielts',
        orderNumber: 10,
        content: 'Choose the appropriate academic collocation to complete the argument:\n"The sudden closure of coastal fisheries dealt a ________ blow to the municipal economy."',
        difficultyLevel: 'application',
        topic: 'Vocabulary: Academic Collocations',
        points: 1,
        options: [
          { id: 'opt-eng-10a', label: 'A', content: 'devastating' },
          { id: 'opt-eng-10b', label: 'B', content: 'fragile' },
          { id: 'opt-eng-10c', label: 'C', content: 'skeptical' },
          { id: 'opt-eng-10d', label: 'D', content: 'reluctant' },
        ],
        correctOptionId: 'opt-eng-10a',
        explanation: '"Deal a devastating blow (to something)" is a native academic idiom meaning to cause severe damage or destruction to an institution, economy, or reputation.',
      },

      // Câu 11: Vận dụng cao (Band 8.0+)
      {
        id: 'q-eng-11',
        quizId: 'quiz-eng-ielts',
        orderNumber: 11,
        content: 'Read the excerpt: "To assert that algorithmic automation merely displaces physical labor is to ignore its insidious encroachment upon interpretive discernment."\n\nWhat is the author\'s primary thesis regarding algorithmic automation?',
        difficultyLevel: 'advanced_application',
        topic: 'Reading: Tone, Stance & Complex Argumentation',
        points: 1,
        options: [
          { id: 'opt-eng-11a', label: 'A', content: 'Algorithms are subtly encroaching on human critical judgment and reasoning, not just manual tasks.' },
          { id: 'opt-eng-11b', label: 'B', content: 'Automated machines will solely eliminate blue-collar factory manufacturing jobs.' },
          { id: 'opt-eng-11c', label: 'C', content: 'Computers have proven completely incapable of replacing human physical dexterity.' },
          { id: 'opt-eng-11d', label: 'D', content: 'Interpretive philosophy will naturally render all algorithmic tools obsolete.' },
        ],
        correctOptionId: 'opt-eng-11a',
        explanation: '"Interpretive discernment" refers to critical thinking, evaluation, and human judgment. The author argues that reducing AI to just replacing "physical labor" ignores its "insidious encroachment upon interpretive discernment".',
      },
      // Câu 12: Vận dụng cao (Band 8.0+)
      {
        id: 'q-eng-12',
        quizId: 'quiz-eng-ielts',
        orderNumber: 12,
        content: 'Identify the sentence with the most sophisticated conditional inversion expressing an unreal past hypothesis with present consequence (Mixed Conditional):',
        difficultyLevel: 'advanced_application',
        topic: 'Grammar: Advanced Mixed Conditionals with Inversion',
        points: 1,
        options: [
          { id: 'opt-eng-12a', label: 'A', content: 'Had the government invested in clean desalinization technology a decade ago, the capital would not be facing acute water shortages today.' },
          { id: 'opt-eng-12b', label: 'B', content: 'If the government invested a decade ago, the capital would not face shortages today.' },
          { id: 'opt-eng-12c', label: 'C', content: 'Should the government have invested a decade ago, the capital might not have faced shortages.' },
          { id: 'opt-eng-12d', label: 'D', content: 'Had the government been investing a decade ago, the capital had not faced shortages today.' },
        ],
        correctOptionId: 'opt-eng-12a',
        explanation: 'Inverted third conditional ("Had the government invested...") coupled with second conditional consequence ("would not be facing... today") creates an exemplary Band 8.5+ mixed conditional structure.',
      },
    ],
  },
];

// ============================================================================
// 2. MOCK QUIZ SUBMISSIONS (Student: Nguyen Minh Quan, stu-1)
// ============================================================================

export const mockQuizSubmissions: QuizSubmission[] = [
  {
    id: 'qsub-math-1',
    quizId: 'quiz-math-12',
    quizTitle: 'Khảo sát chất lượng Toán 12 - Tích phân & Khối đa diện',
    studentId: 'stu-1',
    studentName: 'Nguyễn Minh Quân',
    studentAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    startedAt: '2025-01-04 19:30',
    submittedAt: '2025-01-04 20:12',
    score: 8.7, // 13/15 câu đúng (8.67 làm tròn thành 8.7)
    status: 'reviewed',
    answers: [
      { questionId: 'q-math-1', selectedOptionId: 'opt-1a', isCorrect: true, timeSpentSeconds: 45 },
      { questionId: 'q-math-2', selectedOptionId: 'opt-2b', isCorrect: true, timeSpentSeconds: 60 },
      { questionId: 'q-math-3', selectedOptionId: 'opt-3b', isCorrect: true, timeSpentSeconds: 50 },
      { questionId: 'q-math-4', selectedOptionId: 'opt-4a', isCorrect: true, timeSpentSeconds: 40 },
      { questionId: 'q-math-5', selectedOptionId: 'opt-5b', isCorrect: true, timeSpentSeconds: 120 },
      { questionId: 'q-math-6', selectedOptionId: 'opt-6a', isCorrect: true, timeSpentSeconds: 150 },
      { questionId: 'q-math-7', selectedOptionId: 'opt-7a', isCorrect: true, timeSpentSeconds: 130 },
      { questionId: 'q-math-8', selectedOptionId: 'opt-8a', isCorrect: true, timeSpentSeconds: 140 },
      { questionId: 'q-math-9', selectedOptionId: 'opt-9a', isCorrect: true, timeSpentSeconds: 110 },
      { questionId: 'q-math-10', selectedOptionId: 'opt-10a', isCorrect: true, timeSpentSeconds: 180 },
      { questionId: 'q-math-11', selectedOptionId: 'opt-11a', isCorrect: true, timeSpentSeconds: 210 },
      { questionId: 'q-math-12', selectedOptionId: 'opt-12b', isCorrect: true, timeSpentSeconds: 260 },
      // Câu 13 sai: chọn opt-13b (100m) thay vì opt-13a (50m) do quên trừ nguyên hàm
      { questionId: 'q-math-13', selectedOptionId: 'opt-13b', isCorrect: false, timeSpentSeconds: 290 },
      { questionId: 'q-math-14', selectedOptionId: 'opt-14a', isCorrect: true, timeSpentSeconds: 380 },
      // Câu 15 sai: chọn opt-15b do nhầm chiều cao hình chiếu trọng tâm
      { questionId: 'q-math-15', selectedOptionId: 'opt-15b', isCorrect: false, timeSpentSeconds: 420 },
    ],
    gapReport: {
      overallScore: 8.7,
      totalCorrect: 13,
      totalQuestions: 15,
      accuracyRate: 86.7,
      timeSpentSeconds: 2520, // 42 minutes
      completionDate: '2025-01-04 20:12',
      levelAccuracy: {
        recognition: 100, // 4/4 = 100%
        comprehension: 100, // 5/5 = 100%
        application: 75, // 3/4 = 75%
        advancedApplication: 50, // 1/2 = 50%
      },
      topicGaps: [
        {
          topic: 'Nguyên hàm & Tính chất tích phân cơ bản',
          totalQuestions: 2,
          correctQuestions: 2,
          accuracyPercentage: 100,
          masteryLevel: 'mastered',
          recommendationNote: 'Nắm vững tuyệt đối công thức bảng nguyên hàm và tính chất tuyến tính.',
        },
        {
          topic: 'Phương pháp tích phân từng phần & Đổi biến số',
          totalQuestions: 3,
          correctQuestions: 3,
          accuracyPercentage: 100,
          masteryLevel: 'mastered',
          recommendationNote: 'Kỹ năng đổi cận và chọn biến phụ t rất thuần thục, tốc độ làm bài nhanh.',
        },
        {
          topic: 'Thể tích khối chóp, lăng trụ & Khối đa diện',
          totalQuestions: 4,
          correctQuestions: 4,
          accuracyPercentage: 100,
          masteryLevel: 'mastered',
          recommendationNote: 'Hiểu rõ các đặc trưng khối đa diện đều và công thức thể tích khối chóp vuông góc.',
        },
        {
          topic: 'Ứng dụng hình học & Bài toán chuyển động thực tế',
          totalQuestions: 3,
          correctQuestions: 2,
          accuracyPercentage: 66.7,
          masteryLevel: 'proficient',
          recommendationNote: 'Lưu ý xác định thời điểm dừng v(t) = 0 trong bài toán phanh xe, tránh nhầm lẫn cận tích phân.',
          suggestedResourceIds: ['res-pdf-01'],
        },
        {
          topic: 'Hình không gian vận dụng cao & Khoảng cách chéo nhau',
          totalQuestions: 2,
          correctQuestions: 1,
          accuracyPercentage: 50,
          masteryLevel: 'needs_improvement',
          recommendationNote: 'Cần ôn tập phương pháp gắn tọa độ Oxyz hoặc kỹ thuật dựng mặt phẳng song song khi tính khoảng cách giữa 2 đường chéo nhau qua trọng tâm.',
          suggestedResourceIds: ['res-slide-01', 'res-rec-01'],
        },
        {
          topic: 'Tích phân hàm ẩn nâng cao',
          totalQuestions: 1,
          correctQuestions: 1,
          accuracyPercentage: 100,
          masteryLevel: 'mastered',
          recommendationNote: 'Biến đổi xuất sắc dạng phương trình vi phân f\'(x) + p(x)f(x) = q(x) bằng thừa số tích phân e^(∫p).',
        },
      ],
      strengthsSummary: 'Nắm rất chắc công thức nguyên hàm cơ bản, đổi biến và kỹ năng tích phân hàm ẩn nâng cao. Tốc độ giải các câu thông hiểu rất nhanh và chuẩn xác.',
      weaknessesSummary: 'Cần cẩn thận hơn ở bài toán chuyển động thực tế (xác định thời điểm v=0) và rèn luyện thêm kỹ thuật khoảng cách chéo nhau trong hình không gian 9+.',
    },
  },
];
