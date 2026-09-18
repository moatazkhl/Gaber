import { StudentProgress } from '../types';

const STORAGE_KEY = 'syrian_math_grade8_progress_v1';

const DEFAULT_PROGRESS: StudentProgress = {
  studentName: 'طالب الصف الثامن',
  completedLessons: [],
  lessonQuizScores: {},
  unitExamScores: {},
  diagnosticTaken: false,
  diagnosticScore: undefined,
  diagnosticLevel: undefined,
  diagnosticRecommendation: undefined,
  lastActiveLessonId: 'unit1-lesson1',
  favoriteLessons: [],
};

type ProgressListener = (progress: StudentProgress) => void;

class ProgressManager {
  private listeners: ProgressListener[] = [];
  private cachedProgress: StudentProgress;

  constructor() {
    this.cachedProgress = this.loadFromStorage();
  }

  private loadFromStorage(): StudentProgress {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        return { ...DEFAULT_PROGRESS, ...JSON.parse(data) };
      }
    } catch (e) {
      console.error('Failed to load progress from localStorage', e);
    }
    return { ...DEFAULT_PROGRESS };
  }

  public getProgress(): StudentProgress {
    return { ...this.cachedProgress };
  }

  private notify(): void {
    const copy = this.getProgress();
    this.listeners.forEach((listener) => listener(copy));
  }

  public subscribe(listener: ProgressListener): () => void {
    this.listeners.push(listener);
    listener(this.getProgress());
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  public saveProgress(progress: StudentProgress): void {
    this.cachedProgress = { ...progress };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch (e) {
      console.error('Failed to save progress to localStorage', e);
    }
    this.notify();
  }

  public toggleLessonCompleted(lessonId: string): StudentProgress {
    const progress = this.getProgress();
    if (progress.completedLessons.includes(lessonId)) {
      progress.completedLessons = progress.completedLessons.filter((id) => id !== lessonId);
    } else {
      progress.completedLessons.push(lessonId);
    }
    progress.lastActiveLessonId = lessonId;
    this.saveProgress(progress);
    return progress;
  }

  public markLessonCompleted(lessonId: string): StudentProgress {
    const progress = this.getProgress();
    if (!progress.completedLessons.includes(lessonId)) {
      progress.completedLessons.push(lessonId);
    }
    progress.lastActiveLessonId = lessonId;
    this.saveProgress(progress);
    return progress;
  }

  public saveQuizScore(lessonId: string, score: number, total: number): StudentProgress {
    const progress = this.getProgress();
    progress.lessonQuizScores[lessonId] = {
      score,
      total,
      timestamp: Date.now(),
    };
    if (score / total >= 0.6 && !progress.completedLessons.includes(lessonId)) {
      progress.completedLessons.push(lessonId);
    }
    this.saveProgress(progress);
    return progress;
  }

  public saveUnitExamScore(unitId: string, score: number, total: number): StudentProgress {
    const progress = this.getProgress();
    progress.unitExamScores[unitId] = {
      score,
      total,
      timestamp: Date.now(),
    };
    this.saveProgress(progress);
    return progress;
  }

  public saveDiagnosticResult(
    score: number,
    total: number,
    level: string,
    recommendation: string
  ): StudentProgress {
    const progress = this.getProgress();
    progress.diagnosticTaken = true;
    progress.diagnosticScore = score;
    progress.diagnosticLevel = level;
    progress.diagnosticRecommendation = recommendation;
    this.saveProgress(progress);
    return progress;
  }

  public setStudentName(name: string): StudentProgress {
    const progress = this.getProgress();
    progress.studentName = name.trim() || 'طالب الصف الثامن';
    this.saveProgress(progress);
    return progress;
  }

  public resetProgress(): StudentProgress {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error(e);
    }
    this.cachedProgress = { ...DEFAULT_PROGRESS };
    this.notify();
    return this.cachedProgress;
  }
}

export const progressService = new ProgressManager();
export const ProgressService = progressService;
