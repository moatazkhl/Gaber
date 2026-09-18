import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  ChevronDown, 
  ChevronUp, 
  Award, 
  BookOpen, 
  Search, 
  Sparkles,
  Layers
} from 'lucide-react';
import { Unit, Lesson, StudentProgress } from '../types';

interface CurriculumNavProps {
  units: Unit[];
  currentLessonId: string;
  progress: StudentProgress;
  onSelectLesson: (lessonId: string) => void;
  onSelectUnitExam: (unitId: string) => void;
  isOpen: boolean;
  onCloseMobile: () => void;
}

export const CurriculumNav: React.FC<CurriculumNavProps> = ({
  units,
  currentLessonId,
  progress,
  onSelectLesson,
  onSelectUnitExam,
  isOpen,
  onCloseMobile,
}) => {
  const [expandedUnits, setExpandedUnits] = useState<Record<string, boolean>>({
    'unit-1': true,
    'unit-2': true,
    'unit-3': true,
    'unit-4': true,
    'unit-5': true,
    'unit-6': true,
  });
  const [searchQuery, setSearchQuery] = useState('');

  const toggleUnit = (unitId: string) => {
    setExpandedUnits(prev => ({ ...prev, [unitId]: !prev[unitId] }));
  };

  const filteredUnits = units.map(unit => {
    if (!searchQuery.trim()) return unit;
    const q = searchQuery.toLowerCase();
    const matchingLessons = unit.lessons.filter(l => 
      l.title.toLowerCase().includes(q) || 
      l.subtitle.toLowerCase().includes(q)
    );
    return {
      ...unit,
      lessons: matchingLessons,
      isUnitMatch: unit.title.toLowerCase().includes(q)
    };
  }).filter(u => u.lessons.length > 0 || (u as any).isUnitMatch);

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Navigation Drawer / Sidebar */}
      <aside className={`fixed lg:sticky top-16 right-0 z-40 h-[calc(100vh-4rem)] w-80 sm:w-88 bg-white border-l border-slate-200 flex flex-col transition-transform duration-300 ease-in-out shadow-lg lg:shadow-none ${
        isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
      }`}>
        
        {/* Sidebar Header with Search */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/50">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
              <Layers className="w-4 h-4 text-emerald-600" />
              <span>فهرس منهاج الجبر</span>
            </div>
            <span className="text-xs text-slate-500 font-semibold bg-slate-200/70 px-2 py-0.5 rounded-full">
              6 وحدات
            </span>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 absolute right-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن درس أو موضوع..."
              className="w-full pl-3 pr-9 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-800 placeholder-slate-400"
            />
          </div>
        </div>

        {/* Scrollable Units List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {filteredUnits.map((unit) => {
            const isExpanded = expandedUnits[unit.id] ?? true;
            const completedCount = unit.lessons.filter(l => progress.completedLessons.includes(l.id)).length;
            const isUnitFinished = completedCount === unit.lessons.length && unit.lessons.length > 0;
            const examScore = progress.unitExamScores[unit.id];

            return (
              <div 
                key={unit.id}
                className="rounded-xl border border-slate-200 bg-white overflow-hidden transition-all shadow-xs"
              >
                {/* Unit Header Bar */}
                <div 
                  onClick={() => toggleUnit(unit.id)}
                  className="p-3 bg-slate-50/80 hover:bg-slate-100/80 cursor-pointer flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                      isUnitFinished 
                        ? 'bg-emerald-600 text-white' 
                        : 'bg-slate-200 text-slate-700'
                    }`}>
                      {unit.number}
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-bold text-slate-900 truncate">
                        {unit.title}
                      </div>
                      <div className="text-[10px] text-slate-500 flex items-center gap-2">
                        <span>{unit.bookPages}</span>
                        <span>•</span>
                        <span>{completedCount}/{unit.lessons.length} منجز</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {isUnitFinished && (
                      <span className="text-emerald-600" title="مكتملة">
                        <CheckCircle2 className="w-4 h-4" />
                      </span>
                    )}
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </div>

                {/* Lessons in this Unit */}
                {isExpanded && (
                  <div className="p-1.5 space-y-1 bg-white border-t border-slate-100">
                    {unit.lessons.map((lesson) => {
                      const isCurrent = lesson.id === currentLessonId;
                      const isCompleted = progress.completedLessons.includes(lesson.id);
                      const quizScore = progress.lessonQuizScores[lesson.id];

                      return (
                        <button
                          key={lesson.id}
                          id={`nav-lesson-${lesson.id}`}
                          onClick={() => {
                            onSelectLesson(lesson.id);
                            onCloseMobile();
                          }}
                          className={`w-full text-right p-2.5 rounded-lg flex items-start gap-2.5 transition-all text-xs ${
                            isCurrent
                              ? 'bg-emerald-50 text-emerald-950 font-bold border border-emerald-200 shadow-xs'
                              : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div className="pt-0.5 shrink-0">
                            {isCompleted ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <Circle className="w-4 h-4 text-slate-300" />
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <span className="truncate">
                                {lesson.number}. {lesson.title}
                              </span>
                              <span className="text-[10px] text-slate-600 font-mono shrink-0">
                                {lesson.bookPages}
                              </span>
                            </div>
                            
                            {quizScore && (
                              <div className="mt-1 flex items-center gap-1.5">
                                <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                                  درجة الاختبار: {quizScore.score}/{quizScore.total}
                                </span>
                              </div>
                            )}
                          </div>
                        </button>
                      );
                    })}

                    {/* Unit Exam Button */}
                    <div className="pt-1.5 border-t border-slate-100 mt-1">
                      <button
                        onClick={() => {
                          onSelectUnitExam(unit.id);
                          onCloseMobile();
                        }}
                        className={`w-full p-2 rounded-lg flex items-center justify-between text-xs font-bold transition-all ${
                          examScore
                            ? 'bg-amber-50 text-amber-900 border border-amber-200'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                        }`}
                        title="اختبار تقييم الوحدة الشامل"
                      >
                        <div className="flex items-center gap-2">
                          <Award className="w-4 h-4 text-amber-600" />
                          <span>اختبار الوحدة {unit.number} الشامل</span>
                        </div>
                        {examScore && (
                          <span className="text-[10px] bg-amber-200/80 px-1.5 py-0.5 rounded text-amber-900">
                            {examScore.score}/{examScore.total}
                          </span>
                        )}
                      </button>
                    </div>

                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="p-3 border-t border-slate-200 text-[11px] text-slate-500 bg-slate-50/50 flex items-center justify-between">
          <span>كتاب الطالب - الجبر</span>
          <span className="font-semibold text-emerald-700">الصف الثامن</span>
        </div>

      </aside>
    </>
  );
};
