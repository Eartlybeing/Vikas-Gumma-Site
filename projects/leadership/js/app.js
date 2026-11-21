(function(){
var KEY="lead-course-v1",S={done:{},sum:null},app=document.getElementById("app");
try{var r=localStorage.getItem(KEY);if(r)S=JSON.parse(r);}catch(e){}
function save(){try{localStorage.setItem(KEY,JSON.stringify(S));}catch(e){}}
function shuffle(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)),t=a[i];a[i]=a[j];a[j]=t;}return a;}
function prep(q){var idx=shuffle(q.o.map(function(_,i){return i;}));return {q:q.q,e:q.e,m:q.m,o:idx.map(function(i){return q.o[i];}),a:idx.indexOf(q.a)};}
function show(h){app.innerHTML=h;window.scrollTo(0,0);var f=app.querySelector("h2,h1");if(f){f.setAttribute("tabindex","-1");f.focus({preventScroll:true});}}
function allDone(){return COURSE.modules.every(function(m){return S.done[m.id];});}
function home(){
var tot=COURSE.modules.reduce(function(a,m){return a+m.min;},0),nd=COURSE.modules.filter(function(m){return S.done[m.id];}).length;
var h='<h1>'+COURSE.title+'</h1><p class="lead">'+COURSE.modules.length+' short modules for new team leads, about '+Math.round(tot/60)+' hours in total. Take your time: finish a module, try its check-in quiz, then move on. Your facilitator will run live practice sessions between modules.</p><p class="small"><b>'+nd+' of '+COURSE.modules.length+'</b> modules completed</p><div class="bar"><i style="width:'+(nd/COURSE.modules.length*100)+'%"></i></div>',last="";
COURSE.modules.forEach(function(m,i){if(m.part!==last){if(last)h+='</div>';h+='<h3 class="part">'+m.part+'</h3><div class="grid">';last=m.part;}var d=S.done[m.id];h+='<button class="mod'+(d?' done':'')+'" data-m="'+i+'"><span class="n">Module '+(i+1)+'</span><strong>'+m.title+'</strong><span>'+m.blurb+'</span><span class="meta">'+m.min+' min · '+(d?'Quiz score '+d.score+'/'+d.total:'Not started')+'</span></button>';});
h+='</div><div class="final"><div><h3>Final assessment</h3><p>30 questions · 80% to pass · '+(S.sum?'Best score '+S.sum.score+'/30 ('+(S.sum.pass?'passed':'not yet passed')+')':'unlocks after all check-in quizzes')+'</p></div><button class="btn" id="sumBtn"'+(allDone()?'':' disabled')+'>'+(S.sum?'Retake':'Start')+'</button></div><p class="small"><button class="link" id="reset">Reset my progress</button></p>';
show(h);
app.querySelectorAll(".mod").forEach(function(b){b.onclick=function(){cards(+b.dataset.m,0);};});
document.getElementById("sumBtn").onclick=startSum;
document.getElementById("reset").onclick=function(){if(confirm("Clear all saved progress?")){S={done:{},sum:null};save();home();}};
}
function cards(mi,ci){
var m=COURSE.modules[mi],c=m.cards[ci],pct=Math.round((ci+1)/(m.cards.length+1)*100);
show('<button class="link" id="menu">Back to modules</button><div class="bar" role="progressbar" aria-valuenow="'+pct+'" aria-valuemin="0" aria-valuemax="100"><i style="width:'+pct+'%"></i></div><p class="small">Module '+(mi+1)+': '+m.title+' · Screen '+(ci+1)+' of '+m.cards.length+'</p><h2>'+c.t+'</h2><div class="card">'+c.h+'</div><div class="nav"><button class="btn ghost" id="bk"'+(ci?'':' disabled')+'>Back</button><button class="btn" id="nx">'+(ci<m.cards.length-1?'Next':'Take check-in quiz')+'</button></div>');
document.getElementById("menu").onclick=home;
document.getElementById("bk").onclick=function(){cards(mi,ci-1);};
document.getElementById("nx").onclick=function(){ci<m.cards.length-1?cards(mi,ci+1):quiz(shuffle(m.quiz).map(prep),0,0,{type:"m",mi:mi,items:null});};
}
function quiz(items,i,score,ctx,miss){
miss=miss||{};ctx.items=items;var q=items[i],L="ABCDE";
show('<p class="small">'+(ctx.type==="m"?COURSE.modules[ctx.mi].title+' · Check-in quiz':'Final assessment')+' · Question '+(i+1)+' of '+items.length+'</p><div class="bar"><i style="width:'+(i/items.length*100)+'%"></i></div><h2>'+q.q+'</h2><div class="opts" role="radiogroup">'+q.o.map(function(o,k){return '<label class="opt"><input type="radio" name="o" value="'+k+'"><span>'+L[k]+'.</span> '+o+'</label>';}).join("")+'</div><div id="fb" aria-live="polite"></div><div class="nav"><span></span><button class="btn" id="chk">'+(ctx.type==="m"?'Check answer':'Submit answer')+'</button></div>');
var chk=document.getElementById("chk"),locked=false;
chk.onclick=function(){
if(locked){var nxt=i+1;if(nxt<items.length){quiz(items,nxt,score,ctx,miss);}else{finish(items.length,score,ctx,miss);}return;}
var sel=app.querySelector("input:checked");if(!sel){document.getElementById("fb").innerHTML='<p class="msg warn">Select an answer first.</p>';return;}
var ok=+sel.value===q.a;if(ok)score++;else if(q.m)miss[q.m]=(miss[q.m]||0)+1;locked=true;
app.querySelectorAll("input").forEach(function(x){x.disabled=true;});
if(ctx.type==="m"){app.querySelectorAll(".opt")[q.a].classList.add("right");if(!ok)sel.parentNode.classList.add("wrong");document.getElementById("fb").innerHTML='<p class="msg '+(ok?'ok':'no')+'"><b>'+(ok?'Correct. ':'Not quite. ')+'</b>'+q.e+'</p>';}
chk.textContent=i+1<items.length?"Next question":"See results";
if(ctx.type!=="m"){chk.click();}
};
}
function finish(n,score,ctx,miss){
var pct=Math.round(score/n*100);
if(ctx.type==="m"){var m=COURSE.modules[ctx.mi];S.done[m.id]={score:score,total:n};save();
show('<h2>Check-in complete</h2><div class="card"><p class="big">'+score+' / '+n+'</p><p>'+(pct>=80?'Strong result. You are ready for the next module.':'You can retry this quiz or review the screens again before moving on.')+'</p><div class="nav"><button class="btn ghost" id="rt">Retry quiz</button><button class="btn" id="hm">Back to modules</button></div></div>');
document.getElementById("rt").onclick=function(){quiz(shuffle(m.quiz).map(prep),0,0,{type:"m",mi:ctx.mi});};
}else{var pass=pct>=80;if(!S.sum||score>S.sum.score)S.sum={score:score,pass:pass};save();
var tot={};COURSE.summative.forEach(function(x){tot[x.m]=(tot[x.m]||0)+1;});
show('<h2>'+(pass?'You passed the final assessment':'Not passed yet')+'</h2><div class="card"><p class="big">'+score+' / '+n+' ('+pct+'%)</p><p>'+(pass?'Next step: join the readiness simulation (VILT session 3) to complete your leadership readiness check.':'Pass mark is 80% (24 of 30). Review the modules marked below, then retake.')+'</p><table><tr><th>Module</th><th>Questions missed</th></tr>'+COURSE.modules.map(function(m,x){var k="M"+(x+1);return '<tr><td>'+(x+1)+'. '+m.title+'</td><td>'+(miss[k]||0)+' of '+tot[k]+'</td></tr>';}).join("")+'</table><div class="nav"><button class="btn ghost" id="rt">Retake</button><button class="btn" id="hm">Back to modules</button></div></div>');
document.getElementById("rt").onclick=startSum;}
document.getElementById("hm").onclick=home;
}
function startSum(){var it=shuffle(COURSE.summative).map(function(s){var q=s.x;q.m=s.m;return prep(q);});quiz(it,0,0,{type:"s"});}
home();
})();
