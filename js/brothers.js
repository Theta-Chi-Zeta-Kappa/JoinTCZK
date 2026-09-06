(() => {
  const grid = document.getElementById("brothersGrid");
  const status = document.getElementById("brothersStatus");

  const shareUrl = String(window.BROTHERS_SHEET_SHARE_URL || "").trim();
  const configuredGid = String(window.BROTHERS_SHEET_GID || "0").trim() || "0";
  const fallbackLogo = "/assets/img/mainlogo.png";

  function escapeHTML(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function extractSheetInfo(shareLink) {
    const match = shareLink.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (!match) {
      throw new Error("The Google Sheets share link is not in a recognized format.");
    }

    let gid = configuredGid;

    try {
      const parsed = new URL(shareLink);

      gid = parsed.searchParams.get("gid") || gid;

      if (parsed.hash) {
        const hashParams = new URLSearchParams(parsed.hash.replace(/^#/, ""));
        gid = hashParams.get("gid") || gid;
      }
    } catch (_) {
      const gidMatch = shareLink.match(/[?#&]gid=(\d+)/);
      if (gidMatch) gid = gidMatch[1];
    }

    return { sheetId: match[1], gid };
  }

  function normalizeHeader(value) {
    return String(value || "").trim().toLowerCase().replace(/\s+/g, " ");
  }

  function normalizeOptionalField(value) {
    const text = String(value ?? "").trim();
    const lowered = text.toLowerCase();

    if (!text || lowered === "n/a" || lowered === "na" || lowered === "none" || text === "-") {
      return "";
    }

    return text;
  }


  function normalizeAssetPath(value) {
    const text = String(value ?? "").trim();
    if (!text) return "";
    if (/^(?:https?:)?\/\//i.test(text) || text.startsWith("data:") || text.startsWith("/")) return text;
    if (text.startsWith("assets/")) return `/${text}`;
    return text;
  }

  function tableToBrothers(table) {
    if (!table || !Array.isArray(table.cols) || !Array.isArray(table.rows)) {
      throw new Error("Google returned an unexpected sheet format.");
    }

    const headers = table.cols.map(col => normalizeHeader(col.label || col.id || ""));
    const col = key => headers.indexOf(key);

    const required = ["name", "major", "graduation year", "position", "photo"];
    const missing = required.filter(key => col(key) < 0);

    if (missing.length) {
      throw new Error(
        `Missing expected column${missing.length > 1 ? "s" : ""}: ${missing.join(", ")}.`
      );
    }

    function cellValue(row, index) {
      const cell = row.c?.[index];
      if (!cell) return "";
      // Prefer formatted value so years display cleanly.
      return String(cell.f ?? cell.v ?? "").trim();
    }

    return table.rows
      .map(row => ({
        name: cellValue(row, col("name")),
        major: cellValue(row, col("major")),
        gradYear: cellValue(row, col("graduation year")),
        position: normalizeOptionalField(cellValue(row, col("position"))),
        photo: normalizeAssetPath(cellValue(row, col("photo")))
      }))
      .filter(person => person.name);
  }

  function card(person) {
    const article = document.createElement("article");
    article.className = "brother-card";

    const photoMarkup = person.photo
      ? `<div class="brother-photo"><img src="${escapeHTML(person.photo)}" alt="${escapeHTML(person.name)}" loading="lazy"></div>`
      : `<div class="brother-photo placeholder"><img src="${fallbackLogo}" alt="" aria-hidden="true"></div>`;

    article.innerHTML = `
      ${photoMarkup}
      <div class="brother-info">
        <h2>${escapeHTML(person.name)}</h2>
        ${person.major ? `<p>${escapeHTML(person.major)}</p>` : ""}
        ${person.gradYear ? `<p>Class of ${escapeHTML(person.gradYear)}</p>` : ""}
        ${person.position ? `<p class="brother-position">${escapeHTML(person.position)}</p>` : ""}
      </div>`;

    const img = article.querySelector(".brother-photo:not(.placeholder) img");
    if (img) {
      img.addEventListener("error", () => {
        const wrap = img.parentElement;
        wrap.classList.add("placeholder");
        wrap.innerHTML = `<img src="${fallbackLogo}" alt="" aria-hidden="true">`;
      }, { once: true });
    }

    return article;
  }

  function render(people) {
    grid.classList.toggle("brothers-grid-large", people.length > 9);
    grid.replaceChildren(...people.map(card));
    status.className = "brothers-status";
    status.textContent = people.length
      ? `${people.length} active brother${people.length === 1 ? "" : "s"}`
      : "No active brothers are currently listed in the sheet.";
  }

  function loadViaGoogleVisualization(sheetId, gid) {
    return new Promise((resolve, reject) => {
      const callbackName = `__brothersSheetCallback_${Date.now()}`;
      let finished = false;

      const cleanup = () => {
        try { delete window[callbackName]; } catch (_) { window[callbackName] = undefined; }
        script.remove();
      };

      const timer = setTimeout(() => {
        if (finished) return;
        finished = true;
        cleanup();
        reject(new Error("Google Sheets did not respond before the request timed out."));
      }, 10000);

      window[callbackName] = response => {
        if (finished) return;
        finished = true;
        clearTimeout(timer);
        cleanup();

        if (!response) {
          reject(new Error("Google Sheets returned no response."));
          return;
        }

        if (response.status === "error") {
          const message =
            response.errors?.map(error => error.detailed_message || error.message).filter(Boolean).join(" ") ||
            "Google Sheets reported an error.";
          reject(new Error(message));
          return;
        }

        try {
          resolve(tableToBrothers(response.table));
        } catch (error) {
          reject(error);
        }
      };

      // The roster template keeps title/instructions above the real headers.
      // headers=1 tells Google Visualization that the first row of the selected
      // range is the header row. range=A4:E starts the query at row 4.
      const params = new URLSearchParams({
        gid,
        range: "A4:E",
        headers: "1",
        tqx: `responseHandler:${callbackName}`,
        tq: "select *"
      });

      const script = document.createElement("script");
      script.async = true;
      script.src = `https://docs.google.com/spreadsheets/d/${encodeURIComponent(sheetId)}/gviz/tq?${params.toString()}`;

      script.onerror = () => {
        if (finished) return;
        finished = true;
        clearTimeout(timer);
        cleanup();
        reject(new Error("The browser could not load the Google Sheets data request."));
      };

      document.head.appendChild(script);
    });
  }

  async function load() {
    if (!shareUrl) {
      status.className = "brothers-status error";
      status.innerHTML =
        `Google Sheet not connected yet. Open <strong>js/brothers-config.js</strong> and paste the normal Google Sheets share link into <strong>BROTHERS_SHEET_SHARE_URL</strong>.`;
      return;
    }

    try {
      const { sheetId, gid } = extractSheetInfo(shareUrl);
      const people = await loadViaGoogleVisualization(sheetId, gid);
      render(people);
    } catch (error) {
      console.error("Meet the Brothers sheet load failed:", error);
      status.className = "brothers-status error";
      status.innerHTML =
        `<strong>Roster failed to load.</strong><br>${escapeHTML(error.message)}<br><br>` +
        `Check that the Sheet is set to <strong>Anyone with the link → Viewer</strong>, ` +
        `that the correct tab <strong>gid</strong> is configured, and that the headers are exactly ` +
        `<strong>Name, Major, Graduation Year, Position, Photo</strong>.`;
    }
  }

  load();
})();
