import { renderQuiz } from "./quiz.js";

export async function renderQuizSetup(container, subjectId) {
    try {
        const res = await fetch(`data/questions.json?v=${Date.now()}`);

        if (!res.ok) {
            throw new Error("Unable to load questions.");
        }

        const subject = allQuestions.find(
          q => q.subjectId === subjectId
        );

        questions = subject ? subject.questions : [];

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
        function attachHandlers(q) {
            const feedback = document.getElementById("feedback");

            function nextQuestion() {
                currentIndex++;
                showQuestion();
            }

            function showFeedback(correct, correctAnswer = "") {
                if (correct) {
                    score++;

                    feedback.innerHTML = `
                        <div
                            class="card"
                            style="
                                margin-top: 20px;
                                border-left: 5px solid #28a745;
                            "
                        >
                            <h4>✅ Correct!</h4>

                            <button id="nextBtn">
                                Next Question →
                            </button>
                        </div>
                    `;
                } else {
                    feedback.innerHTML = `
                        <div
                            class="card"
                            style="
                                margin-top: 20px;
                                border-left: 5px solid #dc3545;
                            "
                        >
                            <h4>❌ Incorrect</h4>

                            <p>
                                Correct Answer:
                                <strong>${correctAnswer}</strong>
                            </p>

                            <button id="nextBtn">
                                Next Question →
                            </button>
                        </div>
                    `;
                }

                document
                    .getElementById("nextBtn")
                    .addEventListener("click", nextQuestion);
            }

            switch (q.type) {
                case "multiple-choice":
                    document
                        .querySelectorAll(".option-btn")
                        .forEach((btn) => {
                            btn.addEventListener("click", () => {
                                document
                                    .querySelectorAll(".option-btn")
                                    .forEach((b) => {
                                        b.disabled = true;
                                    });

                                const selected = Number(btn.dataset.answer);

                                const correct = selected === q.answer;

                                showFeedback(
                                    correct,
                                    q.options[q.answer]
                                );
                            });
                        });

                    break;

                case "true-false":
                    document
                        .querySelectorAll(".option-btn")
                        .forEach((btn) => {
                            btn.addEventListener("click", () => {
                                document
                                    .querySelectorAll(".option-btn")
                                    .forEach((b) => {
                                        b.disabled = true;
                                    });

                                const selected = btn.dataset.answer;

                                const correct = selected === q.answer;

                                showFeedback(
                                    correct,
                                    q.answer
                                );
                            });
                        });

                    break;

                case "identification":
                    document
                        .getElementById("submitBtn")
                        .addEventListener("click", () => {
                            const answer = document
                                .getElementById("answerInput")
                                .value
                                .trim();

                            if (!answer) {
                                alert("Please enter an answer.");
                                return;
                            }

                            document.getElementById("submitBtn").disabled = true;
                            document.getElementById("answerInput").disabled = true;

                            showFeedback(
                                isFlexibleMatch(answer, q.answer),
                                q.answer
                            );
                        });

                    break;
                case "enumeration":
                    document
                        .getElementById("submitBtn")
                        .addEventListener("click", () => {

                            const rawAnswer = document
                                .getElementById("answerInput")
                                .value
                                .trim();

                            if (!rawAnswer) {
                                alert("Please enter at least one answer.");
                                return;
                            }

                            document.getElementById("submitBtn").disabled = true;
                            document.getElementById("answerInput").disabled = true;

                            const userAnswers = rawAnswer
                                .split(/[\n,;]/)
                                .map((item) => item.trim())
                                .filter((item) => item.length > 0);

                            const correctAnswers = q.answers || [];

                            const correct = correctAnswers.every(
                                (correctItem) =>
                                    userAnswers.some((userItem) =>
                                        isFlexibleMatch(
                                            userItem,
                                            correctItem
                                        )
                                    )
                            );

                            showFeedback(
                                correct,
                                correctAnswers.join(", ")
                            );

                        });

                    break;

                case "modified-true-false":
                    document
                        .getElementById("submitBtn")
                        .addEventListener("click", () => {

                            const selected = document.querySelector(
                                'input[name="tfChoice"]:checked'
                            );

                            if (!selected) {
                                alert("Select True or False.");
                                return;
                            }

                            const correction = document
                                .getElementById("correctionInput")
                                .value
                                .trim();

                            document.getElementById("submitBtn").disabled = true;
                            document.getElementById("correctionInput").disabled = true;

                            document
                                .querySelectorAll('input[name="tfChoice"]')
                                .forEach((radio) => {
                                    radio.disabled = true;
                                });

                            let correct = false;

                            if (selected.value === "True") {
                                correct = q.answer === "True";
                            } else {
                                correct =
                                    q.answer === "False" &&
                                    isFlexibleMatch(
                                        correction,
                                        q.correction
                                    );
                            }

                            const answerText =
                                q.answer === "False"
                                    ? `False — ${q.correction}`
                                    : "True";

                            showFeedback(
                                correct,
                                answerText
                            );

                        });

                    break;
            }
        }

        showQuestion();
    } catch (err) {
        console.error("Quiz loading error:", err);

        container.innerHTML = `
            <div class="card">
                <h2>Quiz Error</h2>

                <p>
                    Failed to load the quiz.
                </p>

                <p style="color: var(--text-muted);">
                    ${err.message}
                </p>

                <button onclick="window.location.reload()">
                    Try Again
                </button>
            </div>
        `;
    }
}
