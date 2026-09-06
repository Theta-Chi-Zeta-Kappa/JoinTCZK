(() => {
  const status = document.getElementById("eventsStatus");
  const upcomingGrid = document.getElementById("upcomingEventsGrid");
  const noUpcoming = document.getElementById("noUpcomingEvents");
  const pastSection = document.getElementById("past-events");
  const pastGrid = document.getElementById("pastEventsGrid");
  const shareUrl = String(window.EVENTS_SHEET_SHARE_URL || "").trim();
  const sheetName = String(window.EVENTS_SHEET_NAME || "Events").trim();
  const fallbackLogo = "/assets/img/mainlogo.png";

  const esc = v => String(v ?? "").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;");
  const norm = v => String(v || "").trim().toLowerCase().replace(/\s+/g," ");
  const yes = v => ["yes","y","true","1"].includes(norm(v));

  function sheetId(url){ const m=url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/); if(!m) throw new Error("The Google Sheets share link is not in a recognized format."); return m[1]; }
  function cell(row,i){ const c=row.c?.[i]; return c ? String(c.f ?? c.v ?? "").trim() : ""; }
  function raw(row,i){ return row.c?.[i]?.v ?? ""; }

  function parseGoogleDate(value, formatted){
    if(value instanceof Date) return new Date(value.getFullYear(),value.getMonth(),value.getDate());
    const s=String(value||"");
    let m=s.match(/^Date\((\d+),(\d+),(\d+)/);
    if(m) return new Date(+m[1],+m[2],+m[3]);
    const f=String(formatted||"").trim();
    const parsed=new Date(f);
    if(!Number.isNaN(parsed.getTime())) return new Date(parsed.getFullYear(),parsed.getMonth(),parsed.getDate());
    return null;
  }


  function normalizeAssetPath(value){
    const text=String(value??"").trim();
    if(!text) return "";
    if(/^(?:https?:)?\/\//i.test(text) || text.startsWith("data:") || text.startsWith("/")) return text;
    if(text.startsWith("assets/")) return `/${text}`;
    return text;
  }

  function rowsToEvents(table){
    if(!table?.cols || !table?.rows) throw new Error("Google returned an unexpected sheet format.");
    const headers=table.cols.map(c=>norm(c.label||c.id||""));
    const idx=k=>headers.indexOf(k);
    const expected=["event","date","start time","end time","location","description","image","show in past events"];
    const missing=expected.filter(k=>idx(k)<0);
    if(missing.length) throw new Error(`Missing expected column${missing.length>1?"s":""}: ${missing.join(", ")}.`);
    return table.rows.map(row=>{
      const formattedDate=cell(row,idx("date"));
      return {
        name:cell(row,idx("event")), date:parseGoogleDate(raw(row,idx("date")),formattedDate), dateLabel:formattedDate,
        start:cell(row,idx("start time")), end:cell(row,idx("end time")), location:cell(row,idx("location")),
        description:cell(row,idx("description")), image:normalizeAssetPath(cell(row,idx("image"))), showPast:yes(cell(row,idx("show in past events")))
      };
    }).filter(e=>e.name && e.date);
  }

  function dateText(e){ return e.date.toLocaleDateString(undefined,{weekday:"long",month:"long",day:"numeric",year:"numeric"}); }
  function timeText(e){ if(e.start && e.end) return `${e.start} – ${e.end}`; return e.start || e.end || ""; }

  function upcomingCard(e){
    const a=document.createElement("article"); a.className="event-card";
    const image=e.image ? `<div class="event-image"><img src="${esc(e.image)}" alt="${esc(e.name)}" loading="lazy"></div>` : `<div class="event-image placeholder"><img src="${fallbackLogo}" alt="" aria-hidden="true"></div>`;
    a.innerHTML=`${image}<div class="event-body"><div class="event-date">${esc(dateText(e))}</div><h3>${esc(e.name)}</h3><div class="event-meta">${timeText(e)?`<span><strong>Time:</strong> ${esc(timeText(e))}</span>`:""}${e.location?`<span><strong>Location:</strong> ${esc(e.location)}</span>`:""}</div>${e.description?`<p class="event-description">${esc(e.description)}</p>`:""}</div>`;
    const img=a.querySelector(".event-image:not(.placeholder) img"); if(img) img.addEventListener("error",()=>{img.parentElement.classList.add("placeholder");img.parentElement.innerHTML=`<img src="${fallbackLogo}" alt="" aria-hidden="true">`;},{once:true});
    return a;
  }

  function pastCard(e){
    const a=document.createElement("article"); a.className=`past-event-card${e.image?"":" no-image"}`;
    a.innerHTML=`${e.image?`<img src="${esc(e.image)}" alt="${esc(e.name)}" loading="lazy">`:""}<div class="past-event-content"><div class="event-date">${esc(dateText(e))}</div><h3>${esc(e.name)}</h3>${e.description?`<p>${esc(e.description)}</p>`:""}</div>`;
    return a;
  }

  function render(events){
    const today=new Date(); today.setHours(0,0,0,0);
    const upcoming=events.filter(e=>e.date>=today).sort((a,b)=>a.date-b.date);
    const past=events.filter(e=>e.date<today && e.showPast).sort((a,b)=>b.date-a.date);
    status.hidden=true;
    if(upcoming.length){ upcomingGrid.hidden=false; upcomingGrid.replaceChildren(...upcoming.map(upcomingCard)); noUpcoming.hidden=true; }
    else { upcomingGrid.hidden=true; noUpcoming.hidden=false; }
    if(past.length){ pastSection.hidden=false; pastGrid.replaceChildren(...past.map(pastCard)); } else pastSection.hidden=true;
  }

  function loadGViz(id){
    return new Promise((resolve,reject)=>{
      const cb=`__eventsSheetCallback_${Date.now()}`; let done=false; const script=document.createElement("script");
      const cleanup=()=>{try{delete window[cb]}catch(_){window[cb]=undefined}script.remove()};
      const timer=setTimeout(()=>{if(done)return;done=true;cleanup();reject(new Error("Google Sheets did not respond before the request timed out."));},10000);
      window[cb]=response=>{if(done)return;done=true;clearTimeout(timer);cleanup();if(!response)return reject(new Error("Google Sheets returned no response."));if(response.status==="error")return reject(new Error(response.errors?.map(x=>x.detailed_message||x.message).filter(Boolean).join(" ")||"Google Sheets reported an error."));try{resolve(rowsToEvents(response.table))}catch(e){reject(e)}};
      const p=new URLSearchParams({sheet:sheetName,range:"A4:H",headers:"1",tqx:`responseHandler:${cb}`,tq:"select *"});
      script.async=true; script.src=`https://docs.google.com/spreadsheets/d/${encodeURIComponent(id)}/gviz/tq?${p.toString()}`;
      script.onerror=()=>{if(done)return;done=true;clearTimeout(timer);cleanup();reject(new Error("The browser could not load the Google Sheets data request."));}; document.head.appendChild(script);
    });
  }

  async function load(){
    if(!shareUrl){status.className="events-status error";status.innerHTML=`Google Sheet not connected yet. Paste the same normal Google Sheets share link used for Active Brothers into <strong>js/events-config.js</strong>.`;return;}
    try{render(await loadGViz(sheetId(shareUrl)))}catch(e){console.error("Events sheet load failed:",e);status.className="events-status error";status.innerHTML=`<strong>Events failed to load.</strong><br>${esc(e.message)}<br><br>Check that the workbook is viewable by the website and that the tab is named <strong>Events</strong> with the expected headers on row 4.`;}
  }
  load();
})();
