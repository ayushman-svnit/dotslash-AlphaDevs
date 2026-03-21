import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';

const BUCKET = (process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '')
  .replace('gs://', '');

function getAdminStorage() {
  if (!getApps().length) {
    initializeApp({
      credential: cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
      storageBucket: BUCKET,
    });
  }
  return getStorage().bucket(BUCKET);
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 });

    console.log('[upload] using bucket:', BUCKET);
    const buffer = Buffer.from(await file.arrayBuffer());
    const path = `wildlife-sightings/${Date.now()}-${file.name}`;

    const bucket = getAdminStorage();
    const fileRef = bucket.file(path);
    await fileRef.save(buffer, { contentType: file.type, public: true });

    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${path}`;
    return NextResponse.json({ url: publicUrl });
  } catch (e: any) {
    console.error('[upload]', e.message);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
