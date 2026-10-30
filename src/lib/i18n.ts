export type Lang = 'te' | 'en';

const translations = {
  // ── Login Page ──
  loginTitle: { te: 'జనసైన్యం', en: 'Janasainyam' },
  loginSubtitle: { te: 'తెలుగు దినపత్రిక • డిజిటల్ ఈ-పేపర్', en: 'Telugu Daily Newspaper • Digital E-Paper' },
  loginHeading: { te: 'అడ్మిన్ లాగిన్', en: 'Admin Login' },
  username: { te: 'యూజర్‌నేమ్', en: 'Username' },
  password: { te: 'పాస్‌వర్డ్', en: 'Password' },
  signIn: { te: 'లాగిన్ చేయండి', en: 'Sign In' },
  signingIn: { te: 'ధృవీకరిస్తోంది...', en: 'Signing in...' },
  invalidCredentials: { te: 'చెల్లని యూజర్‌నేమ్ లేదా పాస్‌వర్డ్', en: 'Invalid username or password' },
  defaultCredentials: { te: 'ప్రామాణిక ఆధారాలు', en: 'Default Credentials' },
  autoFill: { te: 'ఆటో-ఫిల్', en: 'Auto-fill' },

  // ── Header ──
  adminPortal: { te: 'అడ్మిన్ పోర్టల్', en: 'Admin Portal' },
  epaper: { te: 'ఈ-పేపర్ నిర్వహణ', en: 'E-Paper Management' },
  wpOnline: { te: 'WP ఆన్‌లైన్', en: 'WP Online' },
  wpOffline: { te: 'WP ఆఫ్‌లైన్', en: 'WP Offline' },
  logout: { te: 'లాగౌట్', en: 'Logout' },
  logoutConfirm: { te: 'మీరు లాగౌట్ అవ్వాలనుకుంటున్నారా?', en: 'Are you sure you want to log out?' },

  // ── Dashboard ──
  greeting: { te: 'నమస్కారం', en: 'Welcome' },
  dashSubtitle: { te: 'తాజా సంచికలను అప్లోడ్ చేయండి మరియు ఈ-పేపర్ ఆర్కైవ్‌ను నిర్వహించండి', en: 'Upload latest editions and manage the e-paper archive' },
  uploadNewEdition: { te: 'కొత్త సంచిక అప్లోడ్ చేయండి', en: 'Upload New Edition' },
  bannerBadge: { te: 'ఈ-పేపర్ డిజిటల్ పబ్లిషింగ్ సిస్టమ్', en: 'Digital E-Paper Publishing System' },
  bannerEditorialTeam: { te: 'సంపాదక బృందం', en: 'Editorial Team' },
  bannerDesc: {
    te: 'జనసైన్యం తెలుగు దినపత్రిక తాజా సంచికలను అప్లోడ్ చేయండి, WordPress సర్వర్‌తో అనుసంధానించండి మరియు పాఠకుల కోసం ఈ-పేపర్ ఆర్కైవ్‌ను నిర్వహించండి.',
    en: 'Upload latest Janasainyam Telugu daily editions, sync directly with WordPress server, and manage the digital e-paper archive for readers.'
  },

  // ── Stats Cards ──
  latestEdition: { te: 'తాజా సంచిక', en: 'Latest Edition' },
  totalEditions: { te: 'మొత్తం సంచికలు', en: 'Total Editions' },
  wpStatus: { te: 'వర్డ్ప్రెస్ స్థితి', en: 'WordPress Status' },
  quickUpload: { te: 'త్వరిత అప్లోడ్', en: 'Quick Upload' },
  noEditions: { te: 'సంచికలు లేవు', en: 'No editions yet' },
  date: { te: 'తేదీ', en: 'Date' },
  size: { te: 'పరిమాణం', en: 'Size' },
  view: { te: 'చూడండి', en: 'View' },
  editionsPublished: { te: 'సంచికలు ప్రచురించబడ్డాయి', en: 'editions published' },
  responseTime: { te: 'రెస్పాన్స్ సమయం', en: 'Response time' },
  connected: { te: 'కనెక్ట్ అయింది', en: 'Connected' },
  notConnected: { te: 'కనెక్ట్ కాలేదు', en: 'Not connected' },
  publishToday: { te: 'ఈరోజు సంచిక ప్రచురించండి', en: 'Publish today\'s edition' },
  uploadEdition: { te: 'సంచిక అప్లోడ్ చేయండి', en: 'Upload Edition' },
  syncing: { te: 'సింక్ అవుతోంది', en: 'Syncing' },
  offline: { te: 'ఆఫ్లైన్', en: 'Offline' },
  published: { te: 'ప్రచురించబడింది', en: 'Published' },

  // ── Upload Modal ──
  uploadTitle: { te: 'కొత్త సంచిక అప్లోడ్', en: 'Upload New Edition' },
  uploadDesc: { te: 'PDF దినపత్రికను అప్లోడ్ చేసి ప్రచురించండి', en: 'Upload and publish a newspaper PDF edition' },
  selectFile: { te: 'PDF ఫైల్ ఎంచుకోండి', en: 'Select PDF File' },
  dragDrop: { te: 'PDF ఫైల్‌ను ఇక్కడ లాగి వదలండి', en: 'Drag & drop a PDF file here' },
  orClick: { te: 'లేదా క్లిక్ చేయండి', en: 'or click to browse' },
  pdfOnly: { te: 'కేవలం .pdf ఫైల్స్ మాత్రమే', en: 'Only .pdf files accepted' },
  editionTitle: { te: 'ఎడిషన్ శీర్షిక', en: 'Edition Title' },
  pubDate: { te: 'ప్రచురణ తేదీ', en: 'Publication Date' },
  region: { te: 'ఎడిషన్ ప్రాంతం', en: 'Edition Region' },
  change: { te: 'మార్చు', en: 'Change' },
  pages: { te: 'పేజీలు', en: 'Pages' },
  analyzing: { te: 'విశ్లేషిస్తోంది...', en: 'Analyzing...' },
  fileLoaded: { te: 'PDF విజయవంతంగా లోడ్ అయింది', en: 'PDF loaded successfully' },
  cancel: { te: 'రద్దు', en: 'Cancel' },
  publish: { te: 'ప్రచురించండి', en: 'Publish' },
  uploading: { te: 'అప్లోడ్ అవుతోంది...', en: 'Uploading...' },
  mainEdition: { te: 'ప్రధాన సంచిక', en: 'Main Edition' },
  hydEdition: { te: 'హైదరాబాద్ ఎడిషన్', en: 'Hyderabad Edition' },
  vijEdition: { te: 'విజయవాడ ఎడిషన్', en: 'Vijayawada Edition' },
  vizagEdition: { te: 'విశాఖపట్నం ఎడిషన్', en: 'Visakhapatnam Edition' },
  specialEdition: { te: 'ప్రత్యేక అనుబంధం', en: 'Special Supplement' },
  fileRequired: { te: 'దయచేసి PDF ఫైల్‌ను ఎంచుకోండి', en: 'Please select a PDF file' },
  onlyPdf: { te: 'కేవలం PDF ఫైల్స్ మాత్రమే అంగీకరించబడతాయి', en: 'Only PDF files are accepted' },

  // ── Editions Table ──
  publishedEditions: { te: 'ప్రచురించిన సంచికలు', en: 'Published Editions' },
  searchPlaceholder: { te: 'సంచిక పేరు లేదా తేదీ శోధించండి...', en: 'Search by name or date...' },
  preview: { te: 'ప్రివ్యూ', en: 'Preview' },
  title: { te: 'శీర్షిక', en: 'Title' },
  pubDateCol: { te: 'ప్రచురణ తేదీ', en: 'Pub. Date' },
  sizeCol: { te: 'పరిమాణం', en: 'Size' },
  source: { te: 'స్టోరేజ్', en: 'Storage' },
  actions: { te: 'చర్యలు', en: 'Actions' },
  download: { te: 'డౌన్లోడ్', en: 'Download' },
  copyLink: { te: 'లింక్ కాపీ', en: 'Copy Link' },
  copied: { te: 'కాపీ అయింది!', en: 'Copied!' },
  deleteEdition: { te: 'తొలగించు', en: 'Delete' },
  deleteConfirm: { te: 'మీరు ఈ సంచికను తొలగించాలనుకుంటున్నారా?', en: 'Are you sure you want to delete this edition?' },
  noResults: { te: 'సంచికలు కనుగొనబడలేదు', en: 'No editions found' },
  noResultsDesc: { te: 'శోధన ప్రమాణాలకు సరిపోయే సంచికలు లేవు', en: 'No editions match your search criteria' },
  noEditionsDesc: { te: 'ఇంకా ఎటువంటి సంచికలు అప్లోడ్ కాలేదు', en: 'No editions have been uploaded yet' },
  wpCloud: { te: 'వర్డ్ప్రెస్', en: 'WordPress' },
  localStorage: { te: 'లోకల్', en: 'Local' },

  // ── PDF Preview ──
  reader: { te: 'ఈ-పేపర్ రీడర్', en: 'E-Paper Reader' },
  share: { te: 'షేర్', en: 'Share' },
  prevPage: { te: 'మునుపటి', en: 'Previous' },
  nextPage: { te: 'తరువాత', en: 'Next' },
  page: { te: 'పేజీ', en: 'Page' },
  loading: { te: 'లోడ్ అవుతోంది...', en: 'Loading...' },
  pdfError: { te: 'PDF లోడ్ చేయడంలో లోపం. డౌన్‌లోడ్ లింక్ ఉపయోగించండి.', en: 'Error loading PDF. Use the download link instead.' },
  openInBrowser: { te: 'బ్రౌజర్‌లో తెరవండి', en: 'Open in browser' },
  close: { te: 'మూసివేయి', en: 'Close' },

  // ── Footer ──
  footer: { te: '© 2026 జనసైన్యం దినపత్రిక. అన్ని హక్కులు ప్రత్యేకించబడ్డాయి.', en: '© 2026 Janasainyam Newspaper. All rights reserved.' },

  // ── Misc ──
  dataLoading: { te: 'డేటా లోడ్ అవుతోంది...', en: 'Loading data...' },
} as const;

export type TranslationKey = keyof typeof translations;

export function t(key: TranslationKey, lang: Lang): string {
  return translations[key]?.[lang] || translations[key]?.['en'] || key;
}

export default translations;

