export function saveQuizResult(subjectId, score, total) {

    const progress = getProgress();

    progress[subjectId] = {
        score,
        total,
        percentage: Math.round((score / total) * 100),
        date: new Date().toISOString()
    };

    localStorage.setItem(
        "learnpwa_progress",
        JSON.stringify(progress)
    );

}

export function getProgress() {

    const data = localStorage.getItem(
        "learnpwa_progress"
    );

    return data
        ? JSON.parse(data)
        : {};

}

export function clearProgress() {

    localStorage.removeItem(
        "learnpwa_progress"
    );

}