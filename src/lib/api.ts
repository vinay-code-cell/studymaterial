import { supabase } from './supabase';

export async function getMaterials(searchQuery = '') {
  let query = supabase
    .from('materials')
    .select('*')
    .eq('status', 'approved')
    .order('upload_date', { ascending: false });

  if (searchQuery) {
    query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data;
}

export async function getPendingMaterials() {
  const { data, error } = await supabase
    .from('materials')
    .select('*')
    .eq('status', 'pending')
    .order('upload_date', { ascending: true });

  if (error) throw error;
  return data;
}

export async function getAllMaterials() {
  const { data, error } = await supabase
    .from('materials')
    .select('*')
    .order('upload_date', { ascending: false });

  if (error) throw error;
  return data;
}

export async function uploadMaterial(
  title: string,
  description: string,
  file: File
) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
  const filePath = `materials/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('study-materials')
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  const { data: urlData } = supabase.storage
    .from('study-materials')
    .getPublicUrl(filePath);

  const { data, error } = await supabase
    .from('materials')
    .insert({
      title,
      description,
      file_url: urlData.publicUrl,
      file_name: file.name,
      file_size: file.size,
      status: 'pending',
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function approveMaterial(id: string, adminId: string) {
  const { error } = await supabase
    .from('materials')
    .update({
      status: 'approved',
      approved_by: adminId,
      approval_date: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) throw error;
}

export async function rejectMaterial(id: string) {
  const { error } = await supabase
    .from('materials')
    .update({ status: 'rejected' })
    .eq('id', id);

  if (error) throw error;
}

export async function logAccess(materialId: string, fileName: string) {
  const ipResponse = await fetch('https://api.ipify.org?format=json');
  const { ip } = await ipResponse.json();

  const { error } = await supabase.from('access_logs').insert({
    material_id: materialId,
    ip_address: ip,
    file_name: fileName,
  });

  if (error) throw error;
}

export async function getAccessLogs() {
  const { data, error } = await supabase
    .from('access_logs')
    .select('*')
    .order('access_time', { ascending: false });

  if (error) throw error;
  return data;
}

export async function deleteMaterial(id: string) {
  const { error } = await supabase
    .from('materials')
    .delete()
    .eq('id', id);

  if (error) throw error;
}
