/* ==========================================================
   Cart checkout sheet
   Front-end mock order flow with validation and success state.
   ========================================================== */

(() => {
    "use strict";

    const store = window.DelsanaStore;
    const orders = window.DelsanaOrders;
    const overlay = document.getElementById("checkoutOverlay");
    const openButton = document.querySelector("[data-checkout-open]");
    if (!store || !orders || !overlay || !openButton) return;

    const sheet = overlay.querySelector(".checkout-sheet");
    const closeButtons = Array.from(overlay.querySelectorAll("[data-checkout-close]"));
    const formView = overlay.querySelector("[data-checkout-form-view]");
    const successView = overlay.querySelector("[data-checkout-success]");
    const form = overlay.querySelector("[data-checkout-form]");
    const errorSummary = overlay.querySelector("[data-checkout-error-summary]");
    const errorList = overlay.querySelector("[data-checkout-error-list]");
    const submitButton = overlay.querySelector("[data-checkout-submit]");
    const status = overlay.querySelector("[data-checkout-status]");
    const summaryItems = overlay.querySelector("[data-checkout-summary-items]");
    const summaryTotal = overlay.querySelector("[data-checkout-summary-total]");
    const successOrderId = overlay.querySelector("[data-checkout-order-id]");
    const successHeading = overlay.querySelector("[data-checkout-success-heading]");

    const fields = {
        name: form.querySelector("#checkoutName"),
        phone: form.querySelector("#checkoutPhone"),
        address: form.querySelector("#checkoutAddress"),
        note: form.querySelector("#checkoutNote"),
    };

    const errors = {
        name: form.querySelector("#checkoutNameError"),
        phone: form.querySelector("#checkoutPhoneError"),
        address: form.querySelector("#checkoutAddressError"),
    };

    let lastTrigger = null;
    let submitting = false;

    const fieldLabels = {
        name: "نام و نام خانوادگی",
        phone: "شماره تماس",
        address: "آدرس",
    };

    function toLatinDigits(value) {
        return String(value || "")
            .replace(/[۰-۹]/g, digit => "۰۱۲۳۴۵۶۷۸۹".indexOf(digit))
            .replace(/[٠-٩]/g, digit => "٠١٢٣٤٥٦٧٨٩".indexOf(digit));
    }

    function normalizePhone(value) {
        let phone = toLatinDigits(value).replace(/[^\d+]/g, "");
        if (phone.startsWith("+98")) phone = `0${phone.slice(3)}`;
        if (phone.startsWith("0098")) phone = `0${phone.slice(4)}`;
        if (phone.startsWith("98") && phone.length === 12) phone = `0${phone.slice(2)}`;
        return phone;
    }

    function announce(message) {
        if (status) status.textContent = message;
    }

    function setError(name, message) {
        const field = fields[name];
        const error = errors[name];
        if (!field || !error) return;

        field.setAttribute("aria-invalid", "true");
        error.textContent = message;
    }

    function clearErrors() {
        Object.entries(fields).forEach(([name, field]) => {
            if (field) field.removeAttribute("aria-invalid");
            if (errors[name]) errors[name].textContent = "";
        });

        if (errorSummary) errorSummary.hidden = true;
        if (errorList) errorList.innerHTML = "";
    }

    function validate() {
        clearErrors();
        const messages = [];
        const name = fields.name.value.trim();
        const phone = normalizePhone(fields.phone.value);
        const address = fields.address.value.trim();

        if (name.length < 2) {
            setError("name", "نام را کامل وارد کنید.");
            messages.push({ name: "name", label: fieldLabels.name });
        }

        if (!/^09\d{9}$/.test(phone)) {
            setError("phone", "شماره موبایل معتبر وارد کنید. مثال: ۰۹۱۲۱۲۳۴۵۶۷");
            messages.push({ name: "phone", label: fieldLabels.phone });
        }

        if (address.length < 10) {
            setError("address", "آدرس را کامل‌تر وارد کنید.");
            messages.push({ name: "address", label: fieldLabels.address });
        }

        if (messages.length && errorSummary && errorList) {
            errorList.innerHTML = messages
                .map(item => `<li><a href="#checkout${item.name[0].toUpperCase()}${item.name.slice(1)}">${item.label}</a></li>`)
                .join("");
            errorSummary.hidden = false;
            errorSummary.focus({ preventScroll: false });
        }

        return { valid: messages.length === 0, name, phone, address };
    }

    function updateSummary() {
        const cart = store.getCart();
        const count = cart.reduce((total, item) => total + item.quantity, 0);
        const total = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

        if (summaryItems) summaryItems.textContent = `${count} قلم`;
        if (summaryTotal) summaryTotal.textContent = `${store.formatPrice(total)} تومان`;
    }

    function openSheet(trigger) {
        if (overlay.hidden === false) return;
        if (store.getCart().length === 0) {
            window.DelsanaUI?.toast("سبد خرید شما خالی است");
            return;
        }

        lastTrigger = trigger || openButton;
        submitting = false;
        form.reset();
        clearErrors();
        announce("");
        updateSummary();

        try {
            const customer = JSON.parse(window.localStorage.getItem("delsana:customer") || "null");
            if (customer && typeof customer === "object") {
                fields.name.value = customer.name || "";
                fields.phone.value = customer.phone || "";
                fields.address.value = customer.address || "";
            }
        } catch (error) {
            /* Ignore malformed draft data. */
        }

        formView.hidden = false;
        successView.hidden = true;
        submitButton.disabled = false;
        submitButton.textContent = "ثبت سفارش";

        overlay.hidden = false;
        window.DelsanaUI?.lockScroll();
        window.DelsanaUI?.setBackgroundInert(true);
        window.requestAnimationFrame(() => fields.name.focus({ preventScroll: true }));
    }

    function closeSheet() {
        if (overlay.hidden || submitting) return;

        overlay.hidden = true;
        window.DelsanaUI?.unlockScroll();
        window.DelsanaUI?.setBackgroundInert(false);

        if (lastTrigger) lastTrigger.focus();
        lastTrigger = null;
    }

    async function handleSubmit(event) {
        event.preventDefault();
        if (submitting) return;

        const result = validate();
        if (!result.valid) {
            announce("لطفاً خطاهای فرم را برطرف کنید.");
            return;
        }

        const cart = store.getCart();
        const total = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
        const customer = {
            name: result.name,
            phone: result.phone,
            address: result.address,
            note: fields.note.value.trim(),
        };

        submitting = true;
        submitButton.disabled = true;
        submitButton.textContent = "در حال ثبت...";
        announce("در حال ثبت سفارش...");

        try {
            window.localStorage.setItem("delsana:customer", JSON.stringify(customer));

            const order = await orders.createOrder({
                items: cart,
                customer,
                totals: {
                    subtotal: total,
                    total,
                    currency: "IRT",
                },
            });

            store.clearCart();

            formView.hidden = true;
            successView.hidden = false;
            if (successOrderId) successOrderId.textContent = order.id;
            if (successHeading) successHeading.focus({ preventScroll: true });
            announce(`سفارش ${order.id} ثبت شد.`);
            submitting = false;
        } catch (error) {
            submitting = false;
            submitButton.disabled = false;
            submitButton.textContent = "تلاش دوباره";
            announce("ثبت سفارش ممکن نشد. دوباره تلاش کنید.");
        }
    }

    openButton.addEventListener("click", () => openSheet(openButton));
    closeButtons.forEach(button => button.addEventListener("click", closeSheet));
    form.addEventListener("submit", handleSubmit);

    overlay.addEventListener("click", event => {
        if (event.target === overlay) closeSheet();
    });

    document.addEventListener("keydown", event => {
        if (overlay.hidden) return;

        if (event.key === "Escape") {
            event.preventDefault();
            closeSheet();
            return;
        }

        window.DelsanaUI?.trapTab(event, sheet);
    });
})();
