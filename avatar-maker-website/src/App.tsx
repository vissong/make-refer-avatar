import { useState } from 'react';
import { Settings, Sparkles } from 'lucide-react';
import { ImageUpload } from './components/ImageUpload';
import { BackgroundConfig } from './components/BackgroundConfig';
import { ModelConfigDialog } from './components/ModelConfigDialog';
import { AvatarGenerator } from './components/AvatarGenerator';
import { ModelConfig, BackgroundConfig as BackgroundConfigType } from './types';
import { ApiService } from './services/apiService';
import { ImageProcessor } from './utils/imageProcessor';
import { StorageService } from './services/storageService';

function App() {
  const [userImage, setUserImage] = useState('');
  const [backgroundConfig, setBackgroundConfig] = useState<BackgroundConfigType>({
    type: 'color',
    color: '#6366F1'
  });
  const [modelConfig, setModelConfig] = useState<ModelConfig | null>(
    StorageService.loadModelConfig()
  );
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);
  const [generatedImage, setGeneratedImage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!userImage) {
      setError('请先上传照片');
      return;
    }

    if (!modelConfig) {
      setError('请先配置 AI 模型');
      setIsConfigDialogOpen(true);
      return;
    }

    setError('');
    setIsGenerating(true);

    try {
      // 加载参考图片
      const referenceImageBase64 = await ImageProcessor.loadReferenceImage('/refer_avatar.jpg');

      const result = await ApiService.generateAvatar(modelConfig, {
        userImage,
        referenceImage: referenceImageBase64,
        background: backgroundConfig
      });

      if (result.success) {
        setGeneratedImage(result.imageUrl);
      } else {
        setError(result.error || '生成失败');
      }
    } catch (err) {
      console.error('Generation error:', err);
      setError(err instanceof Error ? err.message : '生成失败，请重试');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 animate-gradient">
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      </div>

      {/* Header */}
      <header className="border-b border-slate-700/50 glass-card sticky top-0 z-40 shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient">
              ✨ AI 头像生成器
            </h1>
            <button
              onClick={() => setIsConfigDialogOpen(true)}
              className="flex items-center gap-2 px-4 py-2 glass-card hover:bg-slate-700/50 text-slate-200 rounded-lg transition-all hover:scale-105 hover:shadow-lg"
            >
              <Settings className="w-5 h-5" />
              模型配置
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 relative z-10">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Upload & Config */}
          <div className="lg:col-span-1 space-y-6">
            <div className="glass-card rounded-xl shadow-xl p-6 hover:shadow-2xl transition-shadow">
              <ImageUpload
                onImageChange={setUserImage}
                label="上传您的照片"
              />
            </div>

            <BackgroundConfig onConfigChange={setBackgroundConfig} />

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !userImage}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-2xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 animate-gradient"
            >
              <Sparkles className="w-6 h-6" />
              {isGenerating ? '生成中...' : '生成头像'}
            </button>
          </div>

          {/* Right Column - Result */}
          <div className="lg:col-span-2">
            <div className="glass-card rounded-xl shadow-xl p-6 sticky top-24">
              <AvatarGenerator
                generatedImage={generatedImage}
                isGenerating={isGenerating}
                error={error}
              />
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 p-4 glass-card rounded-lg shadow-md">
          <p className="text-sm text-slate-400 text-center">
            💡 提示：您的 API 配置和照片仅在本地处理，不会上传到任何服务器
          </p>
        </div>
      </main>

      {/* Model Config Dialog */}
      <ModelConfigDialog
        isOpen={isConfigDialogOpen}
        onClose={() => setIsConfigDialogOpen(false)}
        onSave={setModelConfig}
      />
    </div>
  );
}

export default App;
