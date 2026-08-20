import { redirect } from 'next/navigation';
import { listSessions } from '@/lib/session';

export const dynamic = 'force-dynamic';

export default async function WorkspacePage() {
  const sessions = await listSessions('active');
  
  if (sessions && sessions.length > 0) {
    redirect(`/project/${sessions[0].id}`);
  }
  
  redirect('/');
}
