// ---- アプリ本体（データは weapons_data.js） ----

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
  if(!rows.length){grid.innerHTML=`<div class="no-res">該当データなし</div>`;document.getElementById("cnt").textContent="0件";return;}

  grid.innerHTML=rows.map(r=>{
    const dCount=r.rarity>=6?6:5;
    const dColor=dCount===6?"#FF7000":"#FFBA03";
    const headBg=`linear-gradient(135deg,${dColor} 0%,${hex2rgba(dColor,0.75)} 55%,${hex2rgba(dColor,0.45)} 100%)`;
    const dTx=dCount===6?"#3d1a00":"#3d2a00";

    return `<div class="card">
      <div class="card-head" style="background:${headBg}">
        <div class="card-deco">${r.skill}</div>
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
  document.getElementById("cnt").textContent=`${rows.length} / ${D.length} 件`;
}

// bg-deco生成
document.getElementById("bg-deco").innerHTML=
  Array.from({length:6},()=>`<div class="bd-row">${Array.from({length:4},()=>`<div class="bd-unit"><span class="bd-sub">アークナイツ</span><span>エンドフィールド</span></div>`).join("")}</div>`).join("");

buildFilters();render();
