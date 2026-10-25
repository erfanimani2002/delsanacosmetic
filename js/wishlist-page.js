/* ==========================================================
   Wishlist page
   ========================================================== */

(() => {
    "use strict";

    const catalog = window.DelsanaCatalog;
    const store = window.DelsanaStore;
    const root = document.querySelector("[data-wishlist-root]");
    if (!catalog || !store || !root) return;

    const emptyState = root.querySelector("[data-wishlist-empty]");
    const list = root.querySelector("[data-wishlist-list]");
    const summary = root.querySelector("[data-wishlist-summary]");
    const countLabel = document.querySelector("[data-wishlist-count]");
    const status = document.querySelector("[data-wishlist-status]");

    const icons = {
        trash: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>',
        basket: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 11-1 9"/><path d="m19 11-4-7"/><path d="M2 11h20"/><path d="m3.5 11 1.6 7.4a2 2 0 0 0 2 1.6h9.8a2 2 0 0 0 2-1.6l1.7-7.4"/><path d="M4.5 15.5h15"/><path d="m5 11 4-7"/><path d="m9 11 1 9"/></svg>',
        arrow: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>',
    };

    function announce(message) {
        if (status) status.textContent = message;
    }

    function cardTemplate(product) {
        const size = catalog.getDefaultSize(product);
        const oldPrice = product.oldPrice > product.price
            ? `<del>${store.formatPrice(product.oldPrice)}</del>`
            : "";

        return `
            <article class="wishlist-card" data-product-id="${product.id}">
                <button type="button" class="wishlist-remove" data-wishlist-remove
                        aria-label="حذف ${product.name} از علاقه‌مندی‌ها">
                    ${icons.trash}
                </button>
                <div class="wishlist-media">
                    <img src="${product.image}" alt="${product.name}" loading="lazy">
                </div>
                <div class="wishlist-info">
                    <span class="wishlist-category">${product.categoryLabel}</span>
                    <h2 class="wishlist-name">${product.name}</h2>
                    <span class="wishlist-brand">${product.brand}</span>
                    <div class="wishlist-prices">
                        <strong>${store.formatPrice(product.price)}</strong>
                        <small>تومان</small>
                        ${oldPrice}
                    </div>
                    <span class="wishlist-size">سایز: ${size.label}</span>
                    <div class="wishlist-actions">
                        <button type="button" class="btn btn-soft btn-sm" data-wishlist-add>
                            ${icons.basket}
                            افزودن به سبد
                        </button>
                    </div>
                </div>
            </article>
        `;
    }

    function render() {
        const products = store.getWishlist()
            .map(id => catalog.getProduct(id))
            .filter(Boolean);

        if (countLabel) countLabel.textContent = String(products.length);
        list.innerHTML = products.map(cardTemplate).join("");
        list.hidden = products.length === 0;
        emptyState.hidden = products.length > 0;
        summary.hidden = products.length === 0;

        if (summary) {
            summary.innerHTML = `
                <span>${products.length} محصول در لیست شماست</span>
                <a class="link-arrow" href="index.html#products">
                    ادامه خرید
                    ${icons.arrow}
                </a>
            `;
        }
    }

    root.addEventListener("click", event => {
        const card = event.target.closest("[data-product-id]");
        if (!card) return;

        const product = catalog.getProduct(card.dataset.productId);
        if (!product) return;

        if (event.target.closest("[data-wishlist-remove]")) {
            store.toggleWishlist(product.id);
            announce(`${product.name} از علاقه‌مندی‌ها حذف شد`);
            window.DelsanaUI?.toast("از علاقه‌مندی‌ها حذف شد");
            return;
        }

        if (event.target.closest("[data-wishlist-add]")) {
            const size = catalog.getDefaultSize(product);
            const result = store.addToCart({
                id: product.id,
                name: product.name,
                size: size.label,
                quantity: 1,
                unitPrice: size.price,
                image: product.image,
            });

            if (result.saved) {
                announce(`${product.name} به سبد خرید اضافه شد`);
                window.DelsanaUI?.toast("به سبد خرید اضافه شد");
            } else {
                announce("ذخیره سبد خرید ممکن نشد");
            }
        }
    });

    window.addEventListener("delsana:wishlist:change", render);
    render();
})();
