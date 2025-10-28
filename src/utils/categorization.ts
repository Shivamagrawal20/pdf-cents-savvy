import { CATEGORY_KEYWORDS, Category } from "@/types/expense";

export const autoCategorizePlatform = (platform: string): Category => {
  const lowerPlatform = platform.toLowerCase();
  
  for (const [keyword, category] of Object.entries(CATEGORY_KEYWORDS)) {
    if (lowerPlatform.includes(keyword)) {
      return category;
    }
  }
  
  return "Other";
};
