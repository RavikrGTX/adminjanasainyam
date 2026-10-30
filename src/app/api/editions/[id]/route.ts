import { NextResponse } from 'next/server';
import { removeEdition } from '@/lib/editions';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'Edition ID is required' }, { status: 400 });
    }

    const success = await removeEdition(id);
    return NextResponse.json({
      success,
      message: 'సంచిక విజయవంతంగా తొలగించబడింది (Edition deleted successfully)',
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Delete failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

