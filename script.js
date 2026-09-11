/* ============================================================
   SETEMBRO AMARELO - Script.js
   Navegacao, jogos, quiz, mural, missoes, progresso e animacoes
   ============================================================ */

/* ---------- Helpers ---------- */
const $ = (sel, ctx) => (ctx || document).querySelector(sel);
const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));

/* ---------- Estado global (persistente) ---------- */
const STORAGE_KEY = 'setembroAmareloProgress';

function defaultState() {
  return {
    visited: [],
    quizConcluido: false,
    quizAcertos: 0,
    expConcluida: false,
    atitudeConcluida: false,
    atitudePontos: 0,
    missoesRealizadas: 0,
    pontos: 0,
    mural: []
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parcial = JSON.parse(raw);
    return Object.assign({}, defaultState(), parcial);
  } catch (e) {
    return defaultState();
  }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) { /* localStorage indisponivel */ }
}

let state = loadState();

/* ---------- Painel de progresso ---------- */
const TOTAL_SECTIONS = 11;

function computeProgress() {
  const visitedCount = Math.min(state.visited.length, TOTAL_SECTIONS);
  const points = Math.min(state.pontos, 100);
  const pct = Math.min(100, Math.round(
    (visitedCount * 60) / TOTAL_SECTIONS +
    (state.quizConcluido ? 10 : 0) +
    (state.expConcluida ? 10 : 0) +
    Math.min(state.missoesRealizadas * 2, 10) +
    points * 0.2
  ));
  return Math.min(100, Math.max(0, pct));
}

function updateProgressPanel() {
  const percent = computeProgress();
  const fill = $('#progressFill');
  const pctEl = $('#progressPercent');
  if (fill) fill.style.width = percent + '%';
  if (pctEl) pctEl.textContent = percent + '%';

  const set = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };
  set('statLecoes', state.visited.length);
  set('statQuiz', state.quizConcluido ? 1 : 0);
  set('statExp', state.expConcluida ? 1 : 0);
  set('statMissoes', state.missoesRealizadas);
  set('statPontos', state.pontos);
}

function markSectionVisited(id) {
  if (!state.visited.includes(id)) {
    state.visited.push(id);
    saveState();
    updateProgressPanel();
  }
}

function addPoints(n) {
  state.pontos += n;
  saveState();
  updateProgressPanel();
}

/* ---------- Navegacao fixa e menu mobile ---------- */
const navbar = $('#navbar');
const menuToggle = $('#menuToggle');
const navMenu = $('#navMenu');
const backTop = $('#backTop');

function updateNavOnScroll() {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
  backTop.classList.toggle('show', window.scrollY > 600);
}

function closeMenuMobile() {
  menuToggle.classList.remove('open');
  navMenu.classList.remove('open');
  menuToggle.setAttribute('aria-expanded', 'false');
}

function toggleMenu() {
  const isOpen = navMenu.classList.toggle('open');
  menuToggle.classList.toggle('open', isOpen);
  menuToggle.setAttribute('aria-expanded', String(isOpen));
}

menuToggle.addEventListener('click', function (e) {
  e.stopPropagation();
  toggleMenu();
});

document.addEventListener('click', function (e) {
  if (navMenu.classList.contains('open') && !navMenu.contains(e.target) && !menuToggle.contains(e.target)) {
    closeMenuMobile();
  }
});

$$('.nav-link').forEach(function (link) {
  link.addEventListener('click', closeMenuMobile);
});

window.addEventListener('scroll', function () {
  updateNavOnScroll();
  setActiveNavLink();
}, { passive: true });

function setActiveNavLink() {
  const sections = $$('main section[id]');
  const scrollPos = window.scrollY + 140;
  let currentId = '';
  sections.forEach(function (sec) {
    if (scrollPos >= sec.offsetTop) currentId = sec.id;
  });
  $$('.nav-link').forEach(function (link) {
    link.classList.toggle('active', link.getAttribute('href') === '#' + currentId);
  });
}

backTop.addEventListener('click', function () {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* ---------- Reveal ao rolar ---------- */
const revealObserver = new IntersectionObserver(function (entries) {
  entries.forEach(function (entry, i) {
    if (entry.isIntersecting) {
      const el = entry.target;
      setTimeout(function () { el.classList.add('visible'); }, (i % 4) * 90);
      revealObserver.unobserve(el);
    }
  });
}, { threshold: 0.12 });

$$('.reveal').forEach(function (el) { revealObserver.observe(el); });

/* ---------- Rastreamento de secoes visitadas ---------- */
const visitObserver = new IntersectionObserver(function (entries) {
  entries.forEach(function (entry) {
    if (entry.isIntersecting) markSectionVisited(entry.target.id);
  });
}, { threshold: 0.3 });

['inicio', 'setembro', 'saude-mental', 'preconceito', 'bullying', 'experiencia', 'atitude', 'quiz', 'como-ajudar', 'mitos', 'mural'].forEach(function (id) {
  const el = document.getElementById(id);
  if (el) visitObserver.observe(el);
});

/* ---------- Cards de preconceito (expandir) ---------- */
$$('.preconceito-btn').forEach(function (btn) {
  btn.addEventListener('click', function () {
    const card = btn.closest('.preconceito-card');
    const wasOpen = card.classList.contains('open');
    $$('.preconceito-card.open').forEach(function (c) {
      c.classList.remove('open');
      const b = c.querySelector('.preconceito-btn');
      if (b) b.setAttribute('aria-expanded', 'false');
    });
    if (!wasOpen) {
      card.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
    }
  });
});

/* ---------- Cards de mitos (virar) ---------- */
$$('.myth-card').forEach(function (card) {
  const flip = function () {
    const isFlipped = card.classList.toggle('flipped');
    card.setAttribute('aria-expanded', String(isFlipped));
  };
  card.addEventListener('click', flip);
  card.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      flip();
    }
  });
});

/* ============================================================
   6. EXPERIENCIA INTERATIVA - "E SE FOSSE COM VOCE?"
   ============================================================ */
const GAME_DATA = [
  {
    q: 'Voce percebe que um colega esta sendo deixado de lado por causa de sua aparencia.',
    options: [
      { text: 'A) Ignorar', good: false, feedback: 'Ignorar tambem e uma escolha - e pode reforcar a exclusao. Quando voce finge que nao viu, a pessoa que sofre fica ainda mais isolada.' },
      { text: 'B) Participar da brincadeira', good: false, feedback: 'Participar alimenta a situacao e aumenta a dor de quem esta sendo excluido. Xingamentos e piadas sobre a aparencia nunca sao inofensivos.' },
      { text: 'C) Se aproximar e tentar inclui-lo', good: true, feedback: 'Excelente escolha! Uma atitude simples de aproximacao pode fazer alguem se sentir visto e pertencente. Acolhimento comeca com um gesto.' }
    ]
  },
  {
    q: 'Em um grupo de mensagens, algumas pessoas comecam a fazer comentarios ofensivos sobre um colega.',
    options: [
      { text: 'A) Entrar na brincadeira', good: false, feedback: 'Entrar na brincadeira amplifica a ofensa e pode ter impacto enorme na pessoa - principalmente porque o conteudo digital se espalha rapido.' },
      { text: 'B) Nao participar e tentar interromper a situacao', good: true, feedback: 'Muito bem! Nao participar e tentar interromper mostra coragem e cuidado. Voce ajuda a mudar o clima e protege quem esta sendo atacado.' },
      { text: 'C) Compartilhar as mensagens', good: false, feedback: 'Compartilhar so aumenta a exposicao e a humilhacao. O certo e nao espalhar e buscar ajuda com um adulto de confianca.' }
    ]
  },
  {
    q: 'Uma pessoa nova chegou a escola e esta sozinha durante o intervalo.',
    options: [
      { text: 'A) Ignorar', good: false, feedback: 'Ignorar mantem a solidao. Ser nova escola ja e dificil; a indiferenca pode tornar o ambiente ainda mais dificil.' },
      { text: 'B) Fazer uma pergunta e tentar inclui-la', good: true, feedback: 'Que lindo passo! Uma pergunta simples e uma oferta de companhia podem transformar o intervalo de alguem e iniciar uma amizade.' },
      { text: 'C) Esperar outra pessoa falar primeiro', good: false, feedback: 'Entender - mas a iniciativa de quem espera pode fazer a pessoa nova esperar ainda mais. Voce pode ser a pessoa que mostra que se importa.' }
    ]
  }
];

const GAME_END_MESSAGE = 'Pequenas atitudes podem criar ambientes mais seguros e acolhedores.';

let gameIndex = 0;
let gameTotal = 0;

function renderGameStart() {
  $('#gameApp').innerHTML =
    '<div class="game-start">' +
    '<span class="game-end-icon">&#127982;</span>' +
    '<h3 class="game-end-title" style="color:var(--amarelo-grad-1);">Pronto para se colocar no lugar do outro?</h3>' +
    '<p style="color:#d5d5d5;">Voce vai passar por 3 situacoes ficticias. Cada boa escolha vale +10 pontos no progresso do projeto.</p>' +
    '<br>' +
    '<button class="btn btn-secondary game-start-btn" id="btnGameStart">Comecar a experiencia</button>' +
    '</div>';
  $('#btnGameStart').addEventListener('click', function () {
    gameIndex = 0;
    gameTotal = 0;
    renderGameStep();
  });
}

function renderGameStep() {
  const app = $('#gameApp');
  const data = GAME_DATA[gameIndex];
  const progress = (gameIndex / GAME_DATA.length) * 100;

  let html = '';
  html += '<div class="game-bar">';
  html += '<span>Situacao ' + (gameIndex + 1) + ' de ' + GAME_DATA.length + '</span>';
  html += '<span class="game-pontos">&#11088; ' + gameTotal + ' pts</span>';
  html += '</div>';
  html += '<div class="game-progress-track"><div class="game-progress-fill" style="width:' + progress + '%"></div></div>';
  html += '<p class="game-question">' + data.q + '</p>';
  html += '<div class="game-options">';
  data.options.forEach(function (opt, i) {
    html += '<button class="game-option" data-i="' + i + '">' + opt.text + '</button>';
  });
  html += '</div>';
  html += '<div class="game-feedback" id="gameFeedback"></div>';
  app.innerHTML = html;

  let answered = false;
  $$('.game-option', app).forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (answered) return;
      answered = true;
      const i = Number(btn.dataset.i);
      const opt = data.options[i];
      const feedback = $('#gameFeedback', app);

      const btns = $$('.game-option', app);
      btns.forEach(function (b) { b.disabled = true; });
      if (opt.good) btn.classList.add('correct');
      else btn.classList.add('incorrect');
      data.options.forEach(function (o, oi) {
        if (o.good) btns[oi].classList.add('correct');
      });

      feedback.classList.add(opt.good ? 'good' : 'low');
      let fbHtml = '';
      fbHtml += '<strong>' + (opt.good ? '&#128155; Atitude de cuidado!' : 'Reflita sobre essa escolha...') + '</strong><br>';
      fbHtml += opt.feedback + '<br><br>';
      fbHtml += '<button class="btn btn-primary game-btn-next" id="btnGameNext">' +
        (gameIndex + 1 < GAME_DATA.length ? 'Proxima situacao &#8594;' : 'Ver resultado &#127881;') +
        '</button>';
      feedback.innerHTML = fbHtml;
      requestAnimationFrame(function () { feedback.classList.add('show'); });

      if (opt.good) gameTotal += 10;

      $('#btnGameNext', app).addEventListener('click', function () {
        if (gameIndex + 1 < GAME_DATA.length) {
          gameIndex++;
          renderGameStep();
        } else {
          gameTotal = Math.min(gameTotal, 30);
          state.expConcluida = true;
          addPoints(gameTotal);
          saveState();
          updateProgressPanel();
          renderGameEnd();
        }
      });
    });
  });
}

function renderGameEnd() {
  const app = $('#gameApp');
  app.innerHTML =
    '<div class="game-end">' +
    '<span class="game-end-icon">&#127775;</span>' +
    '<h3 class="game-end-title">Experiencia concluida!</h3>' +
    '<div class="game-end-score">Sua pontuacao: ' + gameTotal + ' / 30</div>' +
    '<p>' + GAME_END_MESSAGE + '</p>' +
    '<p style="font-size:0.9rem; color:#bdbdbd;">Voce pontou por atitudes de acolhimento. Cada escolha ensina algo - continue praticando empatia no dia a dia.</p>' +
    '<button class="btn btn-secondary" id="btnGameReplay">Jogar novamente</button>' +
    '</div>';
  $('#btnGameReplay').addEventListener('click', function () {
    gameIndex = 0;
    gameTotal = 0;
    renderGameStart();
  });
}

/* ============================================================
   7. JOGO - ESCOLHA A ATITUDE
   ============================================================ */
const ATITUDE_DATA = [
  {
    q: 'Voce percebe que alguem esta quieto e parece estar passando por um momento dificil. O que voce pode fazer?',
    options: [
      { text: 'Fazer piada', good: false },
      { text: 'Ignorar', good: false },
      { text: 'Perguntar se esta tudo bem e ouvir sem julgar', good: true }
    ]
  },
  {
    q: 'Um colega foi excluido de um grupo do trabalho em grupo. O que voce faz?',
    options: [
      { text: 'Chama ele para fazer parte do seu grupo', good: true },
      { text: 'Fica quieto, sem se envolver', good: false },
      { text: 'Comenta com os outros', good: false }
    ]
  },
  {
    q: 'Voce ve um comentario preconceituoso em uma rede social. Qual a melhor atitude?',
    options: [
      { text: 'Compartilha para outras pessoas verem', good: false },
      { text: 'Denuncia e conversa com alguem de confianca', good: true },
      { text: 'Ri junto', good: false }
    ]
  },
  {
    q: 'Um colega esta sendo alvo de apelidos ofensivos. Como voce age?',
    options: [
      { text: 'Acha que e brincadeira e nao faz nada', good: false },
      { text: 'Defende o colega e conversa com um adulto da escola', good: true },
      { text: 'Faz mais piadas', good: false }
    ]
  },
  {
    q: 'Sua amiga esta quieta e triste na semana. O que voce faz?',
    options: [
      { text: 'Espera ela melhorar sozinha', good: false },
      { text: 'Pergunta como ela esta e oferece espaco para conversar', good: true },
      { text: 'Finge que nao percebeu', good: false }
    ]
  }
];

let atitudeIndex = 0;
let atitudeTotal = 0;

function renderAtitude() {
  const app = $('#atitudeApp');
  app.innerHTML =
    '<div class="game-start">' +
    '<span class="game-end-icon">&#128155;</span>' +
    '<h3 class="game-end-title" style="color:var(--amarelo-grad-1);">Vamos praticar boas atitudes?</h3>' +
    '<p style="color:#d5d5d5;">5 situacoes. Escolha a atitude mais acolhedora - cada acerto vale <strong>+10 pontos</strong>.</p>' +
    '<br>' +
    '<button class="btn btn-secondary game-start-btn" id="btnAtitudeStart">Comecar</button>' +
    '</div>';
  $('#btnAtitudeStart').addEventListener('click', function () {
    atitudeIndex = 0;
    atitudeTotal = 0;
    renderAtitudeStep();
  });
}

function renderAtitudeStep() {
  const app = $('#atitudeApp');
  const data = ATITUDE_DATA[atitudeIndex];
  const progress = (atitudeIndex / ATITUDE_DATA.length) * 100;

  let html = '';
  html += '<div class="game-bar">';
  html += '<span>Situacao ' + (atitudeIndex + 1) + ' de ' + ATITUDE_DATA.length + '</span>';
  html += '<span class="game-pontos">&#11088; ' + atitudeTotal + ' pts</span>';
  html += '</div>';
  html += '<div class="game-progress-track"><div class="game-progress-fill" style="width:' + progress + '%"></div></div>';
  html += '<p class="game-question">' + data.q + '</p>';
  html += '<div class="game-options">';
  data.options.forEach(function (opt, i) {
    html += '<button class="game-option" data-i="' + i + '">' + opt.text + '</button>';
  });
  html += '</div>';
  html += '<div class="game-feedback" id="atitudeFeedback"></div>';
  app.innerHTML = html;

  let answered = false;
  $$('.game-option', app).forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (answered) return;
      answered = true;
      const i = Number(btn.dataset.i);
      const opt = data.options[i];
      const fb = $('#atitudeFeedback', app);

      const bts = $$('.game-option', app);
      bts.forEach(function (b) { b.disabled = true; });
      if (opt.good) btn.classList.add('correct');
      else btn.classList.add('incorrect');
      data.options.forEach(function (o, oi) {
        if (o.good) bts[oi].classList.add('correct');
      });

      if (opt.good) atitudeTotal += 10;

      const sabeResposta = opt.good
        ? '<strong>+10 pontos!</strong> Essa atitude mostra empatia e cuidado. Continue assim!'
        : '<strong>Reflita:</strong> a atitude mais acolhedora e aquela que ajuda a pessoa a se sentir ouvida, respeitada e incluida.';

      fb.classList.add(opt.good ? 'good' : 'medium');
      let fbHtml = sabeResposta + '<br><br>';
      fbHtml += '<button class="btn btn-primary game-btn-next" id="btnAtitudeNext">' +
        (atitudeIndex + 1 < ATITUDE_DATA.length ? 'Proxima &#8594;' : 'Ver resultado') +
        '</button>';
      fb.innerHTML = fbHtml;
      requestAnimationFrame(function () { fb.classList.add('show'); });

      $('#btnAtitudeNext', app).addEventListener('click', function () {
        if (atitudeIndex + 1 < ATITUDE_DATA.length) {
          atitudeIndex++;
          renderAtitudeStep();
        } else {
          state.atitudeConcluida = true;
          state.atitudePontos = atitudeTotal;
          addPoints(atitudeTotal);
          saveState();
          updateProgressPanel();
          renderAtitudeEnd();
        }
      });
    });
  });
}

function renderAtitudeEnd() {
  const app = $('#atitudeApp');
  let resultado = '';
  let icon = '&#127793;';
  if (atitudeTotal === 0) {
    resultado = 'Voce pode aprender mais sobre acolhimento.';
    icon = '&#127793;';
  } else if (atitudeTotal > 0 && atitudeTotal <= 20) {
    resultado = 'Voce pode aprender mais sobre acolhimento.';
    icon = '&#127793;';
  } else if (atitudeTotal >= 30 && atitudeTotal <= 60) {
    resultado = 'Voce esta desenvolvendo boas atitudes.';
    icon = '&#128155;';
  } else if (atitudeTotal >= 70) {
    resultado = 'Voce demonstrou excelentes atitudes de empatia e acolhimento.';
    icon = '&#127942;';
  }

  app.innerHTML =
    '<div class="game-end">' +
    '<span class="game-end-icon">' + icon + '</span>' +
    '<h3 class="game-end-title">Seu resultado</h3>' +
    '<div class="game-end-score">' + atitudeTotal + ' pontos</div>' +
    '<p>' + resultado + '</p>' +
    '<p style="font-size:0.9rem; color:#bdbdbd;">Lembre-se: isso nao e um diagnostico psicologico. E um convite para praticar acolhimento no dia a dia.</p>' +
    '<button class="btn btn-secondary" id="btnAtitudeReplay">Jogar novamente</button>' +
    '</div>';
  $('#btnAtitudeReplay').addEventListener('click', function () {
    atitudeIndex = 0;
    atitudeTotal = 0;
    renderAtitude();
  });
}

/* ============================================================
   8. QUIZ
   ============================================================ */
const QUIZ_DATA = [
  {
    q: 'O que e bullying?',
    options: [
      'Brigas ocasionais entre colegas',
      'Agressoes repetidas, intencionais e voltadas a uma pessoa',
      'Um simples apelido carinhoso',
      'Uma forma de elogiar alguem'
    ],
    correct: 1,
    explain: 'Bullying e um conjunto de agressoes repetidas e intencionais - fisicas, verbais ou em forma de exclusao - que geram sofrimento em quem recebe.'
  },
  {
    q: 'O que e cyberbullying?',
    options: [
      'Bullying que acontece apenas na escola',
      'Agressoes digitais, como humilhacao e ofensas em redes e grupos',
      'Apenas fake news politicas',
      'Videos de jogos online'
    ],
    correct: 1,
    explain: 'Cyberbullying e o bullying no ambiente digital: comentarios ofensivos, exposicao indevida, grupos de exclusao e compartilhamento de conteudo para constranger.'
  },
  {
    q: 'O que significa acolher alguem?',
    options: [
      'Resolver todos os problemas da pessoa',
      'Fazer piadas para distrair',
      'Demonstrar presenca, respeito e escuta sem julgamento',
      'Fingir que nada esta acontecendo'
    ],
    correct: 2,
    explain: 'Acolher e estar presente, ouvir sem julgar e mostrar que a pessoa nao esta sozinha - sem tentar resolver tudo por ela.'
  },
  {
    q: 'O que e preconceito?',
    options: [
      'Opiniao pessoal sobre comida',
      'Julgar ou excluir alguem por caracteristicas como origem, religiao, aparencia ou identidade',
      'Uma atitude de cuidado e respeito',
      'Uma forma de curiosidade'
    ],
    correct: 1,
    explain: 'Preconceito e o julgamento ou exclusao de pessoas por caracteristicas como raca, orientacao sexual, condicao social, aparencia, entre outras.'
  },
  {
    q: 'O que e etarismo?',
    options: [
      'Preconceito contra pessoas mais velhas ou por faixa etaria',
      'Medo de insetos',
      'Estudo de estrelas',
      'Gostar de tecnologia'
    ],
    correct: 0,
    explain: 'Etarismo e o preconceito e a discriminacao relacionados a idade - contra idosos ou tambem contra pessoas jovens.'
  },
  {
    q: 'O que e capacitismo?',
    options: [
      'Esporte adaptado',
      'Preconceito contra pessoas com deficiencia',
      'Medo de elevadores',
      'Um tipo de comida'
    ],
    correct: 1,
    explain: 'Capacitismo e discriminar ou inferiorizar pessoas com deficiencia. Participa na ideia de que a deficiencia as torna menos capazes - o que nao e verdade.'
  },
  {
    q: 'Por que ouvir sem julgar e importante?',
    options: [
      'Para parecer uma pessoa boa',
      'Porque cria silencio',
      'Porque ajuda a pessoa a se sentir segura, respeitada e menos sozinha',
      'Para mudar de assunto'
    ],
    correct: 2,
    explain: 'Ouvir sem julgar permite que a pessoa se expresse com seguranca. Isso fortalece a confianca e o bem-estar emocional.'
  },
  {
    q: 'Quando alguem deve procurar ajuda?',
    options: [
      'So quando estiver em silencio total',
      'Quando o sofrimento e intenso, dura tempo ou atrapalha o dia a dia',
      'Nunca, e sinal de fraqueza',
      'So depois dos 18 anos'
    ],
    correct: 1,
    explain: 'Pedir ajuda e importante quando o sofrimento e intenso ou persistente - e tambem quando voce quer apoio para lidar com qualquer situacao dificil. Ajuda e um direito.'
  }
];

let quizIndex = 0;
let quizAcertos = 0;

function renderQuiz() {
  const app = $('#quizApp');
  app.innerHTML =
    '<div class="quiz-end">' +
    '<span class="quiz-end-icon" style="font-size:3.6rem;">&#129504;</span>' +
    '<h3 class="quiz-end-title">Pronto(a) para o Quiz?</h3>' +
    '<p class="quiz-end-message">8 perguntas de multipla escolha. Boa sorte!</p>' +
    '<button class="btn btn-primary" id="btnQuizStart">Comecar quiz</button>' +
    '</div>';
  $('#btnQuizStart').addEventListener('click', function () {
    quizIndex = 0;
    quizAcertos = 0;
    renderQuizStep();
  });
}

function renderQuizStep() {
  const app = $('#quizApp');
  const data = QUIZ_DATA[quizIndex];
  let html = '';
  html += '<div class="quiz-title">Pergunta ' + (quizIndex + 1) + ' de ' + QUIZ_DATA.length + '</div>';
  html += '<div class="quiz-counter">Acertos: ' + quizAcertos + '</div>';
  html += '<div class="quiz-question">' + data.q + '</div>';
  html += '<div>';
  data.options.forEach(function (opt, i) {
    html += '<button class="quiz-option" data-i="' + i + '">' + String.fromCharCode(65 + i) + ') ' + opt + '</button>';
  });
  html += '</div>';
  html += '<div class="quiz-explain" id="quizExplain"></div>';
  app.innerHTML = html;

  let answered = false;
  $$('.quiz-option', app).forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (answered) return;
      answered = true;
      const i = Number(btn.dataset.i);
      const bts = $$('.quiz-option', app);
      bts.forEach(function (b) { b.disabled = true; });
      if (i === data.correct) {
        quizAcertos++;
        btn.classList.add('correct');
      } else {
        btn.classList.add('incorrect');
        bts[data.correct].classList.add('correct');
      }
      bts.forEach(function (b) {
        if (b !== btn && b !== bts[data.correct]) b.classList.add('disabled-option');
      });

      const expl = $('#quizExplain', app);
      let explHtml = '';
      if (i === data.correct) {
        explHtml += '<strong>&#9989; Voce acertou!</strong><br>';
      } else {
        explHtml += '<strong>&#10060; A resposta correta e: ' + String.fromCharCode(65 + data.correct) + ') ' + data.options[data.correct] + '</strong><br>';
      }
      explHtml += data.explain + '<br><br>';
      explHtml += '<button class="btn btn-primary" id="btnQuizNext">' +
        (quizIndex + 1 < QUIZ_DATA.length ? 'Proxima pergunta &#8594;' : 'Ver resultado') +
        '</button>';
      expl.innerHTML = explHtml;
      requestAnimationFrame(function () { expl.classList.add('show'); });

      $('#btnQuizNext', app).addEventListener('click', function () {
        if (quizIndex + 1 < QUIZ_DATA.length) {
          quizIndex++;
          renderQuizStep();
        } else {
          state.quizConcluido = true;
          state.quizAcertos = quizAcertos;
          addPoints(quizAcertos * 5);
          saveState();
          updateProgressPanel();
          renderQuizEnd();
        }
      });
    });
  });
}

function renderQuizEnd() {
  const app = $('#quizApp');
  let msg = '';
  let icon = '&#127775;';
  if (quizAcertos === 8) { msg = 'Perfeito! Voce dominou o tema. Que lindo... continue ecoando acolhimento.'; icon = '&#127942;'; }
  else if (quizAcertos >= 6) { msg = 'Muito bem! Voce tem um bom conhecimento. Continue aprendendo.'; icon = '&#128155;'; }
  else if (quizAcertos >= 4) { msg = 'Bom trabalho! O importante e continuar aprendendo com cada pergunta.'; icon = '&#127793;'; }
  else { msg = 'Voce esta comecando essa jornada de conhecimento. Cada resposta e uma oportunidade de aprendizado.'; icon = '&#128214;'; }

  app.innerHTML =
    '<div class="quiz-end">' +
    '<span class="quiz-end-icon">' + icon + '</span>' +
    '<h3 class="quiz-end-title">Voce acertou ' + quizAcertos + ' de ' + QUIZ_DATA.length + ' perguntas.</h3>' +
    '<p class="quiz-end-message">' + msg + '</p>' +
    '<button class="btn btn-primary" id="btnQuizAgain">Jogar novamente</button>' +
    '</div>';
  $('#btnQuizAgain').addEventListener('click', function () {
    quizIndex = 0;
    quizAcertos = 0;
    renderQuizStep();
  });
}

/* ============================================================
   11. MURAL POSITIVO
   ============================================================ */
function renderMural() {
  const grid = $('#muralGrid');
  if (state.mural.length === 0) {
    grid.innerHTML = '<div class="mural-empty">&#128155; Seja a primeira pessoa a deixar uma mensagem de acolhimento.</div>';
    return;
  }
  grid.innerHTML = state.mural.map(function (msg) {
    return '<div class="mural-message">' +
      '<p>' + msg.text + '</p>' +
      '<small>' + msg.date + ' - Mensagem do mural</small>' +
      '</div>';
  }).join('');
}

$('#muralForm').addEventListener('submit', function (e) {
  e.preventDefault();
  const input = $('#muralInput');
  const text = input.value.trim();
  if (!text) return;
  const today = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  state.mural.unshift({ text: text, date: today });
  if (state.mural.length > 30) state.mural = state.mural.slice(0, 30);
  saveState();
  renderMural();
  input.value = '';
  input.focus();
});

/* ============================================================
   12. MISSAO DO DIA
   ============================================================ */
const MISSAO_DATA = [
  'Cumprimente alguem que normalmente fica sozinho.',
  'Pergunte a alguem como foi o dia.',
  'Escute alguem sem interromper.',
  'Faca um elogio sincero.',
  'Nao participe de uma brincadeira que humilhe outra pessoa.',
  'Inclua alguem em uma conversa.'
];

function novaMissao() {
  const text = $('#missaoText');
  const feedback = $('#missaoFeedback');
  text.style.opacity = '0';
  feedback.textContent = '';
  setTimeout(function () {
    const chosen = MISSAO_DATA[Math.floor(Math.random() * MISSAO_DATA.length)];
    text.textContent = chosen;
    text.style.opacity = '1';
  }, 250);
}

$('#resetProgress').addEventListener('click', function () {
  state = defaultState();
  localStorage.removeItem(STORAGE_KEY);
  updateProgressPanel();
  renderMural();
  novaMissao();
  renderGameStart();
  renderAtitude();
  renderQuiz();
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

$('#missaoNova').addEventListener('click', novaMissao);
$('#missaoConcluir').addEventListener('click', function () {
  state.missoesRealizadas += 1;
  addPoints(10);
  saveState();
  updateProgressPanel();
  const fb = $('#missaoFeedback');
  fb.textContent = '&#128155; Que lindo! Missao concluida - +10 pontos.';
  setTimeout(function () { fb.textContent = ''; }, 3000);
  novaMissao();
});

/* ============================================================
   INICIALIZACAO
   ============================================================ */
function init() {
  updateNavOnScroll();
  setActiveNavLink();
  renderGameStart();
  renderAtitude();
  renderQuiz();
  renderMural();
  novaMissao();
  updateProgressPanel();

  setTimeout(function () {
    $$('.reveal').forEach(function (el) {
      if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('visible');
    });
  }, 120);
}

document.addEventListener('DOMContentLoaded', init);