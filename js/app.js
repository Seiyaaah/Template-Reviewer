import { initRouter } from "./router.js";

document.addEventListener("DOMContentLoaded", async () => {
    console.log("🧠 Starting VoiLearn...");

    await registerServiceWorker();

    initDarkMode();

    initRouter();

    console.log("✅ VoiLearn Ready");
});

/* ======================================================
   SERVICE WORKER
====================================================== */

async function registerServiceWorker() {

    if (!("serviceWorker" in navigator))
        return;

    try {

        const registration =
            await navigator.serviceWorker.register(
                "./service-worker.js"
            );

        console.log("✅ Service Worker Registered");

        // Check for updates every hour
        setInterval(() => {
            registration.update();
        }, 60 * 60 * 1000);

        registration.addEventListener(
            "updatefound",
            () => {

                const worker =
                    registration.installing;

                if (!worker)
                    return;

                worker.addEventListener(
                    "statechange",
                    () => {

                        if (
                            worker.state === "installed" &&
                            navigator.serviceWorker.controller
                        ) {

                            const update =
                                confirm(
                                    "A new version of VoiLearn is available.\n\nUpdate now?"
                                );

                            if (update)
                                window.location.reload();

                        }

                    }
                );

            }
        );

        let refreshing = false;

        navigator.serviceWorker.addEventListener(
            "controllerchange",
            () => {

                if (refreshing)
                    return;

                refreshing = true;

                window.location.reload();

            }
        );

    }

    catch (err) {

        console.error(
            "❌ Service Worker Error:",
            err
        );

    }

}

/* ======================================================
   DARK MODE
====================================================== */

function initDarkMode() {

    const button =
        document.getElementById(
            "themeToggleBtn"
        );

    if (!button)
        return;

    const saved =
        localStorage.getItem(
            "voilearn-theme"
        ) || "light";

    applyTheme(saved);

    button.addEventListener(
        "click",
        () => {

            const next =
                document.documentElement.getAttribute(
                    "data-theme"
                ) === "dark"
                    ? "light"
                    : "dark";

            applyTheme(next);

        }
    );

}

function applyTheme(theme) {

    const button =
        document.getElementById(
            "themeToggleBtn"
        );

    if (theme === "dark") {

        document.documentElement.setAttribute(
            "data-theme",
            "dark"
        );

        if (button)
            button.textContent =
                "☀️ Light";

    }

    else {

        document.documentElement.removeAttribute(
            "data-theme"
        );

        if (button)
            button.textContent =
                "🌙 Dark";

    }

    localStorage.setItem(
        "voilearn-theme",
        theme
    );

}

/* ======================================================
   GLOBAL ERROR HANDLER
====================================================== */

window.addEventListener(
    "error",
    (event) => {

        console.error(
            "Unhandled Error:",
            event.error
        );

    }
);

window.addEventListener(
    "unhandledrejection",
    (event) => {

        console.error(
            "Unhandled Promise:",
            event.reason
        );

    }
);
