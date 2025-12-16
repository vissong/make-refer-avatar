import { useState } from 'react';
import { BackgroundConfig as BackgroundConfigType } from '../types';
import { Palette } from 'lucide-react';

interface BackgroundConfigProps {
  onConfigChange: (config: BackgroundConfigType) => void;
}

const PRESET_COLORS = [
  '#6366F1', '#8B5CF6', '#EC4899', '#F59E0B', 
  '#10B981', '#3B82F6', '#EF4444', '#ffffff'
];

export function BackgroundConfig({ onConfigChange }: BackgroundConfigProps) {
  const [bgType, setBgType] = useState<'color' | 'auto'>('color');
  const [selectedColor, setSelectedColor] = useState('#6366F1');
  const [customColor, setCustomColor] = useState('');
  const [elements, setElements] = useState('');

  const handleTypeChange = (type: 'color' | 'auto') => {
    setBgType(type);
    onConfigChange({
      type,
      color: type === 'color' ? (customColor || selectedColor) : undefined,
      elements: elements || undefined
    });
  };

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    setCustomColor('');
    onConfigChange({
      type: bgType,
      color,
      elements: elements || undefined
    });
  };

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value;
    setCustomColor(color);
    onConfigChange({
      type: bgType,
      color,
      elements: elements || undefined
    });
  };

  const handleElementsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setElements(value);
    onConfigChange({
      type: bgType,
      color: bgType === 'color' ? (customColor || selectedColor) : undefined,
      elements: value || undefined
    });
  };

  return (
    <div className="flex flex-col gap-4 p-6 glass-card rounded-xl shadow-xl">
      <div className="flex items-center gap-2 mb-2">
        <Palette className="w-5 h-5 text-indigo-400" />
        <h3 className="text-lg font-semibold text-slate-200">背景配置</h3>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => handleTypeChange('color')}
          className={`flex-1 py-2.5 px-4 rounded-lg font-medium transition-all ${
            bgType === 'color'
              ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg scale-105'
              : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600 hover:scale-105'
          }`}
        >
          纯色背景
        </button>
        <button
          onClick={() => handleTypeChange('auto')}
          className={`flex-1 py-2.5 px-4 rounded-lg font-medium transition-all ${
            bgType === 'auto'
              ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg scale-105'
              : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600 hover:scale-105'
          }`}
        >
          自动背景
        </button>
      </div>

      {bgType === 'color' && (
        <div className="space-y-3">
          <label className="text-sm font-medium text-slate-300">选择颜色</label>
          <div className="grid grid-cols-4 gap-2">
            {PRESET_COLORS.map((color) => (
              <button
                key={color}
                onClick={() => handleColorSelect(color)}
                className={`h-12 rounded-lg transition-all hover:scale-110 shadow-md hover:shadow-lg ${
                  selectedColor === color && !customColor
                    ? 'ring-2 ring-offset-2 ring-indigo-400 ring-offset-slate-800 scale-110'
                    : ''
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-slate-300">自定义颜色</label>
            <input
              type="color"
              value={customColor || selectedColor}
              onChange={handleCustomColorChange}
              className="w-12 h-12 rounded cursor-pointer bg-transparent hover:scale-110 transition-transform"
            />
            <input
              type="text"
              value={customColor || selectedColor}
              onChange={(e) => setCustomColor(e.target.value)}
              placeholder="#6366F1"
              className="flex-1 px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>
        </div>
      )}

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-300">背景元素（可选）</label>
        <textarea
          value={elements}
          onChange={handleElementsChange}
          placeholder="例如：小星星、爱心、花朵等重复图案"
          rows={3}
          className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none transition-all"
        />
        <p className="text-xs text-slate-500">描述想要在背景中添加的装饰元素</p>
      </div>
    </div>
  );
}
