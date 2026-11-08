/* Unit 2, the sixth class: shared two-hour identity and an owner-bound outbox.
 * This bridge never calculates a grade or grants access to a student archive. */
(function () {
  'use strict';
  var API = 'https://cloudbase-d3gxxe4l88c3d5907-1431364187.ap-shanghai.app.tcloudbase.com/learningArchiveApi';
  var IDENTITY_KEY = 'july.course.identity.v1';
  var OUTBOX = 'july.lesson6.reading.outbox.v1';
  var ARCHIVE = '/july-speaking-lab/archive/';
  var RETURN_URL = ARCHIVE + '?unit=2&lesson=3';
  var identity = null;
  var busy = false;
  var gated = false;

  function read(key) {
    try { return JSON.parse(localStorage.getItem(key) || 'null'); }
    catch (_) { return null; }
  }
  function lease() {
    var value = read(IDENTITY_KEY);
    return value && Number(value.expiresAt) > Date.now() &&
      typeof value.token === 'string' && /^[a-f0-9]{64}$/.test(value.token) &&
      value.student && typeof value.student.id === 'string' && value.student.id &&
      typeof value.student.name === 'string' && value.student.name.trim() &&
      typeof value.student.className === 'string' && value.student.className.trim() ? value : null;
  }
  function sameSession(left, right) {
    return Boolean(left && right && left.token === right.token &&
      left.student.id === right.student.id);
  }
  function ownerKey(person) {
    // A token hint keeps two distinct classroom leases apart. The full token is
    // never copied into an answer record or queue key.
    return person.student.id + '.' + person.token.slice(0, 16);
  }
  function entryKey(entry) { return OUTBOX + '.' + entry.ownerKey + '.' + entry.requestId; }
  function newId() {
    var bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    return Array.prototype.map.call(bytes, function (value) {
      return ('0' + value.toString(16)).slice(-2);
    }).join('');
  }
  function payloadValid(payload) {
    return payload && payload.activity === 'time-reading' && Array.isArray(payload.choices) &&
      payload.choices.length === 5 && payload.choices.every(function (value) { return Number.isInteger(value) && value >= 0 && value <= 3; }) &&
      Array.isArray(payload.blanks) && payload.blanks.length === 3 && payload.blanks.every(function (value) {
        return typeof value === 'string' && value.trim() && value.length <= 100 && value.trim().split(/\s+/).length <= 3;
      });
  }
  function validSubmission(submission, payload) {
    if (!submission || !submission.id || submission.activity !== 'time-reading' || submission.total !== 13 ||
      !Number.isInteger(submission.correct) || submission.correct < 0 || submission.correct > 13 ||
      submission.score !== Math.round(submission.correct / 13 * 100) || !Array.isArray(submission.feedback) || submission.feedback.length !== 8) return false;
    var seen = new Set(), earned = 0;
    for (var item of submission.feedback) {
      var choice = item.kind === 'choice';
      if (!choice && item.kind !== 'blank') return false;
      if (!Number.isInteger(item.index) || item.index < 0 || item.index >= (choice ? 5 : 3) || seen.has(item.kind + item.index) ||
        item.points !== (choice ? 2 : 1) || typeof item.correct !== 'boolean' || typeof item.answer !== 'string' ||
        typeof item.paragraph !== 'string' || typeof item.explanation !== 'string' ||
        item.selected !== (choice ? 'ABCD'[payload.choices[item.index]] : payload.blanks[item.index].trim())) return false;
      seen.add(item.kind + item.index); earned += item.correct ? item.points : 0;
    }
    return earned === submission.correct;
  }
  function pendingFor(person) {
    if (!person) return [];
    var prefix = OUTBOX + '.' + ownerKey(person) + '.';
    var pending = [];
    for (var i = 0; i < localStorage.length; i++) {
      var key = localStorage.key(i);
      if (!key || key.indexOf(prefix) !== 0) continue;
      var entry = read(key);
      if (entry && entry.version === 1 && entry.studentId === person.student.id &&
        entry.ownerKey === ownerKey(person) && /^[a-f0-9]{32}$/.test(entry.requestId) &&
        Number.isFinite(entry.createdAt) && payloadValid(entry.payload) && entryKey(entry) === key) pending.push(entry);
    }
    return pending.sort(function (left, right) { return left.createdAt - right.createdAt; });
  }
  function login() {
    location.href = ARCHIVE + '?next=' + encodeURIComponent(location.pathname + location.search);
  }

  var style = document.createElement('style');
  style.textContent = '.jl6-bar,.jl6-status,.jl6-gate{box-sizing:border-box;font-family:system-ui,"Microsoft YaHei",sans-serif}.jl6-bar{padding:12px 20px;background:#eaf3f0;color:#173d3b;border-bottom:1px solid #cbded7}.jl6-bar>div{max-width:1120px;margin:auto;display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}.jl6-bar a,.jl6-status a{display:inline-block;color:#1e5d53;background:white;border:1px solid #b7cfc5;border-radius:9px;padding:8px 12px;text-decoration:none;font-weight:700}.jl6-status{max-width:1120px;margin:20px auto;padding:17px 20px;border:1px solid #d4dfe3;border-radius:14px;background:#f1f6fa;color:#29485e;line-height:1.7}.jl6-status[data-state="saved"]{background:#edf8f0;border-color:#b9d9c3;color:#235d3c}.jl6-status p{margin:7px 0}.jl6-status[hidden]{display:none}.jl6-status button,.jl6-gate button{background:#1e655a;color:white;border:0;border-radius:9px;padding:10px 15px;font:inherit;cursor:pointer}.jl6-status button:disabled{opacity:.6;cursor:wait}.jl6-gate{position:fixed;inset:0;z-index:99999;background:#edf3f0;display:grid;place-items:center;padding:24px}.jl6-gate>div{max-width:500px;padding:28px;background:white;border:1px solid #cbded7;border-radius:20px;box-shadow:0 20px 60px #153f3720;color:#1f413c}.jl6-gate p{line-height:1.8}.jl6-gate small{color:#54736c;font-weight:750}.jl6-status button:focus-visible,.jl6-gate button:focus-visible,.jl6-bar a:focus-visible{outline:3px solid #e8aa58;outline-offset:3px}@media(max-width:600px){.jl6-status{margin:16px}.jl6-bar{padding:12px 16px}}';
  document.head.appendChild(style);
  var bar = document.createElement('header');
  bar.className = 'jl6-bar';
  document.body.prepend(bar);
  var status = document.createElement('section');
  status.className = 'jl6-status';
  status.hidden = true;
  status.setAttribute('aria-live', 'polite');
  document.body.appendChild(status);

  function renderBar() {
    var wrap = document.createElement('div');
    var title = document.createElement('strong');
    title.textContent = 'Unit 2 · 第6课任务2 · ' + identity.student.name + ' · ' + identity.student.className;
    var home = document.createElement('a');
    home.href = RETURN_URL;
    home.textContent = '返回第6课学习站 →';
    wrap.append(title, home);
    bar.replaceChildren(wrap);
  }
  function gate(message) {
    if (!gated) {
      gated = true;
      window.dispatchEvent(new CustomEvent('july:lesson6readingidentitychanged'));
    }
    var section = document.querySelector('.jl6-gate');
    if (!section) {
      section = document.createElement('section');
      section.className = 'jl6-gate';
      section.setAttribute('role', 'dialog');
      section.setAttribute('aria-modal', 'true');
      section.setAttribute('aria-labelledby', 'jl6-gate-title');
      var card = document.createElement('div');
      var small = document.createElement('small');
      small.textContent = 'JULY · UNIT 2 · 第6课';
      var heading = document.createElement('h2');
      heading.id = 'jl6-gate-title';
      heading.textContent = '先确认本人课堂身份';
      var detail = document.createElement('p');
      detail.className = 'jl6-gate-detail';
      var notice = document.createElement('p');
      notice.textContent = '练习成绩将记录，供任课教师评定平时成绩参考。请使用本人真实姓名和正确班级，不要填写他人姓名或进入他人账号。';
      var button = document.createElement('button');
      button.type = 'button';
      button.textContent = '确认本人姓名与班级 →';
      button.onclick = login;
      card.append(small, heading, detail, notice, button);
      section.appendChild(card);
      document.body.appendChild(section);
    }
    section.querySelector('.jl6-gate-detail').textContent = message || '在学习站填写一次姓名和班级，2小时内可继续完成本节课练习。';
  }
  function show(state, message) {
    status.hidden = false;
    status.dataset.state = state;
    status.replaceChildren();
    var title = document.createElement('strong');
    title.textContent = state === 'saved' ? '✓ 本次练习已保存给任课教师' :
      state === 'saving' ? '正在同步本人的练习记录…' : '成绩尚未确认同步';
    var detail = document.createElement('p');
    detail.textContent = message;
    status.append(title, detail);
    if (state !== 'saved') {
      var button = document.createElement('button');
      button.type = 'button';
      button.textContent = '重新同步';
      button.disabled = busy;
      button.onclick = function () { void flush(); };
      status.appendChild(button);
    }
  }
  function checkOwner() {
    var current = lease();
    if (!current) {
      var expired = new Error('课堂身份已到期，请回学习站重新确认本人身份。原答案仍保存在本机。');
      expired.status = 401;
      throw expired;
    }
    if (!sameSession(current, identity)) {
      var changed = new Error('本浏览器已切换课堂身份。此页面已暂停，不会代其他学生提交。');
      changed.status = 409;
      changed.identityChanged = true;
      throw changed;
    }
    return current;
  }
  async function request(action, payload) {
    var current = checkOwner();
    var controller = new AbortController();
    var timer = setTimeout(function () { controller.abort(); }, 25000);
    try {
      var response = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.assign({}, payload || {}, { action: action, studentToken: current.token })),
        signal: controller.signal
      });
      var result = await response.json();
      // A response for one lease must never appear on another student's page.
      checkOwner();
      if (!response.ok || result.ok === false) {
        var error = new Error(result.error || '暂时无法同步成绩，请稍后重试。');
        error.status = response.status;
        throw error;
      }
      return result;
    } finally { clearTimeout(timer); }
  }
  async function flush() {
    if (busy || !identity || gated) return null;
    var pending;
    try {
      checkOwner();
      pending = pendingFor(identity);
    } catch (error) { gate(error.message); return null; }
    if (!pending.length) return null;
    busy = true;
    show('saving', '正在同步 ' + pending.length + ' 份本人的练习记录，请稍候。');
    var lastResult = null;
    try {
      for (var entry of pending) {
        checkOwner();
        lastResult = await request('saveLesson6Attempt', Object.assign({ requestId: entry.requestId }, entry.payload));
        var submission = lastResult.submission;
        if (!validSubmission(submission, entry.payload)) {
          throw new Error('暂未收到完整成绩，原答案保留在本机，请稍后重新同步。');
        }
        checkOwner();
        try { localStorage.removeItem(entryKey(entry)); } catch (_) { /* Idempotent retry is safe. */ }
        window.dispatchEvent(new CustomEvent('july:lesson6readingsaved', { detail: {
          result: lastResult, requestId: entry.requestId, payload: entry.payload,
          studentId: entry.studentId, ownerKey: entry.ownerKey
        } }));
      }
      show('saved', '系统已确认保存。请在页面查看本次练习得分和逐题讲解；也可返回第6课学习站查看练习记录。');
      return lastResult;
    } catch (error) {
      var reason = error.name === 'AbortError' ? '连接超时。' :
        error.name === 'TypeError' ? '网络连接暂时中断。' : error.message;
      show('queued', reason + ' 答案仍保存在本机；尚未收到确认前，不会显示为已同步。');
      if (error.identityChanged || error.status === 401) gate(reason);
      window.dispatchEvent(new CustomEvent('july:lesson6readingsyncfailed', { detail: { message: reason } }));
      return null;
    } finally {
      busy = false;
      status.querySelectorAll('button').forEach(function (button) { button.disabled = false; });
    }
  }
  var ready = (async function () {
    identity = lease();
    if (!identity) { gate(); return null; }
    try {
      var result = await request('courseSession');
      if (!result.student || !result.student.id || !Number.isFinite(result.expiresAt)) throw new Error('课堂身份暂时无法确认。');
      checkOwner();
      identity.student = Object.assign({}, identity.student, result.student);
      identity.verified = result.verified !== false;
      identity.expiresAt = Math.min(identity.expiresAt, result.expiresAt);
      try { localStorage.setItem(IDENTITY_KEY, JSON.stringify(identity)); } catch (_) { /* Saving a submission will show a storage error. */ }
    } catch (error) {
      if (error.status === 401 || error.identityChanged) {
        if (error.status === 401 && sameSession(lease(), identity)) {
          try { localStorage.removeItem(IDENTITY_KEY); } catch (_) { /* Keep other leases intact. */ }
        }
        gate(error.message);
        return null;
      }
      // A previously saved lease may work offline. It authorizes no history;
      // the server still validates and grades every later submission.
      if (!sameSession(lease(), identity)) { gate('课堂身份已变化，请重新确认。'); return null; }
      show('queued', '暂时无法连接课堂服务。可以先完成作答，提交时会先保存到本机；系统确认前不显示正式得分。');
    }
    renderBar();
    setTimeout(function () { void flush(); }, 0);
    return identity;
  })();
  window.JulyLesson6Reading = {
    ready: ready,
    pending: function () { return identity && !gated ? pendingFor(identity) : []; },
    retry: flush,
    submit: async function (payload) {
      var person = await ready;
      if (!person || gated) { gate(); return { queued: false }; }
      try { checkOwner(); }
      catch (error) { gate(error.message); return { queued: false }; }
      if (!payloadValid(payload)) throw new Error('请完成5道选择题和3道填空，每空不超过3词。');
      var entry = {
        version: 1, studentId: person.student.id, ownerKey: ownerKey(person),
        requestId: newId(), createdAt: Date.now(),
        payload: JSON.parse(JSON.stringify(payload))
      };
      try {
        localStorage.setItem(entryKey(entry), JSON.stringify(entry));
        if (!read(entryKey(entry))) throw new Error('Storage unavailable');
      } catch (_) {
        show('queued', '浏览器未允许在本机保存答案，本次尚未提交。请保留当前页面，使用普通浏览器或联系老师。');
        return { queued: false };
      }
      show('queued', '作答已保存在本机，正在等待系统确认。确认前不显示得分和答案。');
      setTimeout(function () { void flush(); }, 0);
      return { queued: true, requestId: entry.requestId, createdAt: entry.createdAt };
    }
  };
  function resume() {
    if (!identity || gated) return;
    if (!sameSession(lease(), identity)) gate('课堂身份已到期或切换。原答案仍保存在本机，请回学习站确认本人身份后重新进入。');
    else void flush();
  }
  window.addEventListener('online', resume);
  window.addEventListener('focus', resume);
  window.addEventListener('storage', function (event) { if (event.key === IDENTITY_KEY) resume(); });
  setInterval(resume, 30000);
})();
