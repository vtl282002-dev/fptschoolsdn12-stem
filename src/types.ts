export type ChallengeType =
  | 'mouth_pucker'      // Chu môi
  | 'smile'             // Cười mỉm
  | 'grin'              // Cười lộ răng
  | 'wink_left'         // Nháy mắt trái
  | 'wink_right'        // Nháy mắt phải
  | 'eyes_closed'       // Nhắm hai mắt
  | 'mouth_open'        // Mở miệng
  | 'mouth_stretch'     // Há miệng to
  | 'head_shake'        // Lắc đầu trái/phải
  | 'head_nod'          // Gật đầu
  | 'cheek_puff'        // Phồng má
  | 'brow_raise';       // Nâng chân mày

export interface ChallengeInfo {
  id: ChallengeType;
  name: string;
  instruction: string;
  defaultScore: number;
  icon: string;
}

export interface Question {
  id: string;
  content: string;
  options: [string, string, string, string]; // A, B, C, D
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  explanation?: string;
  isConfirmed?: boolean;
}

export interface QuestionSet {
  id: string;
  name: string;
  grade: string;
  subject: string;
  status: 'saved' | 'draft';
  updatedAt: number;
  questions: Question[];
}

export interface TeacherAccount {
  id: string;
  username: string;
  name: string;
  title?: string;
  schoolName: string;
  password?: string;
  avatarColor?: string;
  puzzleImageUrl: string;
  puzzleImageNaturalWidth: number;
  puzzleImageNaturalHeight: number;
  requiredScores: Record<ChallengeType, number>;
  enabledChallenges: Record<ChallengeType, boolean>;
  countdownDuration: number;
  activeQuestionSetId: string;
  questionSets: QuestionSet[];
  schoolLogoUrl?: string;
  updatedAt: number;
}

export interface AppSettings {
  currentTeacherId?: string;
  countdownDuration: number;
  enabledChallenges: Record<ChallengeType, boolean>;
  randomChallenges: boolean;
  requiredScores: Record<ChallengeType, number>;
  activeQuestionSetId: string;
  puzzleImageUrl: string;
  puzzleImageNaturalWidth: number;
  puzzleImageNaturalHeight: number;
  schoolName: string;
  teacherName: string;
  schoolLogoUrl: string;
  bgmEnabled: boolean;
  sfxEnabled: boolean;
  reducedMotion: boolean;
  teacherPassword?: string;
}

export type GameSettings = AppSettings;

export interface FaceValidationResult {
  isValid: boolean;
  message: string;
  faceCount: number;
  brightness: number;
  boxSizeRatio: number; // relative size in frame
  isCentered: boolean;
}

export interface PuzzlePiece {
  id: number; // 0 to 8
  row: number; // 0, 1, 2
  col: number; // 0, 1, 2
  // Interlocking tabs: 1 = tab (protrusion), -1 = blank (hole), 0 = flat boundary
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface ActiveGamePiece {
  id: number; // 0 to 8
  row: number; // 0, 1, 2
  col: number; // 0, 1, 2
  config: PuzzlePiece;
  gameSessionId: string;
  imageVersion: string;
  dataUrl: string; // Direct sliced PNG dataUrl of the piece
  pathData: string; // SVG path data for border & clipping
}

export interface ActiveGameConfig {
  gameSessionId: string;
  imageVersion: string;
  puzzleSourceImage: string;
  puzzleImageNaturalWidth: number;
  puzzleImageNaturalHeight: number;
  puzzlePieces: ActiveGamePiece[];
  questionSet: QuestionSet;
  requiredScores: Record<ChallengeType, number>;
  enabledChallenges: Record<ChallengeType, boolean>;
  countdownDuration: number;
  schoolName: string;
  teacherName: string;
  schoolLogoUrl: string;
  createdAt: number;
}

export type GameScreen = 'home' | 'challenge' | 'question' | 'puzzle' | 'victory' | 'settings';
