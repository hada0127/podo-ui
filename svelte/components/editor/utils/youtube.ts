/**
 * YouTube Utilities
 *
 * YouTube URL 처리 관련 유틸리티 함수들을 제공합니다.
 */

/**
 * YouTube URL에서 비디오 ID를 추출합니다.
 *
 * @param url - YouTube URL
 * @returns 비디오 ID 또는 null (유효하지 않은 URL인 경우)
 *
 * @example
 * extractYoutubeVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
 * // => 'dQw4w9WgXcQ'
 *
 * extractYoutubeVideoId('https://youtu.be/dQw4w9WgXcQ')
 * // => 'dQw4w9WgXcQ'
 *
 * extractYoutubeVideoId('https://www.youtube.com/embed/dQw4w9WgXcQ')
 * // => 'dQw4w9WgXcQ'
 */
export const extractYoutubeVideoId = (url: string): string | null => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
};
