import React, { useState, useEffect } from 'react';
import { UNITS, getLessonById, getUnitById, getAdjacentLessons, getAllLessons } from './data/curriculumData';
import { progressService } from './services/progressService';
import { StudentProgress } from './types';
import { Header } from './components/Header';
import { CurriculumNav } from './components/CurriculumNav';
import { LessonView } from './components/LessonView';
import { UnitExam } from './components/UnitExam';
import { DiagnosticTest } from './components/DiagnosticTest';
import { ProgressDashboard } from './components/ProgressDashboard';
import { Award, BookOpen, ChevronLeft, Sparkles, CheckCircle2 } from 'lucide-react';

type ViewMode = 'lesson' | 'unit_exam' | 'diagnostic' | 'progress';

export default function App() {
  const [progress, setProgress] = useState<StudentProgress>(progressService.getProgress());
  const [currentLessonId, setCurrentLessonId] = useState<string>('unit1-lesson1');
  const [currentExamUnitId, setCurrentExamUnitId] = useState<string>('unit-1');
  const [activeView, setActiveView] = useState<ViewMode>('lesson');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showDiagnosticBanner, setShowDiagnosticBanner] = useState(!progress.diagnosticTaken);

  // Sync state changes with localStorage
  useEffect(() => {
    const unsub = progressService.subscribe((updated) => {
      setProgress(updated);
    });
    return unsub;
  }, []);

  const currentLessonData = getLessonById(currentLessonId) || {
    unit: UNITS[0],
    lesson: UNITS[0].lessons[0]
  };

  const adjacent = getAdjacentLessons(currentLessonId);
  const allLessons = getAllLessons();

  const handleSelectLesson = (lessonId: string) => {
    setCurrentLessonId(lessonId);
    setActiveView('lesson');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectUnitExam = (unitId: string) => {
    setCurrentExamUnitId(unitId);
    setActiveView('unit_exam');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleComplete = (lessonId: string) => {
    progressService.toggleLessonCompleted(lessonId);
  };

  const handleSaveQuizScore = (lessonId: string, score: number, total: number) => {
    progressService.saveQuizScore(lessonId, score, total);
  };

  const handleSaveUnitExamScore = (unitId: string, score: number, total: number) => {
    progressService.saveUnitExamScore(unitId, score, total);
  };

  const handleCompleteDiagnostic = (score: number, total: number, level: string, recommendation: string) => {
    progressService.saveDiagnosticResult(score, total, level, recommendation);
    setShowDiagnosticBanner(false);
  };

  const handleUpdateStudentName = (name: string) => {
    progressService.setStudentName(name);
  };

  const handleResetProgress = () => {
    progressService.resetProgress();
    setShowDiagnosticBanner(true);
    setCurrentLessonId('unit1-lesson1');
    setActiveView('lesson');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100/60 text-slate-900 font-sans antialiased" dir="rtl">
      
      {/* Top Application Header */}
      <Header
        progress={progress}
        totalLessonsCount={allLessons.length}
        onOpenDiagnostic={() => setActiveView('diagnostic')}
        onOpenProgress={() => setActiveView('progress')}
        onToggleSidebar={() => setIsSidebarOpen(prev => !prev)}
      />

      {/* Main Body Layout with Sidebar */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        
        {/* Sequential Curriculum Sidebar */}
        <CurriculumNav
          units={UNITS}
          currentLessonId={currentLessonId}
          progress={progress}
          onSelectLesson={handleSelectLesson}
          onSelectUnitExam={handleSelectUnitExam}
          isOpen={isSidebarOpen}
          onCloseMobile={() => setIsSidebarOpen(false)}
        />

        {/* Dynamic Center Stage */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto w-full">
          
          {/* Optional Initial Diagnostic Banner */}
          {showDiagnosticBanner && activeView === 'lesson' && !progress.diagnosticTaken && (
            <div className="mb-6 p-5 rounded-3xl bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-md shadow-amber-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0">
                  <Award className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    اختبار قياس المستوى التشخيصي
                  </h3>
                  <p className="text-xs text-amber-100 mt-0.5">
                    قم بإجراء اختبار المستوى السريع (10 أسئلة) لتحديد نقاط قوتك وخطة التعلم الأنسب لك.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                <button
                  onClick={() => setShowDiagnosticBanner(false)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-amber-100 hover:bg-white/10"
                >
                  تخطي الآن
                </button>
                <button
                  onClick={() => setActiveView('diagnostic')}
                  className="px-4 py-1.5 rounded-xl bg-white text-amber-900 text-xs font-bold shadow-xs hover:bg-amber-50"
                >
                  بدء قياس المستوى
                </button>
              </div>
            </div>
          )}

          {/* Views */}
          {activeView === 'lesson' && (
            <LessonView
              unit={currentLessonData.unit}
              lesson={currentLessonData.lesson}
              progress={progress}
              onToggleComplete={handleToggleComplete}
              onSaveQuizScore={handleSaveQuizScore}
              onNavigatePrev={() => adjacent.prev && handleSelectLesson(adjacent.prev.lesson.id)}
              onNavigateNext={() => adjacent.next && handleSelectLesson(adjacent.next.lesson.id)}
              hasPrev={Boolean(adjacent.prev)}
              hasNext={Boolean(adjacent.next)}
              onOpenUnitExam={() => handleSelectUnitExam(currentLessonData.unit.id)}
            />
          )}

          {activeView === 'unit_exam' && (
            <UnitExam
              unit={getUnitById(currentExamUnitId) || UNITS[0]}
              studentName={progress.studentName}
              onSaveExamScore={handleSaveUnitExamScore}
              onBackToLessons={() => setActiveView('lesson')}
              previousScore={progress.unitExamScores[currentExamUnitId]}
            />
          )}

          {activeView === 'diagnostic' && (
            <DiagnosticTest
              studentName={progress.studentName}
              onComplete={handleCompleteDiagnostic}
              onClose={() => setActiveView('lesson')}
              initialScore={progress.diagnosticScore}
            />
          )}

          {activeView === 'progress' && (
            <ProgressDashboard
              progress={progress}
              units={UNITS}
              onSelectLesson={handleSelectLesson}
              onUpdateStudentName={handleUpdateStudentName}
              onResetProgress={handleResetProgress}
              onClose={() => setActiveView('lesson')}
            />
          )}

        </main>
      </div>

    </div>
  );
}
