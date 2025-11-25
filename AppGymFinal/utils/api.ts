import { supabase } from './supabase';


export type Exercise = {
id: string;
name: string;
body_part: string;
target: string;
equipment: string;
gif_url: string;
};


export async function getExercises() {
const { data, error } = await supabase.from('exercises').select('*');
if (error) throw error;
return data as Exercise[];
}


export async function searchExercises(q: string) {
if (!q.trim()) return getExercises();
const { data, error } = await supabase
.from('exercises')
.select('*')
.or(`name.ilike.%${q}%,target.ilike.%${q}%,body_part.ilike.%${q}%`);
if (error) throw error;
return data as Exercise[];
}


// RUTINAS
export type Rutina = {
id: string;
user_id: string;
title: string;
description?: string;
};


export async function createRutina(user_id: string, title: string, description = '') {
const { data, error } = await supabase.from('rutina').insert([{ user_id, title, description }]).select();
if (error) throw error;
return data[0] as Rutina;
}


export async function getRutinasByUser(user_id: string) {
const { data, error } = await supabase.from('rutina').select('*').eq('user_id', user_id);
if (error) throw error;
return data as Rutina[];
}


export async function addExerciseToRutina(rutina_id: string, exercise_id: string, extras: any = {}) {
const payload = { rutina_id, exercise_id, ...extras };
const { data, error } = await supabase.from('rutina_ejercicios').insert([payload]).select();
if (error) throw error;
return data[0];
}


export async function getRutinaWithExercises(rutina_id: string) {
// obtén rutina con ejercicios y datos del exercise
const { data, error } = await supabase
.from('rutina')
.select(`*, rutina_ejercicios(*, exercises:exercise_id(id,name,body_part,target,equipment,gif_url))`)
.eq('id', rutina_id);
if (error) throw error;
return data?.[0];
}