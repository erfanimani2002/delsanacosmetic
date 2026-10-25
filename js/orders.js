/* ==========================================================
   Delsana order service
   Front-end mock today. Swap createOrder() for an API call later;
   the rest of the cart UI can stay unchanged.
   ========================================================== */

(() => {
    "use strict";

    const STORAGE_KEY = "delsana:orders";

    function readOrders() {
        try {
            const raw = window.localStorage.getItem(STORAGE_KEY);
            const orders = raw ? JSON.parse(raw) : [];
            return Array.isArray(orders) ? orders : [];
        } catch (error) {
            return [];
        }
    }

    function writeOrders(orders) {
        try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
            return true;
        } catch (error) {
            console.warn("Could not save the order locally.", error);
            return false;
        }
    }

    function createOrder(draft) {
        return new Promise(resolve => {
            const items = Array.isArray(draft?.items) ? draft.items : [];
            const order = {
                id: `DS-${Date.now().toString(36).toUpperCase()}`,
                createdAt: new Date().toISOString(),
                status: "pending",
                items: items.map(item => ({ ...item })),
                customer: { ...(draft?.customer || {}) },
                totals: { ...(draft?.totals || {}) },
            };

            window.setTimeout(() => {
                const orders = readOrders();
                orders.unshift(order);
                writeOrders(orders);
                resolve(order);
            }, 320);
        });
    }

    window.DelsanaOrders = {
        storageKey: STORAGE_KEY,
        createOrder,
        getOrders: readOrders,
    };
})();
