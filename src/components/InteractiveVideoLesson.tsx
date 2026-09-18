import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  SkipForward, 
  SkipBack, 
  Volume2, 
  VolumeX,
  Sparkles, 
  CheckCircle, 
  AlertTriangle, 
  BookOpen, 
  HelpCircle,
  Clock,
  Layers,
  GraduationCap
} from 'lucide-react';
import { Lesson } from '../types';
import { speechService } from '../services/speechService';
import { MathFormula, MathText, Fraction } from './MathFormula';

interface InteractiveVideoLessonProps {
  lesson: Lesson;
  onFinishedVideo?: () => void;
}

interface VideoStep {
  stepNumber: number;
  title: string;
  audioScript: string;
  visualContent: {
    type: 'diagram' | 'formula' | 'step_by_step' | 'contrast';
    description: string;
    details?: string[];
    formula?: string;
    highlight?: string;
  };
}

export const InteractiveVideoLesson: React.FC<InteractiveVideoLessonProps> = ({
  lesson,
  onFinishedVideo,
}) => {
  // Enhanced 4-station pedagogy
  const enrichedSteps: VideoStep[] = [
    {
      stepNumber: 1,
      title: 'التمهيد والهدف الرياضي للدرس',
      audioScript: `مرحباً بكم يا أبطال الصف الثامن. هدفنا في درس ${lesson.title} هو ${lesson.objectives.join('، وأيضاً ')}. استعدوا للتركيز على السبورة الذكية.`,
      visualContent: {
        type: 'diagram',
        description: `الهدف التعليمي الأساسي: ${lesson.subtitle}`,
        details: lesson.objectives,
        highlight: 'المنهاج السوري المعتمد - كتاب الجبر'
      }
    },
    {
      stepNumber: 2,
      title: 'القاعدة الرسمية المعتمدة في الامتحان',
      audioScript: `القاعدة الرياضية الأساسية: ${lesson.coreRule.title}. ${lesson.coreRule.text}. احفظوا نص القاعدة وطبقوا شروطها بدقة.`,
      visualContent: {
        type: 'formula',
        description: lesson.coreRule.text,
        formula: lesson.coreRule.mathRules?.[0] || 'a/b + c/d = (a·d + b·c)/(b·d)',
        details: lesson.coreRule.mathRules || [],
        highlight: 'قاعدة رسمية موحدة في الامتحانات'
      }
    },
    {
      stepNumber: 3,
      title: 'تطبيق عملي محلول خطوة بخطوة على السبورة',
      audioScript: `والآن ننتقل إلى حل مثال تطبيقي من تدريبات الكتاب. سنكتب خطوات الحل بالترتيب على السبورة مع مراعاة الحساب الدقيق وتوحيد المقامات والتبسيط.`,
      visualContent: {
        type: 'step_by_step',
        description: lesson.deepExplanation.sections[0]?.mathExamples?.[0]?.explanation || 'تطبيق عملي للقاعدة مع تبسيط الناتج لأبسط صورة عادية.',
        details: [
          lesson.deepExplanation.sections[0]?.mathExamples?.[0]?.problem || 'المسألة النموذجية',
          lesson.deepExplanation.sections[0]?.mathExamples?.[0]?.solution || 'الحل بالتفصيل',
          'الاختزال والتبسيط إلى أبسط صورة عادية'
        ],
        highlight: 'الحل المنهجي المعتمد في الامتحانات'
      }
    },
    {
      stepNumber: 4,
      title: 'فخ الامتحانات: أخطر خطأ يقع فيه الطلاب وكيفية تجنبه',
      audioScript: `انتبهوا يا طلابي الأعزاء! هذا فخ امتحاني يتكرر كثيراً: الخطأ الشائع هو التسرع في الحساب دون مراعاة القواعد الأساسية. تذكروا دائماً الخطوات النظامية للحصول على الدرجة التامة.`,
      visualContent: {
        type: 'contrast',
        description: 'مقارنة دقيقة بين الخطأ الشائع الذي يقع فيه الطلاب والحل النموذجي الصحيح',
        details: [
          '❌ الخطأ الشائع: إهمال توحيد المقامات أو التسرع في العمليات الحسابية',
          '✅ الصواب: تطبيق الخطوات المنهجية خطوة بخطوة واختزال الناتج لأبسط صورة',
          `نصيحة الأستاذ: ${lesson.exercises[0]?.hint || 'راجع خطوات الحل وتحقق من صحة الناتج بالتعويض'}`
        ],
        highlight: 'نصيحة الامتحان: الدقة قبل السرعة'
      }
    }
  ];

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlayingAuto, setIsPlayingAuto] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [autoProgress, setAutoProgress] = useState<number>(0);

  const currentStep: VideoStep = enrichedSteps[currentStepIndex] || enrichedSteps[0];
  const timerRef = useRef<any>(null);

  // Subscribe to speech service status
  useEffect(() => {
    const unsub = speechService.subscribe((state) => {
      setIsSpeaking(state.isPlaying && !state.isPaused);
    });
    return () => {
      speechService.cancel();
      unsub();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Handle step change or speech narration
  const speakCurrentStation = () => {
    if (isSpeaking) {
      speechService.cancel();
    } else {
      speechService.ensureAudioContext();
      speechService.playChime('start');
      speechService.setRate(playbackSpeed * 0.92);
      speechService.speak(currentStep.audioScript);
    }
  };

  // Relaxed Auto-Play loop: ample time (18 seconds per station) with smooth progress bar
  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (isPlayingAuto) {
      // Speak audio at start of station
      speechService.setRate(playbackSpeed * 0.92);
      speechService.speak(currentStep.audioScript);

      const totalDurationSec = 16;
      let elapsed = 0;
      setAutoProgress(0);

      timerRef.current = setInterval(() => {
        elapsed += 0.5;
        const pct = Math.min(100, (elapsed / totalDurationSec) * 100);
        setAutoProgress(pct);

        if (elapsed >= totalDurationSec) {
          clearInterval(timerRef.current);
          if (currentStepIndex < enrichedSteps.length - 1) {
            setCurrentStepIndex((prev) => prev + 1);
          } else {
            setIsPlayingAuto(false);
            setAutoProgress(100);
            if (onFinishedVideo) onFinishedVideo();
          }
        }
      }, 500);
    } else {
      setAutoProgress(0);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentStepIndex, isPlayingAuto]);

  const toggleAutoPlay = () => {
    if (isPlayingAuto) {
      setIsPlayingAuto(false);
      speechService.cancel();
    } else {
      setIsPlayingAuto(true);
      speakCurrentStation();
    }
  };

  const handleNext = () => {
    speechService.cancel();
    speechService.playChime('next');
    if (currentStepIndex < enrichedSteps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    speechService.cancel();
    speechService.playChime('next');
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleRestart = () => {
    speechService.cancel();
    speechService.playChime('start');
    setCurrentStepIndex(0);
    setAutoProgress(0);
    if (isPlayingAuto) {
      setIsPlayingAuto(true);
    }
  };

  const changeSpeed = (speed: number) => {
    setPlaybackSpeed(speed);
    speechService.setRate(speed * 0.92);
  };

  return (
    <div className="rounded-3xl overflow-hidden shadow-xl border-2 border-slate-200 bg-white text-slate-900">
      
      {/* Smart Whiteboard Top Frame: Bright, Modern, Educational */}
      <div className="bg-slate-100/90 px-4 sm:px-6 py-3.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 select-none">
        
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-sm shadow-emerald-600/20">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-emerald-800">
                السبورة المدرسية الذكية
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold">
                منهاج الجبر السوري
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-black text-slate-900 mt-0.5">
              الدرس {lesson.number}: {lesson.title}
            </h3>
          </div>
        </div>

        {/* Top Control Chips: Audio & Speed */}
        <div className="flex items-center gap-2">
          {/* Quick Sound Test button */}
          <button
            onClick={() => speechService.testAudio()}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-bold transition-all shadow-2xs"
            title="فحص مكبر الصوت والتأكد من وضوح الصوت"
          >
            <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">فحص الصوت</span>
          </button>

          {/* Speed Selector */}
          <div className="flex items-center bg-white rounded-xl p-0.5 border border-slate-200 shadow-2xs text-xs">
            {[0.8, 1.0, 1.25].map((s) => (
              <button
                key={s}
                onClick={() => changeSpeed(s)}
                className={`px-2.5 py-1 rounded-lg font-mono font-bold transition-all ${
                  playbackSpeed === s
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title={`سرعة الشرح الصوتي: ${s}x`}
              >
                {s}x
              </button>
            ))}
          </div>

          {/* Teacher Voice Button with Guaranteed Audio Confirmation */}
          <button
            onClick={speakCurrentStation}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              isSpeaking
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 animate-pulse'
                : 'bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-2xs'
            }`}
            title="انقر للاستماع لشرح هذه المحطة بصوت المعلم"
          >
            <Volume2 className="w-4 h-4 text-emerald-600" />
            <span>{isSpeaking ? 'جاري الشرح الصوتي...' : 'استمع لشرح المحطة'}</span>
          </button>
        </div>
      </div>

      {/* Classroom Smart Whiteboard Surface (خلفية بيضاء ناصعة ومريحة بدون أي سواد يحجب الأرقام) */}
      <div className="relative min-h-[460px] p-6 sm:p-8 flex flex-col justify-between bg-[#fbfdfc] border-b border-slate-200">
        
        {/* Subtle Mathematical Grid for authentic clean whiteboard feeling */}
        <div 
          className="absolute inset-0 opacity-[0.4] pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(#e2e8f0 1px, transparent 1px), linear-gradient(90deg, #e2e8f0 1px, transparent 1px)',
            backgroundSize: '24px 24px'
          }}
        />

        {/* Step Indicator Tabs inside Whiteboard */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-600 shadow-xs" />
            <span className="text-xs font-mono font-bold text-emerald-800 tracking-wide uppercase">
              المحطة {currentStep.stepNumber} من {enrichedSteps.length}
            </span>
            <span className="text-slate-300">|</span>
            <h4 className="text-base sm:text-lg font-black text-slate-900">
              {currentStep.title}
            </h4>
          </div>

          {/* 4 Station Jump Buttons */}
          <div className="flex items-center gap-1.5">
            {enrichedSteps.map((step, idx) => (
              <button
                key={idx}
                onClick={() => {
                  speechService.cancel();
                  speechService.playChime('next');
                  setCurrentStepIndex(idx);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  idx === currentStepIndex
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/20'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                }`}
              >
                {idx + 1}. {step.title.split(':')[0].substring(0, 16)}
              </button>
            ))}
          </div>
        </div>

        {/* Whiteboard Main Pen/Chalk Work Area (كل النصوص والأرقام واضحة جداً) */}
        <div className="relative z-10 my-6 space-y-6">
          
          {/* Station 1: Introductory Diagram & Concept */}
          {currentStepIndex === 0 && (
            <div className="space-y-4">
              <div className="p-6 rounded-2xl bg-white border-2 border-emerald-200 shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm sm:text-base">
                  <Sparkles className="w-5 h-5 text-emerald-600" />
                  <span>الهدف التعليمي الأساسي في كتاب الجبر:</span>
                </div>
                <p className="text-lg sm:text-xl text-slate-900 font-bold leading-relaxed">
                  {currentStep.visualContent.description}
                </p>
              </div>

              {/* Whiteboard Highlights Chips */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentStep.visualContent.details?.map((detail, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-white border border-slate-200 text-slate-900 shadow-2xs flex items-start gap-2.5 font-medium"
                  >
                    <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="text-sm font-semibold">{detail}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Station 2: Official Syrian Rule with Vertical Fractions */}
          {currentStepIndex === 1 && (
            <div className="space-y-5 text-center">
              <div className="inline-block px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300">
                القاعدة الرسمية المعتمدة في المنهاج
              </div>

              {/* Formula Box: White Background, Ultra-Crisp Dark Text & Prominent Horizontal Fraction */}
              <div className="p-6 sm:p-8 rounded-2xl bg-white border-2 border-emerald-300 shadow-md flex flex-col items-center justify-center space-y-4 max-w-3xl mx-auto">
                <span className="text-xs text-slate-500 font-mono font-bold">
                  صيغة القاعدة بالرموز الرياضية والكسور العادية
                </span>
                <div className="text-2xl sm:text-4xl font-mono text-slate-950 font-bold">
                  <MathFormula
                    formula={currentStep.visualContent.formula || lesson.coreRule.mathRules?.[0] || 'a/b + c/d'}
                    large
                    className="bg-transparent border-none text-slate-950 shadow-none text-2xl sm:text-3xl"
                  />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white border border-slate-200 max-w-2xl mx-auto text-slate-800 text-sm sm:text-base leading-relaxed font-semibold">
                <MathText text={currentStep.visualContent.description} />
              </div>
            </div>
          )}

          {/* Station 3: Solved Step-by-Step Textbook Example on the Board */}
          {currentStepIndex === 2 && (
            <div className="space-y-4">
              <div className="p-6 rounded-2xl bg-white border-2 border-emerald-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm sm:text-base">
                    <BookOpen className="w-5 h-5 text-emerald-600" />
                    <span>تمرين تطبيقي محلول خطوة بخطوة على السبورة:</span>
                  </div>
                  <span className="text-xs text-slate-500 font-mono font-bold">كتاب الجبر - الصفحة 6 وما بعدها</span>
                </div>

                {/* Step-by-step clear writing without dark background */}
                <div className="space-y-3 font-mono text-sm sm:text-base">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-950 flex flex-wrap items-center gap-2 shadow-2xs">
                    <span className="text-emerald-800 font-black">1. المسألة:</span>
                    <MathText text={lesson.deepExplanation.sections[0]?.mathExamples?.[0]?.problem || 'احسب: (5 / 6) + (3 / 4)'} />
                  </div>

                  <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-300 text-slate-950 flex flex-wrap items-center gap-2 shadow-2xs">
                    <span className="text-emerald-900 font-black">2. توحيد المقامات والحل:</span>
                    <MathFormula formula={lesson.deepExplanation.sections[0]?.mathExamples?.[0]?.solution || '5/6 + 3/4 = 10/12 + 9/12 = 19/12'} />
                  </div>

                  <div className="p-4 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs sm:text-sm font-sans flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="font-medium">{lesson.deepExplanation.sections[0]?.mathExamples?.[0]?.explanation || 'المقام المشترك هو 12، قمنا بضرب بسط ومقام كل كسر بالعدد المناسب ثم جمعنا البسطين.'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Station 4: Common Exam Mistake vs Correct Way (فخ الامتحان) */}
          {currentStepIndex === 3 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* The Mistake (Red Alert Box with Clear Contrast) */}
                <div className="p-6 rounded-2xl bg-rose-50 border-2 border-rose-300 space-y-3 shadow-2xs">
                  <div className="flex items-center gap-2 text-rose-800 font-black text-sm sm:text-base">
                    <AlertTriangle className="w-5 h-5 text-rose-600" />
                    <span>❌ الخطأ الشائع الذي يقع فيه الطلاب:</span>
                  </div>
                  <p className="text-xs sm:text-sm text-rose-950 leading-relaxed font-semibold">
                    جمع أو طرح المقامات مباشرة دون توحيد المقامات!
                  </p>
                  <div className="p-3.5 rounded-xl bg-white border border-rose-200 text-center text-rose-900 font-mono text-sm sm:text-base font-bold shadow-2xs">
                    خطأ: (a/b) + (c/d) ≠ (a+c)/(b+d)
                  </div>
                  <span className="text-[11px] text-rose-700 block font-bold">
                    احذر: لا يجوز جمع المقامات أبداً في الكسور العادية!
                  </span>
                </div>

                {/* The Correct Way (Green Affirmation Box) */}
                <div className="p-6 rounded-2xl bg-emerald-50 border-2 border-emerald-300 space-y-3 shadow-2xs">
                  <div className="flex items-center gap-2 text-emerald-800 font-black text-sm sm:text-base">
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                    <span>✅ الحل النموذجي المعتمد لنيل الدرجة التامة:</span>
                  </div>
                  <p className="text-xs sm:text-sm text-emerald-950 leading-relaxed font-semibold">
                    توحيد المقامات أولاً عبر المضاعف المشترك الأصغر ثم جمع البسطين فقط!
                  </p>
                  <div className="p-3.5 rounded-xl bg-white border border-emerald-300 text-center text-emerald-900 font-mono text-sm sm:text-base font-bold shadow-2xs">
                    الصواب: (a/b) + (c/d) = (a·d + b·c) / (b·d)
                  </div>
                  <span className="text-[11px] text-emerald-800 block font-bold">
                    تثبيت المقام المشترك وجمع أو طرح البسوط فقط.
                  </span>
                </div>

              </div>
            </div>
          )}

        </div>

        {/* Live Arabic Audio Transcript & Teacher Box: Crisp, White, Readable */}
        <div className="relative z-10 mt-2 p-4 rounded-2xl bg-white border-2 border-emerald-200 shadow-sm flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 border border-emerald-300 flex items-center justify-center shrink-0 text-emerald-700 font-bold">
            <Volume2 className="w-5 h-5" />
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-emerald-900">
                نص شرح الأستاذ (اللغة العربية الفصحى):
              </span>
              {isSpeaking && (
                <span className="inline-flex items-center gap-1.5 text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  قيد الشرح الصوتي
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-semibold">
              <MathText text={currentStep.audioScript} />
            </p>
          </div>
        </div>

      </div>

      {/* Smart Whiteboard Tray & Control Bar (شريط التحكم الهادئ والمريح) */}
      <div className="bg-slate-50 p-4 sm:p-5 border-t border-slate-200 select-none">
        
        {/* Step Progress Line */}
        <div className="w-full flex items-center gap-2 mb-4">
          {enrichedSteps.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                speechService.cancel();
                speechService.playChime('next');
                setCurrentStepIndex(idx);
              }}
              className={`h-2.5 rounded-full flex-1 transition-all ${
                idx === currentStepIndex
                  ? 'bg-emerald-600 h-3 shadow-xs'
                  : idx < currentStepIndex
                  ? 'bg-emerald-400'
                  : 'bg-slate-200 hover:bg-slate-300'
              }`}
              title={`الانتقال إلى المحطة ${idx + 1}`}
            />
          ))}
        </div>

        {/* Auto Progress Bar (عند تفعيل العرض التلقائي) */}
        {isPlayingAuto && (
          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mb-3">
            <div 
              className="bg-emerald-600 h-full transition-all duration-300"
              style={{ width: `${autoProgress}%` }}
            />
          </div>
        )}

        {/* Bottom Playback Controls: Manual & Auto */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleRestart}
              className="p-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 transition-colors shadow-2xs"
              title="إعادة الدرس من المحطة الأولى"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono text-slate-700 font-bold">
              المحطة {currentStepIndex + 1} من {enrichedSteps.length}
            </span>
          </div>

          {/* Main Play & Step Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrev}
              disabled={currentStepIndex === 0}
              className="p-2.5 rounded-xl bg-white hover:bg-slate-100 disabled:opacity-40 text-slate-700 border border-slate-300 transition-colors shadow-2xs"
              title="المحطة السابقة"
            >
              <SkipForward className="w-5 h-5" />
            </button>

            {/* Toggle Continuous Narration */}
            <button
              onClick={toggleAutoPlay}
              className={`px-5 py-2.5 rounded-2xl font-black flex items-center gap-2 shadow-md transition-all active:scale-95 text-xs sm:text-sm ${
                isPlayingAuto
                  ? 'bg-amber-500 hover:bg-amber-600 text-slate-950'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
              }`}
              title={isPlayingAuto ? 'إيقاف مؤقت للعرض' : 'تشغيل العرض التلقائي المتأني والشرح'}
            >
              {isPlayingAuto ? (
                <>
                  <Pause className="w-4 h-4 fill-current" />
                  <span>إيقاف العرض التلقائي</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>تشغيل العرض المتأني بالصوت</span>
                </>
              )}
            </button>

            <button
              onClick={handleNext}
              disabled={currentStepIndex === enrichedSteps.length - 1}
              className="p-2.5 rounded-xl bg-white hover:bg-slate-100 disabled:opacity-40 text-slate-700 border border-slate-300 transition-colors shadow-2xs"
              title="المحطة التالية"
            >
              <SkipBack className="w-5 h-5" />
            </button>
          </div>

          {/* Pen Tray Decorator */}
          <div className="flex items-center gap-2 text-xs text-slate-600 font-mono">
            <span className="w-3 h-5 rounded-sm bg-emerald-600 inline-block shadow-xs" title="قلم زمردي" />
            <span className="w-3 h-5 rounded-sm bg-blue-600 inline-block shadow-xs" title="قلم كحلي" />
            <span className="w-3 h-5 rounded-sm bg-rose-600 inline-block shadow-xs" title="قلم ياقوتي" />
            <span className="mr-2 font-bold">{lesson.interactiveVideo.duration}</span>
          </div>

        </div>

      </div>

    </div>
  );
};
