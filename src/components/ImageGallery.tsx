"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  style: string;
  timestamp: number;
  dimensions: string;
}

interface ImageGalleryProps {
  images: GeneratedImage[];
  isLoading?: boolean;
}

export function ImageGallery({ images, isLoading = false }: ImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);

  const downloadImage = async (imageUrl: string, filename: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error('Copy failed:', error);
    }
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="aspect-square bg-muted animate-pulse" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-muted animate-pulse rounded" />
                <div className="h-3 bg-muted animate-pulse rounded w-2/3" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🎨</div>
        <h3 className="text-lg font-semibold mb-2">No images generated yet</h3>
        <p className="text-muted-foreground">
          Start by entering a prompt and clicking generate to create your first AI image.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {images.map((image) => (
          <Card key={image.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-0">
              <div 
                className="aspect-square relative overflow-hidden"
                onClick={() => setSelectedImage(image)}
              >
                <img
                  src={image.url}
                  alt={image.prompt}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 right-2">
                  <Badge variant="secondary" className="text-xs">
                    {image.style}
                  </Badge>
                </div>
              </div>
              <div className="p-4">
                <p className="text-sm font-medium line-clamp-2 mb-2">
                  {image.prompt}
                </p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{image.dimensions}</span>
                  <span>{formatTimestamp(image.timestamp)}</span>
                </div>
                <div className="flex gap-2 mt-3">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      downloadImage(image.url, `ai-image-${image.id}.png`);
                    }}
                  >
                    Download
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipboard(image.url);
                    }}
                  >
                    Copy Link
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Generated Image</DialogTitle>
          </DialogHeader>
          {selectedImage && (
            <div className="space-y-4">
              <div className="relative">
                <img
                  src={selectedImage.url}
                  alt={selectedImage.prompt}
                  className="w-full h-auto max-h-[60vh] object-contain rounded-lg"
                />
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium">Prompt:</label>
                  <ScrollArea className="h-20 w-full rounded border p-3 mt-1">
                    <p className="text-sm">{selectedImage.prompt}</p>
                  </ScrollArea>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="font-medium">Style:</label>
                    <p className="text-muted-foreground">{selectedImage.style}</p>
                  </div>
                  <div>
                    <label className="font-medium">Dimensions:</label>
                    <p className="text-muted-foreground">{selectedImage.dimensions}</p>
                  </div>
                  <div>
                    <label className="font-medium">Generated:</label>
                    <p className="text-muted-foreground">{formatTimestamp(selectedImage.timestamp)}</p>
                  </div>
                  <div>
                    <label className="font-medium">ID:</label>
                    <p className="text-muted-foreground font-mono text-xs">{selectedImage.id}</p>
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <Button
                    onClick={() => downloadImage(selectedImage.url, `ai-image-${selectedImage.id}.png`)}
                    className="flex-1"
                  >
                    Download High Quality
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => copyToClipboard(selectedImage.prompt)}
                    className="flex-1"
                  >
                    Copy Prompt
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => copyToClipboard(selectedImage.url)}
                    className="flex-1"
                  >
                    Copy Image Link
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}