export class ImageProcessor {
  static async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result);
      };
      
      reader.onerror = () => {
        reject(new Error('文件读取失败'));
      };
      
      reader.readAsDataURL(file);
    });
  }

  static validateImage(file: File): { valid: boolean; error?: string } {
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
      return {
        valid: false,
        error: '仅支持 JPG 和 PNG 格式'
      };
    }

    if (file.size > maxSize) {
      return {
        valid: false,
        error: '图片大小不能超过 5MB'
      };
    }

    return { valid: true };
  }

  static async loadImageFromUrl(url: string): Promise<string> {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  static async loadReferenceImage(path: string): Promise<string> {
    try {
      return await this.loadImageFromUrl(path);
    } catch (error) {
      console.error('Failed to load reference image:', error);
      throw new Error('加载参考图片失败，请确保 refer_avatar.jpg 存在于 public 目录');
    }
  }
}
