window.railwayGame={music:new URL("railway-games/v5/audio/spring-shift.mp3",location.href).href};
(function () {
  'use strict';
  const button = document.getElementById('sound');
  const music = document.getElementById('music');
  const Audio = window.AudioContext || window.webkitAudioContext;
  const cues = {
    next: [72, 76], correct: [72, 76, 81], review: [69, 67], finish: [67, 72, 76, 84],
  };

  let context;
  let enabled = null;
  let speaking = false;
  let pending = null;
  let blocked = false;
  let revision = 0;
  music.volume = .74;

  function refreshLabel() {
    button.setAttribute('aria-pressed', String(Boolean(enabled) && !blocked));
    button.textContent = blocked ? '♫ Retry music' : enabled ?
      (speaking ? '♫ Music paused' : music.paused ? '♫ Loading' : '♫ Music off') : '♫ Music on';
    button.title = enabled && !blocked ? '关闭背景音乐和答题音效' : '开启背景音乐和答题音效';
  }

  function syncMusic() {
    revision++;
    if (!enabled || speaking || document.hidden) {
      music.pause();
    } else if (!blocked && music.paused && !pending) {
      const started = revision;
      pending = music.play().catch(error => {
        if (error.name !== 'AbortError' && enabled && !speaking && !document.hidden) blocked = true;
      }).finally(() => {
        pending = null;
        if (started !== revision && !blocked && enabled && !speaking && !document.hidden && music.paused) syncMusic();
        else refreshLabel();
      });
    }
    refreshLabel();
  }

  function enableMusic() {
    if (!music.hasAttribute('src')) music.src = window.railwayGame.music;
    enabled = true;
    blocked = false;
    syncMusic();
    if (Audio) {
      try {
        context ||= new Audio();
        void context.resume().catch(() => {});
      } catch { /* Music uses the media element even when sound effects are unavailable. */ }
    }
  }

  window.railwayMusic = {
    begin() { if (enabled === null) enableMusic(); },
    voice(active) { speaking = active; syncMusic(); },
  };

  window.railwaySound = function playCue(type) {
    if (!enabled || document.hidden || speaking || context?.state !== 'running') return;
    (cues[type] || []).forEach((note, index) => {
      const start = context.currentTime + .02 + index * .115;
      const oscillator = context.createOscillator();
      const envelope = context.createGain();
      oscillator.type = 'triangle';
      oscillator.frequency.value = 440 * 2 ** ((note - 69) / 12);
      envelope.gain.setValueAtTime(.0001, start);
      envelope.gain.exponentialRampToValueAtTime(.028, start + .035);
      envelope.gain.exponentialRampToValueAtTime(.0001, start + .36);
      oscillator.connect(envelope).connect(context.destination);
      oscillator.start(start);
      oscillator.stop(start + .37);
      oscillator.onended = () => { oscillator.disconnect(); envelope.disconnect(); };
    });
  };

  button.onclick = () => {
    if (!enabled || blocked) enableMusic();
    else {
      enabled = false;
      syncMusic();
    }
  };
  music.addEventListener('playing', refreshLabel);
  music.addEventListener('error', () => { if (enabled) { blocked = true; refreshLabel(); } });
  document.addEventListener('visibilitychange', syncMusic);
  refreshLabel();
}());

(function () {
  'use strict';
  const byId = id => document.getElementById(id);
  const set = (id, value) => { byId(id).textContent = value; };
  const assets = new URL('railway-games/v5/', location.href);
  const asset = path => new URL(path, assets).href;
  const api = 'https://cloudbase-d3gxxe4l88c3d5907-1431364187.ap-shanghai.app.tcloudbase.com/learningArchiveApi';
  const params = new URLSearchParams(location.search);
  const mission = params.get('mission');
  const preview = params.get('preview') === '1';
  const identityKey = 'july.course.identity.v1';
  const voice = byId('voice');
  let stage, identity, draft, speaking;
  let recovering;
  let index = 0;
  let submitting = false;
  let local = true;

  if (!['1', '2', '3'].includes(mission)) return;

  function read(key) {
    try { return JSON.parse(localStorage.getItem(key) || 'null'); }
    catch { return null; }
  }

  function store(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); }
    catch { local = false; }
  }

  function session() {
    const entry = read(identityKey);
    return entry?.student?.id && /^[a-f0-9]{64}$/.test(entry.token || '') && entry.expiresAt > Date.now() ? entry : null;
  }

  function sessionChanged() {
    const known = session();
    return local && (!known || identity?.token !== known.token);
  }

  async function send(action, args = {}, current = null) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 16000);
    try {
      const response = await fetch(api, {
        method: 'POST', signal: controller.signal, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...args, ...(current ? { studentToken: current.token } : {}) }),
      });
      const result = await response.json();
      if (!response.ok || !result.ok) {
        const error = new Error(result.error || '暂时无法连接成绩服务。');
        error.status = response.status;
        throw error;
      }
      return result;
    } finally { clearTimeout(timeout); }
  }

  function show(view) {
    for (const id of ['hub', 'intro', 'game', 'report']) byId(id).hidden = id !== view;
  }

  function make(tag, label, classes) {
    const element = document.createElement(tag);
    if (label) element.textContent = label;
    if (classes) element.className = classes;
    if (tag === 'button') element.type = 'button';
    return element;
  }

  function stopVoice() {
    if (!speaking) return;
    speaking.textContent = speaking.dataset.label;
    speaking.setAttribute('aria-pressed', 'false');
    speaking = null;
    voice.pause();
    window.railwayMusic.voice(false);
  }

  function voiceButton(button, file, label, auto = false) {
    button.dataset.label = label;
    button.textContent = label;
    button.setAttribute('aria-pressed', 'false');
    button.onclick = async () => {
      if (speaking === button) { stopVoice(); return; }
      stopVoice();
      set('voice-status', '');
      speaking = button;
      button.textContent = '■ 停止播放';
      button.setAttribute('aria-pressed', 'true');
      window.railwayMusic.voice(true);
      voice.src = asset(file);
      try { await voice.play(); }
      catch (error) {
        if (speaking !== button) return;
        stopVoice();
        if (error.name !== 'AbortError') set('voice-status', '录音暂未播放，请点按钮重试。');
      }
    };
    if (auto) void button.onclick();
    return button;
  }

  voice.addEventListener('ended', stopVoice);

  function showIdentity(message = '') {
    stopVoice();
    show('intro');
    set('intro-status', message);
    byId('signin').hidden = Boolean(identity) || preview;
    byId('start').hidden = !identity && !preview;
    byId('change-student').hidden = !identity || preview;
    set('identity', preview ? 'Teacher Preview · 本关只在本页试做' : identity ? `${identity.student.name} · ${identity.student.className}` : '');
  }

  async function checkIdentity() {
    identity = session();
    if (!identity) {
      const remembered = read(identityKey);
      if (/^[a-f0-9]{64}$/.test(remembered?.requestToken || '') && remembered.requestExpiresAt > Date.now()) {
        try {
          const renewed = await send('startPractice', { requestToken: remembered.requestToken });
          if (renewed.student?.id === remembered.student.id && renewed.practiceToken && read(identityKey)?.token === remembered.token) {
            identity = { ...remembered, token: renewed.practiceToken, expiresAt: renewed.practiceExpiresAt };
            store(identityKey, identity);
          }
        } catch { /* Sign-in remains available on this page. */ }
      }
    }
    showIdentity(identity ? '正在确认课堂身份…' : '');
    if (!identity) return;
    const current = identity;
    try {
      const result = await send('courseSession', {}, current);
      if (current !== identity) return;
      if (result.student?.id !== current.student.id || sessionChanged()) {
        identity = null;
        showIdentity('请在本页重新确认本人身份。');
        return;
      }
      set('intro-status', '');
    } catch (error) {
      if (current !== identity) return;
      if (error.status === 401) {
        identity = null;
        showIdentity('课堂身份已到期，请重新确认本人身份。');
      } else {
        set('intro-status', '暂未能核对身份，可点开始继续。成绩提交时会再次核对。');
      }
    }
  }

  function draftKey() { return `july.railway.mission.v5.${stage.id}.${identity.student.id}`; }

  function persist() {
    if (!preview) store(draftKey(), draft);
  }

  function fresh() {
    return { requestId: Array.from(crypto.getRandomValues(new Uint8Array(16)), n => n.toString(16).padStart(2, '0')).join(''),
      answers: Array(stage.questions.length).fill(null), sent: false };
  }

  function savedDraft() {
    if (preview) return fresh();
    const saved = read(draftKey());
    if (saved?.answers?.length === stage.questions.length && /^[a-f0-9]{32}$/.test(saved.requestId || '') &&
        saved.answers.every(value => value === null || Number.isInteger(value) && value >= 0 && value <= 3)) return saved;
    return fresh();
  }

  function start(existing) {
    if (!preview && (!identity || sessionChanged())) {
      identity = null;
      showIdentity('请填写本人姓名和班级。');
      return;
    }
    draft = existing || savedDraft();
    if (draft.sent) { showReport(); return; }
    index = Math.max(0, draft.answers.indexOf(null));
    show('game');
    set('game-title', stage.title);
    voiceButton(byId('pa'), stage.announcement, '♫ 车站播报');
    render(true);
    window.railwayMusic.begin();
  }

  function choicesFor(question, questionIndex) {
    const list = make('div', '', stage.photos ? 'choices photos' : 'choices');
    const answer = draft.answers[questionIndex];
    const options = stage.photos ? question.cards : question.options;
    options.forEach((option, i) => {
      const row = make('div', '', 'choice-row');
      const button = make('button', '', 'choice');
      button.setAttribute('aria-pressed', String(i === answer));
      button.append(make('span', 'ABCD'[i], 'letter'));
      if (stage.photos) {
        const gate = /^Gate (B\d+)$/.exec(option[1]);
        const source = question.choiceImages?.[i];
        const icon = source ? make('img', '', 'option-photo') : make('span', gate ? gate[1] : option[0], gate ? 'gate-sign' : 'option-icon');
        icon.setAttribute('aria-hidden', 'true');
        if (source) { icon.src = asset(source); icon.alt = ''; }
        if (option[2]) icon.dataset.color = option[2];
        button.append(icon);
      }
      const label = make('span', stage.photos ? option[1] : option);
      label.lang = 'en';
      button.append(label);
      if (answer !== null && i === answer) button.classList.add(i === question.answer ? 'right' : 'wrong');
      button.onclick = () => {
        if (draft.sent) return;
        draft.answers[questionIndex] = i;
        persist();
        stopVoice();
        window.railwaySound(i === question.answer ? 'correct' : 'review');
        updateSelection(question, questionIndex, row.parentElement);
        updateNavigation();
        if (question.repliesAudio?.[i]) {
          voiceButton(row.querySelector('.listen'), question.repliesAudio[i], `▶ 选项 ${'ABCD'[i]}`, true);
        }
      };
      row.append(button);
      if (!stage.photos) row.append(voiceButton(make('button', '', 'listen option-voice'), question.repliesAudio[i], `▶ 选项 ${'ABCD'[i]}`));
      list.append(row);
    });
    return list;
  }

  function updateSelection(question, questionIndex, list) {
    const selected = draft.answers[questionIndex];
    [...list.querySelectorAll('.choice')].forEach((button, i) => {
      button.setAttribute('aria-pressed', String(selected === i));
      button.classList.toggle('right', selected === i && i === question.answer);
      button.classList.toggle('wrong', selected === i && i !== question.answer);
    });
    const feedback = list.parentElement.querySelector('.feedback');
    feedback.hidden = selected === null;
    if (selected === null) return;
    const correct = selected === question.answer;
    const verdict = make('strong', correct ? '✓ 答对了' : '↻ 可以再选', 'verdict');
    const plot = make('p', correct ? question.outcome : question.miss || '旅客没听懂，你可以再选一句。');
    const explanation = make('p', question.explanation, 'note');
    feedback.classList.toggle('incorrect', !correct);
    feedback.replaceChildren(verdict, plot, explanation);
  }

  function render(auto) {
    stopVoice();
    const together = stage.together;
    const question = stage.questions[index];
    const scene = together ? stage.scene : question;
    const picture = byId('scene-image');
    picture.src = asset(scene.image);
    picture.alt = scene.scene || scene.name;
    set('scene-name', scene.scene || scene.name);
    set('scene-line', together ? '听对话，再完成下面两道选图题。' : stage.photos ? scene.hint : scene.prompt);
    byId('scene-line').lang = together ? 'zh-CN' : 'en';
    voiceButton(byId('hear-scene'), together ? stage.full : question.audio,
      together ? '▶ 听完整对话和两道问题' : stage.photos ? '▶ 听对话和问题' : '▶ 听旅客问话', auto);
    const visible = together ? stage.questions : [question];
    byId('questions').replaceChildren(...visible.map((item, i) => {
      const questionIndex = together ? i : index;
      const article = make('article', '', 'question');
      const heading = make('div', '', 'question-heading');
      heading.append(make('h2', together ? `第 ${i + 1} 题 · 选图` : stage.photos ? `第 ${index + 1} 题 · 听音选图` : `第 ${index + 1} 题 · 轮到你接话`));
      if (together) heading.append(voiceButton(make('button', '', 'listen'), item.audio, '▶ 重听问题'));
      const list = choicesFor(item, questionIndex);
      const feedback = make('div', '', 'feedback');
      feedback.setAttribute('role', 'status');
      article.append(heading, list, feedback);
      updateSelection(item, questionIndex, list);
      return article;
    }));
    updateNavigation();
  }

  function updateNavigation() {
    const total = draft.answers.length;
    const done = draft.answers.filter(value => value !== null).length;
    set('progress', `已答 ${done} / ${total} 题 · 交卷前可以重选`);
    byId('previous').hidden = stage.together;
    byId('previous').disabled = index === 0;
    byId('next').hidden = stage.together || index === total - 1;
    byId('submit').hidden = !stage.together && index !== total - 1;
    byId('submit').disabled = done !== total;
  }

  function showReport() {
    stopVoice();
    show('report');
    set('report-title', stage.title);
    const total = stage.questions.length;
    const correct = stage.questions.filter((question, i) => question.answer === draft.answers[i]).length;
    set('score', `${draft.receipt?.score ?? Math.round(100 * correct / total)} / 100`);
    const status = preview ? '教师试玩完成。' : draft.receipt?.pending ? '本关成绩已提交，老师可在第十课班级记录中查看。' :
      draft.receipt ? '已同步到本人第十课学习记录。' : '正在同步本关成绩…';
    set('receipt', status);
    byId('play-again').hidden = !preview && !draft.receipt;
    const review = byId('review-list');
    const transcript = stage.together ? stage.turns.map(([role, line, translation]) => make('p', `${role} · ${line}　${translation}`)) : [];
    review.replaceChildren(...transcript, ...stage.questions.map((question, i) => {
      const block = make('article', '', 'review-item');
      block.append(make('h2', `第 ${i + 1} 题`));
      if (!stage.together && question.turns) {
        for (const [role, line, translation] of question.turns) block.append(make('p', `${role} · ${line}　${translation}`));
      }
      block.append(make('p', question.prompt), make('p', question.promptMeaning), make('p', question.explanation));
      block.append(voiceButton(make('button', '', 'listen'), question.reviewAudio || question.audio, '▶ 听原音'));
      return block;
    }));
    if (!preview && !draft.receipt) void save();
  }

  async function save() {
    if (submitting || draft.receipt) return;
    byId('retry-save').hidden = true;
    byId('reauth').hidden = true;
    if (!identity || sessionChanged()) {
      set('receipt', '课堂身份已变化，请在本页重新确认。');
      byId('reauth').hidden = false;
      return;
    }
    submitting = true;
    set('receipt', '正在同步本关成绩…');
    try {
      const result = await send('saveLesson10Attempt', { version: stage.version, stage: stage.id, requestId: draft.requestId, answers: draft.answers }, identity);
      const data = result.submission;
      if (!data?.id || !Number.isFinite(data.score) || data.total !== stage.questions.length || data.activity !== stage.activity) throw new Error('还没有收到本关成绩确认。');
      draft.receipt = { score: data.score, pending: Boolean(result.pendingVerification) };
      persist();
      showReport();
    } catch (error) {
      set('receipt', error.status === 401 ? '课堂身份已到期，请在本页重新确认。' : local ? '暂未收到成绩确认，答案已保存在本设备，可重试同步。' : '暂未收到成绩确认，请保留此页重试。');
      byId('retry-save').hidden = error.status === 401;
      byId('reauth').hidden = error.status !== 401;
    } finally { submitting = false; }
  }

  byId('signin').onsubmit = async event => {
    event.preventDefault();
    const name = byId('student-name').value.trim();
    const className = byId('class-name').value;
    if (!name || !className) return;
    byId('sign-in').disabled = true;
    set('intro-status', '正在确认课堂身份…');
    try {
      const result = await send('requestAccess', { name, className, practice: true });
      if (!result.practiceToken || !result.student?.id) throw new Error('暂未取得课堂身份。');
      identity = { student: result.student, token: result.practiceToken, expiresAt: result.practiceExpiresAt,
        requestToken: result.requestToken, requestExpiresAt: result.expiresAt, verified: false };
      store(identityKey, identity);
      const samePerson = recovering?.student?.name === identity.student.name && recovering.student.className === identity.student.className;
      const resume = samePerson ? recovering.draft : null;
      recovering = null;
      if (resume) {
        draft = resume;
        persist();
      }
      start(resume);
    } catch (error) { set('intro-status', error.name === 'AbortError' ? '确认身份超时，请检查网络后重试。' : error.message); }
    finally { byId('sign-in').disabled = false; }
  };

  byId('start').onclick = () => start();
  byId('change-student').onclick = () => { identity = null; showIdentity(); byId('student-name').focus(); };
  byId('previous').onclick = () => { if (index > 0) { index--; render(true); } };
  byId('next').onclick = () => { if (index + 1 < stage.questions.length) { index++; render(true); } };
  byId('submit').onclick = () => {
    if (draft.answers.some(answer => answer === null)) return;
    draft.sent = true;
    persist();
    showReport();
  };
  byId('retry-save').onclick = save;
  byId('reauth').onclick = () => {
    if (identity) recovering = { student: identity.student, draft };
    identity = null;
    showIdentity('请用原来的姓名和班级确认课堂身份。');
  };
  byId('play-again').onclick = () => start(fresh());

  async function load() {
    show('intro');
    byId('retry-load').hidden = true;
    set('intro-status', '正在加载本关…');
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 10000);
      const result = await fetch(asset(`mission-${mission}.json`), { signal: controller.signal }).finally(() => clearTimeout(timer));
      if (!result.ok) throw new Error('游戏加载失败。');
      stage = await result.json();
      document.title = `${stage.title} · Rail Shift`;
      set('mission-number', `MISSION 0${mission}`);
      set('mission-title', stage.title);
      set('mission-intro', stage.intro);
      set('mission-guide', stage.guide);
      const cover = byId('cover-image');
      cover.src = asset(stage.cover);
      cover.hidden = false;
      byId('sound').hidden = false;
      byId('class-name').replaceChildren(new Option('选择自己的班级', ''), ...stage.classes.map(name => new Option(name, name)));
      if (preview) showIdentity();
      else await checkIdentity();
    } catch {
      set('intro-status', '本关暂未加载完成，请检查网络后点重试。');
      byId('retry-load').hidden = false;
    }
  }

  window.addEventListener('storage', event => {
    if (!preview && event.key === identityKey && identity && sessionChanged()) {
      identity = null;
      showIdentity('课堂身份已变化，请使用本人姓名和班级。');
    }
  });
  byId('retry-load').onclick = load;
  void load();
}());
