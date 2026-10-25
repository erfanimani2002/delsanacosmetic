/* ==========================================================
   Order popup behavior
   Keeps presentation in CSS and all interaction/state here.
   ========================================================== */

(() => {
    "use strict";

    const overlay = document.getElementById("orderPopupOverlay");
    if (!overlay) return;

    const popup = overlay.querySelector(".order-popup");
    if (!popup) return;

    const closeButton = overlay.querySelector("[data-popup-close]");
    const wishlistButtons = Array.from(overlay.querySelectorAll("[data-popup-wishlist]"));
    const wishlistLabel = overlay.querySelector("[data-wishlist-label]");

    const heroImage = overlay.querySelector("[data-gallery-hero]");
    const thumbnails = Array.from(overlay.querySelectorAll("[data-gallery-thumb]"));
    const previousImageButton = overlay.querySelector("[data-gallery-prev]");
    const nextImageButton = overlay.querySelector("[data-gallery-next]");

    const sizeOptions = Array.from(overlay.querySelectorAll("[data-size-option]"));
    const quantityValue = overlay.querySelector("[data-quantity-value]");
    const decreaseButton = overlay.querySelector("[data-quantity-minus]");
    const increaseButton = overlay.querySelector("[data-quantity-plus]");

    const priceValue = overlay.querySelector("[data-price-value]");
    const addToCartButton = overlay.querySelector("[data-add-to-cart]");
    const addToCartLabel = overlay.querySelector("[data-add-label]");
    const shareButton = overlay.querySelector("[data-share]");
    const shareLabel = overlay.querySelector("[data-share-label]");
    const status = document.getElementById("orderPopupStatus");
    const title = document.getElementById("orderPopupTitle");

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

    const STORAGE_KEYS = {
        cart: "delsana:cart",
        wishlist: "delsana:wishlist",
    };

    const MIN_QUANTITY = 1;
    const MAX_QUANTITY = 99;
    const FEEDBACK_DURATION = 2200;

    const WISHLIST_ADD_LABEL = wishlistLabel.textContent.trim();
    const WISHLIST_REMOVE_LABEL = "حذف از علاقه مندی";
    const DEFAULT_ADD_LABEL = addToCartLabel.textContent.trim();
    const DEFAULT_SHARE_LABEL = shareLabel.textContent.trim();
    const DEFAULT_SIZE = sizeOptions.find(option => option.hasAttribute("data-default-size"))
        || sizeOptions[0]
        || null;

    const priceFormatter = new Intl.NumberFormat("en-US");
    const supportsInert = "inert" in HTMLElement.prototype;
    const backgroundElements = Array.from(document.querySelectorAll("header, main, footer"));

    const product = {
        id: popup.dataset.productId || "delsana-product",
        name: title ? title.textContent.trim() : "",
        basePrice: parsePrice(popup.dataset.unitPrice || priceValue.textContent),
    };

    const gallery = thumbnails.map((thumbnail, index) => {
        const image = thumbnail.querySelector("img");
        return {
            src: image ? image.getAttribute("src") : "",
            alt: image ? image.getAttribute("alt") || `تصویر محصول ${index + 1}` : "",
        };
    });

    const state = {
        quantity: MIN_QUANTITY,
        galleryIndex: 0,
        trigger: null,
    };

    const feedbackTimers = new Map();

    /* ---------- Helpers ---------- */

    function toLatinDigits(value) {
        return String(value)
            .replace(/[۰-۹]/g, digit => "۰۱۲۳۴۵۶۷۸۹".indexOf(digit))
            .replace(/[٠-٩]/g, digit => "٠١٢٣٤٥٦٧٨٩".indexOf(digit));
    }

    function parsePrice(value) {
        const digits = toLatinDigits(value).replace(/[^\d]/g, "");
        const parsed = Number(digits);
        return Number.isFinite(parsed) ? parsed : 0;
    }

    function formatPrice(value) {
        return priceFormatter.format(value);
    }

    function readStorage(key, fallback) {
        try {
            const raw = localStorage.getItem(key);
            return raw ? JSON.parse(raw) : fallback;
        } catch (error) {
            return fallback;
        }
    }

    function writeStorage(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.warn(`Could not save ${key} in localStorage.`, error);
            return false;
        }
    }

    function announce(message) {
        if (!status) return;
        status.textContent = message;
    }

    function getSelectedSize() {
        return sizeOptions.find(option => option.classList.contains("selected")) || DEFAULT_SIZE;
    }

    function getUnitPrice() {
        const selectedSize = getSelectedSize();
        if (!selectedSize) return product.basePrice;

        const variantPrice = parsePrice(selectedSize.dataset.unitPrice || "");
        return variantPrice > 0 ? variantPrice : product.basePrice;
    }

    function getWishlist() {
        const stored = readStorage(STORAGE_KEYS.wishlist, []);
        return Array.isArray(stored) ? stored.filter(item => typeof item === "string") : [];
    }

    function isWishlisted() {
        return getWishlist().includes(product.id);
    }

    /* ---------- Popup state ---------- */

    function updatePrice() {
        priceValue.textContent = formatPrice(getUnitPrice() * state.quantity);
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
        if (!option) return;

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
            ? `${product.name}، ${currentImage.alt}`
            : currentImage.alt;

        thumbnails.forEach((thumbnail, thumbnailIndex) => {
            const isCurrent = thumbnailIndex === state.galleryIndex;
            const thumbnailImage = thumbnail.querySelector("img");

            if (isCurrent) {
                thumbnail.setAttribute("aria-current", "true");
            } else {
                thumbnail.removeAttribute("aria-current");
            }

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
        if (existingFeedback) {
            window.clearTimeout(existingFeedback.timer);
        }

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
        setSize(DEFAULT_SIZE);
        setQuantity(MIN_QUANTITY);
        setGallery(0);
        syncWishlistState();
    }

    /* ---------- Cart, wishlist, and sharing ---------- */

    function addToCart() {
        const selectedSize = getSelectedSize();
        const item = {
            id: product.id,
            name: product.name,
            size: selectedSize ? selectedSize.textContent.trim() : "",
            quantity: state.quantity,
            unitPrice: getUnitPrice(),
            image: heroImage.getAttribute("src") || "",
        };

        const storedCart = readStorage(STORAGE_KEYS.cart, []);
        const cart = Array.isArray(storedCart) ? storedCart : [];
        const existingItem = cart.find(
            cartItem => cartItem.id === item.id && cartItem.size === item.size
        );

        if (existingItem) {
            existingItem.quantity += item.quantity;
        } else {
            cart.push(item);
        }

        const saved = writeStorage(STORAGE_KEYS.cart, cart);

        window.dispatchEvent(new CustomEvent("delsana:cart:add", { detail: item }));
        showFeedback(
            addToCartLabel,
            DEFAULT_ADD_LABEL,
            saved ? "به سبد خرید اضافه شد" : "ذخیره نشد",
            saved ? "به سبد خرید اضافه شد" : "ذخیره سبد خرید ممکن نشد"
        );
    }

    function toggleWishlist() {
        const wishlist = getWishlist();
        const index = wishlist.indexOf(product.id);

        if (index >= 0) {
            wishlist.splice(index, 1);
        } else {
            wishlist.push(product.id);
        }

        const saved = writeStorage(STORAGE_KEYS.wishlist, wishlist);
        syncWishlistState();

        window.dispatchEvent(new CustomEvent("delsana:wishlist:change", {
            detail: {
                id: product.id,
                active: index < 0,
                wishlist: [...wishlist],
            },
        }));

        if (!saved) {
            announce("ذخیره علاقه مندی ممکن نشد");
            return;
        }

        announce(
            index >= 0
                ? "از علاقه مندی حذف شد"
                : "به علاقه مندی اضافه شد"
        );
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
            text: product.name
                ? `${product.name} — ${formatPrice(getUnitPrice())} تومان`
                : document.title,
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

    function openPopup(trigger) {
        if (!overlay.hidden) return;

        state.trigger = trigger;
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
            openPopup(button);
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

    resetPopup();
})();
