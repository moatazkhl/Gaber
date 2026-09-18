import React, { useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  Award, 
  ArrowLeft, 
  Lightbulb, 
  AlertTriangle 
} from 'lucide-react';
import { QuizQuestion } from '../types';
import { speechService } from '../services/speechService';
import { MathText, MathFormula } from './MathFormula';
import confetti from 'canvas-confetti';

interface LessonQuizProps {
  questions: QuizQuestion[];
  lessonTitle: string;
  onSaveScore: (score: number, total: number) => void;
  previousScore?: { score: number; total: number };
}

export const LessonQuiz: React.FC<LessonQuizProps> = ({
  questions,
  lessonTitle,
  onSaveScore,
  previousScore,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const [speakingIndex, setSpeakingIndex] = useState<number | null>(null);

  const currentQ = questions[currentIndex];
  const isCorrect = selectedOption === currentQ?.correctIndex;

  const handleSelect = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
  };

  const handleConfirmAnswer = () => {
    if (selectedOption === null) return;
    setIsAnswered(true);
    const nextAnswers = [...userAnswers, selectedOption];
    setUserAnswers(nextAnswers);

    // If incorrect, prompt student with audio option
    if (selectedOption !== currentQ.correctIndex && currentQ.commonMistakeNote) {
      // audio ready
    }
  };

  const handleNext = () => {
    speechService.cancel();
    setSelectedOption(null);
    setIsAnswered(false);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      // Quiz finished
      setIsFinished(true);
      const correctCount = userAnswers.filter(
        (ans, idx) => ans === questions[idx].correctIndex
      ).length + (isCorrect ? 1 : 0);
      
      onSaveScore(correctCount, questions.length);

      if (correctCount / questions.length >= 0.7) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
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
    const text = `تصحيح الإجابة: إجابتك كانت غير دقيقة. الإجابة الصحيحة هي: ${currentQ.options[currentQ.correctIndex]}. الشرح والتصحيح: ${currentQ.explanation}. ${currentQ.commonMistakeNote ? 'تنبيه لتجنب الخطأ: ' + currentQ.commonMistakeNote : ''}`;
    speechService.speak(text);
  };

  // If already finished, display final report
  if (isFinished) {
    const correctCount = userAnswers.filter((ans, idx) => ans === questions[idx].correctIndex).length;
    const percentage = Math.round((correctCount / questions.length) * 100);
    const isPassed = percentage >= 60;

    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 text-center space-y-6">
        <div className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center ${
          isPassed ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
        }`}>
          <Award className="w-10 h-10" />
        </div>

        <div>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
            نتيجة اختبار الدرس
          </span>
          <h3 className="text-2xl font-black text-slate-900">
            {isPassed ? 'أحسنت! إتقان ممتاز للدرس' : 'تحتاج لمراجعة بعض المفاهيم'}
          </h3>
          <p className="text-sm text-slate-600 mt-1">
            حصلت على <strong className="text-emerald-700 font-bold">{correctCount}</strong> من أصل{' '}
            <strong>{questions.length}</strong> أسئلة ({percentage}%)
          </p>
        </div>

        {/* Review of Missed Questions */}
        {questions.some((q, idx) => userAnswers[idx] !== q.correctIndex) && (
          <div className="text-right bg-rose-50/70 p-5 rounded-xl border border-rose-200 space-y-4">
            <div className="flex items-center gap-2 text-rose-900 font-bold text-sm">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>مراجعة الأسئلة التي تحتاج تصحيحاً:</span>
            </div>

            <div className="space-y-3">
              {questions.map((q, idx) => {
                const userAns = userAnswers[idx];
                if (userAns === q.correctIndex) return null;
                return (
                  <div key={q.id} className="p-3 bg-white rounded-lg border border-rose-200 text-xs space-y-1.5 shadow-2xs">
                    <p className="font-bold text-slate-900">{idx + 1}. {q.question}</p>
                    <p className="text-rose-700">إجابتك: {q.options[userAns]} (غير صحيحة)</p>
                    <p className="text-emerald-700 font-semibold">الصواب: {q.options[q.correctIndex]}</p>
                    <p className="text-slate-600 bg-slate-50 p-2 rounded border border-slate-100 mt-1">
                      {q.explanation}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex justify-center gap-3 pt-2">
          <button
            onClick={handleRestart}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition-transform active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            <span>إعادة الاختبار وتحسين الدرجة</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      
      {/* Quiz Header */}
      <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">
            {currentIndex + 1}/{questions.length}
          </span>
          <div>
            <h4 className="text-sm font-bold text-slate-900">
              اختبار قياس مستوى الاستيعاب
            </h4>
            <span className="text-[11px] text-slate-500">
              {lessonTitle}
            </span>
          </div>
        </div>

        <button
          onClick={readQuestionAudio}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100"
          title="قراءة السؤال صوتياً"
        >
          <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>استمع للسؤال</span>
        </button>
      </div>

      {/* Question Body */}
      <div className="p-6 sm:p-8 space-y-6">
        <div className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed">
          <MathText text={currentQ.question} />
        </div>

        {/* Options List */}
        <div className="space-y-2.5">
          {currentQ.options.map((option, idx) => {
            const isSelected = selectedOption === idx;
            let btnStyle = 'border-slate-200 hover:border-emerald-300 hover:bg-slate-50 text-slate-800';

            if (isAnswered) {
              if (idx === currentQ.correctIndex) {
                btnStyle = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-bold';
              } else if (isSelected) {
                btnStyle = 'border-rose-500 bg-rose-50 text-rose-950 font-bold';
              } else {
                btnStyle = 'border-slate-200 opacity-60 text-slate-500';
              }
            } else if (isSelected) {
              btnStyle = 'border-emerald-600 bg-emerald-50/80 text-emerald-950 font-bold ring-2 ring-emerald-500/20';
            }

            return (
              <button
                key={idx}
                disabled={isAnswered}
                onClick={() => handleSelect(idx)}
                className={`w-full text-right p-3.5 rounded-xl border text-sm flex items-center justify-between transition-all ${btnStyle}`}
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

        {/* Action Button */}
        {!isAnswered ? (
          <div className="pt-2">
            <button
              onClick={handleConfirmAnswer}
              disabled={selectedOption === null}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:hover:bg-emerald-600 text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition-all"
            >
              تأكيد الإجابة
            </button>
          </div>
        ) : (
          /* Smart Corrective Feedback Box ("تصحيح الإجابات الخاطئة") */
          <div className={`p-5 rounded-xl border space-y-3 animate-fadeIn ${
            isCorrect 
              ? 'bg-emerald-50/80 border-emerald-200' 
              : 'bg-amber-50/90 border-amber-300'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-sm">
                {isCorrect ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span className="text-emerald-900">إجابة صحيحة ومتقنة!</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                    <span className="text-amber-950 font-black">تصحيح الإجابة وتحليل الخطأ:</span>
                  </>
                )}
              </div>

              {/* Audio reading button for correction */}
              <button
                onClick={readCorrectionAudio}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-2xs"
                title="استمع لصوت المعلم وهو يشرح تصحيح الخطأ"
              >
                <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>استمع للتصحيح صوتياً</span>
              </button>
            </div>

            {/* Explanation text */}
            <div className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              <strong className="text-slate-900 block mb-1">طريقة الحل الصحيحة:</strong>
              <MathText text={currentQ.explanation} />
            </div>

            {/* Common Mistake Note if wrong */}
            {!isCorrect && currentQ.commonMistakeNote && (
              <div className="p-3 bg-white/90 rounded-lg border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold">لماذا اخترت هذه الإجابة الخاطئة غالباً؟</strong>
                  <MathText text={currentQ.commonMistakeNote} />
                </div>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm transition-transform active:scale-95"
              >
                <span>{currentIndex < questions.length - 1 ? 'السؤال التالي' : 'عرض النتيجة النهائية'}</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
