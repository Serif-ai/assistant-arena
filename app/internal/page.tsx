import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import InternalClient from "./components/internal-client";

export default async function Internal() {
  const cookieStore = await cookies();
  const isAuthenticated = cookieStore.get('internal_auth')?.value === process.env.INTERNAL_PASSWORD;

  if (!isAuthenticated) {
    redirect('/internal/login');
  }

  return <InternalClient />;
}
