import { ModelConfig, GenerateRequest, GenerateResponse } from '../types';

// 后端 API 地址
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

export class ApiService {
  static async generateAvatar(
    config: ModelConfig,
    request: GenerateRequest
  ): Promise<GenerateResponse> {
    try {
      const url = `${BACKEND_URL}/api/generate`;
      
      // 调用后端代理接口，避免跨域问题
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          modelConfig: config,
          generateRequest: request
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        return {
          success: false,
          imageUrl: '',
          error: data.error || '生成失败，请检查配置'
        };
      }

      return {
        success: true,
        imageUrl: data.imageUrl
      };
    } catch (error) {
      console.error('API Error:', error);
      return {
        success: false,
        imageUrl: '',
        error: error instanceof Error ? error.message : '网络错误，请检查后端服务是否启动'
      };
    }
  }
}
