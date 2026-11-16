(() => {
 const $ = (s,root=document)=>root.querySelector(s);
 const $$ = (s,root=document)=>[...root.querySelectorAll(s)];
 const navToggle=$(".menu-toggle"), nav=$(".nav-links");
 if(navToggle&&nav){navToggle.addEventListener("click",()=>{const open=nav.classList.toggle("open");navToggle.setAttribute("aria-expanded",String(open));navToggle.setAttribute("aria-label",open?"Close navigation":"Open navigation")});$$("a",nav).forEach(a=>a.addEventListener("click",()=>{nav.classList.remove("open");navToggle.setAttribute("aria-expanded","false")}))}
 $$("[data-year]").forEach(el=>el.textContent=new Date().getFullYear());
 const readStats=()=>{try{return JSON.parse(localStorage.getItem("vpPracticeStats")||'{"attempts":0,"best":0,"scores":[]}')}catch{return {attempts:0,best:0,scores:[]}}};
 const saveStats=score=>{const s=readStats();s.attempts++;s.best=Math.max(s.best,score);s.scores.push({score,date:new Date().toISOString()});localStorage.setItem("vpPracticeStats",JSON.stringify(s));};
 const stats=readStats();
 if($("#attempt-count"))$("#attempt-count").textContent=stats.attempts;
 if($("#best-score"))$("#best-score").textContent=stats.attempts?stats.best+"%":"—";

 // Explore quiz library
 const quizList=$("#quiz-list");
 if(quizList&&window.VP_QUIZZES){
  const grade=$("#grade-filter"),stream=$("#stream-filter"),streamWrap=$("#stream-filter-wrap"),subject=$("#subject-filter"),search=$("#quiz-search"),count=$("#quiz-count"),player=$("#quiz-player");
  const exploreParams=new URLSearchParams(location.search);
  if(["9","10","11","12"].includes(exploreParams.get("grade")))grade.value=exploreParams.get("grade");
  if(["Commerce","Science","Arts / Humanities"].includes(exploreParams.get("stream")))stream.value=exploreParams.get("stream");
  let current=null;
  const render=()=>{
   const q=window.VP_QUIZZES.filter(x=>(grade.value==="all"||String(x.grade)===grade.value)&&((grade.value!=="11"&&grade.value!=="12")||stream.value==="all"||x.stream===stream.value)&&(subject.value==="all"||x.subject===subject.value)&&(`${x.title} ${x.desc} ${x.subject} ${x.stream}`.toLowerCase().includes(search.value.toLowerCase())));
   count.textContent=q.length+" practice sets";
   quizList.innerHTML=q.length?q.map(x=>`<article class="quiz-item"><div><div class="meta">STD ${x.grade} · ${x.stream==="Common"?"COMMON":x.stream.toUpperCase()} · ${x.subject.toUpperCase()} · ${x.level.toUpperCase()}</div><h3>${x.title}</h3><p>${x.desc} · ${x.qs.length} questions</p></div><button type="button" data-start="${x.id}">Start quiz ↗</button></article>`).join(""):'<div class="quiz-item"><p>No quiz matches these filters. Try another standard or subject.</p></div>';
  };
  function refreshSubjects(){
   const g=grade.value, senior=g==="11"||g==="12";streamWrap.hidden=!senior;
   const relevant=window.VP_QUIZZES.filter(x=>(g==="all"||String(x.grade)===g)&&(!senior||stream.value==="all"||x.stream===stream.value));
   const subjects=[...new Set(relevant.map(x=>x.subject))].sort(),previous=subject.value;
   subject.innerHTML='<option value="all">All subjects</option>'+subjects.map(x=>`<option value="${x}">${x}</option>`).join("");
   if(subjects.includes(previous))subject.value=previous;
   const requested=new URLSearchParams(location.search).get("subject");if(requested&&subjects.includes(requested))subject.value=requested;
  }
  grade.addEventListener("change",()=>{refreshSubjects();render()});stream.addEventListener("change",()=>{refreshSubjects();render()});subject.addEventListener("change",render);search.addEventListener("input",render);
  refreshSubjects();
  quizList.addEventListener("click",e=>{const b=e.target.closest("[data-start]");if(!b)return;current=window.VP_QUIZZES.find(x=>x.id===b.dataset.start);showQuiz(current);});
  function showQuiz(q){
   player.hidden=false;player.innerHTML=`<div class="player-head"><div class="meta">STD ${q.grade} · ${q.stream==="Common"?"COMMON":q.stream.toUpperCase()} · ${q.subject.toUpperCase()}</div><h2>${q.title}</h2><p>${q.desc}</p></div><form id="quiz-form">${q.qs.map((item,i)=>`<section class="question-block"><h3>${i+1}. ${item.q}</h3>${item.o.map((op,j)=>`<label class="choice"><input type="radio" name="q${i}" value="${j}" required> ${String.fromCharCode(65+j)}. ${op}</label>`).join("")}</section>`).join("")}<button class="btn btn-dark" type="submit">Submit answers ↗</button><div class="feedback" id="quiz-feedback" aria-live="polite"></div></form>`;
   player.scrollIntoView({behavior:"smooth",block:"start"});
   $("#quiz-form",player).addEventListener("submit",ev=>{ev.preventDefault();const data=new FormData(ev.currentTarget);let score=0;const review=q.qs.map((item,i)=>{const chosen=Number(data.get("q"+i));const ok=chosen===item.a;if(ok)score++;return `<p><b>Q${i+1}: ${ok?"Correct":"Not quite"}.</b> ${item.e}</p>`}).join("");const pct=Math.round(score/q.qs.length*100);saveStats(pct);$("#quiz-feedback").className="feedback "+(pct>=60?"success":"error");$("#quiz-feedback").innerHTML=`<h3>Your score: ${score}/${q.qs.length} (${pct}%)</h3>${review}<p><b>Your result is saved in this browser.</b></p><button type="button" class="btn btn-lime" id="retry-quiz">Try again</button>`;$("#attempt-count").textContent=readStats().attempts;$("#best-score").textContent=readStats().best+"%";$("#retry-quiz").addEventListener("click",()=>showQuiz(q));});
  }
  render();
 }
 // Subjects: common subjects for Std 9-10; stream-specific catalogue for Std 11-12
 const subjectGrid=$("#subject-grid");
 const subjectCatalog={"9":[["Mathematics","∑","Number systems, algebra, geometry and problem solving."],["Science","⚛","Physics, chemistry and biology foundations."],["English","Aa","Reading, grammar, vocabulary and writing."],["Gujarati","અ","Reading comprehension, grammar and expression."],["Social Science","⌖","History, geography, civics and economics."],["Reasoning","?","Patterns, logic and analytical thinking."]],"10":[["Mathematics","∑","Core mathematical concepts and exam-style practice."],["Science","⚛","Physics, chemistry, biology and applications."],["English","Aa","Grammar, comprehension and written communication."],["Gujarati","અ","Language understanding and expression."],["Social Science","⌖","History, geography, civics and economics."],["Reasoning","?","Logical reasoning and problem-solving."]],"11":{"Commerce":[["Accountancy","₹","Accounting principles, journal entries and financial statements."],["Economics","↗","Microeconomics, statistics and economic reasoning."],["Statistics","▥","Data, averages, dispersion and interpretation."],["Business Studies","▣","Business organisation, management and entrepreneurship."],["English","Aa","Academic reading, grammar and writing."],["Gujarati","અ","Language comprehension and expression."]],"Science":[["Physics","◉","Motion, forces, energy and measurement."],["Chemistry","⚗","Atomic structure, bonding and chemical principles."],["Biology","♧","Cell biology, diversity and life processes."],["Mathematics","∑","Algebra, functions, trigonometry and problem solving."],["English","Aa","Academic reading, grammar and writing."],["Gujarati","અ","Language comprehension and expression."]],"Arts / Humanities":[["History","⌛","Historical sources, chronology and interpretation."],["Geography","⌖","Earth systems, maps and human-environment relations."],["Political Science","⚖","Constitution, institutions and political ideas."],["Sociology","◎","Society, social groups and institutions."],["Psychology","◌","Behaviour, cognition and introductory psychology."],["Economics","↗","Economic ideas, data and real-world connections."],["English","Aa","Academic reading, grammar and writing."],["Gujarati","અ","Language comprehension and expression."]]},"12":{"Commerce":[["Accountancy","₹","Partnerships, company accounts and financial analysis."],["Economics","↗","Macroeconomics, development and data interpretation."],["Statistics","▥","Statistical tools, correlation and index numbers."],["Business Studies","▣","Management, marketing and business decisions."],["English","Aa","Comprehension, writing and language skills."],["Gujarati","અ","Language comprehension and expression."]],"Science":[["Physics","◉","Electricity, magnetism, optics and modern physics."],["Chemistry","⚗","Solutions, electrochemistry and organic chemistry."],["Biology","♧","Genetics, evolution, biotechnology and ecology."],["Mathematics","∑","Calculus, vectors, probability and applications."],["English","Aa","Comprehension, writing and language skills."],["Gujarati","અ","Language comprehension and expression."]],"Arts / Humanities":[["History","⌛","Modern history, sources and historical analysis."],["Geography","⌖","Resources, population and geographical analysis."],["Political Science","⚖","Politics, governance and contemporary issues."],["Sociology","◎","Social change, institutions and social issues."],["Psychology","◌","Learning, memory, personality and behaviour."],["Economics","↗","Macroeconomic concepts and development."],["English","Aa","Comprehension, writing and language skills."],["Gujarati","અ","Language comprehension and expression."]]}};
 if(subjectGrid){
  const gradeSelect=$("#subject-grade"),streamSelect=$("#subject-stream"),streamControl=$("#stream-control"),intro=$("#subject-intro");
  const params=new URLSearchParams(location.search);
  if(["9","10","11","12"].includes(params.get("grade")))gradeSelect.value=params.get("grade");
  if(["Commerce","Science","Arts / Humanities"].includes(params.get("stream")))streamSelect.value=params.get("stream");
  function renderSubjects(){
   const g=gradeSelect.value, senior=Number(g)>=11, stream=streamSelect.value;
   streamControl.hidden=!senior;
   const items=senior?subjectCatalog[g][stream]:subjectCatalog[g];
   intro.innerHTML=`<div><h2>Standard ${g} ${senior?"· "+stream:"· Common subjects"}</h2><p>${senior?"Choose your stream-specific subject to find matching practice.":"Choose a subject to explore learning activities."}</p></div><span>${g}</span>`;
   subjectGrid.innerHTML=items.map(s=>`<article class="subject-card"><div class="subject-symbol">${s[1]}</div><h3>${s[0]}</h3><p>${s[2]}</p><a href="explore.html?grade=${g}&stream=${encodeURIComponent(senior?stream:"Common")}&subject=${encodeURIComponent(s[0])}">FIND PRACTICE ↗</a></article>`).join("");
  }
  gradeSelect.addEventListener("change",renderSubjects);streamSelect.addEventListener("change",renderSubjects);renderSubjects();
 }
 // Daily challenge: date-indexed rotation through a set
 const dailyQuestion=$("#daily-question");
 if(dailyQuestion){
  const challenges=[
   {q:"A notebook and a pen cost ₹110 together. The notebook costs ₹100 more than the pen. How much does the pen cost?",o:["₹5","₹10","₹15","₹20"],a:0,e:"If the pen costs ₹5, the notebook costs ₹105. Together they cost ₹110."},
   {q:"Find the next number: 1, 1, 2, 3, 5, 8, __",o:["11","12","13","15"],a:2,e:"Each number is the sum of the two before it. 5 + 8 = 13."},
   {q:"If all squares are rectangles, which statement is always true?",o:["All rectangles are squares","Every square is a rectangle","No rectangle is a square","All rectangles have equal sides"],a:1,e:"A square meets the definition of a rectangle, but not every rectangle is a square."},
   {q:"A clock shows 3:00. What is the smaller angle between its hands?",o:["45°","60°","90°","120°"],a:2,e:"At 3:00, the minute hand is at 12 and the hour hand is at 3: a right angle of 90°."}
  ];
  const now=new Date(),day=Math.floor(Date.UTC(now.getFullYear(),now.getMonth(),now.getDate())/86400000),item=challenges[((day%challenges.length)+challenges.length)%challenges.length];
  $("#daily-date").textContent=now.toLocaleDateString(undefined,{day:"numeric",month:"short",year:"numeric"});
  dailyQuestion.textContent=item.q;$("#daily-options").innerHTML=item.o.map((o,i)=>`<label><input type="radio" name="daily" value="${i}"> ${String.fromCharCode(65+i)}. ${o}</label>`).join("");
  const submit=$("#daily-submit"),feedback=$("#daily-feedback");$("#daily-options").addEventListener("change",()=>submit.disabled=false);
  submit.addEventListener("click",()=>{const chosen=Number(($('input[name="daily"]:checked')||{}).value);const ok=chosen===item.a;feedback.className="feedback "+(ok?"success":"error");feedback.innerHTML=`<b>${ok?"Correct!":"Good attempt."}</b> ${item.e}`;submit.disabled=true;});
 }
})();