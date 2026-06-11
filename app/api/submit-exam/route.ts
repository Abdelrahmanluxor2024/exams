import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      student_name,
      student_phone,
      exam_id,
      exam_code,
      exam_title,
      answers,
      time_taken_seconds,
    } = body;

    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    // جلب جميع أسئلة الامتحان
    const { data: questions, error: questionsError } = await supabase
      .from("questions")
      .select("*")
      .eq("exam_id", exam_id)
      .order("question_number", { ascending: true });

    if (questionsError) throw questionsError;

    let correct = 0;
    let wrong = 0;
    let unanswered = 0;
    const detailedAnswers: any = {};

    questions?.forEach((q) => {
      const studentAnswer = answers[q.id]; // string | string[] | undefined

      // ========================================================
      // [مُصلَح] التحقق من الإجابة غير المُجابة بدقة
      // ========================================================
      const isUnanswered =
        studentAnswer === undefined ||
        studentAnswer === null ||
        studentAnswer === "" ||
        (Array.isArray(studentAnswer) && studentAnswer.length === 0);

      let isCorrect = false;

      if (!isUnanswered) {
        const correctAnswers = q.correct_answers || q.correct_answer || "";
        const answersCount = q.answers_count || 1;

        if (answersCount === 2) {
          // ========================================================
          // [جديد] تصحيح الأسئلة التي تتطلب إجابتين
          // يجب أن تتطابق الإجابتين بالضبط (ترتيب غير مهم)
          // ========================================================
          const correctSet = correctAnswers
            .split(",")
            .map((s: string) => s.trim().toLowerCase())
            .sort();

          const studentSet = Array.isArray(studentAnswer)
            ? studentAnswer.map((s: string) => s.trim().toLowerCase()).sort()
            : [studentAnswer.trim().toLowerCase()];

          isCorrect =
            correctSet.length === studentSet.length &&
            correctSet.every((val: string, idx: number) => val === studentSet[idx]);
        } else {
          // ========================================================
          // إجابة واحدة: مقارنة مباشرة
          // ========================================================
          const studentStr = Array.isArray(studentAnswer)
            ? studentAnswer[0]?.trim().toLowerCase()
            : String(studentAnswer).trim().toLowerCase();

          isCorrect = studentStr === correctAnswers.trim().toLowerCase();
        }
      }

      // إحصاء النتائج
      if (isUnanswered) {
        unanswered++;
        wrong++; // الغير مجابة تُحتسب خطأ
      } else if (isCorrect) {
        correct++;
      } else {
        wrong++;
      }

      // بناء الخيارات المتاحة للسؤال
      const optionsObj: Record<string, string> = {
        a: q.option_a,
        b: q.option_b,
        c: q.option_c,
      };
      if (q.option_d) optionsObj.d = q.option_d;
      if (q.option_e) optionsObj.e = q.option_e;

      // تفاصيل إجابة هذا السؤال
      detailedAnswers[q.id] = {
        question_number: q.question_number,
        question: q.question_text,
        student_answer: isUnanswered ? null : studentAnswer,
        correct_answer: q.correct_answers || q.correct_answer,
        is_correct: isCorrect,
        is_unanswered: isUnanswered,
        options: optionsObj,
        explanation: q.explanation || null,
      };
    });

    const total = questions?.length || 0;
    // النسبة تُحسب من الإجابات الصحيحة فقط
    const percentage = total > 0 ? (correct / total) * 100 : 0;

    // حفظ النتيجة في قاعدة البيانات
    const { data, error } = await supabase
      .from("student_results")
      .insert({
        student_name,
        student_phone,
        exam_id,
        exam_code,
        exam_title,
        total_questions: total,
        correct_answers: correct,
        wrong_answers: wrong,
        unanswered,             // [جديد] عدد الغير مجابة
        score_percentage: percentage,
        answers: detailedAnswers,
        time_taken_seconds,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, result: data });
  } catch (error: any) {
    console.error("Submit exam error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
