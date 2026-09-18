import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  PlaySquare, 
  Sliders, 
  FileText, 
  HelpCircle, 
  Volume2, 
  VolumeX,
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft, 
  Sparkles,
  Lightbulb,
  Check,
  Pause,
  Play,
  RotateCcw,
  X,
  GraduationCap
} from 'lucide-react';
import { Lesson, Unit, StudentProgress } from '../types';
import { speechService, SpeechState } from '../services/speechService';
import { MathFormula, MathText, Fraction } from './MathFormula';
import { InteractiveVideoLesson } from './InteractiveVideoLesson';
import { MathSimulator } from './MathSimulator';
import { LessonQuiz } from './LessonQuiz';

interface LessonViewProps {
  unit: Unit;
  lesson: Lesson;
  progress: StudentProgress;
  onToggleComplete: (lessonId: string) => void;
  onSaveQuizScore: (lessonId: string, score: number, total: number) => void;
  onNavigatePrev: () => void;
  onNavigateNext: () => void;
  hasPrev: boolean;
  hasNext: boolean;
  onOpenUnitExam: () => void;
}

type TabType = 'explanation' | 'video' | 'simulator' | 'exercises' | 'quiz';

export const LessonView: React.FC<LessonViewProps> = ({
  unit,
  lesson,
  progress,
  onToggleComplete,
  onSaveQuizScore,
  onNavigatePrev,
  onNavigateNext,
  hasPrev,
  hasNext,
  onOpenUnitExam,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('explanation');
  const isCompleted = progress.completedLessons.includes(lesson.id);
  const quizScore = progress.lessonQuizScores[lesson.id];

  // Speech State Management
  const [speechState, setSpeechState] = useState<SpeechState>({
    isPlaying: false,
    isPaused: false,
    currentText: '',
    currentSentence: '',
    sentenceIndex: 0,
    totalSentences: 0,
    hasArabicVoice: true,
    engine: 'idle',
    error: null,
  });
  const [showAudioBanner, setShowAudioBanner] = useState(false);
  const [audioSpeed, setAudioSpeed] = useState<number>(1.0);
  const [activeAudioTopic, setActiveAudioTopic] = useState<string>('');

  useEffect(() => {
    const unsub = speechService.subscribe((state) => {
      setSpeechState(state);
      if (state.isPlaying) {
        setShowAudioBanner(true);
      }
    });
    return () => {
      speechService.cancel();
      unsub();
    };
  }, []);

  // 1. Comprehensive Full Lesson Narration in fluent Arabic
  const readFullLessonAudio = () => {
    setActiveAudioTopic('شرح الدرس بالكامل');
    speechService.setRate(audioSpeed * 0.95);

    let script = `بسم الله الرحمن الرحيم. أهلاً بكم يا طلاب الصف الثامن الأعزاء. `;
    script += `درسنا اليوم هو الدرس ${lesson.number} بعنوان: ${lesson.title}. ${lesson.subtitle}، من الوحدة ${unit.number}: ${unit.title}. `;
    script += `أهداف هذا الدرس هي: ${lesson.objectives.join('، وكذلك ')}. `;
    script += `القاعدة الرياضية الأساسية تنص على: ${lesson.coreRule.text}. `;
    
    lesson.deepExplanation.sections.forEach((sec, idx) => {
      script += `المحور ${idx + 1}: ${sec.heading}. ${sec.body}. `;
      if (sec.mathExamples && sec.mathExamples.length > 0) {
        const ex = sec.mathExamples[0];
        script += `مثال توضيحي: ${ex.problem}. والشرح: ${ex.explanation}. `;
      }
    });

    script += `والآن يا أبطال، يمكنكم متابعة التمارين المحلولة وتجربة المختبر التفاعلي واختبار قياس المستوى. بالتوفيق الدائم!`;
    
    speechService.speak(script);
  };

  // 2. Read Core Rule Only
  const readCoreRuleAudio = () => {
    setActiveAudioTopic('قاعدة الدرس الرسمية');
    speechService.setRate(audioSpeed * 0.95);
    const script = `قاعدة الدرس الرسمية: ${lesson.coreRule.title}. نص القاعدة: ${lesson.coreRule.text}.`;
    speechService.speak(script);
  };

  // 3. Read Specific Section
  const readSectionAudio = (title: string, content: string) => {
    setActiveAudioTopic(title);
    speechService.setRate(audioSpeed * 0.95);
    speechService.speak(`${title}. ${content}`);
  };

  // 4. Read Exercise and Solution
  const readExerciseAudio = (question: string, solutionSteps: string[], finalAnswer: string) => {
    setActiveAudioTopic('شرح التمرين المحلول');
    speechService.setRate(audioSpeed * 0.95);
    const script = `السؤال: ${question}. خطوات الحل النموذجي: ${solutionSteps.join('، ثم ')}. والناتج النهائي هو: ${finalAnswer}.`;
    speechService.speak(script);
  };

  const togglePauseResume = () => {
    if (speechState.isPaused) {
      speechService.resume();
    } else if (speechState.isPlaying) {
      speechService.pause();
    } else {
      readFullLessonAudio();
    }
  };

  const stopAudio = () => {
    speechService.cancel();
    setShowAudioBanner(false);
  };

  const changeAudioSpeed = (speed: number) => {
    setAudioSpeed(speed);
    speechService.setRate(speed * 0.95);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner: Lesson Header with Direct Audio Action */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-4">
        
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
              الوحدة {unit.number}: {unit.title}
            </span>
            <span className="text-xs text-slate-500 font-mono font-medium">
              كتاب الجبر {lesson.bookPages}
            </span>
          </div>

          {/* Action Buttons: Audio Narration & Completion */}
          <div className="flex items-center gap-2">
            <button
              onClick={readFullLessonAudio}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                speechState.isPlaying && !speechState.isPaused
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 animate-pulse'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
              }`}
              title="الاستماع لشرح الدرس بالكامل بصوت المعلم باللغة العربية الفصحى"
            >
              <Volume2 className="w-4 h-4 text-emerald-600" />
              <span>{speechState.isPlaying ? 'جاري شرح الدرس...' : 'استمع لشرح الدرس كاملاً'}</span>
            </button>

            <button
              id={`btn-complete-${lesson.id}`}
              onClick={() => onToggleComplete(lesson.id)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                isCompleted
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/20'
                  : 'bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 border border-slate-200'
              }`}
            >
              {isCompleted ? <Check className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
              <span>{isCompleted ? 'تم إتقان الدرس' : 'تحديد كمنجز'}</span>
            </button>
          </div>
        </div>

        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
            الدرس {lesson.number}: {lesson.title}
          </h2>
          <p className="text-sm sm:text-base text-slate-600 mt-1 font-medium">
            {lesson.subtitle}
          </p>
        </div>

        {/* Objectives Chips */}
        <div className="pt-2 flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-500">أهداف التعلم:</span>
          {lesson.objectives.map((obj, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-[11px] font-medium text-slate-700"
            >
              <Sparkles className="w-3 h-3 text-emerald-500" />
              <span>{obj}</span>
            </span>
          ))}
        </div>

      </div>

      {/* Floating Teacher Audio Player Bar (عند تشغيل القراءة الصوتية للشرح) */}
      {showAudioBanner && (
        <div className="p-4 sm:p-5 rounded-2xl bg-white text-slate-900 shadow-xl border-2 border-emerald-300 space-y-3 animate-fadeIn">
          <div className="flex flex-wrap items-center justify-between gap-3">
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-800 flex items-center justify-center font-bold">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-emerald-800">شرح أستاذ الرياضيات</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold">
                    لغة عربية فصحى
                  </span>
                  {speechState.totalSentences > 0 && (
                    <span className="text-[10px] text-slate-500 font-mono font-bold">
                      الجملة {speechState.sentenceIndex + 1} من {speechState.totalSentences}
                    </span>
                  )}
                </div>
                <div className="text-xs sm:text-sm font-bold text-slate-800">
                  {activeAudioTopic || 'شرح الدرس'}
                </div>
              </div>
            </div>

            {/* Controls: Play/Pause, Speed, Close */}
            <div className="flex items-center gap-2">
              
              {/* Audio Test / Speaker Check Button */}
              <button
                onClick={() => speechService.testAudio()}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold transition-colors"
                title="فحص مكبر الصوت وتشغيل نغمة تأكيد"
              >
                <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>فحص الصوت</span>
              </button>

              {/* Playback speed selector */}
              <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200 text-xs">
                {[0.8, 1.0, 1.25].map((s) => (
                  <button
                    key={s}
                    onClick={() => changeAudioSpeed(s)}
                    className={`px-2 py-1 rounded font-mono font-bold transition-colors ${
                      audioSpeed === s
                        ? 'bg-emerald-600 text-white'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                    title={`سرعة القراءة: ${s}x`}
                  >
                    {s}x
                  </button>
                ))}
              </div>

              {/* Play / Pause button */}
              <button
                onClick={togglePauseResume}
                className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all shadow-md shadow-emerald-600/30"
                title={speechState.isPaused ? 'استئناف الشرح' : 'إيقاف مؤقت'}
              >
                {speechState.isPlaying && !speechState.isPaused ? (
                  <Pause className="w-4 h-4 fill-current" />
                ) : (
                  <Play className="w-4 h-4 fill-current" />
                )}
              </button>

              {/* Close audio player */}
              <button
                onClick={stopAudio}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                title="إيقاف الشرح الصوتي وإغلاق الشريط"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

          </div>

          {/* Current Spoken Arabic Sentence in Highlighted Crisp White Box */}
          {speechState.currentSentence && (
            <div className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200 text-xs sm:text-sm text-slate-900 font-bold leading-relaxed">
              <span className="text-emerald-800 ml-1.5 font-black">النص المقروء:</span>
              <MathText text={speechState.currentSentence} />
            </div>
          )}

          {!speechState.hasArabicVoice && (
            <div className="text-[11px] text-amber-800 bg-amber-50 p-2.5 rounded-lg border border-amber-200 font-medium">
              تلميح: للحصول على أنقى نطق عربي سلس للأستاذ، تأكد من استخدام متصفح يدعم حزم اللغات (مثل Google Chrome أو Microsoft Edge).
            </div>
          )}
        </div>
      )}

      {/* Tabs Navigation Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200 bg-white/80 backdrop-blur-xs p-2 rounded-2xl border">
        <button
          onClick={() => setActiveTab('explanation')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all shrink-0 ${
            activeTab === 'explanation'
              ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>الشرح الموسع والقواعد</span>
        </button>

        <button
          onClick={() => setActiveTab('video')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all shrink-0 ${
            activeTab === 'video'
              ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <PlaySquare className="w-4 h-4" />
          <span>السبورة الذكية التفاعلية</span>
        </button>

        <button
          onClick={() => setActiveTab('simulator')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all shrink-0 ${
            activeTab === 'simulator'
              ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>المختبر الرياضي</span>
        </button>

        <button
          onClick={() => setActiveTab('exercises')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all shrink-0 ${
            activeTab === 'exercises'
              ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>تمارين محلولة ({lesson.exercises.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('quiz')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all shrink-0 ${
            activeTab === 'quiz'
              ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>اختبار قياس المستوى</span>
          {quizScore && (
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono font-bold">
              {quizScore.score}/{quizScore.total}
            </span>
          )}
        </button>
      </div>

      {/* Tab 1: Deep Explanation & Official Syrian Rules */}
      {activeTab === 'explanation' && (
        <div className="space-y-6">
          
          {/* Core Rule Highlight Card */}
          <div className="p-6 sm:p-7 bg-emerald-50/80 text-slate-900 rounded-3xl shadow-sm border-2 border-emerald-300 space-y-4">
            <div className="flex items-center justify-between border-b border-emerald-200/80 pb-3">
              <div className="flex items-center gap-2 text-emerald-800 font-black text-sm sm:text-base">
                <Lightbulb className="w-5 h-5 text-emerald-600" />
                <span>{lesson.coreRule.title}</span>
              </div>
              <button
                onClick={readCoreRuleAudio}
                className="flex items-center gap-2 text-xs text-emerald-800 hover:text-emerald-950 font-bold transition-all bg-white hover:bg-emerald-100/60 px-3.5 py-1.5 rounded-xl border border-emerald-300 shadow-2xs"
                title="استمع لنص القاعدة بصوت المعلم"
              >
                <Volume2 className="w-4 h-4 text-emerald-600" />
                <span>قراءة صوتية للقاعدة</span>
              </button>
            </div>

            <p className="text-base sm:text-lg font-bold leading-relaxed text-slate-900">
              <MathText text={lesson.coreRule.text} />
            </p>

            {/* Official Math Formulas (Rendered with stacked vertical fractions!) */}
            {lesson.coreRule.mathRules && (
              <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {lesson.coreRule.mathRules.map((rule, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-white border-2 border-emerald-300 flex flex-col items-center justify-center text-center shadow-xs"
                  >
                    <span className="text-xs text-emerald-800 font-mono font-bold mb-2">
                      صيغة القاعدة الرياضية {idx + 1}
                    </span>
                    <MathFormula
                      formula={rule}
                      large
                      className="bg-transparent border-none text-slate-950 shadow-none text-xl sm:text-2xl font-bold"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Detailed Textbook Sections */}
          <div className="space-y-5">
            {lesson.deepExplanation.sections.map((section, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-4"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h4 className="text-base sm:text-lg font-bold text-slate-900">
                    {section.heading}
                  </h4>

                  <button
                    onClick={() => readSectionAudio(section.heading, section.body)}
                    className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-emerald-700 font-semibold px-2.5 py-1 rounded-lg hover:bg-emerald-50 transition-colors"
                  >
                    <Volume2 className="w-4 h-4 text-emerald-600" />
                    <span>قراءة المقطع</span>
                  </button>
                </div>

                <div className="text-sm sm:text-base text-slate-700 leading-relaxed font-sans">
                  <MathText text={section.body} />
                </div>

                {/* Math Examples inside section with proper horizontal fractions */}
                {section.mathExamples && (
                  <div className="space-y-3 pt-2">
                    {section.mathExamples.map((ex, exIdx) => (
                      <div
                        key={exIdx}
                        className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 space-y-3 text-xs sm:text-sm"
                      >
                        <div className="font-bold text-slate-900 flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-mono shrink-0">
                            {exIdx + 1}
                          </span>
                          <div className="text-slate-900 font-bold">
                            <MathText text={ex.problem} />
                          </div>
                        </div>

                        {/* Mathematical calculation rendered with horizontal fraction line */}
                        <div className="p-3 rounded-xl bg-white border border-slate-200 text-emerald-800 font-mono text-base flex flex-wrap items-center gap-2" dir="ltr">
                          <MathFormula formula={ex.solution} className="bg-transparent border-none p-0 text-emerald-800 shadow-none text-base font-bold" />
                        </div>

                        <div className="text-slate-600 text-xs sm:text-sm font-sans">
                          <MathText text={ex.explanation} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>
      )}

      {/* Tab 2: Smart Interactive Video Lesson (Chalkboard) */}
      {activeTab === 'video' && (
        <InteractiveVideoLesson
          lesson={lesson}
          onFinishedVideo={() => {
            if (!isCompleted) onToggleComplete(lesson.id);
          }}
        />
      )}

      {/* Tab 3: Interactive Math Simulator */}
      {activeTab === 'simulator' && (
        <MathSimulator type={lesson.simulatorType || 'fractions_operation'} />
      )}

      {/* Tab 4: Solved Exercises with Audio */}
      {activeTab === 'exercises' && (
        <div className="space-y-4">
          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between text-xs text-emerald-900">
            <div className="flex items-center gap-2 font-semibold">
              <Lightbulb className="w-4 h-4 text-emerald-600" />
              <span>تمارين كتاب الجبر المحلولة خطوة بخطوة بالكسور الأفقية مع التعليق الصوتي</span>
            </div>
            <span>مرجع الكتاب المدرسي</span>
          </div>

          <div className="space-y-4">
            {lesson.exercises.map((ex, index) => (
              <div
                key={ex.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className="w-7 h-7 rounded-xl bg-slate-900 text-white font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                      {index + 1}
                    </span>
                    <div>
                      <h4 className="text-base sm:text-lg font-bold text-slate-900">
                        <MathText text={ex.question} />
                      </h4>
                      <span className="text-[11px] text-slate-500 font-mono">
                        {ex.ruleReference}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => readExerciseAudio(ex.question, ex.solutionSteps, ex.finalAnswer)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold shrink-0 transition-colors"
                    title="استمع لشرح حل هذا التمرين باللغة العربية"
                  >
                    <Volume2 className="w-4 h-4 text-emerald-600" />
                    <span>استمع للحل</span>
                  </button>
                </div>

                {ex.hint && (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                    <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <strong>إرشاد الحل: </strong>
                      <MathText text={ex.hint} />
                    </div>
                  </div>
                )}

                {/* Steps of solution with proper horizontal fractions */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2.5">
                  <span className="text-xs font-bold text-slate-700 block">
                    خطوات الحل النموذجية:
                  </span>
                  <div className="space-y-2 text-xs sm:text-sm font-mono text-slate-800" dir="ltr">
                    {ex.solutionSteps.map((step, sIdx) => (
                      <div key={sIdx} className="bg-white p-3 rounded-lg border border-slate-200 flex items-center gap-2 text-sm">
                        <MathText text={step} />
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 text-xs font-bold text-emerald-800 flex items-center gap-2">
                    <span>الناتج النهائي المعتمد:</span>
                    <div className="text-sm font-mono text-emerald-700 bg-white px-3 py-1 rounded-lg border border-emerald-200">
                      <MathText text={ex.finalAnswer} />
                    </div>
                  </div>
                </div>

              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Lesson Quiz with Smart Correction */}
      {activeTab === 'quiz' && (
        <LessonQuiz
          questions={lesson.quiz}
          lessonTitle={lesson.title}
          previousScore={quizScore}
          onSaveScore={(score, total) => {
            onSaveQuizScore(lesson.id, score, total);
          }}
        />
      )}

      {/* Sequential Lesson Navigation Footer ("البدء من الوحدة الاولى حسب تسلسل الدروس الى نهاية الكتاب") */}
      <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          {hasPrev ? (
            <button
              onClick={onNavigatePrev}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm transition-all"
            >
              <ChevronRight className="w-4 h-4" />
              <span>الدرس السابق</span>
            </button>
          ) : (
            <div className="text-xs text-slate-400 font-semibold">بداية الكتاب المدرسي</div>
          )}
        </div>

        <button
          onClick={onOpenUnitExam}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-bold text-xs transition-all"
        >
          <span>اختبار الوحدة {unit.number} الشامل</span>
        </button>

        <div>
          {hasNext ? (
            <button
              onClick={onNavigateNext}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/20 transition-transform active:scale-95"
            >
              <span>الدرس التالي حسب التسلسل</span>
              <ChevronLeft className="w-4 h-4" />
            </button>
          ) : (
            <div className="text-xs text-emerald-700 font-bold">نهاية المنهاج الدراسي!</div>
          )}
        </div>
      </div>

    </div>
  );
};
