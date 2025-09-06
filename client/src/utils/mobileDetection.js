// Mobile detection utility
export const isMobileDevice = () => {
  // Check for touch capability and screen size
  const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const isSmallScreen = window.innerWidth <= 768;
  
  // Check user agent for mobile devices
  const userAgent = navigator.userAgent.toLowerCase();
  const mobileKeywords = [
    'mobile', 'android', 'iphone', 'ipad', 'ipod', 
    'blackberry', 'windows phone', 'opera mini'
  ];
  const isMobileUserAgent = mobileKeywords.some(keyword => userAgent.includes(keyword));
  
  // Consider it mobile if it has touch AND (small screen OR mobile user agent)
  return hasTouch && (isSmallScreen || isMobileUserAgent);
};

export const isTabletDevice = () => {
  const userAgent = navigator.userAgent.toLowerCase();
  const tabletKeywords = ['ipad', 'tablet', 'kindle', 'silk'];
  return tabletKeywords.some(keyword => userAgent.includes(keyword));
};

export const getDeviceType = () => {
  if (isTabletDevice()) return 'tablet';
  if (isMobileDevice()) return 'mobile';
  return 'desktop';
};
