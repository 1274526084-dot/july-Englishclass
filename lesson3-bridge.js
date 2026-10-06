/* Lesson 3 shares the archive's two-hour identity and immutable submission queue. */
(function () {
  'use strict';
  var API = 'https://cloudbase-d3gxxe4l88c3d5907-1431364187.ap-shanghai.app.tcloudbase.com/learningArchiveApi';
  var KEY = 'july.course.identity.v1';
  var QUEUE = 'july.lesson3.outbox.v1';
  var archive = '/july-speaking-lab/archive/';
  var stages = [
    ['词组匹配（一）', 'lesson-3-vocabulary-matching.html'],
    ['词组匹配（二）', 'lesson-3-vocabulary-matching-2.html'],
    ['阅读理解', 'lesson-3-reading-task1-task3.html']
  ];
  var file = location.pathname.split('/').pop();
  var index = stages.findIndex(function (item) { return item[1] === file; });
  var identity = null, busy = false, outcome = null;
  function read(key) { try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch (_) { return null; } }
  function lease() {
    var value = read(KEY);
    return value && value.expiresAt > Date.now() && value.student &&
      /^[a-f0-9]{64}$/.test(value.token) ? value : null;
  }
  function login() { location.href = archive + '?next=' + encodeURIComponent(location.pathname + location.search); }
  function id() {
    var bytes = new Uint8Array(16); crypto.getRandomValues(bytes);
    return Array.prototype.map.call(bytes, function (v) { return v.toString(16).padStart(2, '0'); }).join('');
  }
  function pendingFor(studentId) {
    var pending = [];
    for (var i = 0; i < localStorage.length; i++) {
      var key = localStorage.key(i);
      if (key && key.indexOf(QUEUE + '.' + studentId + '.') === 0) {
        var item = read(key); if (item) pending.push(item);
      }
    }
    return pending.sort(function (a, b) { return a.createdAt - b.createdAt; });
  }
  async function request(action, data) {
    var current = lease();
    if (!current) throw new Error('本次身份已到期，请重新确认身份。');
    if (identity && current.student.id !== identity.student.id)
      throw new Error('本浏览器已换为另一位学生。原答案仍保存在本机。');
    var controller = new AbortController();
    var timeout = setTimeout(function () { controller.abort(); }, 25000);
    try {
      var response = await fetch(API, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.assign({ action: action, studentToken: current.token }, data || {})),
        signal: controller.signal
      });
      var result = await response.json();
      if (!response.ok || result.ok === false) {
        var error = new Error(result.error || '成绩同步失败，请重试。');
        error.status = response.status; throw error;
      }
      return result;
    } finally { clearTimeout(timeout); }
  }
  var style = document.createElement('style');
  style.textContent = '.jl3-bar,.jl3-status,.jl3-gate{font-family:system-ui,"Microsoft YaHei",sans-serif;box-sizing:border-box}.jl3-bar{background:#eaf2f2;color:#173e4a;padding:12px 20px;border-bottom:1px solid #c9dfdf}.jl3-bar>div{max-width:1120px;margin:auto}.jl3-bar nav{display:flex;flex-wrap:wrap;gap:8px;margin-top:9px}.jl3-bar a,.jl3-status a{display:inline-block;color:#195c68;background:white;border:1px solid #b8d3d4;border-radius:9px;padding:7px 10px;text-decoration:none;font-weight:700}.jl3-bar a[aria-current]{background:#195c68;color:white}.jl3-status{max-width:1080px;margin:22px auto;padding:17px 20px;background:#eaf6ef;border:1px solid #b7d7c4;border-radius:14px;color:#235643;line-height:1.6}.jl3-status p{margin:7px 0}.jl3-status button,.jl3-gate button{background:#195c68;color:white;border:0;border-radius:9px;padding:9px 14px;font:inherit;cursor:pointer}.jl3-status[hidden]{display:none}.jl3-gate{position:fixed;inset:0;z-index:99999;background:#eef5f4;display:grid;place-items:center;padding:24px}.jl3-gate>div{max-width:470px;background:white;border:1px solid #c9dede;border-radius:20px;padding:28px;box-shadow:0 20px 60px #173e4a22;color:#173e4a}.jl3-gate p{line-height:1.7}';
  document.head.appendChild(style);
  var bar = document.createElement('header'); bar.className = 'jl3-bar'; document.body.prepend(bar);
  var status = document.createElement('section'); status.className = 'jl3-status'; status.hidden = true;
  status.setAttribute('aria-live', 'polite'); document.body.appendChild(status);
  function renderBar() {
    var wrap = document.createElement('div'); bar.replaceChildren(wrap);
    var title = document.createElement('strong');
    title.textContent = '第三课 · ' + identity.student.name + ' · ' + identity.student.className;
    wrap.appendChild(title);
    var nav = document.createElement('nav'); nav.setAttribute('aria-label', '第三课任务');
    stages.forEach(function (item, i) {
      var link = document.createElement('a'); link.href = item[1];
      link.textContent = (i + 1) + '. ' + item[0];
      if (i === index) link.setAttribute('aria-current', 'step'); nav.appendChild(link);
    });
    var home = document.createElement('a'); home.href = archive + '?unit=1&lesson=3';
    home.textContent = '返回第3课'; nav.appendChild(home); wrap.appendChild(nav);
  }
  function gate(message) {
    if (document.querySelector('.jl3-gate')) return;
    var section = document.createElement('section'); section.className = 'jl3-gate';
    section.innerHTML = '<div><small>JULY · 第三课学习站</small><h2>先确认课堂身份</h2><p></p><button type="button">填写姓名与班级 →</button></div>';
    section.querySelector('p').textContent = message || '填写一次姓名和班级，2小时内可连续完成三项练习。新设备的成绩由老师课后核对归档。';
    section.querySelector('button').onclick = login; document.body.appendChild(section);
  }
  function show(message, saved) {
    status.hidden = false; status.replaceChildren();
    var title = document.createElement('strong');
    title.textContent = saved ? (outcome.pendingVerification ? '✓ 已保存 · 等待教师核对身份' : '✓ 成绩已同步给老师') : '成绩保存状态';
    status.appendChild(title);
    var p = document.createElement('p'); p.textContent = message; status.appendChild(p);
    if (!saved) {
      var retry = document.createElement('button'); retry.textContent = '重新同步';
      retry.disabled = busy; retry.onclick = function () { void flush(); }; status.appendChild(retry);
    } else {
      var next = document.createElement('a');
      next.href = index < 2 ? stages[index + 1][1] : archive + '?unit=1&lesson=3';
      next.textContent = index < 2 ? '下一项：' + stages[index + 1][0] + ' →' : '查看第三课成绩 →';
      status.appendChild(next);
    }
  }
  async function flush() {
    if (busy || !identity) return;
    if (!lease()) { show('身份已到期。答案仍保存在本机，请重新确认身份后刷新。', false); return; }
    var pending = pendingFor(identity.student.id); if (!pending.length) return;
    busy = true; show('正在同步 ' + pending.length + ' 份练习记录…', false);
    try {
      for (var item of pending) {
        outcome = await request('saveLesson3Attempt', Object.assign({ requestId: item.requestId }, item.payload));
        localStorage.removeItem(QUEUE + '.' + item.studentId + '.' + item.requestId);
      }
      show('本次得分率 ' + outcome.submission.score + ' / 100，可在第三课成绩中查看。', true);
      window.dispatchEvent(new CustomEvent('july:lesson3saved', { detail: outcome }));
    } catch (error) {
      show((error.name === 'AbortError' ? '连接超时' : error.message) + ' 答案仍在本机，可点击重新同步。', false);
    } finally { busy = false; status.querySelectorAll('button').forEach(function (button) { button.disabled = false; }); }
  }
  var ready = (async function () {
    identity = lease(); if (!identity) { gate(); return null; }
    try {
      var result = await request('courseSession');
      identity.student = Object.assign({}, identity.student, result.student);
      identity.verified = result.verified !== false;
      identity.expiresAt = Math.min(identity.expiresAt, result.expiresAt);
      localStorage.setItem(KEY, JSON.stringify(identity)); renderBar(); void flush(); return identity;
    } catch (error) {
      if (error.status === 401) localStorage.removeItem(KEY);
      gate(error.status === 401 ? '课堂身份已失效，请重新确认。' : '暂时无法连接档案服务，请检查网络后刷新。');
      return null;
    }
  })();
  window.JulyLesson3 = {
    ready: ready,
    submit: async function (payload) {
      var person = await ready; if (!person) { login(); return false; }
      var entry = { studentId: person.student.id, requestId: id(), payload: payload, createdAt: Date.now() };
      try { localStorage.setItem(QUEUE + '.' + entry.studentId + '.' + entry.requestId, JSON.stringify(entry)); }
      catch (_) { show('浏览器未允许保存答案，请使用普通浏览器后重试。', false); return false; }
      await flush(); return true;
    }, retry: flush
  };
  window.addEventListener('online', function () { void flush(); });
  window.addEventListener('focus', function () { if (identity && !lease()) gate('身份已到期，请重新确认。'); else void flush(); });
  setInterval(function () { if (identity && lease()) void flush(); }, 30000);
})();
