const UNSPLASH_HOST = 'images.unsplash.com';

const categoryLooks = {
    eletronicos: { visual: 'phone', accent: '#3483fa', secondary: '#111827' },
    moda: { visual: 'shirt', accent: '#ec4899', secondary: '#fb7185' },
    casa: { visual: 'sofa', accent: '#14b8a6', secondary: '#0f766e' },
    beleza: { visual: 'perfume', accent: '#f43f5e', secondary: '#f9a8d4' },
    esportes: { visual: 'shoe', accent: '#22c55e', secondary: '#0ea5e9' },
    pet: { visual: 'petFood', accent: '#2563eb', secondary: '#f59e0b' },
    livros: { visual: 'book', accent: '#7c2d12', secondary: '#f97316' },
    brinquedos: { visual: 'blocks', accent: '#eab308', secondary: '#ef4444' },
    alimentos: { visual: 'coffee', accent: '#92400e', secondary: '#facc15' },
    automotivo: { visual: 'tire', accent: '#475569', secondary: '#f97316' },
};

const productLooks = [
    { match: ['smartphone', 'galaxy'], visual: 'phone', accent: '#3483fa', secondary: '#111827' },
    { match: ['notebook', 'core i5', 'ssd'], visual: 'laptop', accent: '#64748b', secondary: '#3483fa' },
    { match: ['fone', 'bluetooth'], visual: 'headphones', accent: '#111827', secondary: '#3483fa' },
    { match: ['smart tv', '50'], visual: 'tv', accent: '#111827', secondary: '#38bdf8' },
    { match: ['smartwatch', 'relogio'], visual: 'watch', accent: '#111827', secondary: '#22c55e' },

    { match: ['camiseta'], visual: 'shirt', accent: '#0ea5e9', secondary: '#f97316' },
    { match: ['calca', 'jeans'], visual: 'pants', accent: '#1d4ed8', secondary: '#38bdf8' },
    { match: ['tenis casual', 'tenis running'], visual: 'shoe', accent: '#f8fafc', secondary: '#3483fa' },
    { match: ['vestido'], visual: 'dress', accent: '#ec4899', secondary: '#f9a8d4' },
    { match: ['jaqueta'], visual: 'jacket', accent: '#2563eb', secondary: '#f8fafc' },

    { match: ['sofa'], visual: 'sofa', accent: '#94a3b8', secondary: '#0f766e' },
    { match: ['luminaria'], visual: 'lamp', accent: '#facc15', secondary: '#475569' },
    { match: ['jogo de cama'], visual: 'bedding', accent: '#38bdf8', secondary: '#e2e8f0' },
    { match: ['mesa de jantar'], visual: 'table', accent: '#92400e', secondary: '#f8fafc' },
    { match: ['vaso'], visual: 'vase', accent: '#14b8a6', secondary: '#facc15' },

    { match: ['perfume'], visual: 'perfume', accent: '#f43f5e', secondary: '#f9a8d4' },
    { match: ['skincare', 'anti-idade'], visual: 'skincare', accent: '#0ea5e9', secondary: '#f9a8d4' },
    { match: ['paleta'], visual: 'palette', accent: '#7c3aed', secondary: '#f97316' },
    { match: ['secador'], visual: 'dryer', accent: '#111827', secondary: '#ec4899' },
    { match: ['batom'], visual: 'lipstick', accent: '#be123c', secondary: '#fda4af' },

    { match: ['halteres'], visual: 'dumbbells', accent: '#111827', secondary: '#22c55e' },
    { match: ['bicicleta'], visual: 'bike', accent: '#22c55e', secondary: '#111827' },
    { match: ['whey', 'protein'], visual: 'supplement', accent: '#f97316', secondary: '#111827' },
    { match: ['esteira'], visual: 'treadmill', accent: '#111827', secondary: '#22c55e' },

    { match: ['racao'], visual: 'petFood', accent: '#2563eb', secondary: '#f59e0b' },
    { match: ['caminha'], visual: 'petBed', accent: '#f59e0b', secondary: '#2563eb' },
    { match: ['mordedor'], visual: 'boneToy', accent: '#22c55e', secondary: '#e2e8f0' },
    { match: ['areia higienica'], visual: 'catLitter', accent: '#64748b', secondary: '#38bdf8' },
    { match: ['coleira'], visual: 'collar', accent: '#2563eb', secondary: '#f97316' },

    { match: ['hobbit'], visual: 'book', accent: '#166534', secondary: '#facc15' },
    { match: ['senhor dos aneis', 'box trilogia'], visual: 'bookBox', accent: '#7c2d12', secondary: '#f97316' },
    { match: ['sapiens'], visual: 'book', accent: '#0f172a', secondary: '#f8fafc' },
    { match: ['manga', 'one piece'], visual: 'manga', accent: '#2563eb', secondary: '#ef4444' },
    { match: ['atomic habits'], visual: 'book', accent: '#f97316', secondary: '#111827' },

    { match: ['lego', 'classic'], visual: 'blocks', accent: '#eab308', secondary: '#ef4444' },
    { match: ['boneca'], visual: 'doll', accent: '#ec4899', secondary: '#f9a8d4' },
    { match: ['hot wheels', 'carrinho'], visual: 'toyCars', accent: '#ef4444', secondary: '#3483fa' },
    { match: ['tabuleiro'], visual: 'boardGame', accent: '#7c3aed', secondary: '#22c55e' },
    { match: ['pelucia'], visual: 'plush', accent: '#d97706', secondary: '#facc15' },

    { match: ['cesta gourmet'], visual: 'basket', accent: '#92400e', secondary: '#facc15' },
    { match: ['cafe'], visual: 'coffee', accent: '#78350f', secondary: '#facc15' },
    { match: ['azeite'], visual: 'oliveOil', accent: '#166534', secondary: '#facc15' },
    { match: ['chocolate'], visual: 'chocolate', accent: '#7c2d12', secondary: '#f59e0b' },
    { match: ['mel'], visual: 'honey', accent: '#f59e0b', secondary: '#78350f' },

    { match: ['oleo motor', '5w30'], visual: 'motorOil', accent: '#111827', secondary: '#f97316' },
    { match: ['bateria'], visual: 'battery', accent: '#111827', secondary: '#ef4444' },
    { match: ['limpeza automotiva'], visual: 'cleaningKit', accent: '#0ea5e9', secondary: '#f97316' },
    { match: ['pneu'], visual: 'tire', accent: '#111827', secondary: '#64748b' },
    { match: ['multimidia', 'android'], visual: 'stereo', accent: '#111827', secondary: '#3483fa' },
];

const imageCache = new Map();

export function getProductImage(product) {
    const providedImage = product?.image_url || '';

    if (providedImage && !providedImage.includes(UNSPLASH_HOST)) {
        return providedImage;
    }

    const name = product?.name || 'Produto';
    const category = product?.category || '';
    const cacheKey = `${name}|${category}`;

    if (imageCache.has(cacheKey)) {
        return imageCache.get(cacheKey);
    }

    const normalizedName = normalizeText(name);
    const productLook = productLooks.find((item) => (
        item.match.some((keyword) => normalizedName.includes(keyword))
    ));
    const categoryLook = categoryLooks[normalizeText(category)] || categoryLooks.casa;
    const look = productLook || categoryLook;
    const image = svgToDataUri(renderCatalogSvg({ name, category, ...look }));

    imageCache.set(cacheKey, image);
    return image;
}

export function getProductFallback(category) {
    return getProductImage({
        name: category ? `Produto ${category}` : 'Produto',
        category,
    });
}

function normalizeText(value = '') {
    return String(value)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();
}

function svgToDataUri(svg) {
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function renderCatalogSvg({ name, category, visual, accent, secondary }) {
    const safeName = escapeXml(name);
    const safeCategory = escapeXml(category || 'Galopee');

    return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" role="img" aria-label="${safeName}">
  <defs>
    <linearGradient id="accent" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${accent}"/>
      <stop offset="100%" stop-color="${secondary}"/>
    </linearGradient>
    <filter id="softShadow" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="18" stdDeviation="20" flood-color="#0f172a" flood-opacity="0.16"/>
    </filter>
  </defs>
  <rect width="800" height="800" rx="0" fill="#ffffff"/>
  <circle cx="400" cy="390" r="260" fill="#f8fafc"/>
  <ellipse cx="400" cy="660" rx="190" ry="30" fill="#0f172a" opacity="0.08"/>
  <g filter="url(#softShadow)">
    ${renderVisual(visual, accent, secondary)}
  </g>
  <text x="400" y="724" text-anchor="middle" font-family="Arial, sans-serif" font-size="22" font-weight="700" fill="#64748b">${safeCategory}</text>
</svg>`;
}

function renderVisual(visual, accent, secondary) {
    const fill = 'url(#accent)';

    switch (visual) {
        case 'phone':
            return `
<rect x="304" y="138" width="192" height="420" rx="42" fill="#111827"/>
<rect x="326" y="176" width="148" height="322" rx="18" fill="#f8fafc"/>
<circle cx="400" cy="526" r="13" fill="#334155"/>
<rect x="352" y="204" width="96" height="160" rx="18" fill="${fill}"/>
<circle cx="456" cy="158" r="10" fill="#64748b"/>`;
        case 'laptop':
            return `
<rect x="214" y="190" width="372" height="250" rx="22" fill="#111827"/>
<rect x="240" y="218" width="320" height="182" rx="10" fill="${fill}"/>
<path d="M172 484h456l44 58c8 11 0 26-14 26H142c-14 0-22-15-14-26l44-58Z" fill="#cbd5e1"/>
<rect x="340" y="508" width="120" height="12" rx="6" fill="#94a3b8"/>`;
        case 'headphones':
            return `
<path d="M250 386c0-108 62-188 150-188s150 80 150 188" fill="none" stroke="#111827" stroke-width="38" stroke-linecap="round"/>
<rect x="190" y="358" width="82" height="170" rx="32" fill="${fill}"/>
<rect x="528" y="358" width="82" height="170" rx="32" fill="${fill}"/>
<path d="M282 536c42 42 190 42 236 0" fill="none" stroke="#475569" stroke-width="18" stroke-linecap="round"/>`;
        case 'tv':
            return `
<rect x="166" y="186" width="468" height="286" rx="28" fill="#111827"/>
<rect x="196" y="220" width="408" height="214" rx="12" fill="${fill}"/>
<path d="M360 486h80v62h-80z" fill="#475569"/>
<rect x="294" y="546" width="212" height="26" rx="13" fill="#94a3b8"/>`;
        case 'watch':
            return `
<rect x="336" y="104" width="128" height="166" rx="34" fill="#111827"/>
<rect x="336" y="530" width="128" height="166" rx="34" fill="#111827"/>
<rect x="286" y="246" width="228" height="318" rx="70" fill="#111827"/>
<rect x="318" y="282" width="164" height="246" rx="42" fill="${fill}"/>
<circle cx="400" cy="406" r="42" fill="#f8fafc" opacity="0.9"/>`;
        case 'shirt':
            return `
<path d="M270 208l-96 72 58 90 58-36v258h220V334l58 36 58-90-96-72-72 44H342l-72-44Z" fill="${fill}"/>
<path d="M342 252c10 42 106 42 116 0" fill="none" stroke="#fff" stroke-width="18" stroke-linecap="round" opacity="0.8"/>`;
        case 'pants':
            return `
<path d="M300 176h200l-10 420h-88l-22-252-28 252h-88l36-420Z" fill="${fill}"/>
<path d="M300 176h200v54H300z" fill="#1e293b" opacity="0.28"/>
<path d="M400 180v404" stroke="#f8fafc" stroke-width="10" opacity="0.7"/>`;
        case 'shoe':
            return `
<path d="M186 478c84 5 126-34 176-122l80 68c46 40 98 58 166 64 22 2 38 18 38 40 0 28-22 50-50 50H204c-30 0-54-24-54-54 0-28 10-48 36-46Z" fill="${fill}"/>
<path d="M236 488h346" stroke="#111827" stroke-width="18" stroke-linecap="round" opacity="0.22"/>
<path d="M378 390l-44 48M424 426l-44 48M470 454l-40 44" stroke="#fff" stroke-width="12" stroke-linecap="round"/>`;
        case 'dress':
            return `
<path d="M348 176h104l44 122-52 22 104 260H252l104-260-52-22 44-122Z" fill="${fill}"/>
<path d="M352 176c10 40 86 40 96 0" fill="none" stroke="#fff" stroke-width="16" opacity="0.75"/>`;
        case 'jacket':
            return `
<path d="M260 190l92-38h96l92 38 58 350H202l58-350Z" fill="${fill}"/>
<path d="M400 154v386" stroke="#f8fafc" stroke-width="12" opacity="0.82"/>
<path d="M338 178l62 76 62-76" fill="none" stroke="#f8fafc" stroke-width="18" stroke-linecap="round"/>`;
        case 'sofa':
            return `
<rect x="184" y="324" width="432" height="198" rx="54" fill="${fill}"/>
<rect x="224" y="244" width="352" height="164" rx="44" fill="${accent}"/>
<rect x="210" y="528" width="48" height="58" rx="16" fill="#475569"/>
<rect x="542" y="528" width="48" height="58" rx="16" fill="#475569"/>`;
        case 'lamp':
            return `
<path d="M318 166h164l70 176H248l70-176Z" fill="${fill}"/>
<rect x="384" y="342" width="32" height="198" rx="16" fill="#475569"/>
<rect x="300" y="540" width="200" height="38" rx="19" fill="#94a3b8"/>
<circle cx="400" cy="352" r="38" fill="#fef3c7"/>`;
        case 'bedding':
            return `
<rect x="172" y="292" width="456" height="254" rx="38" fill="#cbd5e1"/>
<rect x="206" y="238" width="168" height="98" rx="28" fill="${fill}"/>
<rect x="426" y="238" width="168" height="98" rx="28" fill="${secondary}"/>
<path d="M172 404h456v118a38 38 0 0 1-38 38H210a38 38 0 0 1-38-38V404Z" fill="${fill}"/>`;
        case 'table':
            return `
<ellipse cx="400" cy="286" rx="218" ry="70" fill="${fill}"/>
<rect x="370" y="300" width="60" height="236" rx="22" fill="#92400e"/>
<path d="M260 560h280" stroke="#92400e" stroke-width="34" stroke-linecap="round"/>
<path d="M290 524l-54 68M510 524l54 68" stroke="#92400e" stroke-width="28" stroke-linecap="round"/>`;
        case 'vase':
            return `
<path d="M326 230h148c-10 72-48 90-48 142 0 60 62 92 62 154 0 64-46 98-88 98s-88-34-88-98c0-62 62-94 62-154 0-52-38-70-48-142Z" fill="${fill}"/>
<path d="M332 230h136" stroke="#0f766e" stroke-width="28" stroke-linecap="round"/>
<path d="M400 178c-58-54-118-36-138 20 64 16 104 6 138-20Zm0 0c58-54 118-36 138 20-64 16-104 6-138-20Z" fill="#22c55e"/>`;
        case 'perfume':
            return `
<rect x="344" y="148" width="112" height="62" rx="16" fill="#475569"/>
<rect x="300" y="232" width="200" height="330" rx="46" fill="${fill}"/>
<rect x="340" y="304" width="120" height="126" rx="18" fill="#fff" opacity="0.72"/>
<rect x="362" y="190" width="76" height="62" fill="#94a3b8"/>`;
        case 'skincare':
            return `
<rect x="250" y="258" width="122" height="310" rx="34" fill="${fill}"/>
<rect x="428" y="196" width="122" height="372" rx="34" fill="${secondary}"/>
<rect x="274" y="314" width="74" height="90" rx="14" fill="#fff" opacity="0.75"/>
<rect x="452" y="282" width="74" height="110" rx="14" fill="#fff" opacity="0.75"/>
<rect x="278" y="216" width="66" height="48" rx="12" fill="#64748b"/>
<rect x="456" y="154" width="66" height="48" rx="12" fill="#64748b"/>`;
        case 'palette':
            return `
<rect x="224" y="214" width="352" height="330" rx="40" fill="#111827"/>
<rect x="254" y="244" width="292" height="270" rx="24" fill="#f8fafc"/>
${[0, 1, 2].map((row) => [0, 1, 2, 3].map((col) => (
    `<circle cx="${310 + col * 60}" cy="${310 + row * 62}" r="22" fill="${col % 2 ? accent : secondary}" opacity="${0.75 + row * 0.08}"/>`
)).join('')).join('')}`;
        case 'dryer':
            return `
<path d="M242 292h238c64 0 116 52 116 116H430c-34 0-62-28-62-62v-4H242v-50Z" fill="${fill}"/>
<rect x="322" y="398" width="80" height="190" rx="28" fill="#111827"/>
<path d="M596 408h54c20 0 36 16 36 36s-16 36-36 36h-54v-72Z" fill="#475569"/>`;
        case 'lipstick':
            return `
<rect x="322" y="336" width="156" height="222" rx="28" fill="#111827"/>
<rect x="344" y="396" width="112" height="134" rx="18" fill="${fill}"/>
<path d="M356 336V224c0-58 88-58 88 0v112H356Z" fill="${secondary}"/>
<rect x="332" y="312" width="136" height="42" rx="14" fill="#f8fafc"/>`;
        case 'dumbbells':
            return `
<rect x="250" y="362" width="300" height="56" rx="28" fill="#111827"/>
<rect x="166" y="318" width="70" height="146" rx="20" fill="${fill}"/>
<rect x="236" y="302" width="54" height="178" rx="18" fill="#475569"/>
<rect x="564" y="318" width="70" height="146" rx="20" fill="${fill}"/>
<rect x="510" y="302" width="54" height="178" rx="18" fill="#475569"/>`;
        case 'bike':
            return `
<circle cx="266" cy="512" r="88" fill="none" stroke="#111827" stroke-width="22"/>
<circle cx="534" cy="512" r="88" fill="none" stroke="#111827" stroke-width="22"/>
<path d="M266 512l104-164 84 164H266Zm104-164h116l48 164M370 348l-44-74M486 348l62-62" fill="none" stroke="${fill}" stroke-width="26" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M326 274h92M538 286h62" stroke="#475569" stroke-width="20" stroke-linecap="round"/>`;
        case 'supplement':
            return `
<rect x="270" y="250" width="260" height="308" rx="46" fill="${fill}"/>
<path d="M290 250h220v-54c0-22-18-40-40-40H330c-22 0-40 18-40 40v54Z" fill="#111827"/>
<rect x="318" y="332" width="164" height="108" rx="22" fill="#fff" opacity="0.85"/>
<path d="M350 458h100" stroke="#fff" stroke-width="18" stroke-linecap="round" opacity="0.75"/>`;
        case 'treadmill':
            return `
<path d="M184 520h390c44 0 80 30 90 72H242c-44 0-80-30-58-72Z" fill="#111827"/>
<path d="M324 520l116-256h122" stroke="${fill}" stroke-width="28" stroke-linecap="round"/>
<rect x="522" y="214" width="120" height="76" rx="20" fill="#475569"/>
<path d="M244 592h350" stroke="#64748b" stroke-width="18" stroke-linecap="round"/>`;
        case 'petFood':
            return `
<path d="M288 196h224l54 372c5 36-23 68-60 68H294c-37 0-65-32-60-68l54-372Z" fill="${fill}"/>
<rect x="310" y="300" width="180" height="136" rx="28" fill="#fff" opacity="0.82"/>
<circle cx="370" cy="370" r="18" fill="${secondary}"/>
<circle cx="430" cy="370" r="18" fill="${secondary}"/>
<path d="M350 420c32 24 68 24 100 0" stroke="${secondary}" stroke-width="14" stroke-linecap="round"/>`;
        case 'petBed':
            return `
<ellipse cx="400" cy="482" rx="238" ry="126" fill="${fill}"/>
<ellipse cx="400" cy="466" rx="166" ry="72" fill="#fff" opacity="0.86"/>
<path d="M206 466c20-92 88-146 194-146s174 54 194 146" fill="none" stroke="${secondary}" stroke-width="52" stroke-linecap="round"/>`;
        case 'boneToy':
            return `
<path d="M258 338c-36-36-96-10-96 42 0 52 60 78 96 42l166 166c36 36 96 10 96-42 0-52-60-78-96-42L258 338Z" fill="${fill}"/>
<path d="M214 402l184 184" stroke="#fff" stroke-width="24" stroke-linecap="round" opacity="0.65"/>`;
        case 'catLitter':
            return `
<path d="M274 176h252l36 390c4 42-28 78-70 78H308c-42 0-74-36-70-78l36-390Z" fill="${fill}"/>
<rect x="316" y="300" width="168" height="142" rx="26" fill="#fff" opacity="0.82"/>
<path d="M342 376h116" stroke="${secondary}" stroke-width="18" stroke-linecap="round"/>
<path d="M330 176h140" stroke="#94a3b8" stroke-width="34" stroke-linecap="round"/>`;
        case 'collar':
            return `
<circle cx="400" cy="398" r="174" fill="none" stroke="${fill}" stroke-width="56"/>
<rect x="376" y="526" width="118" height="72" rx="22" fill="#111827"/>
<circle cx="400" cy="562" r="14" fill="${secondary}"/>
<path d="M284 284l84 84" stroke="#fff" stroke-width="18" stroke-linecap="round" opacity="0.8"/>`;
        case 'book':
            return `
<path d="M270 170h252c24 0 44 20 44 44v362H300c-36 0-66-30-66-66V206c0-20 16-36 36-36Z" fill="${fill}"/>
<path d="M300 548h266v48H300c-20 0-36-16-36-36s16-36 36-36Z" fill="#f8fafc"/>
<path d="M322 250h150M322 300h108" stroke="#fff" stroke-width="18" stroke-linecap="round" opacity="0.75"/>`;
        case 'bookBox':
            return `
<rect x="220" y="200" width="110" height="360" rx="12" fill="${accent}"/>
<rect x="344" y="174" width="110" height="386" rx="12" fill="${secondary}"/>
<rect x="468" y="220" width="110" height="340" rx="12" fill="#111827"/>
<path d="M254 260h42M378 248h42M502 286h42" stroke="#fff" stroke-width="14" stroke-linecap="round" opacity="0.76"/>`;
        case 'manga':
            return `
<rect x="268" y="168" width="264" height="408" rx="24" fill="${fill}"/>
<rect x="296" y="204" width="208" height="228" rx="18" fill="#fff" opacity="0.82"/>
<circle cx="360" cy="316" r="34" fill="${secondary}"/>
<circle cx="440" cy="316" r="34" fill="${secondary}"/>
<path d="M342 462h116" stroke="#fff" stroke-width="18" stroke-linecap="round"/>`;
        case 'blocks':
            return `
<rect x="208" y="392" width="142" height="142" rx="24" fill="${accent}"/>
<rect x="350" y="250" width="142" height="142" rx="24" fill="${secondary}"/>
<rect x="492" y="392" width="142" height="142" rx="24" fill="#3483fa"/>
<circle cx="252" cy="434" r="14" fill="#fff" opacity="0.75"/>
<circle cx="306" cy="434" r="14" fill="#fff" opacity="0.75"/>
<circle cx="394" cy="292" r="14" fill="#fff" opacity="0.75"/>
<circle cx="546" cy="434" r="14" fill="#fff" opacity="0.75"/>`;
        case 'doll':
            return `
<circle cx="400" cy="230" r="74" fill="#f9a8d4"/>
<path d="M314 382c20-58 152-58 172 0l58 198H256l58-198Z" fill="${fill}"/>
<circle cx="374" cy="224" r="8" fill="#111827"/>
<circle cx="426" cy="224" r="8" fill="#111827"/>
<path d="M374 262c18 14 34 14 52 0" stroke="#111827" stroke-width="8" stroke-linecap="round"/>`;
        case 'toyCars':
            return `
<path d="M190 416h420l58 70v62H132v-62l58-70Z" fill="${fill}"/>
<path d="M280 350h206l76 66H226l54-66Z" fill="${secondary}"/>
<circle cx="248" cy="548" r="46" fill="#111827"/>
<circle cx="552" cy="548" r="46" fill="#111827"/>
<circle cx="248" cy="548" r="18" fill="#f8fafc"/>
<circle cx="552" cy="548" r="18" fill="#f8fafc"/>`;
        case 'boardGame':
            return `
<rect x="214" y="202" width="372" height="372" rx="34" fill="${fill}"/>
<path d="M214 326h372M214 450h372M338 202v372M462 202v372" stroke="#fff" stroke-width="14" opacity="0.65"/>
<circle cx="274" cy="264" r="24" fill="${secondary}"/>
<circle cx="526" cy="512" r="24" fill="${secondary}"/>`;
        case 'plush':
            return `
<circle cx="310" cy="246" r="54" fill="${secondary}"/>
<circle cx="490" cy="246" r="54" fill="${secondary}"/>
<circle cx="400" cy="342" r="142" fill="${fill}"/>
<ellipse cx="400" cy="474" rx="178" ry="120" fill="${fill}"/>
<circle cx="356" cy="330" r="14" fill="#111827"/>
<circle cx="444" cy="330" r="14" fill="#111827"/>
<ellipse cx="400" cy="380" rx="34" ry="24" fill="#fff" opacity="0.82"/>`;
        case 'basket':
            return `
<path d="M220 356h360l-48 200c-8 34-38 58-74 58H342c-36 0-66-24-74-58l-48-200Z" fill="${fill}"/>
<path d="M292 356c14-98 202-98 216 0" fill="none" stroke="#92400e" stroke-width="28" stroke-linecap="round"/>
<circle cx="318" cy="326" r="34" fill="${secondary}"/>
<circle cx="410" cy="306" r="38" fill="#ef4444"/>
<circle cx="494" cy="330" r="30" fill="#22c55e"/>`;
        case 'coffee':
            return `
<path d="M292 188h216l42 374c4 36-24 68-60 68H310c-36 0-64-32-60-68l42-374Z" fill="${fill}"/>
<rect x="316" y="306" width="168" height="136" rx="26" fill="#fff" opacity="0.82"/>
<path d="M342 372h116" stroke="${secondary}" stroke-width="18" stroke-linecap="round"/>
<path d="M332 188h136" stroke="#78350f" stroke-width="32" stroke-linecap="round"/>`;
        case 'oliveOil':
            return `
<rect x="342" y="166" width="116" height="430" rx="42" fill="${fill}"/>
<rect x="366" y="112" width="68" height="82" rx="18" fill="#166534"/>
<rect x="366" y="314" width="68" height="132" rx="20" fill="#fff" opacity="0.84"/>
<path d="M400 354c42-34 76-30 102 6-42 12-74 6-102-6Z" fill="${secondary}"/>`;
        case 'chocolate':
            return `
<rect x="226" y="238" width="348" height="308" rx="34" fill="${fill}"/>
<path d="M226 342h348M226 446h348M342 238v308M458 238v308" stroke="#fef3c7" stroke-width="12" opacity="0.72"/>
<rect x="284" y="292" width="232" height="80" rx="20" fill="${secondary}" opacity="0.85"/>`;
        case 'honey':
            return `
<rect x="310" y="228" width="180" height="336" rx="54" fill="${fill}"/>
<path d="M346 168h108v80H346z" fill="#78350f"/>
<rect x="338" y="340" width="124" height="116" rx="28" fill="#fff" opacity="0.82"/>
<path d="M366 388h68" stroke="${secondary}" stroke-width="18" stroke-linecap="round"/>`;
        case 'motorOil':
            return `
<path d="M286 230h142l86 76v270c0 28-22 50-50 50H286c-28 0-50-22-50-50V280c0-28 22-50 50-50Z" fill="${fill}"/>
<rect x="306" y="154" width="112" height="82" rx="20" fill="#111827"/>
<path d="M428 230v82h86" fill="#f8fafc" opacity="0.78"/>
<rect x="282" y="380" width="154" height="114" rx="22" fill="#fff" opacity="0.84"/>`;
        case 'battery':
            return `
<rect x="202" y="280" width="396" height="236" rx="36" fill="${fill}"/>
<rect x="256" y="230" width="82" height="50" rx="14" fill="#475569"/>
<rect x="462" y="230" width="82" height="50" rx="14" fill="#475569"/>
<path d="M278 398h72M314 362v72M450 398h72" stroke="#fff" stroke-width="20" stroke-linecap="round"/>`;
        case 'cleaningKit':
            return `
<rect x="218" y="330" width="116" height="238" rx="34" fill="${fill}"/>
<rect x="364" y="236" width="116" height="332" rx="34" fill="${secondary}"/>
<path d="M480 284h66c24 0 44 20 44 44v240H480V284Z" fill="#facc15"/>
<rect x="244" y="386" width="64" height="78" rx="14" fill="#fff" opacity="0.75"/>
<rect x="390" y="342" width="64" height="96" rx="14" fill="#fff" opacity="0.75"/>`;
        case 'tire':
            return `
<circle cx="400" cy="392" r="196" fill="#111827"/>
<circle cx="400" cy="392" r="116" fill="#f8fafc"/>
<circle cx="400" cy="392" r="58" fill="#475569"/>
<path d="M400 196v86M400 502v86M204 392h86M510 392h86M262 254l60 60M478 470l60 60M538 254l-60 60M322 470l-60 60" stroke="#475569" stroke-width="18" stroke-linecap="round"/>`;
        case 'stereo':
            return `
<rect x="206" y="246" width="388" height="286" rx="38" fill="${fill}"/>
<rect x="250" y="300" width="300" height="82" rx="20" fill="#020617"/>
<circle cx="310" cy="452" r="42" fill="#111827"/>
<circle cx="490" cy="452" r="42" fill="#111827"/>
<path d="M362 342h76" stroke="${secondary}" stroke-width="16" stroke-linecap="round"/>`;
        default:
            return `
<rect x="268" y="230" width="264" height="314" rx="46" fill="${fill}"/>
<rect x="316" y="318" width="168" height="132" rx="24" fill="#fff" opacity="0.78"/>
<path d="M344 380h112" stroke="${secondary}" stroke-width="18" stroke-linecap="round"/>`;
    }
}

function escapeXml(value = '') {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
