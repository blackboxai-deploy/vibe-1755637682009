import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface PromptInputProps {
  onGenerate: (prompt: string, enhancedPrompt: string) => void;
  isGenerating: boolean;
  className?: string;
}

const PRESET_PROMPTS = [
  {
    category: "Photography",
    prompts: [
      "Professional portrait photography, studio lighting, high resolution",
      "Landscape photography, golden hour, dramatic clouds, wide angle",
      "Street photography, urban environment, candid moment, black and white",
      "Macro photography, extreme close-up, detailed textures, shallow depth of field"
    ]
  },
  {
    category: "Art Styles",
    prompts: [
      "Digital art, vibrant colors, fantasy theme, detailed illustration",
      "Oil painting style, classical composition, rich textures, masterpiece",
      "Watercolor painting, soft brushstrokes, pastel colors, artistic",
      "Minimalist design, clean lines, geometric shapes, modern aesthetic"
    ]
  },
  {
    category: "Concepts",
    prompts: [
      "Futuristic cityscape, neon lights, cyberpunk atmosphere, night scene",
      "Peaceful nature scene, forest clearing, sunlight filtering through trees",
      "Abstract concept art, flowing forms, gradient colors, ethereal mood",
      "Vintage retro style, 1980s aesthetic, synthwave colors, nostalgic"
    ]
  }
];

const ENHANCEMENT_KEYWORDS = [
  "high quality", "detailed", "professional", "cinematic lighting",
  "8K resolution", "photorealistic", "masterpiece", "award winning",
  "sharp focus", "vibrant colors", "dramatic composition", "artistic"
];

export default function PromptInput({ onGenerate, isGenerating, className = "" }: PromptInputProps) {
  const [prompt, setPrompt] = useState("");
  const [enhancedPrompt, setEnhancedPrompt] = useState("");
  const [showPresets, setShowPresets] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("Photography");

  const enhancePrompt = useCallback((originalPrompt: string) => {
    if (!originalPrompt.trim()) return "";
    
    const hasQualityKeywords = ENHANCEMENT_KEYWORDS.some(keyword => 
      originalPrompt.toLowerCase().includes(keyword.toLowerCase())
    );
    
    if (hasQualityKeywords) {
      return originalPrompt;
    }
    
    const enhancements = ["high quality", "detailed", "professional lighting", "sharp focus"];
    const randomEnhancements = enhancements
      .sort(() => 0.5 - Math.random())
      .slice(0, 2);
    
    return `${originalPrompt}, ${randomEnhancements.join(", ")}`;
  }, []);

  const handlePromptChange = (value: string) => {
    setPrompt(value);
    setEnhancedPrompt(enhancePrompt(value));
  };

  const handlePresetSelect = (presetPrompt: string) => {
    setPrompt(presetPrompt);
    setEnhancedPrompt(enhancePrompt(presetPrompt));
    setShowPresets(false);
  };

  const handleGenerate = () => {
    if (!prompt.trim() || isGenerating) return;
    
    const finalPrompt = enhancedPrompt || prompt;
    onGenerate(prompt, finalPrompt);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleGenerate();
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="prompt-input" className="text-sm font-medium">
            Describe your image
          </Label>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPresets(!showPresets)}
            className="text-xs"
          >
            {showPresets ? "Hide" : "Show"} Presets
          </Button>
        </div>
        
        <Textarea
          id="prompt-input"
          placeholder="Describe the image you want to generate... (Ctrl+Enter to generate)"
          value={prompt}
          onChange={(e) => handlePromptChange(e.target.value)}
          onKeyDown={handleKeyDown}
          className="min-h-[100px] resize-none"
          disabled={isGenerating}
        />
        
        {enhancedPrompt && enhancedPrompt !== prompt && (
          <div className="p-3 bg-muted rounded-md">
            <Label className="text-xs text-muted-foreground">Enhanced prompt:</Label>
            <p className="text-sm mt-1">{enhancedPrompt}</p>
          </div>
        )}
      </div>

      {showPresets && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {PRESET_PROMPTS.map((category) => (
                  <Button
                    key={category.category}
                    variant={selectedCategory === category.category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category.category)}
                    className="text-xs"
                  >
                    {category.category}
                  </Button>
                ))}
              </div>
              
              <div className="grid gap-2">
                {PRESET_PROMPTS
                  .find(cat => cat.category === selectedCategory)
                  ?.prompts.map((presetPrompt, index) => (
                    <button
                      key={index}
                      onClick={() => handlePresetSelect(presetPrompt)}
                      className="text-left p-2 text-sm rounded-md hover:bg-muted transition-colors"
                      disabled={isGenerating}
                    >
                      {presetPrompt}
                    </button>
                  ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center gap-3">
        <Button
          onClick={handleGenerate}
          disabled={!prompt.trim() || isGenerating}
          className="flex-1 h-12"
        >
          {isGenerating ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              Generating...
            </div>
          ) : (
            "Generate Image"
          )}
        </Button>
        
        {prompt.trim() && (
          <Badge variant="secondary" className="text-xs">
            {prompt.length} chars
          </Badge>
        )}
      </div>
      
      <p className="text-xs text-muted-foreground">
        Tip: Use Ctrl+Enter to quickly generate. Be specific about style, lighting, and composition for best results.
      </p>
    </div>
  );
}