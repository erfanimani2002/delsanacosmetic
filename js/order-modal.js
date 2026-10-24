
const modal = document.getElementById("orderModal");

const productName = document.getElementById("orderProductName");
const productBrand = document.getElementById("orderProductBrand");
const productImage = document.getElementById("orderProductImage");
const productPrice = document.getElementById("orderProductPrice");
const quantityDisplay = document.getElementById("orderQuantity");
const totalPrice = document.getElementById("orderTotalPrice");

let quantity = 1;
let unitPrice = 0;
let previousButton = null;

const numberFormat = new Intl.NumberFormat("fa-IR");

function formatPrice(price) {
    return `${numberFormat.format(price)} تومان`;
}

function updateTotal() {
    quantityDisplay.textContent = numberFormat.format(quantity);
    productPrice.textContent = formatPrice(unitPrice);
    totalPrice.textContent = formatPrice(unitPrice * quantity);
}

function openModal(button) {
    const card = button.closest(".product-card");
    if (!card) return;

    const name = card.querySelector(".product-info h3")?.textContent.trim();
    const brand = card.querySelector(".product-brand")?.textContent.trim();
    const image = card.querySelector(".product-image img")?.src;
    const priceText = card.querySelector(".product-prices strong")
        ?.textContent.replace(/[^0-9]/g, "");

    const price = Number(priceText);

    if (!name || !image || !Number.isFinite(price) || price <= 0) {
        console.error("اطلاعات محصول یا قیمت معتبر نیست.");
        return;
    }

    previousButton = button;
    quantity = 1;
    unitPrice = price;

    productName.textContent = name;
    productBrand.textContent = brand || "";
    productImage.src = image;
    productImage.alt = name;

    updateTotal();

    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");

    modal.querySelector(".order-modal__close").focus();
}

function closeModal() {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");

    if (previousButton) previousButton.focus();
}

document.querySelectorAll(".order-btn").forEach(button => {
    button.addEventListener("click", event => {
        event.preventDefault();
        openModal(button);
    });
});

modal.querySelectorAll("[data-close-modal]").forEach(element => {
    element.addEventListener("click", closeModal);
});

document.getElementById("quantityPlus").addEventListener("click", () => {
    quantity++;
    updateTotal();
});

document.getElementById("quantityMinus").addEventListener("click", () => {
    if (quantity > 1) {
        quantity--;
        updateTotal();
    }
});

document.addEventListener("keydown", event => {
    if (event.key === "Escape" && modal.classList.contains("is-open")) {
        closeModal();
    }
});
