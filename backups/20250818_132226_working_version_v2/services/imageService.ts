// services/imageService.ts

const UNSPLASH_ACCESS_KEY = 'YOUR_UNSPLASH_ACCESS_KEY'; // You'll need to get this from Unsplash

// Fallback images for different categories
const CATEGORY_IMAGES: { [key: string]: string[] } = {
  'federal reserve': [
    'https://images.unsplash.com/photo-1541354329998-f4d9a9f9297f?w=800',
    'https://images.unsplash.com/photo-1604156425963-9be03f86a428?w=800',
  ],
  'interest rates': [
    'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800',
    'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800',
  ],
  'tesla': [
    'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800',
    'https://images.unsplash.com/photo-1617886322207-6f504e7472c5?w=800',
  ],
  'stock market': [
    'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800',
    'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800',
  ],
  'bitcoin': [
    'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=800',
    'https://images.unsplash.com/photo-1516245834210-c4c142787335?w=800',
  ],
  'cryptocurrency': [
    'https://images.unsplash.com/photo-1605792657660-596af9009e82?w=800',
    'https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=800',
  ],
  'government': [
    'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800',
    'https://images.unsplash.com/photo-1555848962-6e79363ec58f?w=800',
  ],
  'politics': [
    'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800',
    'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=800',
  ],
  'apple': [
    'https://images.unsplash.com/photo-1611262588024-d12430b98920?w=800',
    'https://images.unsplash.com/photo-1609692814857-d0e8a6ffc833?w=800',
  ],
  'macbook': [
    'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800',
    'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800',
  ],
  'lakers': [
    'https://images.unsplash.com/photo-1504450758481-7338eba7524a?w=800',
    'https://images.unsplash.com/photo-1519861531473-9200262188bf?w=800',
  ],
  'nba': [
    'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800',
    'https://images.unsplash.com/photo-1499754162586-08f451261482?w=800',
  ],
  'basketball': [
    'https://images.unsplash.com/photo-1515523110800-9415d13b84a8?w=800',
    'https://images.unsplash.com/photo-1574623452334-1e0ac2b3ccb4?w=800',
  ],
  'spacex': [
    'https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?w=800',
    'https://images.unsplash.com/photo-1517976487492-5750f3195933?w=800',
  ],
  'rocket': [
    'https://images.unsplash.com/photo-1628126235206-5260b9ea6441?w=800',
    'https://images.unsplash.com/photo-1636819488524-1f019c4e1dce?w=800',
  ],
  'inflation': [
    'https://images.unsplash.com/photo-1634542984003-e0fb8e200e91?w=800',
    'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800',
  ],
  'economy': [
    'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800',
    'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800',
  ],
  'netflix': [
    'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=800',
    'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=800',
  ],
  'streaming': [
    'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800',
    'https://images.unsplash.com/photo-1615986201152-7686a4867f30?w=800',
  ],
  'european union': [
    'https://images.unsplash.com/photo-1564410267841-915d8e4d71ea?w=800',
    'https://images.unsplash.com/photo-1471623432079-b009d30b6729?w=800',
  ],
  'ai': [
    'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800',
    'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800',
  ],
  'artificial intelligence': [
    'https://images.unsplash.com/photo-1555255707-c07966088b7b?w=800',
    'https://images.unsplash.com/photo-1676299081847-c3901b2bbb67?w=800',
  ],
  'ethereum': [
    'https://images.unsplash.com/photo-1640833906651-6bd1af7aeea3?w=800',
    'https://images.unsplash.com/photo-1622630998477-20aa696ecb05?w=800',
  ],
  'super bowl': [
    'https://images.unsplash.com/photo-1566479117145-292b270b3cd0?w=800',
    'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800',
  ],
  'nfl': [
    'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800',
    'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=800',
  ],
  'football': [
    'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800',
    'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=800',
  ],
  'google': [
    'https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?w=800',
    'https://images.unsplash.com/photo-1529612700005-e35377bf1415?w=800',
  ],
  'pixel': [
    'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800',
    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800',
  ],
  'oil': [
    'https://images.unsplash.com/photo-1548247416-ec66f4900b2e?w=800',
    'https://images.unsplash.com/photo-1568395690648-4c9e19bb9df1?w=800',
  ],
  'energy': [
    'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800',
    'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800',
  ],
  'china': [
    'https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?w=800',
    'https://images.unsplash.com/photo-1508804052814-cd3ba865a116?w=800',
  ],
  'manchester city': [
    'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=800',
    'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800',
  ],
  'champions league': [
    'https://images.unsplash.com/photo-1518604666860-9ed391f76460?w=800',
    'https://images.unsplash.com/photo-1551958219-acbc608c6377?w=800',
  ],
  'soccer': [
    'https://images.unsplash.com/photo-1551958219-acbc608c6377?w=800',
    'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800',
  ],
  'microsoft': [
    'https://images.unsplash.com/photo-1633419461186-7d40a38105ec?w=800',
    'https://images.unsplash.com/photo-1640132567182-98536075cb8f?w=800',
  ],
  'gaming': [
    'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800',
    'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=800',
  ],
  'xbox': [
    'https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=800',
    'https://images.unsplash.com/photo-1605901309584-818e25960a8f?w=800',
  ],
  'unemployment': [
    'https://images.unsplash.com/photo-1533750516457-a7f992034fec?w=800',
    'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800',
  ],
  'jobs': [
    'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
  ],
  'amc': [
    'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800',
    'https://images.unsplash.com/photo-1595769816263-9b910be24d5f?w=800',
  ],
  'cinema': [
    'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800',
    'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800',
  ],
  'hack': [
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800',
    'https://images.unsplash.com/photo-1563206767-5b18f218e8de?w=800',
  ],
  'security': [
    'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800',
    'https://images.unsplash.com/photo-1510511459019-5dda7724fd87?w=800',
  ],
  'blockchain': [
    'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800',
    'https://images.unsplash.com/photo-1644143379190-08a9cbe2c3f5?w=800',
  ],
};

// Default fallback images by category
const DEFAULT_CATEGORY_IMAGES: { [key: string]: string } = {
  'Economics': 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800',
  'Markets': 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800',
  'Crypto': 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=800',
  'Politics': 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800',
  'Technology': 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800',
  'Sports': 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800',
  'Entertainment': 'https://images.unsplash.com/photo-1603190287605-e6ade32fa852?w=800',
};

/**
 * Get a relevant image URL based on keywords
 * @param keywords Array of keywords to search for
 * @returns Promise<string> Image URL
 */
export async function getRelevantImage(keywords: string[]): Promise<string> {
  // Try to find a matching keyword in our curated images
  for (const keyword of keywords) {
    const lowerKeyword = keyword.toLowerCase();
    
    // Check if we have images for this keyword
    if (CATEGORY_IMAGES[lowerKeyword]) {
      // Return a random image from the available options
      const images = CATEGORY_IMAGES[lowerKeyword];
      return images[Math.floor(Math.random() * images.length)];
    }
    
    // Check partial matches
    for (const [key, images] of Object.entries(CATEGORY_IMAGES)) {
      if (lowerKeyword.includes(key) || key.includes(lowerKeyword)) {
        return images[Math.floor(Math.random() * images.length)];
      }
    }
  }
  
  // If no keyword matches, use category default
  const category = keywords[keywords.length - 1]; // Last keyword is usually the category
  return DEFAULT_CATEGORY_IMAGES[category] || DEFAULT_CATEGORY_IMAGES['Technology'];
}

/**
 * Preload an image to ensure it's cached
 * @param url Image URL to preload
 */
export async function preloadImage(url: string): Promise<void> {
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
