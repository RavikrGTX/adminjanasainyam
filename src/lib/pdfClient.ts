// Client-side helper for PDF processing with pdfjs-dist

let pdfjsPromise: Promise<typeof import('pdfjs-dist')> | null = null;

export async function getPdfJs() {
  if (typeof window === 'undefined') {
    throw new Error('PDF.js can only be loaded in the browser');
  }

  if (!pdfjsPromise) {
    pdfjsPromise = import('pdfjs-dist').then((pdfjs) => {
      pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
      return pdfjs;
    });
  }

  return pdfjsPromise;
}

export async function getPdfMetadata(file: File): Promise<{
  pageCount: number;
  thumbnailUrl: string;
}> {
  const pdfjs = await getPdfJs();
  const arrayBuffer = await file.arrayBuffer();

  const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;

  const pageCount = pdf.numPages;

  // Render first page to generate thumbnail
  let thumbnailUrl = '';
  try {
    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale: 0.5 }); // thumbnail scale

    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      // @ts-ignore
      await page.render({ canvasContext: ctx, viewport }).promise;
      thumbnailUrl = canvas.toDataURL('image/jpeg', 0.85);
    }
  } catch (err) {
    console.warn('Could not generate canvas thumbnail:', err);
  }

  return { pageCount, thumbnailUrl };
}
