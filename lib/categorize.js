import { CATEGORY_KEYWORDS, DOCUMENT_CATEGORIES } from './constants';

export const autoClassifyDocument = (documentName, documentType = '') => {
  const text = `${documentName} ${documentType}`.toLowerCase();
  
  let bestCategory = 'personal';
  let bestScore = 0;

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    const score = keywords.reduce((acc, keyword) => {
      return acc + (text.includes(keyword) ? 1 : 0);
    }, 0);
    if (score > bestScore) {
      bestScore = score;
      bestCategory = category;
    }
  }

  return bestCategory;
};

export const getCategoryInfo = (category) => {
  return DOCUMENT_CATEGORIES[category] || DOCUMENT_CATEGORIES.personal;
};

export const getExpiryStatus = (expiryDate) => {
  if (!expiryDate) return null;
  const now = new Date();
  const expiry = new Date(expiryDate);
  const daysLeft = Math.floor((expiry - now) / (1000 * 60 * 60 * 24));
  
  if (daysLeft < 0) return { status: 'expired', daysLeft, color: '#ef4444' };
  if (daysLeft <= 30) return { status: 'expiring_soon', daysLeft, color: '#f59e0b' };
  if (daysLeft <= 90) return { status: 'expiring', daysLeft, color: '#f97316' };
  return { status: 'valid', daysLeft, color: '#10b981' };
};
