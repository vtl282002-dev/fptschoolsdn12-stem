import { AppSettings, ChallengeType, QuestionSet, TeacherAccount } from '../types';
import { ALL_CHALLENGE_KEYS, CHALLENGE_DEFINITIONS } from '../data/challenges';
import { DEFAULT_QUESTION_SETS } from '../data/defaultQuestions';

const DB_NAME = 'FacePuzzleSTEM_DB';
const DB_VERSION = 2;

export const DEFAULT_REQUIRED_SCORES: Record<ChallengeType, number> = {
  mouth_pucker: 50,
  cheek_puff: 50,
  wink_left: 20,
  wink_right: 20,
  smile: 50,
  grin: 40,
  eyes_closed: 70,
  mouth_open: 60,
  mouth_stretch: 75,
  head_shake: 65,
  head_nod: 65,
  brow_raise: 65
};

export const DEFAULT_TEACHERS: TeacherAccount[] = [
  {
    id: 'teacher_thao',
    username: 'gv_thao',
    name: 'Cô Nguyễn Phương Thảo',
    title: 'Chủ nhiệm CLB STEM & Sáng tạo Khoa học',
    schoolName: 'Tiểu học FPT Schools',
    password: '123',
    avatarColor: '#059669',
    puzzleImageUrl: '/assets/default_puzzle.svg',
    puzzleImageNaturalWidth: 1200,
    puzzleImageNaturalHeight: 800,
    requiredScores: { ...DEFAULT_REQUIRED_SCORES },
    enabledChallenges: ALL_CHALLENGE_KEYS.reduce((acc, k) => {
      acc[k] = true;
      return acc;
    }, {} as Record<ChallengeType, boolean>),
    countdownDuration: 3,
    activeQuestionSetId: 'set_stem_primary',
    questionSets: DEFAULT_QUESTION_SETS,
    schoolLogoUrl: '/assets/fpt_schools_logo.svg',
    updatedAt: Date.now()
  },
  {
    id: 'teacher_minh',
    username: 'gv_minh',
    name: 'Thầy Trần Tuấn Minh',
    title: 'Giáo viên Robotics & Trí tuệ Nhân tạo',
    schoolName: 'FPT Schools Cầu Giấy',
    password: '123',
    avatarColor: '#0284c7',
    puzzleImageUrl: '/assets/default_puzzle.svg',
    puzzleImageNaturalWidth: 1200,
    puzzleImageNaturalHeight: 800,
    requiredScores: { ...DEFAULT_REQUIRED_SCORES },
    enabledChallenges: ALL_CHALLENGE_KEYS.reduce((acc, k) => {
      acc[k] = true;
      return acc;
    }, {} as Record<ChallengeType, boolean>),
    countdownDuration: 3,
    activeQuestionSetId: 'set_stem_future',
    questionSets: DEFAULT_QUESTION_SETS,
    schoolLogoUrl: '/assets/fpt_schools_logo.svg',
    updatedAt: Date.now()
  }
];

export const DEFAULT_SETTINGS: AppSettings = {
  currentTeacherId: 'teacher_thao',
  countdownDuration: 3,
  enabledChallenges: ALL_CHALLENGE_KEYS.reduce((acc, key) => {
    acc[key] = true;
    return acc;
  }, {} as Record<ChallengeType, boolean>),
  randomChallenges: true,
  requiredScores: { ...DEFAULT_REQUIRED_SCORES },
  activeQuestionSetId: 'set_stem_primary',
  puzzleImageUrl: '/assets/default_puzzle.svg',
  puzzleImageNaturalWidth: 1200,
  puzzleImageNaturalHeight: 800,
  schoolName: 'Tiểu học FPT Schools',
  teacherName: 'Cô Nguyễn Phương Thảo',
  schoolLogoUrl: '/assets/fpt_schools_logo.svg',
  bgmEnabled: true,
  sfxEnabled: true,
  reducedMotion: false,
  teacherPassword: '123'
};

class IndexedDBService {
  private dbPromise: Promise<IDBDatabase> | null = null;

  private getDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        reject(new Error('IndexedDB not supported'));
        return;
      }

      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings');
        }
        if (!db.objectStoreNames.contains('questionSets')) {
          db.createObjectStore('questionSets', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('teachers')) {
          db.createObjectStore('teachers', { keyPath: 'id' });
        }
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });

    return this.dbPromise;
  }

  // ================= TEACHER PERSONALIZATION =================

  async getTeachers(): Promise<TeacherAccount[]> {
    // 1. Try IndexedDB
    try {
      const db = await this.getDB();
      const list = await new Promise<TeacherAccount[]>((resolve) => {
        const tx = db.transaction('teachers', 'readonly');
        const store = tx.objectStore('teachers');
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve([]);
      });

      if (list && list.length > 0) {
        return list;
      }
    } catch {
      // ignore
    }

    // 2. Try localStorage
    try {
      const local = localStorage.getItem('fpt_stem_teachers');
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }

    // 3. Seed default teachers
    await this.seedDefaultTeachers();
    return DEFAULT_TEACHERS;
  }

  private async seedDefaultTeachers(): Promise<void> {
    try {
      localStorage.setItem('fpt_stem_teachers', JSON.stringify(DEFAULT_TEACHERS));
      const db = await this.getDB();
      const tx = db.transaction('teachers', 'readwrite');
      const store = tx.objectStore('teachers');
      for (const t of DEFAULT_TEACHERS) {
        store.put(t);
      }
    } catch {
      // fallback handled
    }
  }

  async getTeacher(id: string): Promise<TeacherAccount | null> {
    const list = await this.getTeachers();
    return list.find((t) => t.id === id) || null;
  }

  async saveTeacher(teacher: TeacherAccount): Promise<void> {
    const list = await this.getTeachers();
    const idx = list.findIndex((t) => t.id === teacher.id);
    let updated: TeacherAccount[];
    if (idx >= 0) {
      updated = [...list];
      updated[idx] = { ...teacher, updatedAt: Date.now() };
    } else {
      updated = [...list, { ...teacher, updatedAt: Date.now() }];
    }

    try {
      localStorage.setItem('fpt_stem_teachers', JSON.stringify(updated));
    } catch {}

    try {
      const db = await this.getDB();
      const tx = db.transaction('teachers', 'readwrite');
      const store = tx.objectStore('teachers');
      store.put({ ...teacher, updatedAt: Date.now() });
    } catch {}
  }

  async deleteTeacher(id: string): Promise<void> {
    const list = await this.getTeachers();
    const updated = list.filter((t) => t.id !== id);
    try {
      localStorage.setItem('fpt_stem_teachers', JSON.stringify(updated));
    } catch {}

    try {
      const db = await this.getDB();
      const tx = db.transaction('teachers', 'readwrite');
      const store = tx.objectStore('teachers');
      store.delete(id);
    } catch {}
  }

  getActiveTeacherId(): string {
    try {
      const stored = localStorage.getItem('fpt_stem_active_teacher_id');
      if (stored) return stored;
    } catch {}
    return 'teacher_thao';
  }

  setActiveTeacherId(id: string): void {
    try {
      localStorage.setItem('fpt_stem_active_teacher_id', id);
    } catch {}
  }

  async getActiveTeacher(): Promise<TeacherAccount> {
    const activeId = this.getActiveTeacherId();
    const teachers = await this.getTeachers();
    const found = teachers.find((t) => t.id === activeId);
    if (found) return found;
    return teachers[0] || DEFAULT_TEACHERS[0];
  }

  // ================= SETTINGS =================

  async getSettings(): Promise<AppSettings> {
    // Look up active teacher's personalized settings
    const activeTeacher = await this.getActiveTeacher();

    const normalizeScores = (scores: Record<string, number> = {}) => {
      const merged = {
        ...DEFAULT_REQUIRED_SCORES,
        ...(activeTeacher.requiredScores || {}),
        ...scores
      };
      // Enforce 50 points target score for mouth_pucker if needed
      if (!merged.mouth_pucker || merged.mouth_pucker === 100 || merged.mouth_pucker > 50) {
        merged.mouth_pucker = 50;
      }
      // Enforce 50 points target score for cheek_puff
      if (!merged.cheek_puff || merged.cheek_puff === 70 || merged.cheek_puff > 50) {
        merged.cheek_puff = 50;
      }
      // Enforce 20 points target score for wink_left and wink_right
      if (!merged.wink_left || merged.wink_left > 20) {
        merged.wink_left = 20;
      }
      if (!merged.wink_right || merged.wink_right > 20) {
        merged.wink_right = 20;
      }
      return merged;
    };

    const baseSettings: AppSettings = {
      ...DEFAULT_SETTINGS,
      currentTeacherId: activeTeacher.id,
      teacherName: activeTeacher.name,
      schoolName: activeTeacher.schoolName,
      puzzleImageUrl: activeTeacher.puzzleImageUrl || DEFAULT_SETTINGS.puzzleImageUrl,
      puzzleImageNaturalWidth: activeTeacher.puzzleImageNaturalWidth || 1200,
      puzzleImageNaturalHeight: activeTeacher.puzzleImageNaturalHeight || 800,
      requiredScores: normalizeScores(activeTeacher.requiredScores),
      enabledChallenges: activeTeacher.enabledChallenges || DEFAULT_SETTINGS.enabledChallenges,
      countdownDuration: activeTeacher.countdownDuration || 3,
      activeQuestionSetId: activeTeacher.activeQuestionSetId || 'set_stem_primary',
      teacherPassword: activeTeacher.password || '123'
    };

    try {
      const db = await this.getDB();
      return new Promise((resolve) => {
        const tx = db.transaction('settings', 'readonly');
        const store = tx.objectStore('settings');
        const req = store.get('app_settings');
        req.onsuccess = () => {
          if (req.result) {
            resolve({
              ...baseSettings,
              ...req.result,
              teacherName: activeTeacher.name,
              schoolName: activeTeacher.schoolName,
              puzzleImageUrl: activeTeacher.puzzleImageUrl || req.result.puzzleImageUrl,
              requiredScores: normalizeScores(req.result.requiredScores)
            });
          } else {
            resolve(baseSettings);
          }
        };
        req.onerror = () => resolve(baseSettings);
      });
    } catch {
      return baseSettings;
    }
  }

  async saveSettings(settings: AppSettings): Promise<void> {
    try {
      localStorage.setItem('app_settings', JSON.stringify(settings));
      if (settings.requiredScores) {
        localStorage.setItem('fpt_stem_challenge_scores', JSON.stringify(settings.requiredScores));
      }
      const db = await this.getDB();
      const tx = db.transaction('settings', 'readwrite');
      const store = tx.objectStore('settings');
      store.put(settings, 'app_settings');
    } catch {}
  }

  // ================= QUESTION SETS =================

  async getQuestionSets(): Promise<QuestionSet[]> {
    const activeTeacher = await this.getActiveTeacher();
    if (activeTeacher.questionSets && activeTeacher.questionSets.length > 0) {
      return activeTeacher.questionSets;
    }

    try {
      const db = await this.getDB();
      return new Promise((resolve) => {
        const tx = db.transaction('questionSets', 'readonly');
        const store = tx.objectStore('questionSets');
        const req = store.getAll();
        req.onsuccess = () => {
          if (req.result && req.result.length > 0) {
            resolve(req.result);
          } else {
            this.seedDefaultQuestionSets().then(resolve);
          }
        };
        req.onerror = () => resolve(DEFAULT_QUESTION_SETS);
      });
    } catch {
      return DEFAULT_QUESTION_SETS;
    }
  }

  private async seedDefaultQuestionSets(): Promise<QuestionSet[]> {
    try {
      const db = await this.getDB();
      const tx = db.transaction('questionSets', 'readwrite');
      const store = tx.objectStore('questionSets');
      for (const set of DEFAULT_QUESTION_SETS) {
        store.put(set);
      }
      await new Promise((res) => {
        tx.oncomplete = res;
      });
      return DEFAULT_QUESTION_SETS;
    } catch {
      return DEFAULT_QUESTION_SETS;
    }
  }

  async saveQuestionSet(set: QuestionSet): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('questionSets', 'readwrite');
      const store = tx.objectStore('questionSets');
      const req = store.put(set);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  async saveQuestionSets(sets: QuestionSet[]): Promise<void> {
    // Also save to active teacher's account
    try {
      const activeTeacher = await this.getActiveTeacher();
      activeTeacher.questionSets = sets;
      await this.saveTeacher(activeTeacher);
    } catch {}

    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('questionSets', 'readwrite');
      const store = tx.objectStore('questionSets');
      store.clear();
      sets.forEach((s) => store.put(s));
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async deleteQuestionSet(id: string): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('questionSets', 'readwrite');
      const store = tx.objectStore('questionSets');
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }
}

export const dbService = new IndexedDBService();
export const indexedDBService = dbService;
