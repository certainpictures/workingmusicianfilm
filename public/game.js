(function () {
  // ===== SETTINGS =====
  // Which game shows on the page: "trueorbach", "brandenburg", or "off" to hide the section.
  // While it's "off" you can still preview a game privately by adding ?game=trueorbach
  // or ?game=brandenburg to the page address.
  const GAME = "trueorbach";
  // Where the button at the end of the game points
  const END_LINK = { text: "See the film", href: "#screenings" };

  const GAMES = {
    // ---------- TRUE OR BACH? ----------
    // answer: true, false, or "legend" (a legend reveals itself whichever button is picked)
    trueorbach: {
      title: "True or Bach?",
      intro: "Six stories from the film. Tap True or False.",
      choices: ["True", "False"],
      questions: [
        {
          prompt: "Frederick the Great handed Bach a melody and asked him to improvise a fugue on it, on the spot.",
          answer: true,
          reveal: "At the king's palace in Potsdam in 1747, Bach improvised a three-part fugue on the royal theme. Back home in Leipzig, he built a whole collection on it, The Musical Offering, and sent it to the king."
        },
        {
          prompt: "In Leipzig, Bach's job was to compose whenever inspiration struck.",
          answer: false,
          reveal: "He worked for the town council. In his first years there he wrote a new cantata for church services almost every week, while also teaching at the choir school."
        },
        {
          prompt: "Bach wrote the Brandenburg Concertos for the city of Brandenburg's orchestra.",
          answer: false,
          reveal: "In 1721 he sent them to the Margrave of Brandenburg, with a dedication that reads a lot like a job application. There's no record the Margrave ever had them performed."
        },
        {
          prompt: "During the Second World War, a librarian saved the original Brandenburg manuscript from destruction.",
          answer: "legend",
          reveal: "It's the story told in program notes all over the world, and the film tells it too. Whether it happened just that way is harder to pin down."
        },
        {
          prompt: "Bach's scores spell out everything, so performers have little left to decide.",
          answer: false,
          reveal: "Bach wrote out more ornaments than most composers of his day, and a critic complained about it. But he rarely marked tempos or dynamics, so musicians still debate speed, phrasing, and balance. You'll see plenty of that in rehearsal."
        },
        {
          prompt: "The Berkshire Bach Society has performed all six Brandenburg Concertos at New Year's for more than 30 years.",
          answer: true,
          reveal: "It's the Society's signature series, Bach at New Year's, and the film follows the musicians as they prepare for it."
        }
      ]
    },

    // ---------- WHICH BRANDENBURG? ----------
    // answer: the concerto number. audio: optional clip path, e.g. "media/clips/brandenburg-2.mp3"
    brandenburg: {
      title: "Which Brandenburg?",
      intro: "Bach wrote six concertos for the Margrave of Brandenburg, and no two sound alike. Match each clue to its concerto.",
      choices: ["No. 1", "No. 2", "No. 3", "No. 4", "No. 5", "No. 6"],
      questions: [
        {
          prompt: "A trumpet part so high that trumpeters still dread it.",
          answer: 2, audio: "",
          reveal: "The trumpet shares the solo spotlight with recorder, oboe, and violin, playing in a register that's still among the hardest in the repertoire."
        },
        {
          prompt: "No violins at all. The violas lead.",
          answer: 6, audio: "",
          reveal: "Two violas take the top line over two violas da gamba, cello, and continuo, which gives it a darker, warmer sound."
        },
        {
          prompt: "Its slow movement is just two chords.",
          answer: 3, audio: "",
          reveal: "The middle movement is a single cadence, which players often open up with an improvised solo. Around it: three violins, three violas, and three cellos."
        },
        {
          prompt: "The harpsichord, usually in the background, takes over with a long solo.",
          answer: 5, audio: "",
          reveal: "After the flute and violin have their say, the harpsichord launches into a cadenza more than 60 bars long. It's sometimes called the first keyboard concerto."
        },
        {
          prompt: "Brings the hunt indoors with two horns.",
          answer: 1, audio: "",
          reveal: "Two hunting horns, three oboes, bassoon, and a small, high-tuned violin. The horn calls come straight from the aristocratic hunt."
        },
        {
          prompt: "A solo violin races between two recorders.",
          answer: 4, audio: "",
          reveal: "Bach called for two \u201cecho flutes,\u201d usually played on recorders, and gave the violin one of the most demanding parts in the set."
        }
      ]
    }
  };

  // ===== GAME ENGINE (no need to edit below) =====
  const root = document.getElementById("bachGame");
  if (!root) return;
  const game = GAMES[new URLSearchParams(location.search).get("game")] || GAMES[GAME];
  if (!game) {
    const section = root.closest("section");
    (section || root).style.display = "none";
    return;
  }
  const isNumbered = typeof game.questions[0].answer === "number";
  let i = 0, score = 0;

  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  function valueOf(choiceIndex) {
    if (isNumbered) return choiceIndex + 1;
    return choiceIndex === 0; // True / False
  }

  function renderShell() {
    root.innerHTML =
      '<div class="bg">' +
        '<h2 class="bg__title">' + esc(game.title) + '</h2>' +
        '<p class="bg__intro">' + esc(game.intro) + '</p>' +
        '<div class="bg__card" aria-live="polite"></div>' +
      '</div>';
  }

  function renderQuestion() {
    const q = game.questions[i];
    const card = root.querySelector(".bg__card");
    card.innerHTML =
      '<p class="bg__progress">' + (i + 1) + ' of ' + game.questions.length + '</p>' +
      '<p class="bg__prompt">' + esc(q.prompt) + '</p>' +
      (q.audio ? '<audio class="bg__audio" controls preload="none" src="' + esc(q.audio) + '"></audio>' : '') +
      '<div class="bg__choices' + (isNumbered ? ' bg__choices--grid' : '') + '">' +
        game.choices.map((c, n) => '<button class="bg__btn" type="button" data-n="' + n + '">' + esc(c) + '</button>').join('') +
      '</div>' +
      '<div class="bg__reveal" hidden></div>';
    card.querySelectorAll(".bg__btn").forEach(b => b.addEventListener("click", () => answer(+b.dataset.n)));
  }

  function answer(n) {
    const q = game.questions[i];
    const card = root.querySelector(".bg__card");
    const buttons = [...card.querySelectorAll(".bg__btn")];
    const legend = q.answer === "legend";
    const right = legend || valueOf(n) === q.answer;
    if (right) score++;
    buttons.forEach((b, k) => {
      b.disabled = true;
      if (!legend && valueOf(k) === q.answer) b.classList.add("is-right");
      if (k === n && !right) b.classList.add("is-picked");
    });
    let verdict;
    if (legend) verdict = "Legend.";
    else if (isNumbered) verdict = (right ? "Yes, " : "Not quite. It's ") + "No. " + q.answer + ".";
    else verdict = (right ? "Right, it\u2019s " : "Not quite. It\u2019s ") + (q.answer ? "true." : "false.");
    const last = i === game.questions.length - 1;
    const reveal = card.querySelector(".bg__reveal");
    reveal.innerHTML =
      '<p class="bg__verdict">' + verdict + '</p>' +
      '<p>' + esc(q.reveal) + '</p>' +
      '<button class="bg__next" type="button">' + (last ? "See your score" : "Next") + '</button>';
    reveal.hidden = false;
    const next = reveal.querySelector(".bg__next");
    next.addEventListener("click", () => { if (last) renderEnd(); else { i++; renderQuestion(); } });
    next.focus();
  }

  function renderEnd() {
    const total = game.questions.length;
    const card = root.querySelector(".bg__card");
    card.innerHTML =
      '<p class="bg__progress">Done</p>' +
      '<p class="bg__prompt">You got ' + score + ' of ' + total + '.</p>' +
      '<p style="margin-top:.75rem">The rest of the story is in the film.</p>' +
      '<div class="bg__end-links">' +
        '<a href="' + esc(END_LINK.href) + '">' + esc(END_LINK.text) + '</a>' +
        '<button class="bg__again" type="button">Play again</button>' +
      '</div>';
    card.querySelector(".bg__again").addEventListener("click", () => { i = 0; score = 0; renderQuestion(); });
  }

  renderShell();
  renderQuestion();
})();
