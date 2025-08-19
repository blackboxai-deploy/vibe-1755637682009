"use client";

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';

interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  style: string;
  timestamp: number;
  dimensions: string;
}

interface GenerationSettings {
  style: string;
  dimensions: string;
  quality: string;
  systemPrompt: string;
}

const PRESET_PROMPTS = [
  "A serene mountain landscape at sunset with golden light",
  "A futuristic cityscape with flying cars and neon lights",
  "A cozy coffee shop interior with warm lighting",
  "An abstract geometric pattern in vibrant colors",
  "A portrait of a wise old tree in an enchanted forest",
  "A minimalist modern architecture building",
];

const STYLE_OPTIONS = [
  { value: "photorealistic", label: "Photorealistic" },
  { value: "artistic", label: "Artistic" },
  { value: "minimal", label: "Minimal" },
  { value: "abstract", label: "Abstract" },
  { value: "vintage", label: "Vintage" },
  { value: "cyberpunk", label: "Cyberpunk" },
];

const DIMENSION_OPTIONS = [
  { value: "1024x1024", label: "Square (1024×1024)" },
  { value: "1024x768", label: "Landscape (1024×768)" },
  { value: "768x1024", label: "Portrait (768×1024)" },
  { value: "1280x720", label: "Wide (1280×720)" },
];

const QUALITY_OPTIONS = [
  { value: "standard", label: "Standard" },
  { value: "high", label: "High Quality" },
  { value: "ultra", label: "Ultra High" },
];

export default function ImageGenerator() {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [settings, setSettings] = useState<GenerationSettings>({
    style: 'photorealistic',
    dimensions: '1024x1024',
    quality: 'high',
    systemPrompt: 'You are an AI image generation assistant. Create detailed, high-quality images based on user prompts. Focus on artistic composition, proper lighting, and visual appeal. Interpret prompts creatively while maintaining the core requested elements. Generate images that are visually striking and professionally composed.'
  });

  const enhancePrompt = useCallback((basePrompt: string, style: string): string => {
    const styleEnhancements = {
      photorealistic: 'photorealistic, high detail, professional photography, sharp focus',
      artistic: 'artistic style, creative composition, expressive brushwork',
      minimal: 'minimalist design, clean lines, simple composition, negative space',
      abstract: 'abstract art, geometric forms, bold colors, experimental',
      vintage: 'vintage style, retro aesthetic, aged texture, nostalgic mood',
      cyberpunk: 'cyberpunk style, neon lights, futuristic, dark atmosphere'
    };

    return `${basePrompt}, ${styleEnhancements[style as keyof typeof styleEnhancements] || ''}`;
  }, []);

  const generateImage = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt for image generation');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setProgress(0);

    // Simulate progress updates
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 15;
      });
    }, 1000);

    try {
      const enhancedPrompt = enhancePrompt(prompt, settings.style);
      
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: enhancedPrompt,
          style: settings.style,
          dimensions: settings.dimensions,
          quality: settings.quality,
          systemPrompt: settings.systemPrompt,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate image');
      }

      const data = await response.json();
      
      setProgress(100);
      
      const newImage: GeneratedImage = {
        id: Date.now().toString(),
        url: data.imageUrl,
        prompt: prompt,
        style: settings.style,
        timestamp: Date.now(),
        dimensions: settings.dimensions,
      };

      setGeneratedImages(prev => [newImage, ...prev]);
      
      // Save to localStorage
      const savedImages = JSON.parse(localStorage.getItem('generatedImages') || '[]');
      localStorage.setItem('generatedImages', JSON.stringify([newImage, ...savedImages.slice(0, 19)]));
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      clearInterval(progressInterval);
      setIsGenerating(false);
      setProgress(0);
    }
  };

  const downloadImage = async (imageUrl: string, filename: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError('Failed to download image');
    }
  };

  const loadHistory = () => {
    const savedImages = JSON.parse(localStorage.getItem('generatedImages') || '[]');
    setGeneratedImages(savedImages);
  };

  React.useEffect(() => {
    loadHistory();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          AI Image Generator
        </h1>
        <p className="text-muted-foreground">
          Create stunning images with advanced AI technology
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Generate Image</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="prompt">Image Description</Label>
                <Textarea
                  id="prompt"
                  placeholder="Describe the image you want to generate..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="min-h-[100px] resize-none"
                  disabled={isGenerating}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Style</Label>
                  <Select
                    value={settings.style}
                    onValueChange={(value) => setSettings(prev => ({ ...prev, style: value }))}
                    disabled={isGenerating}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STYLE_OPTIONS.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Dimensions</Label>
                  <Select
                    value={settings.dimensions}
                    onValueChange={(value) => setSettings(prev => ({ ...prev, dimensions: value }))}
                    disabled={isGenerating}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DIMENSION_OPTIONS.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Quality</Label>
                  <Select
                    value={settings.quality}
                    onValueChange={(value) => setSettings(prev => ({ ...prev, quality: value }))}
                    disabled={isGenerating}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {QUALITY_OPTIONS.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {isGenerating && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Generating image...</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="w-full" />
                </div>
              )}

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                onClick={generateImage}
                disabled={isGenerating || !prompt.trim()}
                className="w-full"
                size="lg"
              >
                {isGenerating ? 'Generating...' : 'Generate Image'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Prompts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {PRESET_PROMPTS.map((presetPrompt, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => setPrompt(presetPrompt)}
                    disabled={isGenerating}
                    className="text-left justify-start h-auto p-3"
                  >
                    {presetPrompt}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>System Prompt</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={settings.systemPrompt}
                onChange={(e) => setSettings(prev => ({ ...prev, systemPrompt: e.target.value }))}
                className="min-h-[120px] text-sm"
                disabled={isGenerating}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Generated Images</CardTitle>
            </CardHeader>
            <CardContent>
              {generatedImages.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No images generated yet
                </p>
              ) : (
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  {generatedImages.map((image) => (
                    <div key={image.id} className="space-y-2">
                      <div className="relative group">
                        <img
                          src={image.url}
                          alt={image.prompt}
                          className="w-full rounded-lg shadow-sm"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                          <Button
                            size="sm"
                            onClick={() => downloadImage(image.url, `generated-${image.id}`)}
                          >
                            Download
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium line-clamp-2">{image.prompt}</p>
                        <div className="flex flex-wrap gap-1">
                          <Badge variant="secondary" className="text-xs">
                            {image.style}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {image.dimensions}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {new Date(image.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <Separator />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}