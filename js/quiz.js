import { saveQuizResult } from "./storage.js";

let questions = [];
let currentQuestion = 0;
let score = 0;
let containerRef = null;
let subjectIdRef = null;

export function renderQuiz(container, subjectId, filteredQuestions = null) {
    containerRef = container;
    subjectIdRef = subjectId;

    questions = [...filteredQuestions];

    // Shuffle questions
    questions.sort(() => Math.random() - 0.5);

    currentQuestion = 0;
    score = 0;

    if (questions.length === 0) {
        container.innerHTML = `
            <div class="card">
                <h2>No Questions</h2>
                <p>No questions exist for this quiz.</p>

                <button onclick="window.location.hash='#home'">
                    Back Home
                </button>
            </div>
        `;
        return;
    }

    showQuestion();
}

function showQuestion() {

    if (currentQuestion >= questions.length) {
        finishQuiz();
        return;
    }

    const q = questions[currentQuestion];

    containerRef.innerHTML = `
        <div class="card">

            <div style="display:flex;justify-content:space-between;align-items:center;">

                <h2>
                    Question ${currentQuestion + 1} / ${questions.length}
                </h2>

                <strong>
                    Score: ${score}
                </strong>

            </div>

            <hr style="margin:20px 0;">

            <h3 style="margin-bottom:20px;">
                ${q.question}
            </h3>

            <div id="questionArea"></div>

        </div>
    `;

    const area = document.getElementById("questionArea");

    switch ((q.type || "").toLowerCase()) {

        case "multiple-choice":
            renderMultipleChoice(area, q);
            break;

        case "true-false":
            renderTrueFalse(area, q);
            break;

        case "modified-true-false":
            renderModifiedTrueFalse(area, q);
            break;

        case "identification":
            renderIdentification(area, q);
            break;

        case "enumeration":
            renderEnumeration(area, q);
            break;

        default:

            area.innerHTML = `
                <p style="color:red;">
                    Unsupported question type:
                    ${q.type}
                </p>
            `;
    }
}
// ======================================================
// MULTIPLE CHOICE
// ======================================================

function renderMultipleChoice(area, q) {

    area.innerHTML = `
        <div class="quiz-options">
            ${q.choices.map(choice => `
                <button class="opt-btn">
                    ${choice}
                </button>
            `).join("")}
        </div>
    `;

    area.querySelectorAll(".opt-btn").forEach(button => {

        button.addEventListener("click", () => {

            checkAnswer(
                button.textContent.trim(),
                q.answer
            );

        });

    });

}


// ======================================================
// TRUE / FALSE
// ======================================================

function renderTrueFalse(area, q) {

    area.innerHTML = `
        <div class="quiz-options">

            <button class="opt-btn">
                True
            </button>

            <button class="opt-btn">
                False
            </button>

        </div>
    `;

    area.querySelectorAll(".opt-btn").forEach(button => {

        button.addEventListener("click", () => {

            checkAnswer(
                button.textContent.trim(),
                q.answer
            );

        });

    });

}


// ======================================================
// MODIFIED TRUE / FALSE
// ======================================================

function renderModifiedTrueFalse(area, q) {

    area.innerHTML = `

        <div class="quiz-options">

            <button
                id="trueBtn"
                class="opt-btn">

                True

            </button>

            <button
                id="falseBtn"
                class="opt-btn">

                False

            </button>

        </div>

        <div
            id="correctionArea"
            style="
                display:none;
                margin-top:20px;
            ">

            <label>

                Correct Statement

            </label>

            <input
                id="correctionInput"
                type="text"
                style="
                    width:100%;
                    padding:12px;
                    margin-top:10px;
                ">

            <button
                id="submitCorrection"
                style="margin-top:15px;">

                Submit

            </button>

        </div>

    `;

    document
        .getElementById("trueBtn")
        .addEventListener("click", () => {

            checkModifiedAnswer(
                "True",
                "",
                q
            );

        });

    document
        .getElementById("falseBtn")
        .addEventListener("click", () => {

            document
                .getElementById("correctionArea")
                .style.display = "block";

        });

    document
        .getElementById("submitCorrection")
        .addEventListener("click", () => {

            checkModifiedAnswer(

                "False",

                document
                    .getElementById("correctionInput")
                    .value,

                q

            );

        });

}
// ======================================================
// IDENTIFICATION
// ======================================================

function renderIdentification(area, q) {

    area.innerHTML = `
        <input
            id="identificationAnswer"
            class="quiz-input"
            type="text"
            placeholder="Type your answer">

        <br><br>

        <button id="submitIdentification">
            Submit
        </button>
    `;

    document
        .getElementById("submitIdentification")
        .addEventListener("click", () => {

            const answer = document
                .getElementById("identificationAnswer")
                .value;

            checkAnswer(answer, q.answer);

        });

}


// ======================================================
// ENUMERATION
// ======================================================

function renderEnumeration(area, q) {

    const count = q.answer.length;

    area.innerHTML = `

        ${Array.from({ length: count })
            .map((_, i) => `
                <input
                    class="enum-input quiz-input"
                    type="text"
                    placeholder="Item ${i + 1}">
                <br><br>
            `)
            .join("")}

        <button id="submitEnumeration">
            Submit
        </button>

    `;

    document
        .getElementById("submitEnumeration")
        .addEventListener("click", () => {

            const answers = [
                ...document.querySelectorAll(".enum-input")
            ].map(input => input.value);

            checkEnumeration(
                answers,
                q.answer
            );

        });

}


// ======================================================
// ANSWER CHECKER
// ======================================================

function checkAnswer(userAnswer, correctAnswer) {

    const correct =

        String(userAnswer)
            .trim()
            .toLowerCase()

        ===

        String(correctAnswer)
            .trim()
            .toLowerCase();

    if (correct) {
        score++;
    }

    showFeedback(
        correct,
        correctAnswer
    );

}


// ======================================================
// MODIFIED TRUE/FALSE CHECKER
// ======================================================

function checkModifiedAnswer(
    tfAnswer,
    modification,
    question
) {

    let correct = false;

    if (

        tfAnswer.toLowerCase()

        ===

        String(question.answer).toLowerCase()

    ) {

        if (

            String(question.answer).toLowerCase()

            ===

            "true"

        ) {

            correct = true;

        }

        else {

            correct =

                modification
                    .trim()
                    .toLowerCase()

                ===

                String(question.correction || "")
                    .trim()
                    .toLowerCase();

        }

    }

    if (correct) {
        score++;
    }

    showFeedback(

        correct,

        question.answer === "False"
            ? question.correction
            : question.answer

    );

}


// ======================================================
// ENUMERATION CHECKER
// ======================================================

function checkEnumeration(
    answers,
    correctAnswers
) {

    let correct = true;

    if (answers.length !== correctAnswers.length) {

        correct = false;

    } else {

        for (let i = 0; i < correctAnswers.length; i++) {

            if (

                answers[i]
                    .trim()
                    .toLowerCase()

                !==

                correctAnswers[i]
                    .trim()
                    .toLowerCase()

            ) {

                correct = false;
                break;

            }

        }

    }

    if (correct) {
        score++;
    }

    showFeedback(
        correct,
        correctAnswers.join(", ")
    );

}
// ======================================================
// FEEDBACK
// ======================================================

function showFeedback(correct, answer) {

    containerRef.innerHTML += `

        <div
            class="card"
            style="margin-top:20px;">

            <h2>
                ${correct ? "✅ Correct!" : "❌ Incorrect"}
            </h2>

            <p>

                <strong>Answer:</strong>

                ${answer}

            </p>

            <button
                id="nextQuestionBtn"
                style="margin-top:20px;">

                ${currentQuestion + 1 >= questions.length
                    ? "Finish Quiz"
                    : "Next Question"}

            </button>

        </div>

    `;

    document
        .getElementById("nextQuestionBtn")
        .addEventListener("click", () => {

            currentQuestion++;

            showQuestion();

        });

}


// ======================================================
// QUIZ COMPLETE
// ======================================================

function finishQuiz() {

    const percentage = Math.round(

        (score / questions.length) * 100

    );

    try {

        saveQuizResult(
            subjectIdRef,
            score,
            questions.length
        );

    } catch (err) {

        console.warn(
            "Unable to save progress.",
            err
        );

    }

    containerRef.innerHTML = `

        <div class="card">

            <h1>
                🎉 Quiz Complete!
            </h1>

            <hr>

            <h2>

                ${score} / ${questions.length}

            </h2>

            <h3>

                ${percentage}%

            </h3>

            <br>

            <button
                id="restartQuiz">

                🔄 Retry Quiz

            </button>

            <br><br>

            <button
                id="backLesson">

                📖 Back to Lesson

            </button>

            <br><br>

            <button
                id="backHome">

                🏠 Home

            </button>

        </div>

    `;

    document
        .getElementById("restartQuiz")
        .addEventListener("click", () => {

            renderQuiz(
                containerRef,
                subjectIdRef,
                [...questions]
            );

        });

    document
        .getElementById("backLesson")
        .addEventListener("click", () => {

            window.location.hash =
                `#lesson/${subjectIdRef}`;

        });

    document
        .getElementById("backHome")
        .addEventListener("click", () => {

            window.location.hash = "#home";

        });

}