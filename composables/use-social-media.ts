/**
 * Get social icon component based on platform name
 */
export const useGetSocialIcon = (title: string) => {
  const normalizedTitle = title.toLowerCase().trim();
  const availableIcons = [
    'instagram',
    'facebook',
    'linkedin',
    'twitter',
    'github',
    'youtube',
    'tiktok',
    'x',
    'pinterest',
    'twitch',
    'telegram',
    'snapchat',
    'reddit',
    'discord',
    'threads',
  ];
  return availableIcons.includes(normalizedTitle)
    ? `i-mdi-${normalizedTitle}`
    : 'i-mdi-link';
};
