import { useState, useEffect } from 'react';
import { X, AlertTriangle, Save, Trash2 } from 'lucide-react';
import { ModelConfig } from '../types';
import { StorageService } from '../services/storageService';
import { Validators } from '../utils/validators';

interface ModelConfigDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: ModelConfig) => void;
}

export function ModelConfigDialog({ isOpen, onClose, onSave }: ModelConfigDialogProps) {
  const [config, setConfig] = useState<ModelConfig>({
    baseURL: '',
    apiToken: '',
    modelName: 'gemini-2.0-flash-exp'
  });
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      const saved = StorageService.loadModelConfig();
      if (saved) {
        setConfig(saved);
      }
    }
  }, [isOpen]);

  const handleSave = () => {
    const validation = Validators.validateModelConfig(config);
    
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    StorageService.saveModelConfig(config);
    onSave(config);
    setErrors([]);
    onClose();
  };

  const handleClear = () => {
    if (confirm('确定要清除保存的配置吗？')) {
      StorageService.clearModelConfig();
      setConfig({
        baseURL: '',
        apiToken: '',
        modelName: 'gemini-2.0-flash-exp'
      });
      setErrors([]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700 bg-gradient-to-r from-indigo-500/10 to-purple-500/10">
          <h2 className="text-xl font-bold text-slate-100">AI 模型配置</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-700 transition-all hover:scale-110"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Privacy Notice */}
        <div className="m-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-yellow-200">
            <p className="font-semibold mb-1">隐私提示</p>
            <p className="text-yellow-300/80">所有配置仅保存在您的浏览器本地，不会上传到任何服务器。</p>
          </div>
        </div>

        {/* Form */}
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              API 地址
            </label>
            <input
              type="text"
              value={config.baseURL}
              onChange={(e) => setConfig({ ...config, baseURL: e.target.value })}
              placeholder="https://api.example.com"
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              API Token
            </label>
            <input
              type="password"
              value={config.apiToken}
              onChange={(e) => setConfig({ ...config, apiToken: e.target.value })}
              placeholder="输入您的 API Token"
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              模型名称
            </label>
            <input
              type="text"
              value={config.modelName}
              onChange={(e) => setConfig({ ...config, modelName: e.target.value })}
              placeholder="gemini-2.0-flash-exp"
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>

          {errors.length > 0 && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg animate-in slide-in-from-top-2">
              {errors.map((error, index) => (
                <p key={index} className="text-sm text-red-400">{error}</p>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-slate-700 bg-slate-900/30">
          <button
            onClick={handleClear}
            className="flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-all hover:scale-105"
          >
            <Trash2 className="w-4 h-4" />
            清除配置
          </button>
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 rounded-lg transition-all hover:scale-105"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:shadow-lg transition-all hover:scale-105"
            >
              <Save className="w-4 h-4" />
              保存配置
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
