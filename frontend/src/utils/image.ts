export function getImageUrl(imageUrl: string | null | undefined): string {
  if (!imageUrl) {
    return 'https://placehold.co/400x400/F0F0F0/9CA3AF?text=Product';
  }

  if (imageUrl.startsWith('http')) {
    return imageUrl;
  }

  const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api';
  const origin = apiUrl.replace(/\/api\/?$/, '');
  return `${origin}${imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`}`;
}
