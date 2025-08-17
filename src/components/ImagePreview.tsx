import React from 'react';
import { X, Download, Calendar, Palette, Currency as Transparency } from 'lucide-react';

interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  style: string;
  transparent: boolean;
  timestamp: Date;
}

interface ImagePreviewProps {
  image: GeneratedImage;
  onClose: () => void;
  onDownload: (url: string, filename: string) => void;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ image, onClose, onDownload }) => {
  const handleDownload = () => {
    onDownload(image.url, `ai-art-${image.id}.jpg`);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-800">Image Preview</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        <div className="flex flex-col lg:flex-row">
          <div className="flex-1 p-6">
            <img
              src={image.url}
              alt={image.prompt}
              className="w-full max-h-[60vh] object-contain rounded-xl"
            />
          </div>
          
          <div className="lg:w-80 p-6 bg-gray-50 border-l border-gray-200">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prompt
                </label>
                <p className="text-sm text-gray-800 bg-white p-3 rounded-lg border border-gray-200">
                  {image.prompt}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Palette className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Style</span>
                  </div>
                  <p className="text-sm text-gray-800 capitalize">
                    {image.style.replace('-', ' ')}
                  </p>
                </div>
                
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Transparency className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Background</span>
                  </div>
                  <p className="text-sm text-gray-800">
                    {image.transparent ? 'Transparent' : 'Normal'}
                  </p>
                </div>
              </div>
              
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Generated</span>
                </div>
                <p className="text-sm text-gray-800">
                  {image.timestamp.toLocaleString()}
                </p>
              </div>
              
              <button
                onClick={handleDownload}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
              >
                <div className="flex items-center justify-center space-x-2">
                  <Download className="w-5 h-5" />
                  <span>Download Image</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImagePreview;