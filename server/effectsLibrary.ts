/**
 * Effects Library
 * Comprehensive pre-built animation effect sets
 */

export interface AnimationConfig {
  animationType: string;
  duration: number;
  delay: number;
  easing: string;
  iterations: number;
  direction: string;
  fillMode: string;
}

export interface EffectGroup {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  category: 'entrance' | 'exit' | 'emphasis' | 'custom';
  icon: string;
  animations: AnimationConfig[];
  difficulty: 'easy' | 'medium' | 'hard';
  duration: number;
  tags: string[];
}

/**
 * Entrance Effects - تأثيرات الدخول
 */
export const entranceEffects: EffectGroup[] = [
  {
    id: 'fade-in',
    name: 'Fade In',
    nameAr: 'تلاشي الدخول',
    description: 'Element fades in smoothly',
    descriptionAr: 'العنصر يظهر بتلاشي سلس',
    category: 'entrance',
    icon: '👁️',
    difficulty: 'easy',
    duration: 1000,
    tags: ['smooth', 'subtle', 'professional'],
    animations: [
      {
        animationType: 'fade',
        duration: 1000,
        delay: 0,
        easing: 'ease-in-out',
        iterations: 1,
        direction: 'normal',
        fillMode: 'forwards',
      },
    ],
  },
  {
    id: 'slide-in-left',
    name: 'Slide In Left',
    nameAr: 'انزلاق من اليسار',
    description: 'Element slides in from the left',
    descriptionAr: 'العنصر ينزلق من اليسار',
    category: 'entrance',
    icon: '➡️',
    difficulty: 'easy',
    duration: 800,
    tags: ['dynamic', 'modern', 'smooth'],
    animations: [
      {
        animationType: 'slide',
        duration: 800,
        delay: 0,
        easing: 'ease-out',
        iterations: 1,
        direction: 'normal',
        fillMode: 'forwards',
      },
    ],
  },
  {
    id: 'zoom-in',
    name: 'Zoom In',
    nameAr: 'تكبير الدخول',
    description: 'Element zooms in from center',
    descriptionAr: 'العنصر يتكبر من المركز',
    category: 'entrance',
    icon: '🔍',
    difficulty: 'easy',
    duration: 600,
    tags: ['attention', 'dramatic', 'modern'],
    animations: [
      {
        animationType: 'zoom',
        duration: 600,
        delay: 0,
        easing: 'ease-out',
        iterations: 1,
        direction: 'normal',
        fillMode: 'forwards',
      },
    ],
  },
  {
    id: 'bounce-in',
    name: 'Bounce In',
    nameAr: 'ارتداد الدخول',
    description: 'Element bounces in with energy',
    descriptionAr: 'العنصر يرتد عند الدخول بطاقة',
    category: 'entrance',
    icon: '⬆️',
    difficulty: 'medium',
    duration: 1200,
    tags: ['energetic', 'fun', 'playful'],
    animations: [
      {
        animationType: 'bounce',
        duration: 1200,
        delay: 0,
        easing: 'ease-out',
        iterations: 1,
        direction: 'normal',
        fillMode: 'forwards',
      },
    ],
  },
  {
    id: 'flip-in',
    name: 'Flip In',
    nameAr: 'قلب الدخول',
    description: 'Element flips in with 3D effect',
    descriptionAr: 'العنصر يقلب عند الدخول بتأثير ثلاثي الأبعاد',
    category: 'entrance',
    icon: '🔀',
    difficulty: 'medium',
    duration: 1000,
    tags: ['3d', 'dramatic', 'modern'],
    animations: [
      {
        animationType: 'flip',
        duration: 1000,
        delay: 0,
        easing: 'ease-out',
        iterations: 1,
        direction: 'normal',
        fillMode: 'forwards',
      },
    ],
  },
  {
    id: 'rotate-in',
    name: 'Rotate In',
    nameAr: 'دوران الدخول',
    description: 'Element rotates in',
    descriptionAr: 'العنصر يدور عند الدخول',
    category: 'entrance',
    icon: '🔄',
    difficulty: 'medium',
    duration: 1000,
    tags: ['dynamic', 'modern', 'attention'],
    animations: [
      {
        animationType: 'rotate',
        duration: 1000,
        delay: 0,
        easing: 'ease-out',
        iterations: 1,
        direction: 'normal',
        fillMode: 'forwards',
      },
    ],
  },
];

/**
 * Exit Effects - تأثيرات الخروج
 */
export const exitEffects: EffectGroup[] = [
  {
    id: 'fade-out',
    name: 'Fade Out',
    nameAr: 'تلاشي الخروج',
    description: 'Element fades out smoothly',
    descriptionAr: 'العنصر يختفي بتلاشي سلس',
    category: 'exit',
    icon: '👁️',
    difficulty: 'easy',
    duration: 1000,
    tags: ['smooth', 'subtle', 'professional'],
    animations: [
      {
        animationType: 'fade',
        duration: 1000,
        delay: 0,
        easing: 'ease-in',
        iterations: 1,
        direction: 'reverse',
        fillMode: 'forwards',
      },
    ],
  },
  {
    id: 'slide-out-right',
    name: 'Slide Out Right',
    nameAr: 'انزلاق إلى اليمين',
    description: 'Element slides out to the right',
    descriptionAr: 'العنصر ينزلق إلى اليمين',
    category: 'exit',
    icon: '➡️',
    difficulty: 'easy',
    duration: 800,
    tags: ['dynamic', 'modern', 'smooth'],
    animations: [
      {
        animationType: 'slide',
        duration: 800,
        delay: 0,
        easing: 'ease-in',
        iterations: 1,
        direction: 'reverse',
        fillMode: 'forwards',
      },
    ],
  },
  {
    id: 'zoom-out',
    name: 'Zoom Out',
    nameAr: 'تصغير الخروج',
    description: 'Element zooms out to center',
    descriptionAr: 'العنصر يتصغر إلى المركز',
    category: 'exit',
    icon: '🔍',
    difficulty: 'easy',
    duration: 600,
    tags: ['attention', 'dramatic', 'modern'],
    animations: [
      {
        animationType: 'zoom',
        duration: 600,
        delay: 0,
        easing: 'ease-in',
        iterations: 1,
        direction: 'reverse',
        fillMode: 'forwards',
      },
    ],
  },
  {
    id: 'bounce-out',
    name: 'Bounce Out',
    nameAr: 'ارتداد الخروج',
    description: 'Element bounces out with energy',
    descriptionAr: 'العنصر يرتد عند الخروج بطاقة',
    category: 'exit',
    icon: '⬆️',
    difficulty: 'medium',
    duration: 1200,
    tags: ['energetic', 'fun', 'playful'],
    animations: [
      {
        animationType: 'bounce',
        duration: 1200,
        delay: 0,
        easing: 'ease-in',
        iterations: 1,
        direction: 'reverse',
        fillMode: 'forwards',
      },
    ],
  },
  {
    id: 'flip-out',
    name: 'Flip Out',
    nameAr: 'قلب الخروج',
    description: 'Element flips out with 3D effect',
    descriptionAr: 'العنصر يقلب عند الخروج بتأثير ثلاثي الأبعاد',
    category: 'exit',
    icon: '🔀',
    difficulty: 'medium',
    duration: 1000,
    tags: ['3d', 'dramatic', 'modern'],
    animations: [
      {
        animationType: 'flip',
        duration: 1000,
        delay: 0,
        easing: 'ease-in',
        iterations: 1,
        direction: 'reverse',
        fillMode: 'forwards',
      },
    ],
  },
];

/**
 * Emphasis Effects - تأثيرات التركيز
 */
export const emphasisEffects: EffectGroup[] = [
  {
    id: 'pulse',
    name: 'Pulse',
    nameAr: 'نبض',
    description: 'Element pulses to draw attention',
    descriptionAr: 'العنصر ينبض لجذب الانتباه',
    category: 'emphasis',
    icon: '💓',
    difficulty: 'easy',
    duration: 1000,
    tags: ['attention', 'subtle', 'professional'],
    animations: [
      {
        animationType: 'pulse',
        duration: 1000,
        delay: 0,
        easing: 'ease-in-out',
        iterations: -1,
        direction: 'normal',
        fillMode: 'forwards',
      },
    ],
  },
  {
    id: 'shake',
    name: 'Shake',
    nameAr: 'اهتزاز',
    description: 'Element shakes for emphasis',
    descriptionAr: 'العنصر يهتز للتركيز',
    category: 'emphasis',
    icon: '📳',
    difficulty: 'easy',
    duration: 600,
    tags: ['attention', 'energetic', 'fun'],
    animations: [
      {
        animationType: 'shake',
        duration: 600,
        delay: 0,
        easing: 'linear',
        iterations: 1,
        direction: 'normal',
        fillMode: 'forwards',
      },
    ],
  },
  {
    id: 'heartbeat',
    name: 'Heartbeat',
    nameAr: 'نبضات القلب',
    description: 'Element beats like a heart',
    descriptionAr: 'العنصر ينبض مثل القلب',
    category: 'emphasis',
    icon: '❤️',
    difficulty: 'medium',
    duration: 1300,
    tags: ['emotional', 'attention', 'dramatic'],
    animations: [
      {
        animationType: 'heartbeat',
        duration: 1300,
        delay: 0,
        easing: 'ease-in-out',
        iterations: -1,
        direction: 'normal',
        fillMode: 'forwards',
      },
    ],
  },
  {
    id: 'swing',
    name: 'Swing',
    nameAr: 'تأرجح',
    description: 'Element swings for emphasis',
    descriptionAr: 'العنصر يتأرجح للتركيز',
    category: 'emphasis',
    icon: '🎪',
    difficulty: 'medium',
    duration: 1000,
    tags: ['playful', 'attention', 'fun'],
    animations: [
      {
        animationType: 'swing',
        duration: 1000,
        delay: 0,
        easing: 'ease-in-out',
        iterations: -1,
        direction: 'normal',
        fillMode: 'forwards',
      },
    ],
  },
];

/**
 * Combined Effects - تأثيرات مركبة
 */
export const combinedEffects: EffectGroup[] = [
  {
    id: 'dramatic-entrance',
    name: 'Dramatic Entrance',
    nameAr: 'دخول درامي',
    description: 'Zoom + Fade for dramatic effect',
    descriptionAr: 'تكبير + تلاشي لتأثير درامي',
    category: 'custom',
    icon: '🎬',
    difficulty: 'hard',
    duration: 1500,
    tags: ['dramatic', 'professional', 'attention'],
    animations: [
      {
        animationType: 'zoom',
        duration: 1000,
        delay: 0,
        easing: 'ease-out',
        iterations: 1,
        direction: 'normal',
        fillMode: 'forwards',
      },
      {
        animationType: 'fade',
        duration: 1000,
        delay: 0,
        easing: 'ease-in-out',
        iterations: 1,
        direction: 'normal',
        fillMode: 'forwards',
      },
    ],
  },
  {
    id: 'smooth-transition',
    name: 'Smooth Transition',
    nameAr: 'انتقال سلس',
    description: 'Fade + Slide for smooth transition',
    descriptionAr: 'تلاشي + انزلاق لانتقال سلس',
    category: 'custom',
    icon: '🌊',
    difficulty: 'medium',
    duration: 1200,
    tags: ['smooth', 'professional', 'modern'],
    animations: [
      {
        animationType: 'fade',
        duration: 600,
        delay: 0,
        easing: 'ease-in-out',
        iterations: 1,
        direction: 'normal',
        fillMode: 'forwards',
      },
      {
        animationType: 'slide',
        duration: 800,
        delay: 200,
        easing: 'ease-out',
        iterations: 1,
        direction: 'normal',
        fillMode: 'forwards',
      },
    ],
  },
  {
    id: 'celebration',
    name: 'Celebration',
    nameAr: 'احتفالي',
    description: 'Bounce + Pulse for celebration',
    descriptionAr: 'ارتداد + نبض للاحتفال',
    category: 'custom',
    icon: '🎉',
    difficulty: 'hard',
    duration: 2000,
    tags: ['fun', 'energetic', 'playful'],
    animations: [
      {
        animationType: 'bounce',
        duration: 1200,
        delay: 0,
        easing: 'ease-out',
        iterations: 1,
        direction: 'normal',
        fillMode: 'forwards',
      },
      {
        animationType: 'pulse',
        duration: 800,
        delay: 1200,
        easing: 'ease-in-out',
        iterations: 2,
        direction: 'normal',
        fillMode: 'forwards',
      },
    ],
  },
  {
    id: 'attention-grabber',
    name: 'Attention Grabber',
    nameAr: 'جاذب الانتباه',
    description: 'Shake + Pulse for maximum attention',
    descriptionAr: 'اهتزاز + نبض لأقصى انتباه',
    category: 'custom',
    icon: '⚡',
    difficulty: 'hard',
    duration: 1600,
    tags: ['attention', 'dramatic', 'energetic'],
    animations: [
      {
        animationType: 'shake',
        duration: 600,
        delay: 0,
        easing: 'linear',
        iterations: 1,
        direction: 'normal',
        fillMode: 'forwards',
      },
      {
        animationType: 'pulse',
        duration: 1000,
        delay: 600,
        easing: 'ease-in-out',
        iterations: 2,
        direction: 'normal',
        fillMode: 'forwards',
      },
    ],
  },
];

/**
 * Get all effect groups
 */
export function getAllEffectGroups(): EffectGroup[] {
  return [
    ...entranceEffects,
    ...exitEffects,
    ...emphasisEffects,
    ...combinedEffects,
  ];
}

/**
 * Get effect groups by category
 */
export function getEffectsByCategory(
  category: 'entrance' | 'exit' | 'emphasis' | 'custom'
): EffectGroup[] {
  const allEffects = getAllEffectGroups();
  return allEffects.filter((effect) => effect.category === category);
}

/**
 * Get effect group by ID
 */
export function getEffectById(id: string): EffectGroup | undefined {
  const allEffects = getAllEffectGroups();
  return allEffects.find((effect) => effect.id === id);
}

/**
 * Search effects by tags
 */
export function searchEffectsByTags(tags: string[]): EffectGroup[] {
  const allEffects = getAllEffectGroups();
  return allEffects.filter((effect) =>
    tags.some((tag) => effect.tags.includes(tag))
  );
}

/**
 * Get effects by difficulty
 */
export function getEffectsByDifficulty(
  difficulty: 'easy' | 'medium' | 'hard'
): EffectGroup[] {
  const allEffects = getAllEffectGroups();
  return allEffects.filter((effect) => effect.difficulty === difficulty);
}

/**
 * Get random effect
 */
export function getRandomEffect(): EffectGroup {
  const allEffects = getAllEffectGroups();
  return allEffects[Math.floor(Math.random() * allEffects.length)];
}

/**
 * Get recommended effects for a category
 */
export function getRecommendedEffects(category: string): EffectGroup[] {
  const allEffects = getAllEffectGroups();
  const categoryEffects = allEffects.filter(
    (effect) => effect.category === category
  );
  return categoryEffects.slice(0, 3);
}
