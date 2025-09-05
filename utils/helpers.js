import { baseURL } from '../constants/AppConstants';

// Helper functions
export const formatPrice = (amount) => {
  return parseFloat(amount || 0).toFixed(2);
};

export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) return imagePath;
  if (imagePath.startsWith('products/') || imagePath.startsWith('categories/')) return `${baseURL}/storage/${imagePath}`;
  if (imagePath.startsWith('/products/') || imagePath.startsWith('/categories/')) return `${baseURL}/storage/${imagePath.slice(1)}`;
  if (/\.(jpg|jpeg|png|gif|webp)$/i.test(imagePath)) return `${baseURL}/storage/products/${imagePath}`;
  return `${baseURL}/storage/${imagePath}`;
};

// Address formatting helper
export const formatAddress = (address) => {
  if (!address) return 'Select Location';
  if (address.length > 40) {
    return address.substring(0, 37) + '...';
  }
  return address;
};
