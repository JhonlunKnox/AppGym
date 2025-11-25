import { supabase } from "../utils/supabase";

export interface Exercise {
  id: string;
  name: string;
  bodyPart: string;
  target: string;
  equipment: string;
  gifUrl: string;
}

// GUARDAR
export async function saveExercisesToDB(exercises: Exercise[]) {
  const payload = exercises.map((e) => ({
    id: e.id,
    name: e.name,
    body_part: e.bodyPart,
    target: e.target,
    equipment: e.equipment,
    gif_url: e.gifUrl,
  }));

  const { error } = await supabase
    .from("exercises")
    .upsert(payload, { onConflict: "id" });

  if (error) {
    console.error("SAVE ERROR:", error);
    throw error;
  }
}

// TODOS
export async function getExercisesFromDB(): Promise<Exercise[]> {
  const { data, error } = await supabase.from("exercises").select("*");

  if (error) {
    console.error("READ ERROR:", error);
    throw error;
  }

  return data.map((e) => ({
    id: e.id,
    name: e.name,
    bodyPart: e.body_part,
    target: e.target,
    equipment: e.equipment,
    gifUrl: e.gif_url,
  }));
}

export async function getTargetListDB(): Promise<string[]> {
  const { data, error } = await supabase
    .from("exercises")
    .select("target");

  if (error) throw error;

  return [...new Set(data.map((d) => d.target))];
}

export async function getExercisesByTargetDB(target: string): Promise<Exercise[]> {
  const { data, error } = await supabase
    .from("exercises")
    .select("*")
    .eq("target", target);

  if (error) throw error;

  return data.map((e) => ({
    id: e.id,
    name: e.name,
    bodyPart: e.body_part,
    target: e.target,
    equipment: e.equipment,
    gifUrl: e.gif_url,
  }));
}

export async function getExerciseByIdDB(id: string): Promise<Exercise | null> {
  const { data, error } = await supabase
    .from("exercises")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    name: data.name,
    bodyPart: data.body_part,
    target: data.target,
    equipment: data.equipment,
    gifUrl: data.gif_url,
  };
}
