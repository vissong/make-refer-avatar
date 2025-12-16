import { useState } from 'react';
import { Download, Loader2, ImageIcon } from 'lucide-react';

interface AvatarGeneratorProps {
  generatedImage: string;
  isGenerating: boolean;
  error: string;
}

export function AvatarGenerator({ generatedImage, isGenerating, error }: AvatarGeneratorProps) {
  const [isZoomed, setIsZoomed] = useState(false);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `avatar-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-lg font-semibold text-slate-200">生成结果</h3>
      
      <div className="relative w-[500px] h-[500px] bg-slate-800/50 backdrop-blur-sm rounded-xl border-2 border-dashed border-slate-600 overflow-hidden">
        {isGenerating ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
            <div className="relative">
              <Loader2 className="w-16 h-16 text-indigo-400 animate-spin" />
              <div className="absolute inset-0 w-16 h-16 border-4 border-purple-500/30 rounded-full animate-ping" />
            </div>
            <p className="text-slate-300 font-medium">AI 正在生成中...</p>
            <p className="text-sm text-slate-500">请稍候，这可能需要几秒钟</p>
          </div>
        ) : generatedImage ? (
          <>
            <img
              src={generatedImage}
              alt="Generated Avatar"
              className="w-full h-full object-cover cursor-pointer"
              onClick={() => setIsZoomed(true)}
            />
            <button
              onClick={handleDownload}
              className="absolute bottom-4 right-4 flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg shadow-lg hover:shadow-xl transition-all hover:scale-105"
            >
              <Download className="w-4 h-4" />
              下载
            </button>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <ImageIcon className="w-16 h-16 text-slate-600" />
            <p className="text-slate-500 font-medium">生成的头像将显示在这里</p>
            <p className="text-sm text-slate-600">配置完成后点击生成按钮</p>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-red-500/10 backdrop-blur-sm">
            <p className="text-red-400 font-medium">生成失败</p>
            <p className="text-sm text-red-300 px-4 text-center">{error}</p>
          </div>
        )}
      </div>

      {/* Zoom Modal */}
      {isZoomed && generatedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
          onClick={() => setIsZoomed(false)}
        >
          <img
            src={generatedImage}
            alt="Generated Avatar (Zoomed)"
            className="max-w-full max-h-full rounded-lg shadow-2xl"
          />
        </div>
      )}
    </div>
  );
}
