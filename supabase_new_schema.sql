-- =====================================================
-- هيكل قاعدة البيانات الجديد - نظام الامتحانات المتطور
-- يدعم: حوارات/قطع (Passages) + 5 خيارات + إجابتين صحيحتين
-- =====================================================

-- =====================================================
-- 1. جدول الامتحانات (بدون تغيير جوهري)
-- =====================================================
CREATE TABLE exams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  exam_code TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  duration_minutes INT DEFAULT 30,
  total_questions INT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  exam_password TEXT DEFAULT '',  -- [جديد] كود/باسورد الامتحان الذي يدخله الطالب
  created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 2. جدول الحوارات / القطع (PASSAGES) - جديد
-- =====================================================
-- كل حوار يحتوي على نص أو حوار أو جدول أو رسالة
-- والأسئلة المرتبطة به تأتي بعده مباشرة
-- =====================================================
CREATE TABLE passages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,

  -- ترتيب ظهور الحوار في الامتحان
  passage_order INT NOT NULL DEFAULT 1,

  -- عنوان الحوار (اختياري) مثل: "Read the following dialogue"
  passage_title TEXT,

  -- التعليمة فوق الحوار مثل: "Answer the following questions"
  passage_instruction TEXT,

  -- محتوى النص أو الحوار
  passage_content TEXT NOT NULL,

  -- نوع المحتوى: dialogue | text | email | letter | table | other
  passage_type TEXT DEFAULT 'dialogue' CHECK (
    passage_type IN ('dialogue', 'text', 'email', 'letter', 'table', 'other')
  ),

  created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 3. جدول الأسئلة (محدّث بالكامل)
-- =====================================================
-- يدعم:
--   - ربط السؤال بحوار (passage_id) أو مستقل (NULL)
--   - 3 أو 4 أو 5 خيارات (options_count)
--   - إجابة واحدة أو إجابتين صحيحتين (answers_count)
--   - تعليمة مخصصة لكل سؤال (question_instruction)
-- =====================================================
CREATE TABLE questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- ربط بالامتحان
  exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,

  -- ربط بالحوار (NULL لو سؤال مستقل)
  passage_id UUID REFERENCES passages(id) ON DELETE SET NULL,

  -- رقم السؤال في ترتيب الامتحان
  question_number INT NOT NULL,

  -- نص السؤال
  question_text TEXT NOT NULL,

  -- تعليمة خاصة بالسؤال (اختياري)
  question_instruction TEXT,

  -- الخيارات: أ, ب, ج إلزامية - د, هـ اختيارية
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT,  -- اختياري (للأسئلة التي لها 4 أو 5 خيارات)
  option_e TEXT,  -- اختياري (للأسئلة التي لها 5 خيارات فقط)

  -- عدد الخيارات الفعلي (3 أو 4 أو 5)
  options_count INT NOT NULL DEFAULT 4 CHECK (options_count IN (3, 4, 5)),

  -- الإجابة الصحيحة:
  --   لإجابة واحدة: 'a' أو 'b' أو 'c' أو 'd' أو 'e'
  --   لإجابتين:     'a,c' أو 'b,e' (مفصولة بفاصلة)
  correct_answers TEXT NOT NULL,

  -- عدد الإجابات الصحيحة المطلوبة (1 أو 2)
  answers_count INT NOT NULL DEFAULT 1 CHECK (answers_count IN (1, 2)),

  -- شرح الإجابة (اختياري)
  explanation TEXT,

  created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 4. جدول نتائج الطلاب (محدّث)
-- =====================================================
CREATE TABLE student_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_name TEXT NOT NULL,
  student_phone TEXT,

  -- معلومات الامتحان
  exam_id UUID REFERENCES exams(id),
  exam_code TEXT NOT NULL,
  exam_title TEXT NOT NULL,

  -- الإحصائيات
  total_questions INT NOT NULL,
  correct_answers INT NOT NULL,
  wrong_answers INT NOT NULL,
  unanswered INT DEFAULT 0,  -- عدد الأسئلة غير المجابة
  score_percentage DECIMAL(5,2) NOT NULL,

  -- تفاصيل الإجابات (JSON)
  -- كل سؤال: { question, student_answer, correct_answer, is_correct, options, explanation }
  answers JSONB NOT NULL,

  -- الوقت المستغرق بالثواني
  time_taken_seconds INT,

  submitted_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 5. تفعيل حماية الصفوف (RLS)
-- =====================================================
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE passages ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_results ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 6. صلاحيات القراءة والكتابة
-- =====================================================
CREATE POLICY "Public read exams" ON exams FOR SELECT USING (true);
CREATE POLICY "Public read passages" ON passages FOR SELECT USING (true);
CREATE POLICY "Public read questions" ON questions FOR SELECT USING (true);
CREATE POLICY "Public insert results" ON student_results FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read results" ON student_results FOR SELECT USING (true);

-- =====================================================
-- 7. Indexes لتحسين الأداء
-- =====================================================
CREATE INDEX idx_passages_exam_id ON passages(exam_id);
CREATE INDEX idx_passages_order ON passages(exam_id, passage_order);
CREATE INDEX idx_questions_exam_id ON questions(exam_id);
CREATE INDEX idx_questions_passage_id ON questions(passage_id);
CREATE INDEX idx_questions_number ON questions(exam_id, question_number);
CREATE INDEX idx_results_exam_code ON student_results(exam_code);

-- =====================================================
-- مثال: كيفية إدخال بيانات تجريبية
-- =====================================================
/*
-- 1. أضف امتحان
INSERT INTO exams (exam_code, title, description, duration_minutes, total_questions)
VALUES ('EXAM-1', 'امتحان اللغة الفرنسية - الترم الأول', 'امتحان شامل للمستوى الثانوي', 60, 20);

-- 2. أضف حوار (passage)
INSERT INTO passages (exam_id, passage_order, passage_title, passage_instruction, passage_content, passage_type)
VALUES (
  (SELECT id FROM exams WHERE exam_code = 'EXAM-1'),
  1,
  'Dialogue 1',
  'Read the following dialogue then answer the questions:',
  'Ahmed: Bonjour! Comment tu t''appelles?
Marie: Je m''appelle Marie. Et toi?
Ahmed: Je m''appelle Ahmed. Tu es française?
Marie: Oui, je suis française. Et toi, tu es égyptien?
Ahmed: Oui, je suis égyptien.',
  'dialogue'
);

-- 3. أضف سؤال مرتبط بالحوار (4 خيارات، إجابة واحدة)
INSERT INTO questions (
  exam_id, passage_id, question_number, question_text,
  option_a, option_b, option_c, option_d,
  options_count, correct_answers, answers_count
)
VALUES (
  (SELECT id FROM exams WHERE exam_code = 'EXAM-1'),
  (SELECT id FROM passages WHERE passage_order = 1 AND exam_id = (SELECT id FROM exams WHERE exam_code = 'EXAM-1')),
  1,
  'Comment s''appelle la fille dans le dialogue?',
  'Ahmed', 'Marie', 'Sophie', 'Fatima',
  4, 'b', 1
);

-- 4. أضف سؤال بـ 5 خيارات وإجابتين صحيحتين
INSERT INTO questions (
  exam_id, passage_id, question_number, question_text,
  option_a, option_b, option_c, option_d, option_e,
  options_count, correct_answers, answers_count
)
VALUES (
  (SELECT id FROM exams WHERE exam_code = 'EXAM-1'),
  (SELECT id FROM passages WHERE passage_order = 1 AND exam_id = (SELECT id FROM exams WHERE exam_code = 'EXAM-1')),
  2,
  'Choisissez les deux nationalités mentionnées dans le dialogue:',
  'Française', 'Anglaise', 'Égyptienne', 'Marocaine', 'Italienne',
  5, 'a,c', 2
);

-- 5. أضف سؤال مستقل (بدون حوار)
INSERT INTO questions (
  exam_id, passage_id, question_number, question_text,
  option_a, option_b, option_c,
  options_count, correct_answers, answers_count
)
VALUES (
  (SELECT id FROM exams WHERE exam_code = 'EXAM-1'),
  NULL,  -- سؤال مستقل بدون حوار
  3,
  'Quel est le féminin de "beau"?',
  'bel', 'belle', 'beaux',
  3, 'b', 1
);
*/
