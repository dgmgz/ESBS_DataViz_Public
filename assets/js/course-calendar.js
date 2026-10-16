(() => {
  const TIME_ZONE = "Europe/Madrid";
  const DURATION_HOURS = 2;

  // Authoritative course schedule. Display dates and homework deadlines are
  // derived from these ISO dates so weekday labels cannot drift out of sync.
  const meetings = {
    "session-01": { order: 1, label: "Session 1", short: "S1", type: "session", title: "From Raw Data to Insight", dateISO: "2026-11-06", start: "15:00" },
    "session-02": { order: 2, label: "Session 2", short: "S2", type: "session", title: "Getting Started with Tableau", dateISO: "2026-11-13", start: "15:00" },
    "session-03": { order: 3, label: "Session 3", short: "S3", type: "session", title: "Visual Encoding and Essential Charts", dateISO: "2026-11-20", start: "15:00" },
    "session-04": { order: 4, label: "Session 4", short: "S4", type: "session", title: "Preparing Trustworthy Data Models", dateISO: "2026-11-27", start: "15:00" },
    "workshop-01": { order: 5, label: "Workshop 1", short: "W1", type: "workshop", title: "Matchday Performance Challenge", dateISO: "2026-12-03", start: "18:00" },
    "session-06": { order: 6, label: "Session 6", short: "S6", type: "session", title: "Databases & SQL Fundamentals", dateISO: "2026-12-10", start: "18:00" },
    "session-07": { order: 7, label: "Session 7", short: "S7", type: "session", title: "SQL and Relational Analysis", dateISO: "2026-12-17", start: "18:00" },
    "session-08": { order: 8, label: "Session 8", short: "S8", type: "session", title: "Aggregating & Combining Data", dateISO: "2027-01-15", start: "17:00" },
    "session-09": { order: 9, label: "Session 9", short: "S9", type: "session", title: "Analytical SQL & Business Problem Solving", dateISO: "2027-01-22", start: "17:00" },
    "workshop-02": { order: 10, label: "Workshop 2", short: "W2", type: "workshop", title: "SQL Live Challenge", dateISO: "2027-01-28", start: "18:00" },
    "session-11": { order: 11, label: "Session 11", short: "S11", type: "session", title: "LODs and Table Calculations", dateISO: "2027-02-05", start: "17:00" },
    "session-12": { order: 12, label: "Session 12", short: "S12", type: "session", title: "Advanced Charts in Tableau", dateISO: "2027-02-12", start: "17:00" },
    "session-13": { order: 13, label: "Session 13", short: "S13", type: "session", title: "KPIs and Executive Dashboard Design", dateISO: "2027-02-18", start: "18:00" },
    "session-14": { order: 14, label: "Session 14", short: "S14", type: "session", title: "Dashboard Storytelling and Final Integration", dateISO: "2027-02-25", start: "18:00" },
    "workshop-03": { order: 15, label: "Workshop 3", short: "W3", type: "workshop", title: "Advanced Analytical Dashboard System", dateISO: "2027-03-04", start: "18:00" }
  };

  const orderedMeetings = Object.values(meetings).sort((a, b) => a.order - b.order);
  const path = window.location.pathname;
  const currentKey = Object.keys(meetings).find((key) => path.includes(`/sessions/${key}/`));

  function dateFromISO(dateISO) {
    const [year, month, day] = dateISO.split("-").map(Number);
    return new Date(Date.UTC(year, month - 1, day, 12));
  }

  function formatDate(dateISO, style = "long") {
    const options = style === "short"
      ? { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }
      : { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" };
    return new Intl.DateTimeFormat("en-GB", options).format(dateFromISO(dateISO));
  }

  function previousDay(dateISO) {
    const date = dateFromISO(dateISO);
    date.setUTCDate(date.getUTCDate() - 1);
    return new Intl.DateTimeFormat("en-GB", {
      weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC"
    }).format(date);
  }

  orderedMeetings.forEach((meeting, index) => {
    meeting.durationHours = DURATION_HOURS;
    meeting.delivery = "Online";
    meeting.timeZone = TIME_ZONE;
    meeting.date = formatDate(meeting.dateISO);
    meeting.shortDate = formatDate(meeting.dateISO, "short");
    if (orderedMeetings[index + 1]) meeting.homeworkDeadline = previousDay(orderedMeetings[index + 1].dateISO);
  });

  const calendarIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3v3M17 3v3M4 9h16M5 5h14a1 1 0 0 1 1 1v14H4V6a1 1 0 0 1 1-1Z"/></svg>';
  const clockIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>';

  function insertHeroDate() {
    if (!currentKey) return;
    const meeting = meetings[currentKey];
    const heroText = document.querySelector(".session-hero .hero-inner > div:first-child, .workshop-hero .hero-inner > div:first-child, .placeholder-hero .content-placeholder");
    const heading = heroText?.querySelector("h1");
    if (!heroText || !heading || heroText.querySelector(".course-meeting-card")) return;

    const card = document.createElement("div");
    card.className = `course-meeting-card ${meeting.type === "workshop" ? "is-workshop" : "is-session"}`;
    card.setAttribute("aria-label", `${meeting.date}, ${meeting.start}, ${DURATION_HOURS} hours, online`);
    card.innerHTML = `
      <div class="meeting-date">${calendarIcon}<strong>${meeting.date}</strong></div>
      <div class="meeting-details">${clockIcon}<span>${meeting.start} · ${DURATION_HOURS} hours · ${meeting.delivery}</span></div>`;
    heading.insertAdjacentElement("afterend", card);
  }

  function insertHomeDates() {
    document.querySelectorAll(".session-card").forEach((card) => {
      if (card.querySelector(".session-date")) return;
      const link = card.querySelector('a[href*="sessions/"]');
      if (!link) return;
      const key = Object.keys(meetings).find((meetingKey) => link.getAttribute("href").includes(meetingKey));
      const title = card.querySelector(".session-card-header h4");
      if (!key || !title) return;
      const meeting = meetings[key];
      const date = document.createElement("p");
      date.className = `session-date ${meeting.type === "workshop" ? "is-workshop" : "is-session"}`;
      date.innerHTML = `${calendarIcon}<span>${meeting.shortDate}</span>${clockIcon}<span>${meeting.start}</span>`;
      title.insertAdjacentElement("afterend", date);
    });
  }

  function updateDeadlines() {
    const deadline = currentKey ? meetings[currentKey]?.homeworkDeadline : null;
    if (!deadline) return;
    document.querySelectorAll(".homework-deadline p").forEach((item) => {
      item.innerHTML = `Complete this work by <strong>${deadline}</strong>.`;
    });
    document.querySelectorAll(".s06-homework .task-section").forEach((section) => {
      if (section.querySelector("h3")?.textContent.trim() !== "Deadline") return;
      const first = section.querySelector("p");
      if (first) first.innerHTML = `<strong>Complete and submit this work by ${deadline}.</strong>`;
    });
  }

  window.ESBSCourseCalendar = meetings;
  insertHeroDate();
  insertHomeDates();
  updateDeadlines();
})();
