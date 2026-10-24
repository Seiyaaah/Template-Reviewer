import { renderQuiz } from "./quiz.js";

export async function renderQuizSetup(container, subjectId) {
    try {
        const res = await fetch(`data/questions.json?v=${Date.now()}`);

        if (!res.ok) {
            throw new Error("Unable to load questions.");
        }

        const allQuestions = await res.json();

        const questions = allQuestions.filter(
            (q) => q.subjectId === subjectId
        );

        if (questions.length === 0) {
            container.innerHTML = `
                <div class="card">
                    <h2>No Questions Found</h2>

                    <p>
                        There are no questions available for this subject yet.
                    </p>

                    <button onclick="window.location.hash='#home'">
                        Back Home
                    </button>
                </div>
            `;
            return;
        }

        const typeLabels = {
            "multiple-choice": "Multiple Choice",
            "true-false": "True / False",
            "modified-true-false": "Modified True / False",
            "identification": "Identification",
            "enumeration": "Enumeration"
        };

        const availableTypes = [...new Set(questions.map((q) => q.type))].sort();

        container.innerHTML = `
            <div class="card" style="max-width:550px;margin:40px auto;">

                <h2 style="margin-bottom:10px;">
                    Customize Quiz
                </h2>

                <p style="color:var(--text-muted);margin-bottom:25px;">
                    Choose which type of questions you want to practice.
                </p>

                <label
                    for="quizTypeSelect"
                    style="
                        display:block;
                        margin-bottom:8px;
                        font-weight:600;
                    "
                >
                    Question Type
                </label>

                <select
                    id="quizTypeSelect"
                    style="
                        width:100%;
                        padding:12px;
                        font-size:16px;
                        border-radius:10px;
                        border:1px solid var(--border-color);
                        background:var(--bg-color);
                        color:var(--text-main);
                        margin-bottom:25px;
                    "
                >
                    <option value="all">
                        🎲 Mix All Types (${questions.length} Questions)
                    </option>

                    ${availableTypes
                        .map((type) => {
                            const count = questions.filter(
                                (q) => q.type === type
                            ).length;

                            return `
                                <option value="${type}">
                                    ${typeLabels[type] || type}
                                    (${count})
                                </option>
                            `;
                        })
                        .join("")}
                </select>

                <div
                    style="
                        display:flex;
                        gap:15px;
                    "
                >

                    <button
                        id="startCustomQuizBtn"
                        style="
                            flex:1;
                        "
                    >
                        🚀 Start Quiz
                    </button>

                    <button
                        id="cancelQuizBtn"
                        style="
                            flex:1;
                        "
                    >
                        Cancel
                    </button>

                </div>

            </div>
        `;

        document
            .getElementById("cancelQuizBtn")
            .addEventListener("click", () => {
                window.location.hash = "#home";
            });

        document
            .getElementById("startCustomQuizBtn")
            .addEventListener("click", () => {

                const selectedType =
                    document.getElementById("quizTypeSelect").value;

                const filteredQuestions =
                    selectedType === "all"
                        ? questions
                        : questions.filter(
                              (q) => q.type === selectedType
                          );

                renderQuiz(
                    container,
                    subjectId,
                    filteredQuestions
                );

            });

    } catch (err) {
        console.error(err);

        container.innerHTML = `
            <div class="card">

                <h2>Quiz Setup Error</h2>

                <p>
                    Failed to load quiz setup.
                </p>

                <p style="color:var(--text-muted);">
                    ${err.message}
                </p>

            </div>
        `;
    }
}
