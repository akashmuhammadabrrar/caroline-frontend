export const formatNewsCategory = (category?: string) => {
  if (!category) return "News";
  if (category.startsWith("http")) {
    try {
      const parts = category.split("/").filter(Boolean);
      const lastPart = parts[parts.length - 1];
      if (lastPart && lastPart !== "add" && lastPart !== "admin" && lastPart !== "article") {
        return lastPart.charAt(0).toUpperCase() + lastPart.slice(1);
      }
    } catch (e) {
      return "News";
    }
    return "News";
  }
  return category;
};

export const formatNewsImage = (imageUrl?: string) => {
  if (!imageUrl || imageUrl.includes("/admin/")) {
    return "/images/news-placeholder.jpg";
  }
  return imageUrl;
};

export const formatNewsExcerpt = (excerpt?: string) => {
  if (!excerpt || excerpt.startsWith("http")) {
    return "No description available.";
  }
  return excerpt;
};
