const YT_API_KEY = process.env.EXPO_PUBLIC_YOUTUBE_API_KEY!;
const YT_API_URL = 'https://www.googleapis.com/youtube/v3/search';

export interface YouTubeVideo {
  videoId: string;
  title: string;
  thumbnail: string;
}

/**
 * 🔍 Busca un video de YouTube relacionado con un ejercicio
 */
export async function searchExerciseVideo(exerciseName: string): Promise<YouTubeVideo | null> {
  const params = new URLSearchParams({
    part: 'snippet',
    q: `${exerciseName} exercise`,
    type: 'video',
    maxResults: '1',
    key: YT_API_KEY,
  });

  const res = await fetch(`${YT_API_URL}?${params}`);
  if (!res.ok) throw new Error('Error al buscar video en YouTube');

  const data = await res.json();
  const item = data.items?.[0];
  if (!item) return null;

  return {
    videoId: item.id.videoId,
    title: item.snippet.title,
    thumbnail: item.snippet.thumbnails.medium.url,
  };
}
