/* Local classroom prototype: scores are rule-based and saved in this browser. */
const CLASS_TO_MAJOR = {
  "26-机车124班": "train",
  "26-机车125班": "train",
  "26-城轨信号53班": "signal",
  "26-城轨信号54班": "signal",
  "26-储能技术01班": "energy",
};

const TASKS = {
  train: {
    page: "writing-train.html",
    entryLabel: "机车",
    major: "机车运用与维修",
    scene: "机车实训室里的一次帮助",
    image: "./writing-train.jpg",
    photoCredit: { name: "Winston Chen / Unsplash", url: "https://unsplash.com/photos/blue-train-cars-in-a-large-industrial-workshop-ZOhF1U2nbYU" },
    brief: "周一下午，你第一次走进学校的机车实训室。老师让大家给机车模型的部件贴英文标签。你找不到制动装置（<b>brake</b>），十分紧张。同组的李明拿来示意图（<b>diagram</b>），陪你一起寻找。最后你贴对了标签，心里有了信心。可以适当补充当时的动作或心理活动。",
    answers: ["Monday afternoon", "locomotive training room", "Li Ming", "brought a diagram and helped me", "confident"],
    checks: [
      v => /monday/.test(v) && /afternoon/.test(v),
      v => /(locomotive|train)/.test(v) && /(training room|lab|workshop)/.test(v),
      v => /li ming/.test(v),
      v => /diagram/.test(v) && /(help|look|check|find|show|bring|brought)/.test(v),
      v => /(confident|confidence|less nervous|not nervous)/.test(v),
    ],
    notes: [
      "时间写作 Monday afternoon；放进句子时可写 On Monday afternoon。",
      "地点可用 locomotive training room，也可以用 train workshop。",
      "人物姓名用英语拼音 Li Ming，首字母大写。",
      "关键动作要写出 diagram 和帮助寻找，而不只写 helped me。",
      "结尾写心情变化：nervous → confident。",
    ],
    scaffoldHints: ["Monday afternoon / locomotive training room", "nervous / everything was new", "find the brake / stood there worried", "Li Ming / look at a diagram", "put the label in the right place / confident"],
    essayChecks: {
      background: text => /monday afternoon/i.test(text) && /(locomotive|train).{0,25}(room|lab|workshop)/i.test(text),
      problem: text => /brake/i.test(text) && /(could not|couldn't|did not|didn't|unable|hard to|trouble|problem)/i.test(text),
      helper: text => /li ming/i.test(text) && /diagram/i.test(text),
      ending: text => /(label|brake)/i.test(text) && /(confident|confidence|better|less nervous)/i.test(text),
    },
    evidence: ["写明周一下午和机车实训室", "写明找不到 brake 的困难", "写明 Li Ming 与 diagram 的帮助", "写明贴好标签和信心变化"],
    sample: "On Monday afternoon, I had my first class in the locomotive training room. At first, I felt nervous because everything was new. I could not find the brake on the model, so I stood there worried. My classmate Li Ming helped me look at a diagram. We found the brake together, and I put the label in the right place. At last, I finished the task. I felt more confident and learned that a little help can make a big difference.",
  },
  signal: {
    page: "writing-signal.html",
    entryLabel: "城轨信号",
    major: "城轨信号",
    scene: "线路模拟中的一份支持",
    image: "./writing-signal.jpg",
    photoCredit: { name: "Piron Guillaume / Unsplash", url: "https://unsplash.com/photos/black-train-control-room-xeeqasU67H8" },
    brief: "周二上午，你第一次在城轨信号实训室做线路模拟练习。你在电脑上选错了线路，屏幕出现红色提示，你不知所措。搭档王晓拿出线路图（<b>route map</b>），和你一起核对。你们找到错误，重新完成任务。你放松下来，感受到同伴的支持。可以适当补充当时的动作或心理活动。",
    answers: ["Tuesday morning", "metro signal lab", "Wang Xiao", "checked the route map with me", "relaxed"],
    checks: [
      v => /tuesday/.test(v) && /morning/.test(v),
      v => /(metro|signal|rail)/.test(v) && /(lab|room|workshop)/.test(v),
      v => /wang xiao/.test(v),
      v => /(map|route)/.test(v) && /(check|look|compare|help|find)/.test(v),
      v => /(relaxed|relieved|less nervous|calm|supported)/.test(v),
    ],
    notes: [
      "时间写作 Tuesday morning；完整句通常以 On Tuesday morning 开头。",
      "地点可写 metro signal lab，也可写 signal training room。",
      "人物姓名 Wang Xiao 的两个词首字母大写。",
      "关键动作是一起核对 route map，写出具体帮助。",
      "结尾写心情变化：worried → relaxed。",
    ],
    scaffoldHints: ["Tuesday morning / metro signal lab", "nervous / it was my first practice", "choose the right route / felt worried", "Wang Xiao / check the route map", "finished the task / relaxed"],
    essayChecks: {
      background: text => /tuesday morning/i.test(text) && /(metro|signal).{0,25}(lab|room)/i.test(text),
      problem: text => /(wrong route|chose the wrong|red warning|red mark|red sign)/i.test(text),
      helper: text => /wang xiao/i.test(text) && /(route map|map)/i.test(text),
      ending: text => /(finish|finished|complete|completed|found the mistake)/i.test(text) && /(relaxed|relieved|better|support)/i.test(text),
    },
    evidence: ["写明周二上午和信号实训室", "写明选错线路或红色提示", "写明 Wang Xiao 与线路图的帮助", "写明完成任务和放松下来的感受"],
    sample: "On Tuesday morning, I had my first class in the metro signal lab. At first, I felt nervous because the practice was new to me. I could not choose the right route, so a red warning appeared on the screen. My classmate Wang Xiao helped me check a route map. We found my mistake and tried again. At last, we finished the task. I felt relaxed and learned that asking for help was a good way to learn.",
  },
  energy: {
    page: "writing-energy.html",
    entryLabel: "储能技术",
    major: "储能技术",
    scene: "认真询问带来的安心",
    image: "./writing-energy.jpg",
    photoCredit: { name: "ThisisEngineering / Unsplash", url: "https://unsplash.com/photos/person-in-purple-long-sleeve-shirt-and-white-pants-sitting-on-gray-and-black-digital-device-xNT8lMad0YA" },
    brief: "周五下午，你第一次来到储能实训室。你们需要观察电池模型并填写记录表。你看不懂旁边的英文安全提示（<b>safety notes</b>），担心出错，便停下来询问。同组的张婷陪你读提示，还和你一起请教老师。老师耐心解释后，你们完成了任务。你感到安心，也感到自己被接纳。可以适当补充当时的动作或心理活动。",
    answers: ["Friday afternoon", "energy storage lab", "Zhang Ting", "read the safety notes with me", "safe and welcome"],
    checks: [
      v => /friday/.test(v) && /afternoon/.test(v),
      v => /(energy|storage|battery)/.test(v) && /(lab|room|workshop)/.test(v),
      v => /zhang ting/.test(v),
      v => /(safety|notes|instructions)/.test(v) && /(read|help|check|ask|explain)/.test(v),
      v => /(safe|welcome|welcomed|relaxed|comfortable|accepted)/.test(v),
    ],
    notes: [
      "时间写作 Friday afternoon；完整句可写 On Friday afternoon。",
      "地点写 energy storage lab，词组要完整。",
      "人物姓名 Zhang Ting 的两个词首字母大写。",
      "关键动作是一起读 safety notes，也可以提到请教老师。",
      "结尾写心情变化：worried → safe and welcome。",
    ],
    scaffoldHints: ["Friday afternoon / energy storage lab", "worried / I did not understand the notes", "understand the safety notes / stopped and asked", "Zhang Ting / read the notes with me", "completed the record sheet / safe and welcome"],
    essayChecks: {
      background: text => /friday afternoon/i.test(text) && /(energy storage|battery).{0,20}(lab|room)/i.test(text),
      problem: text => /(safety notes|safety instructions)/i.test(text) && /(could not|couldn't|did not|didn't|understand|worried)/i.test(text),
      helper: text => /zhang ting/i.test(text) && /(read|notes|teacher)/i.test(text),
      ending: text => /(finish|finished|complete|completed|record sheet)/i.test(text) && /(safe|welcome|welcomed|accepted|better)/i.test(text),
    },
    evidence: ["写明周五下午和储能实训室", "写明看不懂 safety notes", "写明 Zhang Ting 一起读提示并请教老师", "写明完成记录和安心、被接纳的感受"],
    sample: "On Friday afternoon, I had my first class in the energy storage lab. At first, I felt worried because I did not understand the English safety notes. I could not read them all, so I stopped and asked for help. My classmate Zhang Ting helped me read the notes. Then our teacher explained them patiently. At last, we completed the record sheet. I felt safe and welcome. I learned that careful questions and kind help can make a new place feel friendly.",
  },
};

const FIELD_LABELS = ["Time 时间", "Place 地点", "Helper 帮助者", "What the helper did 具体帮助", "Feeling at the end 最后的感受"];
const SCAFFOLDS = [
  { name: "背景", frame: "On ..., I had my first class in ... ." },
  { name: "起初心情", frame: "At first, I felt ... because ... ." },
  { name: "遇到困难", frame: "I could not ..., so I ... ." },
  { name: "得到帮助", frame: "My classmate ... helped me ... ." },
  { name: "结果和感受", frame: "At last, ... . I felt ... ." },
];
const PROFILE_KEY = "warm-campus-writing-profile-v1";
let currentView = "class";

function normalize(value) {
  return String(value || "").toLowerCase().replace(/[’']/g, "'").replace(/[^a-z0-9\s'-]/g, " ").replace(/\s+/g, " ").trim();
}
function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}
function readJSON(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
}
function saveJSON(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
function stateKey(profile, major) { return `warm-campus-writing-v1:${profile.className}:${profile.name}:${major}`; }
function majorForClass(className) { return CLASS_TO_MAJOR[className] || (/储能/.test(className) ? 'energy' : /信号/.test(className) ? 'signal' : /机车/.test(className) ? 'train' : ''); }
function routeForClass(className) { return TASKS[majorForClass(className)]?.page; }

function initHome() {
  const identity = window.JulyLesson2.identity();
  if (identity) {
    const profile = { name: identity.student.name, className: identity.student.className };
    saveJSON(PROFILE_KEY, profile);
    const route = routeForClass(profile.className);
    if (route) { window.location.replace(route); return; }
    const form = document.getElementById('profile-form'); form.replaceChildren();
    document.getElementById('entry-title').textContent = profile.name + '，请选择写作专业';
    Object.entries(TASKS).forEach(([major, task]) => {
      const button = document.createElement('button'); button.type = 'button'; button.className = 'button button-primary'; button.style.margin = '8px'; button.textContent = task.entryLabel;
      button.onclick = () => { saveJSON(PROFILE_KEY, { ...profile, writingMajor: major }); location.href = task.page; }; form.appendChild(button);
    }); return;
  }
  const form = document.getElementById("profile-form");
  const nameInput = document.getElementById("student-name");
  const classInput = document.getElementById("student-class");
  form.addEventListener("submit", event => {
    event.preventDefault();
    const name = nameInput.value.trim().replace(/\s+/g, " ");
    const className = classInput.value;
    const error = document.getElementById("profile-error");
    if (name.length < 2 || !CLASS_TO_MAJOR[className]) {
      error.textContent = "请填写至少两个字的姓名，并选择班级。";
      error.hidden = false;
      return;
    }
    error.hidden = true;
    saveJSON(PROFILE_KEY, { name, className });
    window.location.href = routeForClass(className);
  });
}

function gradeQuiz(task, values) {
  const details = values.map((value, index) => task.checks[index](normalize(value)));
  return { score: details.filter(Boolean).length, details };
}

function scaffoldMatches(text) {
  const rules = [
    ["On …, I had my first class in …", /\bon\b[^.!?]{3,90}\bi had my first class in\b/i],
    ["At first, I felt … because …", /\bat first,?\s+i felt\b[^.!?]{3,90}\bbecause\b/i],
    ["I could not …, so I …", /\bi could not\b[^.!?]{1,95}\bso i\b/i],
    ["My classmate … helped me …", /\bmy classmate\b[^.!?]{1,70}\bhelped me\b/i],
    ["At last, … I felt …", /\bat last,?\s+[^.!?]{2,100}\bi felt\b/i],
  ];
  return rules.filter(([, rule]) => rule.test(text)).map(([label]) => label);
}

function gradeEssay(task, text) {
  const clean = text.trim().replace(/\s+/g, " ");
  const words = clean.match(/[A-Za-z]+(?:['’][A-Za-z]+)?/g) || [];
  const matchedFrames = scaffoldMatches(clean);
  const noFrames = matchedFrames.length === 0;
  const pastForms = clean.match(/\b(was|were|had|went|entered|walked|felt|asked|could|did|noticed|brought|looked|found|put|chose|appeared|took|checked|finished|completed|read|explained|learned|made|stopped|helped)\b/gi) || [];
  const checks = [
    task.essayChecks.background(clean),
    task.essayChecks.problem(clean),
    task.essayChecks.helper(clean),
    task.essayChecks.ending(clean),
    words.length >= 65 && words.length <= 115 && matchedFrames.length >= 2 && pastForms.length >= 3,
  ];
  const score = checks.filter(Boolean).length;
  return { score, checks, wordCount: words.length, matchedFrames, noFrames, pastCount: pastForms.length };
}

function renderScaffoldList(state, editable) {
  if (editable) {
    return `<section class="scaffold-panel" id="scaffold-panel"><h3>句子支架：先填，再写整段</h3><p>用自己的信息补完整句子。课后写作时可参考这些句型，把故事连成一个自然的段落。</p><div class="scaffold-list">${SCAFFOLDS.map((item, i) => `<div class="scaffold-row"><label for="scaffold-${i}">${i + 1}. ${item.name}</label><small>${escapeHTML(item.frame)}</small><input id="scaffold-${i}" type="text" data-scaffold="${i}" value="${escapeHTML((state.scaffolds || [])[i] || "")}" placeholder="提示：${escapeHTML(TASKS[document.body.dataset.major].scaffoldHints[i])}" maxlength="180"/></div>`).join("")}</div></section>`;
  }
  return `<aside class="scaffold-side"><h3>你填过的句子支架</h3><p>把合适的句子放进正文，并补上必要的连接与细节。</p><ol>${SCAFFOLDS.map((item, i) => `<li>${escapeHTML(item.frame)}${(state.scaffolds || [])[i] ? `<span class="filled">你写的：${escapeHTML(state.scaffolds[i])}</span>` : ""}</li>`).join("")}</ol><div class="rubric-preview">评分会核对故事信息、经过、结果与感受。请使用至少一个提供的句型；未使用支架时，请补充合适的句型。老师会结合原文复核评分。</div></aside>`;
}

function renderQuizResult(task, state) {
  if (!state.quiz) return "";
  return `<section class="result-card" id="class-result" aria-live="polite"><div class="result-head"><h3>课堂填空成绩</h3><div class="score-badge">${state.quiz.score} / 5 分</div></div><ul class="answer-list">${task.answers.map((answer, i) => `<li><span class="${state.quiz.details[i] ? "yes" : "no"}">${state.quiz.details[i] ? "✓ 得分" : "✕ 未得分"}</span>　${i + 1}. ${escapeHTML(FIELD_LABELS[i])}<br/><strong>参考答案：</strong>${escapeHTML(answer)}</li>`).join("")}</ul><div class="tip-box"><h4>答题注意要点</h4><ul>${task.notes.map(note => `<li>${escapeHTML(note)}</li>`).join("")}</ul></div></section>${renderScaffoldList(state, !state.essayResult)}<div class="form-actions"><span class="helper-copy">课堂填空已评分；现在可以进入课后写作。</span><button type="button" class="button button-primary" id="go-homework">进入课后写作</button></div>`;
}

function renderClass(task, state) {
  const locked = !!state.quiz;
  return `<section class="panel" aria-labelledby="class-title"><div class="section-heading"><div><h2 id="class-title">课上 · 五项信息填空</h2><p>读中文情境，用英语填写五项故事信息。提交后立即公布答案和注意要点。</p></div><span class="point-tag">满分 5 分</span></div><p class="story-brief">${task.brief}</p><form id="quiz-form" novalidate><div class="quiz-grid">${FIELD_LABELS.map((label, i) => `<div class="quiz-field"><label for="quiz-${i}">${i + 1}. ${escapeHTML(label)}</label><input id="quiz-${i}" name="q${i}" type="text" value="${escapeHTML((state.quizAnswers || [])[i] || "")}" placeholder="用英语填写" ${locked ? "disabled" : "required"}/></div>`).join("")}</div>${!locked ? `<div class="form-actions"><span class="helper-copy">每题 1 分。请先独立完成，再查看答案。</span><button class="button button-primary" type="submit">提交课堂填空并评分</button></div><p class="form-error" id="quiz-error" role="alert" hidden></p>` : ""}</form>${renderQuizResult(task, state)}</section>`;
}

function renderEssayResult(task, state) {
  if (!state.essayResult) return "";
  const result = state.essayResult;
  const descriptions = [...task.evidence, "表达：65—115 词、至少 2 个指定句型、过去时动词不少于 3 处"];
  return `<section class="result-card" id="essay-result" aria-live="polite"><div class="result-head"><h3>课后写作成绩</h3><div class="score-badge">${result.score} / 5 分</div></div>${result.noFrames ? `<div class="ai-flag"><strong>未检出提供的句型，请补充句子支架。</strong><br/>自动评分按故事信息和表达要求给分，老师可以查看原文进行复核。</div>` : ""}<div class="grade-list">${descriptions.map((desc, i) => `<div class="grade-item"><span>${escapeHTML(desc)}<small>${i === 4 ? `实际 ${result.wordCount} 词；检出 ${result.matchedFrames.length} 个指定句型；过去时词形 ${result.pastCount} 处。` : result.checks[i] ? "正文中检出了对应信息。" : "正文中缺少可识别的对应信息，可请老师复核表达。"}</small></span><strong>${result.checks[i] ? "1 分" : "0 分"}</strong></div>`).join("")}</div><p class="helper-copy" style="margin:16px 0 0">句型识别：${result.matchedFrames.length ? result.matchedFrames.map(escapeHTML).join("；") : "无"}。以上为规则辅助评分，教师可结合实际表达复核。</p><div class="sample-answer"><h4>参考写法（提交后展示）</h4><p>${escapeHTML(task.sample)}</p></div></section><section class="total-card" aria-label="总分评定"><h3>本次练习总分</h3><div class="total-grid"><div><span>课堂填空</span><strong>${state.quiz.score} / 5</strong></div><div><span>课后写作</span><strong>${result.score} / 5</strong></div><div><span>合计</span><strong>${state.quiz.score + result.score} / 10</strong></div></div><div class="form-actions"><span class="helper-copy" style="color:#d5e1e7">姓名：${escapeHTML(readJSON(PROFILE_KEY, {}).name)}　班级：${escapeHTML(readJSON(PROFILE_KEY, {}).className)}</span><button class="button button-secondary" id="print-score" type="button">打印评分结果</button></div></section>`;
}

function renderHomework(task, state) {
  if (!state.quiz) return "";
  const submitted = !!state.essayResult;
  return `<section class="panel" aria-labelledby="homework-title"><div class="section-heading"><div><h2 id="homework-title">课后 · 完成整段写作</h2><p>以 <em>A Warm Moment on Campus</em> 为题，根据课堂信息写一个约 80 词的英文段落。</p></div><span class="point-tag">满分 5 分</span></div><div class="homework-layout"><div><p class="story-brief">${task.brief}</p><h3 class="essay-title">A Warm Moment on Campus</h3><form id="essay-form" novalidate><label class="visually-hidden" for="essay-text">英文作文正文</label><textarea id="essay-text" class="essay-editor" placeholder="在这里写一个完整的英文段落……" ${submitted ? "disabled" : ""}>${escapeHTML(state.essay || "")}</textarea><div class="word-row"><span>建议 65—115 词；以一般过去时叙述。</span><strong id="word-count">0 词</strong></div>${!submitted ? `<p class="form-error" id="essay-error" role="alert" hidden></p><div class="form-actions"><span class="helper-copy">提交后立即给出 5 分评分依据和 10 分总分。</span><button class="button button-primary" type="submit">提交课后作文并评分</button></div>` : ""}</form></div>${renderScaffoldList(state, false)}</div>${renderEssayResult(task, state)}</section>`;
}

function initPractice() {
  const major = document.body.dataset.major;
  const task = TASKS[major];
  const identity = window.JulyLesson2.identity();
  const stored = readJSON(PROFILE_KEY, null);
  const profile = identity ? { name: identity.student.name, className: identity.student.className, writingMajor: stored?.name === identity.student.name && stored?.className === identity.student.className ? stored.writingMajor : '' } : null;
  if (!task || !profile || (majorForClass(profile.className) || profile.writingMajor) !== major) {
    window.location.replace("./school-writing-practice.html");
    return;
  }
  saveJSON(PROFILE_KEY, profile);
  const key = stateKey(profile, major);
  let state = readJSON(key, { quizAnswers: ["", "", "", "", ""], scaffolds: ["", "", "", "", ""], essay: "" });
  const app = document.getElementById("app");

  function persist() { saveJSON(key, state); }
  function render() {
    app.innerHTML = `<div class="page-shell practice-shell"><header class="site-header"><div class="brand"><span class="brand-mark">W</span><span>校园里的第一份温暖</span></div><span class="header-note">英语 B 级 · 记叙文写作专项</span></header><div class="practice-header"><div class="student-meta"><span class="student-pill">${escapeHTML(profile.name)}</span><span class="student-pill">${escapeHTML(profile.className)}</span></div><button class="text-button" type="button" id="switch-student">更换学生</button></div><section class="context-banner"><div class="context-copy"><div class="eyebrow">${escapeHTML(task.major)} · 写作练习</div><h1>A Warm Moment on Campus</h1><p>${escapeHTML(task.scene)}　｜　课上 5 分 + 课后 5 分</p></div><img class="context-photo" src="${task.image}" alt="${escapeHTML(task.scene)}的实训情境照片" onerror="this.replaceWith(Object.assign(document.createElement('div'),{className:'context-fallback'}))"/></section><nav class="step-nav" aria-label="练习步骤"><button type="button" class="step-tab ${currentView === "class" ? "active" : ""}" id="tab-class" aria-current="${currentView === "class" ? "step" : "false"}"><span class="step-number">1</span><span>课堂填空<small>${state.quiz ? `已得 ${state.quiz.score} / 5 分` : "完成后公布答案"}</small></span></button><button type="button" class="step-tab ${currentView === "homework" ? "active" : ""}" id="tab-homework" ${state.quiz ? "" : "disabled"} aria-current="${currentView === "homework" ? "step" : "false"}"><span class="step-number">2</span><span>课后写作<small>${state.quiz ? state.essayResult ? `已得 ${state.essayResult.score} / 5 分` : "入口已开放" : "完成课堂填空后开放"}</small></span></button></nav>${currentView === "homework" && state.quiz ? renderHomework(task, state) : renderClass(task, state)}<footer class="site-footer">课堂练习 · 草稿自动保存，提交内容同步至教师档案 · 配图：<a href="${task.photoCredit.url}" target="_blank" rel="noopener noreferrer">${escapeHTML(task.photoCredit.name)}</a></footer></div>`;
    bind();
  }
  function bind() {
    document.getElementById("switch-student").addEventListener("click", () => { window.JulyLesson2.changeStudent(); });
    document.getElementById("tab-class").addEventListener("click", () => { currentView = "class"; render(); window.scrollTo(0, 0); });
    document.getElementById("tab-homework").addEventListener("click", () => { if (state.quiz) { currentView = "homework"; render(); window.scrollTo(0, 0); } });
    const quizForm = document.getElementById("quiz-form");
    if (quizForm && !state.quiz) {
      quizForm.querySelectorAll("input").forEach((input, i) => input.addEventListener("input", () => { state.quizAnswers[i] = input.value; persist(); }));
      quizForm.addEventListener("submit", event => {
        event.preventDefault();
        const values = [...quizForm.querySelectorAll("input")].map(input => input.value.trim());
        if (values.some(value => !value)) {
          const error = document.getElementById("quiz-error");
          error.textContent = "请先完成五道填空题。"; error.hidden = false; return;
        }
        state.quizAnswers = values;
        state.quiz = { ...gradeQuiz(task, values), submittedAt: new Date().toISOString() };
        void window.JulyLesson2.submit({ activity: "writingClass", major, answers: values }).then(queued => { if (queued) { state.archiveQuizQueued = true; persist(); } });
        persist(); render(); document.getElementById("class-result")?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
    document.querySelectorAll("[data-scaffold]").forEach(input => input.addEventListener("input", () => {
      state.scaffolds ||= ["", "", "", "", ""];
      state.scaffolds[Number(input.dataset.scaffold)] = input.value;
      persist();
    }));
    document.getElementById("go-homework")?.addEventListener("click", () => { currentView = "homework"; render(); window.scrollTo({ top: 0, behavior: "smooth" }); });
    const essay = document.getElementById("essay-text");
    if (essay) {
      const count = () => { document.getElementById("word-count").textContent = `${(essay.value.match(/[A-Za-z]+(?:['’][A-Za-z]+)?/g) || []).length} 词`; };
      count();
      if (!state.essayResult) essay.addEventListener("input", () => { state.essay = essay.value; persist(); count(); });
      document.getElementById("essay-form")?.addEventListener("submit", event => {
        event.preventDefault();
        if (state.essayResult) return;
        const text = essay.value.trim();
        if (!text || (text.match(/[A-Za-z]+/g) || []).length < 20) {
          const error = document.getElementById("essay-error");
          error.textContent = "请先写出完整的英文段落，再提交评分。"; error.hidden = false; return;
        }
        state.essay = text;
        state.essayResult = { ...gradeEssay(task, text), submittedAt: new Date().toISOString() };
        void window.JulyLesson2.submit({ activity: "writingEssay", major, essay: text }).then(queued => { if (queued) { state.archiveEssayQueued = true; persist(); } });
        persist(); render(); document.getElementById("essay-result")?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
    document.getElementById("print-score")?.addEventListener("click", () => window.print());
  }
  render();
  if (state.quiz && !state.archiveQuizQueued) void window.JulyLesson2.submit({ activity: 'writingClass', major, answers: state.quizAnswers }).then(queued => { if (queued) { state.archiveQuizQueued = true; persist(); } });
  if (state.essayResult && !state.archiveEssayQueued) void window.JulyLesson2.submit({ activity: 'writingEssay', major, essay: state.essay }).then(queued => { if (queued) { state.archiveEssayQueued = true; persist(); } });
}

window.JulyLesson2.ready.then(identity => {
  if (!identity) return;
  if (document.body.dataset.page === 'home') initHome();
  if (document.body.dataset.page === 'practice') initPractice();
});
