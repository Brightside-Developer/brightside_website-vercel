import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === 'development';

const securityHeaders = [
  { key: 'X-Content-Type-Options',    value: 'nosniff' },
  { key: 'X-Frame-Options',           value: 'SAMEORIGIN' },
  { key: 'X-XSS-Protection',          value: '1; mode=block' },
  { key: 'Referrer-Policy',           value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy',        value: 'camera=(), microphone=(), geolocation=()' },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      // unsafe-eval is required by React in dev mode only; never sent in production
      `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
      // Tailwind utility classes are inline; Google Fonts stylesheet
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      // Google Fonts webfont files
      "font-src 'self' https://fonts.gstatic.com",
      // Supabase storage + Google OAuth avatars
      "img-src 'self' data: blob: https://*.supabase.co https://*.googleusercontent.com",
      // Supabase REST + Realtime WebSocket
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
      // No iframes allowed (clickjacking protection)
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; '),
  },
];

const nextConfig: NextConfig = {
  allowedDevOrigins: ['192.168.1.251'],

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
