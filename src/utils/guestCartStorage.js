/**
 * Utility for managing cart items in localStorage for unauthenticated users.
 */
const GUEST_CART_KEY = 'pod_guest_cart';

export const guestCartStorage = {
    getCartItems: () => {
        try {
            const stored = localStorage.getItem(GUEST_CART_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch (err) {
            console.error('Failed to parse guest cart:', err);
            return [];
        }
    },

    addItem: (item) => {
        const items = guestCartStorage.getCartItems();
        // Generate a temporary ID for the guest item if not present
        const guestItem = {
            ...item,
            id: item.id || `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            subtotal: Number(item.price) * (item.quantity || 1)
        };
        
        // Simple deduplication based on variant and print configs if applicable
        // For simplicity, we'll just check productVariantId and some key design props
        const existingIndex = items.findIndex(i => 
            i.productVariantId === item.productVariantId && 
            i.frontPrintUrl === item.frontPrintUrl && 
            i.backPrintUrl === item.backPrintUrl
        );

        if (existingIndex > -1) {
            items[existingIndex].quantity += (item.quantity || 1);
            items[existingIndex].subtotal = items[existingIndex].quantity * Number(items[existingIndex].price);
        } else {
            items.push(guestItem);
        }

        localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
        return items;
    },

    updateItem: (itemId, updates) => {
        const items = guestCartStorage.getCartItems();
        const index = items.findIndex(i => i.id === itemId);
        if (index > -1) {
            items[index] = { ...items[index], ...updates };
            if (updates.quantity) {
                items[index].subtotal = items[index].quantity * Number(items[index].price);
            }
            localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
        }
        return items;
    },

    removeItem: (itemId) => {
        const items = guestCartStorage.getCartItems().filter(i => i.id !== itemId);
        localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
        return items;
    },

    clearCart: () => {
        localStorage.removeItem(GUEST_CART_KEY);
    }
};
