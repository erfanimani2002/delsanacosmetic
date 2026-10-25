/* ==========================================================
   Delsana contact message service
   Front-end mock today. Replace send() with a real endpoint later.
   ========================================================== */

(() => {
    "use strict";

    const STORAGE_KEY = "delsana:messages";

    function readMessages() {
        try {
            const raw = window.localStorage.getItem(STORAGE_KEY);
            const messages = raw ? JSON.parse(raw) : [];
            return Array.isArray(messages) ? messages : [];
        } catch (error) {
            return [];
        }
    }

    function writeMessages(messages) {
        try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
            return true;
        } catch (error) {
            console.warn("Could not save the contact message locally.", error);
            return false;
        }
    }

    function send(messageDraft) {
        return new Promise(resolve => {
            const message = {
                id: `MSG-${Date.now().toString(36).toUpperCase()}`,
                createdAt: new Date().toISOString(),
                status: "new",
                name: String(messageDraft?.name || "").trim(),
                phone: String(messageDraft?.phone || "").trim(),
                message: String(messageDraft?.message || "").trim(),
            };

            window.setTimeout(() => {
                const messages = readMessages();
                messages.unshift(message);
                writeMessages(messages);
                resolve(message);
            }, 260);
        });
    }

    window.DelsanaMessages = {
        storageKey: STORAGE_KEY,
        send,
        getMessages: readMessages,
    };
})();
