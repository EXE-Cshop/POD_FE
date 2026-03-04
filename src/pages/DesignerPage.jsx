import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import * as fabric from 'fabric';

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 800;
const TSHIRT_IMAGES = {
  white: 'https://res.cloudinary.com/di5j3h6wi/image/upload/v1772531029/eb27d4f3c94b0c054236bc357a1d5d16_bkthgf.webp',
  black: 'https://res.cloudinary.com/di5j3h6wi/image/upload/v1772531007/75a7660e97a621ac51a909c3fa46103f_g3whtg.webp',
};
const PRINT_AREA_WIDTH = 700;
const PRINT_AREA_HEIGHT = 600;

const PRINT_AREA_LEFT = (CANVAS_WIDTH - PRINT_AREA_WIDTH) / 2;
const PRINT_AREA_TOP = (CANVAS_HEIGHT - PRINT_AREA_HEIGHT) / 2;
const PRINT_AREA_RIGHT = PRINT_AREA_LEFT + PRINT_AREA_WIDTH;
const PRINT_AREA_BOTTOM = PRINT_AREA_TOP + PRINT_AREA_HEIGHT;

const STICKERS = [
  { id: 1, label: 'Star',  src: '/assets/stickers/star.svg'  },
  { id: 2, label: 'Heart', src: '/assets/stickers/heart.svg' },
  { id: 3, label: 'Bolt',  src: '/assets/stickers/bolt.svg'  },
];

const DesignerPage = () => {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const fabricRef = useRef(null);

  const [activeTool, setActiveTool] = useState('stickers');
  const [textValue, setTextValue] = useState('');
  const [newFontFamily, setNewFontFamily] = useState('Manrope, sans-serif');
  const [newFontSize, setNewFontSize] = useState(24);
  const [newTextColor, setNewTextColor] = useState('#000000');
  const [zoom, setZoom] = useState(100);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const isPanningRef = useRef(false);
  const panStartRef = useRef({ x: 0, y: 0 });
  const deleteSelectedRef = useRef(null);
  const [uploadedImages, setUploadedImages] = useState([]);
  const fileInputRef = useRef(null);
  const [selectedObj, setSelectedObj] = useState(null);
  const [layers, setLayers] = useState([]);
  const [isAdded, setIsAdded] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [activeColor, setActiveColor] = useState('white');

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
    }
    setSelectedObj(props);
  }, []);

  // ─── Fabric canvas helpers ────────────────────────────────────────

  const addPrintAreaOverlay = (canvas) => {
    const rect = new fabric.Rect({
      width: PRINT_AREA_WIDTH,
      height: PRINT_AREA_HEIGHT,
      left: CANVAS_WIDTH / 2,
      top: CANVAS_HEIGHT / 2,
      originX: 'center',
      originY: 'center',
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

  const addTshirtBackground = (canvas, url = TSHIRT_IMAGES.white) => {
    fabric.FabricImage.fromURL(url, { crossOrigin: 'anonymous' }).then((img) => {
      if (!fabricRef.current) return;
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
  };

  const switchTshirtBg = (colorKey) => {
    const canvas = fabricRef.current;
    if (!canvas || colorKey === activeColor) return;
    const oldBg = canvas.getObjects().find((o) => o.data?.isTshirtBg);
    if (oldBg) canvas.remove(oldBg);
    const oldOverlay = canvas.getObjects().find((o) => o.data?.isPrintArea);
    if (oldOverlay) canvas.remove(oldOverlay);
    setActiveColor(colorKey);
    addTshirtBackground(canvas, TSHIRT_IMAGES[colorKey]);
  };

  // ─── Canvas init ──────────────────────────────────────────────────

  useEffect(() => {
    const canvas = new fabric.Canvas(canvasRef.current, {
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

    canvas.on('object:moving', (e) => {
      const obj = e.target;
      if (obj.data?.isTshirtBg || obj.data?.isPrintArea) return;

      const center = obj.getCenterPoint();
      const clampedX = Math.max(PRINT_AREA_LEFT, Math.min(PRINT_AREA_RIGHT, center.x));
      const clampedY = Math.max(PRINT_AREA_TOP, Math.min(PRINT_AREA_BOTTOM, center.y));

      if (clampedX !== center.x || clampedY !== center.y) {
        obj.setPositionByOrigin(
          new fabric.Point(clampedX, clampedY),
          'center',
          'center',
        );
      }
      obj.setCoords();
    });

    canvas.on('object:modified', (e) => {
      syncSelectedProps(e.target);
      refreshLayers(canvas);
    });
    canvas.on('selection:created', (e) => syncSelectedProps(e.selected?.[0]));
    canvas.on('selection:updated', (e) => syncSelectedProps(e.selected?.[0]));
    canvas.on('selection:cleared', () => setSelectedObj(null));
    canvas.on('text:changed', (e) => {
      syncSelectedProps(e.target);
      refreshLayers(canvas);
    });

    fabricRef.current = canvas;
    addTshirtBackground(canvas);

    const handleKeyDown = (e) => {
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
      document.removeEventListener('keydown', handleKeyDown);
      canvas.dispose();
      fabricRef.current = null;
    };
  }, []);

  // ─── Actions ──────────────────────────────────────────────────────

  const addSticker = (sticker) => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    fabric.FabricImage.fromURL(sticker.src).then((img) => {
      if (!fabricRef.current) return;
      const maxSize = 100;
      const scale = Math.min(maxSize / img.width, maxSize / img.height);
      img.set({
        scaleX: scale, scaleY: scale,
        left: CANVAS_WIDTH / 2, top: CANVAS_HEIGHT / 2,
        originX: 'center', originY: 'center',
        selectable: true, hasControls: true, hasBorders: true,
        data: { stickerLabel: sticker.label },
      });
      canvas.add(img);
      canvas.setActiveObject(img);
      canvas.renderAll();
      refreshLayers(canvas);
    });
  };

  const addText = () => {
    const canvas = fabricRef.current;
    if (!canvas || !textValue.trim()) return;
    const textbox = new fabric.Textbox(textValue, {
      left: CANVAS_WIDTH / 2, top: CANVAS_HEIGHT / 2,
      originX: 'center', originY: 'center',
      width: PRINT_AREA_WIDTH * 0.8,
      fontSize: newFontSize,
      fontFamily: newFontFamily,
      fill: newTextColor,
      textAlign: 'center',
      editable: true,
      selectable: true, hasControls: true, hasBorders: true,
    });
    canvas.add(textbox);
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
      canvas.setActiveObject(img);
      canvas.renderAll();
      refreshLayers(canvas);
    });
  };

  const handleFileUpload = (files) => {
    const validTypes = ['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp'];
    Array.from(files).forEach((file) => {
      if (!validTypes.includes(file.type)) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target.result;
        const entry = {
          id: Date.now() + '_' + Math.random().toString(36).slice(2, 6),
          name: file.name.replace(/\.[^.]+$/, ''),
          src: dataUrl,
        };
        setUploadedImages((prev) => [entry, ...prev]);
      };
      reader.readAsDataURL(file);
    });
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
    canvas.bringObjectToFront(active);
    enforceLayering(canvas);
    refreshLayers(canvas);
  };

  const sendToBack = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (!active || active.data?.isTshirtBg || active.data?.isPrintArea) return;
    canvas.sendObjectToBack(active);
    enforceLayering(canvas);
    refreshLayers(canvas);
  };

  const clearCanvas = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    canvas.clear();
    canvas.backgroundColor = 'transparent';
    addTshirtBackground(canvas, TSHIRT_IMAGES[activeColor]);
    setSelectedObj(null);
  };

  const exportDesign = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const designObjects = canvas.getObjects().filter((obj) => !obj.data?.isTshirtBg && !obj.data?.isPrintArea);
    const objects = designObjects.map((obj) => {
      const base = {
        type: obj.type,
        left: Math.round(obj.left), top: Math.round(obj.top),
        scaleX: parseFloat(obj.scaleX.toFixed(4)), scaleY: parseFloat(obj.scaleY.toFixed(4)),
        angle: Math.round(obj.angle),
        originX: obj.originX, originY: obj.originY,
      };
      if (obj.type === 'textbox') {
        return { ...base, text: obj.text, fontSize: obj.fontSize, fontFamily: obj.fontFamily, fill: obj.fill, textAlign: obj.textAlign, width: Math.round(obj.width) };
      }
      if (obj.type === 'image' && obj.getSrc) {
        return { ...base, src: obj.getSrc() };
      }
      return base;
    });
    const payload = {
      canvas: { width: CANVAS_WIDTH, height: CANVAS_HEIGHT },
      printArea: { left: PRINT_AREA_LEFT, top: PRINT_AREA_TOP, width: PRINT_AREA_WIDTH, height: PRINT_AREA_HEIGHT },
      objects,
      exportedAt: new Date().toISOString(),
    };
    console.log('[ExportDesign]', JSON.stringify(payload, null, 2));

    setIsAdded(true);
    setShowToast(true);
    setTimeout(() => setIsAdded(false), 2000);
    setTimeout(() => setShowToast(false), 4000);
  };

  const updateSelectedProp = (prop, value) => {
    const canvas = fabricRef.current;
    if (!canvas || !selectedObj?.ref) return;
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

  // ─── Zoom ─────────────────────────────────────────────────────────

  useEffect(() => {
    if (zoom === 100) setPanOffset({ x: 0, y: 0 });
  }, [zoom]);

  const handleCanvasWheel = useCallback((e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -5 : 5;
    setZoom((z) => Math.max(25, Math.min(200, z + delta)));
  }, []);

  const handlePanStart = useCallback((e) => {
    if (zoom <= 100) return;
    if (e.button === 0) {
      isPanningRef.current = true;
      panStartRef.current = { x: e.clientX - panOffset.x, y: e.clientY - panOffset.y };
    }
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

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background-light font-display text-slate-900">
      {/* ── Header ─────────────────────────────────────────────── */}
      <header className="flex items-center justify-between border-b border-solid border-slate-200 px-6 py-3 bg-white z-50">
        <div className="flex items-center gap-4 md:gap-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center size-10 rounded-full bg-slate-100 text-slate-600 hover:bg-primary hover:text-[#11221c] transition-colors"
            title="Back to Shop"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>

          <div className="flex items-center gap-3 border-r border-slate-200 pr-4 md:pr-6 cursor-pointer" onClick={() => navigate('/home')}>
            <div className="size-8 bg-primary rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-[#11221c]" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path clipRule="evenodd" d="M39.475 21.6262C40.358 21.4363 40.6863 21.5589 40.7581 21.5934C40.7876 21.655 40.8547 21.857 40.8082 22.3336C40.7408 23.0255 40.4502 24.0046 39.8572 25.2301C38.6799 27.6631 36.5085 30.6631 33.5858 33.5858C30.6631 36.5085 27.6632 38.6799 25.2301 39.8572C24.0046 40.4502 23.0255 40.7407 22.3336 40.8082C21.8571 40.8547 21.6551 40.7875 21.5934 40.7581C21.5589 40.6863 21.4363 40.358 21.6262 39.475C21.8562 38.4054 22.4689 36.9657 23.5038 35.2817C24.7575 33.2417 26.5497 30.9744 28.7621 28.762C30.9744 26.5497 33.2417 24.7574 35.2817 23.5037C36.9657 22.4689 38.4054 21.8562 39.475 21.6262ZM4.41189 29.2403L18.7597 43.5881C19.8813 44.7097 21.4027 44.9179 22.7217 44.7893C24.0585 44.659 25.5148 44.1631 26.9723 43.4579C29.9052 42.0387 33.2618 39.5667 36.4142 36.4142C39.5667 33.2618 42.0387 29.9052 43.4579 26.9723C44.1631 25.5148 44.659 24.0585 44.7893 22.7217C44.9179 21.4027 44.7097 19.8813 43.5881 18.7597L29.2403 4.41187C27.8527 3.02428 25.8765 3.02573 24.2861 3.36776C22.6081 3.72863 20.7334 4.58419 18.8396 5.74801C16.4978 7.18716 13.9881 9.18353 11.5858 11.5858C9.18354 13.988 7.18717 16.4978 5.74802 18.8396C4.58421 20.7334 3.72865 22.6081 3.36778 24.2861C3.02574 25.8765 3.02429 27.8527 4.41189 29.2403Z" fill="currentColor" fillRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-lg font-bold leading-tight tracking-tight hidden sm:block">POD Print</h2>
          </div>

          <div className="hidden md:flex flex-col">
            <h2 className="text-sm font-bold leading-tight tracking-tight">Design Editor</h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Customizing: Classic Tee</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-4 sm:gap-6 pr-4 sm:pr-6 border-r border-slate-200">
            <button
              onClick={clearCanvas}
              className="hidden sm:flex min-w-[84px] items-center justify-center rounded-lg h-9 px-4 border border-slate-300 hover:bg-slate-100 text-sm font-bold transition-all gap-2"
            >
              <span className="material-symbols-outlined text-base">restart_alt</span>
              <span>Reset</span>
            </button>
            <button
              onClick={exportDesign}
              disabled={isAdded}
              className={`flex min-w-[110px] items-center justify-center rounded-lg h-9 px-4 text-sm font-bold transition-all duration-300 gap-2 ${
                isAdded
                  ? 'bg-primary text-[#11221c] shadow-[0_0_15px_rgba(20,200,100,0.3)]'
                  : 'bg-primary text-[#11221c] shadow-lg shadow-primary/20 hover:scale-105'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">
                {isAdded ? 'check_circle' : 'upload'}
              </span>
              <span>{isAdded ? 'Exported!' : 'Export Design'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/home/cart')}
              className="relative size-10 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors group cursor-pointer"
              title="View Cart"
            >
              <span className="material-symbols-outlined text-slate-600 group-hover:text-primary transition-colors">shopping_cart</span>
              <span className="absolute top-1.5 right-1.5 size-4 bg-primary text-[#11221c] text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">3</span>
            </button>
            <button
              onClick={() => navigate('/home/login')}
              className="flex items-center justify-center size-10 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
              title="Sign In / Account"
            >
              <span className="material-symbols-outlined text-slate-600 hover:text-primary transition-colors text-[24px]">account_circle</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Main Body ──────────────────────────────────────────── */}
      <main className="flex flex-1 overflow-hidden">
        {/* ── Left: Icon Sidebar ──────────────────────────────── */}
        <aside className="w-16 flex flex-col items-center py-4 gap-4 border-r border-slate-200 bg-white shrink-0">
          {sidebarTools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => setActiveTool(tool.id)}
              className={`p-3 rounded-xl transition-colors ${
                activeTool === tool.id ? 'bg-primary/10 text-primary' : 'hover:bg-slate-100 text-slate-500'
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
                    accept="image/png,image/jpeg,image/svg+xml,image/webp"
                    multiple
                    className="hidden"
                    onChange={(e) => { handleFileUpload(e.target.files); e.target.value = ''; }}
                  />
                </div>

                {/* Uploaded Images Grid */}
                {uploadedImages.length > 0 && (
                  <div className="grid grid-cols-2 gap-3">
                    {uploadedImages.map((img) => (
                      <div key={img.id} className="group relative aspect-square bg-white rounded-lg border border-slate-200 p-2 hover:border-primary transition-all cursor-pointer">
                        <img
                          src={img.src}
                          alt={img.name}
                          className="w-full h-full object-contain"
                          draggable={false}
                          onClick={() => addImageToCanvas(img.src, img.name)}
                        />
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
                  {STICKERS.map((sticker) => (
                    <button
                      key={sticker.id}
                      onClick={() => addSticker(sticker)}
                      className="group relative aspect-square bg-white rounded-lg border border-slate-200 p-3 hover:border-primary transition-all cursor-pointer flex flex-col items-center justify-center gap-2"
                    >
                      <img
                        src={sticker.src}
                        alt={sticker.label}
                        className="w-full h-3/4 object-contain transition-transform group-hover:scale-110"
                        draggable={false}
                      />
                      <span className="text-[10px] font-bold text-slate-500 group-hover:text-primary">{sticker.label}</span>
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

                <button
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
          {/* Contextual Toolbar */}
          <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-white shadow-2xl rounded-xl border border-slate-200 flex items-center p-1 z-10">
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
            <div className="w-px h-6 bg-slate-200 mx-1"></div>
            <button onClick={clearCanvas} className="flex items-center gap-2 px-3 py-2 bg-primary/20 text-primary rounded-lg text-xs font-bold" title="Reset Canvas">
              <span className="material-symbols-outlined text-sm">restart_alt</span>
              <span>Reset</span>
            </button>
          </div>

          {/* Canvas Viewport (pan + zoom) */}
          <div
            className="absolute inset-0 flex items-center justify-center overflow-hidden"
            style={{ cursor: zoom > 100 ? (isPanningRef.current ? 'grabbing' : 'grab') : 'default' }}
            onWheel={handleCanvasWheel}
            onMouseDown={handlePanStart}
            onMouseMove={handlePanMove}
            onMouseUp={handlePanEnd}
            onMouseLeave={handlePanEnd}
          >
            <div
              className="rounded-xl shadow-2xl border border-slate-200 overflow-hidden"
              style={{
                width: CANVAS_WIDTH,
                height: CANVAS_HEIGHT,
                transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom / 100})`,
                transformOrigin: 'center center',
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
                        className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors text-left ${
                          isActive ? 'bg-primary/10 border border-primary/30' : 'hover:bg-slate-50 border border-transparent'
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

          {/* Garment Color */}
          <div className="p-4 bg-slate-50 border-t border-slate-200">
            <p className="text-[10px] text-slate-500 uppercase font-bold mb-3 tracking-wider">Garment Color</p>
            <div className="flex gap-2">
              <button
                onClick={() => switchTshirtBg('white')}
                className={`size-6 rounded-full bg-white border-2 transition-all ${activeColor === 'white' ? 'border-primary ring-2 ring-primary/30' : 'border-slate-300 hover:border-slate-400'}`}
                title="White"
              ></button>
              <button
                onClick={() => switchTshirtBg('black')}
                className={`size-6 rounded-full bg-black border-2 transition-all ${activeColor === 'black' ? 'border-primary ring-2 ring-primary/30' : 'border-transparent hover:border-slate-400'}`}
                title="Black"
              ></button>
            </div>
          </div>
        </aside>
      </main>

      {/* ── Toast Notification ─────────────────────────────────── */}
      <div className={`fixed bottom-8 right-8 z-50 transition-all duration-500 transform ${showToast ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}`}>
        <div className="bg-slate-900 border border-slate-700 text-white p-4 rounded-xl shadow-[0_20px_40px_rgba(0,0,0,0.3)] flex items-center gap-4 min-w-[320px]">
          <div className="size-10 bg-primary/20 text-primary rounded-full flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[24px]">check_circle</span>
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-white text-sm">Design Exported</h4>
            <p className="text-xs text-slate-400 mt-0.5">JSON logged to console — ready for backend</p>
          </div>
          <button
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
