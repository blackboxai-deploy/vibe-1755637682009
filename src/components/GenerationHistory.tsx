"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';

interface GeneratedImage {
  id: string;
  prompt: string;
  imageUrl: string;
  style: string;
  timestamp: number;
  dimensions: string;
}

interface GenerationHistoryProps {
  onPromptSelect?: (prompt: string) => void;
  className?: string;
}

export default function GenerationHistory({ onPromptSelect, className = "" }: GenerationHistoryProps) {
  const [history, setHistory] = useState<GeneratedImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    try {
      const stored = localStorage.getItem('imageGenerationHistory');
      if (stored) {
        const parsed = JSON.parse(stored);
        setHistory(parsed.sort((a: GeneratedImage, b: GeneratedImage) => b.timestamp - a.timestamp));
      }
    } catch (error) {
      console.error('Error loading history:', error);
    }
  };

  const clearHistory = () => {
    localStorage.removeItem('imageGenerationHistory');
    setHistory([]);
  };

  const deleteItem = (id: string) => {
    const updated = history.filter(item => item.id !== id);
    setHistory(updated);
    localStorage.setItem('imageGenerationHistory', JSON.stringify(updated));
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const truncatePrompt = (prompt: string, maxLength: number = 60) => {
    return prompt.length > maxLength ? prompt.substring(0, maxLength) + '...' : prompt;
  };

  const downloadImage = async (imageUrl: string, prompt: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `generated-image-${prompt.substring(0, 20).replace(/[^a-zA-Z0-9]/g, '-')}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  };

  if (history.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-lg">Generation History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <div className="text-4xl mb-4">🎨</div>
            <p>No images generated yet</p>
            <p className="text-sm mt-2">Your generation history will appear here</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg">Generation History</CardTitle>
        <div className="flex gap-2">
          <Badge variant="secondary">{history.length} images</Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={clearHistory}
            className="text-xs"
          >
            Clear All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          <div className="space-y-3">
            {history.map((item, index) => (
              <div key={item.id}>
                <div className="flex gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                  <div className="relative flex-shrink-0">
                    <img
                      src={item.imageUrl}
                      alt={truncatePrompt(item.prompt, 30)}
                      className="w-16 h-16 rounded-md object-cover cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => setSelectedImage(item)}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p 
                        className="text-sm font-medium leading-tight cursor-pointer hover:text-primary transition-colors"
                        onClick={() => onPromptSelect?.(item.prompt)}
                        title="Click to use this prompt"
                      >
                        {truncatePrompt(item.prompt)}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteItem(item.id)}
                        className="text-xs h-6 px-2 text-muted-foreground hover:text-destructive"
                      >
                        ×
                      </Button>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {item.style}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {item.dimensions}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatTimestamp(item.timestamp)}
                    </p>
                  </div>
                </div>
                {index < history.length - 1 && <Separator className="my-2" />}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>

      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Generated Image</DialogTitle>
          </DialogHeader>
          {selectedImage && (
            <div className="space-y-4">
              <div className="relative">
                <img
                  src={selectedImage.imageUrl}
                  alt={selectedImage.prompt}
                  className="w-full max-h-96 object-contain rounded-lg"
                />
              </div>
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium mb-1">Prompt</h4>
                  <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                    {selectedImage.prompt}
                  </p>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div>
                    <span className="font-medium">Style:</span> {selectedImage.style}
                  </div>
                  <div>
                    <span className="font-medium">Size:</span> {selectedImage.dimensions}
                  </div>
                  <div>
                    <span className="font-medium">Generated:</span> {formatTimestamp(selectedImage.timestamp)}
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={() => onPromptSelect?.(selectedImage.prompt)}
                    variant="outline"
                  >
                    Use This Prompt
                  </Button>
                  <Button
                    onClick={() => downloadImage(selectedImage.imageUrl, selectedImage.prompt)}
                    variant="outline"
                  >
                    Download Image
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}