import { useState, useRef } from 'react';
import { Upload, X } from 'lucide-react';
import { ImageProcessor } from '../utils/imageProcessor';

interface ImageUploadProps {
  onImageChange: (base64: string) => void;
  label?: string;
}

export function ImageUpload({ onImageChange, label = '上传图片' }: ImageUploadProps) {
  const [preview, setPreview] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setError('');
    
    const validation = ImageProcessor.validateImage(file);
    if (!validation.valid) {
      setError(validation.error || '文件验证失败');
      return;
    }

    const base64 = await ImageProcessor.fileToBase64(file);
    setPreview(base64);
    onImageChange(base64);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      await handleFile(files[0]);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await handleFile(files[0]);
    }
  };

  const handleClear = () => {
    setPreview('');
    setError('');
    onImageChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <label className="text-sm font-semibold text-slate-200">{label}</label>
      
      {!preview ? (
        <div
          className={`relative flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300 ${
            isDragging
              ? 'border-indigo-400 bg-indigo-500/10 scale-105 shadow-lg'
              : 'border-slate-600 bg-slate-800/50 hover:border-indigo-500 hover:bg-slate-800 hover:scale-105'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className={`w-12 h-12 mb-4 transition-all ${isDragging ? 'text-indigo-400 scale-110' : 'text-slate-400'}`} />
          <p className="text-slate-300 font-medium mb-1">拖拽图片到此处</p>
          <p className="text-sm text-slate-500">或点击选择文件</p>
          <p className="text-xs text-slate-600 mt-3">支持 JPG、PNG 格式，最大 5MB</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/jpg"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      ) : (
        <div className="relative group">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-64 object-cover rounded-xl shadow-lg transition-transform hover:scale-105"
          />
          <button
            onClick={handleClear}
            className="absolute top-2 right-2 p-2 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 hover:scale-110"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-400 mt-2 animate-pulse">{error}</p>
      )}
    </div>
  );
}
