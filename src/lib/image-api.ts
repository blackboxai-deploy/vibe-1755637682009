export interface ImageGenerationRequest {
  prompt: string;
  style?: string;
  width?: number;
  height?: number;
  quality?: string;
  seed?: number;
}

export interface ImageGenerationResponse {
  success: boolean;
  imageUrl?: string;
  error?: string;
  metadata?: {
    prompt: string;
    style?: string;
    dimensions: {
      width: number;
      height: number;
    };
    generatedAt: string;
    seed?: number;
  };
}

export interface GenerationHistory {
  id: string;
  prompt: string;
  imageUrl: string;
  style?: string;
  createdAt: string;
  metadata?: any;
}

const API_ENDPOINT = 'https://oi-server.onrender.com/chat/completions';
const CUSTOMER_ID = 'cus_SGPn4uhjPI0F4w';
const TIMEOUT_MS = 300000; // 5 minutes

export class ImageGenerationService {
  private static instance: ImageGenerationService;

  public static getInstance(): ImageGenerationService {
    if (!ImageGenerationService.instance) {
      ImageGenerationService.instance = new ImageGenerationService();
    }
    return ImageGenerationService.instance;
  }

  async generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
    try {
      const enhancedPrompt = this.enhancePrompt(request.prompt, request.style);
      
      const payload = {
        model: 'replicate/black-forest-labs/flux-1.1-pro',
        messages: [
          {
            role: 'system',
            content: 'You are an AI image generation assistant. Create detailed, high-quality images based on user prompts. Focus on artistic composition, proper lighting, and visual appeal. Interpret prompts creatively while maintaining the core requested elements. Generate images that are visually striking and professionally composed.'
          },
          {
            role: 'user',
            content: enhancedPrompt
          }
        ],
        max_tokens: 1024,
        temperature: 0.7,
        image_generation: {
          width: request.width || 1024,
          height: request.height || 1024,
          quality: request.quality || 'standard',
          seed: request.seed
        }
      };

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer xxx',
          'CustomerId': CUSTOMER_ID,
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.choices && data.choices[0] && data.choices[0].message) {
        const imageUrl = this.extractImageUrl(data.choices[0].message.content);
        
        if (imageUrl) {
          return {
            success: true,
            imageUrl,
            metadata: {
              prompt: request.prompt,
              style: request.style,
              dimensions: {
                width: request.width || 1024,
                height: request.height || 1024,
              },
              generatedAt: new Date().toISOString(),
              seed: request.seed,
            },
          };
        }
      }

      throw new Error('No image data received from API');
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return {
            success: false,
            error: 'Image generation timed out. Please try again with a simpler prompt.',
          };
        }
        return {
          success: false,
          error: error.message,
        };
      }
      return {
        success: false,
        error: 'An unexpected error occurred during image generation.',
      };
    }
  }

  private enhancePrompt(prompt: string, style?: string): string {
    let enhancedPrompt = prompt.trim();
    
    if (style) {
      const styleEnhancements = {
        photorealistic: 'photorealistic, high detail, professional photography, sharp focus, realistic lighting',
        artistic: 'artistic, creative composition, vibrant colors, expressive style, artistic interpretation',
        minimal: 'minimal design, clean composition, simple elements, elegant simplicity, modern aesthetic',
        cinematic: 'cinematic lighting, dramatic composition, movie-like quality, professional cinematography',
        fantasy: 'fantasy art, magical elements, imaginative design, ethereal atmosphere, mystical quality',
        abstract: 'abstract art, geometric patterns, creative interpretation, modern abstract style',
      };
      
      const enhancement = styleEnhancements[style as keyof typeof styleEnhancements];
      if (enhancement) {
        enhancedPrompt += `, ${enhancement}`;
      }
    }
    
    enhancedPrompt += ', high quality, detailed, professional composition';
    
    return enhancedPrompt;
  }

  private extractImageUrl(content: string): string | null {
    try {
      // Try to parse as JSON first
      const parsed = JSON.parse(content);
      if (parsed.image_url || parsed.url || parsed.imageUrl) {
        return parsed.image_url || parsed.url || parsed.imageUrl;
      }
    } catch {
      // If not JSON, look for URL patterns
      const urlPattern = /(https?:\/\/[^\s]+\.(jpg|jpeg|png|gif|webp))/i;
      const match = content.match(urlPattern);
      if (match) {
        return match[1];
      }
      
      // Look for base64 data URLs
      const base64Pattern = /data:image\/[^;]+;base64,[A-Za-z0-9+/=]+/;
      const base64Match = content.match(base64Pattern);
      if (base64Match) {
        return base64Match[0];
      }
    }
    
    return null;
  }

  async validatePrompt(prompt: string): Promise<{ valid: boolean; message?: string }> {
    if (!prompt || prompt.trim().length === 0) {
      return { valid: false, message: 'Prompt cannot be empty' };
    }
    
    if (prompt.length < 3) {
      return { valid: false, message: 'Prompt must be at least 3 characters long' };
    }
    
    if (prompt.length > 1000) {
      return { valid: false, message: 'Prompt must be less than 1000 characters' };
    }
    
    // Check for potentially problematic content
    const prohibitedTerms = ['nsfw', 'explicit', 'violence', 'gore', 'hate'];
    const lowerPrompt = prompt.toLowerCase();
    
    for (const term of prohibitedTerms) {
      if (lowerPrompt.includes(term)) {
        return { valid: false, message: 'Prompt contains prohibited content' };
      }
    }
    
    return { valid: true };
  }

  getPresetPrompts(): Array<{ name: string; prompt: string; style?: string }> {
    return [
      {
        name: 'Landscape',
        prompt: 'A breathtaking mountain landscape at sunset with golden light reflecting on a pristine lake',
        style: 'photorealistic'
      },
      {
        name: 'Portrait',
        prompt: 'Professional portrait of a person with natural lighting and soft background blur',
        style: 'photorealistic'
      },
      {
        name: 'Abstract Art',
        prompt: 'Flowing abstract composition with vibrant colors and dynamic movement',
        style: 'abstract'
      },
      {
        name: 'Fantasy Scene',
        prompt: 'Magical forest with glowing mushrooms and ethereal light filtering through ancient trees',
        style: 'fantasy'
      },
      {
        name: 'Architecture',
        prompt: 'Modern minimalist building with clean lines and geometric shapes against a clear sky',
        style: 'minimal'
      },
      {
        name: 'Still Life',
        prompt: 'Elegant still life composition with fresh flowers and natural lighting',
        style: 'artistic'
      }
    ];
  }

  getStyleOptions(): Array<{ value: string; label: string; description: string }> {
    return [
      {
        value: 'photorealistic',
        label: 'Photorealistic',
        description: 'High-detail, realistic photography style'
      },
      {
        value: 'artistic',
        label: 'Artistic',
        description: 'Creative and expressive artistic interpretation'
      },
      {
        value: 'minimal',
        label: 'Minimal',
        description: 'Clean, simple, and elegant design'
      },
      {
        value: 'cinematic',
        label: 'Cinematic',
        description: 'Movie-like dramatic lighting and composition'
      },
      {
        value: 'fantasy',
        label: 'Fantasy',
        description: 'Magical and imaginative fantasy art'
      },
      {
        value: 'abstract',
        label: 'Abstract',
        description: 'Modern abstract art with geometric patterns'
      }
    ];
  }

  getDimensionOptions(): Array<{ value: string; label: string; width: number; height: number }> {
    return [
      { value: '1:1', label: 'Square (1:1)', width: 1024, height: 1024 },
      { value: '16:9', label: 'Landscape (16:9)', width: 1344, height: 768 },
      { value: '9:16', label: 'Portrait (9:16)', width: 768, height: 1344 },
      { value: '4:3', label: 'Standard (4:3)', width: 1152, height: 896 },
      { value: '3:4', label: 'Portrait (3:4)', width: 896, height: 1152 },
      { value: '21:9', label: 'Ultrawide (21:9)', width: 1536, height: 640 }
    ];
  }
}

export const imageApi = ImageGenerationService.getInstance();