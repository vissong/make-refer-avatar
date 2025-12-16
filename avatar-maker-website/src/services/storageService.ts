import { ModelConfig } from '../types';

const STORAGE_KEY = 'avatar_maker_model_config';

export class StorageService {
  static saveModelConfig(config: ModelConfig): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  }

  static loadModelConfig(): ModelConfig | null {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return null;
    
    const parsed = JSON.parse(data);
    return parsed;
  }

  static clearModelConfig(): void {
    localStorage.removeItem(STORAGE_KEY);
  }

  static hasConfig(): boolean {
    return localStorage.getItem(STORAGE_KEY) !== null;
  }
}
