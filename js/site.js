/* ==========================================================
   Delsana shared UI behavior
   Header actions, mobile drawer, counts, toast and overlay helpers.
   ========================================================== */

(() => {
    "use strict";

    const ICONS = {
        close: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',
        home: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/></svg>',
        grid: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>',
        basket: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 11-1 9"/><path d="m19 11-4-7"/><path d="M2 11h20"/><path d="m3.5 11 1.6 7.4a2 2 0 0 0 2 1.6h9.8a2 2 0 0 0 2-1.6l1.7-7.4"/><path d="M4.5 15.5h15"/><path d="m5 11 4-7"/><path d="m9 11 1 9"/></svg>',
        heart: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5"/></svg>',
        book: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/></svg>',
        truck: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg>',
        package: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>',
        help: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>',
        info: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>',
        phone: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',
        whatsapp: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21"/><path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1"/></svg>',
        chevron: '<svg class="menu-chevron" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg>',
    };

    const ui = {
        lockScroll() {
            document.documentElement.classList.add("modal-open");
            document.body.classList.add("modal-open");
        },
        unlockScroll() {
            document.documentElement.classList.remove("modal-open");
            document.body.classList.remove("modal-open");
        },
        getFocusable(container) {
            if (!container) return [];
            return Array.from(container.querySelectorAll(
                'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
            )).filter(element => element.getClientRects().length > 0);
        },
        trapTab(event, container) {
            if (event.key !== "Tab") return;
            const focusable = ui.getFocusable(container);
            if (!focusable.length) return;

            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            const active = document.activeElement;
            const inside = container.contains(active);

            if (event.shiftKey && (!inside || active === first)) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && (!inside || active === last)) {
                event.preventDefault();
                first.focus();
            }
        },
        setBackgroundInert(value) {
            if (!("inert" in HTMLElement.prototype)) return;
            document.querySelectorAll("header, main, footer").forEach(element => {
                element.inert = value;
            });
        },
        toast(message) {
            let toast = document.getElementById("siteToast");
            if (!toast) {
                toast = document.createElement("div");
                toast.id = "siteToast";
                toast.className = "site-toast";
                toast.setAttribute("role", "status");
                toast.setAttribute("aria-live", "polite");
                document.body.appendChild(toast);
            }

            toast.textContent = message;
            toast.classList.add("is-visible");
            window.clearTimeout(toast._hideTimer);
            toast._hideTimer = window.setTimeout(() => {
                toast.classList.remove("is-visible");
            }, 2400);
        },
    };

    window.DelsanaUI = ui;

    const menuLinks = [
        {
            title: "منوی اصلی",
            links: [
                { page: "home", href: "index.html", label: "خانه", icon: "home" },
                { page: "categories", href: "categories.html", label: "دسته‌بندی‌ها", icon: "grid" },
                { page: "cart", href: "cart.html", label: "سبد خرید", icon: "basket", count: "cart" },
                { page: "wishlist", href: "wishlist.html", label: "علاقه‌مندی‌ها", icon: "heart", count: "wishlist" },
            ],
        },
        {
            title: "راهنما و پشتیبانی",
            links: [
                { page: "order-guide", href: "order-guide.html", label: "راهنمای سفارش", icon: "book" },
                { page: "shipping", href: "shipping.html", label: "روش‌های ارسال", icon: "truck" },
                { page: "packaging", href: "packaging.html", label: "انواع بسته‌بندی", icon: "package" },
                { page: "faq", href: "faq.html", label: "سؤالات متداول", icon: "help" },
            ],
        },
        {
            title: "دلسانا",
            links: [
                { page: "about", href: "about.html", label: "درباره ما", icon: "info" },
                { page: "contact", href: "contact.html", label: "تماس با ما", icon: "phone" },
            ],
        },
    ];

    function renderMenuLink(link, currentPage) {
        const active = link.page === currentPage;
        const count = link.count
            ? '<span class="menu-count" data-menu-count="' + link.count + '" hidden>0</span>'
            : "";

        return `
            <a class="menu-link${active ? " is-active" : ""}"
               href="${link.href}"
               data-nav-page="${link.page}"
               ${active ? 'aria-current="page"' : ""}>
                ${ICONS[link.icon]}
                <span>${link.label}</span>
                ${count}
                ${ICONS.chevron}
            </a>
        `;
    }

    function createMenu() {
        if (document.getElementById("siteMenuOverlay")) return;

        const currentPage = document.body.dataset.page || "";
        const groups = menuLinks.map(group => `
            <div class="menu-group">
                <div class="menu-group-title">${group.title}</div>
                ${group.links.map(link => renderMenuLink(link, currentPage)).join("")}
            </div>
        `).join("");

        const overlay = document.createElement("div");
        overlay.className = "menu-overlay";
        overlay.id = "siteMenuOverlay";
        overlay.hidden = true;
        overlay.innerHTML = `
            <aside class="site-menu" id="siteMenu" role="dialog" aria-modal="true"
                   aria-labelledby="siteMenuTitle" tabindex="-1">
                <div class="site-menu-head">
                    <img src="../assets/logos/logo.webp" alt="دلسانا">
                    <h2 class="visually-hidden" id="siteMenuTitle">منوی دلسانا</h2>
                    <button type="button" class="menu-close" data-menu-close aria-label="بستن منو">
                        ${ICONS.close}
                    </button>
                </div>
                <nav class="menu-nav" aria-label="منوی اصلی سایت">
                    ${groups}
                </nav>
                <div class="menu-contact">
                    <div class="menu-contact-title">همراه شما هستیم</div>
                    <a class="menu-phone" href="tel:+989129451580">
                        ${ICONS.phone}
                        <span dir="ltr">۰۹۱۲۹۴۵۱۵۸۰</span>
                    </a>
                    <div class="menu-socials">
                        <a class="menu-social-link" href="https://wa.me/989129451580"
                           target="_blank" rel="noopener" aria-label="واتساپ دلسانا">
                            ${ICONS.whatsapp}
                        </a>
                    </div>
                </div>
            </aside>
        `;

        document.body.appendChild(overlay);
    }

    createMenu();

    const menuOverlay = document.getElementById("siteMenuOverlay");
    const menuPanel = document.getElementById("siteMenu");
    const menuClose = menuOverlay ? menuOverlay.querySelector("[data-menu-close]") : null;
    const menuTrigger = document.querySelector("[data-menu-open]");
    const accountTrigger = document.querySelector("[data-account-link]");
    const searchTrigger = document.querySelector("[data-search-link]");

    let lastMenuTrigger = null;

    function updateMenuCounts() {
        const store = window.DelsanaStore;
        const cartCount = store ? store.getCartCount() : 0;
        const wishlistCount = store ? store.getWishlist().length : 0;

        document.querySelectorAll("[data-menu-count]").forEach(element => {
            const isCart = element.dataset.menuCount === "cart";
            const count = isCart ? cartCount : wishlistCount;
            element.textContent = String(count);
            element.hidden = count < 1;
        });
    }

    function openMenu(trigger) {
        if (!menuOverlay || !menuPanel || !menuOverlay.hidden) return;

        lastMenuTrigger = trigger || menuTrigger;
        menuOverlay.hidden = false;
        ui.lockScroll();
        ui.setBackgroundInert(true);
        if (lastMenuTrigger) lastMenuTrigger.setAttribute("aria-expanded", "true");
        menuClose.focus({ preventScroll: true });
    }

    function closeMenu() {
        if (!menuOverlay || menuOverlay.hidden) return;

        menuOverlay.hidden = true;
        ui.unlockScroll();
        ui.setBackgroundInert(false);
        if (lastMenuTrigger) {
            lastMenuTrigger.setAttribute("aria-expanded", "false");
            lastMenuTrigger.focus();
        }
        lastMenuTrigger = null;
    }

    if (menuTrigger) {
        menuTrigger.setAttribute("aria-expanded", "false");
        menuTrigger.setAttribute("aria-controls", "siteMenu");
        menuTrigger.addEventListener("click", event => {
            event.preventDefault();
            openMenu(menuTrigger);
        });
    }

    if (menuClose) menuClose.addEventListener("click", closeMenu);

    if (menuOverlay) {
        menuOverlay.addEventListener("click", event => {
            if (event.target === menuOverlay) closeMenu();
        });
    }

    document.addEventListener("keydown", event => {
        if (!menuOverlay || menuOverlay.hidden) return;
        if (event.key === "Escape") {
            event.preventDefault();
            closeMenu();
            return;
        }
        ui.trapTab(event, menuPanel);
    });

    if (accountTrigger) {
        accountTrigger.addEventListener("click", () => {
            ui.toast("حساب کاربری به‌زودی در دسترس است");
        });
    }

    if (searchTrigger) {
        searchTrigger.addEventListener("click", event => {
            if (document.body.dataset.page !== "home") return;
            const input = document.querySelector(".search-box input");
            if (!input) return;
            event.preventDefault();
            document.getElementById("products")?.scrollIntoView({ behavior: "smooth", block: "start" });
            window.setTimeout(() => input.focus({ preventScroll: true }), 260);
        });
    }

    document.querySelectorAll('[data-nav-page="cart"]').forEach(link => {
        if (document.body.dataset.page === "cart") link.setAttribute("aria-current", "page");
    });
    document.querySelectorAll('[data-nav-page="wishlist"]').forEach(link => {
        if (document.body.dataset.page === "wishlist") link.setAttribute("aria-current", "page");
    });

    updateMenuCounts();
    window.addEventListener("delsana:cart:change", updateMenuCounts);
    window.addEventListener("delsana:wishlist:change", updateMenuCounts);
    window.addEventListener("storage", event => {
        if (event.key === "delsana:cart" || event.key === "delsana:wishlist") {
            updateMenuCounts();
        }
    });
})();
