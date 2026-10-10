// src/app/api/publish/image/route.ts
// Upload an image for a post. Accepts raw bytes (Content-Type: image/*) or multipart "file".
import { NextRequest, NextResponse } from 'next/server';
import { isAuthorizedPublisher, unauthorized } from '@/lib/publish-auth';
import { getServiceRoleClient } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const BUCKET = 'images';
const FOLDER = 'slm';
const MAX_BYTES = 10 * 1024 * 1024;
const EXT_BY_TYPE: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/avif': 'avif',
  'image/svg+xml': 'svg',
};

function safeName(name: string, fallbackExt: string): string {
  const base = name
    .replace(/\.[a-z0-9]+$/i, '')
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
  return `${base || 'image'}.${fallbackExt}`;
}

export async function POST(request: NextRequest) {
  if (!isAuthorizedPublisher(request)) return unauthorized();

  const contentType = request.headers.get('content-type') || '';
  let bytes: Buffer;
  let mime: string;
  let originalName: string;

  try {
    if (contentType.startsWith('multipart/form-data')) {
      const form = await request.formData();
      const file = form.get('file');
      if (!(file instanceof File)) return NextResponse.json({ error: 'multipart body needs a "file" field' }, { status: 400 });
      mime = file.type;
      originalName = file.name;
      bytes = Buffer.from(await file.arrayBuffer());
    } else if (contentType.startsWith('image/')) {
      mime = contentType.split(';')[0].trim();
      originalName = request.headers.get('x-filename') || request.nextUrl.searchParams.get('name') || 'image';
      bytes = Buffer.from(await request.arrayBuffer());
    } else {
      return NextResponse.json({ error: 'Send raw image bytes with an image/* Content-Type, or multipart with "file"' }, { status: 415 });
    }
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Could not read body' }, { status: 400 });
  }

  const ext = EXT_BY_TYPE[mime];
  if (!ext) return NextResponse.json({ error: `Unsupported image type ${mime || '(none)'}` }, { status: 415 });
  if (bytes.length === 0) return NextResponse.json({ error: 'Empty body' }, { status: 400 });
  if (bytes.length > MAX_BYTES) return NextResponse.json({ error: 'Image larger than 10MB' }, { status: 413 });

  const path = `${FOLDER}/${Date.now()}-${safeName(originalName, ext)}`;
  const client = getServiceRoleClient();
  const { error } = await client.storage.from(BUCKET).upload(path, bytes, {
    contentType: mime,
    upsert: false,
    cacheControl: '31536000',
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data } = client.storage.from(BUCKET).getPublicUrl(path);
  return NextResponse.json({ url: data.publicUrl, path, bytes: bytes.length }, { status: 201 });
}
