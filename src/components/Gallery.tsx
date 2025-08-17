import React, { useState } from 'react';
import { useImage } from '../contexts/ImageContext';
import { Download, Eye, Calendar, Coins, Filter } from 'lucide-react';
import ImagePreview from './ImagePreview';

interface GalleryProps {
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

const Gallery: React.FC<GalleryProps> = ({ onNavigate }) => {
  const { history } = useImage();
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  const allImages = history.flatMap(h => 
    h.images.map(img => ({
      ...img,
      historyId: h.id,
      creditsUsed: h.creditsUsed,
      sessionTimestamp: h.timestamp
    }))
  );

  const filteredImages = allImages.filter(image => {
    if (filter === 'all') return true;
    if (filter === 'transparent') return image.transparent;
    return image.style === filter;
  });

  const sortedImages = [...filteredImages].sort((a, b) => {
    if (sortBy === 'newest') {
      return b.timestamp.getTime() - a.timestamp.getTime();
    }
    return a.timestamp.getTime() - b.timestamp.getTime();
  });

  const handleDownload = (imageUrl: string, filename: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filterOptions = [
    { id: 'all', name: 'All Images' },
    { id: 'realistic', name: 'Realistic' },
    { id: 'cartoon', name: 'Cartoon' },
    { id: 'oil-painting', name: 'Oil Painting' },
    { id: '3d-render', name: '3D Render' },
    { id: 'watercolor', name: 'Watercolor' },
    { id: 'cyberpunk', name: 'Cyberpunk' },
    { id: 'transparent', name: 'Transparent BG' },
  ];

  if (history.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Eye className="w-12 h-12 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No Images Yet</h2>
          <p className="text-gray-600 mb-6">Start creating amazing AI-generated images to see them here.</p>
          <button
            onClick={() => onNavigate('generate')}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
          >
            Create Your First Image
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Image Gallery</h1>
          <p className="text-gray-600">Browse your AI-generated creations</p>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-500" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {filterOptions.map(option => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </select>
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
          <div className="text-2xl font-bold text-gray-800">{allImages.length}</div>
          <div className="text-sm text-gray-600">Total Images</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
          <div className="text-2xl font-bold text-gray-800">{history.length}</div>
          <div className="text-sm text-gray-600">Generation Sessions</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
          <div className="text-2xl font-bold text-gray-800">
            {history.reduce((acc, h) => acc + h.creditsUsed, 0)}
          </div>
          <div className="text-sm text-gray-600">Credits Used</div>
        </div>
      </div>

      {/* Image Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {sortedImages.map((image) => (
          <div key={image.id} className="relative group bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="aspect-square bg-gray-100">
              <img
                src={image.url}
                alt={image.prompt}
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
              <div className="flex space-x-2">
                <button
                  onClick={() => setSelectedImage(image)}
                  className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                  title="Preview"
                >
                  <Eye className="w-4 h-4 text-gray-700" />
                </button>
                <button
                  onClick={() => handleDownload(image.url, `ai-art-${image.id}.jpg`)}
                  className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                  title="Download"
                >
                  <Download className="w-4 h-4 text-gray-700" />
                </button>
              </div>
            </div>

            <div className="p-3">
              <div className="text-xs text-gray-500 mb-1 flex items-center">
                <Calendar className="w-3 h-3 mr-1" />
                {image.timestamp.toLocaleDateString()}
              </div>
              <div className="text-sm font-medium text-gray-800 truncate mb-2">
                {image.prompt.slice(0, 50)}...
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span className="capitalize">{image.style.replace('-', ' ')}</span>
                {image.transparent && (
                  <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded">
                    Transparent
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredImages.length === 0 && filter !== 'all' && (
        <div className="text-center py-12">
          <p className="text-gray-500">No images found for the selected filter.</p>
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

export default Gallery;