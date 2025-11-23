import { useEffect } from 'react';

/**
 * useSEO Hook - Manages meta tags for pages
 * Updates document title and meta tags for SEO optimization
 */
export const useSEO = ({ 
  title = 'Eduhire', 
  description = 'Connect with qualified teachers and institutions. Post jobs, apply for positions, and grow your educational network.',
  keywords = 'education, jobs, teachers, institutions, teaching positions',
  ogImage = 'https://eduhire.com/og-image.png',
  ogType = 'website',
  canonicalUrl = null
} = {}) => {
  useEffect(() => {
    // Update title
    document.title = `${title} | Eduhire`;
    
    // Update or create meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', description);
    
    // Update or create meta keywords
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.setAttribute('name', 'keywords');
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.setAttribute('content', keywords);
    
    // Open Graph tags
    updateMetaTag('og:title', title);
    updateMetaTag('og:description', description);
    updateMetaTag('og:image', ogImage);
    updateMetaTag('og:type', ogType);
    updateMetaTag('og:site_name', 'Eduhire');
    
    // Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', ogImage);
    
    // Canonical URL
    if (canonicalUrl) {
      let canonicalLink = document.querySelector('link[rel="canonical"]');
      if (!canonicalLink) {
        canonicalLink = document.createElement('link');
        canonicalLink.setAttribute('rel', 'canonical');
        document.head.appendChild(canonicalLink);
      }
      canonicalLink.setAttribute('href', canonicalUrl);
    }
    
  }, [title, description, keywords, ogImage, ogType, canonicalUrl]);
};

/**
 * Helper function to update or create meta tags
 */
const updateMetaTag = (property, content) => {
  let tag = document.querySelector(`meta[property="${property}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute('property', property);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
};

export default useSEO;
