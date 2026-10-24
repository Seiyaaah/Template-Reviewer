export async function renderHome(container) {
    try {
        const res = await fetch(`data/subjects.json?v=${Date.now()}`);

        if (!res.ok) {
            throw new Error("Unable to load subjects.json");
        }

        const subjects = await res.json();

        if (!Array.isArray(subjects) || subjects.length === 0) {
            container.innerHTML = `
                <div class="card">
                    <h2>No Subjects Available</h2>
                    <p>Run the automation pipeline to generate subjects.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="page-header">
                <h1>📚 Explore Subjects</h1>
                <p>Select a subject to begin learning.</p>
            </div>

            <div class="subjects-grid">
                ${subjects.map(subject => `
                    <div class="card subject-card">

                        <h2>${subject.title}</h2>

                        <p>
                            ${subject.description ?? ""}
                        </p>

                        <div class="lesson-actions">
                            <button
                                onclick="window.location.hash='#lesson/${subject.id}'">
                                Start Learning
                            </button>
                        </div>

                    </div>
                `).join("")}
            </div>
        `;

    } catch (err) {

        console.error(err);

        container.innerHTML = `
            <div class="card">
                <h2>Unable to Load Subjects</h2>

                <p>
                    Failed to load
                    <strong>subjects.json</strong>.
                </p>

                <p style="color: var(--text-muted);">
                    ${err.message}
                </p>
            </div>
        `;
    }
}

export async function renderLesson(container, subjectId) {

    try {

        const res = await fetch(`data/lessons.json?v=${Date.now()}`);

        if (!res.ok) {
            throw new Error("Unable to load lessons.json");
        }

        const lessons = await res.json();

        if (!Array.isArray(lessons)) {
            throw new Error("lessons.json must be an array.");
        }

        const lesson = lessons.find(item =>
            item.id === subjectId ||
            item.subjectId === subjectId
        );

        if (!lesson) {

            container.innerHTML = `
                <div class="card">

                    <h2>Lesson Not Found</h2>

                    <p>
                        This lesson hasn't been generated yet.
                    </p>

                    <button onclick="window.location.hash='#home'">
                        ← Back Home
                    </button>

                </div>
            `;

            return;
        }

        const formatContent = (content) => {

            if (!content) {
                return "<p>No lesson content available.</p>";
            }

            // NotebookLM already generates HTML.
            if (content.includes("<")) {
                return content;
            }

            return content
                .split(/\n\s*\n/)
                .map(p => `<p>${p.trim()}</p>`)
                .join("");

        };
                container.innerHTML = `
            <div class="card lesson-card">

                <div class="lesson-header">

                    <h1>${lesson.title}</h1>

                    ${
                        lesson.description
                            ? `
                                <p class="lesson-description">
                                    ${lesson.description}
                                </p>
                              `
                            : ""
                    }

                </div>

                <hr>

                <div class="lesson-content">

                    ${formatContent(lesson.content)}

                </div>

                <div
                    class="lesson-actions"
                    style="
                        display:flex;
                        gap:1rem;
                        flex-wrap:wrap;
                        margin-top:2rem;
                    "
                >

                    <button
                        onclick="window.location.hash='#notes/${subjectId}'">
                        📝 Review Notes
                    </button>

                    <button
                        onclick="window.location.hash='#quiz/${subjectId}'">
                        🎯 Take Quiz
                    </button>

                    <button
                        class="secondary-btn"
                        onclick="window.location.hash='#home'">
                        ← Back Home
                    </button>

                </div>

            </div>
        `;

    } catch (err) {

        console.error("Lesson loading error:", err);

        container.innerHTML = `
            <div class="card">

                <h2>Error Loading Lesson</h2>

                <p>
                    Failed to load lesson data.
                </p>

                <p style="color: var(--text-muted);">
                    ${err.message}
                </p>

                <button
                    onclick="window.location.hash='#home'">
                    ← Back Home
                </button>

            </div>
        `;
    }
}