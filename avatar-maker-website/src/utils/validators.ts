import { ModelConfig } from '../types';

export class Validators {
  static validateModelConfig(config: Partial<ModelConfig>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!config.baseURL || config.baseURL.trim() === '') {
      errors.push('API 地址不能为空');
    } else if (!this.isValidUrl(config.baseURL)) {
      errors.push('API 地址格式不正确');
    }

    if (!config.apiToken || config.apiToken.trim() === '') {
      errors.push('API Token 不能为空');
    }

    if (!config.modelName || config.modelName.trim() === '') {
      errors.push('模型名称不能为空');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  static isValidUrl(url: string): boolean {
    const pattern = /^https?:\/\/.+/i;
    return pattern.test(url);
  }

  static isValidColor(color: string): boolean {
    const hexPattern = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    return hexPattern.test(color);
  }
}
