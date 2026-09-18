import React, { useEffect, useState } from 'react';
import { 
  BookOpen, 
  Volume2, 
  VolumeX, 
  Pause, 
  Play, 
  BarChart2, 
  Award, 
  Menu, 
  GraduationCap
} from 'lucide-react';
import { speechService } from '../services/speechService';
import { StudentProgress } from '../types';

interface HeaderProps {
  progress: StudentProgress;
  totalLessonsCount: number;
  onOpenDiagnostic: () => void;
  onOpenProgress: () => void;
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  progress,
  totalLessonsCount,
  onOpenDiagnostic,
  onOpenProgress,
  onToggleSidebar,
}) => {
  const [speechState, setSpeechState] = useState({
    isPlaying: false,
    isPaused: false,
    currentText: '',
  });
  const [speed, setSpeed] = useState(1.0);

  useEffect(() => {
    const unsubscribe = speechService.subscribe((state) => {
      setSpeechState(state);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const completedCount = progress.completedLessons.length;
  const percentage = Math.round((completedCount / (totalLessonsCount || 1)) * 100);

  const cycleSpeed = () => {
    const nextSpeed = speed === 1.0 ? 1.25 : speed === 1.25 ? 0.8 : 1.0;
    setSpeed(nextSpeed);
    speechService.setRate(nextSpeed);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* Right side in RTL: Hamburger & Brand */}
          <div className="flex items-center gap-3">
            <button
              id="btn-toggle-sidebar"
              onClick={onToggleSidebar}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              aria-label="قائمة الدروس"
              title="فهرس الدروس"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/20">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                    منصة الرياضيات
                  </h1>
                  <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    كتاب الجبر - الصف الثامن
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium truncate max-w-[200px] sm:max-w-xs">
                  المنهاج السوري الكامل وفق تسلسل الكتاب المدرسي
                </p>
              </div>
            </div>
          </div>

          {/* Left side in RTL: Audio reader bar + Progress + Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Audio Reader Quick Controller (Active when speaking) */}
            {speechState.isPlaying && (
              <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 rounded-lg px-2 py-1 text-emerald-800 text-xs animate-pulse">
                <Volume2 className="w-4 h-4 text-emerald-600" />
                <span className="hidden sm:inline font-medium">جاري القراءة الصوتية...</span>
                <button
                  onClick={() => speechService.togglePlay('')}
                  className="p-1 hover:bg-emerald-100 rounded text-emerald-700"
                  title={speechState.isPaused ? 'استئناف' : 'إيقاف مؤقت'}
                >
                  {speechState.isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => speechService.cancel()}
                  className="p-1 hover:bg-emerald-100 rounded text-rose-600"
                  title="إيقاف نهائي"
                >
                  <VolumeX className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Voice Speed Button */}
            <button
              id="btn-voice-speed"
              onClick={cycleSpeed}
              className="hidden lg:flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              title="تعديل سرعة القراءة الصوتية"
            >
              <Volume2 className="w-3.5 h-3.5 text-slate-500" />
              <span>{speed}x</span>
            </button>

            {/* Diagnostic Placement Test Button */}
            <button
              id="btn-open-diagnostic"
              onClick={onOpenDiagnostic}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                progress.diagnosticTaken 
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' 
                  : 'bg-amber-500 hover:bg-amber-600 text-white shadow-sm shadow-amber-500/20'
              }`}
              title="اختبار قياس المستوى التشخيصي للطلاب"
            >
              <Award className="w-4 h-4" />
              <span className="hidden sm:inline">قياس المستوى</span>
            </button>

            {/* Student Progress Pill */}
            <button
              id="btn-open-progress"
              onClick={onOpenProgress}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all text-xs sm:text-sm"
              title="نظام متابعة تقدم الطالب"
            >
              <BarChart2 className="w-4 h-4 text-emerald-600" />
              <div className="flex flex-col items-start leading-none">
                <span className="font-bold text-slate-800">{percentage}%</span>
                <span className="text-[10px] text-slate-500 hidden sm:inline">{completedCount} من {totalLessonsCount} درس</span>
              </div>
            </button>

          </div>

        </div>
      </div>
    </header>
  );
};
