export interface ImageGenerationRequest {
  prompt: string;
  style?: string;
  width?: number;
  height?: number;
  quality?: string;
  seed?: number;
  steps?: number;
  guidance_scale?: number;
}

export interface ImageGenerationResponse {
  success: boolean;
  imageUrl?: string;
  imageData?: string;
  error?: string;
  generationTime?: number;
}

export interface GeneratedImage {
  id: string;
  prompt: string;
  imageUrl: string;
  imageData?: string;
  style?: string;
  dimensions: {
    width: number;
    height: number;
  };
  createdAt: Date;
  generationTime?: number;
  seed?: number;
}

export interface ImageStyle {
  id: string;
  name: string;
  description: string;
  prompt_suffix: string;
  preview?: string;
}

export interface GenerationSettings {
  width: number;
  height: number;
  quality: 'draft' | 'standard' | 'high';
  steps: number;
  guidance_scale: number;
  seed?: number;
}

export interface GenerationHistory {
  images: GeneratedImage[];
  totalGenerated: number;
  lastGenerated?: Date;
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: any;
}

export interface GenerationProgress {
  status: 'idle' | 'generating' | 'completed' | 'error';
  progress?: number;
  message?: string;
  estimatedTime?: number;
}

export type AspectRatio = '1:1' | '16:9' | '9:16' | '4:3' | '3:4' | '21:9';

export interface PresetPrompt {
  id: string;
  title: string;
  prompt: string;
  category: string;
  style?: string;
  tags: string[];
}