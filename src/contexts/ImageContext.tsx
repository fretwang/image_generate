import React, { createContext, useContext, useState, ReactNode } from 'react';
import apiService from '../services/apiService';

interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  style: string;
  transparent: boolean;
  timestamp: Date;
}

interface GenerationHistory {
  id: string;
  prompt: string;
  style: string;
  transparent: boolean;
  images: GeneratedImage[];
  timestamp: Date;
  creditsUsed: number;
}

interface ImageContextType {
  history: GenerationHistory[];
  generateImages: (prompt: string, style: string, transparent: boolean) => Promise<GeneratedImage[]>;
  isGenerating: boolean;
}

const ImageContext = createContext<ImageContextType | undefined>(undefined);

export const useImage = () => {
  const context = useContext(ImageContext);
  if (context === undefined) {
    throw new Error('useImage must be used within an ImageProvider');
  }
  return context;
};

// Mock image URLs from Pexels
const mockImages = [
  'https://images.pexels.com/photos/2071873/pexels-photo-2071873.jpeg',
  'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
  'https://images.pexels.com/photos/1271619/pexels-photo-1271619.jpeg',
  'https://images.pexels.com/photos/1366919/pexels-photo-1366919.jpeg',
  'https://images.pexels.com/photos/1851415/pexels-photo-1851415.jpeg',
  'https://images.pexels.com/photos/1803650/pexels-photo-1803650.jpeg',
  'https://images.pexels.com/photos/2071882/pexels-photo-2071882.jpeg',
  'https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg',
];

export const ImageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [history, setHistory] = useState<GenerationHistory[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateImages = async (prompt: string, style: string, transparent: boolean): Promise<GeneratedImage[]> => {
    setIsGenerating(true);
    
    try {
      const response = await apiService.generateImages(prompt, style, transparent, 4);
      
      if (response.success && response.data) {
        const images: GeneratedImage[] = response.data.images.map((img: any) => ({
          id: img.id,
          url: img.url,
          prompt: img.prompt,
          style: img.style,
          transparent: img.transparent,
          timestamp: new Date(img.created_at)
        }));
        
        // Add to history
        const historyEntry: GenerationHistory = {
          id: Date.now().toString(),
          prompt,
          style,
          transparent,
          images,
          timestamp: new Date(),
          creditsUsed: response.data.credits_consumed
        };
        
        setHistory(prev => [historyEntry, ...prev]);
        setIsGenerating(false);
        
        return images;
      } else {
        throw new Error(response.message || 'Failed to generate images');
      }
    } catch (error) {
      console.error('Image generation error:', error);
      setIsGenerating(false);
      
      // Fallback to mock images for demo
      const images: GeneratedImage[] = [];
      for (let i = 0; i < 4; i++) {
        const randomImage = mockImages[Math.floor(Math.random() * mockImages.length)];
        images.push({
          id: `${Date.now()}-${i}`,
          url: `${randomImage}?auto=compress&cs=tinysrgb&w=512&h=512&dpr=1`,
          prompt,
          style,
          transparent,
          timestamp: new Date()
        });
      }
      
      const historyEntry: GenerationHistory = {
        id: Date.now().toString(),
        prompt,
        style,
        transparent,
        images,
        timestamp: new Date(),
        creditsUsed: 10
      };
      
      setHistory(prev => [historyEntry, ...prev]);
      setIsGenerating(false);
      
      return images;
    }
  };

  return (
    <ImageContext.Provider value={{ history, generateImages, isGenerating }}>
      {children}
    </ImageContext.Provider>
  );
};