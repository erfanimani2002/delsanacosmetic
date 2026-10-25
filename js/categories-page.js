/* ==========================================================
   Categories page counts
   ========================================================== */

(() => {
    "use strict";

    const catalog = window.DelsanaCatalog;
    if (!catalog) return;

    document.querySelectorAll("[data-category-row]").forEach(row => {
        const category = catalog.getCategory(row.dataset.categoryRow);
        const count = row.querySelector("[data-category-count]");
        if (!category || !count) return;

        const productCount = catalog.getCategoryCount(category.slug);
        count.textContent = `${productCount} محصول`;
    });
})();
