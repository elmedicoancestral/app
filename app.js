(() => {
  'use strict';
  const RECIPES = window.RECIPES || [];
  const INGREDIENTS = window.INGREDIENTS || [];
  const LIB = window.APP_LIBRARY || {plants:[],preparations:[],specialGuides:[],safety:{},categories:[]};
  const KEYS = {
    onboarded:'ema_onboarded_v1', favorites:'ema_favorites_v1', pantry:'ema_pantry_v1',
    recent:'ema_recent_v1', prepared:'ema_prepared_v1', demo:'ema_demo_v1'
  };
  const previewMode = new URLSearchParams(location.search).has('preview');
  const state = {
    route:'home', favorites:new Set(loadJSON(KEYS.favorites, [])), pantry:new Set(loadJSON(KEYS.pantry, [])),
    recent:loadJSON(KEYS.recent, []), prepared:loadJSON(KEYS.prepared, []),
    globalSearch:'', consult:{step:1, category:'', subcategory:'', person:'adult', pregnancy:false, medication:false, chronic:false, severe:false, result:null},
    libraryTab:'plants', recipeFilter:{category:'all',subcategory:'all',query:'',page:1,favoriteOnly:false}, pantryQuery:'', libraryQuery:''
  };
  const main = document.getElementById('app-main');
  const modalRoot = document.getElementById('modal-root');
  const toastEl = document.getElementById('toast');

  function loadJSON(key, fallback){ try { const value=localStorage.getItem(key); return value ? JSON.parse(value) : fallback; } catch { return fallback; } }
  function saveJSON(key, value){ try { localStorage.setItem(key, JSON.stringify(value)); } catch(e){ console.warn('No se pudo guardar', e); } }
  function esc(value=''){ return String(value).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }
  function norm(value=''){ return String(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase(); }
  function recipeById(id){ return RECIPES.find(r => r.id === Number(id)); }
  function toast(message){ toastEl.textContent=message; toastEl.classList.add('show'); clearTimeout(toast._t); toast._t=setTimeout(()=>toastEl.classList.remove('show'),2600); }
  function setRoute(route){ state.route=route; document.querySelectorAll('.nav-item').forEach(b=>b.classList.toggle('active',b.dataset.route===route)); render(); window.scrollTo({top:0,behavior:'smooth'}); }
  function iconForCategory(name){ return LIB.categories.find(c=>c.name===name)?.icon || '🌱'; }
  function list(items, ordered=false){ if(!items?.length) return '<p class="muted">No especificado en el material fuente.</p>'; const tag=ordered?'ol':'ul'; return `<${tag}>${items.map(i=>`<li>${esc(i)}</li>`).join('')}</${tag}>`; }
  function recipeCard(r, extra=''){
    const fav=state.favorites.has(r.id);
    return `<article class="recipe-card" data-open-recipe="${r.id}">
      <div class="recipe-icon" aria-hidden="true">${esc(r.icon || '🌱')}</div>
      <div class="recipe-copy"><h3>${esc(r.title)}</h3><p>${esc(r.subcategory)} · ${esc(r.method)}</p>
        <div class="recipe-tags"><span class="tag">Receta ${r.id}</span>${r.yield?`<span class="tag">${esc(r.yield)}</span>`:''}${extra}</div>
      </div>
      <button class="favorite-button ${fav?'active':''}" data-favorite="${r.id}" aria-label="${fav?'Quitar de favoritos':'Agregar a favoritos'}">${fav?'★':'☆'}</button>
    </article>`;
  }

  function render(){
    if(state.route==='home') renderHome();
    else if(state.route==='consult') renderConsult();
    else if(state.route==='pantry') renderPantry();
    else renderLibrary();
  }

  function renderHome(){
    const favs=RECIPES.filter(r=>state.favorites.has(r.id)).slice(0,4);
    const recent=state.recent.map(recipeById).filter(Boolean).slice(0,4);
    const preparedToday=state.prepared.filter(p=>new Date(p.createdAt).toDateString()===new Date().toDateString()).length;
    main.innerHTML=`
      <section class="hero"><div class="hero-content"><p class="eyebrow">Sabiduría ancestral · criterio responsable</p>
        <h1>¿Qué necesitás resolver hoy?</h1><p>Encontrá el malestar, revisá las precauciones y seguí una preparación paso a paso.</p>
        <div class="hero-actions"><button class="btn btn-primary" data-route="consult">Consultar un malestar</button><button class="btn btn-secondary" data-route="pantry">Ver mi botica</button></div>
      </div></section>
      <form class="search-box home-search" id="home-search-form"><label class="hidden" for="home-search">Buscar</label><span aria-hidden="true">⌕</span><input id="home-search" name="q" value="${esc(state.globalSearch)}" placeholder="Buscá por síntoma, planta o preparación"><button aria-label="Buscar">→</button></form>
      <section class="section"><div class="section-header"><div><h2>Explorá por sistema</h2><p>330 recetas organizadas para encontrar rápido.</p></div></div>
        <div class="category-grid">${LIB.categories.map(c=>`<button class="category-card" data-category="${esc(c.name)}"><span class="emoji" aria-hidden="true">${c.icon}</span><strong>${esc(c.name)}</strong><small>Recetas ${c.start}–${c.end}</small></button>`).join('')}</div>
      </section>
      <section class="section"><div class="pantry-summary"><div class="metric"><strong>${state.pantry.size}</strong><small>ingredientes en tu botica</small></div><div class="metric"><strong>${preparedToday}</strong><small>preparaciones marcadas hoy</small></div></div></section>
      <section class="section"><div class="section-header"><div><h2>Tus favoritas</h2><p>Lo que querés tener siempre a mano.</p></div>${favs.length?'<button class="text-button" data-show-all-favorites>Ver todas</button>':''}</div>
        <div class="card-grid">${favs.length?favs.map(recipeCard).join(''):`<div class="empty-state"><div class="empty-icon">☆</div><h3>Todavía no guardaste recetas</h3><p>Tocá la estrella de cualquier preparación para encontrarla acá.</p><button class="btn btn-light" data-route="consult">Explorar recetas</button></div>`}</div>
      </section>
      ${recent.length?`<section class="section"><div class="section-header"><div><h2>Consultadas recientemente</h2><p>Retomá donde estabas.</p></div></div><div class="card-grid">${recent.map(recipeCard).join('')}</div></section>`:''}
      <section class="section"><div class="alert alert-neutral"><span aria-hidden="true">🛡️</span><div><strong>Recordatorio de seguridad</strong>La app acompaña decisiones de autocuidado. No diagnostica ni reemplaza la consulta profesional.</div></div></section>`;
  }

  function renderConsult(){
    if(state.consult.step===99) return renderBrowseRecipes();
    if(state.consult.step===1) return renderConsultStep1();
    if(state.consult.step===2) return renderConsultStep2();
    return renderConsultResults();
  }
  function consultStepper(step){ return `<div class="stepper"><div class="step ${step===1?'active':step>1?'done':''}">1. Malestar</div><div class="step ${step===2?'active':step>2?'done':''}">2. Seguridad</div><div class="step ${step===3?'active':''}">3. Opciones</div></div>`; }
  function renderConsultStep1(){
    const cat=LIB.categories.find(c=>c.name===state.consult.category);
    main.innerHTML=`<div class="page-heading"><p class="eyebrow">Índice Express</p><h1 class="page-title">Consultar un malestar</h1><p>Elegí el sistema y la molestia que más se aproxima a lo que querés buscar.</p></div>${consultStepper(1)}
      <form id="consult-step1" class="panel form-grid">
        <div class="field"><label for="consult-category">Sistema o área</label><select id="consult-category" required><option value="">Seleccioná una opción</option>${LIB.categories.map(c=>`<option ${c.name===state.consult.category?'selected':''}>${esc(c.name)}</option>`).join('')}</select></div>
        <div class="field"><label for="consult-subcategory">Malestar</label><select id="consult-subcategory" required ${cat?'':'disabled'}><option value="">Seleccioná una opción</option>${cat?cat.subcategories.map(s=>`<option ${s.name===state.consult.subcategory?'selected':''}>${esc(s.name)}</option>`).join(''):''}</select><span class="field-help">No es un diagnóstico: solo organiza el contenido disponible.</span></div>
        <button class="btn btn-primary btn-block" type="submit">Revisar seguridad</button>
      </form>
      <section class="section"><div class="section-header"><div><h2>O explorá todas las recetas</h2><p>Usá buscador y filtros sin iniciar una consulta.</p></div></div><button class="btn btn-light btn-block" data-browse-all>Ver biblioteca de recetas</button></section>`;
  }
  function renderConsultStep2(){
    main.innerHTML=`<div class="page-heading"><p class="eyebrow">Semáforo de seguridad</p><h1 class="page-title">Antes de mostrar opciones</h1><p>Estas preguntas no diagnostican. Solo identifican cuándo la app no debe continuar o cuándo hace falta mayor precaución.</p></div>${consultStepper(2)}
      <form id="consult-step2" class="panel form-grid">
        <fieldset class="field"><legend>¿Para quién es la consulta?</legend><div class="choice-grid">
          <div class="choice"><input type="radio" id="person-adult" name="person" value="adult" ${state.consult.person==='adult'?'checked':''}><label for="person-adult">🧑 Persona adulta</label></div>
          <div class="choice"><input type="radio" id="person-child" name="person" value="child" ${state.consult.person==='child'?'checked':''}><label for="person-child">🧒 Niño o niña</label></div>
          <div class="choice"><input type="radio" id="person-baby" name="person" value="baby" ${state.consult.person==='baby'?'checked':''}><label for="person-baby">👶 Bebé</label></div>
          <div class="choice"><input type="radio" id="person-older" name="person" value="older" ${state.consult.person==='older'?'checked':''}><label for="person-older">🧓 Persona mayor</label></div>
        </div></fieldset>
        <fieldset class="field"><legend>Situaciones que requieren precaución</legend><div class="form-grid">
          <label class="consent-row"><input type="checkbox" name="pregnancy" ${state.consult.pregnancy?'checked':''}><span>Embarazo, búsqueda de embarazo o lactancia</span></label>
          <label class="consent-row"><input type="checkbox" name="medication" ${state.consult.medication?'checked':''}><span>Uso de medicación crónica o múltiples medicamentos</span></label>
          <label class="consent-row"><input type="checkbox" name="chronic" ${state.consult.chronic?'checked':''}><span>Enfermedad crónica, trasplante o tratamiento oncológico</span></label>
        </div></fieldset>
        <label class="consent-row" style="background:#f9e9e7"><input type="checkbox" name="severe" ${state.consult.severe?'checked':''}><span><strong>Hay una señal de alarma:</strong> fiebre alta, dolor agudo, sangrado, falta de aire, vómitos persistentes, empeoramiento rápido o síntoma grave/nuevo.</span></label>
        <div class="hero-actions"><button type="button" class="btn btn-light" data-consult-back>Volver</button><button class="btn btn-primary" type="submit">Ver resultado</button></div>
      </form>`;
  }
  function renderConsultResults(){
    const c=state.consult;
    let level='green', title='Podés explorar opciones de autocuidado', message='El material puede utilizarse como apoyo educativo para un malestar leve o conocido. Leé siempre las precauciones de cada receta.';
    if(c.severe || c.person==='baby') { level='red'; title='La aplicación no debe continuar con una preparación'; message=c.person==='baby'?'Por tratarse de un bebé, el contenido general de recetas no sustituye una evaluación pediátrica. Consultá antes de usar preparaciones.':'La presencia de una señal de alarma requiere evaluación profesional. No demores la consulta para probar una receta casera.'; }
    else if(c.pregnancy || c.medication || c.chronic || c.person==='child' || c.person==='older') { level='amber'; title='Continuá solo con orientación profesional'; message='La situación seleccionada puede cambiar dosis, compatibilidades o contraindicaciones. Podés leer el material, pero consultá antes de usar una preparación.'; }
    c.result=level;
    const results=RECIPES.filter(r=>r.subcategory===c.subcategory);
    main.innerHTML=`<div class="page-heading"><p class="eyebrow">Resultado de seguridad</p><h1 class="page-title">${esc(c.subcategory)}</h1><p>${esc(c.category)}</p></div>${consultStepper(3)}
      <div class="alert alert-${level}"><span aria-hidden="true">${level==='red'?'⛔':level==='amber'?'⚠️':'✓'}</span><div><strong>${title}</strong>${message}</div></div>
      ${level==='red'?`<section class="section"><div class="panel"><h2>Señales para consultar</h2>${list(LIB.safety.redFlags)}<button class="btn btn-light btn-block mt-3" data-new-consult>Nueva consulta</button></div></section>`:`
      <section class="section"><div class="section-header"><div><h2>Opciones del recetario</h2><p>${results.length} preparaciones asociadas a esta categoría.</p></div></div>
        ${level==='amber'?'<p class="muted">Se muestran para lectura. La selección no equivale a una indicación personalizada.</p>':''}
        <div class="card-grid">${results.map(recipeCard).join('')}</div>
        <button class="btn btn-light btn-block mt-3" data-new-consult>Nueva consulta</button>
      </section>`}`;
  }

  function renderBrowseRecipes(){
    state.route='consult'; state.consult.step=99;
    document.querySelectorAll('.nav-item').forEach(b=>b.classList.toggle('active',b.dataset.route==='consult'));
    const filter=state.recipeFilter;
    let data=RECIPES.slice();
    if(filter.favoriteOnly) data=data.filter(r=>state.favorites.has(r.id));
    if(filter.category!=='all') data=data.filter(r=>r.category===filter.category);
    if(filter.subcategory!=='all') data=data.filter(r=>r.subcategory===filter.subcategory);
    if(filter.query){ const q=norm(filter.query); data=data.filter(r=>norm([r.title,r.category,r.subcategory,r.method,...r.ingredients,...r.benefits].join(' ')).includes(q)); }
    const perPage=15, pages=Math.max(1,Math.ceil(data.length/perPage)); filter.page=Math.min(filter.page,pages);
    const shown=data.slice((filter.page-1)*perPage,filter.page*perPage);
    const category=LIB.categories.find(c=>c.name===filter.category);
    main.innerHTML=`<div class="page-heading"><p class="eyebrow">Recetario completo</p><h1 class="page-title">${filter.favoriteOnly?'Tus recetas favoritas':'Explorar 330 recetas'}</h1><p>Buscá por síntoma, ingrediente, planta o tipo de preparación.</p></div>
      <div class="filters"><form class="search-box" id="recipe-search-form"><input name="q" value="${esc(filter.query)}" placeholder="Ej.: manzanilla, tos, cataplasma"><button aria-label="Buscar">→</button></form>
      <div class="chips"><button class="chip ${filter.category==='all'?'active':''}" data-filter-category="all">Todas</button>${LIB.categories.map(c=>`<button class="chip ${filter.category===c.name?'active':''}" data-filter-category="${esc(c.name)}">${c.icon} ${esc(c.name)}</button>`).join('')}</div>
      ${category?`<div class="chips"><button class="chip ${filter.subcategory==='all'?'active':''}" data-filter-subcategory="all">Todos los malestares</button>${category.subcategories.map(s=>`<button class="chip ${filter.subcategory===s.name?'active':''}" data-filter-subcategory="${esc(s.name)}">${esc(s.name)}</button>`).join('')}</div>`:''}</div>
      <p class="result-count">${data.length} resultados · página ${filter.page} de ${pages}</p>
      <div class="card-grid">${shown.map(recipeCard).join('')}</div>
      <div class="pagination"><button class="btn btn-light btn-small" data-page="${filter.page-1}" ${filter.page<=1?'disabled':''}>Anterior</button><span>${filter.page} / ${pages}</span><button class="btn btn-light btn-small" data-page="${filter.page+1}" ${filter.page>=pages?'disabled':''}>Siguiente</button></div>
      <button class="btn btn-ghost btn-block mt-3" data-new-consult>Volver a consulta guiada</button>`;
  }

  function renderPantry(){
    const q=norm(state.pantryQuery);
    const ingredientData=INGREDIENTS.filter(i=>!q || norm(i.name).includes(q)).slice(0,q?100:60);
    const selected=state.pantry;
    const possible=RECIPES.map(r=>{
      const keys=r.ingredientKeys||[]; const have=keys.filter(k=>selected.has(k)).length; const total=Math.max(keys.length,1); return {...r,_have:have,_total:total,_pct:Math.round(have/total*100)};
    }).filter(r=>r._have>0 && r._pct>=50).sort((a,b)=>b._pct-a._pct || b._have-a._have).slice(0,12);
    main.innerHTML=`<div class="page-heading"><p class="eyebrow">Tu alacena organizada</p><h1 class="page-title">Mi botica</h1><p>Marcá lo que tenés. La app te muestra qué recetas coinciden mejor con tus ingredientes.</p></div>
      <div class="pantry-summary"><div class="metric"><strong>${selected.size}</strong><small>ingredientes marcados</small></div><div class="metric"><strong>${possible.length}</strong><small>coincidencias destacadas</small></div></div>
      <section class="panel"><div class="section-header"><div><h2>Ingredientes disponibles</h2><p>Los más usados aparecen primero.</p></div>${selected.size?'<button class="text-button" data-clear-pantry>Limpiar</button>':''}</div>
        <form class="search-box" id="pantry-search-form"><input name="q" value="${esc(state.pantryQuery)}" placeholder="Buscar ingrediente"><button aria-label="Buscar">→</button></form>
        <div class="ingredient-list mt-3">${ingredientData.map(i=>`<label class="ingredient-item"><input type="checkbox" data-pantry-key="${esc(i.key)}" ${selected.has(i.key)?'checked':''}><span>${esc(i.name)}<small>Aparece en ${i.count} recetas</small></span></label>`).join('')}</div>
      </section>
      <section class="section"><div class="section-header"><div><h2>Podés preparar</h2><p>Coincidencias orientativas según lo que marcaste.</p></div></div>
        <div class="card-grid">${possible.length?possible.map(r=>recipeCard(r,`<span class="tag">${r._have}/${r._total} ingredientes</span><div class="match-bar" title="${r._pct}% de coincidencia"><span style="width:${r._pct}%"></span></div>`)).join(''):`<div class="empty-state"><div class="empty-icon">⚗</div><h3>Marcá tus primeras hierbas</h3><p>Al seleccionar ingredientes, vas a ver las recetas con mayor coincidencia. Revisá siempre cantidades y faltantes.</p></div>`}</div>
      </section>`;
  }

  function renderLibrary(){
    const tabs=[['plants','Plantas'],['preparations','Preparaciones'],['guides','Guías'],['safety','Seguridad']];
    let content='';
    const q=norm(state.libraryQuery);
    if(state.libraryTab==='plants'){
      const data=LIB.plants.filter(p=>!q || norm([p.name,p.uses,p.how,p.substitute].join(' ')).includes(q));
      content=`<form class="search-box" id="library-search-form"><input name="q" value="${esc(state.libraryQuery)}" placeholder="Buscar planta o uso"><button aria-label="Buscar">→</button></form><div class="library-grid mt-3">${data.map(p=>`<button class="library-card" data-open-plant="${p.id}" style="text-align:left"><div class="card-top"><span class="big-icon">🌿</span><div><h3>${esc(p.name)}</h3><p>${esc(p.uses)}</p></div></div></button>`).join('')}</div>`;
    } else if(state.libraryTab==='preparations'){
      content=`<div class="library-grid">${LIB.preparations.map(p=>`<button class="library-card" data-open-preparation="${esc(p.id)}" style="text-align:left"><div class="card-top"><span class="big-icon">${p.icon}</span><div><h3>${esc(p.title)}</h3><p>${esc(p.bestFor)}</p></div></div></button>`).join('')}</div>`;
    } else if(state.libraryTab==='guides'){
      content=`<div class="library-grid">${LIB.specialGuides.map(g=>`<button class="library-card" data-open-guide="${esc(g.id)}" style="text-align:left"><div class="card-top"><span class="big-icon">${g.icon}</span><div><h3>${esc(g.title)}</h3><p>${esc(g.summary)}</p><span class="tag">${esc(g.type)}</span></div></div></button>`).join('')}</div>`;
    } else {
      content=`<div class="alert alert-neutral"><span>🛡️</span><div><strong>Principio central</strong>Lo natural no es improvisado. Esta biblioteca organiza información educativa y sus límites.</div></div>
      <div class="panel mt-3"><h2>Reglas generales</h2>${list(LIB.safety.general)}</div><div class="panel"><h2>Señales para frenar y consultar</h2>${list(LIB.safety.redFlags)}</div><div class="panel"><h2>Situaciones especiales</h2>${list(LIB.safety.specialSituations)}</div>`;
    }
    main.innerHTML=`<div class="page-heading"><p class="eyebrow">Aprendé una vez · consultá siempre</p><h1 class="page-title">Biblioteca ancestral</h1><p>Plantas, métodos de preparación, guías especiales y reglas de seguridad.</p></div>
      <div class="tabs" role="tablist">${tabs.map(([id,label])=>`<button class="tab ${state.libraryTab===id?'active':''}" data-library-tab="${id}" role="tab">${label}</button>`).join('')}</div>${content}`;
  }

  function openRecipe(id){
    const r=recipeById(id); if(!r) return;
    state.recent=[r.id,...state.recent.filter(x=>x!==r.id)].slice(0,12); saveJSON(KEYS.recent,state.recent);
    const fav=state.favorites.has(r.id);
    const pantryMissing=(r.ingredientKeys||[]).filter(k=>!state.pantry.has(k));
    const safetyHtml=r.precautions?.length?`<section class="detail-section"><h3>⚠️ Precauciones del material</h3>${list(r.precautions)}</section>`:`<section class="detail-section"><h3>⚠️ Antes de usar</h3><p class="muted">Esta ficha no trae una precaución específica extraída. Aplican las reglas generales: revisar embarazo, lactancia, edad, medicación, alergias y condiciones crónicas.</p></section>`;
    openModal(`Receta ${r.id}`,`<div class="recipe-detail-head"><p class="eyebrow">${esc(r.category)} · ${esc(r.subcategory)}</p><h2>${esc(r.title)}</h2><p>${esc(r.method)}${r.yield?' · '+esc(r.yield):''}</p><div class="detail-actions"><button class="btn btn-primary btn-small" data-favorite="${r.id}">${fav?'★ Guardada':'☆ Guardar'}</button><button class="btn btn-secondary btn-small" data-mark-prepared="${r.id}">✓ Marcar preparada</button></div></div>
      ${pantryMissing.length&&state.pantry.size?`<div class="alert alert-neutral"><span>⚗</span><div><strong>Según tu botica</strong>Revisá estos ingredientes que no marcaste: ${pantryMissing.slice(0,5).map(k=>esc(INGREDIENTS.find(i=>i.key===k)?.name||k)).join(', ')}${pantryMissing.length>5?'…':''}</div></div>`:''}
      <section class="detail-section"><h3>Ingredientes</h3>${list(r.ingredients)}</section>
      ${r.materials?.length?`<section class="detail-section"><h3>Materiales</h3>${list(r.materials)}</section>`:''}
      <section class="detail-section"><h3>Preparación paso a paso</h3>${list(r.preparation,true)}</section>
      <section class="detail-section"><h3>Beneficios descritos en el recetario</h3>${list(r.benefits)}</section>
      ${r.conservation?.length?`<section class="detail-section"><h3>Conservación</h3>${list(r.conservation)}</section>`:''}
      ${safetyHtml}
      <div class="alert alert-amber mt-3"><span>i</span><div><strong>Contenido educativo</strong>No reemplaza diagnóstico, tratamiento ni seguimiento profesional. Ante síntomas graves o falta de mejoría, consultá.</div></div>
      <p class="detail-source">Fuente interna: “Índice de Recetas Ancestrales y Enfermedades por Sistemas”, página ${r.sourcePage}. Se normalizaron guiones numéricos dañados por la extracción del PDF.</p>`);
  }
  function openPlant(id){ const p=LIB.plants.find(x=>x.id===Number(id)); if(!p)return; openModal(p.name,`<div class="recipe-detail-head"><p class="eyebrow">Planta ${p.id} de 30</p><h2>${esc(p.name)}</h2><p>Ficha de consulta rápida del material provisto.</p></div><section class="detail-section"><h3>Para qué se presenta</h3><p>${esc(p.uses)}</p></section><section class="detail-section"><h3>Parte utilizada</h3><p>${esc(p.part)}</p></section><section class="detail-section"><h3>Cómo usar</h3><p>${esc(p.how)}</p></section><section class="detail-section"><h3>Precaución</h3><p>${esc(p.precaution)}</p></section><section class="detail-section"><h3>Sustituto propuesto</h3><p>${esc(p.substitute)}</p></section><p class="detail-source">Fuente interna: “Recetario Ancestral de Remedios Naturales”, página ${p.sourcePage}.</p>`); }
  function openPreparation(id){ const p=LIB.preparations.find(x=>x.id===id); if(!p)return; openModal(p.title,`<div class="recipe-detail-head"><p class="eyebrow">Guía maestra</p><h2>${p.icon} ${esc(p.title)}</h2><p>${esc(p.bestFor)}</p></div><section class="detail-section"><h3>Base</h3>${list(p.ingredients)}</section><section class="detail-section"><h3>Pasos</h3>${list(p.steps,true)}</section><div class="alert alert-neutral"><span>i</span><div><strong>Nota</strong>${esc(p.note)}</div></div>`); }
  function openGuide(id){ const g=LIB.specialGuides.find(x=>x.id===id); if(!g)return; openModal(g.title,`<div class="recipe-detail-head"><p class="eyebrow">${esc(g.type)}</p><h2>${g.icon} ${esc(g.title)}</h2><p>${esc(g.summary)}</p></div><section class="detail-section"><h3>Puntos principales</h3>${list(g.points)}</section><div class="alert alert-amber"><span>⚠️</span><div><strong>Límite importante</strong>${esc(g.warning)}</div></div>`); }
  function openModal(title, body){ modalRoot.innerHTML=`<div class="modal-backdrop" data-close-modal><section class="modal" role="dialog" aria-modal="true" aria-label="${esc(title)}" data-modal-panel><header class="modal-header"><h2>${esc(title)}</h2><button class="modal-close" data-close-modal aria-label="Cerrar">×</button></header><div class="modal-body">${body}</div></section></div>`; document.body.style.overflow='hidden'; modalRoot.querySelector('.modal-close')?.focus(); }
  function closeModal(){ modalRoot.innerHTML=''; document.body.style.overflow=''; }

  function toggleFavorite(id){ id=Number(id); if(state.favorites.has(id)){state.favorites.delete(id);toast('Receta quitada de favoritos.');}else{state.favorites.add(id);toast('Receta guardada en favoritos.');} saveJSON(KEYS.favorites,[...state.favorites]); render(); if(modalRoot.innerHTML) openRecipe(id); }
  function markPrepared(id){ const r=recipeById(id); if(!r)return; state.prepared.unshift({id:crypto.randomUUID?crypto.randomUUID():String(Date.now()),recipeId:r.id,createdAt:new Date().toISOString(),conservation:r.conservation?.join(' ')||'Revisar la ficha'}); state.prepared=state.prepared.slice(0,100); saveJSON(KEYS.prepared,state.prepared); toast('Preparación registrada en este dispositivo.'); }

  function openSettings(){
    openModal('Configuración',`<div class="alert alert-neutral"><span>🔒</span><div><strong>Datos locales</strong>Favoritos, botica y registros se guardan únicamente en este navegador.</div></div>
      <div class="settings-group"><h3>Contenido</h3><div class="info-row"><span>Recetas</span><strong>${RECIPES.length}</strong></div><div class="info-row"><span>Plantas</span><strong>${LIB.plants.length}</strong></div><div class="info-row"><span>Preparaciones base</span><strong>${LIB.preparations.length}</strong></div></div>
      <div class="settings-group"><h3>Demostración</h3><div class="settings-stack"><button class="btn btn-light btn-block" data-load-demo>Cargar datos de demostración</button><button class="btn btn-ghost btn-block" data-remove-demo>Eliminar datos de demostración</button></div></div>
      <div class="settings-group"><h3>Tus datos</h3><div class="settings-stack"><button class="btn btn-light btn-block" data-export>Exportar copia JSON</button><label class="btn btn-light btn-block">Importar copia<input type="file" accept="application/json" id="import-file" hidden></label><button class="btn btn-danger btn-block" data-reset-app>Borrar todos mis datos</button></div></div>
      <div class="settings-group"><h3>Aviso</h3><p class="muted">El Médico Ancestral es una herramienta educativa y de organización. No brinda diagnósticos, no prescribe y no reemplaza consultas con profesionales de salud.</p></div>`);
  }
  function loadDemo(){ const common=INGREDIENTS.filter(i=>['manzanilla','jengibre','curcuma','limon','miel','menta','romero','lavanda'].some(k=>norm(i.name).includes(k))).slice(0,10).map(i=>i.key); state.pantry=new Set(common); state.favorites=new Set([1,36,136,166]); state.prepared=[{id:'demo-1',recipeId:136,createdAt:new Date().toISOString(),conservation:'Dato de demostración'}]; saveJSON(KEYS.pantry,[...state.pantry]); saveJSON(KEYS.favorites,[...state.favorites]); saveJSON(KEYS.prepared,state.prepared); localStorage.setItem(KEYS.demo,'1'); closeModal(); toast('Datos de demostración cargados.'); render(); }
  function removeDemo(){ if(localStorage.getItem(KEYS.demo)!=='1'){toast('No hay datos de demostración activos.');return;} state.pantry=new Set();state.favorites=new Set();state.prepared=[];saveJSON(KEYS.pantry,[]);saveJSON(KEYS.favorites,[]);saveJSON(KEYS.prepared,[]);localStorage.removeItem(KEYS.demo);closeModal();toast('Datos de demostración eliminados.');render(); }
  function exportData(){ const data={version:1,exportedAt:new Date().toISOString(),favorites:[...state.favorites],pantry:[...state.pantry],recent:state.recent,prepared:state.prepared}; const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}); const url=URL.createObjectURL(blob); const a=document.createElement('a');a.href=url;a.download='el-medico-ancestral-datos.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),500);toast('Copia exportada.'); }
  async function importData(file){ try{const data=JSON.parse(await file.text());state.favorites=new Set(Array.isArray(data.favorites)?data.favorites:[]);state.pantry=new Set(Array.isArray(data.pantry)?data.pantry:[]);state.recent=Array.isArray(data.recent)?data.recent:[];state.prepared=Array.isArray(data.prepared)?data.prepared:[];saveJSON(KEYS.favorites,[...state.favorites]);saveJSON(KEYS.pantry,[...state.pantry]);saveJSON(KEYS.recent,state.recent);saveJSON(KEYS.prepared,state.prepared);closeModal();toast('Copia importada.');render();}catch{toast('El archivo no es una copia válida.');} }
  function resetApp(){ if(!confirm('Esta acción eliminará favoritos, botica y registros guardados. No puede deshacerse.'))return; Object.values(KEYS).forEach(k=>localStorage.removeItem(k)); location.reload(); }

  document.addEventListener('click', e=>{
    const route=e.target.closest('[data-route]'); if(route){const target=route.dataset.route;if(target==='consult' && state.route!=='consult' && state.consult.step===99){state.consult.step=1;}setRoute(target);return;}
    const cat=e.target.closest('[data-category]'); if(cat){state.consult.category=cat.dataset.category;state.consult.subcategory='';state.consult.step=1;setRoute('consult');return;}
    const recipe=e.target.closest('[data-open-recipe]'); if(recipe && !e.target.closest('[data-favorite]')){openRecipe(recipe.dataset.openRecipe);return;}
    const fav=e.target.closest('[data-favorite]'); if(fav){e.stopPropagation();toggleFavorite(fav.dataset.favorite);return;}
    if(e.target.closest('[data-close-modal]') && !e.target.closest('[data-modal-panel]')){closeModal();return;}
    if(e.target.closest('.modal-close')){closeModal();return;}
    if(e.target.closest('[data-consult-back]')){state.consult.step=1;render();return;}
    if(e.target.closest('[data-new-consult]')){state.consult={step:1,category:'',subcategory:'',person:'adult',pregnancy:false,medication:false,chronic:false,severe:false,result:null};state.recipeFilter.favoriteOnly=false;render();return;}
    if(e.target.closest('[data-browse-all]')){state.recipeFilter={category:'all',subcategory:'all',query:'',page:1,favoriteOnly:false};renderBrowseRecipes();return;}
    const filterCat=e.target.closest('[data-filter-category]'); if(filterCat){state.recipeFilter.category=filterCat.dataset.filterCategory;state.recipeFilter.subcategory='all';state.recipeFilter.page=1;state.recipeFilter.favoriteOnly=false;renderBrowseRecipes();return;}
    const filterSub=e.target.closest('[data-filter-subcategory]'); if(filterSub){state.recipeFilter.subcategory=filterSub.dataset.filterSubcategory;state.recipeFilter.page=1;state.recipeFilter.favoriteOnly=false;renderBrowseRecipes();return;}
    const pageBtn=e.target.closest('[data-page]'); if(pageBtn && !pageBtn.disabled){state.recipeFilter.page=Number(pageBtn.dataset.page);renderBrowseRecipes();window.scrollTo({top:0,behavior:'smooth'});return;}
    const tab=e.target.closest('[data-library-tab]'); if(tab){state.libraryTab=tab.dataset.libraryTab;state.libraryQuery='';renderLibrary();return;}
    const plant=e.target.closest('[data-open-plant]'); if(plant){openPlant(plant.dataset.openPlant);return;}
    const prep=e.target.closest('[data-open-preparation]'); if(prep){openPreparation(prep.dataset.openPreparation);return;}
    const guide=e.target.closest('[data-open-guide]'); if(guide){openGuide(guide.dataset.openGuide);return;}
    const prepared=e.target.closest('[data-mark-prepared]'); if(prepared){markPrepared(prepared.dataset.markPrepared);return;}
    if(e.target.closest('[data-clear-pantry]')){if(confirm('¿Querés desmarcar todos los ingredientes?')){state.pantry.clear();saveJSON(KEYS.pantry,[]);renderPantry();}return;}
    if(e.target.closest('[data-load-demo]')){loadDemo();return;} if(e.target.closest('[data-remove-demo]')){removeDemo();return;} if(e.target.closest('[data-export]')){exportData();return;} if(e.target.closest('[data-reset-app]')){resetApp();return;}
    if(e.target.closest('[data-show-all-favorites]')){state.recipeFilter={category:'all',subcategory:'all',query:'',page:1,favoriteOnly:true};renderBrowseRecipes();return;}
    if(e.target.closest('[data-onboarding-next]')){document.querySelector('[data-onboarding-step="1"]').hidden=true;document.querySelector('[data-onboarding-step="2"]').hidden=false;return;}
  });
  document.addEventListener('change', e=>{
    if(e.target.id==='consult-category'){state.consult.category=e.target.value;state.consult.subcategory='';renderConsultStep1();return;}
    if(e.target.matches('[data-pantry-key]')){const key=e.target.dataset.pantryKey;e.target.checked?state.pantry.add(key):state.pantry.delete(key);saveJSON(KEYS.pantry,[...state.pantry]);renderPantry();return;}
    if(e.target.id==='safety-consent'){document.getElementById('finish-onboarding').disabled=!e.target.checked;return;}
    if(e.target.id==='import-file' && e.target.files[0]){importData(e.target.files[0]);return;}
  });
  document.addEventListener('submit', e=>{
    e.preventDefault();
    if(e.target.id==='home-search-form'){state.recipeFilter={category:'all',subcategory:'all',query:new FormData(e.target).get('q')||'',page:1,favoriteOnly:false};renderBrowseRecipes();return;}
    if(e.target.id==='recipe-search-form'){state.recipeFilter.query=new FormData(e.target).get('q')||'';state.recipeFilter.page=1;renderBrowseRecipes();return;}
    if(e.target.id==='pantry-search-form'){state.pantryQuery=new FormData(e.target).get('q')||'';renderPantry();return;}
    if(e.target.id==='library-search-form'){state.libraryQuery=new FormData(e.target).get('q')||'';renderLibrary();return;}
    if(e.target.id==='consult-step1'){const cat=document.getElementById('consult-category').value,sub=document.getElementById('consult-subcategory').value;if(!cat||!sub){toast('Seleccioná el sistema y el malestar.');return;}state.consult.category=cat;state.consult.subcategory=sub;state.consult.step=2;render();return;}
    if(e.target.id==='consult-step2'){const fd=new FormData(e.target);state.consult.person=fd.get('person')||'adult';state.consult.pregnancy=fd.has('pregnancy');state.consult.medication=fd.has('medication');state.consult.chronic=fd.has('chronic');state.consult.severe=fd.has('severe');state.consult.step=3;render();return;}
  });
  document.getElementById('settings-button').addEventListener('click',openSettings);
  document.getElementById('finish-onboarding').addEventListener('click',()=>{localStorage.setItem(KEYS.onboarded,'1');document.getElementById('onboarding').hidden=true;document.body.style.overflow='';render();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&modalRoot.innerHTML)closeModal();});

  function init(){
    if(!previewMode && localStorage.getItem(KEYS.onboarded)!=='1'){document.getElementById('onboarding').hidden=false;document.body.style.overflow='hidden';}
    render();
    if('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('./service-worker.js').catch(err=>console.warn('Service worker',err));
  }
  init();
})();
