/* ==========================================================
   Delsana local store
   Single source of truth for cart and wishlist state.
   Storage keys and events stay compatible with the order popup.
   ========================================================== */

(() => {
    "use strict";

    const KEYS = {
        cart: "delsana:cart",
        wishlist: "delsana:wishlist",
    };

    const MIN_QUANTITY = 1;
    const MAX_QUANTITY = 99;
    const priceFormatter = new Intl.NumberFormat("en-US");

    function read(key, fallback) {
        try {
            const raw = window.localStorage.getItem(key);
            return raw ? JSON.parse(raw) : fallback;
        } catch (error) {
            return fallback;
        }
    }

    function write(key, value) {
        try {
            window.localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.warn(`Could not save ${key} in localStorage.`, error);
            return false;
        }
    }

    function toNumber(value) {
        if (typeof value === "number") return Number.isFinite(value) ? value : 0;
        const digits = String(value == null ? "" : value)
            .replace(/[۰-۹]/g, digit => "۰۱۲۳۴۵۶۷۸۹".indexOf(digit))
            .replace(/[٠-٩]/g, digit => "٠١٢٣٤٥٦٧٨٩".indexOf(digit))
            .replace(/[^\d]/g, "");
        const parsed = Number(digits);
        return Number.isFinite(parsed) ? parsed : 0;
    }

    function clampQuantity(value) {
        const parsed = Math.trunc(toNumber(value));
        if (!Number.isFinite(parsed)) return MIN_QUANTITY;
        return Math.min(MAX_QUANTITY, Math.max(MIN_QUANTITY, parsed || MIN_QUANTITY));
    }

    function normalizeItem(item) {
        if (!item || typeof item !== "object") return null;

        const id = String(item.id || item.productId || "").trim();
        if (!id) return null;

        return {
            id,
            name: String(item.name || "").trim(),
            size: String(item.size || "").trim(),
            quantity: clampQuantity(item.quantity),
            unitPrice: toNumber(item.unitPrice == null ? item.price : item.unitPrice),
            image: String(item.image || "").trim(),
        };
    }

    function itemKey(id, size) {
        return `${String(id || "").trim()}::${String(size || "").trim()}`;
    }

    function normalizeCart(items) {
        if (!Array.isArray(items)) return [];

        const merged = new Map();
        items.forEach(rawItem => {
            const item = normalizeItem(rawItem);
            if (!item) return;

            const key = itemKey(item.id, item.size);
            const existing = merged.get(key);
            if (existing) {
                existing.quantity = Math.min(
                    MAX_QUANTITY,
                    existing.quantity + item.quantity
                );
            } else {
                merged.set(key, item);
            }
        });

        return Array.from(merged.values());
    }

    function emitCartChange(cart) {
        window.dispatchEvent(new CustomEvent("delsana:cart:change", {
            detail: { cart: cart.map(item => ({ ...item })) },
        }));
    }

    function saveCart(cart) {
        const normalized = normalizeCart(cart);
        const saved = write(KEYS.cart, normalized);

        emitCartChange(normalized);
        return saved;
    }

    function getCart() {
        return normalizeCart(read(KEYS.cart, []));
    }

    function addToCart(item) {
        const normalized = normalizeItem(item);
        if (!normalized) return { saved: false, cart: getCart(), item: null };

        const cart = getCart();
        const existing = cart.find(
            entry => entry.id === normalized.id && entry.size === normalized.size
        );

        if (existing) {
            existing.quantity = Math.min(
                MAX_QUANTITY,
                existing.quantity + normalized.quantity
            );
            if (normalized.name) existing.name = normalized.name;
            if (normalized.unitPrice) existing.unitPrice = normalized.unitPrice;
            if (normalized.image) existing.image = normalized.image;
        } else {
            cart.push(normalized);
        }

        const saved = saveCart(cart);
        window.dispatchEvent(new CustomEvent("delsana:cart:add", {
            detail: { ...normalized, cart: cart.map(entry => ({ ...entry })) },
        }));

        return { saved, cart, item: normalized };
    }

    function updateCartQuantity(id, size, quantity) {
        const cart = getCart();
        const key = itemKey(id, size);
        const item = cart.find(entry => itemKey(entry.id, entry.size) === key);
        if (!item) return false;

        item.quantity = clampQuantity(quantity);
        return saveCart(cart);
    }

    function removeFromCart(id, size) {
        const key = itemKey(id, size);
        const cart = getCart().filter(
            entry => itemKey(entry.id, entry.size) !== key
        );
        return saveCart(cart);
    }

    function clearCart() {
        const saved = write(KEYS.cart, []);
        emitCartChange([]);
        return saved;
    }

    function getCartCount() {
        return getCart().reduce((total, item) => total + item.quantity, 0);
    }

    function getCartSubtotal() {
        return getCart().reduce(
            (total, item) => total + item.unitPrice * item.quantity,
            0
        );
    }

    function getWishlist() {
        const stored = read(KEYS.wishlist, []);
        if (!Array.isArray(stored)) return [];

        return Array.from(new Set(
            stored
                .filter(item => typeof item === "string")
                .map(item => item.trim())
                .filter(Boolean)
        ));
    }

    function saveWishlist(wishlist) {
        const normalized = Array.from(new Set(
            (Array.isArray(wishlist) ? wishlist : [])
                .filter(item => typeof item === "string")
                .map(item => item.trim())
                .filter(Boolean)
        ));

        const saved = write(KEYS.wishlist, normalized);
        window.dispatchEvent(new CustomEvent("delsana:wishlist:change", {
            detail: { wishlist: [...normalized] },
        }));
        return saved;
    }

    function isWishlisted(id) {
        return getWishlist().includes(String(id || "").trim());
    }

    function toggleWishlist(id) {
        const productId = String(id || "").trim();
        if (!productId) {
            return { saved: false, active: false, wishlist: getWishlist() };
        }

        const wishlist = getWishlist();
        const index = wishlist.indexOf(productId);
        const active = index < 0;

        if (active) wishlist.push(productId);
        else wishlist.splice(index, 1);

        const saved = saveWishlist(wishlist);
        return { saved, active, wishlist: [...wishlist] };
    }

    function formatPrice(value) {
        return priceFormatter.format(toNumber(value));
    }

    window.DelsanaStore = {
        keys: { ...KEYS },
        minQuantity: MIN_QUANTITY,
        maxQuantity: MAX_QUANTITY,
        getCart,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        getCartCount,
        getCartSubtotal,
        getWishlist,
        isWishlisted,
        toggleWishlist,
        saveWishlist,
        formatPrice,
        parsePrice: toNumber,
    };
})();
