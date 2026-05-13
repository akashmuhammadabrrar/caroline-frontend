/**
 * Maps common country names to their flag emoji.
 * Falling back to a standard flag if nothing matches.
 */
const countryToFlag: Record<string, string> = {
  "Algeria": "🇩🇿",
  "Argentina": "🇦🇷",
  "Australia": "🇦🇺",
  "Austria": "🇦🇹",
  "Belgium": "🇧🇪",
  "Brazil": "🇧🇷",
  "Cameroon": "🇨🇲",
  "Canada": "🇨🇦",
  "China": "🇨🇳",
  "Croatia": "🇭🇷",
  "Denmark": "🇩🇰",
  "Egypt": "🇪🇬",
  "England": "🏴",
  "France": "🇫🇷",
  "Germany": "🇩🇪",
  "Ghana": "🇬🇭",
  "Ireland": "🇮🇪",
  "Italy": "🇮🇹",
  "Ivory Coast": "🇨🇮",
  "Japan": "🇯🇵",
  "Mexico": "🇲🇽",
  "Morocco": "🇲🇦",
  "Netherlands": "🇳🇱",
  "Nigeria": "🇳🇬",
  "Norway": "🇳🇴",
  "Poland": "🇵🇱",
  "Portugal": "🇵🇹",
  "Scotland": "🏴",
  "Senegal": "🇸🇳",
  "South Korea": "🇰🇷",
  "Spain": "🇪🇸",
  "Sweden": "🇸🇪",
  "Switzerland": "🇨🇭",
  "Tunisia": "🇹🇳",
  "UK": "🇬🇧",
  "USA": "🇺🇸",
  "Ukraine": "🇺🇦",
  "United States": "🇺🇸",
  "Uruguay": "🇺🇾",
  "Wales": "🏴"
};

export function getFlagEmoji(country: string): string {
  if (!country) return "🏳️";
  
  const trimmed = country.trim();
  // Try exact match
  if (countryToFlag[trimmed]) return countryToFlag[trimmed];
  
  // Try case-insensitive match
  const lower = trimmed.toLowerCase();
  const found = Object.keys(countryToFlag).find(key => key.toLowerCase() === lower);
  if (found) return countryToFlag[found];

  return "🏳️";
}
