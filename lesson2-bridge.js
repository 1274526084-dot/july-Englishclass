/* Shared two-hour identity and durable, idempotent archive submissions. */
(function () {
  'use strict';
  var API = 'https://cloudbase-d3gxxe4l88c3d5907-1431364187.ap-shanghai.app.tcloudbase.com/learningArchiveApi';
  var KEY = 'july.course.identity.v1', QUEUE = 'july.unit2.outbox.v1';
  var archive = '/july-speaking-lab/archive/';
  var stages = [
    ['pinglu', '平陆运河测试', 'pinglu-canal-english-quiz.html'],
    ['verbs', '不规则动词', 'irregular-verbs-game.html'],
    ['tense', '时态练习', 'english-tense-practice.html'],
    ['writing', '校园写作', 'school-writing-practice.html']
  ];
  var file = location.pathname.split('/').pop();
  var index = stages.findIndex(function (stage) { return stage[2] === file; });
  if (index < 0) index = 3;
  var identity = null, busy = false, outcome = null;
  function read(key, fallback) { try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch (_) { return fallback; } }
  function write(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
  function pendingFor(studentId) {
    var pending = [];
    for (var n = 0; n < localStorage.length; n++) {
      var key = localStorage.key(n);
      if (key && key.indexOf(QUEUE + '.' + studentId + '.') === 0) { var item = read(key, null); if (item) pending.push(item); }
    }
    return pending.sort(function(a,b){return a.createdAt-b.createdAt;});
  }
  function lease() { var value = read(KEY, null); return value && value.expiresAt > Date.now() && value.student && /^[a-f0-9]{64}$/.test(value.token) ? value : null; }
  function login() { location.href = archive + '?next=' + encodeURIComponent(location.pathname + location.search); }
  function changeStudent() { localStorage.removeItem(KEY); localStorage.removeItem('july.course.student.v1'); sessionStorage.removeItem('july.archive.student-session.v1'); localStorage.removeItem('july.archive.student-session.v1'); sessionStorage.removeItem('july.archive.access-request.v1'); localStorage.removeItem('july.archive.access-request.v1'); login(); }
  function id() { var bytes = new Uint8Array(16); crypto.getRandomValues(bytes); return Array.prototype.map.call(bytes, function(v) {return v.toString(16).padStart(2,'0');}).join(''); }
  async function request(action, data) {
    var current = lease();
    if (!current) throw new Error('本次身份已到期，重新确认身份后可继续提交。');
    if (identity && current.student.id !== identity.student.id) throw new Error('本浏览器已换为另一位学生，请重新打开页面后再作答。原答案仍保留。');
    var controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    var timeout = setTimeout(function () { if (controller) controller.abort(); }, 25000);
    try {
      var response = await fetch(API, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(Object.assign({action:action,studentToken:current.token}, data || {})), signal: controller ? controller.signal : undefined });
      var result = await response.json();
      if (!response.ok || result.ok === false) { var error = new Error(result.error || '同步失败，请重试。'); error.status = response.status; throw error; }
      return result;
    } finally { clearTimeout(timeout); }
  }
  var style = document.createElement('style');
  style.textContent = '.jl2-bar,.jl2-sync,.jl2-gate{font-family:system-ui,"Microsoft YaHei",sans-serif;color:#243e34;box-sizing:border-box}.jl2-bar{background:#f1f7f1;border-bottom:1px solid #cddfcf;padding:14px 20px}.jl2-bar>div{max-width:1120px;margin:auto}.jl2-bar strong{margin-right:12px}.jl2-bar small{color:#617267}.jl2-bar nav{display:flex;flex-wrap:wrap;gap:9px;margin-top:12px}.jl2-bar a,.jl2-sync a{color:#22674e;text-decoration:none;font-weight:700;border:1px solid #bbd0c2;background:white;padding:8px 12px;border-radius:10px;font-size:14px}.jl2-bar a[aria-current]{background:#285f49;color:white}.jl2-bar button,.jl2-sync button,.jl2-gate button{font:inherit;border:0;border-radius:10px;padding:10px 16px;cursor:pointer;background:#285f49;color:white}.jl2-sync{max-width:1080px;margin:24px auto;padding:20px;border:1px solid #bfd7c8;border-radius:18px;background:#edf7f1;line-height:1.7}.jl2-sync p{margin:8px 0}.jl2-sync .actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:12px}.jl2-gate{position:fixed;inset:0;z-index:99999;background:#eef5f0;display:grid;place-items:center;padding:24px}.jl2-gate>div{max-width:460px;background:white;border:1px solid #cbdfd0;border-radius:24px;padding:32px;box-shadow:0 20px 70px #2d5d4322}.jl2-gate h2{font-size:25px;line-height:1.4}.jl2-gate p{line-height:1.8;color:#607165}.jl2-sync [hidden]{display:none}';
  document.head.appendChild(style);
  var bar = document.createElement('header'); bar.className = 'jl2-bar'; document.body.prepend(bar);
  var box = document.createElement('section'); box.className = 'jl2-sync'; box.setAttribute('aria-live','polite'); box.hidden = true; document.body.appendChild(box);
  function renderBar() {
    bar.replaceChildren(); var wrap=document.createElement('div'); bar.appendChild(wrap);
    var name=document.createElement('strong'); name.textContent='第二课 · ' + identity.student.name + ' · ' + identity.student.className; wrap.appendChild(name);
    var ttl=document.createElement('small'); ttl.textContent='身份保留至 ' + new Date(identity.expiresAt).toLocaleTimeString('zh-CN',{hour:'2-digit',minute:'2-digit'}); wrap.appendChild(ttl);
    var nav=document.createElement('nav'); nav.setAttribute('aria-label','第二课任务顺序'); wrap.appendChild(nav);
    stages.forEach(function(stage,i){var a=document.createElement('a');a.href=stage[2];a.textContent=(i+1)+'. '+stage[1];if(i===index)a.setAttribute('aria-current','step');nav.appendChild(a);});
    var a=document.createElement('a');a.href=archive;a.textContent='我的档案 / 第一课';nav.appendChild(a);
    var change=document.createElement('button');change.textContent='换一位学生';change.onclick=changeStudent;nav.appendChild(change);
  }
  function gate(message) {
    var gate=document.createElement('section');gate.className='jl2-gate';gate.innerHTML='<div><small>JULY · 第二课学习站</small><h2>确认一次身份，连续完成两节课</h2><p></p><button type="button">确认姓名与班级 →</button></div>';
    gate.querySelector('p').textContent=message || '填写姓名与班级即可开始课堂任务，2小时内可连续切换。新设备的作答先独立保存，教师课后核对本人后才关联历史档案。';
    gate.querySelector('button').onclick=login;document.body.appendChild(gate);
  }
  function show(message, saved) {
    box.hidden=false;box.replaceChildren();var title=document.createElement('strong');title.textContent=saved?(outcome && outcome.pendingVerification?'✓ 已保存 · 身份待教师课后确认':'✓ 已同步到教师和个人档案'):'成绩保存状态';box.appendChild(title);
    var p=document.createElement('p');p.textContent=message;box.appendChild(p);
    var actions=document.createElement('div');actions.className='actions';box.appendChild(actions);
    var retry=document.createElement('button');retry.textContent='重新同步';retry.disabled=busy;retry.onclick=function(){void flush();};if(!saved)actions.appendChild(retry);
    if(!lease()){var relog=document.createElement('button');relog.textContent='重新确认身份';relog.onclick=login;actions.appendChild(relog);}
    if(index===3 && saved && outcome && outcome.submission.activity==='writingClass') {
      var essay=document.createElement('button');essay.textContent='继续：课后作文 →';essay.onclick=function(){var target=document.getElementById('go-homework')||document.getElementById('tab-homework');if(target)target.click();};actions.appendChild(essay);
    } else {
      var next=document.createElement('a');next.href=index<3?stages[index+1][2]:archive;next.textContent=index<3?'下一站：'+stages[index+1][1]+' →':'查看本课变化与雷达 →';actions.appendChild(next);
    }
  }
  async function flush() {
    if(busy || !identity)return;var current=lease();if(!current){show('身份保留已到期。答案仍留在本机，重新确认后再同步。',false);return;}
    busy=true;var pending=pendingFor(identity.student.id);
    if(!pending.length){busy=false;return;}
    show('正在同步 '+pending.length+' 份练习记录…',false);
    try{
      for(var item of pending){
        outcome=await request('saveUnit2Attempt',Object.assign({requestId:item.requestId},item.payload));
        localStorage.removeItem(QUEUE + '.' + item.studentId + '.' + item.requestId);
      }
      show('本次得分率 '+outcome.submission.score+' / 100。老师可以查看成绩、作答和作文原文。',true);
      window.dispatchEvent(new CustomEvent('july:unit2saved',{detail:outcome}));
    }catch(error){show((error.name==='AbortError'?'连接超时':error.message)+' 答案已留在本机，可点击重新同步。',false);}finally{busy=false;box.querySelectorAll('button').forEach(function(b){b.disabled=false;});}
  }
  var ready=(async function(){
    identity=lease();if(!identity){gate();return null;}
    try{var result=await request('courseSession');identity.student=Object.assign({},identity.student,result.student);identity.verified=result.verified!==false;identity.expiresAt=Math.min(identity.expiresAt,result.expiresAt);write(KEY,identity);renderBar();void flush();return identity;}
    catch(error){if(error.status===401){localStorage.removeItem(KEY);gate('身份已失效，请重新确认。');return null;}gate('暂时无法连接档案服务。请检查网络后刷新；已有答案保存在本机。');return null;}
  })();
  window.JulyLesson2={ready:ready,submit:async function(payload){
    var person=await ready;if(!person){login();return;}
    var entry={studentId:person.student.id,requestId:id(),payload:payload,createdAt:Date.now()};
    try{write(QUEUE + '.' + person.student.id + '.' + entry.requestId,entry);write('july.unit2.last.'+person.student.id+'.'+payload.activity,entry);}catch(_){show('浏览器未允许保存答案，请打开普通浏览器后再提交。',false);return false;}
    await flush();
    return true;
  },retry:flush,changeStudent:changeStudent,identity:function(){return identity;}};
  window.addEventListener('online',function(){void flush();});
  window.addEventListener('focus',function(){var current=lease();if(identity&&(!current||current.student.id!==identity.student.id))gate('身份已到期或本浏览器已切换学生，请重新打开当前任务。');else void flush();});
  setInterval(function(){if(identity&&lease())void flush();},30000);
})();
