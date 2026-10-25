/* ==========================================================
   Home page product hydration, wishlist hearts and category filter
   ========================================================== */

(() => {
    "use strict";

    const catalog = window.DelsanaCatalog;
    const store = window.DelsanaStore;
    if (!catalog || !store) return;

    const cards = Array.from(document.querySelectorAll(".product-card"));
    const toolbar = document.querySelector(".toolbar");
    const productsSection = document.getElementById("products");

    function formatPrice(value) {
        return store.formatPrice(value);
    }

    function getCardProduct(card) {
        return catalog.getProduct(card.dataset.productId);
    }

    function syncHeart(button, productId) {
        const active = store.isWishlisted(productId);
        button.setAttribute("aria-pressed", String(active));
        button.setAttribute(
            "aria-label",
            active ? `حذف ${getCardProduct(button.closest(".product-card"))?.name || "محصول"} از علاقه‌مندی‌ها` : `افزودن ${getCardProduct(button.closest(".product-card"))?.name || "محصول"} به علاقه‌مندی‌ها`
        );
    }

    function hydrateCard(card) {
        const product = getCardProduct(card);
        if (!product) return;

        const image = card.querySelector(".product-image img");
        const title = card.querySelector(".product-info h3");
        const brand = card.querySelector(".product-brand");
        const price = card.querySelector(".product-prices strong");
        const oldPrice = card.querySelector(".product-prices del");
        const heart = card.querySelector(".favorite-btn");
        const orderButton = card.querySelector(".order-btn");

        card.dataset.category = product.category;

        if (image) {
            image.src = product.image;
            image.alt = product.name;
        }

        if (title) title.textContent = product.name;
        if (brand) brand.textContent = product.brand;

        if (price) {
            price.innerHTML = `${formatPrice(product.price)} <small>تومان</small>`;
        }

        if (oldPrice) {
            oldPrice.textContent = product.oldPrice > product.price
                ? formatPrice(product.oldPrice)
                : "";
            oldPrice.hidden = !(product.oldPrice > product.price);
        }

        if (heart) {
            heart.dataset.productId = product.id;
            syncHeart(heart, product.id);

            heart.addEventListener("click", () => {
                const result = store.toggleWishlist(product.id);
                syncHeart(heart, product.id);
                window.DelsanaUI?.toast(
                    result.active
                        ? `${product.name} به علاقه‌مندی‌ها اضافه شد`
                        : `${product.name} از علاقه‌مندی‌ها حذف شد`
                );
            });
        }

        if (orderButton) {
            orderButton.dataset.productId = product.id;
        }
    }

    cards.forEach(hydrateCard);

    window.addEventListener("delsana:wishlist:change", () => {
        cards.forEach(card => {
            const heart = card.querySelector(".favorite-btn");
            if (heart && heart.dataset.productId) {
                syncHeart(heart, heart.dataset.productId);
            }
        });
    });

    function clearFilter() {
        cards.forEach(card => {
            card.hidden = false;
        });

        document.querySelector(".active-filter")?.remove();

        const url = new URL(window.location.href);
        url.searchParams.delete("category");
        window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
    }

    function applyCategoryFilter() {
        const params = new URLSearchParams(window.location.search);
        const slug = params.get("category");
        const category = catalog.getCategory(slug);

        document.querySelector(".active-filter")?.remove();

        if (!category || !toolbar) return;

        cards.forEach(card => {
            card.hidden = card.dataset.category !== category.slug;
        });

        const filter = document.createElement("div");
        filter.className = "active-filter";
        filter.innerHTML = `
            <span>دسته: <strong>${category.name}</strong></span>
            <button type="button" data-clear-category>نمایش همه</button>
        `;

        toolbar.insertAdjacentElement("afterend", filter);
        filter.querySelector("[data-clear-category]")?.addEventListener("click", () => {
            clearFilter();
            productsSection?.scrollIntoView({ behavior: "smooth", block: "start" });
        });
    }

    applyCategoryFilter();
})();
