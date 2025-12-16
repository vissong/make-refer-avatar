export interface ModelConfig {
  baseURL: string;
  apiToken: string;
  modelName: string;
}

export interface BackgroundConfig {
  type: 'color' | 'auto';
  color?: string;
  elements?: string;
}

export interface GenerateRequest {
  userImage: string;      // base64
  referenceImage: string; // base64
  background: BackgroundConfig;
}

export interface GenerateResponse {
  imageUrl: string;
  success: boolean;
  error?: string;
}
