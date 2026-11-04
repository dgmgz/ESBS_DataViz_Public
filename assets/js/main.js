(function () {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  document.documentElement.classList.add('js');

  const sessionOneKnowledge = $('#S01-10');
  const sessionOneApplying = $('#S01-09');
  const sessionOneExploring = $('#S01-08');
  if (sessionOneKnowledge && sessionOneApplying && sessionOneExploring) {
    sessionOneExploring.before(sessionOneKnowledge, sessionOneApplying);
  }

  const notesButton = $('[data-toggle-notes]');
  const savedNotes = localStorage.getItem('esbs-notes-hidden') === 'true';
  document.body.classList.toggle('notes-hidden', savedNotes);
  if (notesButton) {
    notesButton.textContent = savedNotes ? 'Show instructor notes' : 'Hide instructor notes';
    notesButton.addEventListener('click', () => {
      const hidden = !document.body.classList.contains('notes-hidden');
      document.body.classList.toggle('notes-hidden', hidden);
      localStorage.setItem('esbs-notes-hidden', String(hidden));
      notesButton.textContent = hidden ? 'Show instructor notes' : 'Hide instructor notes';
    });
  }

  const progressStorageKey = `esbs-student-progress:${window.location.pathname}`;
  localStorage.removeItem(progressStorageKey);

  $$('[data-quiz]').forEach((quiz, quizIndex) => {
    const feedback = $('.feedback', quiz);
    const options = $$('.quiz-options button', quiz);
    options.forEach((button) => {
      button.addEventListener('click', () => {
        const ok = button.dataset.correct === 'true';
        $$('.quiz-options button', quiz).forEach((option) => {
          option.classList.remove('correct', 'incorrect');
          option.setAttribute('aria-pressed', 'false');
        });
        button.classList.add(ok ? 'correct' : 'incorrect');
        button.setAttribute('aria-pressed', 'true');
        if (feedback) {
          feedback.textContent = button.dataset.feedback || (ok ? 'Correct.' : 'Not quite.');
          feedback.className = `feedback ${ok ? 'ok' : 'no'}`;
        }
        updateProgress();
      });
    });
  });

  $$('[data-tabs]').forEach((tabs) => {
    const tabButtons = $$('[role="tab"]', tabs);
    const panels = $$('.tab-panel', tabs);
    tabButtons.forEach((tab, index) => {
      tab.addEventListener('click', () => activate(index));
      tab.addEventListener('keydown', (event) => {
        if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
        event.preventDefault();
        const dir = event.key === 'ArrowRight' ? 1 : -1;
        const next = (index + dir + tabButtons.length) % tabButtons.length;
        tabButtons[next].focus();
        activate(next);
      });
    });
    function activate(index) {
      tabButtons.forEach((tab, i) => tab.setAttribute('aria-selected', String(i === index)));
      panels.forEach((panel, i) => {
        panel.hidden = i !== index;
      });
    }
  });

  $$('[data-reveal]').forEach((button) => {
    const target = document.getElementById(button.getAttribute('aria-controls'));
    if (!target) return;
    target.hidden = true;
    button.addEventListener('click', () => {
      const next = !target.hidden;
      target.hidden = next;
      button.setAttribute('aria-expanded', String(!next));
      button.textContent = next ? (button.dataset.show || 'Show') : (button.dataset.hide || 'Hide');
    });
  });

  $$('[data-flip-card]').forEach((card) => {
    card.addEventListener('click', () => {
      const flipped = card.classList.toggle('is-flipped');
      card.setAttribute('aria-pressed', String(flipped));
    });
  });

  $$('[data-w02-group-selector]').forEach((selector) => {
    const rootSelector = selector.dataset.caseRoot;
    const caseRoot = rootSelector ? document.querySelector(rootSelector) : null;
    if (!caseRoot) return;
    const buttons = $$('[data-w02-group-button]', selector);
    const panels = $$('[data-w02-case]', caseRoot);
    const placeholder = $('[data-w02-placeholder]', caseRoot);
    const selectedLabel = $('[data-w02-selected-label]', selector);
    const storageKey = `esbs-${window.location.pathname}-selected-group`;
    localStorage.removeItem(storageKey);

    const activateGroup = (group) => {
      buttons.forEach((button) => {
        const active = button.dataset.w02GroupButton === group;
        button.classList.toggle('active', active);
        button.setAttribute('aria-pressed', String(active));
      });
      panels.forEach((panel) => {
        panel.hidden = panel.dataset.w02Case !== group;
      });
      if (placeholder) placeholder.hidden = true;
      if (selectedLabel) selectedLabel.textContent = `Group ${group}`;
      updateProgress();
    };

    buttons.forEach((button) => {
      button.setAttribute('aria-pressed', 'false');
      button.addEventListener('click', () => activateGroup(button.dataset.w02GroupButton));
    });

  });

  $$('[data-nav-menu]').forEach((menu) => {
    const trigger = $('[aria-controls]', menu);
    const panel = trigger ? document.getElementById(trigger.getAttribute('aria-controls')) : null;
    if (!trigger || !panel) return;
    const close = () => {
      panel.hidden = true;
      trigger.setAttribute('aria-expanded', 'false');
    };
    const open = () => {
      $$('[data-nav-menu]').forEach((other) => {
        if (other === menu) return;
        const otherTrigger = $('[aria-controls]', other);
        const otherPanel = otherTrigger ? document.getElementById(otherTrigger.getAttribute('aria-controls')) : null;
        if (otherTrigger && otherPanel) {
          otherPanel.hidden = true;
          otherTrigger.setAttribute('aria-expanded', 'false');
        }
      });
      panel.hidden = false;
      trigger.setAttribute('aria-expanded', 'true');
    };
    trigger.addEventListener('click', (event) => {
      event.stopPropagation();
      panel.hidden ? open() : close();
    });
    menu.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        close();
        trigger.focus();
      }
    });
    $$('a', panel).forEach((link) => link.addEventListener('click', close));
    document.addEventListener('click', (event) => {
      if (!menu.contains(event.target)) close();
    });
  });

  $$('[data-field-reveal-activity]').forEach((activity) => {
    const cards = $$('[data-field-card]', activity);
    const progress = $('[data-field-progress]', activity);
    const updateFieldProgress = () => {
      const revealed = cards.filter((card) => card.getAttribute('aria-expanded') === 'true').length;
      if (progress) progress.textContent = `${revealed} / ${cards.length} fields revealed`;
    };
    cards.forEach((card) => {
      card.addEventListener('click', () => {
        const expanded = card.getAttribute('aria-expanded') === 'true';
        card.setAttribute('aria-expanded', String(!expanded));
        updateFieldProgress();
        updateProgress();
      });
    });
    $$('[data-field-reveal-all]', activity).forEach((button) => {
      button.addEventListener('click', () => {
        cards.forEach((card) => card.setAttribute('aria-expanded', 'true'));
        updateFieldProgress();
      });
    });
    $$('[data-field-reset]', activity).forEach((button) => {
      button.addEventListener('click', () => {
        cards.forEach((card) => card.setAttribute('aria-expanded', 'false'));
        updateFieldProgress();
      });
    });
    updateFieldProgress();
  });

  $$('[data-classification-check]').forEach((activity) => {
    const cards = $$('[data-answer]', activity);
    const feedback = $('.feedback', activity);
    const progress = $('[data-classification-progress]', activity);
    const updateClassificationProgress = () => {
      const answered = cards.filter((card) => $('button[aria-pressed="true"]', card)).length;
      if (progress) progress.textContent = `${answered} / ${cards.length} selected`;
    };
    cards.forEach((card) => {
      $$('button', card).forEach((button) => {
        button.addEventListener('click', () => {
          $$('button', card).forEach((option) => {
            option.setAttribute('aria-pressed', 'false');
            option.classList.remove('selected');
          });
          button.setAttribute('aria-pressed', 'true');
          button.classList.add('selected');
          card.classList.remove('correct', 'incorrect');
          updateClassificationProgress();
        });
      });
    });
    $('[data-check]', activity)?.addEventListener('click', () => {
      let answered = 0;
      let correct = 0;
      cards.forEach((card) => {
        const selected = $('button[aria-pressed="true"]', card);
        card.classList.remove('correct', 'incorrect');
        if (!selected) return;
        answered += 1;
        const ok = selected.textContent.trim() === card.dataset.answer;
        if (ok) correct += 1;
        card.classList.add(ok ? 'correct' : 'incorrect');
      });
      if (feedback) {
        feedback.textContent = `${correct} / ${cards.length} correct. ${answered < cards.length ? 'Answer every item, then check again.' : 'Review any highlighted item before moving on.'}`;
        feedback.className = `feedback ${correct === cards.length ? 'ok' : 'no'}`;
      }
    });
    $('[data-reset]', activity)?.addEventListener('click', () => {
      cards.forEach((card) => {
        card.classList.remove('correct', 'incorrect', 'explain');
        $$('button', card).forEach((button) => {
          button.setAttribute('aria-pressed', 'false');
          button.classList.remove('selected');
        });
        $('.s06-card-explanation', card)?.remove();
      });
      updateClassificationProgress();
      if (feedback) {
        feedback.textContent = '';
        feedback.className = 'feedback';
      }
    });
    $('[data-explain]', activity)?.addEventListener('click', () => {
      cards.forEach((card) => {
        card.classList.add('explain');
        if (!$('.s06-card-explanation', card)) {
          const note = document.createElement('p');
          note.className = 's06-card-explanation';
          note.textContent = `${card.dataset.answer}: ${card.dataset.explanation}`;
          card.append(note);
        }
      });
    });
    updateClassificationProgress();
  });

  $$('[data-sql-anatomy]').forEach((activity) => {
    const output = $('[data-sql-anatomy-output]', activity);
      const notes = {
        select: ['SELECT', 'Chooses which columns or expressions appear in the result.'],
        distinct: ['DISTINCT', 'Keeps unique result combinations for the selected columns.'],
        as: ['AS', 'Names an output expression. It does not rename the stored database column.'],
        from: ['FROM', 'Chooses the source table that SQL reads from.'],
        where: ['WHERE', 'Keeps only the rows whose condition is true.'],
        isnull: ['IS NULL / IS NOT NULL', 'Filters rows where a value is missing or known. Do not use = NULL.'],
        orderby: ['ORDER BY', 'Arranges result rows before they are returned.'],
        case: ['CASE', 'Creates a classified or conditional value in the query result.'],
        limit: ['LIMIT', 'Limits how many result rows SQLite returns. It does not delete anything.']
      };
    $$('[data-sql-part]', activity).forEach((button) => {
      button.addEventListener('click', () => {
        $$('[data-sql-part]', activity).forEach((item) => item.setAttribute('aria-pressed', 'false'));
        button.setAttribute('aria-pressed', 'true');
        const [title, body] = notes[button.dataset.sqlPart] || ['SQL', 'This part has a job in the query.'];
        if (output) output.innerHTML = `<strong>${title}</strong><p>${body}</p>`;
      });
    });
  });

  $$('[data-key-role-check]').forEach((activity) => {
    const items = [
      { field: 'clubs.club_id', context: 'Identifies one club row in the clubs table.', answer: 'Primary key', why: 'It is the primary key of clubs: one value identifies one club.' },
      { field: 'matches.match_id', context: 'Identifies one match row in the matches table.', answer: 'Primary key', why: 'It uniquely identifies each match record.' },
      { field: 'matches.club_id', context: 'Connects each match to the club that played it.', answer: 'Foreign key', why: 'It points from matches to clubs.club_id.' },
      { field: 'matches.stadium_id', context: 'Connects each match to the stadium record.', answer: 'Foreign key', why: 'It points from matches to stadiums.stadium_id.' },
      { field: 'stadiums.stadium_id', context: 'Identifies one stadium row in the stadiums table.', answer: 'Primary key', why: 'It uniquely identifies each stadium record.' },
      { field: 'ticket_sales.sale_id', context: 'Identifies one ticket-sales transaction row.', answer: 'Primary key', why: 'It uniquely identifies each row in ticket_sales.' },
      { field: 'ticket_sales.match_id', context: 'Connects a ticket sale to the match it belongs to.', answer: 'Foreign key', why: 'It points from ticket_sales to matches.match_id.' },
      { field: 'matches.attendance', context: 'Stores the spectator count for a match.', answer: 'Normal field', why: 'It describes the match; it does not identify or connect rows.' },
      { field: 'campaigns.channel', context: 'Stores the marketing channel such as Email or Social.', answer: 'Normal field', why: 'It describes the campaign; it is not a key.' },
      { field: 'campaigns.match_id', context: 'Optional link from a campaign to the match it supports.', answer: 'Foreign key', why: 'Tricky but fair: it can be NULL, but when present it points to matches.match_id.' }
    ];
    let index = 0;
    const count = $('[data-key-count]', activity);
    const field = $('[data-key-field]', activity);
    const context = $('[data-key-context]', activity);
    const feedback = $('.feedback', activity);
    const buttons = $$('.quiz-options button', activity);
    const render = () => {
      const item = items[index];
      if (count) count.textContent = `${index + 1} / ${items.length}`;
      if (field) field.textContent = item.field;
      if (context) context.textContent = item.context;
      buttons.forEach((button) => {
        button.setAttribute('aria-pressed', 'false');
        button.classList.remove('correct', 'incorrect');
      });
      if (feedback) {
        feedback.textContent = '';
        feedback.className = 'feedback';
      }
    };
    buttons.forEach((button) => {
      button.addEventListener('click', () => {
        buttons.forEach((option) => {
          option.setAttribute('aria-pressed', 'false');
          option.classList.remove('correct', 'incorrect');
        });
        button.setAttribute('aria-pressed', 'true');
      });
    });
    $('[data-key-check]', activity)?.addEventListener('click', () => {
      const selected = $('.quiz-options button[aria-pressed="true"]', activity);
      if (!selected) {
        if (feedback) {
          feedback.textContent = 'Choose a role first.';
          feedback.className = 'feedback no';
        }
        return;
      }
      const item = items[index];
      const ok = selected.dataset.choice === item.answer;
      selected.classList.add(ok ? 'correct' : 'incorrect');
      if (feedback) {
        feedback.textContent = `${ok ? 'Correct.' : `Not quite. ${item.answer}.`} ${item.why}`;
        feedback.className = `feedback ${ok ? 'ok' : 'no'}`;
      }
    });
    $('[data-key-next]', activity)?.addEventListener('click', () => {
      index = (index + 1) % items.length;
      render();
    });
    $('[data-key-reset]', activity)?.addEventListener('click', () => {
      index = 0;
      render();
    });
    render();
  });

  const gradeOutput = $('[data-grade-output]');
  $$('[data-grade-detail]').forEach((segment) => {
    const show = () => {
      if (gradeOutput) gradeOutput.textContent = segment.dataset.gradeDetail;
    };
    segment.addEventListener('focus', show);
    segment.addEventListener('mouseenter', show);
    segment.addEventListener('click', show);
  });

  const participationOutput = $('[data-participation-output]');
  $$('[data-participation-detail]').forEach((button) => {
    const show = () => {
      if (participationOutput) participationOutput.textContent = button.dataset.participationDetail;
      $$('[data-participation-detail]').forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
    };
    button.addEventListener('click', show);
    button.addEventListener('focus', show);
  });

  function openHashDetails() {
    const hash = window.location.hash.slice(1);
    if (!hash) return;
    const target = document.getElementById(hash);
    if (!target) return;
    const details = target.tagName === 'DETAILS' ? target : target.closest('details');
    if (details) details.open = true;
    window.requestAnimationFrame(() => target.scrollIntoView({ block: 'start' }));
  }

  openHashDetails();
  window.addEventListener('hashchange', openHashDetails);

  const exampleOutput = $('[data-example-output]');
  $$('[data-example]').forEach((button) => {
    button.addEventListener('click', () => {
      if (exampleOutput) {
        exampleOutput.innerHTML = `<strong>${button.dataset.exampleTitle}</strong><p>${button.dataset.example}</p><p><strong>Assessment result:</strong> ${button.dataset.result}</p>`;
      }
      $$('[data-example]').forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
    });
  });

  function updateProgress() {
    const progress = $('[data-progress]');
    if (!progress) return;
    const quizzes = $$('[data-quiz]');
    const answered = quizzes.filter((quiz) => $('.quiz-options button[aria-pressed="true"]', quiz)).length;
    const total = quizzes.length;
    const value = total ? Math.round((answered / total) * 100) : 0;
    progress.value = value;
    const label = $('[data-progress-label]');
    if (label) label.textContent = `${value}% complete`;
  }

  const progressWrap = $('[data-progress]')?.closest('.progress-wrap');
  if (progressWrap && !$('.local-progress-note', progressWrap)) {
    const note = document.createElement('small');
    note.className = 'local-progress-note';
    note.textContent = 'Practice progress is temporary. Answers and completion reset whenever the page is opened or reloaded.';
    progressWrap.append(note);
  }

  function addLocalPublicationControl() {
    if (window.location.protocol !== 'file:') return;
    const match = window.location.pathname.match(/\/sessions\/(session-\d+|workshop-\d+)\//);
    const main = $('main');
    if (!match || !main || $('[data-local-publication-control]')) return;
    const courseItem = match[1];
    const control = document.createElement('section');
    control.className = 'local-publication-control';
    control.dataset.localPublicationControl = '';
    control.innerHTML = `
      <div>
        <span>Local instructor control</span>
        <strong>Publish ${courseItem} when it is ready</strong>
        <p>This control only appears when the HTML is opened locally. GitHub will ask you to confirm the course item and choose <b>publish</b>; no credential is stored in this page.</p>
      </div>
      <a class="button" href="https://github.com/dgmgz/ESBS_DataViz/actions/workflows/update-publication.yml" target="_blank" rel="noopener noreferrer">Publish this session on GitHub ↗</a>`;
    main.append(control);
  }

  addLocalPublicationControl();

  updateProgress();
})();
