// ---- アプリ本体（データは weapons_data.js） ----

function cardDeco(name,rarity){let h=rarity*31;for(let i=0;i<name.length;i++)h=((h<<5)-h+name.charCodeAt(i))&0xFFFFFF;const b=n=>((h*(n+1)*0x9B3)&0xFF).toString(16).padStart(2,'0').toUpperCase();const x=(((h*7)&0xFFFF)%8990/10+100).toFixed(1);const y=(((h*13)&0xFFFF)%8990/10+100).toFixed(1);return{hex:`0x${b(1)} ${b(2)} ${b(3)}`,coord:`${x} / ${y}`};}
function hex2rgba(hex,a){const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);return`rgba(${r},${g},${b},${a})`;}
function weaponImgUrl(r){const stem=r.enFull||(r.en?r.en+'_icon':null);if(!stem)return null;const bytes=new TextEncoder().encode(stem+'.png');const hex=Array.from(bytes).map(b=>b.toString(16).padStart(2,'0').toUpperCase()).join('');return'https://arknights-endfield.wikiru.jp/attach2/696D67_'+hex+'.png';}

let bF="all",eF="all",sF="all",wF="all";

function buildFilters(){
  const effs=[...new Set(D.map(r=>r.eff))];
  const skills=[...new Set(D.map(r=>r.skill))];

  document.getElementById("bf").innerHTML=
    `<button class="fbtn fbtn-all active" data-val="all" onclick="setB('all')">すべて</button>`+
    BASE_INFO.map(b=>b.icon
      ?`<button class="fbtn fbtn-icon" data-val="${b.name}" onclick="setB('${b.name}')"><img src="${b.icon}" alt="${b.name}"><span>${b.name}</span></button>`
      :`<button class="fbtn" data-val="${b.name}" onclick="setB('${b.name}')">${b.name}</button>`
    ).join("");

  const effOrder=Object.keys(EFF_ICON);
  const effsSorted=[...new Set([...effOrder.filter(e=>effs.includes(e)),...effs.filter(e=>!effOrder.includes(e))])];
  document.getElementById("ef").innerHTML=
    `<button class="fbtn fbtn-all active" data-val="all" onclick="setE('all')">すべて</button>`+
    effsSorted.map(e=>EFF_ICON[e]
      ?`<button class="fbtn fbtn-icon" data-val="${e}" onclick="setE('${e}')"><img src="${EFF_ICON[e]}" alt="${e}"><span>${e}</span></button>`
      :`<button class="fbtn" data-val="${e}" onclick="setE('${e}')">${e}</button>`
    ).join("");

  const skillOrder=Object.keys(SKILL_ICON);
  const skillsSorted=[...new Set([...skillOrder.filter(s=>skills.includes(s)),...skills.filter(s=>!skillOrder.includes(s))])];
  document.getElementById("sf").innerHTML=
    `<button class="fbtn fbtn-all active" data-val="all" onclick="setS('all')">すべて</button>`+
    skillsSorted.map(s=>SKILL_ICON[s]
      ?`<button class="fbtn fbtn-icon" data-val="${s}" onclick="setS('${s}')"><img src="${SKILL_ICON[s]}" alt="${s}"><span>${s}</span></button>`
      :`<button class="fbtn" data-val="${s}" onclick="setS('${s}')">${s}</button>`
    ).join("");

  const wtypes=["片手剣","大剣","長柄武器","拳銃","アーツユニット"];
  document.getElementById("wf").innerHTML=
    `<button class="fbtn fbtn-all active" onclick="setW('all')">すべて</button>`+
    wtypes.map(t=>`<button class="fbtn" onclick="setW('${t}')">${t}</button>`).join("");
}

function updateAnyActive(){document.querySelector(".fs").classList.toggle("any-active",bF!=="all"||eF!=="all"||sF!=="all"||wF!=="all");}
function setB(v){bF=(bF===v?"all":v);document.querySelectorAll("#bf .fbtn").forEach(b=>b.classList.toggle("active",b.dataset.val===bF));updateAnyActive();render();}
function setE(v){eF=(eF===v?"all":v);document.querySelectorAll("#ef .fbtn").forEach(b=>b.classList.toggle("active",b.dataset.val===eF));updateAnyActive();render();}
function setS(v){sF=(sF===v?"all":v);document.querySelectorAll("#sf .fbtn").forEach(b=>b.classList.toggle("active",b.dataset.val===sF));updateAnyActive();render();}
function setW(v){wF=(wF===v?"all":v);document.querySelectorAll("#wf .fbtn").forEach(b=>b.classList.toggle("active",b.textContent===(wF==="all"?"すべて":wF)));updateAnyActive();render();}

function updateFilterAvailability(){
  const validB=new Set(D.filter(r=>(eF==="all"||r.eff===eF)&&(sF==="all"||r.skill===sF)&&(wF==="all"||r.type===wF)).map(r=>r.base));
  const validE=new Set(D.filter(r=>(bF==="all"||r.base===bF)&&(sF==="all"||r.skill===sF)&&(wF==="all"||r.type===wF)).map(r=>r.eff));
  const validS=new Set(D.filter(r=>(bF==="all"||r.base===bF)&&(eF==="all"||r.eff===eF)&&(wF==="all"||r.type===wF)).map(r=>r.skill));
  const validW=new Set(D.filter(r=>(bF==="all"||r.base===bF)&&(eF==="all"||r.eff===eF)&&(sF==="all"||r.skill===sF)).map(r=>r.type));
  document.querySelectorAll("#bf .fbtn").forEach(b=>{if(b.dataset.val&&b.dataset.val!=="all")b.disabled=!validB.has(b.dataset.val);});
  document.querySelectorAll("#ef .fbtn").forEach(b=>{if(b.dataset.val&&b.dataset.val!=="all")b.disabled=!validE.has(b.dataset.val);});
  if(sF!=="all"){document.querySelectorAll("#sf .fbtn").forEach(b=>{if(b.dataset.val&&b.dataset.val!=="all")b.disabled=(b.dataset.val!==sF);});}
  else{document.querySelectorAll("#sf .fbtn").forEach(b=>{if(b.dataset.val&&b.dataset.val!=="all")b.disabled=!validS.has(b.dataset.val);});}
  document.querySelectorAll("#wf .fbtn").forEach(b=>{const t=b.textContent.trim();if(t!=="すべて")b.disabled=!validW.has(t);});
}

function render(){
  updateFilterAvailability();
  const rows=D.filter(r=>{
    if(bF!=="all"&&r.base!==bF)return false;
    if(eF!=="all"&&r.eff!==eF)return false;
    if(sF!=="all"&&r.skill!==sF)return false;
    if(wF!=="all"&&r.type!==wF)return false;
    return true;
  });
  const grid=document.getElementById("grid");
  if(!rows.length){grid.innerHTML=`<div class="no-res">該当データなし</div>`;document.getElementById("cnt").textContent=`[ 00 / ${String(D.length).padStart(2,'0')} ]`;return;}

  grid.innerHTML=rows.map(r=>{
    const dCount=r.rarity>=6?6:5;
    const dColor=dCount===6?"#FF7000":"#FFBA03";
    const headBg=`linear-gradient(135deg,${dColor} 0%,${hex2rgba(dColor,0.75)} 55%,${hex2rgba(dColor,0.45)} 100%)`;
    const dTx=dCount===6?"#3d1a00":"#3d2a00";
    const deco=cardDeco(r.name,r.rarity);

    return `<div class="card">
      <div class="card-head" style="background:${headBg}">
        <div class="card-deco">${r.skill}</div>
        <div class="card-dec-hex" style="color:${dTx};opacity:0.4">${deco.hex}</div>
        ${(r.en||r.enFull)?`<img class="card-img" src="${weaponImgUrl(r)}" onerror="this.style.display='none'" alt="">`:''}
        <div class="card-stars">${'<img class="card-star-icon" src="https://endfield.wiki.gg/images/Star.svg?9e1020" alt="★" style="filter:brightness(0) invert(0.15)">'.repeat(dCount)}</div>
        <div style="display:flex;align-items:center;gap:6px">
          <div class="srow-bar" style="background:${dTx};height:30px"></div>
          <div>
            <div class="card-type-lbl" style="color:${dTx}">${r.type}</div>
            <div class="card-name-txt" style="color:${dTx}">${r.name}</div>
          </div>
        </div>
      </div>
      <div class="card-body">
        <div class="card-dec-coord">${deco.coord}</div>
        <div class="srow">
          ${BASE_ICON[r.base]?`<img class="srow-icon" src="${BASE_ICON[r.base]}" alt="${r.base}">`:`<div class="srow-dot" style="border-color:#888"></div>`}
          <span class="srow-name">${r.base}</span>
        </div>
        <div class="srow">
          ${EFF_ICON[r.eff]?`<img class="srow-icon" src="${EFF_ICON[r.eff]}" alt="${r.eff}">`:`<div class="srow-dot" style="border-color:#888"></div>`}
          <span class="srow-name">${r.eff}</span>
        </div>
        <div class="srow">
          ${SKILL_ICON[r.skill]?`<img class="srow-icon" src="${SKILL_ICON[r.skill]}" alt="${r.skill}">`:`<div class="srow-dot" style="border-color:#888"></div>`}
          <span class="srow-name">${r.skill}</span>
        </div>
      </div>
    </div>`;
  }).join("");
  document.getElementById("cnt").textContent=`[ ${String(rows.length).padStart(2,'0')} / ${String(D.length).padStart(2,'0')} ]`;
  const rHex=rows.length.toString(16).padStart(4,'0').toUpperCase();
  const tHex=D.length.toString(16).padStart(4,'0').toUpperCase();
  let chk=0;for(const c of(bF+eF+sF+wF))chk=((chk<<5)-chk+c.charCodeAt(0))&0xFFFF;
  document.getElementById("fs-deco").textContent=`MATCH 0x${rHex} / 0x${tHex}  CHK:${chk.toString(16).padStart(4,'0').toUpperCase()}`;
}

// topo-bg生成
(function(){
  const canvas=document.getElementById('topo-bg');
  const ctx=canvas.getContext('2d');
  function noise(x,y,s){
    return Math.sin(x*0.3+s)*Math.cos(y*0.2+s*0.7)
          +Math.sin(x*0.7+y*0.5+s*1.3)*0.5
          +Math.sin(x*0.15+y*0.35+s*2.1)*1.2
          +Math.sin(x*2.1+y*1.8+s*0.9)*0.06;
  }
  function draw(){
    const W=canvas.width,H=canvas.height;
    ctx.clearRect(0,0,W,H);
    const step=20,S=3.7;
    ctx.textAlign='center';ctx.textBaseline='middle';
    for(let l=0;l<14;l++){
      const thr=-1.4+l*0.22;
      ctx.beginPath();
      const textPts=[];let seg=0;
      for(let x=0;x<W;x+=step){
        for(let y=0;y<H;y+=step){
          const v00=noise(x/70,y/70,S),v10=noise((x+step)/70,y/70,S);
          const v01=noise(x/70,(y+step)/70,S),v11=noise((x+step)/70,(y+step)/70,S);
          const idx=(v00>thr?8:0)+(v10>thr?4:0)+(v11>thr?2:0)+(v01>thr?1:0);
          const T=[x+((thr-v00)/(v10-v00)||0.5)*step,y];
          const B=[x+((thr-v01)/(v11-v01)||0.5)*step,y+step];
          const L=[x,y+((thr-v00)/(v01-v00)||0.5)*step];
          const R=[x+step,y+((thr-v10)/(v11-v10)||0.5)*step];
          const m={1:[B,L],2:[R,B],3:[R,L],4:[T,R],6:[T,B],7:[T,L],8:[T,L],9:[T,B],11:[T,R],12:[R,L],13:[R,B],14:[B,L]};
          let p0,p1;
          if(idx===5){ctx.moveTo(T[0],T[1]);ctx.lineTo(L[0],L[1]);ctx.moveTo(R[0],R[1]);ctx.lineTo(B[0],B[1]);p0=T;p1=L;seg+=2;}
          else if(idx===10){ctx.moveTo(T[0],T[1]);ctx.lineTo(R[0],R[1]);ctx.moveTo(L[0],L[1]);ctx.lineTo(B[0],B[1]);p0=T;p1=R;seg+=2;}
          else if(m[idx]){p0=m[idx][0];p1=m[idx][1];ctx.moveTo(p0[0],p0[1]);ctx.lineTo(p1[0],p1[1]);seg++;}
          if(p0&&p1&&l%3===1){
            const mx=(p0[0]+p1[0])/2,my=(p0[1]+p1[1])/2;
            const rnd=Math.abs(Math.sin(mx*127.1+my*311.7+l*53.3));
            if(rnd<0.028) textPts.push({x:mx,y:my,a:Math.atan2(p1[1]-p0[1],p1[0]-p0[0])});
          }
        }
      }
      const b=30+l*5;
      ctx.strokeStyle=`rgb(${b},${b},${b})`;ctx.lineWidth=0.5;ctx.stroke();
      if(textPts.length){
        ctx.font='7px Rajdhani,monospace';
        ctx.fillStyle='rgba(255,255,255,0.13)';
        const toH=n=>Math.round(n).toString(16).toUpperCase().padStart(3,'0');
        const fmt=[
          p=>`${p.x.toFixed(1)} / ${p.y.toFixed(1)}`,
          p=>`0x${toH(p.x)} / 0x${toH(p.y)}`,
          p=>`@0x${toH(p.x)}${toH(p.y)}`,
          p=>`${toH(p.x)}h / ${toH(p.y)}h`,
          p=>`${p.x.toFixed(1)} / 0x${toH(p.y)}`,
        ];
        textPts.forEach(p=>{
          const r=Math.abs(Math.sin(p.x*73.1+p.y*191.7));
          const label=fmt[Math.floor(r*fmt.length)](p);
          ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.a);
          ctx.fillText(label,0,-4);
          ctx.restore();
        });
      }
    }
  }
  function drawGrid(){
    const W=canvas.width,H=canvas.height;
    const sp=50,crossEvery=4;
    for(let xi=0;xi*sp<=W;xi++){
      for(let yi=0;yi*sp<=H;yi++){
        const x=xi*sp,y=yi*sp;
        const isCross=(xi%crossEvery===0&&yi%crossEvery===0);
        if(isCross){
          const s=5;
          ctx.strokeStyle='rgba(255,255,255,0.18)';
          ctx.lineWidth=0.7;
          ctx.beginPath();
          ctx.moveTo(x-s,y);ctx.lineTo(x+s,y);
          ctx.moveTo(x,y-s);ctx.lineTo(x,y+s);
          ctx.stroke();
        } else {
          ctx.fillStyle='rgba(255,255,255,0.07)';
          ctx.beginPath();
          ctx.arc(x,y,0.8,0,Math.PI*2);
          ctx.fill();
        }
      }
    }
  }
  function resize(){canvas.width=window.innerWidth;canvas.height=window.innerHeight;draw();drawGrid();}
  resize();
  window.addEventListener('resize',resize);
})();

buildFilters();render();
