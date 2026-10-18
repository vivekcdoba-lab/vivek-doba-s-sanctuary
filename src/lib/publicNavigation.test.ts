import { describe, expect, it } from 'vitest';
import { isPublicTabVisible } from './publicNavigation';

describe('published content in top navigation', () => {
  it('hides Blog until at least one published post exists', () => {
    expect(isPublicTabVisible('/blog', { blogCount: 0, galleryCount: 1 })).toBe(false);
    expect(isPublicTabVisible('/blog', { blogCount: 1, galleryCount: 0 })).toBe(true);
  });

  it('hides Gallery until at least one published gallery item exists', () => {
    expect(isPublicTabVisible('/gallery', { blogCount: 1, galleryCount: 0 })).toBe(false);
    expect(isPublicTabVisible('/gallery', { blogCount: 0, galleryCount: 1 })).toBe(true);
  });

  it('keeps other tabs visible without published content', () => {
    for (const path of ['/about', '/courses', '/shop', '/contact', '/testimonials']) {
      expect(isPublicTabVisible(path, { blogCount: 0, galleryCount: 0 })).toBe(true);
    }
  });
});