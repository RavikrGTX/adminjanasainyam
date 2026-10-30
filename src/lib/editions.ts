import fs from 'fs';
import path from 'path';
import { Edition } from './types';
import { getWordPressEditions, uploadToWordPress, deleteFromWordPress } from './wordpress';

const DATA_DIR = path.join(process.cwd(), 'data');
const EDITIONS_FILE = path.join(DATA_DIR, 'editions.json');
const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads', 'editions');

function ensureDirectories() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
  if (!fs.existsSync(EDITIONS_FILE)) {
    fs.writeFileSync(EDITIONS_FILE, JSON.stringify([], null, 2), 'utf-8');
  }
}

export function getLocalEditions(): Edition[] {
  ensureDirectories();
  try {
    const raw = fs.readFileSync(EDITIONS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed reading local editions:', err);
    return [];
  }
}

export function saveLocalEdition(edition: Edition): void {
  ensureDirectories();
  const list = getLocalEditions();
  const existingIdx = list.findIndex((e) => String(e.id) === String(edition.id));
  if (existingIdx >= 0) {
    list[existingIdx] = edition;
  } else {
    list.unshift(edition);
  }
  fs.writeFileSync(EDITIONS_FILE, JSON.stringify(list, null, 2), 'utf-8');
}

export function deleteLocalEdition(id: string | number): boolean {
  ensureDirectories();
  const list = getLocalEditions();
  const target = list.find((e) => String(e.id) === String(id));
  if (!target) return false;

  // If local file, delete file
  if (target.source === 'local' && target.pdfUrl.startsWith('/uploads/')) {
    const filePath = path.join(process.cwd(), 'public', target.pdfUrl);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (e) {
        console.warn('Could not delete local file:', e);
      }
    }
  }

  const updated = list.filter((e) => String(e.id) !== String(id));
  fs.writeFileSync(EDITIONS_FILE, JSON.stringify(updated, null, 2), 'utf-8');
  return true;
}

// Get unified list of editions
export async function getAllEditions(): Promise<Edition[]> {
  ensureDirectories();
  const localList = getLocalEditions();
  const wpList = await getWordPressEditions();

  // Deduplicate by pdfUrl or title
  const seenUrls = new Set<string>();
  const combined: Edition[] = [];

  // Local editions take priority or are merged
  for (const item of localList) {
    seenUrls.add(item.pdfUrl);
    combined.push(item);
  }

  for (const item of wpList) {
    if (!seenUrls.has(item.pdfUrl)) {
      seenUrls.add(item.pdfUrl);
      combined.push(item);
    }
  }

  // Sort newest publication date first, fallback to uploadedAt
  combined.sort((a, b) => {
    const dateA = new Date(a.date || a.uploadedAt).getTime();
    const dateB = new Date(b.date || b.uploadedAt).getTime();
    return dateB - dateA;
  });

  return combined;
}

// Save uploaded PDF (try WordPress first, fallback to local storage)
export async function createEdition({
  fileBuffer,
  fileName,
  title,
  date,
  region,
  pageCount,
}: {
  fileBuffer: Buffer;
  fileName: string;
  title: string;
  date: string;
  region: string;
  pageCount?: number;
}): Promise<{ edition: Edition; storage: 'wordpress' | 'local' }> {
  ensureDirectories();

  // Try WordPress upload first
  const wpResult = await uploadToWordPress(fileBuffer, fileName, title);
  if (wpResult) {
    const finalEdition: Edition = {
      ...wpResult,
      date: date || wpResult.date,
      region: region || 'ప్రధాన సంచిక (Main Edition)',
      pageCount: pageCount,
    };
    saveLocalEdition(finalEdition); // Cache metadata
    return { edition: finalEdition, storage: 'wordpress' };
  }

  // Fallback to local storage
  const cleanFileName = `${Date.now()}-${fileName.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
  const localFilePath = path.join(UPLOADS_DIR, cleanFileName);
  fs.writeFileSync(localFilePath, fileBuffer);

  const localEdition: Edition = {
    id: `local-${Date.now()}`,
    title: title || 'జనసైన్యం దినపత్రిక',
    date: date || new Date().toISOString().split('T')[0],
    region: region || 'ప్రధాన సంచిక (Main Edition)',
    pdfUrl: `/uploads/editions/${cleanFileName}`,
    fileName: cleanFileName,
    fileSize: fileBuffer.length,
    pageCount: pageCount,
    uploadedAt: new Date().toISOString(),
    source: 'local',
  };

  saveLocalEdition(localEdition);
  return { edition: localEdition, storage: 'local' };
}

export async function removeEdition(id: string | number): Promise<boolean> {
  const localDeleted = deleteLocalEdition(id);
  if (typeof id === 'number' || !String(id).startsWith('local-')) {
    await deleteFromWordPress(id);
  }
  return localDeleted;
}

