export async function renderHome(container) {
  try {
    const res = await fetch(`data/subjects.json?v=${Date.now()}`);
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
          Please check that
          <strong>subjects.json</strong>
          exists and is valid.
        </p>
      </div>
    `;
  }
}

export async function renderLesson(container, subjectId) {

  try {

    const res = await fetch(`data/lessons.json?v=${Date.now()}`);
    const data = await res.json();

    let lesson;

    // Supports BOTH array and object JSON
    if (Array.isArray(data)) {

      lesson = data.find(item =>
        item.id === subjectId ||
        item.subjectId === subjectId
      );

    } else {

      lesson = data[subjectId];

    }

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

      if (!content)
        return "<p>No lesson content available.</p>";

      // Already HTML
      if (/<[a-z][\s\S]*>/i.test(content))
        return content;

      // Markdown headings
      content = content.replace(
        /^### (.*)$/gm,
        "<h3>$1</h3>"
      );

      content = content.replace(
        /^## (.*)$/gm,
        "<h2>$1</h2>"
      );

      content = content.replace(
        /^# (.*)$/gm,
        "<h1>$1</h1>"
      );

      // Markdown bold
      content = content.replace(
        /\*\*(.*?)\*\*/g,
        "<strong>$1</strong>"
      );

      // Bullet lists
      content = content.replace(
        /^- (.*)$/gm,
        "<li>$1</li>"
      );

      content = content.replace(
        /(<li>[\s\S]*?<\/li>)/g,
        "<ul>$1</ul>"
      );

      // Paragraphs
      return content
        .split(/\n\s*\n/)
        .map(p => {

          p = p.trim();

          if (
            p.startsWith("<h") ||
            p.startsWith("<ul")
          )
            return p;

          return `<p>${p}</p>`;

        })
        .join("");
    };

    container.innerHTML = `
      <div class="card lesson-card">

        <div class="lesson-header">

          <h1>${lesson.title}</h1>

          ${
            lesson.description
            ? `<p class="lesson-description">${lesson.description}</p>`
            : ""
          }

        </div>

        <hr>

        <div class="lesson-content">

          ${formatContent(lesson.content)}

        </div>

        <div class="lesson-actions">

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

    console.error(err);

    container.innerHTML = `
      <div class="card">

        <h2>Error Loading Lesson</h2>

        <p>
          Failed to load lesson data.
        </p>

      </div>
    `;
  }
}
