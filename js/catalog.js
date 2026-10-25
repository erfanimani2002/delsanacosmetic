/* ==========================================================
   Delsana demo product catalog
   Replace this file with API data when the backend is ready.
   ========================================================== */

(() => {
    "use strict";

    const productImage = number =>
        `../assets/images/products/product-${number}.webp`;

    const gallery = [
        productImage(1),
        productImage(2),
        productImage(3),
        productImage(4),
        productImage(5),
    ];

    const categories = [
        {
            slug: "skincare",
            name: "مراقبت پوستی",
            description: "پاک‌کننده، سرم، مرطوب‌کننده و مراقبت روزانه",
            image: "../assets/images/categories/skincare.webp",
        },
        {
            slug: "makeup",
            name: "آرایشی",
            description: "رژ، کرم‌پودر و محصولات رنگ",
            image: "../assets/images/categories/makeup.webp",
        },
        {
            slug: "haircare",
            name: "مراقبت مو",
            description: "شامپو، ماسک و روغن‌های مغذی",
            image: "../assets/images/categories/haircare.webp",
        },
        {
            slug: "fragrance",
            name: "عطر",
            description: "رایحه‌های گلی و ماندگار",
            image: "../assets/images/categories/fragrance.webp",
        },
        {
            slug: "tools",
            name: "وسایل جانبی",
            description: "براش، اسفنج و اکسسوری‌های آرایشی",
            image: "../assets/images/categories/tools.webp",
        },
    ];

    const products = [
        {
            id: "hydra-balance",
            name: "کرم صورت هیدرا بالانس",
            brand: "دلسانا",
            category: "skincare",
            categoryLabel: "مراقبت پوستی",
            price: 1850000,
            oldPrice: 2400000,
            image: productImage(1),
            gallery,
            sizes: [
                { label: "50 ml", price: 1250000 },
                { label: "100 ml", price: 1850000, default: true },
            ],
            attributes: ["آبرسانی عمیق", "پوست نرم و یکدست", "مناسب همه پوست‌ها"],
            badges: ["صد در صد طبیعی", "آب‌رسانی عمیق", "بدون پارابن"],
        },
        {
            id: "vitamin-c-serum",
            name: "سرم روشن‌کننده ویتامین C",
            brand: "دلسانا",
            category: "skincare",
            categoryLabel: "مراقبت پوستی",
            price: 1480000,
            oldPrice: 1850000,
            image: productImage(2),
            gallery,
            sizes: [
                { label: "30 ml", price: 1480000, default: true },
            ],
            attributes: ["روشن‌کننده پوست", "آنتی‌اکسیدان قوی", "بافت سبک"],
            badges: ["ویتامین C", "ضد لک", "جذب سریع"],
        },
        {
            id: "velvet-lipstick",
            name: "رژ لب مات مخملی",
            brand: "دلسانا بیوتی",
            category: "makeup",
            categoryLabel: "آرایشی",
            price: 690000,
            oldPrice: 850000,
            image: productImage(3),
            gallery,
            sizes: [
                { label: "استاندارد", price: 690000, default: true },
            ],
            attributes: ["پوشش یکدست", "پایان مات", "بافت سبک"],
            badges: ["رنگ ماندگار", "بافت مخملی", "بدون خشکی"],
        },
        {
            id: "argan-hair-oil",
            name: "روغن مو آرگان",
            brand: "دلسانا نیچر",
            category: "haircare",
            categoryLabel: "مراقبت مو",
            price: 980000,
            oldPrice: 1250000,
            image: productImage(4),
            gallery,
            sizes: [
                { label: "100 ml", price: 980000, default: true },
            ],
            attributes: ["تغذیه ساقه مو", "کاهش خشکی", "درخشش طبیعی"],
            badges: ["روغن آرگان", "ضد وز", "بدون سیلیکون"],
        },
        {
            id: "floral-perfume",
            name: "عطر گلی دلسانا",
            brand: "دلسانا",
            category: "fragrance",
            categoryLabel: "عطر",
            price: 2250000,
            oldPrice: 2700000,
            image: productImage(5),
            gallery,
            sizes: [
                { label: "50 ml", price: 2250000, default: true },
            ],
            attributes: ["رایحه گلی", "ماندگاری بالا", "مناسب روز و شب"],
            badges: ["رایحه شرقی", "ماندگار", "بسته‌بندی ویژه"],
        },
        {
            id: "brush-set",
            name: "ست براش آرایشی",
            brand: "دلسانا بیوتی",
            category: "tools",
            categoryLabel: "وسایل جانبی",
            price: 450000,
            oldPrice: 580000,
            image: productImage(1),
            gallery,
            sizes: [
                { label: "ست کامل", price: 450000, default: true },
            ],
            attributes: ["الیاف نرم", "پخش یکدست", "قابل شست‌وشو"],
            badges: ["ست کامل", "بافت نرم", "کیف حمل"],
        },
        {
            id: "eye-contour-cream",
            name: "کرم دور چشم",
            brand: "دلسانا",
            category: "skincare",
            categoryLabel: "مراقبت پوستی",
            price: 1150000,
            oldPrice: 1400000,
            image: productImage(2),
            gallery,
            sizes: [
                { label: "15 ml", price: 1150000, default: true },
            ],
            attributes: ["کاهش تیرگی", "آبرسانی دور چشم", "بافت سبک"],
            badges: ["ضد پف", "مرطوب‌کننده", "مناسب روزانه"],
        },
        {
            id: "repair-hair-mask",
            name: "ماسک ترمیم‌کننده مو",
            brand: "دلسانا نیچر",
            category: "haircare",
            categoryLabel: "مراقبت مو",
            price: 790000,
            oldPrice: 990000,
            image: productImage(3),
            gallery,
            sizes: [
                { label: "200 ml", price: 790000, default: true },
            ],
            attributes: ["ترمیم موهای آسیب‌دیده", "نرمی و درخشش", "استفاده هفتگی"],
            badges: ["ترمیم‌کننده", "آبرسانی", "بوی ملایم"],
        },
    ].map(product => ({
        ...product,
        gallery: product.gallery.map((src, index) => ({
            src,
            alt: `تصویر ${index + 1} از ${product.name}`,
        })),
        defaultSize: product.sizes.find(size => size.default) || product.sizes[0],
    }));

    const productMap = new Map(products.map(product => [product.id, product]));

    function getProduct(id) {
        return productMap.get(String(id || "").trim()) || null;
    }

    function getCategory(slug) {
        return categories.find(category => category.slug === slug) || null;
    }

    function getProductsByCategory(slug) {
        return products.filter(product => product.category === slug);
    }

    function getCategoryCount(slug) {
        return getProductsByCategory(slug).length;
    }

    function getDefaultSize(product) {
        if (!product || !Array.isArray(product.sizes) || !product.sizes.length) {
            return { label: "", price: product ? product.price : 0 };
        }
        return product.sizes.find(size => size.default) || product.sizes[0];
    }

    window.DelsanaCatalog = {
        categories,
        products,
        getProduct,
        getCategory,
        getProductsByCategory,
        getCategoryCount,
        getDefaultSize,
    };
})();
