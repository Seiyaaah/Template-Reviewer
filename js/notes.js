export async function renderNotes(container, subjectId = null) {
  try {
    const response = await fetch(`data/notes.json?v=${Date.now()}`);

    if (!response.ok) {
      throw new Error("Unable to load notes.");
    }

    const notesData = await response.json();

    const notes = Array.isArray(notesData)
      ? notesData
      : Object.entries(notesData).map(([id, note]) => ({
          id,
          ...note
        }));

    // =====================================================
    // DETAIL PAGE
    // =====================================================

    if (subjectId) {
      const note =
        notes.find(
          n =>
            n.id === subjectId ||
            n.subjectId === subjectId
        );

      if (!note) {
        container.innerHTML = `
          <div class="card">
            <h2>Notes Not Found</h2>
            <p>No notes are available for this subject.</p>

            <button onclick="location.hash='#notes'">
              ← Back to Notes
            </button>
          </div>
        `;
        return;
      }

      let sectionsHTML = "";

      if (Array.isArray(note.sections)) {
        sectionsHTML = note.sections
          .map(section => `
            <section class="note-section">

              <h2>${section.title || section.heading || ""}</h2>

              ${
                Array.isArray(section.paragraphs)
                  ? section.paragraphs
                      .map(
                        p => `<p>${p}</p>`
                      )
                      .join("")
                  : ""
              }

              ${
                Array.isArray(section.list) &&
                section.list.length
                  ? `
                  <ul>
                    ${section.list
                      .map(
                        item => `<li>${item}</li>`
                      )
                      .join("")}
                  </ul>
                  `
                  : ""
              }

            </section>
          `)
          .join("");
      } else {
        sectionsHTML = `
          <p>${note.content || ""}</p>
        `;
      }

      container.innerHTML = `
        <div class="card notes-page">

          <button
            class="secondary-btn"
            onclick="location.hash='#notes'"
          >
            ← Back
          </button>

          <h1>${note.title}</h1>

          ${
            note.summary
              ? `<p class="note-summary">${note.summary}</p>`
              : ""
          }

          <hr>

          <div class="notes-content">

            ${sectionsHTML}

          </div>

          <div class="notes-actions">

            <button
              onclick="location.hash='#quiz/${subjectId}'"
            >
              Take Quiz
            </button>

          </div>

        </div>
      `;

      return;
    }

    // =====================================================
    // NOTES LIST
    // =====================================================

    container.innerHTML = `
      <h2>Revision Notes</h2>

      <p class="page-description">
        Choose a topic to read its complete reviewer.
      </p>

      <div class="subjects-grid">

        ${notes
          .map(
            note => `
          <div
            class="card note-card"
            data-id="${note.id}"
          >

            <h3>${note.title}</h3>

            <p>
              ${note.summary || note.description || ""}
            </p>

            <button>
              Read Notes
            </button>

          </div>
        `
          )
          .join("")}

      </div>
    `;

    container.querySelectorAll(".note-card").forEach(card => {
      card.addEventListener("click", () => {
        location.hash = `#notes/${card.dataset.id}`;
      });
    });

  } catch (error) {

    console.error(error);

    container.innerHTML = `
      <div class="card">

        <h2>Unable to load notes</h2>

        <p>
          Please refresh the page or verify that
          <strong>notes.json</strong> exists.
        </p>

      </div>
    `;
  }
}
