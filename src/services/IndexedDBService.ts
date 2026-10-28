import { AppSettings, ChallengeType, QuestionSet, TeacherAccount } from '../types';
import { ALL_CHALLENGE_KEYS, CHALLENGE_DEFINITIONS } from '../data/challenges';
import { DEFAULT_QUESTION_SETS } from '../data/defaultQuestions';

const DB_NAME = 'FacePuzzleSTEM_DB';
const DB_VERSION = 4;

export interface StoredPuzzleImage {
  id: string; // 'puzzle_' + teacherId or 'active_puzzle'
  dataUrl: string;
  width: number;
  height: number;
  updatedAt: number;
}

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
  private imageMemoryCache: Map<string, { dataUrl: string; width: number; height: number }> = new Map();

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
        if (!db.objectStoreNames.contains('puzzleImages')) {
          db.createObjectStore('puzzleImages', { keyPath: 'id' });
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

  // ================= DEDICATED PUZZLE IMAGE STORAGE =================

  async deletePuzzleImage(teacherId?: string): Promise<void> {
    const targetId = teacherId || this.getActiveTeacherId();
    this.imageMemoryCache.delete(targetId);
    this.imageMemoryCache.delete('active');
    try {
      sessionStorage.removeItem(`fpt_stem_puzzle_img_${targetId}`);
      sessionStorage.removeItem('fpt_stem_puzzle_img_active');
      sessionStorage.removeItem(`fpt_stem_puzzle_dim_${targetId}`);
    } catch {}
    try {
      const db = await this.getDB();
      const tx = db.transaction('puzzleImages', 'readwrite');
      const store = tx.objectStore('puzzleImages');
      store.delete(`puzzle_${targetId}`);
      store.delete('active_puzzle');
    } catch {}
  }

  async savePuzzleImage(
    teacherId: string,
    dataUrl: string,
    width: number = 1200,
    height: number = 800
  ): Promise<void> {
    if (!dataUrl || dataUrl === '/assets/default_puzzle.svg') {
      await this.deletePuzzleImage(teacherId);
      return;
    }

    // 1. Update in-memory cache
    this.imageMemoryCache.set(teacherId, { dataUrl, width, height });
    this.imageMemoryCache.set('active', { dataUrl, width, height });

    // 2. Try sessionStorage fallback (for session persistence even if IndexedDB is slow)
    try {
      if (dataUrl.length < 2500000) {
        sessionStorage.setItem(`fpt_stem_puzzle_img_${teacherId}`, dataUrl);
        sessionStorage.setItem('fpt_stem_puzzle_img_active', dataUrl);
        sessionStorage.setItem(`fpt_stem_puzzle_dim_${teacherId}`, JSON.stringify({ width, height }));
      }
    } catch {}

    // 3. Persist in IndexedDB puzzleImages object store
    try {
      const db = await this.getDB();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction('puzzleImages', 'readwrite');
        const store = tx.objectStore('puzzleImages');

        const record: StoredPuzzleImage = {
          id: `puzzle_${teacherId}`,
          dataUrl,
          width,
          height,
          updatedAt: Date.now()
        };
        store.put(record);

        // Also save as active general custom image
        store.put({
          id: 'active_puzzle',
          dataUrl,
          width,
          height,
          updatedAt: Date.now()
        });

        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch (err) {
      console.warn('Could not save to puzzleImages store in IndexedDB:', err);
    }
  }

  async getPuzzleImage(
    teacherId?: string
  ): Promise<{ dataUrl: string; width: number; height: number } | null> {
    const targetId = teacherId || this.getActiveTeacherId();

    // 1. Check in-memory cache
    if (this.imageMemoryCache.has(targetId)) {
      return this.imageMemoryCache.get(targetId)!;
    }
    if (!teacherId && this.imageMemoryCache.has('active')) {
      return this.imageMemoryCache.get('active')!;
    }

    // 2. Check IndexedDB
    try {
      const db = await this.getDB();
      const record = await new Promise<StoredPuzzleImage | null>((resolve) => {
        const tx = db.transaction('puzzleImages', 'readonly');
        const store = tx.objectStore('puzzleImages');

        const req = store.get(`puzzle_${targetId}`);
        req.onsuccess = () => {
          if (req.result && req.result.dataUrl) {
            resolve(req.result);
          } else if (!teacherId) {
            // Only fallback to active_puzzle if teacherId wasn't specified
            const reqActive = store.get('active_puzzle');
            reqActive.onsuccess = () => resolve(reqActive.result || null);
            reqActive.onerror = () => resolve(null);
          } else {
            resolve(null);
          }
        };
        req.onerror = () => resolve(null);
      });

      if (record && record.dataUrl) {
        this.imageMemoryCache.set(targetId, {
          dataUrl: record.dataUrl,
          width: record.width || 1200,
          height: record.height || 800
        });
        return {
          dataUrl: record.dataUrl,
          width: record.width || 1200,
          height: record.height || 800
        };
      }
    } catch {
      // ignore
    }

    // 3. Check sessionStorage fallback
    try {
      const stored =
        sessionStorage.getItem(`fpt_stem_puzzle_img_${targetId}`) ||
        (!teacherId ? sessionStorage.getItem('fpt_stem_puzzle_img_active') : null);
      if (stored) {
        let width = 1200;
        let height = 800;
        try {
          const dim = sessionStorage.getItem(`fpt_stem_puzzle_dim_${targetId}`);
          if (dim) {
            const parsed = JSON.parse(dim);
            width = parsed.width || width;
            height = parsed.height || height;
          }
        } catch {}
        this.imageMemoryCache.set(targetId, { dataUrl: stored, width, height });
        return { dataUrl: stored, width, height };
      }
    } catch {}

    return null;
  }

  // ================= TEACHER PERSONALIZATION =================

  async getTeachers(): Promise<TeacherAccount[]> {
    let list: TeacherAccount[] = [];

    // 1. Try IndexedDB
    try {
      const db = await this.getDB();
      list = await new Promise<TeacherAccount[]>((resolve) => {
        const tx = db.transaction('teachers', 'readonly');
        const store = tx.objectStore('teachers');
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve([]);
      });
    } catch {
      // ignore
    }

    // 2. Try localStorage if IndexedDB had no records
    if (!list || list.length === 0) {
      try {
        const local = localStorage.getItem('fpt_stem_teachers');
        if (local) {
          const parsed = JSON.parse(local);
          if (Array.isArray(parsed) && parsed.length > 0) {
            list = parsed;
          }
        }
      } catch {
        // ignore
      }
    }

    // 3. If still empty, seed defaults
    if (!list || list.length === 0) {
      await this.seedDefaultTeachers();
      list = [...DEFAULT_TEACHERS];
    }

    // 4. Hydrate custom images for each teacher
    for (const teacher of list) {
      const customImg = await this.getPuzzleImage(teacher.id);
      if (customImg && customImg.dataUrl) {
        teacher.puzzleImageUrl = customImg.dataUrl;
        teacher.puzzleImageNaturalWidth = customImg.width;
        teacher.puzzleImageNaturalHeight = customImg.height;
      }
    }

    return list;
  }

  private async seedDefaultTeachers(): Promise<void> {
    try {
      const db = await this.getDB();
      await new Promise<void>((resolve) => {
        const tx = db.transaction('teachers', 'readwrite');
        const store = tx.objectStore('teachers');
        for (const t of DEFAULT_TEACHERS) {
          store.put(t);
        }
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      });
    } catch {
      // fallback handled
    }

    try {
      localStorage.setItem('fpt_stem_teachers', JSON.stringify(DEFAULT_TEACHERS));
    } catch {}
  }

  async getTeacher(id: string): Promise<TeacherAccount | null> {
    const list = await this.getTeachers();
    const found = list.find((t) => t.id === id);
    if (!found) return null;

    const customImg = await this.getPuzzleImage(id);
    if (customImg && customImg.dataUrl) {
      found.puzzleImageUrl = customImg.dataUrl;
      found.puzzleImageNaturalWidth = customImg.width;
      found.puzzleImageNaturalHeight = customImg.height;
    }
    return found;
  }

  async saveTeacher(teacher: TeacherAccount): Promise<void> {
    const updatedTeacher: TeacherAccount = { ...teacher, updatedAt: Date.now() };

    // 1. If teacher has a custom puzzle image, persist in dedicated puzzleImages store
    if (
      updatedTeacher.puzzleImageUrl &&
      (updatedTeacher.puzzleImageUrl.startsWith('data:') ||
        updatedTeacher.puzzleImageUrl.startsWith('blob:') ||
        updatedTeacher.puzzleImageUrl.startsWith('http'))
    ) {
      await this.savePuzzleImage(
        updatedTeacher.id,
        updatedTeacher.puzzleImageUrl,
        updatedTeacher.puzzleImageNaturalWidth || 1200,
        updatedTeacher.puzzleImageNaturalHeight || 800
      );
    } else if (updatedTeacher.puzzleImageUrl === '/assets/default_puzzle.svg') {
      await this.deletePuzzleImage(updatedTeacher.id);
    }

    // 2. Persist in IndexedDB teachers store and await completion
    try {
      const db = await this.getDB();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction('teachers', 'readwrite');
        const store = tx.objectStore('teachers');
        store.put(updatedTeacher);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch (err) {
      console.warn('IndexedDB saveTeacher error:', err);
    }

    // 3. Safe localStorage backup (sanitize large data URL to avoid QuotaExceededError)
    try {
      const rawList = await this.getTeachers();
      const idx = rawList.findIndex((t) => t.id === teacher.id);
      let updatedList: TeacherAccount[];
      if (idx >= 0) {
        updatedList = [...rawList];
        updatedList[idx] = updatedTeacher;
      } else {
        updatedList = [...rawList, updatedTeacher];
      }

      // Safe clone for localStorage: replace massive data URLs with pointer
      const safeList = updatedList.map((t) => {
        if (t.puzzleImageUrl && t.puzzleImageUrl.length > 150000) {
          return { ...t, puzzleImageUrl: `indexeddb:puzzle_${t.id}` };
        }
        return t;
      });
      localStorage.setItem('fpt_stem_teachers', JSON.stringify(safeList));
    } catch (e) {
      console.warn('localStorage quota handled in saveTeacher:', e);
    }
  }

  async deleteTeacher(id: string): Promise<void> {
    const list = await this.getTeachers();
    const updated = list.filter((t) => t.id !== id);

    try {
      const db = await this.getDB();
      const tx = db.transaction('teachers', 'readwrite');
      const store = tx.objectStore('teachers');
      store.delete(id);
    } catch {}

    try {
      localStorage.setItem('fpt_stem_teachers', JSON.stringify(updated));
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
    let found = teachers.find((t) => t.id === activeId);
    if (!found) {
      found = teachers[0] || DEFAULT_TEACHERS[0];
    }

    // Ensure custom image is hydrated
    const customImg = await this.getPuzzleImage(found.id);
    if (customImg && customImg.dataUrl) {
      found.puzzleImageUrl = customImg.dataUrl;
      found.puzzleImageNaturalWidth = customImg.width;
      found.puzzleImageNaturalHeight = customImg.height;
    }

    return found;
  }

  // ================= SETTINGS =================

  async getSettings(): Promise<AppSettings> {
    // Look up active teacher's personalized settings
    const activeTeacher = await this.getActiveTeacher();
    const customImg = await this.getPuzzleImage(activeTeacher.id);

    const normalizeScores = (scores: Record<string, number> = {}) => {
      const merged = {
        ...DEFAULT_REQUIRED_SCORES,
        ...(activeTeacher.requiredScores || {}),
        ...scores
      };
      if (!merged.mouth_pucker || merged.mouth_pucker === 100 || merged.mouth_pucker > 50) {
        merged.mouth_pucker = 50;
      }
      if (!merged.cheek_puff || merged.cheek_puff === 70 || merged.cheek_puff > 50) {
        merged.cheek_puff = 50;
      }
      if (!merged.wink_left || merged.wink_left > 20) {
        merged.wink_left = 20;
      }
      if (!merged.wink_right || merged.wink_right > 20) {
        merged.wink_right = 20;
      }
      return merged;
    };

    // Determine the definitive puzzle image URL without reverting custom images
    let effectiveImageUrl = DEFAULT_SETTINGS.puzzleImageUrl;
    if (customImg?.dataUrl && customImg.dataUrl !== '/assets/default_puzzle.svg') {
      effectiveImageUrl = customImg.dataUrl;
    } else if (
      activeTeacher.puzzleImageUrl &&
      !activeTeacher.puzzleImageUrl.startsWith('indexeddb:') &&
      activeTeacher.puzzleImageUrl !== '/assets/default_puzzle.svg'
    ) {
      effectiveImageUrl = activeTeacher.puzzleImageUrl;
    }

    const effectiveWidth =
      customImg?.width || activeTeacher.puzzleImageNaturalWidth || 1200;
    const effectiveHeight =
      customImg?.height || activeTeacher.puzzleImageNaturalHeight || 800;

    const baseSettings: AppSettings = {
      ...DEFAULT_SETTINGS,
      currentTeacherId: activeTeacher.id,
      teacherName: activeTeacher.name,
      schoolName: activeTeacher.schoolName,
      puzzleImageUrl: effectiveImageUrl,
      puzzleImageNaturalWidth: effectiveWidth,
      puzzleImageNaturalHeight: effectiveHeight,
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
            const dbSettings = req.result;
            let finalImageUrl = effectiveImageUrl;
            if (
              effectiveImageUrl === DEFAULT_SETTINGS.puzzleImageUrl &&
              dbSettings.puzzleImageUrl &&
              !dbSettings.puzzleImageUrl.startsWith('indexeddb:') &&
              dbSettings.puzzleImageUrl !== '/assets/default_puzzle.svg'
            ) {
              finalImageUrl = dbSettings.puzzleImageUrl;
            }

            resolve({
              ...baseSettings,
              ...dbSettings,
              currentTeacherId: activeTeacher.id,
              teacherName: activeTeacher.name,
              schoolName: activeTeacher.schoolName,
              puzzleImageUrl: finalImageUrl,
              puzzleImageNaturalWidth: effectiveWidth,
              puzzleImageNaturalHeight: effectiveHeight,
              requiredScores: normalizeScores(dbSettings.requiredScores)
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
    const currentTeacherId = settings.currentTeacherId || this.getActiveTeacherId();

    // 1. If settings contains a custom puzzle image, save to dedicated puzzleImages store
    if (
      settings.puzzleImageUrl &&
      (settings.puzzleImageUrl.startsWith('data:') ||
        settings.puzzleImageUrl.startsWith('blob:') ||
        settings.puzzleImageUrl.startsWith('http'))
    ) {
      await this.savePuzzleImage(
        currentTeacherId,
        settings.puzzleImageUrl,
        settings.puzzleImageNaturalWidth || 1200,
        settings.puzzleImageNaturalHeight || 800
      );
    } else if (settings.puzzleImageUrl === '/assets/default_puzzle.svg') {
      await this.deletePuzzleImage(currentTeacherId);
    }

    // 2. Persist in IndexedDB settings and update teacher record atomically
    try {
      const db = await this.getDB();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(['settings', 'teachers'], 'readwrite');
        const store = tx.objectStore('settings');
        store.put(settings, 'app_settings');

        const teacherStore = tx.objectStore('teachers');
        const getReq = teacherStore.get(currentTeacherId);
        getReq.onsuccess = () => {
          if (getReq.result) {
            const teacher = getReq.result;
            teacher.puzzleImageUrl = settings.puzzleImageUrl;
            teacher.puzzleImageNaturalWidth = settings.puzzleImageNaturalWidth;
            teacher.puzzleImageNaturalHeight = settings.puzzleImageNaturalHeight;
            teacher.requiredScores = settings.requiredScores;
            teacher.enabledChallenges = settings.enabledChallenges;
            teacher.countdownDuration = settings.countdownDuration;
            teacher.schoolName = settings.schoolName;
            teacher.name = settings.teacherName;
            teacher.updatedAt = Date.now();
            teacherStore.put(teacher);
          }
        };

        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch (err) {
      console.warn('IndexedDB saveSettings error:', err);
    }

    // 3. Safe localStorage backup (safe against QuotaExceededError)
    try {
      if (settings.requiredScores) {
        localStorage.setItem('fpt_stem_challenge_scores', JSON.stringify(settings.requiredScores));
      }

      const safeSettings = { ...settings };
      if (safeSettings.puzzleImageUrl && safeSettings.puzzleImageUrl.length > 150000) {
        safeSettings.puzzleImageUrl = `indexeddb:puzzle_${currentTeacherId}`;
      }
      localStorage.setItem('app_settings', JSON.stringify(safeSettings));
    } catch (err) {
      console.warn('localStorage quota handled in saveSettings:', err);
    }
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
