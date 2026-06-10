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

    const { data: questions } = await supabase
      .from("questions")
      .select("*")
      .eq("exam_id", exam_id);

    let correct = 0;
    const detailedAnswers: any = {};

    questions?.forEach((q) => {
      const studentAnswer = answers[q.id];
      const isCorrect = studentAnswer === q.correct_answer;
      if (isCorrect) correct++;

      detailedAnswers[q.id] = {
        question: q.question_text,
        student_answer: studentAnswer,
        correct_answer: q.correct_answer,
        is_correct: isCorrect,
        options: { a: q.option_a, b: q.option_b, c: q.option_c, d: q.option_d },
        explanation: q.explanation,
      };
    });

    const total = questions?.length || 0;
    const wrong = total - correct;
    const percentage = total > 0 ? (correct / total) * 100 : 0;

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
        score_percentage: percentage,
        answers: detailedAnswers,
        time_taken_seconds,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, result: data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
