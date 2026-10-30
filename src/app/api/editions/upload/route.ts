import { NextResponse } from 'next/server';
import { createEdition } from '@/lib/editions';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const title = (formData.get('title') as string) || '';
    const date = (formData.get('date') as string) || new Date().toISOString().split('T')[0];
    const region = (formData.get('region') as string) || 'ప్రధాన సంచిక (Main Edition)';
    const pageCountRaw = formData.get('pageCount') as string | null;
    const pageCount = pageCountRaw ? parseInt(pageCountRaw, 10) : undefined;

    if (!file) {
      return NextResponse.json({ error: 'దయచేసి PDF ఫైల్‌ను ఎంచుకోండి (File is required)' }, { status: 400 });
    }

    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'కేవలం PDF ఫైల్స్ మాత్రమే అంగీకరించబడతాయి (Only PDF files allowed)' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    const { edition, storage } = await createEdition({
      fileBuffer,
      fileName: file.name,
      title: title || file.name.replace(/\.pdf$/i, ''),
      date,
      region,
      pageCount,
    });

    return NextResponse.json({
      success: true,
      message:
        storage === 'wordpress'
          ? 'వర్డ్ప్రెస్ మీడియా లైబ్రరీలో సంచిక విజయవంతంగా ప్రచురించబడింది'
          : 'సంచిక లోకల్ స్టోరేజ్‌లో భద్రపరచబడింది (వర్డ్ప్రెస్ ఆఫ్లైన్/ఆధారాలు లేవు)',
      storage,
      edition,
    });
  } catch (err: unknown) {
    console.error('Error handling upload:', err);
    const message = err instanceof Error ? err.message : 'Upload failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

