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
        fontWeight: obj.fontWeight || 'normal',
        fontStyle: obj.fontStyle || 'normal',
        textAlign: obj.textAlign || 'left',
        scaleX,
        scaleY,
        textBoxWidthCanvasPx: toNum(obj.width ?? obj._originalWidth, 100),
      };
    }
    let url = obj.src || '';
    if (url && !url.startsWith('http') && !url.startsWith('data:')) {
      url = `${window.location.origin}${url.startsWith('/') ? '' : '/'}${url}`;
    }
    return { ...base, url: url || '', opacity: toNum(obj.opacity, 1) };
  });
}

/** Check if URL or blob is SVG (SVG not supported in render pipeline). */
function isSvg(url, blobType) {
  if (!url) return false;
  const u = String(url).toLowerCase();
  if (u.includes('.svg') || u.includes('image/svg+xml')) return true;
  if (blobType && String(blobType).toLowerCase().includes('svg')) return true;
  return false;
}

/** Convert any image blob to a PNG data URL (handles WebP, AVIF, etc. that Java ImageIO can't read). */
async function blobToPngDataUrl(blob) {
  const bitmap = await createImageBitmap(blob);
  const canvas = document.createElement('canvas');
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  canvas.getContext('2d').drawImage(bitmap, 0, 0);
  bitmap.close?.();
  return canvas.toDataURL('image/png');
}

/** Convert single image URL to PNG data URL (for garment). Handles WebP from Cloudinary. */
export async function ensureDataUrl(url) {
  if (!url) return url;
  if (url.startsWith('data:image/png') || url.startsWith('data:image/jpeg')) return url;
  try {
    let blob;
    if (url.startsWith('data:')) {
      const res = await fetch(url);
      blob = await res.blob();
    } else {
      const res = await fetch(url, { mode: 'cors' });
      blob = await res.blob();
    }
    const isPngOrJpeg = blob.type === 'image/png' || blob.type === 'image/jpeg';
    if (isPngOrJpeg) {
      return await new Promise((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(r.result);
        r.onerror = reject;
        r.readAsDataURL(blob);
      });
    }
    return await blobToPngDataUrl(blob);
  } catch (e) {
    console.warn('Could not convert garment URL to data URL:', url, e);
    return url;
  }
}

/** Convert image URLs to data URLs (always PNG). SVG layers are rejected. */
export async function ensureDataUrlsForLayers(layers) {
  const result = [];
  for (const layer of layers) {
    if (layer.type !== 'image' || !layer.url) {
      result.push(layer);
      continue;
    }
    if (layer.url.startsWith('data:image/png') || layer.url.startsWith('data:image/jpeg')) {
      result.push(layer);
      continue;
    }
    if (isSvg(layer.url)) {
      throw new Error('Thiết kế có chứa ảnh SVG không được hỗ trợ. Vui lòng sử dụng PNG hoặc JPG.');
    }
    try {
      let blob;
      if (layer.url.startsWith('data:')) {
        const res = await fetch(layer.url);
        blob = await res.blob();
      } else {
        const res = await fetch(layer.url, { mode: 'cors' });
        blob = await res.blob();
      }
      if (isSvg(null, blob.type)) {
        throw new Error('Thiết kế có chứa ảnh SVG không được hỗ trợ. Vui lòng sử dụng PNG hoặc JPG.');
      }
      const isPngOrJpeg = blob.type === 'image/png' || blob.type === 'image/jpeg';
      let dataUrl;
      if (isPngOrJpeg) {
        dataUrl = await new Promise((resolve, reject) => {
          const r = new FileReader();
          r.onload = () => resolve(r.result);
          r.onerror = reject;
          r.readAsDataURL(blob);
        });
      } else {
        dataUrl = await blobToPngDataUrl(blob);
      }
      result.push({ ...layer, url: dataUrl });
    } catch (e) {
      if (e.message?.includes('SVG')) throw e;
      console.warn('Could not convert to data URL:', layer.url, e);
      result.push(layer);
    }
  }
  return result;
}
