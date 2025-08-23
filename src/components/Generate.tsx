import React, { useState } from 'react';
import { useCredit } from '../contexts/CreditContext';
import { useImage } from '../contexts/ImageContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Sparkles, Download, Eye, Loader2, Coins, Upload } from 'lucide-react';
import ImagePreview from './ImagePreview';

interface GenerateProps {
  onNavigate: (page: 'home' | 'generate' | 'gallery' | 'profile') => void;
}

interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  style: string;
  transparent: boolean;
  timestamp: Date;
}

const Generate: React.FC<GenerateProps> = ({ onNavigate }) => {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('realistic');
  const [ratio, setRatio] = useState('1:1');
  const [count, setCount] = useState(1);
  const [transparent, setTransparent] = useState(false);
  const [styleImage, setStyleImage] = useState<File | null>(null);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);
  
  const { credits, consume } = useCredit();
  const { generateImages, isGenerating } = useImage();
  const { t } = useLanguage();

  // Parse styles from environment variable
  const getStyles = () => {
    const stylesEnv = process.env.REACT_APP_STYLES || 'realistic:Realistic:Photorealistic images,cartoon:Cartoon:Animated style,oil-painting:Oil Painting:Classic art style,3d-render:3D Render:Three-dimensional look,watercolor:Watercolor:Soft flowing colors,cyberpunk:Cyberpunk:Futuristic neon style';
    return stylesEnv.split(',').map(styleStr => {
      const [id, name, description] = styleStr.split(':');
      return { id, name, description };
    });
  };

  const styles = getStyles();

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    const creditCost = 10;
    if (credits < creditCost) {
      alert(`${t.generate.insufficientCredits} ${t.generate.insufficientCreditsMessage}`);
      onNavigate('profile');
      return;
    }

    const success = consume(creditCost, `Generated images: "${prompt}"`);
    if (!success) return;

    try {
      const images = await generateImages(prompt, style, transparent);
      setGeneratedImages(images);
    } catch (error) {
      console.error('Generation failed:', error);
    }
  };

  const handleDownload = (imageUrl: string, filename: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadAll = () => {
    generatedImages.forEach((image, index) => {
      setTimeout(() => {
        handleDownload(image.url, `ai-art-${index + 1}.jpg`);
      }, index * 100);
    });
  };

  const handleStyleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setStyleImage(file);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">{t.generate.title}</h1>
        <p className="text-gray-600">{t.generate.subtitle}</p>
      </div>

      {/* Generation Form */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="space-y-6">
          {/* Prompt Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.generate.promptLabel}
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={t.generate.promptPlaceholder}
              className="w-full h-24 p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Style Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.generate.chooseStyle}
            </label>
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {styles.map((styleOption) => (
                <option key={styleOption.id} value={styleOption.id}>
                  {styleOption.name} - {styleOption.description}
                </option>
              ))}
            </select>
          </div>

          {/* Ratio Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.generate.chooseRatio}
            </label>
            <select
              value={ratio}
              onChange={(e) => setRatio(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="1:1">1:1 (Square)</option>
              <option value="16:9">16:9 (Landscape)</option>
              <option value="9:16">9:16 (Portrait)</option>
              <option value="4:3">4:3 (Standard)</option>
              <option value="3:4">3:4 (Portrait)</option>
            </select>
          </div>

          {/* Count Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.generate.chooseCount}
            </label>
            <select
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={1}>1 Image</option>
              <option value={2}>2 Images</option>
              <option value={3}>3 Images</option>
              <option value={4}>4 Images</option>
            </select>
          </div>

          {/* Style Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Style Reference (Optional)
            </label>
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2 px-4 py-2 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <Upload className="w-5 h-5 text-gray-500" />
                <span className="text-gray-700">Choose Image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleStyleImageUpload}
                  className="hidden"
                />
              </label>
              {styleImage && (
                <span className="text-sm text-gray-600">{styleImage.name}</span>
              )}
            </div>
          </div>

          {/* Options */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="transparent"
                checked={transparent}
                onChange={(e) => setTransparent(e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="transparent" className="text-sm font-medium text-gray-700">{t.generate.transparentBackground}</label>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-gray-600">
                <Coins className="w-5 h-5 text-orange-500" />
                <span className="text-sm">{t.generate.cost}: {creditCost} {t.generate.credits}</span>
              </div>
              
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim() || credits < creditCost}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                <div className="flex items-center space-x-2">
                  {isGenerating ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Sparkles className="w-5 h-5" />
                  )}
                  <span>{isGenerating ? t.generate.generating : t.generate.generateImages}</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Generated Images */}
      {generatedImages.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">{t.generate.generatedImages}</h2>
            <button
              onClick={handleDownloadAll}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>{t.generate.downloadAll}</span>
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            {generatedImages.map((image) => (
              <div key={image.id} className="relative group">
                <div className="aspect-square rounded-xl overflow-hidden bg-gray-100">
                  <img
                    src={image.url}
                    alt={image.prompt}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setSelectedImage(image)}
                      className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                      title={t.generate.preview}
                    >
                      <Eye className="w-4 h-4 text-gray-700" />
                    </button>
                    <button
                      onClick={() => handleDownload(image.url, `ai-art-${image.id}.jpg`)}
                      className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                      title={t.generate.download}
                    >
                      <Download className="w-4 h-4 text-gray-700" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 bg-gray-50 rounded-xl">
            <div className="text-sm text-gray-600 mb-1">{t.generate.promptUsed}</div>
            <div className="font-medium text-gray-800">"{prompt}"</div>
            <div className="text-sm text-gray-500 mt-1">
              {t.generate.style}: {getStyles().find(s => s.id === style)?.name} • 
              {t.generate.background}: {transparent ? t.generate.transparent : t.generate.normal} • 
              {t.generate.creditsUsed}: {creditCost}
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isGenerating && (
        <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
          <h3 className="text-lg font-medium text-gray-800 mb-2">{t.generate.creatingImages}</h3>
          <p className="text-gray-600">{t.generate.creatingDescription}</p>
        </div>
      )}

      {/* Image Preview Modal */}
      {selectedImage && (
        <ImagePreview
          image={selectedImage}
          onClose={() => setSelectedImage(null)}
          onDownload={(url, filename) => handleDownload(url, filename)}
        />
      )}
    </div>
  );
};

export default Generate;