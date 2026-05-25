'use client';
import { usePathname } from 'next/navigation';
import Footer from './Footer';

const HIDE_ON = ['/auth'];

export default function ConditionalFooter() {
  const pathname = usePathname();
  if (HIDE_ON.some((p) => pathname === p || pathname.startsWith(p + '/'))) return null;
  return <Footer />;
}
