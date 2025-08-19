"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export interface StyleOption {
  id: string;
  name: string;
  description: string;
  prompt: string;
  category: string;
}

export interface StyleSelectorProps {
  selectedStyle: StyleOption | null;
  onStyleChange: (style: StyleOption | null) => void;
  onPromptEnhance: (enhancedPrompt: string) => void;
}

const styleOptions: StyleOption[] = [
  {
    id: "photorealistic",
    name: "Photorealistic",
    description: "High-quality, realistic photography style",
    prompt: "photorealistic, high resolution, professional photography, detailed, sharp focus, natural lighting",
    category: "Photography"
  },
  {
    id: "artistic",
    name: "Artistic",
    description: "Creative and expressive artistic style",
    prompt: "artistic, creative, expressive, vibrant colors, artistic composition, masterpiece",
    category: "Art"
  },
  {
    id: "digital-art",
    name: "Digital Art",
    description: "Modern digital artwork style",
    prompt: "digital art, concept art, detailed illustration, trending on artstation, digital painting",
    category: "Art"
  },
  {
    id: "portrait",
    name: "Portrait",
    description: "Professional portrait photography",
    prompt: "portrait photography, professional headshot, studio lighting, shallow depth of field, 85mm lens",
    category: "Photography"
  },
  {
    id: "landscape",
    name: "Landscape",
    description: "Beautiful landscape photography",
    prompt: "landscape photography, wide angle, golden hour lighting, scenic view, nature, breathtaking",
    category: "Photography"
  },
  {
    id: "minimalist",
    name: "Minimalist",
    description: "Clean, simple, minimal design",
    prompt: "minimalist, clean design, simple composition, negative space, elegant, modern",
    category: "Design"
  },
  {
    id: "vintage",
    name: "Vintage",
    description: "Retro and nostalgic style",
    prompt: "vintage style, retro aesthetic, film grain, nostalgic, classic, aged look",
    category: "Style"
  },
  {
    id: "cyberpunk",
    name: "Cyberpunk",
    description: "Futuristic cyberpunk aesthetic",
    prompt: "cyberpunk, neon lights, futuristic, sci-fi, dark atmosphere, high tech, urban",
    category: "Style"
  },
  {
    id: "watercolor",
    name: "Watercolor",
    description: "Soft watercolor painting style",
    prompt: "watercolor painting, soft colors, flowing paint, artistic brush strokes, delicate, dreamy",
    category: "Art"
  },
  {
    id: "oil-painting",
    name: "Oil Painting",
    description: "Classical oil painting technique",
    prompt: "oil painting, classical art, rich textures, painterly, traditional technique, museum quality",
    category: "Art"
  }
];

const presetPrompts = [
  {
    category: "Nature",
    prompts: [
      "A serene mountain lake at sunrise with mist rising from the water",
      "Ancient forest with towering trees and dappled sunlight",
      "Dramatic ocean waves crashing against rocky cliffs",
      "Peaceful meadow filled with wildflowers under a blue sky"
    ]
  },
  {
    category: "Architecture",
    prompts: [
      "Modern glass skyscraper reflecting the city skyline",
      "Ancient castle on a hilltop surrounded by clouds",
      "Cozy cottage with a thatched roof in the countryside",
      "Futuristic building with unique geometric design"
    ]
  },
  {
    category: "Fantasy",
    prompts: [
      "Magical forest with glowing mushrooms and fairy lights",
      "Dragon soaring over a medieval castle",
      "Enchanted library with floating books and mystical atmosphere",
      "Crystal cave with luminescent formations"
    ]
  },
  {
    category: "Abstract",
    prompts: [
      "Flowing liquid metal with rainbow reflections",
      "Geometric patterns in vibrant neon colors",
      "Swirling galaxies with cosmic dust and stars",
      "Abstract representation of music and sound waves"
    ]
  }
];

export function StyleSelector({ selectedStyle, onStyleChange, onPromptEnhance }: StyleSelectorProps) {
  const [activeTab, setActiveTab] = useState<"styles" | "presets">("styles");

  const categories = Array.from(new Set(styleOptions.map(style => style.category)));

  const handleStyleSelect = (style: StyleOption) => {
    if (selectedStyle?.id === style.id) {
      onStyleChange(null);
    } else {
      onStyleChange(style);
    }
  };

  const handlePresetSelect = (prompt: string) => {
    onPromptEnhance(prompt);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Style & Presets</CardTitle>
        <div className="flex space-x-1">
          <Button
            variant={activeTab === "styles" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("styles")}
            className="text-sm"
          >
            Styles
          </Button>
          <Button
            variant={activeTab === "presets" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("presets")}
            className="text-sm"
          >
            Presets
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {activeTab === "styles" && (
          <div className="space-y-4">
            {categories.map((category) => (
              <div key={category} className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">{category}</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {styleOptions
                    .filter(style => style.category === category)
                    .map((style) => (
                      <Button
                        key={style.id}
                        variant={selectedStyle?.id === style.id ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleStyleSelect(style)}
                        className="h-auto p-3 text-left justify-start"
                      >
                        <div className="space-y-1">
                          <div className="font-medium text-sm">{style.name}</div>
                          <div className="text-xs text-muted-foreground line-clamp-2">
                            {style.description}
                          </div>
                        </div>
                      </Button>
                    ))}
                </div>
                {category !== categories[categories.length - 1] && <Separator />}
              </div>
            ))}
            {selectedStyle && (
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary">{selectedStyle.category}</Badge>
                  <span className="text-sm font-medium">{selectedStyle.name}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Style prompt: {selectedStyle.prompt}
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === "presets" && (
          <div className="space-y-4">
            {presetPrompts.map((category) => (
              <div key={category.category} className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">{category.category}</h4>
                <div className="space-y-2">
                  {category.prompts.map((prompt, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => handlePresetSelect(prompt)}
                      className="h-auto p-3 text-left justify-start w-full"
                    >
                      <div className="text-sm text-left">{prompt}</div>
                    </Button>
                  ))}
                </div>
                {category !== presetPrompts[presetPrompts.length - 1] && <Separator />}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}