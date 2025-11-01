export interface Exercise {
  id: string;
  name: string;
  bodyPart: string;
  target: string;
  equipment: string;
  gifUrl: string;
}

const EXERCISE_API_KEY = process.env.EXPO_PUBLIC_EXERCISE_API_KEY!;
const EXERCISE_API_URL = 'https://exercisedb.p.rapidapi.com/exercises';
const EXERCISE_API_HOST = 'exercisedb.p.rapidapi.com';

export async function getExercisesByTarget(target: string): Promise<Exercise[]> {
  const url = `${EXERCISE_API_URL}/target/${target}`;

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'X-RapidAPI-Key': EXERCISE_API_KEY,
      'X-RapidAPI-Host': EXERCISE_API_HOST,
    },
  });

  if (!res.ok) {
    console.error(' Error al obtener ejercicios:', res.status, res.statusText);
    throw new Error('Error al obtener ejercicios');
  }

  const data = await res.json();

  return data.map((item: any) => ({
    ...item,
    gifUrl: item.gifUrl?.startsWith('http://')
      ? item.gifUrl.replace('http://', 'https://')
      : item.gifUrl,
  }));
}

export async function getTargetList(): Promise<string[]> {
  const res = await fetch(`${EXERCISE_API_URL}/targetList`, {
    method: 'GET',
    headers: {
      'X-RapidAPI-Key': EXERCISE_API_KEY,
      'X-RapidAPI-Host': EXERCISE_API_HOST,
    },
  });

  if (!res.ok) {
    console.error('❌ Error al obtener la lista de músculos:', res.status);
    throw new Error('Error al obtener la lista de músculos');
  }

  return await res.json();
}
