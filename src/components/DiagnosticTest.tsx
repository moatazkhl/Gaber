import React, { useState } from 'react';
import { 
  Award, 
  CheckCircle2, 
  XCircle, 
  Volume2, 
  RotateCcw, 
  ArrowLeft, 
  Sparkles, 
  Compass, 
  Target,
  ChevronRight,
  BookOpen
} from 'lucide-react';
import { diagnosticQuestions } from '../data/diagnosticData';
import { speechService } from '../services/speechService';
import confetti from 'canvas-confetti';

interface DiagnosticTestProps {
  studentName: string;
  onComplete: (score: number, total: number, level: string, recommendation: string) => void;
  onClose: () => void;
  initialScore?: number;
}

export const DiagnosticTest: React.FC<DiagnosticTestProps> = ({
  studentName,
  onComplete,
  onClose,
  initialScore,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const currentQ = diagnosticQuestions[currentIndex];
  const isCorrect = selectedOption === currentQ?.correctIndex;

  const handleSelect = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
  };

  const handleConfirm = () => {
    if (selectedOption === null) return;
    setIsAnswered(true);
    setUserAnswers(prev => [...prev, selectedOption]);
  };

  const handleNext = () => {
    speechService.cancel();
    setSelectedOption(null);
    setIsAnswered(false);

    if (currentIndex < diagnosticQuestions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setIsFinished(true);
      const correctCount = userAnswers.filter(
        (ans, idx) => ans === diagnosticQuestions[idx].correctIndex
      ).length + (isCorrect ? 1 : 0);

      const pct = (correctCount / diagnosticQuestions.length) * 100;
      let level = 'متوسط';
      let rec = 'ابدأ بالوحدة الأولى من البداية لترسيخ المفاهيم خطوة بخطوة.';

      if (pct >= 85) {
        level = 'متقدم ومتفوق';
        rec = 'لديك أساس متين وقوي في الجبر والعمليات الحسابية! يمكنك الانطلاق السلس من الوحدة الأولى وحتى الأخيرة.';
      } else if (pct >= 65) {
        level = 'متمكن وجيد جداً';
        rec = 'مستواك رائع في أساسيات الجبر، ركّز على تدريبات القوى والمعادلات لتعزيز دقتك.';
      } else if (pct >= 45) {
        level = 'متوسط';
        rec = 'لديك فهم عام، لكنك بحاجة إلى مراجعة توحيد المقامات والتعامل مع الإشارات بدقة في الوحدة الأولى.';
      } else {
        level = 'بحاجة لتركيز وتأسيس إضافي';
        rec = 'ننصحك بالاستماع للشرح الموسع والشرح الصوتي في كل درس قبل حل التمارين لبناء ثقة عالية.';
      }

      onComplete(correctCount, diagnosticQuestions.length, level, rec);

      if (pct >= 60) {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      }
    }
  };

  const readQuestionAudio = () => {
    const text = `السؤال: ${currentQ.question}. الخيارات: ${currentQ.options.join('، ')}.`;
    speechService.speak(text);
  };

  if (isFinished) {
    const correctCount = userAnswers.filter(
      (ans, idx) => ans === diagnosticQuestions[idx].correctIndex
    ).length;
    const pct = Math.round((correctCount / diagnosticQuestions.length) * 100);

    let levelTitle = 'متوسط';
    let levelBadge = 'bg-amber-100 text-amber-900 border-amber-300';

    if (pct >= 85) {
      levelTitle = 'مستوى متقدم ومتفوق (A)';
      levelBadge = 'bg-emerald-100 text-emerald-900 border-emerald-300';
    } else if (pct >= 65) {
      levelTitle = 'مستوى متمكن وجيد جداً (B)';
      levelBadge = 'bg-blue-100 text-blue-900 border-blue-300';
    } else if (pct >= 45) {
      levelTitle = 'مستوى متوسط (C)';
      levelBadge = 'bg-amber-100 text-amber-900 border-amber-300';
    } else {
      levelTitle = 'مستوى تأسيسي (D)';
      levelBadge = 'bg-rose-100 text-rose-900 border-rose-300';
    }

    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-10 text-center space-y-6">
          <div className="w-20 h-20 rounded-2xl bg-emerald-600 text-white mx-auto flex items-center justify-center shadow-lg shadow-emerald-600/30">
            <Target className="w-10 h-10" />
          </div>

          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-1">
              تقرير قياس المستوى التشخيصي
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              تقييم مستوى الطالب في الرياضيات
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              الطالب: <strong className="text-slate-900">{studentName}</strong>
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-black font-sans shadow-xs">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>{levelTitle}</span>
          </div>

          <div className="flex justify-center items-center gap-6 p-4 bg-slate-50 rounded-2xl border border-slate-200 max-w-sm mx-auto">
            <div>
              <span className="text-xs text-slate-500 block">الإجابات الصحيحة</span>
              <span className="text-2xl font-black text-emerald-700 font-mono">
                {correctCount} / {diagnosticQuestions.length}
              </span>
            </div>
            <div className="w-px h-10 bg-slate-200" />
            <div>
              <span className="text-xs text-slate-500 block">نسبة الاستيعاب</span>
              <span className="text-2xl font-black text-slate-900 font-mono">
                {pct}%
              </span>
            </div>
          </div>

          {/* Recommendations */}
          <div className="text-right p-5 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-2">
            <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
              <Compass className="w-4 h-4 text-emerald-700" />
              <span>خطة التعلم الموصى بها لمنهاج الصف الثامن:</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              تم تخصيص المسار التعليمي لتبدأ من <strong>الوحدة الأولى: الأعداد العادية</strong> وفق تسلسل الكتاب المدرسي. استخدم خاصية <strong>القراءة الصوتية</strong> في كل درس والمختبر التفاعلي لاكتساب مهارة الحل الذهني والسريع.
            </p>
          </div>

          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex items-center gap-2 px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition-transform active:scale-95"
            >
              <BookOpen className="w-4 h-4" />
              <span>البدء بالدراسة من الوحدة الأولى</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900"
        >
          <ChevronRight className="w-4 h-4" />
          <span>الخروج من قياس المستوى</span>
        </button>

        <span className="text-xs text-slate-500 font-semibold">
          السؤال {currentIndex + 1} من {diagnosticQuestions.length}
        </span>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-md overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div>
            <span className="text-xs text-amber-400 font-mono block mb-0.5">
              اختبار تحديد وقياس المستوى التشخيصي
            </span>
            <h3 className="text-sm sm:text-base font-bold text-white">
              السؤال {currentIndex + 1} من {diagnosticQuestions.length}
            </h3>
          </div>

          <button
            onClick={readQuestionAudio}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200"
          >
            <Volume2 className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">استمع للسؤال</span>
          </button>
        </div>

        {/* Question */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed">
            {currentQ.question}
          </div>

          {/* Options */}
          <div className="space-y-3">
            {currentQ.options.map((opt, idx) => {
              const isSelected = selectedOption === idx;
              let style = 'border-slate-200 hover:border-emerald-400 hover:bg-slate-50 text-slate-800';

              if (isAnswered) {
                if (idx === currentQ.correctIndex) {
                  style = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-bold';
                } else if (isSelected) {
                  style = 'border-rose-500 bg-rose-50 text-rose-950 font-bold';
                } else {
                  style = 'border-slate-200 opacity-50 text-slate-400';
                }
              } else if (isSelected) {
                style = 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold ring-2 ring-emerald-500/20';
              }

              return (
                <button
                  key={idx}
                  disabled={isAnswered}
                  onClick={() => handleSelect(idx)}
                  className={`w-full text-right p-4 rounded-xl border text-sm flex items-center justify-between transition-all ${style}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center text-xs font-mono">
                      {idx + 1}
                    </span>
                    <span>{opt}</span>
                  </div>

                  {isAnswered && idx === currentQ.correctIndex && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  )}
                  {isAnswered && isSelected && idx !== currentQ.correctIndex && (
                    <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Actions */}
          {!isAnswered ? (
            <div className="pt-2">
              <button
                onClick={handleConfirm}
                disabled={selectedOption === null}
                className="px-7 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition-all"
              >
                تأكيد الإجابة
              </button>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="text-xs sm:text-sm text-slate-700">
                <strong className="text-slate-900 block mb-0.5">الشرح التوضيحي:</strong>
                {currentQ.explanation}
              </div>
              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 px-6 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm"
                >
                  <span>{currentIndex < diagnosticQuestions.length - 1 ? 'السؤال التالي' : 'إنهاء وعرض التقييم'}</span>
                  <ArrowLeft className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
