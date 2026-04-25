/**
 * Seed data for video templates
 * Run this to populate the database with pre-built templates
 */

export const templatesSeedData = [
  // Marketing Templates
  {
    name: 'إعلان منتج احترافي',
    description: 'قالب إعلاني احترافي لعرض المنتجات بشكل جذاب',
    category: 'marketing',
    duration: 30,
    difficulty: 'easy',
    tags: ['إعلان', 'منتج', 'احترافي', 'سريع'],
    structure: JSON.stringify({
      scenes: [
        { type: 'intro', duration: 3, animation: 'fade' },
        { type: 'product', duration: 15, animation: 'zoom' },
        { type: 'features', duration: 8, animation: 'slide' },
        { type: 'cta', duration: 4, animation: 'fade' },
      ],
    }),
    defaultSettings: JSON.stringify({
      resolution: '1080p',
      fps: 30,
      colorGrade: 'vibrant',
    }),
  },
  {
    name: 'فيديو ترويجي سريع',
    description: 'فيديو ترويجي قصير وفعال للوسائط الاجتماعية',
    category: 'promo',
    duration: 15,
    difficulty: 'easy',
    tags: ['ترويج', 'سريع', 'وسائط اجتماعية'],
    structure: JSON.stringify({
      scenes: [
        { type: 'hook', duration: 2, animation: 'zoom' },
        { type: 'content', duration: 10, animation: 'dissolve' },
        { type: 'cta', duration: 3, animation: 'pulse' },
      ],
    }),
    defaultSettings: JSON.stringify({
      resolution: '1080p',
      fps: 30,
      format: 'square',
    }),
  },

  // Educational Templates
  {
    name: 'شرح تعليمي مفصل',
    description: 'قالب شامل لشرح المفاهيم والدروس التعليمية',
    category: 'education',
    duration: 300,
    difficulty: 'medium',
    tags: ['تعليم', 'شرح', 'درس', 'مفاهيم'],
    structure: JSON.stringify({
      scenes: [
        { type: 'intro', duration: 10, animation: 'fade' },
        { type: 'theory', duration: 150, animation: 'slide' },
        { type: 'examples', duration: 100, animation: 'zoom' },
        { type: 'summary', duration: 30, animation: 'fade' },
        { type: 'outro', duration: 10, animation: 'fade' },
      ],
    }),
    defaultSettings: JSON.stringify({
      resolution: '1080p',
      fps: 30,
      subtitles: true,
    }),
  },
  {
    name: 'دورة تدريبية متقدمة',
    description: 'قالب متقدم لإنشاء دورات تدريبية شاملة',
    category: 'education',
    duration: 1200,
    difficulty: 'hard',
    tags: ['تدريب', 'دورة', 'متقدم', 'احترافي'],
    structure: JSON.stringify({
      scenes: [
        { type: 'welcome', duration: 30 },
        { type: 'module', duration: 300, repeat: 4 },
        { type: 'quiz', duration: 60 },
        { type: 'conclusion', duration: 30 },
      ],
    }),
    defaultSettings: JSON.stringify({
      resolution: '1440p',
      fps: 60,
      interactiveElements: true,
    }),
  },

  // Tutorial Templates
  {
    name: 'شرح خطوة بخطوة',
    description: 'قالب مثالي لشرح الخطوات والعمليات',
    category: 'tutorial',
    duration: 180,
    difficulty: 'easy',
    tags: ['شرح', 'خطوات', 'تعليمي'],
    structure: JSON.stringify({
      scenes: [
        { type: 'intro', duration: 5 },
        { type: 'step', duration: 30, repeat: 5 },
        { type: 'tips', duration: 20 },
        { type: 'outro', duration: 5 },
      ],
    }),
    defaultSettings: JSON.stringify({
      resolution: '1080p',
      fps: 30,
      screenCapture: true,
    }),
  },
  {
    name: 'فيديو طريقة العمل',
    description: 'شرح مفصل لكيفية استخدام منتج أو خدمة',
    category: 'tutorial',
    duration: 120,
    difficulty: 'medium',
    tags: ['شرح', 'طريقة', 'استخدام'],
    structure: JSON.stringify({
      scenes: [
        { type: 'problem', duration: 15 },
        { type: 'solution', duration: 80 },
        { type: 'benefits', duration: 20 },
        { type: 'cta', duration: 5 },
      ],
    }),
    defaultSettings: JSON.stringify({
      resolution: '1080p',
      fps: 30,
      annotations: true,
    }),
  },

  // Intro/Outro Templates
  {
    name: 'مقدمة احترافية',
    description: 'مقدمة جذابة وديناميكية لبداية الفيديو',
    category: 'intro',
    duration: 10,
    difficulty: 'easy',
    tags: ['مقدمة', 'احترافي', 'ديناميكي'],
    structure: JSON.stringify({
      scenes: [
        { type: 'logo', duration: 3, animation: 'zoom' },
        { type: 'title', duration: 4, animation: 'slide' },
        { type: 'transition', duration: 3, animation: 'fade' },
      ],
    }),
    defaultSettings: JSON.stringify({
      resolution: '1080p',
      fps: 60,
      music: true,
    }),
  },
  {
    name: 'خاتمة مؤثرة',
    description: 'خاتمة قوية وجذابة لإنهاء الفيديو بتأثير',
    category: 'outro',
    duration: 8,
    difficulty: 'easy',
    tags: ['خاتمة', 'نداء للعمل', 'احترافي'],
    structure: JSON.stringify({
      scenes: [
        { type: 'summary', duration: 3 },
        { type: 'cta', duration: 3, animation: 'pulse' },
        { type: 'credits', duration: 2 },
      ],
    }),
    defaultSettings: JSON.stringify({
      resolution: '1080p',
      fps: 30,
      music: true,
    }),
  },

  // Social Media Templates
  {
    name: 'فيديو تيك توك',
    description: 'قالب مخصص لمنصة تيك توك والفيديوهات القصيرة',
    category: 'social',
    duration: 15,
    difficulty: 'easy',
    tags: ['تيك توك', 'قصير', 'وسائط اجتماعية'],
    structure: JSON.stringify({
      scenes: [
        { type: 'hook', duration: 2, animation: 'zoom' },
        { type: 'content', duration: 10, animation: 'dissolve' },
        { type: 'cta', duration: 3, animation: 'pulse' },
      ],
    }),
    defaultSettings: JSON.stringify({
      resolution: '1080p',
      fps: 30,
      format: 'vertical',
      effects: true,
    }),
  },
  {
    name: 'منشور إنستجرام ريلز',
    description: 'فيديو احترافي لمنصة إنستجرام ريلز',
    category: 'social',
    duration: 30,
    difficulty: 'easy',
    tags: ['إنستجرام', 'ريلز', 'احترافي'],
    structure: JSON.stringify({
      scenes: [
        { type: 'intro', duration: 3 },
        { type: 'main', duration: 24 },
        { type: 'outro', duration: 3 },
      ],
    }),
    defaultSettings: JSON.stringify({
      resolution: '1080p',
      fps: 30,
      format: 'vertical',
      music: true,
    }),
  },
  {
    name: 'فيديو يوتيوب شورتس',
    description: 'فيديو قصير لمنصة يوتيوب شورتس',
    category: 'social',
    duration: 60,
    difficulty: 'easy',
    tags: ['يوتيوب', 'شورتس', 'قصير'],
    structure: JSON.stringify({
      scenes: [
        { type: 'hook', duration: 3 },
        { type: 'content', duration: 50 },
        { type: 'cta', duration: 7 },
      ],
    }),
    defaultSettings: JSON.stringify({
      resolution: '1080p',
      fps: 30,
      format: 'vertical',
    }),
  },
];

/**
 * Template assets seed data
 */
export const assetsSeedData = [
  // Background Music
  {
    name: 'موسيقى خلفية احترافية',
    assetType: 'music',
    url: 'https://example.com/music/professional.mp3',
    category: 'background',
    duration: 120,
    metadata: JSON.stringify({ bpm: 120, mood: 'professional' }),
  },
  {
    name: 'موسيقى تحفيزية',
    assetType: 'music',
    url: 'https://example.com/music/motivational.mp3',
    category: 'motivational',
    duration: 180,
    metadata: JSON.stringify({ bpm: 140, mood: 'energetic' }),
  },

  // Sound Effects
  {
    name: 'صوت انتقال',
    assetType: 'sound',
    url: 'https://example.com/sounds/transition.mp3',
    category: 'transition',
    duration: 1,
  },
  {
    name: 'صوت نقر',
    assetType: 'sound',
    url: 'https://example.com/sounds/click.mp3',
    category: 'ui',
    duration: 0.5,
  },

  // Transitions
  {
    name: 'انتقال ذوبان',
    assetType: 'transition',
    url: 'https://example.com/transitions/fade.json',
    category: 'fade',
  },
  {
    name: 'انتقال انزلاق',
    assetType: 'transition',
    url: 'https://example.com/transitions/slide.json',
    category: 'slide',
  },

  // Fonts
  {
    name: 'خط عربي احترافي',
    assetType: 'font',
    url: 'https://example.com/fonts/arabic-pro.ttf',
    category: 'arabic',
  },
  {
    name: 'خط إنجليزي حديث',
    assetType: 'font',
    url: 'https://example.com/fonts/modern-en.ttf',
    category: 'english',
  },
];
