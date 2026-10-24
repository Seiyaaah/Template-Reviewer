import { initRouter } from "./router.js";

document.addEventListener("DOMContentLoaded", async () => {
    console.log("🧠 Starting VoiLearn...");

    initDarkMode();
    await registerServiceWorker();
    initRouter();

    console.log("✅ VoiLearn Ready");
});

/* ==========================================================
   SERVICE WORKER
========================================================== */

async function registerServiceWorker() {
    if (!("serviceWorker" in navigator)) return;

    try {
        const registration = await navigator.serviceWorker.register("./service-worker.js");

        console.log("✅ Service Worker Registered");

        // Check for updates immediately
        registration.update();

        // Check every hour
        setInterval(() => {
            registration.update();
        }, 1000 * 60 * 60);

        registration.addEventListener("updatefound", () => {
            const installingWorker = registration.installing;

            if (!installingWorker) return;

            installingWorker.addEventListener("statechange", () => {
                if (
                    installingWorker.state === "installed" &&
                    navigator.serviceWorker.controller
                ) {
                    const update = confirm(
                        "A new version of VoiLearn is available.\n\nReload now?"
                    );

                    if (update) {
                        window.location.reload();
                    }
                }
            });
        });

        let refreshing = false;

        navigator.serviceWorker.addEventListener("controllerchange", () => {
            if (refreshing) return;

            refreshing = true;
            window.location.reload();
        });

    } catch (err) {
        console.error("❌ Failed to register Service Worker:", err);
    }
}

/* ==========================================================
   DARK MODE
========================================================== */

function initDarkMode() {
    const button = document.getElementById("themeToggleBtn");

    if (!button) return;

    const savedTheme =
        localStorage.getItem("voilearn-theme") || "light";

    applyTheme(savedTheme);

    button.addEventListener("click", () => {
        const current =
            document.documentElement.getAttribute("data-theme");

        applyTheme(current === "dark" ? "light" : "dark");
    });
}

function applyTheme(theme) {
    const button = document.getElementById("themeToggleBtn");

    if (theme === "dark") {
        document.documentElement.setAttribute("data-theme", "dark");

        if (button)
            button.textContent = "☀️ Light";
    } else {
        document.documentElement.removeAttribute("data-theme");

        if (button)
            button.textContent = "🌙 Dark";
    }

    localStorage.setItem("voilearn-theme", theme);
}

/* ==========================================================
   GLOBAL ERROR HANDLING
========================================================== */

window.addEventListener("error", (event) => {
    console.error("Unhandled Error:", event.error);
});

window.addEventListener("unhandledrejection", (event) => {
    console.error("Unhandled Promise:", event.reason);
});