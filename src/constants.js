export const SUPPORTED_CONTENT_TYPES = [
  "text/plain",
  "text/plain; charset=utf-8",
  "text/markdown",
  "text/html",
  "text/csv",
  "application/json",
  "application/yaml",
  "image/png",
  "image/jpeg",
  "image/webp",
];

export const SUPPORTED_CONVERSION = {
  'text/plain': ['text/plain'],
  'text/markdown': ['text/markdown', 'text/html', 'text/plain'],
  'text/html': ['text/html', 'text/plain'],
  'text/csv': ['text/csv', 'text/plain', 'application/json'],
  'application/json': ['application/json', 'application/yaml', 'text/plain'],
  'application/yaml': ['application/yaml', 'text/plain'],
  'image/png': ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/avif'],
  'image/jpeg': ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/avif'],
  'image/webp': ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/avif'],
  'image/avif': ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/avif'],
  'image/gif': ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/avif'],
};

export const MIME_TO_EXTENSION = {
  "text/plain": ".txt",
  "text/html": ".html",
  "text/markdown": ".md",
  "application/json": ".json",
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/gif": ".gif",
  "image/webp": ".webp"
};
