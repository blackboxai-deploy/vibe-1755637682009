export interface GeneratedImage {
  id: string;
  prompt: string;
  imageUrl: string;
  timestamp: number;
  style?: string;
  dimensions?: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  defaultStyle: string;
  defaultDimensions: string;
  systemPrompt: string;
}

const STORAGE_KEYS = {
  GENERATION_HISTORY: 'ai-image-generator-history',
  USER_PREFERENCES: 'ai-image-generator-preferences',
} as const;

const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'system',
  defaultStyle: 'photorealistic',
  defaultDimensions: '1024x1024',
  systemPrompt: 'You are an AI image generation assistant. Create detailed, high-quality images based on user prompts. Focus on artistic composition, proper lighting, and visual appeal. Interpret prompts creatively while maintaining the core requested elements. Generate images that are visually striking and professionally composed.',
};

export class StorageManager {
  static saveGeneratedImage(image: GeneratedImage): void {
    try {
      const history = this.getGenerationHistory();
      const updatedHistory = [image, ...history.slice(0, 49)]; // Keep last 50 images
      localStorage.setItem(STORAGE_KEYS.GENERATION_HISTORY, JSON.stringify(updatedHistory));
    } catch (error) {
      console.error('Failed to save generated image:', error);
    }
  }

  static getGenerationHistory(): GeneratedImage[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.GENERATION_HISTORY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load generation history:', error);
      return [];
    }
  }

  static clearGenerationHistory(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.GENERATION_HISTORY);
    } catch (error) {
      console.error('Failed to clear generation history:', error);
    }
  }

  static removeGeneratedImage(id: string): void {
    try {
      const history = this.getGenerationHistory();
      const updatedHistory = history.filter(image => image.id !== id);
      localStorage.setItem(STORAGE_KEYS.GENERATION_HISTORY, JSON.stringify(updatedHistory));
    } catch (error) {
      console.error('Failed to remove generated image:', error);
    }
  }

  static saveUserPreferences(preferences: Partial<UserPreferences>): void {
    try {
      const currentPreferences = this.getUserPreferences();
      const updatedPreferences = { ...currentPreferences, ...preferences };
      localStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(updatedPreferences));
    } catch (error) {
      console.error('Failed to save user preferences:', error);
    }
  }

  static getUserPreferences(): UserPreferences {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.USER_PREFERENCES);
      return stored ? { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) } : DEFAULT_PREFERENCES;
    } catch (error) {
      console.error('Failed to load user preferences:', error);
      return DEFAULT_PREFERENCES;
    }
  }

  static resetUserPreferences(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.USER_PREFERENCES);
    } catch (error) {
      console.error('Failed to reset user preferences:', error);
    }
  }

  static exportData(): string {
    try {
      const history = this.getGenerationHistory();
      const preferences = this.getUserPreferences();
      return JSON.stringify({ history, preferences }, null, 2);
    } catch (error) {
      console.error('Failed to export data:', error);
      return '{}';
    }
  }

  static importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      if (data.history && Array.isArray(data.history)) {
        localStorage.setItem(STORAGE_KEYS.GENERATION_HISTORY, JSON.stringify(data.history));
      }
      if (data.preferences && typeof data.preferences === 'object') {
        localStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(data.preferences));
      }
      return true;
    } catch (error) {
      console.error('Failed to import data:', error);
      return false;
    }
  }

  static getStorageUsage(): { used: number; available: number } {
    try {
      let used = 0;
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          used += localStorage[key].length + key.length;
        }
      }
      
      // Estimate available space (most browsers have ~5-10MB limit)
      const estimated = 5 * 1024 * 1024; // 5MB estimate
      return {
        used: used,
        available: Math.max(0, estimated - used)
      };
    } catch (error) {
      console.error('Failed to calculate storage usage:', error);
      return { used: 0, available: 0 };
    }
  }

  static cleanupOldImages(maxAge: number = 30 * 24 * 60 * 60 * 1000): void {
    try {
      const history = this.getGenerationHistory();
      const cutoffTime = Date.now() - maxAge;
      const filteredHistory = history.filter(image => image.timestamp > cutoffTime);
      
      if (filteredHistory.length !== history.length) {
        localStorage.setItem(STORAGE_KEYS.GENERATION_HISTORY, JSON.stringify(filteredHistory));
      }
    } catch (error) {
      console.error('Failed to cleanup old images:', error);
    }
  }
}

export const storage = StorageManager;