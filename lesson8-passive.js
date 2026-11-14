(function(){
  'use strict';
  const {group:groupId,index,bank,classes}=window.LESSON8,group=bank.find(g=>g.id===groupId);
  const API='https://cloudbase-d3gxxe4l88c3d5907-1431364187.ap-shanghai.app.tcloudbase.com/learningArchiveApi';
  const HUB='https://1274526084-dot.github.io/july-speaking-lab/?unit=3&lesson=2';
  const KEY='july.course.identity.v1',PENDING='july.archive.access-request.v1',PREFIX='july.lesson8.passive.v1.';
  const preview=new URLSearchParams(location.search).get('preview')==='1';
  let identity=readIdentity(),state=null,busy=false,submitting=false,controller=null;
  const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function read(key){try{return JSON.parse(localStorage.getItem(key)||'null');}catch{return null;}}
  function readIdentity(){const v=read(KEY);return v?.expiresAt>Date.now()&&/^[a-f0-9]{64}$/.test(v.token)&&v.student?.id&&v.student?.name&&v.student?.className?v:null;}
  const owner=v=>v.student.id+'.'+v.token.slice(0,16);
  function active(){const v=readIdentity();return identity&&v&&v.token===identity.token&&v.student.id===identity.student.id;}
  const stateKey=()=>PREFIX+owner(identity)+'.'+groupId;
  function load(){const saved=identity&&read(stateKey());state=saved&&identity&&saved.owner===owner(identity)?saved:{answers:['','','',''],pending:null,result:null};}
  function persist(){if(preview||!active())return;try{localStorage.setItem(stateKey(),JSON.stringify({...state,owner:owner(identity)}));}catch{showStatus('error','浏览器暂不能保存草稿，请保持本页打开。');}}
  async function request(action,data={},signal){
    const c=signal?null:new AbortController(),timer=c&&setTimeout(()=>c.abort(),50000);
    try{const res=await fetch(API,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({action,...data}),signal:signal||c.signal});
      const value=await res.json();if(!res.ok||value.ok===false){const e=new Error(value.error||'暂时无法连接，请重试。');e.status=res.status;throw e;}return value;
    }catch(e){if(e.name==='AbortError')throw new Error('连接超时，本组答案已保留，请重试同步。');throw e;}finally{clearTimeout(timer);}
  }
  document.getElementById('app').innerHTML=`<header class="top"><div class="shell"><a class="brand" href="${HUB}"><i>J</i> July English Lab <small>语法练习</small></a><a class="hub" href="${HUB}">返回第8课 ↗</a></div></header>
  <main class="shell"><div class="identity"><span id="person"></span><button type="button" class="plain" id="change-student">确认／切换身份</button></div>
  <section class="hero"><div class="eyebrow">UNIT 3 · 第8课 · 第${index+1}/5组</div><h1>${esc(group.title)}的被动语态<span class="tense-en">${esc(group.english)} · Passive Voice</span></h1><p class="lead">本组4题。填写完整的被动语态动词短语；不必抄写整句。全部填完后提交，得分与解析会自动保存到第8课。</p></section>
  <nav class="nav" aria-label="五种时态">${bank.map((g,i)=>`<a href="lesson-8-passive-${g.id}.html${preview?'?preview=1':''}" ${g.id===groupId?'aria-current="page"':''}><span>0${i+1}</span>${esc(g.title)}</a>`).join('')}</nav>
  ${preview?'<p id="preview-note">题目预览 · 不计成绩。正式作答请从第8课任务进入并确认本人身份。</p>':''}
  <details class="tip"><summary>需要一点提示？</summary><p><strong>${esc(group.formula)}</strong><br>${esc(group.focus)}</p></details>
  <form id="exercise">${group.questions.map((q,i)=>`<article class="question" id="question-${i}"><div class="qhead"><span class="qnum">${i+1}</span><span class="tag">${q.active?'主动句改为被动句':'动词适当形式填空'}</span></div>${q.active?`<p class="active-line" lang="en"><small>主动句 ACTIVE</small>${esc(q.active)}</p>`:''}<p class="sentence" lang="en">${esc(q.target).replace('____',`<input class="blank" id="answer-${i}" name="answer-${i}" aria-label="第${i+1}题答案" required maxlength="80" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="填写完整动词短语">`)} ${q.verb?`<span class="verb">(${esc(q.verb)})</span>`:''}</p><div class="feedback" id="feedback-${i}" hidden></div></article>`).join('')}
  <div class="submit-row"><span class="count" id="count">已填写0/4题 · 每题25分</span><button type="submit" class="primary" id="submit">提交本组，查看得分</button></div></form>
  <section class="status" id="status" role="status" hidden></section><section class="next-card"><strong>五组分别提交，分别记分。</strong><p>提交本组后，可用上方时态标签进入其他组，或者返回第8课学习站。</p><a class="secondary" href="${index<4?'lesson-8-passive-'+bank[index+1].id+'.html'+(preview?'?preview=1':''):HUB}">${index<4?'下一组：'+esc(bank[index+1].title)+' →':'返回第8课学习站 →'}</a></section></main><footer class="foot">July English Lab · 第8课被动语态练习</footer>
  <dialog class="identity-dialog" id="identity-gate"><form id="login"><div class="eyebrow">第8课 · 本人身份</div><h2>先确认你是谁</h2><p>成绩与平时分相关，请使用自己的真实姓名和正确班级，不要使用他人的身份。</p><label>班级<select name="className" required><option value="">请选择班级</option>${classes.map(c=>`<option>${esc(c)}</option>`).join('')}</select></label><label>姓名<input name="name" placeholder="填写真实姓名" maxlength="30" required autocomplete="name"></label><p id="login-error" role="status"></p><button class="primary" type="submit">确认身份，开始练习</button><a class="dialog-link" href="${HUB}">返回第8课学习站</a></form></dialog>`;
  const gate=document.getElementById('identity-gate'),form=document.getElementById('exercise'),button=document.getElementById('submit');
  function showStatus(kind,message){const box=document.getElementById('status');box.hidden=false;box.className='status'+(kind==='error'?' error':'');box.textContent=message;}
  function updateCount(){document.getElementById('count').textContent=`已填写${[...form.querySelectorAll('input')].filter(e=>e.value.trim()).length}/4题 · 每题25分`;}
  function clearFeedback(){for(let i=0;i<4;i++){document.getElementById('feedback-'+i).hidden=true;document.getElementById('question-'+i).classList.remove('correct','incorrect');}}
  function showResult(result){
    clearFeedback();for(const item of result.feedback){const box=document.getElementById('feedback-'+item.index);box.hidden=false;box.className='feedback'+(item.correct?'':' wrong');box.innerHTML=`<strong>${item.correct?'✓ 回答正确':'再看一下这一题'}</strong> · 正确形式：<b lang="en">${esc(item.answer)}</b><p lang="en">${esc(item.sentence)}</p><p>${esc(item.explanation)}</p>`;document.getElementById('question-'+item.index).classList.add(item.correct?'correct':'incorrect');}
    const box=document.getElementById('status');box.hidden=false;box.className='status';box.innerHTML=`<h2>本组已完成 · 已同步第8课</h2><p><span class="score">${result.score}</span> / 100分 · 答对${result.correct}/4题</p><p>可以查看逐题解析，或重新练习。</p><div class="actions"><button type="button" class="secondary" id="restart">再练一次</button><a class="secondary" href="${HUB}">返回第8课</a></div>`;
    document.getElementById('restart').onclick=()=>{state={answers:['','','',''],pending:null,result:null};persist();render();document.getElementById('answer-0').focus();};
  }
  function render(){document.getElementById('person').textContent=preview?'题目预览':identity?`${identity.student.className} · ${identity.student.name}`:'确认本人身份后提交成绩';
    for(let i=0;i<4;i++)document.getElementById('answer-'+i).value=state?.answers?.[i]||'';clearFeedback();document.getElementById('status').hidden=true;updateCount();
    if(preview){button.disabled=true;button.textContent='预览模式不提交成绩';return;}
    if(state?.result&&JSON.stringify(state.answers)===state.resultSignature)showResult(state.result);
    else if(state?.pending){showStatus('error','上次同步尚未确认，答案已保留。请点击提交重试。');}
  }
  function askIdentity(){if(!preview&&!gate.open)gate.showModal();}
  function expired(){controller?.abort();identity=null;state={answers:['','','',''],pending:null,result:null};render();askIdentity();}
  form.addEventListener('input',()=>{if(!state)return;state.answers=[0,1,2,3].map(i=>document.getElementById('answer-'+i).value);persist();updateCount();clearFeedback();if(state.result)showStatus('info','答案已修改；重新提交后才会更新得分。');});
  form.addEventListener('submit',async event=>{
    event.preventDefault();if(preview||submitting)return;if(!active()){expired();return;}
    const answers=[0,1,2,3].map(i=>document.getElementById('answer-'+i).value.trim());if(answers.some(a=>!a))return;
    const signature=JSON.stringify(answers);state.answers=answers;
    if(state.result&&state.resultSignature===signature){showResult(state.result);return;}
    if(!state.pending||JSON.stringify(state.pending.answers)!==signature)state.pending={requestId:crypto.randomUUID(),answers};persist();
    const current=identity,entry=state.pending;submitting=true;button.disabled=true;form.querySelectorAll('input').forEach(input=>input.disabled=true);button.textContent='正在评分并同步…';controller=new AbortController();const timer=setTimeout(()=>controller.abort(),50000);showStatus('info','正在保存本组答案，请稍候…');
    try{const result=await request('saveLesson8Attempt',{studentToken:current.token,requestId:entry.requestId,group:groupId,answers:entry.answers},controller.signal);
      if(!active()||identity.token!==current.token)return;
      const s=result.submission;if(!s||s.total!==4||!Number.isInteger(s.correct)||s.correct<0||s.correct>4||s.score!==s.correct*25||s.activity!=='passive-'+groupId||!Array.isArray(s.feedback)||s.feedback.length!==4||new Set(s.feedback.map(f=>f.index)).size!==4||s.feedback.some(f=>!Number.isInteger(f.index)||f.index<0||f.index>3||f.selected!==entry.answers[f.index]||typeof f.correct!=='boolean'))throw new Error('评分结果暂未完整收到，答案已保留，请重新提交。');
      state.result=s;state.resultSignature=signature;state.pending=null;persist();showResult(s);document.getElementById('status').scrollIntoView({block:'nearest',behavior:'smooth'});
    }catch(e){if(!active()||identity?.token!==current.token)return;if(e.status===401){expired();return;}showStatus('error',e.message+' 本组答案仍保留，点击提交即可重试。');}
    finally{clearTimeout(timer);controller=null;submitting=false;form.querySelectorAll('input').forEach(input=>input.disabled=false);button.disabled=preview;button.textContent='提交本组，查看得分';}
  });
  document.getElementById('change-student').onclick=askIdentity;gate.addEventListener('cancel',e=>e.preventDefault());
  document.getElementById('login').addEventListener('submit',async event=>{
    event.preventDefault();if(busy)return;const f=event.currentTarget,name=f.elements.name.value.trim(),className=f.elements.className.value,error=document.getElementById('login-error');busy=true;f.querySelector('button').disabled=true;error.textContent='正在确认课堂身份…';
    try{let next=null;const current=readIdentity();
      if(current&&current.student.name===name&&current.student.className===className){try{const s=await request('courseSession',{studentToken:current.token});next={...current,...s};}catch(e){if(e.status!==401)throw e;}}
      let pending=read(PENDING);if(!next&&pending?.requestToken&&pending.expiresAt>Date.now()&&pending.name===name&&pending.className===className){const s=await request('accessStatus',{requestToken:pending.requestToken});if(s.status==='approved'&&s.studentToken)next={token:s.studentToken,student:s.student,verified:true,expiresAt:Math.min(s.expiresAt,Date.now()+7200000)};else if(s.status==='pending'){const p=await request('startPractice',{requestToken:pending.requestToken});next={token:p.practiceToken,student:p.student,verified:false,expiresAt:p.practiceExpiresAt};pending={...pending,...p};}}
      if(!next){const p=await request('requestAccess',{name,className,practice:true});if(!p.practiceToken||!p.student)throw new Error('课堂身份尚未建立，请重试。');next={token:p.practiceToken,student:p.student,verified:false,expiresAt:p.practiceExpiresAt};pending={...p,name:p.student.name,className:p.student.className,remember:false};}
      if(pending&&pending.name===name&&pending.className===className){localStorage.setItem(PENDING,JSON.stringify(pending));sessionStorage.setItem(PENDING,JSON.stringify(pending));}
      else {localStorage.removeItem(PENDING);sessionStorage.removeItem(PENDING);}
      localStorage.setItem(KEY,JSON.stringify(next));localStorage.setItem('july.course.student.v1',JSON.stringify({student:next.student,expiresAt:next.expiresAt}));
      // Stale archive tokens must not survive a switch to another person.
      if(current?.token!==next.token){sessionStorage.removeItem('july.archive.student-session.v1');localStorage.removeItem('july.archive.student-session.v1');}
      identity=next;load();render();gate.close();error.textContent='';
    }catch(e){error.textContent=e.message;}finally{busy=false;f.querySelector('button').disabled=false;}
  });
  window.addEventListener('storage',e=>{if(e.key===KEY&&identity&&!active())expired();});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden&&identity&&!active())expired();});
  load();render();if(!identity&&!preview)askIdentity();
  if(identity&&!preview){const token=identity.token;request('courseSession',{studentToken:token}).then(s=>{if(active()&&identity.token===token){identity={...identity,...s};localStorage.setItem(KEY,JSON.stringify(identity));}}).catch(e=>{if(e.status===401&&active())expired();});}
})();
