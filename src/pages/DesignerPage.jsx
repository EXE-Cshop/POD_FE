import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import * as fabric from 'fabric';
import { baseProductService, productVariantService, stickerService, designProductService, uploadImage, cartService, API_ORIGIN } from '../services/api';
import { guestCartStorage } from '../utils/guestCartStorage';
import Header from '../components/common/Header';
import { useAuth } from '../components/AuthProvider';

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 800;
const TSHIRT_IMAGES_FALLBACK = {
  black: 'https://res.cloudinary.com/di5j3h6wi/image/upload/v1772617682/b2a8c03b0b0761bb2bf0e4e6e7d5774b_nrk6ub.webp',
};
const PRINT_AREA_WIDTH = 305;
const PRINT_AREA_HEIGHT = 500;
const PRINT_AREA_TOP_OFFSET = 55;

const PRINT_AREA_LEFT = (CANVAS_WIDTH - PRINT_AREA_WIDTH) / 2;
const PRINT_AREA_TOP = (CANVAS_HEIGHT - PRINT_AREA_HEIGHT) / 2 + PRINT_AREA_TOP_OFFSET;
/** Print area in mm (for backend RenderController). 400x600 px ≈ 100x150 mm at ~67 DPI. */
const PRINT_AREA_WIDTH_MM = 100;
const PRINT_AREA_HEIGHT_MM = 150;
const PX_TO_MM = PRINT_AREA_WIDTH_MM / PRINT_AREA_WIDTH;
const PRINT_AREA_RIGHT = PRINT_AREA_LEFT + PRINT_AREA_WIDTH;
const PRINT_AREA_BOTTOM = PRINT_AREA_TOP + PRINT_AREA_HEIGHT;

const HISTORY_LIMIT = 30;
const BASE_PRICE = 299000;
const POD_DESIGNER_DRAFT = 'pod_designer_draft';
const SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

const createPrintAreaClipPath = () =>
  new fabric.Rect({
    left: PRINT_AREA_LEFT,
    top: PRINT_AREA_TOP,
    width: PRINT_AREA_WIDTH,
    height: PRINT_AREA_HEIGHT,
    originX: 'left',
    originY: 'top',
    absolutePositioned: true,
  });

const applyPrintAreaClip = (obj) => {
  if (!obj || obj.data?.isTshirtBg || obj.data?.isPrintArea) return;
  obj.set('clipPath', createPrintAreaClipPath());
  obj.set('visible', true);
};

const DesignerPage = () => {
  const navigate = useNavigate();
  const { productId } = useParams();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const sharedDesignIdRef = useRef(location.state?.sharedDesignId);
  const editingDesignRef = useRef(location.state?.editingDesign);
  const canvasRef = useRef(null);
  const fabricRef = useRef(null);

  const [product, setProduct] = useState(null);
  const [variants, setVariants] = useState([]);
  const [productLoading, setProductLoading] = useState(!!productId);
  const [productError, setProductError] = useState(null);
  const [renderError, setRenderError] = useState(null);
  const [activeTool, setActiveTool] = useState('stickers');
  const [textValue, setTextValue] = useState('');
  const [newFontFamily, setNewFontFamily] = useState('Manrope, sans-serif');
  const [newFontSize, setNewFontSize] = useState(24);
  const [newTextColor, setNewTextColor] = useState('#000000');
  const [newFontWeight, setNewFontWeight] = useState('normal');
  const [newFontStyle, setNewFontStyle] = useState('normal');
  const [zoom, setZoom] = useState(100);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const isPanningRef = useRef(false);
  const panStartRef = useRef({ x: 0, y: 0 });
  const deleteSelectedRef = useRef(null);
  const skipNextHistoryRef = useRef(false);
  const hasSavedForInteractionRef = useRef(false);
  const hasSavedForTextEditRef = useRef(false);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);
  const fileInputRef = useRef(null);
  const [selectedObj, setSelectedObj] = useState(null);
  const [layers, setLayers] = useState([]);
  const [isAdded, setIsAdded] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [activeColor, setActiveColor] = useState('white');
  const [designSide, setDesignSide] = useState('front');
  const [selectedSize, setSelectedSize] = useState('M');
  const [quantity, setQuantity] = useState(1);
  const [apiStickers, setApiStickers] = useState([]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [saveIsPublic, setSaveIsPublic] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isTryingOn, setIsTryingOn] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [cartLoading, setCartLoading] = useState(false);
  const frontDesignRef = useRef('[]');
  const backDesignRef = useRef('[]');
  const frontUndoStackRef = useRef([]);
  const frontRedoStackRef = useRef([]);
  const backUndoStackRef = useRef([]);
  const backRedoStackRef = useRef([]);
  const canvasMountedRef = useRef(true);

  useEffect(() => {
    if (!productId) {
      setProductLoading(false);
      setProduct(null);
      setVariants([]);
      return;
    }
    const fetchData = async () => {
      setProductLoading(true);
      setProductError(null);
      try {
        const [productRes, variantsRes] = await Promise.all([
          baseProductService.getById(productId),
          productVariantService.getByBaseProductId(productId),
        ]);
        const productData = productRes.data?.data || productRes.data || null;
        setProduct(productData);
        const variantList = variantsRes.data?.data?.content || variantsRes.data?.data || [];
        setVariants(Array.isArray(variantList) ? variantList : []);
      } catch (err) {
        console.error('DesignerPage: fetch product failed', err);
        setProductError('Không thể tải thông tin sản phẩm.');
      } finally {
        setProductLoading(false);
      }
    };
    fetchData();
  }, [productId]);

  useEffect(() => {
    stickerService.getAll().then((res) => {
      const list = res.data?.data ?? res.data ?? [];
      setApiStickers(Array.isArray(list) ? list : []);
    }).catch(() => setApiStickers([]));
  }, []);

  const allStickers = apiStickers;

  // Ánh xạ màu từ DB (Trắng/Đen) sang DesignerPage (white/black). Ưu tiên variant, rồi product.imageUrl.
  const tshirtImages = React.useMemo(() => {
    const map = { ...TSHIRT_IMAGES_FALLBACK };
    const urlOf = (v) => v?.frontImageUrl || v?.front_image_url;
    variants.forEach((v) => {
      const url = urlOf(v);
      if (!url) return;
      const name = (v.colorName || v.color_name || '').toLowerCase();
      if (name.includes('trắng') || name.includes('trang') || name.includes('white')) map.white = url;
      else if (name.includes('đen') || name.includes('den') || name.includes('black')) map.black = url;
    });
    const productImg = product?.imageUrl || product?.image_url;
    if (productImg) {
      if (!map.white) map.white = productImg;
      if (!map.black) map.black = productImg;
    }
    // Nếu chỉ có 1 màu (vd: Black Edition) thì dùng ảnh đó cho cả 2
    if (map.white === map.black) return map;
    const hasWhite = map.white !== TSHIRT_IMAGES_FALLBACK.white;
    const hasBlack = map.black !== TSHIRT_IMAGES_FALLBACK.black;
    if (hasWhite && !hasBlack) map.black = map.white;
    if (hasBlack && !hasWhite) map.white = map.black;
    return map;
  }, [product, variants]);

  const refreshLayers = useCallback((canvas) => {
    if (!canvas) return;
    const items = canvas
      .getObjects()
      .filter((o) => !o.data?.isTshirtBg && !o.data?.isPrintArea)
      .reverse()
      .map((obj) => ({
        id: obj.__uid || (obj.__uid = Math.random().toString(36).slice(2, 8)),
        type: obj.type,
        label: obj.type === 'textbox' ? obj.text?.slice(0, 20) || 'Text' : obj.data?.stickerLabel || 'Sticker',
        obj,
      }));
    setLayers(items);
  }, []);

  const syncSelectedProps = useCallback((obj) => {
    if (!obj || obj.data?.isTshirtBg || obj.data?.isPrintArea) {
      setSelectedObj(null);
      return;
    }
    const props = {
      ref: obj,
      type: obj.type,
      left: Math.round(obj.left),
      top: Math.round(obj.top),
      width: Math.round(obj.getScaledWidth()),
      height: Math.round(obj.getScaledHeight()),
      angle: Math.round(obj.angle),
      scaleX: parseFloat(obj.scaleX.toFixed(2)),
    };
    if (obj.type === 'textbox') {
      props.text = obj.text;
      props.fontSize = obj.fontSize;
      props.fill = obj.fill;
      props.fontFamily = obj.fontFamily;
      props.fontWeight = obj.fontWeight || 'normal';
      props.fontStyle = obj.fontStyle || 'normal';
    }
    setSelectedObj(props);
  }, []);

  const getStacksForSide = useCallback((side) => ({
    undo: side === 'front' ? frontUndoStackRef : backUndoStackRef,
    redo: side === 'front' ? frontRedoStackRef : backRedoStackRef,
  }), []);

  const serializeDesignOnly = useCallback((canvas) => {
    const objs = canvas.getObjects().filter((o) => !o.data?.isTshirtBg && !o.data?.isPrintArea);
    return JSON.stringify(objs.map((o) => o.toObject(['data'])));
  }, []);

  const saveHistoryState = useCallback((canvas, side = designSide) => {
    if (!canvas || skipNextHistoryRef.current) return;
    try {
      const json = serializeDesignOnly(canvas);
      const { undo, redo } = getStacksForSide(side);
      undo.current.push(json);
      if (undo.current.length > HISTORY_LIMIT) undo.current.shift();
      redo.current = [];
      const isCurrent = side === designSide;
      if (isCurrent) {
        setCanUndo(undo.current.length > 0);
        setCanRedo(false);
      }
    } catch (_) { }
  }, [designSide, getStacksForSide, serializeDesignOnly]);

  const restoreDesignFromJson = useCallback((canvas, jsonStr, onDone) => {
    const designObjs = canvas.getObjects().filter((o) => !o.data?.isTshirtBg && !o.data?.isPrintArea);
    designObjs.forEach((o) => canvas.remove(o));
    let designArr;
    try { designArr = JSON.parse(jsonStr || '[]'); } catch { designArr = []; }
    if (designArr.length === 0) {
      canvas.renderAll();
      refreshLayers(canvas);
      onDone?.();
      return;
    }
    // Fix legacy: _scaledDimensions images had scaleX/scaleY baked into width/height
    // Normalize image src: relative URLs -> absolute
    designArr = designArr.map((o) => {
      let next = o;
      if (o._scaledDimensions && o.type === 'image') next = { ...next, scaleX: 1, scaleY: 1 };
      if ((o.type === 'image' || o.type === 'FabricImage') && (o.src || o.url)) {
        let url = String(o.src || o.url).trim();
        if (url && !url.startsWith('http') && !url.startsWith('data:')) {
          next = { ...next, src: url.startsWith('/') ? `${API_ORIGIN}${url}` : `${API_ORIGIN}/${url}` };
        }
      }
      return next;
    });

    const isImage = (o) => (o.type === 'image' || o.type === 'FabricImage') && (o.src || o.url);
    const nonImageItems = designArr.filter((o) => !isImage(o));

    const applyPropsToImage = (img, o) => {
      const w = Number(o.width) || img.width || 1;
      const h = Number(o.height) || img.height || 1;
      const scaleX = (img.width && img.width > 0) ? w / img.width : (o.scaleX ?? 1);
      const scaleY = (img.height && img.height > 0) ? h / img.height : (o.scaleY ?? 1);
      img.set({
        left: o.left ?? 0, top: o.top ?? 0,
        scaleX, scaleY,
        angle: o.angle ?? 0,
        originX: o.originX ?? 'center', originY: o.originY ?? 'center',
        selectable: true, hasControls: true, hasBorders: true,
      });
      if (o.opacity != null) img.set('opacity', o.opacity);
    };

    const addAllInOrder = (imageResults, enlivenedNonImages) => {
      let imgIdx = 0, nonImgIdx = 0;
      designArr.forEach((o) => {
        if (isImage(o)) {
          const img = imageResults[imgIdx++];
          if (img) { canvas.add(img); applyPrintAreaClip(img); }
        } else {
          const obj = enlivenedNonImages[nonImgIdx++];
          if (obj) { canvas.add(obj); applyPrintAreaClip(obj); }
        }
      });
      enforceLayering(canvas);
      canvas.renderAll();
      refreshLayers(canvas);
      onDone?.();
    };

    const loadImagesThenFinish = (imageItems) => {
      if (imageItems.length === 0) {
        fabric.util.enlivenObjects(nonImageItems).then((enlivened) => addAllInOrder([], enlivened))
          .catch((e) => { console.error('[restoreDesign] enlivenObjects failed', e); canvas.renderAll(); refreshLayers(canvas); onDone?.(); });
        return;
      }
      Promise.all(imageItems.map((o) => {
        const url = o.src || o.url;
        return fabric.FabricImage.fromURL(url, { crossOrigin: 'anonymous' })
          .then((img) => { applyPropsToImage(img, o); return img; })
          .catch((err) => { console.warn('[restoreDesign] image load failed', url?.slice(0, 80), err); return null; });
      })).then((imageResults) => {
        fabric.util.enlivenObjects(nonImageItems)
          .then((enlivened) => addAllInOrder(imageResults, enlivened))
          .catch((e) => { console.error('[restoreDesign] enlivenObjects failed', e); imageResults.filter(Boolean).forEach((img) => { canvas.add(img); applyPrintAreaClip(img); }); canvas.renderAll(); refreshLayers(canvas); onDone?.(); });
      });
    };

    loadImagesThenFinish(designArr.filter(isImage));
  }, [refreshLayers]);

  const undo = useCallback(() => {
    const canvas = fabricRef.current;
    const { undo: undoStack, redo: redoStack } = getStacksForSide(designSide);
    if (!canvas || undoStack.current.length === 0) return;
    const state = undoStack.current.pop();
    redoStack.current.push(serializeDesignOnly(canvas));
    skipNextHistoryRef.current = true;
    restoreDesignFromJson(canvas, state, () => {
      setSelectedObj(null);
      skipNextHistoryRef.current = false;
      setCanUndo(undoStack.current.length > 0);
      setCanRedo(true);
    });
  }, [designSide, getStacksForSide, serializeDesignOnly, restoreDesignFromJson]);

  const redo = useCallback(() => {
    const canvas = fabricRef.current;
    const { undo: undoStack, redo: redoStack } = getStacksForSide(designSide);
    if (!canvas || redoStack.current.length === 0) return;
    const state = redoStack.current.pop();
    undoStack.current.push(serializeDesignOnly(canvas));
    skipNextHistoryRef.current = true;
    restoreDesignFromJson(canvas, state, () => {
      setSelectedObj(null);
      skipNextHistoryRef.current = false;
      setCanUndo(true);
      setCanRedo(redoStack.current.length > 0);
    });
  }, [designSide, getStacksForSide, serializeDesignOnly, restoreDesignFromJson]);

  const switchDesignSide = useCallback((newSide) => {
    if (newSide === designSide) return;
    const canvas = fabricRef.current;
    if (!canvas) return;

    const saveDesignToRef = () => {
      const objs = canvas.getObjects().filter((o) => !o.data?.isTshirtBg && !o.data?.isPrintArea);
      return JSON.stringify(objs.map((o) => o.toObject(['data'])));
    };

    if (designSide === 'front') frontDesignRef.current = saveDesignToRef();
    else backDesignRef.current = saveDesignToRef();

    const designObjs = canvas.getObjects().filter((o) => !o.data?.isTshirtBg && !o.data?.isPrintArea);
    designObjs.forEach((o) => canvas.remove(o));

    const otherJson = newSide === 'front' ? frontDesignRef.current : backDesignRef.current;
    const otherDesign = (() => { try { return JSON.parse(otherJson || '[]'); } catch { return []; } })();

    if (otherDesign.length === 0) {
      canvas.renderAll();
      refreshLayers(canvas);
      setDesignSide(newSide);
      const { undo, redo } = getStacksForSide(newSide);
      setCanUndo(undo.current.length > 0);
      setCanRedo(redo.current.length > 0);
    } else {
      fabric.util.enlivenObjects(otherDesign).then((enlivened) => {
        enlivened.forEach((obj) => {
          canvas.add(obj);
          applyPrintAreaClip(obj);
        });
        enforceLayering(canvas);
        refreshLayers(canvas);
        canvas.renderAll();
        setDesignSide(newSide);
        const { undo, redo } = getStacksForSide(newSide);
        setCanUndo(undo.current.length > 0);
        setCanRedo(redo.current.length > 0);
      });
    }
  }, [designSide, getStacksForSide, refreshLayers]);

  const undoRef = useRef(undo);
  const redoRef = useRef(redo);
  undoRef.current = undo;
  redoRef.current = redo;

  // ─── Fabric canvas helpers ────────────────────────────────────────

  const addPrintAreaOverlay = (canvas) => {
    const rect = new fabric.Rect({
      width: PRINT_AREA_WIDTH,
      height: PRINT_AREA_HEIGHT,
      left: PRINT_AREA_LEFT,
      top: PRINT_AREA_TOP,
      originX: 'left',
      originY: 'top',
      fill: 'transparent',
      stroke: '#13eca4',
      strokeWidth: 2,
      strokeDashArray: [8, 6],
      selectable: false,
      evented: false,
      lockMovementX: true, lockMovementY: true,
      lockScalingX: true, lockScalingY: true,
      lockRotation: true,
      hasControls: false, hasBorders: false,
      hoverCursor: 'default',
      data: { isPrintArea: true },
    });
    canvas.add(rect);
    canvas.renderAll();
  };

  const addTshirtBackground = (canvas, url) => {
    const u = url ?? tshirtImages.white;
    const fallbackUrl = (u === tshirtImages.white ? TSHIRT_IMAGES_FALLBACK.white : TSHIRT_IMAGES_FALLBACK.black);
    const altFallbackUrl = (u === tshirtImages.white ? TSHIRT_IMAGES_FALLBACK.black : TSHIRT_IMAGES_FALLBACK.white);
    const loadImg = (src, isFallback = false) =>
      fabric.FabricImage.fromURL(src, { crossOrigin: 'anonymous' }).then((img) => {
        if (!canvasMountedRef.current || !fabricRef.current) return;
        if (img.width === 0 || img.height === 0) throw new Error('Image failed to load (0x0)');
        if (isFallback) console.warn('DesignerPage: Using fallback t-shirt image', { url: src });
        const scale = Math.min(CANVAS_WIDTH / img.width, CANVAS_HEIGHT / img.height);
        img.set({
          scaleX: scale, scaleY: scale,
          left: CANVAS_WIDTH / 2, top: CANVAS_HEIGHT / 2,
          originX: 'center', originY: 'center',
          selectable: false, evented: false,
          lockMovementX: true, lockMovementY: true,
          lockScalingX: true, lockScalingY: true,
          lockRotation: true,
          hasControls: false, hasBorders: false,
          hoverCursor: 'default',
          data: { isTshirtBg: true },
        });
        canvas.add(img);
        canvas.sendObjectToBack(img);
        addPrintAreaOverlay(canvas);
        refreshLayers(canvas);
      });
    return loadImg(u).catch((err) => {
      console.error('DesignerPage: Primary t-shirt image failed to load', { url: u, err: err?.message || err });
      const nextUrl = (fallbackUrl === u) ? altFallbackUrl : fallbackUrl;
      return loadImg(nextUrl, true);
    });
  };

  const switchTshirtBg = (colorKey) => {
    const canvas = fabricRef.current;
    if (!canvas || colorKey === activeColor) return;
    const oldBg = canvas.getObjects().find((o) => o.data?.isTshirtBg);
    if (oldBg) canvas.remove(oldBg);
    const oldOverlay = canvas.getObjects().find((o) => o.data?.isPrintArea);
    if (oldOverlay) canvas.remove(oldOverlay);
    setActiveColor(colorKey);
    addTshirtBackground(canvas, tshirtImages[colorKey]);
  };

  // ─── Canvas init ──────────────────────────────────────────────────
  // Chỉ init khi đã tải xong (canvas nằm trong DOM). Khi productLoading=true thì canvas chưa được render.
  useEffect(() => {
    if (productLoading) return;
    const el = canvasRef.current;
    if (!el) return;

    canvasMountedRef.current = true;
    const canvas = new fabric.Canvas(el, {
      width: CANVAS_WIDTH,
      height: CANVAS_HEIGHT,
      backgroundColor: 'transparent',
      selection: true,
      preserveObjectStacking: true,
    });

    fabric.FabricObject.prototype.set({
      cornerColor: '#13eca4',
      cornerStrokeColor: '#0d9b6e',
      cornerSize: 10,
      cornerStyle: 'circle',
      transparentCorners: false,
      borderColor: '#13eca4',
      borderScaleFactor: 1.5,
      rotatingPointOffset: 30,
      hasRotatingPoint: true,
      lockScalingFlip: true,
    });

    const saveBeforeInteraction = () => {
      if (!hasSavedForInteractionRef.current) {
        hasSavedForInteractionRef.current = true;
        saveHistoryState(canvas);
      }
    };
    canvas.on('object:moving', (e) => {
      const obj = e.target;
      if (obj.data?.isTshirtBg || obj.data?.isPrintArea) return;
      saveBeforeInteraction();
      obj.setCoords();
    });
    canvas.on('object:scaling', (e) => {
      const obj = e.target;
      if (obj.data?.isTshirtBg || obj.data?.isPrintArea) return;
      saveBeforeInteraction();
    });
    canvas.on('object:rotating', (e) => {
      const obj = e.target;
      if (obj.data?.isTshirtBg || obj.data?.isPrintArea) return;
      saveBeforeInteraction();
    });

    canvas.on('object:added', () => { });
    canvas.on('object:removed', () => { });
    canvas.on('selection:created', (e) => syncSelectedProps(e.selected?.[0]));
    canvas.on('selection:updated', (e) => syncSelectedProps(e.selected?.[0]));
    canvas.on('selection:cleared', () => setSelectedObj(null));
    canvas.on('mouse:dblclick', (e) => {
      const t = e.target;
      if (t?.type === 'textbox' && !t.data?.isTshirtBg && !t.data?.isPrintArea && !hasSavedForTextEditRef.current) {
        hasSavedForTextEditRef.current = true;
        saveHistoryState(canvas);
      }
    });
    canvas.on('text:changed', (e) => {
      syncSelectedProps(e.target);
      refreshLayers(canvas);
    });
    canvas.on('object:modified', (e) => {
      hasSavedForInteractionRef.current = false;
      hasSavedForTextEditRef.current = false;
      syncSelectedProps(e.target);
      refreshLayers(canvas);
    });

    fabricRef.current = canvas;

    const applyDraftIfExists = () => {
      if (!canvasMountedRef.current) return;
      let draft;
      try {
        const raw = sessionStorage.getItem(POD_DESIGNER_DRAFT);
        if (!raw) return saveHistoryState(fabricRef.current);
        draft = JSON.parse(raw);
      } catch {
        return saveHistoryState(fabricRef.current);
      }
      frontDesignRef.current = draft.frontDesign || '[]';
      backDesignRef.current = draft.backDesign || '[]';
      setDesignSide(draft.designSide || 'front');
      setActiveColor(draft.activeColor || 'white');
      setSelectedSize(draft.selectedSize || 'M');
      setQuantity(draft.quantity ?? 1);
      const currentJson = draft.designSide === 'front' ? draft.frontDesign : draft.backDesign;
      restoreDesignFromJson(canvas, currentJson, () => {
        sessionStorage.removeItem(POD_DESIGNER_DRAFT);
      });
    };

    const applySharedDesign = (data) => {
      if (!canvasMountedRef.current || !data?.designJsonData) return;
      const j = data.designJsonData;
      const front = Array.isArray(j.frontDesign) ? j.frontDesign : [];
      const back = Array.isArray(j.backDesign) ? j.backDesign : [];
      const side = j.designSide || 'front';
      const color = j.garmentColor || 'white';
      console.log('[applySharedDesign] design loaded', { side, frontCount: front.length, backCount: back.length });
      front.concat(back).forEach((o, i) => {
        if (o?.type === 'image' && (o.src || o.url)) {
          console.log(`[applySharedDesign] image[${i}] src=`, o.src || o.url, 'type=', typeof (o.src || o.url));
        }
      });
      frontDesignRef.current = JSON.stringify(front);
      backDesignRef.current = JSON.stringify(back);
      setDesignSide(side);
      setActiveColor(color);
      setSelectedSize(j.selectedSize || 'M');
      setQuantity(j.quantity ?? 1);
      const currentJson = side === 'front' ? JSON.stringify(front) : JSON.stringify(back);
      restoreDesignFromJson(canvas, currentJson);
      sharedDesignIdRef.current = null;
    };

    const maybeSwitchBgThenApply = (draft) => {
      if (!canvasMountedRef.current) return;
      if (draft && draft.activeColor === 'black') {
        const oldBg = canvas.getObjects().find((o) => o.data?.isTshirtBg);
        const oldOverlay = canvas.getObjects().find((o) => o.data?.isPrintArea);
        if (oldBg) canvas.remove(oldBg);
        if (oldOverlay) canvas.remove(oldOverlay);
        addTshirtBackground(canvas, tshirtImages.black).then(applyDraftIfExists);
      } else {
        applyDraftIfExists();
      }
    };

    const maybeSwitchBgThenApplyShared = (data) => {
      if (!canvasMountedRef.current) return;
      const color = data?.designJsonData?.garmentColor || 'white';
      if (color === 'black') {
        const oldBg = canvas.getObjects().find((o) => o.data?.isTshirtBg);
        const oldOverlay = canvas.getObjects().find((o) => o.data?.isPrintArea);
        if (oldBg) canvas.remove(oldBg);
        if (oldOverlay) canvas.remove(oldOverlay);
        addTshirtBackground(canvas, tshirtImages.black).then(() => applySharedDesign(data));
      } else {
        applySharedDesign(data);
      }
    };

    addTshirtBackground(canvas, tshirtImages.white).then(() => {
      if (!canvasMountedRef.current) return;
      const sid = sharedDesignIdRef.current;
      if (sid) {
        designProductService.getById(sid).then((res) => {
          const d = res.data?.data ?? res.data;
          if (d) maybeSwitchBgThenApplyShared(d);
          else maybeSwitchBgThenApply(null);
        }).catch(() => maybeSwitchBgThenApply(null));
        return;
      }
      let draft;
      try {
        const raw = sessionStorage.getItem(POD_DESIGNER_DRAFT);
        draft = raw ? JSON.parse(raw) : null;
      } catch {
        draft = null;
      }
      maybeSwitchBgThenApply(draft);
    });

    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) redoRef.current();
        else undoRef.current();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        redoRef.current();
        return;
      }
      if (e.key !== 'Delete' && e.key !== 'Backspace') return;
      const tag = e.target.tagName;
      if (tag === 'INPUT' || tag === 'SELECT' || e.target.isContentEditable) return;
      const c = fabricRef.current;
      if (!c) return;
      const activeObj = c.getActiveObject();
      if (!activeObj || activeObj.isEditing) return;
      e.preventDefault();
      deleteSelectedRef.current?.();
    };
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      canvasMountedRef.current = false;
      document.removeEventListener('keydown', handleKeyDown);
      try {
        canvas.dispose();
      } catch (_) { }
      fabricRef.current = null;
    };
  }, [productLoading]);

  // ─── Actions ──────────────────────────────────────────────────────

  const addSticker = (sticker) => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const src = sticker.src ?? sticker.link;
    const label = sticker.label ?? `Sticker #${sticker.id}`;
    if (!src) return;
    fabric.FabricImage.fromURL(src, { crossOrigin: 'anonymous' }).then((img) => {
      if (!fabricRef.current) return;
      saveHistoryState(canvas);
      const maxSize = 100;
      const scale = Math.min(maxSize / img.width, maxSize / img.height);
      img.set({
        scaleX: scale, scaleY: scale,
        left: CANVAS_WIDTH / 2, top: CANVAS_HEIGHT / 2,
        originX: 'center', originY: 'center',
        selectable: true, hasControls: true, hasBorders: true,
        data: { stickerLabel: label },
      });
      canvas.add(img);
      applyPrintAreaClip(img);
      canvas.setActiveObject(img);
      canvas.renderAll();
      refreshLayers(canvas);
    });
  };

  const addText = () => {
    const canvas = fabricRef.current;
    if (!canvas || !textValue.trim()) return;
    saveHistoryState(canvas);
    const textbox = new fabric.Textbox(textValue, {
      left: CANVAS_WIDTH / 2, top: CANVAS_HEIGHT / 2,
      originX: 'center', originY: 'center',
      width: PRINT_AREA_WIDTH * 0.8,
      fontSize: newFontSize,
      fontFamily: newFontFamily,
      fontWeight: newFontWeight,
      fontStyle: newFontStyle,
      fill: newTextColor,
      textAlign: 'center',
      editable: true,
      selectable: true, hasControls: true, hasBorders: true,
    });
    canvas.add(textbox);
    applyPrintAreaClip(textbox);
    canvas.setActiveObject(textbox);
    canvas.renderAll();
    setTextValue('');
    refreshLayers(canvas);
  };

  const addImageToCanvas = (dataUrl, fileName) => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    fabric.FabricImage.fromURL(dataUrl).then((img) => {
      if (!fabricRef.current) return;
      saveHistoryState(canvas);
      const maxSize = 150;
      const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
      img.set({
        scaleX: scale, scaleY: scale,
        left: CANVAS_WIDTH / 2, top: CANVAS_HEIGHT / 2,
        originX: 'center', originY: 'center',
        selectable: true, hasControls: true, hasBorders: true,
        data: { stickerLabel: fileName },
      });
      canvas.add(img);
      applyPrintAreaClip(img);
      canvas.setActiveObject(img);
      canvas.renderAll();
      refreshLayers(canvas);
    });
  };

  const handleFileUpload = async (files) => {
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    const toProcess = Array.from(files).filter((f) => validTypes.includes(f.type));
    for (const file of toProcess) {
      const id = Date.now() + '_' + Math.random().toString(36).slice(2, 6);
      const name = file.name.replace(/\.[^.]+$/, '');
      setUploadedImages((prev) => [{ id, name, src: null, uploading: true }, ...prev]);
      try {
        const url = await uploadImage(file);
        setUploadedImages((prev) => prev.map((img) => (img.id === id ? { ...img, src: url, uploading: false } : img)));
      } catch (err) {
        console.warn('Upload to Cloudinary failed, using data URL:', err?.message);
        const dataUrl = await new Promise((resolve) => {
          const r = new FileReader();
          r.onload = (e) => resolve(e.target.result);
          r.readAsDataURL(file);
        });
        setUploadedImages((prev) => prev.map((img) => (img.id === id ? { ...img, src: dataUrl, uploading: false } : img)));
      }
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files?.length) handleFileUpload(e.dataTransfer.files);
  };

  const removeUploadedImage = (id) => {
    setUploadedImages((prev) => prev.filter((img) => img.id !== id));
  };

  const enforceLayering = (canvas) => {
    const objects = canvas.getObjects();
    const bg = objects.find((o) => o.data?.isTshirtBg);
    const overlay = objects.find((o) => o.data?.isPrintArea);
    if (bg) canvas.sendObjectToBack(bg);
    if (overlay) canvas.moveObjectTo(overlay, 1);
    canvas.renderAll();
  };

  const deleteSelected = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const active = canvas.getActiveObjects();
    const removable = active.filter((obj) => !obj.data?.isTshirtBg && !obj.data?.isPrintArea);
    if (removable.length) {
      saveHistoryState(canvas);
      removable.forEach((obj) => canvas.remove(obj));
      canvas.discardActiveObject();
      canvas.renderAll();
      refreshLayers(canvas);
      setSelectedObj(null);
    }
  };
  deleteSelectedRef.current = deleteSelected;

  const duplicateSelected = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (!active || active.data?.isTshirtBg || active.data?.isPrintArea) return;
    active.clone().then((cloned) => {
      saveHistoryState(canvas);
      cloned.set({ left: active.left + 20, top: active.top + 20 });
      canvas.add(cloned);
      canvas.setActiveObject(cloned);
      canvas.renderAll();
      refreshLayers(canvas);
    });
  };

  const bringToFront = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (!active || active.data?.isTshirtBg || active.data?.isPrintArea) return;
    saveHistoryState(canvas);
    canvas.bringObjectToFront(active);
    enforceLayering(canvas);
    refreshLayers(canvas);
  };

  const sendToBack = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (!active || active.data?.isTshirtBg || active.data?.isPrintArea) return;
    saveHistoryState(canvas);
    canvas.sendObjectToBack(active);
    enforceLayering(canvas);
    refreshLayers(canvas);
  };

  const clearCanvas = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    canvas.clear();
    canvas.backgroundColor = 'transparent';
    addTshirtBackground(canvas, tshirtImages[activeColor]).then(() => saveHistoryState(fabricRef.current));
    setSelectedObj(null);
  };

  const serializeDesignObjects = (canvas) => {
    const designObjects = canvas.getObjects().filter((obj) => !obj.data?.isTshirtBg && !obj.data?.isPrintArea);
    return designObjects.map((obj) => {
      const base = {
        type: obj.type,
        left: Math.round(obj.left), top: Math.round(obj.top),
        scaleX: parseFloat(obj.scaleX.toFixed(4)), scaleY: parseFloat(obj.scaleY.toFixed(4)),
        angle: Math.round(obj.angle),
        originX: obj.originX, originY: obj.originY,
      };
      if (obj.type === 'textbox') {
        return { ...base, text: obj.text, fontSize: obj.fontSize, fontFamily: obj.fontFamily, fontWeight: obj.fontWeight || 'normal', fontStyle: obj.fontStyle || 'normal', fill: obj.fill, textAlign: obj.textAlign, width: Math.round(obj.width), _scaledDimensions: false };
      }
      if (obj.type === 'image' && obj.getSrc) {
        const w = obj.getScaledWidth?.() ?? obj.width * (obj.scaleX ?? 1);
        const h = obj.getScaledHeight?.() ?? obj.height * (obj.scaleY ?? 1);
        // scaleX/scaleY must be 1 when _scaledDimensions: true so Fabric enlivenObjects restores correct size (no double scaling)
        return { ...base, scaleX: 1, scaleY: 1, src: obj.getSrc(), width: Math.round(w), height: Math.round(h), _scaledDimensions: true };
      }
      return base;
    });
  };

  /** Convert fabric design objects to RenderPrintRequest layers (mm-based) for backend */
  const designObjectsToRenderLayers = (fabricObjs) => {
    return fabricObjs.map((obj, idx) => {
      const left = toNum(obj.left, 0);
      const top = toNum(obj.top, 0);
      const scaleX = toNum(obj.scaleX, 1);
      const scaleY = toNum(obj.scaleY, 1);
      const w = obj.getScaledWidth?.() ?? toNum(obj.width, 1) * scaleX;
      const h = obj.getScaledHeight?.() ?? toNum(obj.height, 1) * scaleY;
      const ox = obj.originX || 'center';
      const oy = obj.originY || 'center';
      let px = left;
      let py = top;
      if (ox === 'center') px -= w / 2;
      else if (ox === 'right') px -= w;
      if (oy === 'center') py -= h / 2;
      else if (oy === 'bottom') py -= h;
      const xMm = (px - PRINT_AREA_LEFT) * PX_TO_MM;
      const yMm = (py - PRINT_AREA_TOP) * PX_TO_MM;
      const widthMm = Math.max(0.1, toNum(w) * PX_TO_MM);
      const heightMm = Math.max(0.1, toNum(h) * PX_TO_MM);
      const base = {
        type: obj.type === 'textbox' ? 'text' : 'image',
        x_mm: xMm,
        y_mm: yMm,
        width_mm: widthMm,
        height_mm: heightMm,
        rotation_deg: toNum(obj.angle, 0),
        z_index: idx,
      };
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
          textBoxWidthCanvasPx: toNum(obj.width, 100),
        };
      }
      let url = obj.getSrc?.() || obj.src || obj._element?.src || '';
      if (!url) {
        try { url = obj.toDataURL?.({ format: 'png' }) || ''; } catch (_) { /* ignore */ }
      }
      if (url && !url.startsWith('http') && !url.startsWith('data:')) {
        url = `${window.location.origin}${url.startsWith('/') ? '' : '/'}${url}`;
      }
      return { ...base, url: url || '', opacity: toNum(obj.opacity, 1) };
    });
  };

  const addToCart = async () => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    const currentSideObjs = canvas.getObjects().filter((o) => !o.data?.isTshirtBg && !o.data?.isPrintArea);
    const frontStored = JSON.parse(frontDesignRef.current || '[]');
    const backStored = JSON.parse(backDesignRef.current || '[]');
    const frontSerialized = designSide === 'front' ? serializeDesignObjects(canvas) : frontStored;
    const backSerialized = designSide === 'back' ? serializeDesignObjects(canvas) : backStored;

    const hasDesign = currentSideObjs.length > 0 || frontStored.length > 0 || backStored.length > 0;
    if (!hasDesign) {
      setRenderError('Vui lòng thêm ít nhất một phần tử vào thiết kế.');
      return;
    }
    setRenderError(null);
    setCartLoading(true);

    // ── Lấy preview nhanh từ canvas (client-side, không gọi API render) ──
    let previewDataUrl = null;
    try {
      const printOverlay = canvas.getObjects().find((o) => o.data?.isPrintArea);
      if (printOverlay) printOverlay.set('visible', false);
      canvas.renderAll();
      previewDataUrl = canvas.toDataURL({ format: 'png', quality: 0.85, multiplier: 1 });
      if (printOverlay) printOverlay.set('visible', true);
      canvas.renderAll();
    } catch (_) { /* preview không quan trọng, bỏ qua lỗi */ }

    const colorKeywords = activeColor === 'white'
      ? ['trắng', 'trang', 'white']
      : ['đen', 'den', 'black'];
    const matchColor = (v) => {
      const cName = (v.colorName || v.color_name || '').toLowerCase();
      return colorKeywords.some((kw) => cName.includes(kw));
    };
    const matchSize = (v) => (v.size || '').toUpperCase() === selectedSize.toUpperCase();

    let matchedVariant = variants.find((v) => matchColor(v) && matchSize(v))
      || variants.find((v) => matchColor(v))
      || variants.find((v) => matchSize(v))
      || (variants.length > 0 ? variants[0] : null);

    if (!matchedVariant) {
      setRenderError('Sản phẩm chưa có phân loại (variant). Vui lòng liên hệ admin.');
      setCartLoading(false);
      return;
    }
    console.log('Matched variant:', matchedVariant, 'from', variants.length, 'variants');

    const isAuth = isAuthenticated;

    try {
      const productName = product?.name ? `${product.name} - Custom Design` : 'Custom Design';

      if (isAuth) {
        await cartService.addItem(matchedVariant.id, quantity, {
          frontPrintUrl: null,
          backPrintUrl: null,
          customName: productName,
        });
      } else {
        // Anonymous Add to Cart
        guestCartStorage.addItem({
          productVariantId: matchedVariant.id,
          productName: productName,
          price: (product?.basePrice ?? BASE_PRICE),
          quantity: quantity,
          colorName: activeColor,
          size: selectedSize,
          imageUrl: previewDataUrl || tshirtImages[activeColor],
          frontPrintUrl: null,
          backPrintUrl: null,
          availableSizes: SIZES
        });
      }
    } catch (err) {
      console.error('Add to cart failed', err);
      setRenderError(err.response?.data?.message || 'Không thể thêm vào giỏ hàng.');
      setCartLoading(false);
      return;
    }

    const saveDesignToRef = () => {
      const objs = canvas.getObjects().filter((o) => !o.data?.isTshirtBg && !o.data?.isPrintArea);
      return JSON.stringify(objs.map((o) => o.toObject(['data'])));
    };
    if (designSide === 'front') frontDesignRef.current = saveDesignToRef();
    else backDesignRef.current = saveDesignToRef();
    const draft = {
      frontDesign: frontDesignRef.current,
      backDesign: backDesignRef.current,
      designSide,
      activeColor,
      productId: productId || null,
      selectedSize,
      quantity,
    };
    sessionStorage.setItem(POD_DESIGNER_DRAFT, JSON.stringify(draft));
    sessionStorage.setItem('pod_tryon_product_id', productId || '');

    // navigate('/home/cart'); // Removed auto-redirect
    setIsAdded(true);
    setShowToast(true);
    setCartLoading(false);
    setTimeout(() => setIsAdded(false), 2000);
    setTimeout(() => setShowToast(false), 10000);
  };


  const handleSaveDesign = async () => {
    const canvas = fabricRef.current;
    if (!canvas || !saveName.trim()) return;
    const frontStored = JSON.parse(frontDesignRef.current || '[]');
    const backStored = JSON.parse(backDesignRef.current || '[]');
    const currentObjs = canvas.getObjects().filter((o) => !o.data?.isTshirtBg && !o.data?.isPrintArea);
    const frontSerialized = designSide === 'front' ? serializeDesignObjects(canvas) : frontStored;
    const backSerialized = designSide === 'back' ? serializeDesignObjects(canvas) : backStored;
    const hasDesign = currentObjs.length > 0 || frontStored.length > 0 || backStored.length > 0;
    if (!hasDesign) {
      setSaveError('Vui lòng thêm ít nhất một phần tử vào thiết kế trước khi lưu.');
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      const designJsonData = {
        frontDesign: frontSerialized,
        backDesign: backSerialized,
        canvas: { width: CANVAS_WIDTH, height: CANVAS_HEIGHT },
        printArea: { left: PRINT_AREA_LEFT, top: PRINT_AREA_TOP, width: PRINT_AREA_WIDTH, height: PRINT_AREA_HEIGHT },
        garmentColor: activeColor,
        designSide,
        selectedSize,
        quantity,
      };
      const ed = editingDesignRef.current;
      if (ed?.id) {
        await designProductService.update(ed.id, {
          name: saveName.trim(),
          isPublic: saveIsPublic,
          designJsonData,
          garmentImageUrl: tshirtImages[activeColor] || undefined,
        });
      } else {
        await designProductService.create({
          name: saveName.trim(),
          designJsonData,
          garmentImageUrl: tshirtImages[activeColor] || undefined,
          baseProductId: productId ? Number(productId) : null,
          isPublic: saveIsPublic,
        });
      }
      editingDesignRef.current = null;
      setShowSaveModal(false);
      setSaveName('');
      setSaveIsPublic(false);
      setSaveError(null);
      navigate('/home/community-designs', { state: { tab: 'my' } });
    } catch (err) {
      console.error('Save design failed:', err);
      const res = err.response?.data;
      let msg = res?.message || err.message || 'Không thể lưu thiết kế.';
      if (Array.isArray(res?.data) && res.data.length) msg += ' ' + res.data.join(' ');
      setSaveError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleAIReview = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    // Temporarily hide the print area bounds and discard active selection before taking a snapshot
    canvas.discardActiveObject();
    const printOverlay = canvas.getObjects().find((o) => o.data?.isPrintArea);
    if (printOverlay) printOverlay.set('visible', false);
    canvas.renderAll();

    const dataUrl = canvas.toDataURL({
      format: 'png',
      quality: 0.8,
    });

    // Restore print area bounds
    if (printOverlay) printOverlay.set('visible', true);
    canvas.renderAll();

    const event = new CustomEvent('openChatbox', {
      detail: {
        message: 'Bạn hãy nhận xét xem thiết kế này của tôi đã đẹp và hợp lý chưa nhé!',
        image: dataUrl
      }
    });
    window.dispatchEvent(event);
  };

  const updateSelectedProp = (prop, value) => {
    const canvas = fabricRef.current;
    if (!canvas || !selectedObj?.ref) return;
    saveHistoryState(canvas);
    selectedObj.ref.set(prop, value);
    canvas.renderAll();
    syncSelectedProps(selectedObj.ref);
    refreshLayers(canvas);
  };

  const selectLayer = (obj) => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    canvas.setActiveObject(obj);
    canvas.renderAll();
    syncSelectedProps(obj);
  };

  // ─── Zoom (Fabric native để text sắc nét, không dùng CSS scale) ─────

  useEffect(() => {
    if (zoom === 100) setPanOffset((p) => (p.x === 0 && p.y === 0 ? p : { x: 0, y: 0 }));
  }, [zoom]);

  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const z = zoom / 100;
    const w = Math.round(CANVAS_WIDTH * z);
    const h = Math.round(CANVAS_HEIGHT * z);
    canvas.setDimensions({ width: w, height: h });
    canvas.setZoom(z);
    canvas.requestRenderAll();
  }, [zoom, panOffset]);

  const handleCanvasWheel = useCallback((e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -5 : 5;
    setZoom((z) => Math.max(25, Math.min(200, z + delta)));
  }, []);

  const wheelContainerRef = useRef(null);
  useEffect(() => {
    const el = wheelContainerRef.current;
    if (!el) return;
    el.addEventListener('wheel', handleCanvasWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleCanvasWheel);
  }, [handleCanvasWheel]);

  const handlePanStart = useCallback((e) => {
    if (zoom <= 100) return;
    if (e.button !== 0) return;
    const canvas = fabricRef.current;
    const designObjs = canvas?.getObjects?.()?.filter((o) => !o.data?.isTshirtBg && !o.data?.isPrintArea) ?? [];
    if (designObjs.length === 0) {
      isPanningRef.current = true;
      panStartRef.current = { x: e.clientX - panOffset.x, y: e.clientY - panOffset.y };
      return;
    }
    let clickedOnDesignLayer = false;
    try {
      const ptr = canvas.getScenePoint?.(e.nativeEvent) ?? canvas.getPointer?.(e.nativeEvent);
      if (ptr) {
        designObjs.forEach((obj) => {
          obj.setCoords?.();
          if (obj.containsPoint?.(ptr)) clickedOnDesignLayer = true;
        });
        if (!clickedOnDesignLayer) {
          const active = canvas.getActiveObject?.();
          if (active && !active.data?.isTshirtBg && !active.data?.isPrintArea) {
            const coords = active.getCoords?.();
            if (coords && coords.length >= 2) {
              const pad = 50;
              const xs = coords.map((c) => c.x);
              const ys = coords.map((c) => c.y);
              const minX = Math.min(...xs) - pad;
              const maxX = Math.max(...xs) + pad;
              const minY = Math.min(...ys) - pad;
              const maxY = Math.max(...ys) + pad;
              if (ptr.x >= minX && ptr.x <= maxX && ptr.y >= minY && ptr.y <= maxY) {
                clickedOnDesignLayer = true;
              }
            }
          }
        }
      }
    } catch (_) { }
    if (clickedOnDesignLayer) return;
    isPanningRef.current = true;
    panStartRef.current = { x: e.clientX - panOffset.x, y: e.clientY - panOffset.y };
  }, [panOffset, zoom]);

  const handlePanMove = useCallback((e) => {
    if (!isPanningRef.current) return;
    setPanOffset({ x: e.clientX - panStartRef.current.x, y: e.clientY - panStartRef.current.y });
  }, []);

  const handlePanEnd = useCallback(() => {
    isPanningRef.current = false;
  }, []);

  // ─── Sidebar tool definitions ─────────────────────────────────────

  const sidebarTools = [
    { id: 'uploads', icon: 'upload', label: 'Uploads' },
    { id: 'stickers', icon: 'category', label: 'Graphics' },
    { id: 'text', icon: 'title', label: 'Text' },
  ];

  // ─── Render ───────────────────────────────────────────────────────

  const handleTryOn = async () => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    setIsTryingOn(true);
    try {
      // 1. Save current state to draft
      const saveDesignToRef = () => {
        const objs = canvas.getObjects().filter((o) => !o.data?.isTshirtBg && !o.data?.isPrintArea);
        return JSON.stringify(objs.map((o) => o.toObject(['data'])));
      };
      if (designSide === 'front') frontDesignRef.current = saveDesignToRef();
      else backDesignRef.current = saveDesignToRef();

      const draft = {
        frontDesign: frontDesignRef.current,
        backDesign: backDesignRef.current,
        designSide,
        activeColor,
        productId: productId || null,
        selectedSize,
        quantity,
      };
      sessionStorage.setItem(POD_DESIGNER_DRAFT, JSON.stringify(draft));
      sessionStorage.setItem('pod_tryon_product_id', productId || '');

      // 2. Capture canvas
      const printOverlay = canvas.getObjects().find((o) => o.data?.isPrintArea);
      if (printOverlay) printOverlay.set('visible', false);
      canvas.renderAll();

      const dataUrl = canvas.toDataURL({
        format: 'png',
        quality: 1,
        multiplier: 2,
      });

      if (printOverlay) printOverlay.set('visible', true);
      canvas.renderAll();

      localStorage.setItem('pod_tryon_design', dataUrl);
      navigate('/home/virtual-try-on', { state: { fromDesigner: true, productId: productId || null } });
    } catch (err) {
      console.error('Failed to capture design for Try-On:', err);
      localStorage.setItem('pod_tryon_design', product?.imageUrl || TSHIRT_IMAGES_FALLBACK[activeColor]);
      navigate('/home/virtual-try-on');
    } finally {
      setIsTryingOn(false);
    }
  };

  if (productLoading) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-background-light">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        <p className="mt-4 text-slate-500 text-sm font-medium">Đang tải sản phẩm...</p>
      </div>
    );
  }

  if (productError && productId) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-background-light gap-4">
        <span className="material-symbols-outlined text-4xl text-red-400">error</span>
        <p className="text-red-500 font-medium">{productError}</p>
        <button onClick={() => navigate(-1)} className="px-4 py-2 bg-slate-100 rounded-lg text-sm font-bold hover:bg-slate-200 transition-colors">
          Quay lại
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background-light font-display text-slate-900">
      {/* ── Cart Loading Overlay ─────────────────────────────────── */}
      {cartLoading && (
        <div
          id="cart-loading-overlay"
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm"
          style={{ pointerEvents: 'all' }}
        >
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 flex flex-col items-center gap-4 shadow-2xl max-w-xs w-full mx-4">
            <div className="size-14 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            <div className="text-center">
              <h3 className="text-white font-bold text-base">Đang xử lý thiết kế...</h3>
              <p className="text-slate-400 text-xs mt-1">Vui lòng đợi, đang render ảnh in</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Header ─────────────────────────────────────────────── */}
      <Header />


      {/* ── Main Body ──────────────────────────────────────────── */}
      <main className="flex flex-1 overflow-hidden">
        {/* ── Left: Icon Sidebar ──────────────────────────────── */}
        <aside className="w-16 flex flex-col items-center py-4 gap-4 border-r border-slate-200 bg-white shrink-0">
          {sidebarTools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => setActiveTool(tool.id)}
              className={`p-3 rounded-xl transition-colors ${activeTool === tool.id ? 'bg-primary/10 text-primary' : 'hover:bg-slate-100 text-slate-500'
                }`}
              title={tool.label}
            >
              <span className="material-symbols-outlined">{tool.icon}</span>
            </button>
          ))}
          <div className="mt-auto">
            <button className="p-3 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors" title="Settings">
              <span className="material-symbols-outlined">settings</span>
            </button>
          </div>
        </aside>

        {/* ── Left: Tool Drawer ───────────────────────────────── */}
        <aside className="w-72 bg-slate-50 border-r border-slate-200 flex flex-col shrink-0">
          {activeTool === 'uploads' && (
            <>
              <div className="p-4 border-b border-slate-200">
                <h3 className="font-bold text-sm">My Uploads</h3>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Drop Zone */}
                <div
                  className="border-2 border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center gap-3 hover:border-primary hover:bg-primary/5 transition-all cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                  onDrop={handleDrop}
                  onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                >
                  <div className="size-12 rounded-full bg-slate-100 flex items-center justify-center">
                    <span className="material-symbols-outlined text-2xl text-slate-400">cloud_upload</span>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-bold text-slate-600">Click or drag files here</p>
                    <p className="text-[10px] text-slate-400 mt-1">PNG, JPG, SVG, WebP</p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    multiple
                    className="hidden"
                    onChange={(e) => { handleFileUpload(e.target.files); e.target.value = ''; }}
                  />
                </div>

                {/* Uploaded Images Grid */}
                {uploadedImages.length > 0 && (
                  <div className="grid grid-cols-2 gap-3">
                    {uploadedImages.map((img) => (
                      <div key={img.id} className={`group relative aspect-square bg-white rounded-lg border border-slate-200 p-2 transition-all ${img.src ? 'hover:border-primary cursor-pointer' : 'cursor-wait'}`}>
                        {img.uploading || !img.src ? (
                          <div className="w-full h-full flex flex-col items-center justify-center gap-1 text-slate-400">
                            <span className="material-symbols-outlined animate-spin">progress_activity</span>
                            <span className="text-[10px]">Đang tải lên...</span>
                          </div>
                        ) : (
                          <img
                            src={img.src}
                            alt={img.name}
                            className="w-full h-full object-contain"
                            draggable={false}
                            onClick={() => addImageToCanvas(img.src, img.name)}
                          />
                        )}
                        <button
                          onClick={(e) => { e.stopPropagation(); removeUploadedImage(img.id); }}
                          className="absolute -top-1.5 -right-1.5 size-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                        >
                          <span className="material-symbols-outlined text-[12px]">close</span>
                        </button>
                        <span className="absolute bottom-1 left-1 right-1 text-[9px] font-bold text-slate-500 truncate text-center bg-white/80 rounded px-1">{img.name}</span>
                      </div>
                    ))}
                  </div>
                )}

                {uploadedImages.length === 0 && (
                  <p className="text-xs text-slate-400 italic text-center">No uploads yet</p>
                )}
              </div>
            </>
          )}

          {activeTool === 'stickers' && (
            <>
              <div className="p-4 border-b border-slate-200 flex justify-between items-center">
                <h3 className="font-bold text-sm">Graphics Library</h3>
                <span className="material-symbols-outlined text-sm cursor-pointer">search</span>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <div className="grid grid-cols-2 gap-3">
                  {allStickers.map((sticker) => (
                    <button
                      key={sticker.id}
                      onClick={() => addSticker(sticker)}
                      className="group relative aspect-square bg-white rounded-lg border border-slate-200 p-3 hover:border-primary transition-all cursor-pointer flex flex-col items-center justify-center gap-2"
                    >
                      <img
                        src={sticker.src ?? sticker.link}
                        alt={sticker.label ?? `Sticker #${sticker.id}`}
                        className="w-full h-3/4 object-contain transition-transform group-hover:scale-110"
                        draggable={false}
                      />
                      <span className="text-[10px] font-bold text-slate-500 group-hover:text-primary">{sticker.label ?? `Sticker #${sticker.id}`}</span>
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setActiveTool('uploads')}
                  className="w-full mt-6 py-2 border-2 border-dashed border-slate-300 rounded-lg text-xs font-medium text-slate-500 hover:text-primary hover:border-primary transition-all"
                >
                  + Upload Custom Image
                </button>
              </div>
            </>
          )}

          {activeTool === 'text' && (
            <>
              <div className="p-4 border-b border-slate-200">
                <h3 className="font-bold text-sm">Text Tool</h3>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Text Content</label>
                  <input
                    type="text"
                    value={textValue}
                    onChange={(e) => setTextValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addText()}
                    placeholder="Enter your text..."
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Font Family</label>
                  <select
                    value={newFontFamily}
                    onChange={(e) => setNewFontFamily(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
                  >
                    <option value="Manrope, sans-serif">Manrope</option>
                    <option value="Arial, sans-serif">Arial</option>
                    <option value="Georgia, serif">Georgia</option>
                    <option value="Courier New, monospace">Courier New</option>
                    <option value="Times New Roman, serif">Times New Roman</option>
                    <option value="Verdana, sans-serif">Verdana</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Font Size</label>
                    <input
                      type="number"
                      min="8"
                      max="200"
                      value={newFontSize}
                      onChange={(e) => setNewFontSize(Number(e.target.value))}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={newTextColor}
                        onChange={(e) => setNewTextColor(e.target.value)}
                        className="size-9 rounded-lg border border-slate-200 cursor-pointer p-0.5"
                      />
                      <span className="text-[10px] font-mono text-slate-400">{newTextColor}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setNewFontWeight((v) => (v === 'bold' ? 'normal' : 'bold'))}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg border text-sm font-bold transition-colors ${newFontWeight === 'bold' ? 'bg-primary text-[#11221c] border-primary' : 'bg-white border-slate-200 text-slate-600 hover:border-primary'}`}
                  >
                    <span className="material-symbols-outlined text-lg">format_bold</span>
                    Đậm
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewFontStyle((v) => (v === 'italic' ? 'normal' : 'italic'))}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg border text-sm font-bold transition-colors ${newFontStyle === 'italic' ? 'bg-primary text-[#11221c] border-primary' : 'bg-white border-slate-200 text-slate-600 hover:border-primary'}`}
                  >
                    <span className="material-symbols-outlined text-lg">format_italic</span>
                    Nghiêng
                  </button>
                </div>

                <button
                  id="add-text-button"
                  onClick={addText}
                  disabled={!textValue.trim()}
                  className="w-full flex items-center justify-center gap-2 h-10 bg-primary text-[#11221c] rounded-lg font-bold text-sm hover:brightness-110 transition-all shadow-lg shadow-primary/20 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
                >
                  <span className="material-symbols-outlined text-base">add</span>
                  Add Text
                </button>

                {/* Preview */}
                <div className="rounded-lg bg-white border border-slate-200 p-4 flex items-center justify-center min-h-[60px]">
                  <span
                    style={{
                      fontFamily: newFontFamily,
                      fontSize: `${Math.min(newFontSize, 32)}px`,
                      fontWeight: newFontWeight,
                      fontStyle: newFontStyle,
                      color: newTextColor,
                    }}
                    className="truncate max-w-full"
                  >
                    {textValue || 'Preview'}
                  </span>
                </div>
              </div>
            </>
          )}
        </aside>

        {/* ── Center: Canvas ──────────────────────────────────── */}
        <section className="flex-1 relative flex flex-col items-center justify-center overflow-hidden bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-[length:20px_20px]">
          {/* Front/Back Toggle */}
          <div className="absolute top-6 left-6 flex gap-4 z-10">
            <button
              onClick={() => navigate(-1)}
              className="size-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-primary hover:border-primary transition-all shadow-sm"
              title="Quay lại"
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <div className="flex bg-white rounded-xl border border-slate-200 p-1 shadow-sm">
              <button
                onClick={() => switchDesignSide('front')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${designSide === 'front' ? 'bg-primary text-[#11221c]' : 'text-slate-500 hover:text-primary'}`}
              >
                Mặt trước
              </button>
              <button
                onClick={() => switchDesignSide('back')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${designSide === 'back' ? 'bg-primary text-[#11221c]' : 'text-slate-500 hover:text-primary'}`}
              >
                Mặt sau
              </button>
            </div>
          </div>

          {/* Contextual Toolbar */}
          <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-white shadow-2xl rounded-xl border border-slate-200 flex items-center p-1 z-10">
            <button onClick={undo} disabled={!canUndo} className="p-2 hover:bg-slate-100 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed" title="Undo (Ctrl+Z)">
              <span className="material-symbols-outlined text-xl">undo</span>
            </button>
            <button onClick={redo} disabled={!canRedo} className="p-2 hover:bg-slate-100 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed" title="Redo (Ctrl+Y)">
              <span className="material-symbols-outlined text-xl">redo</span>
            </button>
            <div className="w-px h-6 bg-slate-200 mx-1"></div>
            <button onClick={duplicateSelected} className="p-2 hover:bg-slate-100 rounded-lg" title="Duplicate">
              <span className="material-symbols-outlined text-xl">content_copy</span>
            </button>
            <button onClick={deleteSelected} className="p-2 hover:bg-slate-100 rounded-lg text-red-500" title="Delete">
              <span className="material-symbols-outlined text-xl">delete</span>
            </button>
            <div className="w-px h-6 bg-slate-200 mx-1"></div>
            <button onClick={bringToFront} className="p-2 hover:bg-slate-100 rounded-lg" title="Bring to Front">
              <span className="material-symbols-outlined text-xl">flip_to_front</span>
            </button>
            <button onClick={sendToBack} className="p-2 hover:bg-slate-100 rounded-lg" title="Send to Back">
              <span className="material-symbols-outlined text-xl">flip_to_back</span>
            </button>
          </div>

          {/* Canvas Viewport (pan + zoom) */}
          <div
            ref={wheelContainerRef}
            className="absolute inset-0 flex items-center justify-center overflow-hidden"
            style={{ cursor: zoom > 100 ? (isPanningRef.current ? 'grabbing' : 'grab') : 'default' }}
            onMouseDown={handlePanStart}
            onMouseMove={handlePanMove}
            onMouseUp={handlePanEnd}
            onMouseLeave={handlePanEnd}
          >
            <div
              className="rounded-xl shadow-2xl border border-slate-200 overflow-hidden"
              style={{
                width: Math.round(CANVAS_WIDTH * zoom / 100),
                height: Math.round(CANVAS_HEIGHT * zoom / 100),
                transform: `translate(${panOffset.x}px, ${panOffset.y}px)`,
                willChange: 'transform',
                backgroundImage: 'linear-gradient(45deg, #e5e7eb 25%, transparent 25%), linear-gradient(-45deg, #e5e7eb 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e5e7eb 75%), linear-gradient(-45deg, transparent 75%, #e5e7eb 75%)',
                backgroundSize: '20px 20px',
                backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
              }}
            >
              <canvas ref={canvasRef} />
            </div>
          </div>

          {/* Zoom Controls */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-white px-4 py-2 rounded-full border border-slate-200 shadow-lg z-10">
            <button className="material-symbols-outlined text-sm cursor-pointer" onClick={() => setZoom((z) => Math.max(25, z - 10))}>remove</button>
            <span className="text-xs font-bold w-10 text-center">{zoom}%</span>
            <button className="material-symbols-outlined text-sm cursor-pointer" onClick={() => setZoom((z) => Math.min(200, z + 10))}>add</button>
            {zoom !== 100 && (
              <button className="text-[10px] font-bold text-slate-400 hover:text-primary cursor-pointer" onClick={() => { setZoom(100); setPanOffset({ x: 0, y: 0 }); }}>Reset</button>
            )}
          </div>
        </section>

        {/* ── Right: Properties Panel ─────────────────────────── */}
        <aside className="w-80 bg-white border-l border-slate-200 flex flex-col shrink-0">
          <div className="flex-1 overflow-y-auto">
            {/* Transform */}
            <div className="p-4 border-b border-slate-200">
              <h3 className="font-bold text-sm mb-4">Transform</h3>
              {selectedObj ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-500 uppercase font-bold">X Position</label>
                      <input className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-sm" type="text" readOnly value={`${selectedObj.left}px`} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-500 uppercase font-bold">Y Position</label>
                      <input className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-sm" type="text" readOnly value={`${selectedObj.top}px`} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-500 uppercase font-bold">Width</label>
                      <input className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-sm" type="text" readOnly value={`${selectedObj.width}px`} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-500 uppercase font-bold">Height</label>
                      <input className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-sm" type="text" readOnly value={`${selectedObj.height}px`} />
                    </div>
                  </div>
                  <div className="mt-4 flex justify-between items-center">
                    <label className="text-[10px] text-slate-500 uppercase font-bold">Rotation</label>
                    <span className="text-xs font-medium">{selectedObj.angle}°</span>
                  </div>
                  <div className="mt-2 flex justify-between items-center">
                    <label className="text-[10px] text-slate-500 uppercase font-bold">Scale</label>
                    <span className="text-xs font-medium">{Math.round(selectedObj.scaleX * 100)}%</span>
                  </div>
                </>
              ) : (
                <p className="text-xs text-slate-400 italic">Select an object to see its properties</p>
              )}
            </div>

            {/* Text Properties */}
            {selectedObj?.type === 'textbox' && (
              <div className="p-4 border-b border-slate-200">
                <h3 className="font-bold text-sm mb-4">Text Properties</h3>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 uppercase font-bold">Content</label>
                    <input
                      type="text"
                      value={selectedObj.text}
                      onChange={(e) => updateSelectedProp('text', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-500 uppercase font-bold">Font Size</label>
                      <input
                        type="number"
                        min="8"
                        max="200"
                        value={selectedObj.fontSize}
                        onChange={(e) => updateSelectedProp('fontSize', Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-500 uppercase font-bold">Color</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={selectedObj.fill}
                          onChange={(e) => updateSelectedProp('fill', e.target.value)}
                          className="size-8 rounded border border-slate-200 cursor-pointer p-0.5"
                        />
                        <span className="text-[10px] font-mono text-slate-400">{selectedObj.fill}</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 uppercase font-bold">Font Family</label>
                    <select
                      value={selectedObj.fontFamily}
                      onChange={(e) => updateSelectedProp('fontFamily', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
                    >
                      <option value="Manrope, sans-serif">Manrope</option>
                      <option value="Arial, sans-serif">Arial</option>
                      <option value="Georgia, serif">Georgia</option>
                      <option value="Courier New, monospace">Courier New</option>
                      <option value="Times New Roman, serif">Times New Roman</option>
                      <option value="Verdana, sans-serif">Verdana</option>
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => updateSelectedProp('fontWeight', (selectedObj.fontWeight || 'normal') === 'bold' ? 'normal' : 'bold')}
                      className={`flex-1 flex items-center justify-center gap-1 py-2 rounded border text-sm font-bold transition-colors ${(selectedObj.fontWeight || 'normal') === 'bold' ? 'bg-primary text-[#11221c] border-primary' : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-primary'}`}
                    >
                      <span className="material-symbols-outlined text-base">format_bold</span>
                      Đậm
                    </button>
                    <button
                      type="button"
                      onClick={() => updateSelectedProp('fontStyle', (selectedObj.fontStyle || 'normal') === 'italic' ? 'normal' : 'italic')}
                      className={`flex-1 flex items-center justify-center gap-1 py-2 rounded border text-sm font-bold transition-colors ${(selectedObj.fontStyle || 'normal') === 'italic' ? 'bg-primary text-[#11221c] border-primary' : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-primary'}`}
                    >
                      <span className="material-symbols-outlined text-base">format_italic</span>
                      Nghiêng
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 italic">Double-click text on canvas to edit inline</p>
                </div>
              </div>
            )}

            {/* Layers */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-sm">Layers</h3>
                <span className="material-symbols-outlined text-sm">layers</span>
              </div>
              {layers.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No objects on canvas</p>
              ) : (
                <div className="space-y-2">
                  {layers.map((layer) => {
                    const isActive = fabricRef.current?.getActiveObject() === layer.obj;
                    return (
                      <button
                        key={layer.id}
                        onClick={() => selectLayer(layer.obj)}
                        className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors text-left ${isActive ? 'bg-primary/10 border border-primary/30' : 'hover:bg-slate-50 border border-transparent'
                          }`}
                      >
                        <span className="material-symbols-outlined text-sm text-slate-400">drag_indicator</span>
                        <div className="size-8 bg-slate-100 rounded flex items-center justify-center">
                          <span className="material-symbols-outlined text-sm">
                            {layer.type === 'textbox' ? 'title' : 'image'}
                          </span>
                        </div>
                        <span className={`text-xs flex-1 truncate ${isActive ? 'font-bold' : 'font-medium'}`}>
                          {layer.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Size & Quantity */}
          <div className="p-4 border-t border-slate-200">
            <p className="text-[10px] text-slate-500 uppercase font-bold mb-3 tracking-wider">Size</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {SIZES.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`min-w-[36px] py-2 px-3 rounded-lg text-sm font-bold transition-colors ${selectedSize === size ? 'bg-primary text-[#11221c]' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  {size}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-slate-500 uppercase font-bold mb-2 tracking-wider">Quantity</p>
            <div className="flex items-center gap-2 mb-4">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="size-8 flex items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 font-bold"
              >
                −
              </button>
              <input
                type="number"
                min="1"
                max="99"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Math.min(99, Number(e.target.value) || 1)))}
                className="w-14 text-center py-2 border border-slate-200 rounded-lg text-sm font-bold focus:outline-none focus:border-primary"
              />
              <button
                onClick={() => setQuantity((q) => Math.min(99, q + 1))}
                className="size-8 flex items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 font-bold"
              >
                +
              </button>
            </div>
            <div className="flex flex-col gap-4 mt-4 pt-4 border-t border-slate-200">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-slate-500">Tổng cộng:</span>
                <span className="text-lg font-black text-primary">
                  {((product?.basePrice ?? BASE_PRICE) * quantity).toLocaleString('vi-VN')} đ
                </span>
              </div>

              <button
                id="add-to-cart-designer-button"
                onClick={addToCart}
                disabled={isAdded || cartLoading}
                className={`w-full flex items-center justify-center gap-3 h-12 rounded-xl text-sm font-bold transition-all duration-300 ${isAdded
                  ? 'bg-slate-100 text-slate-400 cursor-default'
                  : 'bg-primary text-[#11221c] shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed'
                  }`}
              >
                {cartLoading ? (
                  <div className="size-5 border-2 border-[#11221c]/30 border-t-[#11221c] rounded-full animate-spin" />
                ) : (
                  <span className="material-symbols-outlined text-xl">
                    {isAdded ? 'check_circle' : 'shopping_cart'}
                  </span>
                )}
                <span>{cartLoading ? 'Đang thêm...' : isAdded ? 'Đã thêm vào giỏ' : 'Thêm vào giỏ hàng'}</span>
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const ed = editingDesignRef.current;
                    if (ed) {
                      setSaveName(ed.name || '');
                      setSaveIsPublic(ed.isPublic ?? false);
                    } else {
                      setSaveName('');
                      setSaveIsPublic(false);
                    }
                    setSaveError(null);
                    setShowSaveModal(true);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 h-10 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all text-xs font-bold"
                >
                  <span className="material-symbols-outlined text-lg">save</span>
                  <span>Lưu thiết kế</span>
                </button>
                <button
                  onClick={() => setShowResetModal(true)}
                  className="flex items-center justify-center aspect-square h-10 rounded-lg border border-slate-200 text-slate-400 hover:text-red-500 hover:bg-red-50 hover:border-red-100 transition-all"
                  title="Reset thiết kế"
                >
                  <span className="material-symbols-outlined text-lg">restart_alt</span>
                </button>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={handleTryOn}
                  disabled={isTryingOn}
                  className="w-full flex items-center justify-center gap-2 h-10 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all text-xs font-bold"
                >
                  <span className="material-symbols-outlined text-lg">{isTryingOn ? 'sync' : 'shirt'}</span>
                  <span>{isTryingOn ? 'Đang chuẩn bị...' : 'Thử ngay (3D Try On)'}</span>
                </button>

                <button
                  onClick={handleAIReview}
                  className="w-full flex items-center justify-center gap-2 py-2 text-[11px] font-bold text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">auto_awesome</span>
                  <span>Ask AI Review</span>
                </button>
              </div>
            </div>
          </div>
        </aside>
      </main>

      {/* ── Save Design Modal ──────────────────────────────────── */}
      {showSaveModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50" onClick={() => !saving && setShowSaveModal(false)}>
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-slate-900 mb-4">{editingDesignRef.current?.id ? 'Cập nhật thiết kế' : 'Lưu thiết kế'}</h3>
            <input
              type="text"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              placeholder="Tên thiết kế"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-primary mb-4"
            />
            <label className="flex items-center gap-2 mb-4 cursor-pointer">
              <input type="checkbox" checked={saveIsPublic} onChange={(e) => setSaveIsPublic(e.target.checked)} className="rounded" />
              <span className="text-sm font-medium text-slate-700">Chia sẻ với cộng đồng (công khai)</span>
            </label>
            {saveError && <p className="text-red-500 text-sm mb-4">{saveError}</p>}
            <div className="flex gap-2 justify-end">
              <button onClick={() => !saving && setShowSaveModal(false)} className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold hover:bg-slate-50">Hủy</button>
              <button onClick={handleSaveDesign} disabled={saving || !saveName.trim()} className="px-4 py-2 bg-primary text-[#11221c] rounded-lg text-sm font-bold hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed">
                {saving ? 'Đang lưu...' : 'Lưu'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Reset Confirmation Modal ────────────────────────────── */}
      {showResetModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50" onClick={() => setShowResetModal(false)}>
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full mx-4 text-center" onClick={(e) => e.stopPropagation()}>
            <div className="size-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-3xl">restart_alt</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Reset thiết kế?</h3>
            <p className="text-sm text-slate-500 mb-6">Bạn có chắc chắn muốn xóa toàn bộ thiết kế hiện tại không? Hành động này không thể hoàn tác.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowResetModal(false)}
                className="flex-1 py-2.5 border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  clearCanvas();
                  setShowResetModal(false);
                }}
                className="flex-1 py-2.5 bg-red-500 text-white rounded-lg text-sm font-bold hover:bg-red-600 transition-colors shadow-lg shadow-red-200"
              >
                Reset ngay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast Notification ─────────────────────────────────── */}
      <div className={`fixed bottom-8 right-8 z-50 transition-all duration-500 transform ${showToast ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}`}>
        <div className="bg-slate-900 border border-slate-700 text-white p-4 rounded-xl shadow-[0_20px_40px_rgba(0,0,0,0.3)] flex items-center gap-4 min-w-[320px]">
          <div className="size-10 bg-primary/20 text-primary rounded-full flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[24px]">check_circle</span>
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-white text-sm">Added to Cart</h4>
            <p className="text-xs text-slate-400 mt-0.5">Custom design added — view cart to checkout</p>
          </div>
          <button
            id="view-cart-toast-button"
            onClick={() => navigate('/home/cart')}
            className="px-4 py-2 bg-primary text-[#11221c] text-sm font-bold rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
          >
            View Cart
          </button>
          <button onClick={() => setShowToast(false)} className="text-slate-500 hover:text-white transition-colors absolute top-2 right-2">
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DesignerPage;
