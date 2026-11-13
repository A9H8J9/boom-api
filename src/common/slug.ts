import { randomBytes } from 'node:crypto';

/** Turns a name into a URL-safe slug, keeping unicode letters (e.g. Persian names). */
export function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '');
}

/** A short random suffix for slug uniqueness. */
export function randomSuffix(length = 6): string {
  return randomBytes(length).toString('base64url').replace(/[^a-z0-9]/gi, '').slice(0, length).toLowerCase();
}
