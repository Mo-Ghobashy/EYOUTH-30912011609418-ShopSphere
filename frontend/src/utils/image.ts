export function getImageUrl(imageUrl: string | null | undefined): string {
  if (!imageUrl) {
    return 'https://placehold.co/400x400/F0F0F0/9CA3AF?text=Product';
  }

  if (imageUrl.startsWith('http')) {
    return imageUrl;
  }

  const fallbackApiUrl = import.meta.env.PROD
    ? 'https://fullstack-ecommerce-store-iq3hj58wr.vercel.app/api'
    : 'http://localhost:5000/api';
  const apiUrl = import.meta.env.VITE_API_URL ?? fallbackApiUrl;
  const origin = apiUrl.replace(/\/api\/?$/, '');
  return `${origin}${imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`}`;
}
