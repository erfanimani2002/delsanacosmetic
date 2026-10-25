/* ==========================================================
   Contact page form
   Front-end mock submission with accessible validation.
   ========================================================== */

(() => {
    "use strict";

    const messages = window.DelsanaMessages;
    const form = document.querySelector("[data-contact-form]");
    if (!messages || !form) return;

    const errorSummary = document.querySelector("[data-contact-error-summary]");
    const errorList = document.querySelector("[data-contact-error-list]");
    const status = document.querySelector("[data-contact-status]");
    const submitButton = document.querySelector("[data-contact-submit]");
    const success = document.querySelector("[data-contact-success]");
    const successHeading = document.querySelector("[data-contact-success-heading]");
    const resetButton = document.querySelector("[data-contact-reset]");

    const fields = {
        name: form.querySelector("#contactName"),
        phone: form.querySelector("#contactPhone"),
        message: form.querySelector("#contactMessage"),
    };

    const errors = {
        name: form.querySelector("#contactNameError"),
        phone: form.querySelector("#contactPhoneError"),
        message: form.querySelector("#contactMessageError"),
    };

    const labels = {
        name: "نام و نام خانوادگی",
        phone: "شماره تماس",
        message: "پیام",
    };

    let submitting = false;

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
        const problems = [];
        const name = fields.name.value.trim();
        const phone = normalizePhone(fields.phone.value);
        const message = fields.message.value.trim();

        if (name.length < 2) {
            setError("name", "نام را کامل وارد کنید.");
            problems.push({ id: "contactName", label: labels.name });
        }

        if (!/^09\d{9}$/.test(phone)) {
            setError("phone", "شماره موبایل معتبر وارد کنید. مثال: ۰۹۱۲۱۲۳۴۵۶۷");
            problems.push({ id: "contactPhone", label: labels.phone });
        }

        if (message.length < 10) {
            setError("message", "پیام را کمی کامل‌تر بنویسید.");
            problems.push({ id: "contactMessage", label: labels.message });
        }

        if (problems.length && errorSummary && errorList) {
            errorList.innerHTML = problems
                .map(problem => `<li><a href="#${problem.id}">${problem.label}</a></li>`)
                .join("");
            errorSummary.hidden = false;
            errorSummary.focus({ preventScroll: false });
        }

        return { valid: problems.length === 0, name, phone, message };
    }

    async function handleSubmit(event) {
        event.preventDefault();
        if (submitting) return;

        const result = validate();
        if (!result.valid) {
            announce("لطفاً خطاهای فرم را برطرف کنید.");
            return;
        }

        submitting = true;
        submitButton.disabled = true;
        submitButton.textContent = "در حال ارسال...";
        announce("در حال ارسال پیام...");

        try {
            await messages.send({
                name: result.name,
                phone: result.phone,
                message: result.message,
            });

            form.hidden = true;
            success.hidden = false;
            if (successHeading) successHeading.focus({ preventScroll: false });
            announce("پیام شما ثبت شد.");
        } catch (error) {
            announce("ارسال پیام ممکن نشد. لطفاً دوباره تلاش کنید یا با ما تماس بگیرید.");
            submitButton.disabled = false;
            submitButton.textContent = "تلاش دوباره";
        } finally {
            submitting = false;
        }
    }

    form.addEventListener("submit", handleSubmit);

    if (resetButton) {
        resetButton.addEventListener("click", () => {
            form.reset();
            clearErrors();
            success.hidden = true;
            form.hidden = false;
            submitButton.disabled = false;
            submitButton.textContent = "ارسال پیام";
            announce("");
            fields.name.focus();
        });
    }
})();
