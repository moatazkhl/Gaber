export type TabType = 'explanation' | 'interactive_video' | 'simulator' | 'exercises' | 'quiz';

export interface ExerciseItem {
  id: string;
  question: string;
  hint?: string;
  solutionSteps: string[];
  finalAnswer: string;
  ruleReference?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  commonMistakeNote?: string;
}

export interface VideoStep {
  stepNumber: number;
  title: string;
  audioScript: string;
  visualContent: {
    type: 'formula' | 'diagram' | 'step_by_step' | 'contrast';
    formula?: string;
    description: string;
    details?: string[];
    highlight?: string;
  };
}

export type SimulatorType = 
  | 'fractions_operation'
  | 'powers_explorer'
  | 'algebra_balance'
  | 'polynomial_expansion'
  | 'speed_distance_time'
  | 'statistics_histogram';

export interface Lesson {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  bookPages: string; // e.g. "ص 5 - 7"
  objectives: string[];
  coreRule: {
    title: string;
    text: string;
    mathRules?: string[];
  };
  deepExplanation: {
    introduction: string;
    sections: {
      heading: string;
      body: string;
      mathExamples: {
        problem: string;
        solution: string;
        explanation: string;
      }[];
    }[];
  };
  interactiveVideo: {
    duration: string;
    description: string;
    steps: VideoStep[];
  };
  simulatorType?: SimulatorType;
  exercises: ExerciseItem[];
  quiz: QuizQuestion[];
}

export interface Unit {
  id: string;
  number: number;
  title: string;
  description: string;
  bookPages: string;
  iconName: string;
  accentColor: string;
  lessons: Lesson[];
  unitExam: QuizQuestion[];
}

export interface StudentProgress {
  studentName: string;
  completedLessons: string[]; // lesson ids
  lessonQuizScores: Record<string, { score: number; total: number; timestamp: number }>;
  unitExamScores: Record<string, { score: number; total: number; timestamp: number }>;
  diagnosticTaken: boolean;
  diagnosticScore?: number;
  diagnosticLevel?: string;
  diagnosticRecommendation?: string;
  lastActiveLessonId: string;
  favoriteLessons: string[];
}
