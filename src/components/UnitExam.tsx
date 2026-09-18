import React, { useState } from 'react';
import { 
  Award, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  Volume2, 
  ArrowLeft, 
  ShieldCheck, 
  FileText, 
  Printer,
  ChevronRight
} from 'lucide-react';
import { Unit } from '../types';
import { speechService } from '../services/speechService';
import { MathText } from './MathFormula';
import confetti from 'canvas-confetti';

interface UnitExamProps {
  unit: Unit;
  studentName: string;
  onSaveExamScore: (unitId: string, score: number, total: number) => void;
  onBackToLessons: () => void;
  previousScore?: { score: number; total: number };
}

export const UnitExam: React.FC<UnitExamProps> = ({
  unit,
  studentName,
  onSaveExamScore,
  onBackToLessons,
  previousScore,
}) => {
  const questions = unit.unitExam;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [isFinished, setIsFinished] = useState(false);

  const currentQ = questions[currentIndex];
  const isCorrect = selectedOption === currentQ?.correctIndex;

  const handleSelect = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
  };

  const handleConfirmAnswer = () => {
    if (selectedOption === null) return;
    setIsAnswered(true);
    setUserAnswers(prev => [...prev, selectedOption]);
  };

  const handleNext = () => {
    speechService.cancel();
    setSelectedOption(null);
    setIsAnswered(false);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setIsFinished(true);
      const correctCount = userAnswers.filter((ans, idx) => ans === questions[idx].correctIndex).length + (isCorrect ? 1 : 0);
      onSaveExamScore(unit.id, correctCount, questions.length);

      if (correctCount / questions.length >= 0.6) {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.5 }
        });
      }
    }
  };

  const handleRestart = () => {
    speechService.cancel();
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setUserAnswers([]);
    setIsFinished(false);
  };

  const readQuestionAudio = () => {
    const text = `السؤال: ${currentQ.question}. الخيارات: ${currentQ.options.join('، ')}.`;
    speechService.speak(text);
  };

  const readCorrectionAudio = () => {
    const text = `تصحيح الإجابة: الإجابة الصحيحة هي: ${currentQ.options[currentQ.correctIndex]}. الشرح: ${currentQ.explanation}.`;
    speechService.speak(text);
  };

  if (isFinished) {
    const correctCount = userAnswers.filter((ans, idx) => ans === questions[idx].correctIndex).length;
    const percentage = Math.round((correctCount / questions.length) * 100);
    const isPassed = percentage >= 60;

    return (
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Top return button */}
        <button
          onClick={onBackToLessons}
          className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900"
        >
          <ChevronRight className="w-4 h-4" />
          <span>العودة لقائمة الدروس</span>
        </button>

        {/* Certificate or Summary Card */}
        <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-xl p-8 text-center space-y-6 relative overflow-hidden">
          
          <div className={`w-20 h-20 rounded-2xl mx-auto flex items-center justify-center shadow-lg ${
            isPassed 
              ? 'bg-amber-500 text-white shadow-amber-500/30' 
              : 'bg-slate-200 text-slate-700 shadow-slate-200'
          }`}>
            <Award className="w-10 h-10" />
          </div>

          <div>
            <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 inline-block mb-2">
              نتائج اختبار الوحدة {unit.number} الشامل
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              {unit.title}
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              الطالب المتميز: <strong className="text-slate-900">{studentName}</strong>
            </p>
          </div>

          <div className="flex justify-center items-center gap-6 p-4 bg-slate-50 rounded-2xl border border-slate-200 max-w-sm mx-auto">
            <div>
              <span className="text-xs text-slate-500 block">الدرجة المحققة</span>
              <span className="text-2xl font-black text-emerald-700 font-mono">
                {correctCount} / {questions.length}
              </span>
            </div>
            <div className="w-px h-10 bg-slate-200" />
            <div>
              <span className="text-xs text-slate-500 block">النسبة المئوية</span>
              <span className="text-2xl font-black text-slate-900 font-mono">
                {percentage}%
              </span>
            </div>
          </div>

          {/* Certificate of Mastery if passed */}
          {isPassed && (
            <div className="p-6 rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50/50 space-y-3">
              <div className="flex items-center justify-center gap-2 text-amber-900 font-bold text-sm">
                <ShieldCheck className="w-5 h-5 text-amber-600" />
                <span>شهادة إتقان الوحدة التعليمية</span>
              </div>
              <p className="text-xs text-amber-800 leading-relaxed max-w-md mx-auto">
                يشهد هذا السجل بأن الطالب <strong>{studentName}</strong> قد أتم بنجاح كافة متطلبات الوحدة {unit.number} ({unit.title}) في مادة الجبر للصف الثامن حسب المنهاج السوري بنسبة إتقان عالية.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <button
              onClick={handleRestart}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm"
            >
              <RotateCcw className="w-4 h-4" />
              <span>إعادة الاختبار</span>
            </button>

            <button
              onClick={onBackToLessons}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/20"
            >
              <span>متابعة الدروس التالية</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {/* Return button */}
      <button
        onClick={onBackToLessons}
        className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900"
      >
        <ChevronRight className="w-4 h-4" />
        <span>العودة للدروس</span>
      </button>

      {/* Main Exam Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-md overflow-hidden">
        
        {/* Exam Header */}
        <div className="bg-slate-900 text-white p-5 sm:p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 font-black text-sm">
              {currentIndex + 1}/{questions.length}
            </div>
            <div>
              <span className="text-xs text-amber-400 font-mono block">
                اختبار نهاية الوحدة {unit.number} الشامل
              </span>
              <h3 className="text-base sm:text-lg font-bold text-white">
                {unit.title}
              </h3>
            </div>
          </div>

          <button
            onClick={readQuestionAudio}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200"
            title="استمع للسؤال بصوت المعلم"
          >
            <Volume2 className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">قراءة صوتية</span>
          </button>
        </div>

        {/* Question Area */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed">
            <MathText text={currentQ.question} />
          </div>

          {/* Options */}
          <div className="space-y-3">
            {currentQ.options.map((option, idx) => {
              const isSelected = selectedOption === idx;
              let style = 'border-slate-200 hover:border-amber-400 hover:bg-slate-50 text-slate-800';

              if (isAnswered) {
                if (idx === currentQ.correctIndex) {
                  style = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-bold';
                } else if (isSelected) {
                  style = 'border-rose-500 bg-rose-50 text-rose-950 font-bold';
                } else {
                  style = 'border-slate-200 opacity-50 text-slate-400';
                }
              } else if (isSelected) {
                style = 'border-amber-500 bg-amber-50/70 text-amber-950 font-bold ring-2 ring-amber-400/20';
              }

              return (
                <button
                  key={idx}
                  disabled={isAnswered}
                  onClick={() => handleSelect(idx)}
                  className={`w-full text-right p-4 rounded-xl border text-sm flex items-center justify-between transition-all ${style}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center text-xs font-mono shrink-0">
                      {idx + 1}
                    </span>
                    <div className="font-medium text-right">
                      <MathText text={option} />
                    </div>
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

          {/* Action or Correction */}
          {!isAnswered ? (
            <div className="pt-2">
              <button
                onClick={handleConfirmAnswer}
                disabled={selectedOption === null}
                className="w-full sm:w-auto px-7 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-white font-bold text-sm shadow-md shadow-amber-500/20 transition-all"
              >
                تأكيد الإجابة
              </button>
            </div>
          ) : (
            <div className={`p-5 rounded-2xl border space-y-3 animate-fadeIn ${
              isCorrect ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'
            }`}>
              <div className="flex items-center justify-between">
                <span className={`font-bold text-sm ${isCorrect ? 'text-emerald-900' : 'text-rose-900'}`}>
                  {isCorrect ? 'إجابة نموذجية صحيحة!' : 'تصحيح الإجابة:'}
                </span>

                <button
                  onClick={readCorrectionAudio}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  title="استماع للشرح الصوتي للتصحيح"
                >
                  <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>استمع للتصحيح</span>
                </button>
              </div>

              <div className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                <MathText text={currentQ.explanation} />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm"
                >
                  <span>{currentIndex < questions.length - 1 ? 'السؤال التالي' : 'إنهاء الاختبار وإظهار النتيجة'}</span>
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
