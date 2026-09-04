import { twMerge } from 'tailwind-merge';

import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Extracts the 11-character YouTube video ID from various YouTube URL formats or returns the ID if already clean.
 */
export function extractYouTubeId(input?: string): string {
  if (!input) return '';
  const str = input.trim();
  // Match youtube.com/watch?v=..., youtu.be/..., youtube.com/embed/..., youtube.com/shorts/...
  const match = str.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?(?:.*&)?v=|shorts\/))([\w-]{11})/i);
  if (match && match[1]) return match[1];
  // If it's already an 11-character alphanumeric/dash/underscore string
  if (/^[\w-]{11}$/.test(str)) return str;
  return str;
}

/**
 * Normalizes image URLs, specifically converting Google Drive share links to direct CDN viewable URLs.
 */
export function normalizeImageUrl(url?: string): string {
  if (!url) return '';
  const str = url.trim();
  // Matches Google Drive share URLs (/file/d/ID, open?id=ID, uc?id=ID, etc.)
  const driveMatch = str.match(/(?:drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:export=view&)?id=)|lh3\.googleusercontent\.com\/d\/)([\w-]+)/i);
  if (driveMatch && driveMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${driveMatch[1]}`;
  }
  return str;
}

/**
 * Gets a high-quality YouTube thumbnail from an ID or any YouTube URL.
 */
export function getYouTubeThumbnail(videoIdOrUrl?: string): string {
  const id = extractYouTubeId(videoIdOrUrl);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : '';
}
