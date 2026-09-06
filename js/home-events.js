(() => {
  const list = document.getElementById("homeEventsList");
  const status = document.getElementById("homeEventsStatus");
  if (!list || !status) return;

  const shareUrl = String(window.EVENTS_SHEET_SHARE_URL || "").trim();
  const sheetName = String(window.EVENTS_SHEET_NAME || "Events").trim();

  const escapeHtml = value => String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

  const normalize = value => String(value || "").trim().toLowerCase().replace(/\s+/g, " ");

  function sheetId(url) {
    const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (!match) throw new Error("The Google Sheets share link is not in a recognized format.");
    return match[1];
  }

  function cell(row, index) {
    const item = row.c?.[index];
    return item ? String(item.f ?? item.v ?? "").trim() : "";
  }

  function raw(row, index) {
    return row.c?.[index]?.v ?? "";
  }

  function parseGoogleDate(value, formatted) {
    if (value instanceof Date) return new Date(value.getFullYear(), value.getMonth(), value.getDate());
    const rawValue = String(value || "");
    const googleDate = rawValue.match(/^Date\((\d+),(\d+),(\d+)/);
    if (googleDate) return new Date(+googleDate[1], +googleDate[2], +googleDate[3]);

    const parsed = new Date(String(formatted || "").trim());
    if (!Number.isNaN(parsed.getTime())) {
      return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
    }
    return null;
  }

  function rowsToEvents(table) {
    if (!table?.cols || !table?.rows) throw new Error("Google returned an unexpected sheet format.");
    const headers = table.cols.map(column => normalize(column.label || column.id || ""));
    const indexOf = name => headers.indexOf(name);
    const required = ["event", "date", "start time", "end time", "location"];
    const missing = required.filter(name => indexOf(name) < 0);
    if (missing.length) throw new Error(`Missing expected column${missing.length > 1 ? "s" : ""}: ${missing.join(", ")}.`);

    return table.rows.map(row => {
      const dateIndex = indexOf("date");
      const formattedDate = cell(row, dateIndex);
      return {
        name: cell(row, indexOf("event")),
        date: parseGoogleDate(raw(row, dateIndex), formattedDate),
        start: cell(row, indexOf("start time")),
        end: cell(row, indexOf("end time")),
        location: cell(row, indexOf("location"))
      };
    }).filter(event => event.name && event.date);
  }

  function timeText(event) {
    if (event.start && event.end) return `${event.start} – ${event.end}`;
    return event.start || event.end || "";
  }

  function eventCard(event) {
    const article = document.createElement("article");
    article.className = "event-shell home-event-shell";
    const month = event.date.toLocaleDateString(undefined, { month: "short" }).toUpperCase();
    const day = event.date.toLocaleDateString(undefined, { day: "numeric" });
    const fullDate = event.date.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
    const time = timeText(event);
    const details = [fullDate, time, event.location].filter(Boolean).map(escapeHtml).join(" · ");

    article.innerHTML = `
      <div class="event-date">
        <strong>${escapeHtml(month)}</strong>
        <span>${escapeHtml(day)}</span>
      </div>
      <div class="event-copy">
        <h3>${escapeHtml(event.name)}</h3>
        <p>${details}</p>
      </div>
      <a class="button button-dark" href="events.html">Event Details</a>
    `;
    return article;
  }

  function render(events) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const upcoming = events
      .filter(event => event.date >= today)
      .sort((a, b) => a.date - b.date)
      .slice(0, 2);

    if (upcoming.length) {
      list.replaceChildren(...upcoming.map(eventCard));
      return;
    }

    list.innerHTML = `
      <div class="event-shell home-event-empty">
        <div class="event-copy">
          <h3>More events are on the way.</h3>
          <p>Recruitment events change throughout the semester. Visit the Events page or reach out to us and we will help you find the next opportunity to meet the chapter.</p>
        </div>
        <a class="button button-dark" href="interest.html?level=meet#interest-form">I Want to Meet the Chapter</a>
      </div>
    `;
  }

  function loadGViz(id) {
    return new Promise((resolve, reject) => {
      const callbackName = `__homeEventsCallback_${Date.now()}`;
      const script = document.createElement("script");
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
        if (!response) return reject(new Error("Google Sheets returned no response."));
        if (response.status === "error") {
          return reject(new Error(response.errors?.map(item => item.detailed_message || item.message).filter(Boolean).join(" ") || "Google Sheets reported an error."));
        }
        try { resolve(rowsToEvents(response.table)); }
        catch (error) { reject(error); }
      };

      const params = new URLSearchParams({
        sheet: sheetName,
        range: "A4:H",
        headers: "1",
        tqx: `responseHandler:${callbackName}`,
        tq: "select *"
      });

      script.async = true;
      script.src = `https://docs.google.com/spreadsheets/d/${encodeURIComponent(id)}/gviz/tq?${params.toString()}`;
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
      status.textContent = "Visit the Events page for the current recruitment schedule.";
      return;
    }

    try {
      render(await loadGViz(sheetId(shareUrl)));
    } catch (error) {
      console.error("Homepage event load failed:", error);
      status.innerHTML = `We could not load the upcoming schedule right now. <a href="events.html">View the Events page</a>.`;
    }
  }

  load();
})();
