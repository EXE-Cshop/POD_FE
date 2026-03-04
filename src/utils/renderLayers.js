/**
 * Convert design objects to RenderPrintRequest layers (mm-based).
 * Matches backend PrintDesignLayerRequest: type, x_mm, y_mm, width_mm, height_mm, rotation_deg, z_index.
 * Image: + url, opacity. Text: + text, fontFamily, fontSize, fontColor.
 */
const PRINT_AREA_LEFT = 200;
const PRINT_AREA_TOP = 100;
const PRINT_AREA_WIDTH = 400;
const PRINT_AREA_HEIGHT = 600;
const PRINT_AREA_WIDTH_MM = 100;
const PRINT_AREA_HEIGHT_MM = 150;
const PX_TO_MM = PRINT_AREA_WIDTH_MM / PRINT_AREA_WIDTH;

export { PRINT_AREA_WIDTH_MM, PRINT_AREA_HEIGHT_MM };

export function toNum(v, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function buildLayerBase(left, top, w, h, obj, idx) {
  // Fabric default origin is center; backend expects top-left. Convert if center.
  const ox = obj.originX || 'center';
  const oy = obj.originY || 'center';
  let px = toNum(left);
  let py = toNum(top);
  if (ox === 'center') px -= w / 2;
  else if (ox === 'right') px -= w;
  if (oy === 'center') py -= h / 2;
  else if (oy === 'bottom') py -= h;
  const xMm = (px - PRINT_AREA_LEFT) * PX_TO_MM;
  const yMm = (py - PRINT_AREA_TOP) * PX_TO_MM;
  const widthMm = Math.max(0.1, toNum(w) * PX_TO_MM);
  const heightMm = Math.max(0.1, toNum(h) * PX_TO_MM);
  return {
    type: obj.type === 'textbox' ? 'text' : 'image',
    x_mm: xMm,
    y_mm: yMm,
    width_mm: widthMm,
    height_mm: heightMm,
    rotation_deg: toNum(obj.angle, 0),
    z_index: idx,
  };
}

export function serializedToRenderLayers(objs) {
  if (!Array.isArray(objs)) return [];
  return objs.map((obj, idx) => {
    const left = obj.left ?? 0;
    const top = obj.top ?? 0;
    // Fabric toObject: width/height = base; scaleX/scaleY = zoom. serializeDesignObjects: width/height already scaled.
    const scaleX = toNum(obj.scaleX, 1);
    const scaleY = toNum(obj.scaleY, 1);
    const baseW = obj.width ?? (obj.type === 'textbox' ? 100 : 1);
    const baseH = obj.height ?? (obj.type === 'textbox' ? (obj.fontSize || 24) * 1.5 : 1);
    const w = obj._scaledDimensions ? baseW : baseW * scaleX;
    const h = obj._scaledDimensions ? baseH : baseH * scaleY;
    const base = buildLayerBase(left, top, w, h, obj, idx);
    if (obj.type === 'textbox') {
      return {
        ...base,
        text: String(obj.text ?? ''),
        fontFamily: obj.fontFamily ?? 'Arial',
        fontSize: toNum(obj.fontSize, 24),
        fontColor: obj.fill ?? '#000000',
      };
    }
    let url = obj.src || '';
    if (url && !url.startsWith('http') && !url.startsWith('data:')) {
      url = `${window.location.origin}${url.startsWith('/') ? '' : '/'}${url}`;
    }
    return { ...base, url: url || '', opacity: toNum(obj.opacity, 1) };
  });
}

/** SVG → PNG via canvas (Batik doesn't support feDropShadow and some SVG filters). */
async function svgToPngDataUrl(svgUrl) {
  const img = new Image();
  img.crossOrigin = 'anonymous';
  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = () => reject(new Error('SVG load failed'));
    img.src = svgUrl;
  });
  const w = Math.max(1, img.naturalWidth || 256);
  const h = Math.max(1, img.naturalHeight || 256);
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);
  return canvas.toDataURL('image/png');
}

/** Convert single image URL to data URL (for garment). Same-origin/cors-friendly. */
export async function ensureDataUrl(url) {
  if (!url || url.startsWith('data:')) return url;
  try {
    const res = await fetch(url, { mode: 'cors' });
    const blob = await res.blob();
    return await new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result);
      r.onerror = reject;
      r.readAsDataURL(blob);
    });
  } catch (e) {
    console.warn('Could not convert garment URL to data URL:', url, e);
    return url;
  }
}

/** Convert image URLs to data URLs. SVG → PNG on frontend (Batik can't handle feDropShadow etc). */
export async function ensureDataUrlsForLayers(layers) {
  return Promise.all(
    layers.map(async (layer) => {
      if (layer.type !== 'image' || !layer.url) return layer;
      if (layer.url.startsWith('data:image/png')) return layer;
      try {
        const u = layer.url.toLowerCase();
        const isSvg = u.includes('.svg') || u.includes('image/svg+xml');
        if (isSvg) {
          // Convert SVG → PNG in browser (Batik can't handle feDropShadow etc.)
          return { ...layer, url: await svgToPngDataUrl(layer.url) };
        }
        const res = await fetch(layer.url, { mode: 'cors' });
        const blob = await res.blob();
        return {
          ...layer,
          url: await new Promise((resolve, reject) => {
            const r = new FileReader();
            r.onload = () => resolve(r.result);
            r.onerror = reject;
            r.readAsDataURL(blob);
          }),
        };
      } catch (e) {
        console.warn('Could not convert to data URL, using original:', layer.url, e);
        return layer;
      }
    })
  );
}
