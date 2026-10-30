const TELUGU_MONTHS = [
  'జనవరి',
  'ఫిబ్రవరి',
  'మార్చి',
  'ఏప్రిల్',
  'మే',
  'జూన్',
  'జూలై',
  'ఆగస్టు',
  'సెప్టెంబర్',
  'అక్టోబర్',
  'నవంబర్',
  'డిసెంబర్',
];

const TELUGU_DAYS = [
  'ఆదివారం',
  'సోమవారం',
  'మంగళవారం',
  'బుధవారం',
  'గురువారం',
  'శుక్రవారం',
  'శనివారం',
];

const TELUGU_DIGITS = ['౦', '౧', '౨', '౩', '౪', '౫', '౬', '౭', '౮', '౯'];

export function toTeluguDigits(num: number | string): string {
  return String(num).replace(/[0-9]/g, (d) => TELUGU_DIGITS[parseInt(d, 10)]);
}

export function formatTeluguDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;

    const day = d.getDate();
    const month = TELUGU_MONTHS[d.getMonth()];
    const year = d.getFullYear();
    const dayName = TELUGU_DAYS[d.getDay()];

    return `${day} ${month} ${year}, ${dayName}`;
  } catch {
    return dateStr;
  }
}

export function formatShortTeluguDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;

    const day = d.getDate();
    const month = TELUGU_MONTHS[d.getMonth()];
    const year = d.getFullYear();

    return `${day} ${month} ${year}`;
  } catch {
    return dateStr;
  }
}

export function formatEnglishDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;

    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 MB';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

