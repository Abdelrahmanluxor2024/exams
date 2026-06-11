-- =====================================================
-- ملف إعداد Supabase الكامل لنظام الامتحانات
-- Supabase Project: rwffplndibzmcifmwqzw
-- URL: https://rwffplndibzmcifmwqzw.supabase.co
-- =====================================================
-- ⚠️ تحذير: لا ترفع هذا الملف على GitHub العام
-- =====================================================


-- =====================================================
-- 1. جدول الامتحانات
-- =====================================================
CREATE TABLE IF NOT EXISTS exams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  exam_code TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  duration_minutes INT DEFAULT 30,
  total_questions INT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  exam_password TEXT DEFAULT '',   -- كود الامتحان الذي يدخله الطالب
  created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 2. جدول الحوارات / القطع (PASSAGES)
-- =====================================================
CREATE TABLE IF NOT EXISTS passages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
  passage_order INT NOT NULL DEFAULT 1,
  passage_title TEXT,
  passage_instruction TEXT,
  passage_content TEXT NOT NULL,
  passage_type TEXT DEFAULT 'dialogue' CHECK (
    passage_type IN ('dialogue', 'text', 'email', 'letter', 'table', 'other')
  ),
  created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 3. جدول الأسئلة (يدعم 5 خيارات + إجابتين)
-- =====================================================
CREATE TABLE IF NOT EXISTS questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
  passage_id UUID REFERENCES passages(id) ON DELETE SET NULL,
  question_number INT NOT NULL,
  question_text TEXT NOT NULL,
  question_instruction TEXT,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT,
  option_e TEXT,
  options_count INT NOT NULL DEFAULT 4 CHECK (options_count IN (3, 4, 5)),
  correct_answers TEXT NOT NULL,  -- 'a' أو 'b,e' للإجابتين
  answers_count INT NOT NULL DEFAULT 1 CHECK (answers_count IN (1, 2)),
  explanation TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 4. جدول نتائج الطلاب
-- =====================================================
CREATE TABLE IF NOT EXISTS student_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_name TEXT NOT NULL,
  student_phone TEXT,
  exam_id UUID REFERENCES exams(id),
  exam_code TEXT NOT NULL,
  exam_title TEXT NOT NULL,
  total_questions INT NOT NULL,
  correct_answers INT NOT NULL,
  wrong_answers INT NOT NULL,
  unanswered INT DEFAULT 0,
  score_percentage DECIMAL(5,2) NOT NULL,
  answers JSONB NOT NULL,
  time_taken_seconds INT,
  submitted_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 5. تفعيل Row Level Security
-- =====================================================
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE passages ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_results ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 6. Policies (صلاحيات القراءة والكتابة)
-- =====================================================
-- حذف القديم أولاً لو موجود
DROP POLICY IF EXISTS "Public read exams" ON exams;
DROP POLICY IF EXISTS "Public read passages" ON passages;
DROP POLICY IF EXISTS "Public read questions" ON questions;
DROP POLICY IF EXISTS "Public insert results" ON student_results;
DROP POLICY IF EXISTS "Public read results" ON student_results;

-- إعادة الإنشاء
CREATE POLICY "Public read exams" ON exams FOR SELECT USING (true);
CREATE POLICY "Public read passages" ON passages FOR SELECT USING (true);
CREATE POLICY "Public read questions" ON questions FOR SELECT USING (true);
CREATE POLICY "Public insert results" ON student_results FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read results" ON student_results FOR SELECT USING (true);

-- =====================================================
-- 7. Indexes لتحسين الأداء
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_passages_exam_id ON passages(exam_id);
CREATE INDEX IF NOT EXISTS idx_passages_order ON passages(exam_id, passage_order);
CREATE INDEX IF NOT EXISTS idx_questions_exam_id ON questions(exam_id);
CREATE INDEX IF NOT EXISTS idx_questions_passage_id ON questions(passage_id);
CREATE INDEX IF NOT EXISTS idx_questions_number ON questions(exam_id, question_number);
CREATE INDEX IF NOT EXISTS idx_results_exam_code ON student_results(exam_code);
CREATE INDEX IF NOT EXISTS idx_exams_active ON exams(is_active);

-- =====================================================
-- 8. بيانات مثال (قم بإلغاء التعليق للتجربة)
-- =====================================================
/*
INSERT INTO exams (exam_code, title, description, duration_minutes, total_questions, exam_password)
VALUES ('EXAM-1', 'امتحان اللغة الفرنسية - الفصل الأول', 'امتحان شامل للصف الأول الثانوي', 60, 20, 'FR2025');

INSERT INTO passages (exam_id, passage_order, passage_title, passage_instruction, passage_content, passage_type)
VALUES (
  (SELECT id FROM exams WHERE exam_code = 'EXAM-1'),
  1,
  'Dialogue 1',
  'Read the following dialogue then answer the questions:',
  'Ahmed: Bonjour! Comment tu t''appelles?
Marie:  Je m''appelle Marie. Et toi?
Ahmed: Je m''appelle Ahmed. Tu es française?
Marie:  Oui, je suis française.',
  'dialogue'
);

-- سؤال إجابة واحدة، 4 خيارات
INSERT INTO questions (exam_id, passage_id, question_number, question_text, option_a, option_b, option_c, option_d, options_count, correct_answers, answers_count)
VALUES (
  (SELECT id FROM exams WHERE exam_code = 'EXAM-1'),
  (SELECT id FROM passages WHERE passage_order = 1 AND exam_id = (SELECT id FROM exams WHERE exam_code = 'EXAM-1')),
  1, 'Comment s''appelle la fille?', 'Ahmed', 'Marie', 'Sophie', 'Fatima',
  4, 'b', 1
);

-- سؤال إجابتان، 5 خيارات
INSERT INTO questions (exam_id, passage_id, question_number, question_text, option_a, option_b, option_c, option_d, option_e, options_count, correct_answers, answers_count)
VALUES (
  (SELECT id FROM exams WHERE exam_code = 'EXAM-1'),
  (SELECT id FROM passages WHERE passage_order = 1 AND exam_id = (SELECT id FROM exams WHERE exam_code = 'EXAM-1')),
  2, 'Choisissez les deux nationalités dans le dialogue:', 'Française', 'Anglaise', 'Égyptienne', 'Marocaine', 'Italienne',
  5, 'a,c', 2
);
*/
