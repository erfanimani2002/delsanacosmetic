/* ==========================================================
   Shopping cart page
   ========================================================== */

(() => {
    "use strict";

    const catalog = window.DelsanaCatalog;
    const store = window.DelsanaStore;
    const root = document.querySelector("[data-cart-root]");
    if (!catalog || !store || !root) return;

    const emptyState = root.querySelector("[data-cart-empty]");
    const list = root.querySelector("[data-cart-list]");
    const summary = root.querySelector("[data-cart-summary]");
    const countLabel = document.querySelector("[data-cart-count]");
    const subtotalLabel = root.querySelector("[data-cart-subtotal]");
    const itemsLabel = root.querySelector("[data-cart-items]");
    const totalLabel = root.querySelector("[data-cart-total]");
    const checkoutButton = document.querySelector("[data-checkout-open]");
    const status = document.querySelector("[data-cart-status]");

    let internalQuantityUpdate = false;

    const icons = {
        trash: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>',
    };

    function announce(message) {
        if (status) status.textContent = message;
    }

    function itemTemplate(item) {
        const product = catalog.getProduct(item.id);
        const name = item.name || product?.name || "محصول دلسانا";
        const image = item.image || product?.image || "";
        const lineTotal = item.unitPrice * item.quantity;

        return `
            <article class="cart-item" data-item-id="${item.id}" data-item-size="${item.size}">
                <button type="button" class="cart-remove" data-cart-remove
                        aria-label="حذف ${name} از سبد خرید">
                    ${icons.trash}
                </button>
                <div class="cart-media">
                    <img src="${image}" alt="${name}" loading="lazy">
                </div>
                <div class="cart-info">
                    <h2 class="cart-name">${name}</h2>
                    <div class="cart-meta">${item.size || "سایز استاندارد"}</div>
                    <div class="cart-unit-price">قیمت واحد: ${store.formatPrice(item.unitPrice)} تومان</div>
                    <div class="cart-item-bottom">
                        <div class="qty-control" role="group" aria-label="تعداد ${name}">
                            <button type="button" data-cart-minus aria-label="کاهش تعداد" ${item.quantity <= 1 ? "disabled" : ""}>−</button>
                            <span data-cart-quantity aria-live="polite">${item.quantity}</span>
                            <button type="button" data-cart-plus aria-label="افزایش تعداد" ${item.quantity >= store.maxQuantity ? "disabled" : ""}>+</button>
                        </div>
                        <div class="cart-line-total">
                            <span data-cart-line-total>${store.formatPrice(lineTotal)}</span>
                            <small>تومان</small>
                        </div>
                    </div>
                </div>
            </article>
        `;
    }

    function updateSummary() {
        const cart = store.getCart();
        const itemCount = cart.reduce((total, item) => total + item.quantity, 0);
        const subtotal = cart.reduce(
            (total, item) => total + item.unitPrice * item.quantity,
            0
        );

        if (countLabel) countLabel.textContent = String(itemCount);
        if (itemsLabel) itemsLabel.textContent = `${itemCount} قلم`;
        if (subtotalLabel) subtotalLabel.textContent = `${store.formatPrice(subtotal)} تومان`;
        if (totalLabel) totalLabel.textContent = `${store.formatPrice(subtotal)} تومان`;
        if (checkoutButton) checkoutButton.disabled = cart.length === 0;
    }

    function render() {
        const cart = store.getCart();
        const hasItems = cart.length > 0;

        list.innerHTML = cart.map(itemTemplate).join("");
        list.hidden = !hasItems;
        emptyState.hidden = hasItems;
        summary.hidden = !hasItems;

        updateSummary();
    }

    root.addEventListener("click", event => {
        const itemElement = event.target.closest("[data-item-id]");
        if (!itemElement) return;

        const itemId = itemElement.dataset.itemId;
        const itemSize = itemElement.dataset.itemSize;
        const item = store.getCart().find(
            entry => entry.id === itemId && entry.size === itemSize
        );
        if (!item) return;

        if (event.target.closest("[data-cart-remove]")) {
            store.removeFromCart(itemId, itemSize);
            announce(`${item.name || "محصول"} از سبد خرید حذف شد`);
            window.DelsanaUI?.toast("از سبد خرید حذف شد");
            return;
        }

        if (event.target.closest("[data-cart-minus]")) {
            const nextQuantity = item.quantity - 1;
            if (nextQuantity < store.minQuantity) return;

            internalQuantityUpdate = true;
            store.updateCartQuantity(itemId, itemSize, nextQuantity);

            const quantity = itemElement.querySelector("[data-cart-quantity]");
            const lineTotal = itemElement.querySelector("[data-cart-line-total]");
            const minus = itemElement.querySelector("[data-cart-minus]");
            const plus = itemElement.querySelector("[data-cart-plus]");

            if (quantity) quantity.textContent = String(nextQuantity);
            if (lineTotal) lineTotal.textContent = store.formatPrice(item.unitPrice * nextQuantity);
            if (minus) minus.disabled = nextQuantity <= store.minQuantity;
            if (plus) plus.disabled = false;
            updateSummary();
            return;
        }

        if (event.target.closest("[data-cart-plus]")) {
            const nextQuantity = item.quantity + 1;
            if (nextQuantity > store.maxQuantity) return;

            internalQuantityUpdate = true;
            store.updateCartQuantity(itemId, itemSize, nextQuantity);

            const quantity = itemElement.querySelector("[data-cart-quantity]");
            const lineTotal = itemElement.querySelector("[data-cart-line-total]");
            const minus = itemElement.querySelector("[data-cart-minus]");
            const plus = itemElement.querySelector("[data-cart-plus]");

            if (quantity) quantity.textContent = String(nextQuantity);
            if (lineTotal) lineTotal.textContent = store.formatPrice(item.unitPrice * nextQuantity);
            if (minus) minus.disabled = false;
            if (plus) plus.disabled = nextQuantity >= store.maxQuantity;
            updateSummary();
        }
    });

    window.addEventListener("delsana:cart:change", () => {
        if (internalQuantityUpdate) {
            internalQuantityUpdate = false;
            return;
        }
        render();
    });

    window.addEventListener("storage", event => {
        if (event.key === "delsana:cart") render();
    });

    render();
})();
