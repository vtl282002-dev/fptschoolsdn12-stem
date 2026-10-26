import { AppSettings, ChallengeType, QuestionSet } from '../types';
import { ALL_CHALLENGE_KEYS, CHALLENGE_DEFINITIONS } from '../data/challenges';
import { DEFAULT_QUESTION_SETS } from '../data/defaultQuestions';

const DB_NAME = 'FacePuzzleSTEM_DB';
const DB_VERSION = 1;

export const DEFAULT_SETTINGS: AppSettings = {
  countdownDuration: 3,
  enabledChallenges: ALL_CHALLENGE_KEYS.reduce((acc, key) => {
    acc[key] = true;
    return acc;
  }, {} as Record<ChallengeType, boolean>),
  randomChallenges: true,
  requiredScores: ALL_CHALLENGE_KEYS.reduce((acc, key) => {
    acc[key] = CHALLENGE_DEFINITIONS[key]?.defaultScore ?? 65;
    return acc;
  }, {} as Record<ChallengeType, number>),
  activeQuestionSetId: 'set_stem_primary',
  puzzleImageUrl: '/assets/default_puzzle.svg',
  puzzleImageNaturalWidth: 1200,
  puzzleImageNaturalHeight: 800,
  schoolName: 'FPT SCHOOLS',
  teacherName: 'Ban Cố Vấn STEM',
  schoolLogoUrl: '/assets/fpt_schools_logo.svg',
  bgmEnabled: true,
  sfxEnabled: true,
  reducedMotion: false,
  teacherPassword: '123456'
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

  // Settings
  async getSettings(): Promise<AppSettings> {
    // Check localStorage custom score overrides first for guaranteed persistence
    let customScoresBackup: Record<ChallengeType, number> = {} as any;
    try {
      const storedScores = localStorage.getItem('fpt_stem_challenge_scores');
      if (storedScores) {
        customScoresBackup = JSON.parse(storedScores);
      }
    } catch {
      // ignore
    }

    const normalizeScores = (scores: Record<string, number> = {}) => {
      const merged = {
        ...DEFAULT_SETTINGS.requiredScores,
        ...scores,
        ...customScoresBackup
      };
      // Enforce 50 points for mouth_pucker as requested
      if (!merged.mouth_pucker || merged.mouth_pucker === 100 || merged.mouth_pucker > 50) {
        merged.mouth_pucker = 50;
      }
      // Enforce 50 points for cheek_puff as requested
      if (!merged.cheek_puff || merged.cheek_puff === 70 || merged.cheek_puff > 50) {
        merged.cheek_puff = 50;
      }
      // Enforce 20 points for wink_left and wink_right as requested
      if (!merged.wink_left || merged.wink_left === 80 || merged.wink_left > 20) {
        merged.wink_left = 20;
      }
      if (!merged.wink_right || merged.wink_right === 80 || merged.wink_right > 20) {
        merged.wink_right = 20;
      }
      return merged;
    };

    try {
      const db = await this.getDB();
      return new Promise((resolve) => {
        const tx = db.transaction('settings', 'readonly');
        const store = tx.objectStore('settings');
        const req = store.get('app_settings');
        req.onsuccess = () => {
          if (req.result) {
            // merge with default settings so any newly added keys are populated
            resolve({
              ...DEFAULT_SETTINGS,
              ...req.result,
              requiredScores: normalizeScores(req.result.requiredScores),
              enabledChallenges: {
                ...DEFAULT_SETTINGS.enabledChallenges,
                ...(req.result.enabledChallenges || {})
              }
            });
          } else {
            resolve({
              ...DEFAULT_SETTINGS,
              requiredScores: normalizeScores()
            });
          }
        };
        req.onerror = () => {
          // fallback to localStorage
          const local = localStorage.getItem('app_settings');
          if (local) {
            try {
              const parsed = JSON.parse(local);
              resolve({
                ...DEFAULT_SETTINGS,
                ...parsed,
                requiredScores: normalizeScores(parsed.requiredScores)
              });
              return;
            } catch {
              // ignore
            }
          }
          resolve({
            ...DEFAULT_SETTINGS,
            requiredScores: normalizeScores()
          });
        };
      });
    } catch {
      // Fallback
      const local = localStorage.getItem('app_settings');
      if (local) {
        try {
          const parsed = JSON.parse(local);
          return {
            ...DEFAULT_SETTINGS,
            ...parsed,
            requiredScores: normalizeScores(parsed.requiredScores)
          };
        } catch {
          // ignore
        }
      }
      return {
        ...DEFAULT_SETTINGS,
        requiredScores: normalizeScores()
      };
    }
  }

  async saveSettings(settings: AppSettings): Promise<void> {
    try {
      localStorage.setItem('app_settings', JSON.stringify(settings));
      if (settings.requiredScores) {
        localStorage.setItem('fpt_stem_challenge_scores', JSON.stringify(settings.requiredScores));
      }
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('settings', 'readwrite');
        const store = tx.objectStore('settings');
        const req = store.put(settings, 'app_settings');
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch {
      // localstorage was already updated
    }
  }

  // Question Sets
  async getQuestionSets(): Promise<QuestionSet[]> {
    try {
      const db = await this.getDB();
      return new Promise((resolve) => {
        const tx = db.transaction('questionSets', 'readonly');
        const store = tx.objectStore('questionSets');
        const req = store.getAll();
        req.onsuccess = () => {
          if (req.result && req.result.length > 0) {
            // Always ensure set_stem_primary is refreshed with user's latest 10 questions
            const updated = req.result.map((s: QuestionSet) =>
              s.id === 'set_stem_primary' ? DEFAULT_QUESTION_SETS[0] : s
            );
            if (!updated.some((s: QuestionSet) => s.id === 'set_stem_primary')) {
              updated.unshift(DEFAULT_QUESTION_SETS[0]);
            }
            this.saveQuestionSet(DEFAULT_QUESTION_SETS[0]).catch(() => {});
            resolve(updated);
          } else {
            // Seed default sets
            this.seedDefaultQuestionSets().then(resolve);
          }
        };
        req.onerror = () => {
          resolve(DEFAULT_QUESTION_SETS);
        };
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
