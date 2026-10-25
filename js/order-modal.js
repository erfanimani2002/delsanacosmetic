/* ==========================================================
   Order popup behavior
   Presentation stays in CSS. Catalog data and local cart/wishlist
   state are shared with the rest of the storefront.
   ========================================================== */

(() => {
    "use strict";

    const overlay = document.getElementById("orderPopupOverlay");
    if (!overlay) return;

    const popup = overlay.querySelector(".order-popup");
    if (!popup) return;

    const catalog = window.DelsanaCatalog;
    const store = window.DelsanaStore;
    if (!catalog || !store) return;

    const closeButton = overlay.querySelector("[data-popup-close]");
    const wishlistButtons = Array.from(overlay.querySelectorAll("[data-popup-wishlist]"));
    const wishlistLabel = overlay.querySelector("[data-wishlist-label]");
    const status = document.getElementById("orderPopupStatus");

    const heroImage = overlay.querySelector("[data-gallery-hero]");
    const thumbnails = Array.from(overlay.querySelectorAll("[data-gallery-thumb]"));
    const previousImageButton = overlay.querySelector("[data-gallery-prev]");
    const nextImageButton = overlay.querySelector("[data-gallery-next]");

    const sizeLabel = document.getElementById("orderSizeLabel");
    const sizeGroup = overlay.querySelector(".options");
    const sizeOptions = Array.from(overlay.querySelectorAll("[data-size-option]"));
    const quantityValue = overlay.querySelector("[data-quantity-value]");
    const decreaseButton = overlay.querySelector("[data-quantity-minus]");
    const increaseButton = overlay.querySelector("[data-quantity-plus]");

    const priceValue = overlay.querySelector("[data-price-value]");
    const addToCartButton = overlay.querySelector("[data-add-to-cart]");
    const addToCartLabel = overlay.querySelector("[data-add-label]");
    const shareButton = overlay.querySelector("[data-share]");
    const shareLabel = overlay.querySelector("[data-share-label]");
    const title = document.getElementById("orderPopupTitle");
    const category = document.getElementById("orderPopupCategory");
    const attributeContainer = overlay.querySelector(".product-attribute");
    const grantLabels = Array.from(overlay.querySelectorAll(".grants-item span"));

    if (
        !closeButton ||
        !wishlistLabel ||
        !heroImage ||
        !quantityValue ||
        !priceValue ||
        !addToCartButton ||
        !addToCartLabel ||
        !shareButton ||
        !shareLabel ||
        !decreaseButton ||
        !increaseButton
    ) {
        return;
    }

    const MIN_QUANTITY = store.minQuantity;
    const MAX_QUANTITY = store.maxQuantity;
    const FEEDBACK_DURATION = 2200;
    const WISHLIST_ADD_LABEL = "افزودن به علاقه‌مندی";
    const WISHLIST_REMOVE_LABEL = "حذف از علاقه‌مندی";
    const DEFAULT_ADD_LABEL = addToCartLabel.textContent.trim();
    const DEFAULT_SHARE_LABEL = shareLabel.textContent.trim();
    const supportsInert = "inert" in HTMLElement.prototype;
    const backgroundElements = Array.from(document.querySelectorAll("header, main, footer"));

    let product = catalog.products[0];
    let gallery = product.gallery;
    let selectedSize = catalog.getDefaultSize(product);

    const state = {
        quantity: MIN_QUANTITY,
        galleryIndex: 0,
        trigger: null,
    };

    const feedbackTimers = new Map();

    /* ---------- Helpers ---------- */

    function announce(message) {
        if (!status) return;
        status.textContent = message;
    }

    function getSelectedSize() {
        return sizeOptions.find(option => option.classList.contains("selected"))
            || selectedSize;
    }

    function getUnitPrice() {
        const option = getSelectedSize();
        const optionPrice = option ? Number(option.dataset.unitPrice) : 0;
        return optionPrice > 0 ? optionPrice : product.price;
    }

    function isWishlisted() {
        return store.isWishlisted(product.id);
    }

    /* ---------- Product data ---------- */

    function renderAttributes(attributes) {
        if (!attributeContainer) return;

        const dot = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-dot preview-icon" aria-hidden="true"><circle cx="12" cy="12" r="1"/></svg>';

        const list = (Array.isArray(attributes) ? attributes : []).slice(0, 3);

        attributeContainer.innerHTML = list
            .map((attribute, index) => {
                const suffix = index < list.length - 1 ? dot : "";
                return `<span>${attribute}</span>${suffix}`;
            })
            .join("");
    }

    function renderGallery(items) {
        gallery = Array.isArray(items) && items.length ? items : [{ src: product.image, alt: product.name }];

        thumbnails.forEach((thumbnail, index) => {
            const image = thumbnail.querySelector("img");
            const item = gallery[index];
            thumbnail.hidden = !item;

            if (!image || !item) return;
            image.src = item.src;
            image.alt = item.alt || product.name;
            thumbnail.setAttribute("aria-label", `تصویر ${index + 1}`);
        });

        state.galleryIndex = 0;
        setGallery(0);
    }

    function renderSizes(sizes) {
        const list = Array.isArray(sizes) && sizes.length
            ? sizes
            : [{ label: "استاندارد", price: product.price, default: true }];

        const hasMultiple = list.length > 1;
        if (sizeLabel) sizeLabel.hidden = !hasMultiple;
        if (sizeGroup) sizeGroup.hidden = !hasMultiple;

        sizeOptions.forEach((option, index) => {
            const size = list[index];
            option.hidden = !size;
            option.dataset.unitPrice = size ? String(size.price) : "";

            if (!size) {
                option.textContent = "";
                option.classList.remove("selected");
                option.setAttribute("aria-pressed", "false");
                return;
            }

            option.textContent = size.label;
            const isDefault = index === list.findIndex(item => item.default);
            option.classList.toggle("selected", isDefault || (!hasMultiple && index === 0));
            option.setAttribute("aria-pressed", String(option.classList.contains("selected")));
        });

        selectedSize = sizeOptions.find(option => option.classList.contains("selected"))
            || sizeOptions[0];
    }

    function populateProduct(nextProduct) {
        product = nextProduct || catalog.products[0];
        popup.dataset.productId = product.id;
        popup.dataset.unitPrice = String(product.price);

        if (title) title.textContent = product.name;
        if (category) category.textContent = product.categoryLabel;
        if (heroImage) heroImage.alt = product.name;

        renderAttributes(product.attributes);

        grantLabels.forEach((label, index) => {
            label.textContent = product.badges[index] || "";
        });

        renderGallery(product.gallery);
        renderSizes(product.sizes);
        setQuantity(MIN_QUANTITY);
        syncWishlistState();
    }

    /* ---------- Popup state ---------- */

    function updatePrice() {
        priceValue.textContent = store.formatPrice(getUnitPrice() * state.quantity);
    }

    function setQuantity(nextQuantity) {
        const clamped = Math.min(MAX_QUANTITY, Math.max(MIN_QUANTITY, nextQuantity));
        state.quantity = clamped;

        quantityValue.textContent = String(clamped);
        decreaseButton.disabled = clamped <= MIN_QUANTITY;
        increaseButton.disabled = clamped >= MAX_QUANTITY;

        updatePrice();
    }

    function setSize(option) {
        if (!option || option.hidden) return;

        selectedSize = option;
        sizeOptions.forEach(sizeOption => {
            const isSelected = sizeOption === option;
            sizeOption.classList.toggle("selected", isSelected);
            sizeOption.setAttribute("aria-pressed", String(isSelected));
        });

        updatePrice();
    }

    function setGallery(index) {
        if (!gallery.length) return;

        state.galleryIndex = (index + gallery.length) % gallery.length;
        const currentImage = gallery[state.galleryIndex];

        if (currentImage.src) heroImage.src = currentImage.src;
        heroImage.alt = product.name
            ? `${product.name}، ${currentImage.alt || ""}`
            : currentImage.alt || product.name;

        thumbnails.forEach((thumbnail, thumbnailIndex) => {
            const isCurrent = thumbnailIndex === state.galleryIndex;
            const thumbnailImage = thumbnail.querySelector("img");

            if (isCurrent) thumbnail.setAttribute("aria-current", "true");
            else thumbnail.removeAttribute("aria-current");

            if (thumbnailImage) {
                thumbnailImage.classList.toggle("active", isCurrent);
            }
        });
    }

    function syncWishlistState() {
        const active = isWishlisted();

        wishlistButtons.forEach(button => {
            button.setAttribute("aria-pressed", String(active));
            if (button.classList.contains("wishlist-btn")) {
                button.classList.toggle("is-active", active);
                button.setAttribute(
                    "aria-label",
                    active ? WISHLIST_REMOVE_LABEL : WISHLIST_ADD_LABEL
                );
            }
        });

        wishlistLabel.textContent = active ? WISHLIST_REMOVE_LABEL : WISHLIST_ADD_LABEL;
    }

    function clearFeedback() {
        feedbackTimers.forEach((entry, labelElement) => {
            window.clearTimeout(entry.timer);
            labelElement.textContent = entry.defaultLabel;
        });
        feedbackTimers.clear();

        addToCartLabel.textContent = DEFAULT_ADD_LABEL;
        shareLabel.textContent = DEFAULT_SHARE_LABEL;
        if (status) status.textContent = "";
    }

    function showFeedback(labelElement, defaultLabel, message, statusMessage = message) {
        const existingFeedback = feedbackTimers.get(labelElement);
        if (existingFeedback) window.clearTimeout(existingFeedback.timer);

        labelElement.textContent = message;
        announce(statusMessage);

        const timer = window.setTimeout(() => {
            labelElement.textContent = defaultLabel;
            feedbackTimers.delete(labelElement);
        }, FEEDBACK_DURATION);

        feedbackTimers.set(labelElement, { timer, defaultLabel });
    }

    function resetPopup() {
        clearFeedback();
        setQuantity(MIN_QUANTITY);
    }

    /* ---------- Cart, wishlist, and sharing ---------- */

    function addToCart() {
        const size = getSelectedSize();
        const item = {
            id: product.id,
            name: product.name,
            size: size ? size.textContent.trim() : "",
            quantity: state.quantity,
            unitPrice: getUnitPrice(),
            image: heroImage.getAttribute("src") || product.image,
        };

        const result = store.addToCart(item);

        showFeedback(
            addToCartLabel,
            DEFAULT_ADD_LABEL,
            result.saved ? "به سبد خرید اضافه شد" : "ذخیره نشد",
            result.saved ? "به سبد خرید اضافه شد" : "ذخیره سبد خرید ممکن نشد"
        );
    }

    function toggleWishlist() {
        const result = store.toggleWishlist(product.id);
        syncWishlistState();
        announce(result.active ? "به علاقه‌مندی اضافه شد" : "از علاقه‌مندی حذف شد");
    }

    async function copyText(text) {
        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(text);
                return true;
            }
        } catch (error) {
            /* Fall through to the legacy copy path. */
        }

        try {
            const textArea = document.createElement("textarea");
            textArea.value = text;
            textArea.setAttribute("readonly", "");
            textArea.style.position = "fixed";
            textArea.style.top = "-1000px";
            textArea.style.opacity = "0";

            document.body.appendChild(textArea);
            textArea.select();

            try {
                return document.execCommand("copy");
            } finally {
                textArea.remove();
            }
        } catch (error) {
            return false;
        }
    }

    async function shareProduct() {
        const shareData = {
            title: product.name,
            text: `${product.name} — ${store.formatPrice(getUnitPrice())} تومان`,
            url: window.location.href,
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
                return;
            } catch (error) {
                if (error && error.name === "AbortError") return;
            }
        }

        const copied = await copyText(shareData.url);
        showFeedback(
            shareLabel,
            DEFAULT_SHARE_LABEL,
            copied ? "لینک کپی شد" : "کپی نشد",
            copied ? "لینک کپی شد" : "کپی لینک ممکن نشد"
        );
    }

    /* ---------- Open / close / focus ---------- */

    function setBackgroundInert(value) {
        if (!supportsInert) return;
        backgroundElements.forEach(element => {
            element.inert = value;
        });
    }

    function getFocusableElements() {
        return Array.from(
            popup.querySelectorAll(
                'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
            )
        ).filter(element => element.getClientRects().length > 0);
    }

    function openPopup(trigger, productId) {
        if (!overlay.hidden) return;

        const nextProductId = productId
            || trigger?.closest(".product-card")?.dataset.productId
            || catalog.products[0].id;

        state.trigger = trigger;
        populateProduct(catalog.getProduct(nextProductId) || catalog.products[0]);
        resetPopup();

        overlay.hidden = false;
        document.documentElement.classList.add("modal-open");
        document.body.classList.add("modal-open");
        setBackgroundInert(true);

        if (trigger) trigger.setAttribute("aria-expanded", "true");

        overlay.scrollTop = 0;
        closeButton.focus({ preventScroll: true });
        overlay.scrollTop = 0;
    }

    function closePopup() {
        if (overlay.hidden) return;

        clearFeedback();
        overlay.hidden = true;
        document.documentElement.classList.remove("modal-open");
        document.body.classList.remove("modal-open");
        setBackgroundInert(false);

        if (state.trigger) {
            state.trigger.setAttribute("aria-expanded", "false");
            state.trigger.focus();
        }

        state.trigger = null;
    }

    function handleKeydown(event) {
        if (overlay.hidden) return;

        if (event.key === "Escape") {
            event.preventDefault();
            closePopup();
            return;
        }

        if (event.key !== "Tab") return;

        const focusableElements = getFocusableElements();
        if (!focusableElements.length) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        const activeElement = document.activeElement;
        const focusIsInside = popup.contains(activeElement);

        if (event.shiftKey && (!focusIsInside || activeElement === firstElement)) {
            event.preventDefault();
            lastElement.focus();
        } else if (!event.shiftKey && (!focusIsInside || activeElement === lastElement)) {
            event.preventDefault();
            firstElement.focus();
        }
    }

    /* ---------- Wire up ---------- */

    document.querySelectorAll(".order-btn").forEach(button => {
        button.setAttribute("aria-haspopup", "dialog");
        button.setAttribute("aria-controls", "orderPopupOverlay");
        button.setAttribute("aria-expanded", "false");

        button.addEventListener("click", event => {
            event.preventDefault();
            openPopup(button, button.dataset.productId);
        });
    });

    closeButton.addEventListener("click", closePopup);

    overlay.addEventListener("click", event => {
        if (event.target === overlay) closePopup();
    });

    document.addEventListener("keydown", handleKeydown);

    wishlistButtons.forEach(button => {
        button.addEventListener("click", toggleWishlist);
    });

    thumbnails.forEach((thumbnail, index) => {
        thumbnail.addEventListener("click", () => setGallery(index));
    });

    if (previousImageButton) {
        previousImageButton.addEventListener("click", () => setGallery(state.galleryIndex - 1));
    }

    if (nextImageButton) {
        nextImageButton.addEventListener("click", () => setGallery(state.galleryIndex + 1));
    }

    sizeOptions.forEach(option => {
        option.addEventListener("click", () => setSize(option));
    });

    decreaseButton.addEventListener("click", () => setQuantity(state.quantity - 1));
    increaseButton.addEventListener("click", () => setQuantity(state.quantity + 1));
    addToCartButton.addEventListener("click", addToCart);
    shareButton.addEventListener("click", shareProduct);

    populateProduct(catalog.getProduct(popup.dataset.productId) || catalog.products[0]);
    resetPopup();
})();
