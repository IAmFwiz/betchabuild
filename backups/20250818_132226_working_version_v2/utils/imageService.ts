// utils/imageService.ts

const UNSPLASH_ACCESS_KEY = process.env.EXPO_PUBLIC_UNSPLASH_ACCESS_KEY || 'demo';
const PEXELS_API_KEY = process.env.EXPO_PUBLIC_PEXELS_API_KEY || 'demo';

// Fallback images for different categories
const FALLBACK_IMAGES = {
  SPORTS: [
    'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800', // Basketball
    'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800', // Football
    'https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?w=800', // Soccer
  ],
  POLITICS: [
    'https://images.unsplash.com/photo-1555848962-6e79363ec58f?w=800', // Capitol
    'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=800', // White House
    'https://images.unsplash.com/photo-1568378780196-a9a0444a9151?w=800', // Voting
  ],
  ENTERTAINMENT: [
    'https://images.unsplash.com/photo-1598387181032-a3103a2db5b3?w=800', // Movie
    'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800', // Music
    'https://images.unsplash.com/photo-1603190287605-e6ade32fa852?w=800', // Entertainment
  ],
  TECHNOLOGY: [
    'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800', // Tech
    'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800', // Gaming
    'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800', // Tech bg
  ],
  FINANCE: [
    'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800', // Trading
    'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800', // Charts
    'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800', // Finance
  ],
  DEFAULT: [
    'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?w=800', // Abstract
    'https://images.unsplash.com/photo-1557683316-973673baf926?w=800', // Gradient
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800', // Abstract 2
  ],
};

// Keywords to search for based on bet content
function extractKeywords(question: string): string {
  // Extract team names, player names, or key topics
  const sportsTeams = ['Lakers', 'Chiefs', 'Yankees', 'Patriots', 'Warriors'];
  const topics = ['election', 'championship', 'playoffs', 'inflation', 'technology'];
  
  let keyword = '';
  
  // Check for sports teams
  for (const team of sportsTeams) {
    if (question.toLowerCase().includes(team.toLowerCase())) {
      keyword = team;
      break;
    }
  }
  
  // If no team found, check for topics
  if (!keyword) {
    for (const topic of topics) {
      if (question.toLowerCase().includes(topic.toLowerCase())) {
        keyword = topic;
        break;
      }
    }
  }
  
  // Default to first significant word if nothing found
  if (!keyword) {
    const words = question.split(' ').filter(w => w.length > 4);
    keyword = words[0] || 'betting';
  }
  
  return keyword;
}

export async function getRelevantImage(
  question: string, 
  category: string = 'DEFAULT'
): Promise<string> {
  try {
    // For demo, use fallback images
    // In production, you'd call Unsplash/Pexels API here
    const categoryImages = FALLBACK_IMAGES[category as keyof typeof FALLBACK_IMAGES] 
      || FALLBACK_IMAGES.DEFAULT;
    
    // Return a random image from the category
    const randomIndex = Math.floor(Math.random() * categoryImages.length);
    return categoryImages[randomIndex];
    
    // Production code would look like:
    /*
    const keyword = extractKeywords(question);
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${keyword}&query=${keyword}&per_page=1`,
      {
        headers: {
          Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
        },
      }
    );
    const data = await response.json();
    return data.results[0]?.urls?.regular || categoryImages[0];
    */
  } catch (error) {
    console.error('Error fetching image:', error);
    const fallbacks = FALLBACK_IMAGES[category as keyof typeof FALLBACK_IMAGES] 
      || FALLBACK_IMAGES.DEFAULT;
    return fallbacks[0];
  }
}

export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    SPORTS: '#FF6B00',
    POLITICS: '#007AFF',
    ENTERTAINMENT: '#FF2D55',
    TECHNOLOGY: '#5856D6',
    FINANCE: '#34C759',
    DEFAULT: '#00D4FF',
  };
  
  return colors[category] || colors.DEFAULT;
}
