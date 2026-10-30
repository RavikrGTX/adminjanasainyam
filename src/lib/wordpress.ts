import { Edition, SyncStatus, WordPressMediaItem } from './types';

const WP_URL = (process.env.WORDPRESS_API_URL || 'https://lawngreen-wasp-141236.hostingersite.com').trim();
const WP_USER = (process.env.WORDPRESS_APP_USERNAME || '').trim();
const WP_PASS = (process.env.WORDPRESS_APP_PASSWORD || '').trim();

function getAuthHeader(): string | null {
  if (!WP_USER || !WP_PASS || WP_USER === 'your_wp_username') {
    return null;
  }
  return `Basic ${Buffer.from(`${WP_USER}:${WP_PASS}`).toString('base64')}`;
}

export function isWordPressConfigured(): boolean {
  return Boolean(WP_USER && WP_PASS && WP_USER !== 'your_wp_username');
}

export async function pingWordPress(): Promise<SyncStatus> {
  const startTime = Date.now();
  try {
    const res = await fetch(`${WP_URL}/wp-json`, {
      method: 'GET',
      next: { revalidate: 0 },
      signal: AbortSignal.timeout(6000),
    });
    const responseTimeMs = Date.now() - startTime;

    if (!res.ok) {
      return {
        online: false,
        responseTimeMs,
        authenticated: false,
        message: `సర్వర్ స్పందన లోపం (${res.status})`,
        lastChecked: new Date().toISOString(),
      };
    }

    // Check credentials if provided
    let authenticated = false;
    const authHeader = getAuthHeader();
    if (authHeader) {
      try {
        const authRes = await fetch(`${WP_URL}/wp-json/wp/v2/users/me`, {
          headers: { Authorization: authHeader },
          signal: AbortSignal.timeout(5000),
        });
        authenticated = authRes.ok;
      } catch {
        authenticated = false;
      }
    }

    return {
      online: true,
      responseTimeMs,
      authenticated,
      message: authenticated
        ? 'వర్డ్ప్రెస్ సర్వర్ సక్రియంగా ఉంది (కనెక్ట్ అయింది)'
        : 'వర్డ్ప్రెస్ సర్వర్ ఆన్‌లైన్ (API ఆధారాలు సెట్ చేయబడలేదు)',
      lastChecked: new Date().toISOString(),
    };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'కనెక్షన్ విఫలమైంది';
    return {
      online: false,
      authenticated: false,
      message: `కనెక్షన్ లోపం: ${errorMessage}`,
      lastChecked: new Date().toISOString(),
    };
  }
}

export async function getWordPressEditions(): Promise<Edition[]> {
  try {
    const res = await fetch(`${WP_URL}/wp-json/wp/v2/media?mime_type=application/pdf&per_page=100`, {
      method: 'GET',
      next: { revalidate: 10 },
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      return [];
    }

    const items: WordPressMediaItem[] = await res.json();
    if (!Array.isArray(items)) return [];

    return items.map((item) => {
      // Find thumbnail or fallback
      const mediumThumb = item.media_details?.sizes?.medium?.source_url;
      const fullThumb = item.media_details?.sizes?.full?.source_url;
      const thumb = mediumThumb || fullThumb || undefined;

      const dateStr = item.date ? item.date.split('T')[0] : new Date().toISOString().split('T')[0];
      const titleStr = item.title?.rendered ? item.title.rendered.replace(/&#8211;|-/g, ' ').trim() : 'జనసైన్యం దినపత్రిక';

      return {
        id: item.id,
        title: titleStr,
        date: dateStr,
        region: 'ప్రధాన సంచిక (Main Edition)',
        pdfUrl: item.source_url || item.guid?.rendered,
        thumbnailUrl: thumb,
        fileName: item.slug || `edition-${item.id}.pdf`,
        fileSize: item.media_details?.filesize || 0,
        uploadedAt: item.date || new Date().toISOString(),
        source: 'wordpress',
      };
    });
  } catch (err) {
    console.error('Error fetching WordPress editions:', err);
    return [];
  }
}

export async function uploadToWordPress(
  fileBuffer: Buffer,
  fileName: string,
  title: string
): Promise<Edition | null> {
  const authHeader = getAuthHeader();
  if (!authHeader) {
    return null;
  }

  try {
    const res = await fetch(`${WP_URL}/wp-json/wp/v2/media`, {
      method: 'POST',
      headers: {
        Authorization: authHeader,
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Type': 'application/pdf',
      },
      body: new Uint8Array(fileBuffer),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.warn('WordPress media upload failed:', res.status, errText);
      return null;
    }

    const item: WordPressMediaItem = await res.json();

    // Optionally update title
    try {
      await fetch(`${WP_URL}/wp-json/wp/v2/media/${item.id}`, {
        method: 'POST',
        headers: {
          Authorization: authHeader,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title,
        }),
      });
    } catch (e) {
      console.warn('Could not update title on WP item:', e);
    }

    const mediumThumb = item.media_details?.sizes?.medium?.source_url;
    const fullThumb = item.media_details?.sizes?.full?.source_url;

    return {
      id: item.id,
      title: title || item.title?.rendered,
      date: item.date ? item.date.split('T')[0] : new Date().toISOString().split('T')[0],
      region: 'ప్రధాన సంచిక (Main Edition)',
      pdfUrl: item.source_url || item.guid?.rendered,
      thumbnailUrl: mediumThumb || fullThumb,
      fileName: fileName,
      fileSize: fileBuffer.length,
      uploadedAt: item.date || new Date().toISOString(),
      source: 'wordpress',
    };
  } catch (err) {
    console.error('Failed uploading to WordPress:', err);
    return null;
  }
}

export async function deleteFromWordPress(id: number | string): Promise<boolean> {
  const authHeader = getAuthHeader();
  if (!authHeader) return false;

  try {
    const res = await fetch(`${WP_URL}/wp-json/wp/v2/media/${id}?force=true`, {
      method: 'DELETE',
      headers: {
        Authorization: authHeader,
      },
    });
    return res.ok;
  } catch {
    return false;
  }
}
