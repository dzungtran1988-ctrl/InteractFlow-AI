/**
 * Type definitions for the InteractFlow AI v2.0 structured lesson data.
 */

export interface QuickCheck {
  question: string;
  hint: string;
  suggestedAnswer: string;
}

export interface LessonSection {
  title: string;
  content: string; // HTML or Markdown formatted content (the key point)
  example: string; // exactly 1 real illustrative example
  quickCheck: QuickCheck; // quick check activity for the slide
  lecturerNotes?: string; // notes / pedagogical tips for teacher
  imageUrl?: string; // Base64 or online URL of the image
  imagePrompt?: string; // AI image generation prompt
  imagePosition?: 'right' | 'left' | 'hide'; // default is right
}

export interface WarmUpActivity {
  title: string;
  description: string;
  task: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[]; // typically ["A. ...", "B. ...", "C. ...", "D. ..."]
  correctAnswer: string; // "A", "B", "C", or "D"
  explanation: string;
  bloomLevel: 'Nhớ/Hiểu' | 'Vận dụng' | 'Ra quyết định';
}

export interface CaseStudyTask {
  bloomLevel: 'Nhớ/Hiểu' | 'Phân tích/Vận dụng' | 'Đề xuất/Sáng tạo';
  question: string;
  hint: string;
  suggestedAnswer: string;
}

export interface CaseStudy {
  title: string;
  context: string;
  tasks: CaseStudyTask[]; // 3 structured tasks corresponding to Bloom levels
  rubric: string[]; // list of grading rubrics e.g., ["Tiếu chí 1: ..."]
}

export interface Flashcard {
  front: string;
  back: string;
}

export interface StructuredLesson {
  lessonTitle: string;
  introduction: string;
  learningObjectives: string[]; // exactly 3 elements
  sections: LessonSection[]; // multiple slides (typically 4 to 8 slides)
  warmUp: WarmUpActivity;
  quizQuestions: QuizQuestion[]; // exactly 5 elements labeled with Bloom levels
  caseStudy: CaseStudy; // upgraded structured worksheet
  reflectionQuestions: string[]; // exactly 3 elements
  summary: string;
  flashcards: Flashcard[];
}

export interface LocalCompletionRecord {
  id: string;
  lessonTitle: string;
  studentName: string;
  studentId: string;
  studentClass: string;
  quizScore: number; // Correct answers out of total
  totalQuizQuestions: number;
  completedAt: string; // ISO datetime
  quickChecksAnswered: number;
  totalQuickChecks: number;
  caseStudyTasksAnswered: number;
  totalCaseStudyTasks: number;
  reflectionsAnswered: number;
  totalReflections: number;
  bloomBreakdown?: {
    rememberUnderstand: { correct: number; total: number };
    apply: { correct: number; total: number };
    evaluate: { correct: number; total: number };
  };
}

