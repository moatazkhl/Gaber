import React, { useState } from 'react';
import { 
  BarChart2, 
  CheckCircle2, 
  Circle, 
  Award, 
  User, 
  RotateCcw, 
  TrendingUp, 
  ChevronRight, 
  Sparkles,
  BookOpen,
  Calendar,
  Clock
} from 'lucide-react';
import { StudentProgress, Unit } from '../types';

interface ProgressDashboardProps {
  progress: StudentProgress;
  units: Unit[];
  onSelectLesson: (lessonId: string) => void;
  onUpdateStudentName: (name: string) => void;
  onResetProgress: () => void;
  onClose: () => void;
}

export const ProgressDashboard: React.FC<ProgressDashboardProps> = ({
  progress,
  units,
  onSelectLesson,
  onUpdateStudentName,
  onResetProgress,
  onClose,
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(progress.studentName);

  const totalLessons = units.reduce((acc, u) => acc + u.lessons.length, 0);
  const completedLessons = progress.completedLessons.length;
  const overallPercentage = Math.round((completedLessons / (totalLessons || 1)) * 100);

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    if (nameInput.trim()) {
      onUpdateStudentName(nameInput.trim());
      setIsEditingName(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Return Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900"
        >
          <ChevronRight className="w-4 h-4" />
          <span>العودة إلى الدرس</span>
        </button>

        <span className="text-xs text-slate-400 font-mono">
          نظام المتابعة الأكاديمي الرقمي
        </span>
      </div>

      {/* Student Profile & Headline Stats */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xl shadow-md shadow-emerald-600/20">
              <User className="w-7 h-7" />
            </div>

            <div>
              {isEditingName ? (
                <form onSubmit={handleSaveName} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="px-3 py-1 text-base font-bold border border-slate-300 rounded-lg text-slate-900"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold"
                  >
                    حفظ
                  </button>
                </form>
              ) : (
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                    {progress.studentName}
                  </h2>
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="text-xs text-emerald-700 hover:underline font-semibold"
                  >
                    (تعديل الاسم)
                  </button>
                </div>
              )}
              <p className="text-xs text-slate-500 mt-0.5">
                طالب الصف الثامن الأساسي • منهاج الجبر السوري
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-left">
              <span className="text-xs text-slate-500 font-medium block">نسبة إنجاز الكتاب</span>
              <span className="text-2xl sm:text-3xl font-black text-emerald-700 font-mono">
                {overallPercentage}%
              </span>
            </div>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="pt-6">
          <div className="flex justify-between text-xs text-slate-600 mb-2 font-medium">
            <span>الدروس المنجزة: {completedLessons} من أصل {totalLessons} درس</span>
            <span>المتبقي: {totalLessons - completedLessons} درس</span>
          </div>
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${overallPercentage}%` }}
            />
          </div>
        </div>

        {/* Diagnostic assessment summary if taken */}
        {progress.diagnosticTaken && (
          <div className="mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <Award className="w-5 h-5 text-amber-500" />
              <div>
                <strong className="text-slate-900 block">
                  نتيجة قياس المستوى التشخيصي: {progress.diagnosticScore} من 10 ({progress.diagnosticLevel})
                </strong>
                <span className="text-slate-600">{progress.diagnosticRecommendation}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Unit by Unit Detailed Progress */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-emerald-600" />
          <span>متابعة إتقان الدروس حسب الوحدات الست</span>
        </h3>

        <div className="space-y-4">
          {units.map((unit) => {
            const unitTotal = unit.lessons.length;
            const unitCompleted = unit.lessons.filter(l => progress.completedLessons.includes(l.id)).length;
            const unitPct = Math.round((unitCompleted / (unitTotal || 1)) * 100);
            const examScore = progress.unitExamScores[unit.id];

            return (
              <div
                key={unit.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden"
              >
                {/* Unit Header */}
                <div className="p-4 sm:p-5 bg-slate-50/70 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-xl bg-slate-900 text-white font-black flex items-center justify-center text-xs">
                      {unit.number}
                    </span>
                    <div>
                      <h4 className="text-sm sm:text-base font-bold text-slate-900">
                        {unit.title}
                      </h4>
                      <span className="text-xs text-slate-500">
                        {unit.bookPages} • {unitCompleted} من {unitTotal} درس مكتمل ({unitPct}%)
                      </span>
                    </div>
                  </div>

                  {examScore && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold">
                      <Award className="w-4 h-4 text-amber-600" />
                      <span>اختبار الوحدة: {examScore.score}/{examScore.total}</span>
                    </div>
                  )}
                </div>

                {/* Lessons List in Unit */}
                <div className="divide-y divide-slate-100 p-2 sm:p-3">
                  {unit.lessons.map((lesson) => {
                    const isDone = progress.completedLessons.includes(lesson.id);
                    const qScore = progress.lessonQuizScores[lesson.id];

                    return (
                      <div
                        key={lesson.id}
                        className="py-3 px-3 sm:px-4 flex items-center justify-between gap-3 hover:bg-slate-50/60 rounded-xl transition-colors text-xs"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {isDone ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          ) : (
                            <Circle className="w-4 h-4 text-slate-300 shrink-0" />
                          )}

                          <div className="truncate">
                            <span className="font-bold text-slate-900 block truncate">
                              الدرس {lesson.number}: {lesson.title}
                            </span>
                            <span className="text-[11px] text-slate-500 truncate">
                              {lesson.subtitle}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          {qScore ? (
                            <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                              الاختبار: {qScore.score}/{qScore.total}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[11px]">
                              لم يختبر بعد
                            </span>
                          )}

                          <button
                            onClick={() => {
                              onSelectLesson(lesson.id);
                              onClose();
                            }}
                            className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs"
                          >
                            الانتقال للدرس
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Danger Zone: Reset */}
      <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-between text-xs text-rose-900">
        <div>
          <strong className="block font-bold">إعادة ضبط تقدم الطالب:</strong>
          <span>يمكنك مسح السجل والبدء من جديد إذا رغبت بإعادة دراسة المنهاج كاملاً.</span>
        </div>
        <button
          onClick={() => {
            if (window.confirm('هل أنت متأكد من رغبتك في إعادة ضبط السجل والبدء من جديد؟')) {
              onResetProgress();
            }
          }}
          className="px-3 py-1.5 rounded-lg bg-white border border-rose-300 hover:bg-rose-100 text-rose-700 font-bold shrink-0"
        >
          إعادة ضبط السجل
        </button>
      </div>

    </div>
  );
};
