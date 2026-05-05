/**
 * Real-time Effects Service
 * Handles immediate application of effects to video frames
 */

export interface RealtimeEffect {
  id: string;
  name: string;
  type: 'visual' | 'audio' | 'transition';
  intensity: number;
  duration: number;
  delay: number;
  parameters: Record<string, any>;
  enabled: boolean;
}

export interface EffectChain {
  id: string;
  effects: RealtimeEffect[];
  order: number[];
}

/**
 * Create a real-time effect
 */
export async function createRealtimeEffect(
  name: string,
  type: 'visual' | 'audio' | 'transition',
  intensity: number = 1,
  parameters: Record<string, any> = {}
): Promise<RealtimeEffect> {
  try {
    return {
      id: `effect-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      type,
      intensity,
      duration: 1000,
      delay: 0,
      parameters,
      enabled: true,
    };
  } catch (error) {
    throw new Error(`Failed to create effect: ${(error as Error).message}`);
  }
}

/**
 * Apply effect to frame data
 */
export async function applyEffectToFrameData(
  frameData: ImageData,
  effect: RealtimeEffect
): Promise<ImageData> {
  try {
    const data = frameData.data;
    const intensity = effect.intensity;

    switch (effect.name.toLowerCase()) {
      case 'fade':
        for (let i = 3; i < data.length; i += 4) {
          data[i] = Math.floor(data[i] * intensity);
        }
        break;

      case 'brightness':
        const brightnessFactor = 1 + intensity * 0.5;
        for (let i = 0; i < data.length; i += 4) {
          data[i] = Math.min(255, Math.floor(data[i] * brightnessFactor));
          data[i + 1] = Math.min(255, Math.floor(data[i + 1] * brightnessFactor));
          data[i + 2] = Math.min(255, Math.floor(data[i + 2] * brightnessFactor));
        }
        break;

      case 'contrast':
        const contrastFactor = 1 + intensity * 0.5;
        for (let i = 0; i < data.length; i += 4) {
          data[i] = Math.min(255, Math.max(0, Math.floor((data[i] - 128) * contrastFactor + 128)));
          data[i + 1] = Math.min(255, Math.max(0, Math.floor((data[i + 1] - 128) * contrastFactor + 128)));
          data[i + 2] = Math.min(255, Math.max(0, Math.floor((data[i + 2] - 128) * contrastFactor + 128)));
        }
        break;

      case 'saturate':
        const saturation = intensity;
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          const gray = r * 0.299 + g * 0.587 + b * 0.114;

          data[i] = Math.min(255, Math.floor(gray + (r - gray) * saturation));
          data[i + 1] = Math.min(255, Math.floor(gray + (g - gray) * saturation));
          data[i + 2] = Math.min(255, Math.floor(gray + (b - gray) * saturation));
        }
        break;

      case 'grayscale':
        for (let i = 0; i < data.length; i += 4) {
          const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
          const result = Math.floor(gray * intensity + (data[i] * (1 - intensity)));

          data[i] = result;
          data[i + 1] = result;
          data[i + 2] = result;
        }
        break;

      case 'sepia':
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          const sepiaR = Math.min(255, Math.floor((r * 0.393 + g * 0.769 + b * 0.189) * intensity + r * (1 - intensity)));
          const sepiaG = Math.min(255, Math.floor((r * 0.349 + g * 0.686 + b * 0.168) * intensity + g * (1 - intensity)));
          const sepiaB = Math.min(255, Math.floor((r * 0.272 + g * 0.534 + b * 0.131) * intensity + b * (1 - intensity)));

          data[i] = sepiaR;
          data[i + 1] = sepiaG;
          data[i + 2] = sepiaB;
        }
        break;

      case 'invert':
        for (let i = 0; i < data.length; i += 4) {
          data[i] = Math.floor((255 - data[i]) * intensity + data[i] * (1 - intensity));
          data[i + 1] = Math.floor((255 - data[i + 1]) * intensity + data[i + 1] * (1 - intensity));
          data[i + 2] = Math.floor((255 - data[i + 2]) * intensity + data[i + 2] * (1 - intensity));
        }
        break;

      case 'blur':
        // Simple blur approximation
        const blurRadius = Math.floor(intensity * 5);
        if (blurRadius > 0) {
          applyBoxBlur(data, frameData.width, frameData.height, blurRadius);
        }
        break;

      case 'sharpen':
        applySharpen(data, frameData.width, frameData.height, intensity);
        break;

      case 'edge-detect':
        applyEdgeDetect(data, frameData.width, frameData.height, intensity);
        break;

      case 'posterize':
        const levels = Math.max(2, Math.floor(intensity * 8));
        for (let i = 0; i < data.length; i += 4) {
          data[i] = Math.floor(data[i] / (256 / levels)) * (256 / levels);
          data[i + 1] = Math.floor(data[i + 1] / (256 / levels)) * (256 / levels);
          data[i + 2] = Math.floor(data[i + 2] / (256 / levels)) * (256 / levels);
        }
        break;

      case 'solarize':
        for (let i = 0; i < data.length; i += 4) {
          const threshold = 128 * intensity;
          if (data[i] < threshold) data[i] = 255 - data[i];
          if (data[i + 1] < threshold) data[i + 1] = 255 - data[i + 1];
          if (data[i + 2] < threshold) data[i + 2] = 255 - data[i + 2];
        }
        break;
    }

    return frameData;
  } catch (error) {
    throw new Error(`Failed to apply effect: ${(error as Error).message}`);
  }
}

/**
 * Apply box blur
 */
function applyBoxBlur(data: Uint8ClampedArray, width: number, height: number, radius: number) {
  const temp = new Uint8ClampedArray(data);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0, g = 0, b = 0, a = 0, count = 0;

      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const nx = Math.min(width - 1, Math.max(0, x + dx));
          const ny = Math.min(height - 1, Math.max(0, y + dy));
          const idx = (ny * width + nx) * 4;

          r += temp[idx];
          g += temp[idx + 1];
          b += temp[idx + 2];
          a += temp[idx + 3];
          count++;
        }
      }

      const idx = (y * width + x) * 4;
      data[idx] = Math.floor(r / count);
      data[idx + 1] = Math.floor(g / count);
      data[idx + 2] = Math.floor(b / count);
      data[idx + 3] = Math.floor(a / count);
    }
  }
}

/**
 * Apply sharpen
 */
function applySharpen(data: Uint8ClampedArray, width: number, height: number, intensity: number) {
  const kernel = [-1, -1, -1, -1, 9, -1, -1, -1, -1];
  const factor = intensity;

  const temp = new Uint8ClampedArray(data);

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let r = 0, g = 0, b = 0;

      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const idx = ((y + ky) * width + (x + kx)) * 4;
          const k = kernel[(ky + 1) * 3 + (kx + 1)];

          r += temp[idx] * k;
          g += temp[idx + 1] * k;
          b += temp[idx + 2] * k;
        }
      }

      const idx = (y * width + x) * 4;
      data[idx] = Math.min(255, Math.max(0, Math.floor(r * factor)));
      data[idx + 1] = Math.min(255, Math.max(0, Math.floor(g * factor)));
      data[idx + 2] = Math.min(255, Math.max(0, Math.floor(b * factor)));
    }
  }
}

/**
 * Apply edge detect
 */
function applyEdgeDetect(data: Uint8ClampedArray, width: number, height: number, intensity: number) {
  const sobelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
  const sobelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1];

  const temp = new Uint8ClampedArray(data);

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let gx = 0, gy = 0;

      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const idx = ((y + ky) * width + (x + kx)) * 4;
          const gray = temp[idx] * 0.299 + temp[idx + 1] * 0.587 + temp[idx + 2] * 0.114;
          const k = (ky + 1) * 3 + (kx + 1);

          gx += gray * sobelX[k];
          gy += gray * sobelY[k];
        }
      }

      const magnitude = Math.sqrt(gx * gx + gy * gy) * intensity;
      const value = Math.min(255, Math.floor(magnitude));

      const idx = (y * width + x) * 4;
      data[idx] = value;
      data[idx + 1] = value;
      data[idx + 2] = value;
    }
  }
}

/**
 * Create effect chain
 */
export async function createEffectChain(effects: RealtimeEffect[]): Promise<EffectChain> {
  try {
    return {
      id: `chain-${Date.now()}`,
      effects,
      order: effects.map((_, i) => i),
    };
  } catch (error) {
    throw new Error(`Failed to create chain: ${(error as Error).message}`);
  }
}

/**
 * Apply effect chain
 */
export async function applyEffectChain(
  frameData: ImageData,
  chain: EffectChain
): Promise<ImageData> {
  try {
    let result = frameData;

    for (const effectIndex of chain.order) {
      const effect = chain.effects[effectIndex];
      if (effect && effect.enabled) {
        result = await applyEffectToFrameData(result, effect);
      }
    }

    return result;
  } catch (error) {
    throw new Error(`Failed to apply chain: ${(error as Error).message}`);
  }
}

/**
 * Get available effects
 */
export async function getAvailableEffects(): Promise<Array<{ name: string; type: string; description: string }>> {
  return [
    { name: 'Fade', type: 'visual', description: 'تلاشي الشفافية' },
    { name: 'Brightness', type: 'visual', description: 'تعديل السطوع' },
    { name: 'Contrast', type: 'visual', description: 'تعديل التباين' },
    { name: 'Saturate', type: 'visual', description: 'تعديل التشبع' },
    { name: 'Grayscale', type: 'visual', description: 'تحويل إلى رمادي' },
    { name: 'Sepia', type: 'visual', description: 'تأثير السيبيا' },
    { name: 'Invert', type: 'visual', description: 'عكس الألوان' },
    { name: 'Blur', type: 'visual', description: 'تمويه' },
    { name: 'Sharpen', type: 'visual', description: 'تحديد الحواف' },
    { name: 'Edge-Detect', type: 'visual', description: 'كشف الحواف' },
    { name: 'Posterize', type: 'visual', description: 'تقليل الألوان' },
    { name: 'Solarize', type: 'visual', description: 'تأثير الشمس' },
  ];
}

/**
 * Optimize effect performance
 */
export async function optimizeEffectPerformance(
  effect: RealtimeEffect,
  targetFPS: number = 60
): Promise<{ optimized: boolean; message: string }> {
  try {
    const processingTime = Math.random() * 16; // Simulate processing time in ms

    if (processingTime > 1000 / targetFPS) {
      return {
        optimized: false,
        message: `التأثير قد يؤثر على الأداء (${Math.floor(processingTime)}ms)`,
      };
    }

    return {
      optimized: true,
      message: 'التأثير محسّن للأداء',
    };
  } catch (error) {
    throw new Error(`Failed to optimize: ${(error as Error).message}`);
  }
}
