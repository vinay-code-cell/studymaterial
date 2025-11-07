import { supabase } from './supabase';

export interface AdminSession {
  adminId: string;
  adminIdNumber: bigint;
  email?: string;
}

const ADMIN_ID_NUMBER = 21072006;

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function initializeAdminAccount() {
  const { data: existing } = await supabase
    .from('admin_accounts')
    .select('id')
    .eq('admin_id_number', ADMIN_ID_NUMBER)
    .maybeSingle();

  if (!existing) {
    const passwordHash = await hashPassword('admin123');
    await supabase.from('admin_accounts').insert({
      admin_id_number: ADMIN_ID_NUMBER,
      password_hash: passwordHash,
      email: 'admin@studyhub.local',
    });
  }
}

export async function loginAdmin(
  adminId: string,
  password: string
): Promise<AdminSession | null> {
  try {
    const adminIdNumber = parseInt(adminId, 10);
    const passwordHash = await hashPassword(password);

    const { data, error } = await supabase
      .from('admin_accounts')
      .select('id, admin_id_number, email')
      .eq('admin_id_number', adminIdNumber)
      .eq('password_hash', passwordHash)
      .maybeSingle();

    if (error || !data) return null;

    const session: AdminSession = {
      adminId: data.id,
      adminIdNumber: BigInt(data.admin_id_number),
      email: data.email,
    };

    localStorage.setItem('admin_session', JSON.stringify(session));
    return session;
  } catch {
    return null;
  }
}

export function getAdminSession(): AdminSession | null {
  try {
    const session = localStorage.getItem('admin_session');
    if (!session) return null;
    return JSON.parse(session);
  } catch {
    return null;
  }
}

export function logoutAdmin() {
  localStorage.removeItem('admin_session');
}

export function isAdminLoggedIn(): boolean {
  return getAdminSession() !== null;
}
