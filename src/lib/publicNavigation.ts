export function isPublicTabVisible(path: string, content: { blogCount: number; galleryCount: number }): boolean {
  if (path === '/blog') return content.blogCount > 0;
  if (path === '/gallery') return content.galleryCount > 0;
  return true;
}