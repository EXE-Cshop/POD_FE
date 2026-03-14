import { create } from 'zustand';
import api from '../services/api';

/**
 * Zustand store quản lý trạng thái Canvas của Design Workspace.
 *
 * - layers: mảng các object mô tả text/image trên canvas (toạ độ, kích thước, …).
 * - canvasJSON: chuỗi JSON đại diện toàn bộ canvas (dùng để lưu/khôi phục).
 * - selectedLayerId: id của layer đang được chọn.
 * - isRemixing: trạng thái loading khi đang fetch design để remix.
 * - parentDesignId: id của design gốc nếu đang remix.
 *
 * Tích hợp Fabric.js:
 *   Khi component mount một Fabric.Canvas, gọi `setFabricCanvas(canvas)` để store
 *   giữ tham chiếu. Sau đó `loadFromJSON` sẽ tự động render lên canvas.
 */
const useDesignStore = create((set, get) => ({
  // ─── State ────────────────────────────────────────────────────────
  layers: [],
  canvasJSON: '[]',
  selectedLayerId: null,
  isRemixing: false,
  parentDesignId: null,

  // Tham chiếu đến instance Fabric.Canvas (không serialize).
  _fabricCanvas: null,

  // ─── Actions ──────────────────────────────────────────────────────

  /**
   * Gắn Fabric.Canvas instance vào store để các action có thể tương tác trực tiếp.
   * Gọi một lần trong useEffect khi canvas được tạo.
   *
   * @example
   * useEffect(() => {
   *   const canvas = new fabric.Canvas(canvasRef.current, { width: 800, height: 800 });
   *   useDesignStore.getState().setFabricCanvas(canvas);
   *   return () => { canvas.dispose(); useDesignStore.getState().setFabricCanvas(null); };
   * }, []);
   */
  setFabricCanvas: (canvas) => set({ _fabricCanvas: canvas }),

  /**
   * Thêm một layer mới vào danh sách.
   * @param {{ id: string, type: 'text'|'image', left: number, top: number, ... }} layer
   */
  addLayer: (layer) =>
    set((state) => ({
      layers: [...state.layers, { ...layer, id: layer.id || crypto.randomUUID() }],
    })),

  /**
   * Xoá layer theo id.
   */
  removeLayer: (layerId) =>
    set((state) => ({
      layers: state.layers.filter((l) => l.id !== layerId),
      selectedLayerId: state.selectedLayerId === layerId ? null : state.selectedLayerId,
    })),

  /**
   * Cập nhật thuộc tính của một layer.
   * @param {string} layerId
   * @param {object} props - Các thuộc tính cần merge (vd: { left: 100, top: 200 })
   */
  updateLayer: (layerId, props) =>
    set((state) => ({
      layers: state.layers.map((l) => (l.id === layerId ? { ...l, ...props } : l)),
    })),

  /**
   * Chọn một layer.
   */
  selectLayer: (layerId) => set({ selectedLayerId: layerId }),

  /**
   * Lưu toàn bộ chuỗi JSON canvas (gọi khi cần persist hoặc sync).
   */
  setCanvasJSON: (jsonString) => set({ canvasJSON: jsonString }),

  /**
   * Parse chuỗi JSON → khôi phục layers vào store VÀ render lên Fabric canvas.
   *
   * JSON format kỳ vọng là mảng các object layer:
   * [
   *   { type: "textbox", text: "Hello", left: 100, top: 200, fontSize: 24, fill: "#000", ... },
   *   { type: "image", src: "https://...", left: 150, top: 300, scaleX: 0.5, scaleY: 0.5, ... },
   * ]
   *
   * Nếu Fabric canvas đã được gắn (setFabricCanvas), hàm sẽ dùng
   * `fabric.util.enlivenObjects` để tái tạo objects trên canvas.
   *
   * @param {string} jsonString - Chuỗi JSON mô tả layers
   */
  loadFromJSON: (jsonString) => {
    let parsed;
    try {
      parsed = JSON.parse(jsonString || '[]');
    } catch {
      console.error('[useDesignStore] loadFromJSON: invalid JSON');
      parsed = [];
    }

    if (!Array.isArray(parsed)) parsed = [];

    // Cập nhật layers trong store, mỗi object nhận một id nếu chưa có
    const layers = parsed.map((obj, idx) => ({
      ...obj,
      id: obj.id || `layer_${idx}_${Date.now()}`,
    }));

    set({ layers, canvasJSON: jsonString });

    // Nếu có Fabric canvas → render objects lên canvas
    const canvas = get()._fabricCanvas;
    if (canvas) {
      _renderLayersToFabric(canvas, parsed);
    }
  },

  /**
   * Fetch design từ Backend theo id, rồi load canvasData lên canvas (Remix).
   *
   * Flow:
   *   1. GET /api/v1/designs/{designId}
   *   2. Lấy canvasData (JSON string) từ response
   *   3. Gọi loadFromJSON(canvasData)
   *   4. Lưu parentDesignId để backend biết đây là remix
   *
   * @param {number|string} designId - ID của design gốc cần remix
   */
  remixDesign: async (designId) => {
    set({ isRemixing: true });
    try {
      const res = await api.get(`/designs/${designId}`);
      const design = res.data?.data ?? res.data;
      const canvasData = design?.canvasData || '[]';

      set({ parentDesignId: design?.id ?? designId });
      get().loadFromJSON(canvasData);
    } catch (err) {
      console.error('[useDesignStore] remixDesign failed:', err);
      throw err;
    } finally {
      set({ isRemixing: false });
    }
  },

  /**
   * Reset toàn bộ store về trạng thái ban đầu.
   */
  reset: () =>
    set({
      layers: [],
      canvasJSON: '[]',
      selectedLayerId: null,
      isRemixing: false,
      parentDesignId: null,
    }),
}));

// ─── Helper: Render parsed layer array lên Fabric canvas ──────────────
/**
 * Nhận một mảng object (đã parse từ JSON) và tạo Fabric objects tương ứng trên canvas.
 *
 * Hàm này dùng dynamic import fabric để tránh lỗi SSR và giữ store nhẹ.
 * Trong thực tế, fabric đã được import global ở DesignerPage nên sẽ dùng cache.
 *
 * @param {fabric.Canvas} canvas - Instance Fabric.Canvas
 * @param {Array} objects - Mảng plain object mô tả layers
 */
async function _renderLayersToFabric(canvas, objects) {
  try {
    // Fabric.js đã có trong project (package.json: "fabric": "^7.2.0")
    const fabric = await import('fabric');

    // Xoá các design objects cũ (giữ lại background áo & print area)
    const existing = canvas.getObjects().filter(
      (o) => !o.data?.isTshirtBg && !o.data?.isPrintArea
    );
    existing.forEach((o) => canvas.remove(o));

    if (!objects || objects.length === 0) {
      canvas.renderAll();
      return;
    }

    // Phân loại image vs non-image để xử lý riêng
    const isImage = (o) =>
      (o.type === 'image' || o.type === 'FabricImage') && (o.src || o.url);

    const imageItems = objects.filter(isImage);
    const nonImageItems = objects.filter((o) => !isImage(o));

    // Load images qua FabricImage.fromURL
    const imagePromises = imageItems.map((o) => {
      const url = o.src || o.url;
      return fabric.FabricImage
        .fromURL(url, { crossOrigin: 'anonymous' })
        .then((img) => {
          const w = Number(o.width) || img.width || 1;
          const h = Number(o.height) || img.height || 1;
          const scaleX = img.width > 0 ? w / img.width : (o.scaleX ?? 1);
          const scaleY = img.height > 0 ? h / img.height : (o.scaleY ?? 1);
          img.set({
            left: o.left ?? 0,
            top: o.top ?? 0,
            scaleX,
            scaleY,
            angle: o.angle ?? 0,
            originX: o.originX ?? 'center',
            originY: o.originY ?? 'center',
            selectable: true,
            hasControls: true,
            hasBorders: true,
          });
          if (o.data) img.set('data', o.data);
          return img;
        })
        .catch((err) => {
          console.warn('[_renderLayersToFabric] image load failed:', url, err);
          return null;
        });
    });

    // Enliven non-image objects (text, shapes, …)
    const enlivenPromise = fabric.util.enlivenObjects(nonImageItems).catch(() => []);

    const [loadedImages, enlivenedNonImages] = await Promise.all([
      Promise.all(imagePromises),
      enlivenPromise,
    ]);

    // Add tất cả objects theo đúng thứ tự ban đầu
    let imgIdx = 0;
    let nonImgIdx = 0;
    objects.forEach((o) => {
      if (isImage(o)) {
        const img = loadedImages[imgIdx++];
        if (img) canvas.add(img);
      } else {
        const obj = enlivenedNonImages[nonImgIdx++];
        if (obj) canvas.add(obj);
      }
    });

    canvas.renderAll();
  } catch (err) {
    console.error('[_renderLayersToFabric] unexpected error:', err);
  }
}

export default useDesignStore;
