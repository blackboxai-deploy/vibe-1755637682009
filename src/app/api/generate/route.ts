import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { prompt, style = 'photorealistic', width = 1024, height = 1024 } = await request.json();

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return NextResponse.json(
        { error: 'Prompt is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    if (prompt.length > 1000) {
      return NextResponse.json(
        { error: 'Prompt must be less than 1000 characters' },
        { status: 400 }
      );
    }

    const stylePrompts = {
      photorealistic: 'photorealistic, high quality, detailed, professional photography',
      artistic: 'artistic, creative, expressive, stylized, beautiful composition',
      minimal: 'minimal, clean, simple, elegant, modern design',
      fantasy: 'fantasy, magical, ethereal, mystical, enchanting',
      cyberpunk: 'cyberpunk, futuristic, neon, high-tech, dystopian',
      vintage: 'vintage, retro, classic, nostalgic, timeless'
    };

    const enhancedPrompt = `${prompt}, ${stylePrompts[style as keyof typeof stylePrompts] || stylePrompts.photorealistic}`;

    const response = await fetch('https://oi-server.onrender.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer xxx',
        'CustomerId': 'cus_SGPn4uhjPI0F4w'
      },
      body: JSON.stringify({
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
        max_tokens: 1,
        temperature: 0.7,
        image_generation: true,
        width: width,
        height: height
      }),
      signal: AbortSignal.timeout(300000)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', response.status, errorText);
      
      if (response.status === 429) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Please try again in a moment.' },
          { status: 429 }
        );
      }
      
      if (response.status === 401) {
        return NextResponse.json(
          { error: 'Authentication failed. Please check API configuration.' },
          { status: 401 }
        );
      }

      return NextResponse.json(
        { error: 'Failed to generate image. Please try again.' },
        { status: 500 }
      );
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      return NextResponse.json(
        { error: 'Invalid response format from image generation service' },
        { status: 500 }
      );
    }

    const imageUrl = data.choices[0].message.content;
    
    if (!imageUrl || typeof imageUrl !== 'string') {
      return NextResponse.json(
        { error: 'No image URL received from generation service' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      imageUrl: imageUrl,
      prompt: enhancedPrompt,
      style: style,
      dimensions: { width, height },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Image generation error:', error);
    
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json(
        { error: 'Request timeout. Image generation took too long.' },
        { status: 408 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error during image generation' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'AI Image Generation API',
    version: '1.0.0',
    endpoints: {
      POST: '/api/generate - Generate images from text prompts'
    },
    supportedStyles: ['photorealistic', 'artistic', 'minimal', 'fantasy', 'cyberpunk', 'vintage'],
    maxPromptLength: 1000,
    supportedDimensions: ['1024x1024', '1024x768', '768x1024', '1536x1024', '1024x1536']
  });
}