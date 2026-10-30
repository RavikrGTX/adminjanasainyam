export interface Edition {
  id: string | number;
  title: string;
  date: string; // YYYY-MM-DD
  region?: string; // e.g. ప్రధాన సంచిక (Main Edition)
  pdfUrl: string;
  thumbnailUrl?: string;
  fileName: string;
  fileSize: number; // in bytes
  pageCount?: number;
  uploadedAt: string;
  source: 'wordpress' | 'local';
}

export interface WordPressMediaItem {
  id: number;
  date: string;
  date_gmt: string;
  guid: {
    rendered: string;
  };
  modified: string;
  slug: string;
  status: string;
  type: string;
  link: string;
  title: {
    rendered: string;
  };
  author: number;
  description: {
    rendered: string;
  };
  caption: {
    rendered: string;
  };
  alt_text: string;
  media_type: string;
  mime_type: string;
  media_details?: {
    filesize?: number;
    sizes?: Record<string, { source_url: string; width: number; height: number }>;
  };
  source_url: string;
}

export interface SyncStatus {
  online: boolean;
  responseTimeMs?: number;
  message: string;
  authenticated: boolean;
  lastChecked: string;
}

export interface UserSession {
  username: string;
  role: string;
  authenticatedAt: string;
}

