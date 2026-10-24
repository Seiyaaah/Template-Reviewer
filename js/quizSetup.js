import { renderQuiz } from "./quiz.js";

export async function renderQuizSetup(container, subjectId) {

    console.log("Quiz Subject:", subjectId);

    try {

        const response = await fetch(`data/questions.json?v=${Date.now()}`);

        if (!response.ok) {
            throw new Error("Unable to load questions.json");
        }

        let data = await response.json();

        // Support both object and array JSON
        if (!Array.isArray(data)) {
            data = Object.values(data);
        }

        console.log("Questions:", data);
    const res = await fetch(`data/questions.json?v=${Date.now()}`);

    if (!res.ok) {
        throw new Error("Unable to load questions.json");
    }

    const allQuestions = await res.json();

    console.log(allQuestions);

    const lesson = allQuestions.find(
        lesson =>
            lesson.subjectId === subjectId ||
            lesson.id === subjectId
    )

console.log("Lesson:", lesson);

if (!lesson) {

    container.innerHTML = `
        <div class="card">
            <h2>No Questions Found</h2>
            <p>No quiz exists for this lesson.</p>
        </div>
    `;

    return;
}

// Get the questions inside that lesson
const questions = lesson.questions;

console.log("Questions:", questions);

        console.log("Filtered:", questions);

        if (questions.length === 0) {

            container.innerHTML = `
                <div class="card">
                    <h2>No Questions Found</h2>

                    <p>
                        No quiz questions exist for this lesson.
                    </p>

                    <p>
                        <strong>Subject:</strong> ${subjectId}
                    </p>

                    <button onclick="window.location.hash='#lesson/${subjectId}'">
                        Back to Lesson
                    </button>
                </div>
            `;

            return;
        }

        const labels = {
            "multiple-choice": "Multiple Choice",
            "true-false": "True / False",
            "modified-true-false": "Modified True / False",
            "identification": "Identification",
            "enumeration": "Enumeration"
        };

        const availableTypes = [...new Set(
            questions.map(q => q.type)
        )];

        container.innerHTML = `
            <div class="card" style="max-width:600px;margin:auto;">

                <h2>Customize Quiz</h2>

                <p>
                    Select the type of questions you want.
                </p>

                <select
                    id="quizType"
                    style="width:100%;margin:20px 0;padding:12px;"
                >

                    <option value="all">
                        Mix All (${questions.length})
                    </option>

                    ${availableTypes.map(type => {

                        const count = questions.filter(
                            q => q.type === type
                        ).length;

                        return `
                            <option value="${type}">
                                ${labels[type] ?? type} (${count})
                            </option>
                        `;

                    }).join("")}

                </select>

                <div style="display:flex;gap:12px;">

                    <button
                        id="startQuiz"
                        style="flex:1;"
                    >
                        Start Quiz
                    </button>

                    <button
                        id="cancelQuiz"
                        style="flex:1;"
                    >
                        Cancel
                    </button>

                </div>

            </div>
        `;

        document
            .getElementById("cancelQuiz")
            .addEventListener("click", () => {

                window.location.hash = `#lesson/${subjectId}`;

            });

        document
            .getElementById("startQuiz")
            .addEventListener("click", () => {

                const selected =
                    document.getElementById("quizType").value;

                const filteredQuestions =
                    selected === "all"
                        ? questions
                        : questions.filter(
                            q => q.type === selected
                        );

                renderQuiz(
                    container,
                    subjectId,
                    filteredQuestions
                );

            });

    }

    catch (err) {

        console.error(err);

        container.innerHTML = `
            <div class="card">

                <h2>Quiz Setup Error</h2>

                <p>
                    ${err.message}
                </p>

                <button onclick="window.location.hash='#home'">
                    Back Home
                </button>

            </div>
        `;

    }

}