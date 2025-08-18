// services/imageService.ts

// Unsplash API configuration
const UNSPLASH_ACCESS_KEY = 'YOUR_UNSPLASH_ACCESS_KEY'; // You'll need to get this from Unsplash
const PEXELS_API_KEY = 'YOUR_PEXELS_API_KEY'; // Alternative: Pexels API

// Fallback images for different categories
const FALLBACK_IMAGES = {
  entertainment: [
    'https://images.unsplash.com/photo-1598387846419-a2c870ad3ecd?w=800&q=80', // Concert crowd
    'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80', // Concert stage
    'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&q=80', // Concert lights
  ],
  movies: [
    'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&q=80', // Movie theater
    'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=800&q=80', // Movie set
    'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&q=80', // Movie audience
  ],
  music: [
    'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80', // Stage
    'https://images.unsplash.com/photo-1520166012956-add9ba0835cb?w=800&q=80', // Vinyl records
    'https://images.unsplash.com/photo-1471478331149-c72f17e33c73?w=800&q=80', // Music festival
  ],
  celebrity: [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80', // Portrait
    'https://images.unsplash.com/photo-1617136252869-d4b98f9e8b84?w=800&q=80', // Red carpet
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=800&q=80', // Fashion
  ],
  sports: [
    'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&q=80', // Stadium
    'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=800&q=80', // Basketball
    'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&q=80', // Football
  ],
  gaming: [
    'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800&q=80', // Gaming setup
    'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=800&q=80', // Gaming controller
    'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80', // Esports
  ],
  tvshows: [
    'https://images.unsplash.com/photo-1584905066893-7d5c142ba4e1?w=800&q=80', // TV screen
    'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=800&q=80', // Netflix
    'https://images.unsplash.com/photo-1560169897-fc0cdbdfa4d5?w=800&q=80', // Streaming
  ],
  socialmedia: [
    'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80', // Social apps
    'https://images.unsplash.com/photo-1611605698335-8b1569810432?w=800&q=80', // TikTok
    'https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?w=800&q=80', // Phone social
  ],
};

// Specific image mappings for popular topics
const SPECIFIC_IMAGES = {
  'taylor swift': [
    'https://images.unsplash.com/photo-1549834125-82d3c48159a3?w=800&q=80', // Concert performer
    'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&q=80', // Stage lights
  ],
  'beyonce': [
    'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80', // Female performer
    'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800&q=80', // Concert crowd
  ],
  'drake': [
    'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=800&q=80', // Hip hop concert
    'https://images.unsplash.com/photo-1565035010268-a3816f98589a?w=800&q=80', // Rap performance
  ],
  'marvel': [
    'https://images.unsplash.com/photo-1635805737707-575885ab0820?w=800&q=80', // Spider-Man
    'https://images.unsplash.com/photo-1608889175123-8ee362201f81?w=800&q=80', // Superhero
  ],
  'oscars': [
    'https://images.unsplash.com/photo-1616530940209-2c9e0fcd4c77?w=800&q=80', // Award trophy
    'https://images.unsplash.com/photo-1617136252869-d4b98f9e8b84?w=800&q=80', // Red carpet
  ],
  'super bowl': [
    'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&q=80', // Football
    'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=800&q=80', // Stadium
  ],
  'netflix': [
    'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=800&q=80', // Netflix on TV
    'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=800&q=80', // Netflix logo
  ],
  'stranger things': [
    'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=800&q=80', // 80s vibe
    'https://images.unsplash.com/photo-1578662996442-48f60103fc3e?w=800&q=80', // Retro TV
  ],
  'coachella': [
    'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&q=80', // Festival crowd
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80', // Concert hands
  ],
  'grammys': [
    'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=800&q=80', // Music awards
    'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80', // Stage performance
  ],
  'gta': [
    'https://images.unsplash.com/photo-1602082530252-8ec264db2ff5?w=800&q=80', // City skyline
    'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&q=80', // Gaming
  ],
  'tiktok': [
    'https://images.unsplash.com/photo-1611605698335-8b1569810432?w=800&q=80', // TikTok app
    'https://images.unsplash.com/photo-1595152772835-219674b2a8a6?w=800&q=80', // Phone recording
  ],
  'james bond': [
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80', // Man in suit
    'https://images.unsplash.com/photo-1600262912274-28f333fa5a46?w=800&q=80', // Casino
  ],
  'barbie': [
    'https://images.unsplash.com/photo-1626278664285-f796b9ee7806?w=800&q=80', // Pink aesthetic
    'https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=800&q=80', // Doll
  ],
  'oppenheimer': [
    'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=800&q=80', // Historical film
    'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&q=80', // Cinema
  ],
  'kpop': [
    'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800&q=80', // K-pop concert
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80', // Concert crowd
  ],
  'bad bunny': [
    'https://images.unsplash.com/photo-1565035010268-a3816f98589a?w=800&q=80', // Latin music
    'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=800&q=80', // Concert
  ],
  'rihanna': [
    'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80', // Female artist
    'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80', // Performance
  ],
  'the weeknd': [
    'https://images.unsplash.com/photo-1565035010268-a3816f98589a?w=800&q=80', // R&B performance
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80', // Concert
  ],
  'disney': [
    'https://images.unsplash.com/photo-1597466765990-64ad1c35dafc?w=800&q=80', // Disney castle
    'https://images.unsplash.com/photo-1620177088163-012f511de69e?w=800&q=80', // Disney magic
  ],
  'friends': [
    'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&q=80', // Friends gathering
    'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=800&q=80', // TV show
  ],
  'snl': [
    'https://images.unsplash.com/photo-1524169358666-79f22534bc6e?w=800&q=80', // Comedy stage
    'https://images.unsplash.com/photo-1560421683-6856ea585c78?w=800&q=80', // TV studio
  ],
};

/**
 * Get a relevant image URL based on keywords
 * @param keywords Array of keywords to search for
 * @returns Promise<string> Image URL
 */
export async function getRelevantImage(keywords: string[]): Promise<string> {
  try {
    // First, check for specific keyword matches
    const keywordString = keywords.join(' ').toLowerCase();
    
    // Check specific images first
    for (const [key, images] of Object.entries(SPECIFIC_IMAGES)) {
      if (keywordString.includes(key)) {
        return images[Math.floor(Math.random() * images.length)];
      }
    }
    
    // Determine category from keywords
    let category = 'entertainment';
    
    if (keywords.some(k => k.toLowerCase().includes('movie') || k.toLowerCase().includes('oscar') || k.toLowerCase().includes('film'))) {
      category = 'movies';
    } else if (keywords.some(k => k.toLowerCase().includes('music') || k.toLowerCase().includes('album') || k.toLowerCase().includes('concert') || k.toLowerCase().includes('tour'))) {
      category = 'music';
    } else if (keywords.some(k => k.toLowerCase().includes('celebrity') || k.toLowerCase().includes('engagement') || k.toLowerCase().includes('couple'))) {
      category = 'celebrity';
    } else if (keywords.some(k => k.toLowerCase().includes('sport') || k.toLowerCase().includes('nfl') || k.toLowerCase().includes('nba') || k.toLowerCase().includes('game'))) {
      category = 'sports';
    } else if (keywords.some(k => k.toLowerCase().includes('gaming') || k.toLowerCase().includes('video game') || k.toLowerCase().includes('gta') || k.toLowerCase().includes('xbox'))) {
      category = 'gaming';
    } else if (keywords.some(k => k.toLowerCase().includes('tv') || k.toLowerCase().includes('series') || k.toLowerCase().includes('show') || k.toLowerCase().includes('netflix'))) {
      category = 'tvshows';
    } else if (keywords.some(k => k.toLowerCase().includes('tiktok') || k.toLowerCase().includes('social') || k.toLowerCase().includes('instagram'))) {
      category = 'socialmedia';
    }
    
    // Get images from the appropriate category
    const categoryImages = FALLBACK_IMAGES[category as keyof typeof FALLBACK_IMAGES] || FALLBACK_IMAGES.entertainment;
    return categoryImages[Math.floor(Math.random() * categoryImages.length)];
    
  } catch (error) {
    console.error('Error getting relevant image:', error);
    // Return a fallback entertainment image
    return FALLBACK_IMAGES.entertainment[0];
  }
}

/**
 * Preload an image to ensure it's cached
 * @param url Image URL to preload
 */
export function preloadImage(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = url;
  });
}

/**
 * Preload multiple images
 * @param urls Array of image URLs
 */
export async function preloadImages(urls: string[]): Promise<void> {
  await Promise.all(urls.map(url => preloadImage(url)));
}

/**
 * Get category color for UI elements
 * @param category Category name
 * @returns Color hex string
 */
export function getCategoryColor(category: string): string {
  const colors: { [key: string]: string } = {
    Entertainment: '#FF6B6B',
    Movies: '#9B59B6',
    Music: '#3498DB',
    Celebrity: '#E91E63',
    Sports: '#2ECC71',
    Gaming: '#F39C12',
    'TV Shows': '#16A085',
    'Social Media': '#E74C3C',
    Politics: '#34495E',
    Crypto: '#F1C40F',
  };
  
  return colors[category] || '#00D4FF';
}
