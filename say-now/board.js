import {photoBounds,createWorldLayout} from './spacing.mjs?v=20';
import {createRelationships} from './relationships.mjs?v=20';

(async () => {
  const root=document.getElementById('say-now-world');
  const loading=root.querySelector('.fw-loading');
  try {
  const response=await fetch(new URL('collection.json',import.meta.url),{cache:'no-cache'});
  if(!response.ok)throw new Error('Collection request failed: '+response.status);
  const collection=await response.json();
  if(!Array.isArray(collection.items)||!collection.items.length||!Array.isArray(collection.categories)||!collection.groups)throw new Error('Invalid mood board collection');
  const images=Object.fromEntries(collection.items.map(ref=>[ref.id,ref.thumbnail||ref.src]));
  const refs=collection.items;
  const relationship=createRelationships(collection);
  const groups=collection.groups;
  const byId=Object.fromEntries(refs.map(r=>[r.id,r]));
  const field=root.querySelector('.fw-field'),pictures=root.querySelector('.fw-pictures'),names=root.querySelector('.fw-names'),viewer=root.querySelector('.fw-viewer'),controls=root.querySelector('.fw-controls'),announcement=root.querySelector('.fw-announcement');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const design={spring:45};
  const limits={min:1,max:12};
  const zoomSpread=.07;
  let width=0,height=0,ready=false,frame=0,lastTime=0,selected=null,returnFocus=null,moved=false,overview=true;
  const camera={x:.5,y:.5,z:1},target={...camera},velocity={x:0,y:0,z:0};
  let motion='idle',zoomAnchor=null,zoomDirection=0,saveTimer=0,gesture=null;
  const coast={x:0,y:0},dragSpeed={x:0,y:0};
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const smooth=v=>{const t=clamp(v,0,1);return t*t*(3-2*t);};
  const groupMembers=new Map(Object.keys(groups).map(id=>[id,refs.filter(ref=>ref.group===id)]));
  const items=refs.map((ref,index)=>{
    const button=document.createElement('button');button.type='button';button.className='fw-picture cursor-interaction';button.setAttribute('aria-label',ref.name);button.dataset.image=ref.id;
    const floating=document.createElement('span');floating.className='fw-float';
    const halo=document.createElement('span');halo.className='fw-halo';halo.setAttribute('aria-hidden','true');
    const img=document.createElement('img');img.alt='';img.draggable=false;img.decoding='async';img.className='fw-photo';floating.append(halo,img);button.append(floating);pictures.append(button);
    button.addEventListener('click',()=>{if(!moved)openImage(ref,button);});
    return {ref,index,button,floating,image:img,loaded:false,fullSize:false,x:0,y:0,w:0,h:0,reveal:0};
  });
  const topics=Object.fromEntries(collection.categories.map(category=>[category.id,category]));
  const coverCategories=new Map(collection.categories.filter(category=>!(category.parents||[]).length&&category.coverRef).map(category=>[category.coverRef,category]));
  let worldPoints=new Map(),worldLabels=new Map();
  const panLimits={x:[-.1,1.1],y:[-.1,1.1]};
  // Parentage describes containment; crossovers connect only the shared references.
  function categoryMembers(category,seen=new Set()){
    if(seen.has(category.id))return new Set();seen.add(category.id);
    const ids=new Set(refs.filter(ref=>(category.refs||[]).includes(ref.id)||(category.groups||[]).includes(ref.group)||(category.themes||[]).some(theme=>ref.themes.includes(theme))).map(ref=>ref.id));
    for(const child of collection.categories.filter(c=>(c.parents||[]).includes(category.id)))for(const id of categoryMembers(child,seen))ids.add(id);
    return ids;
  }
  const topicMembers=new Map(collection.categories.map(category=>[category.id,categoryMembers(category)]));
  const labels=collection.categories.filter(category=>topicMembers.get(category.id).size).map(category=>{
    const button=document.createElement('button');button.type='button';button.className='fw-name cursor-interaction';button.textContent=category.name;button.dataset.category=category.id;button.dataset.depth=categoryDepth(category);
    const parentNames=(category.parents||[]).map(id=>topics[id].name),crossovers=(category.crossovers||[]).map(id=>topics[id].name);
    button.setAttribute('aria-label','Explore '+category.name+(parentNames.length?' within '+parentNames.join(' and '):'')+(crossovers.length?'; also connected to '+crossovers.join(' and '):''));names.append(button);
    button.addEventListener('click',()=>{if(!moved){overview=false;selected=null;moveTo({...categoryFocus(category),z:Math.max(camera.z,category.focusZoom)});root.querySelector('[data-action=in]').focus({preventScroll:true});announcement.textContent=category.name+'. More specific categories and pictures revealed.';}});return {category,button};
  });
  function categoryDepth(category){return (category.parents||[]).length?1+Math.max(...category.parents.map(id=>categoryDepth(topics[id]))):0;}
  function categoryOpacity(category,z){
    // Zoom adds layers. A revealed title only fades when returning to a shallower depth.
    const [start,end]=category.reveal;return end>start?smooth((z-start)/(end-start)):1;
  }
  function categoryFocus(category){
    const anchor=category.labelAnchor;
    const ref=byId[category.coverRef||(width<450?(anchor?.mobileRef||anchor?.ref):anchor?.ref)];
    if(ref)return point(ref);
    const members=refs.filter(ref=>topicMembers.get(category.id).has(ref.id)).map(point);
    return members.length?{x:members.reduce((sum,p)=>sum+p.x,0)/members.length,y:members.reduce((sum,p)=>sum+p.y,0)/members.length}:{x:.5,y:.5};
  }
  function labelPosition(category){
    const label=worldLabels.get(category.id),p=worldPoints.get(label.refId),e=extent(),s=spread(camera.z);
    return {x:(p.x-camera.x)*e.x*s+width/2+label.x-label.w/2,y:(p.y-camera.y)*e.y*s+(height-60)/2+label.y-label.h/2,w:label.w,h:label.h};
  }
  function groupCenter(id){const group=groups[id];return width<450?group.mobileCenter:group.center;}
  function slotFor(ref){const group=groups[ref.group],slot=ref.slot??groupMembers.get(ref.group).indexOf(ref);if(group.slots[slot])return group.slots[slot];const angle=slot*2.399963229728653,radius=53*Math.sqrt(slot);return [Math.cos(angle)*radius,Math.sin(angle)*radius];}
  function seedPoint(ref){const center=groupCenter(ref.group),offset=slotFor(ref),e=extent(),scale=width<450?.76:1,compact=.8;return {x:.5+(center[0]-.5+offset[0]*scale/e.x)*compact,y:.5+(center[1]-.5+offset[1]*scale/e.y)*compact};}
  function point(ref){return worldPoints.get(ref.id)||seedPoint(ref);}
  function relatedFor(ref){const ranked=refs.filter(other=>other.id!==ref.id).map(other=>({id:other.id,score:(ref.related||[]).includes(other.id)?100-ref.related.indexOf(other.id):(other.group===ref.group?4:0)+(ref.themes||[]).filter(theme=>(other.themes||[]).includes(theme)).length}));return ranked.filter(r=>r.score>0).sort((a,b)=>b.score-a.score).slice(0,4).map(r=>r.id);}
  function spread(z){return 1+zoomSpread*Math.log(z);}
  function extent(){return {x:Math.max(200,width-(width<450?34:90)),y:Math.max(180,height-125)};}
  function imageOpacity(ref,z){
    // One cover per main category; supporting pictures emerge at closer depths.
    if(coverCategories.has(ref.id))return 1;
    if(ref.revealCategory)return categoryOpacity(topics[ref.revealCategory],z);
    return ref.tier===1?smooth((z-1.08)/.85):smooth((z-1.8)/1.05);
  }
  function photoDimensions(ref){
    const mobile=width<450;
    const longEdge=coverCategories.has(ref.id)?(mobile?158:220):clamp((ref.size||58)*(mobile?1.65:2.25),mobile?96:130,mobile?140:182);
    return {w:longEdge*ref.w/Math.max(ref.w,ref.h),h:longEdge*ref.h/Math.max(ref.w,ref.h)};
  }
  function buildLayout(){
    const e=extent(),mobile=width<450;
    const photos=items.map(item=>{
      Object.assign(item,photoDimensions(item.ref));
      const p=seedPoint(item.ref);
      return {ref:item.ref,index:item.index,isCover:coverCategories.has(item.ref.id),x:p.x*e.x,y:p.y*e.y,bounds:photoBounds(Math.max(44,item.w),Math.max(44,item.h),item.ref.angle*.55)};
    });
    const titles=labels.map(({category,button})=>{
      const hidden=button.hidden;button.hidden=false;
      const w=button.offsetWidth,h=button.offsetHeight;button.hidden=hidden;
      const anchor=category.labelAnchor||{ref:category.coverRef||[...topicMembers.get(category.id)][0],offset:[0,-72]};
      return {id:category.id,refId:mobile?(anchor.mobileRef||anchor.ref):anchor.ref,offset:mobile?(anchor.mobileOffset||anchor.offset):anchor.offset,w,h,depth:categoryDepth(category)};
    });
    const viewport={left:(e.x-width)/2+16,right:(e.x+width)/2-16,top:(e.y-height+60)/2+16,bottom:(e.y+height-60)/2-16};
    const layout=createWorldLayout(photos,titles,{relationship,labelGap:8,labelStackGap:5,viewport});
    worldPoints=new Map(layout.photos.map(photo=>[photo.ref.id,{x:photo.x/e.x,y:photo.y/e.y}]));
    worldLabels=layout.labels;
    for(const axis of ['x','y']){
      const coordinates=[...worldPoints.values()].map(point=>point[axis]);
      panLimits[axis]=[Math.min(-.1,...coordinates)-.1,Math.max(1.1,...coordinates)+.1];
      camera[axis]=clamp(camera[axis],...panLimits[axis]);target[axis]=clamp(target[axis],...panLimits[axis]);
    }
  }
  function draw(){
    const e=extent(),s=spread(camera.z);
    drawLabels();
    // One smooth camera transform; revealing or hiding an image never moves its neighbors.
    for(const item of items){
      const p=point(item.ref),{button,w,h}=item;
      item.x=(p.x-camera.x)*e.x*s+width/2;
      item.y=(p.y-camera.y)*e.y*s+(height-60)/2;
      item.reveal=imageOpacity(item.ref,camera.z);
      button.hidden=item.reveal<.002||item.x+w/2<0||item.y+h/2<0||item.x-w/2>width||item.y-h/2>height;
      if(button.hidden)continue;
      const needsFullSize=!!item.ref.src&&Math.max(w,h)*(window.devicePixelRatio||1)>380;
      if(!item.loaded||(!item.fullSize&&needsFullSize)){
        item.fullSize=needsFullSize;item.image.src=needsFullSize?item.ref.src:images[item.ref.id];item.loaded=true;
      }
      button.style.width=Math.max(44,w)+'px';button.style.height=Math.max(44,h)+'px';
      const photo=item.floating;photo.style.width=w+'px';photo.style.height=h+'px';photo.style.margin='auto';
      button.style.transform=`translate3d(${item.x-Math.max(44,w)/2}px,${item.y-Math.max(44,h)/2}px,0) rotate(${item.ref.angle*.55}deg)`;button.style.opacity=item.reveal;
    }
    field.style.backgroundPosition=`${-camera.x*18}px ${-camera.y*18}px`;
    root.querySelector('[data-action=out]').disabled=target.z<=1.001;root.querySelector('[data-action=in]').disabled=target.z>=limits.max-.001;
  }
  function drawLabels(){
    for(const {category,button} of labels){
      const levelOpacity=categoryOpacity(category,camera.z);button.hidden=levelOpacity<.002;if(button.hidden)continue;
      const box=labelPosition(category);
      const edgeOpacity=smooth(Math.min(box.x,width-box.x-box.w,box.y,height-box.y-box.h)/8),opacity=levelOpacity*edgeOpacity;
      button.hidden=opacity<.002;button.style.opacity=opacity;if(button.hidden)continue;
      button.style.transform=`translate3d(${box.x}px,${box.y}px,0)`;
    }
  }
  // Exact critically damped camera motion: smooth at any frame rate, without overshoot.
  function damp(value,destination,speed,rate,dt){const delta=value-destination,j=speed+rate*delta,decay=Math.exp(-rate*dt);return {value:destination+(delta+j*dt)*decay,speed:(speed-rate*j*dt)*decay};}
  function centerAt(anchor,z){const e=extent(),s=spread(z);return {x:anchor.x-(anchor.px-width/2)/(e.x*s),y:anchor.y-(anchor.py-(height-60)/2)/(e.y*s)};}
  function worldAt(px,py){const e=extent(),s=spread(camera.z);return {x:camera.x+(px-width/2)/(e.x*s),y:camera.y+(py-(height-60)/2)/(e.y*s),px,py};}
  function stopMotion(){motion='idle';zoomAnchor=null;zoomDirection=0;Object.assign(target,camera);velocity.x=velocity.y=velocity.z=0;coast.x=coast.y=0;}
  function step(now){
    frame=0;if(!ready)return;const dt=lastTime?Math.min((now-lastTime)/1000,.032):1/60;lastTime=now;
    const snap=reduced.matches;let moving=false;
    if(snap){Object.assign(camera,target);velocity.x=velocity.y=velocity.z=0;coast.x=coast.y=0;}
    else if(motion==='coast'){
      const e=extent(),s=spread(camera.z),decay=Math.exp(-14*dt),distance=(1-decay)/14;
      camera.x=clamp(camera.x-coast.x*distance/(e.x*s),...panLimits.x);camera.y=clamp(camera.y-coast.y*distance/(e.y*s),...panLimits.y);Object.assign(target,camera);coast.x*=decay;coast.y*=decay;
      if(Math.hypot(coast.x,coast.y)>10)moving=true;else{motion='idle';coast.x=coast.y=0;scheduleSave();}
    }else if(motion!=='drag'){
      const rate=motion==='wheel'?56:motion==='button'?44:36;
      const z=damp(Math.log(camera.z),Math.log(target.z),velocity.z,rate,dt);camera.z=clamp(Math.exp(z.value),1,limits.max);velocity.z=z.speed;
      if(zoomAnchor){Object.assign(camera,centerAt(zoomAnchor,camera.z));Object.assign(target,centerAt(zoomAnchor,target.z));}
      else for(const axis of ['x','y']){const next=damp(camera[axis],target[axis],velocity[axis],rate,dt);camera[axis]=next.value;velocity[axis]=next.speed;}
      if(Math.abs(Math.log(camera.z/target.z))+Math.abs(camera.x-target.x)+Math.abs(camera.y-target.y)+Math.abs(velocity.z)+Math.abs(velocity.x)+Math.abs(velocity.y)>.00012)moving=true;
      else{Object.assign(camera,target);velocity.x=velocity.y=velocity.z=0;motion='idle';zoomAnchor=null;}
    }
    draw();if(moving&&!snap)frame=requestAnimationFrame(step);else lastTime=0;
  }
  function requestFrame(){if(!ready||frame)return;frame=requestAnimationFrame(step);}
  function persist(){try{localStorage.setItem('say-now-world-v1',JSON.stringify({version:'portfolio-v1',camera:{...target},overview,design:{...design}}));}catch{}}
  function scheduleSave(){clearTimeout(saveTimer);saveTimer=setTimeout(persist,400);}
  function moveTo(next){stopMotion();motion='fly';Object.assign(target,next);target.x=clamp(target.x,...panLimits.x);target.y=clamp(target.y,...panLimits.y);target.z=clamp(target.z,1,limits.max);requestFrame();scheduleSave();}
  function enter(ref){const category=camera.z<2.1?coverCategories.get(ref.id):null;overview=false;selected=category?null:ref;moveTo(category?{...categoryFocus(category),z:category.focusZoom}:{...point(ref),z:3.3});announcement.textContent=(category?category.name:ref.name)+'. More pictures and categories revealed.';}
  function setViewer(open){viewer.hidden=!open;field.classList.toggle('fw-detail-open',open);pictures.inert=open;names.inert=open;controls.inert=open;if(!open)resizeWorld();}
  function closeViewer(){if(viewer.hidden)return;setViewer(false);selected=null;returnFocus?.focus({preventScroll:true});persist();}
  function openImage(ref,button){
    stopMotion();selected=ref;returnFocus=button;const hero=viewer.querySelector('.fw-hero');hero.src=ref.src||images[ref.id];hero.alt=ref.description||ref.name;
    viewer.querySelector('.fw-caption').textContent=ref.name;
    // Only the user's original words belong in the note; never fill gaps with a summary.
    const note=ref.noteAuthor==='user'&&typeof ref.note==='string'?ref.note:'';
    viewer.querySelector('.fw-note-block').hidden=false;
    const noteLabel=viewer.querySelector('.fw-note-label');noteLabel.textContent='Note';noteLabel.hidden=!note.trim();
    viewer.querySelector('.fw-note').textContent=note.trim()?note:'No note';
    const sourceLink=viewer.querySelector('.fw-source');sourceLink.hidden=!ref.source?.url;if(ref.source?.url)sourceLink.href=ref.source.url;else sourceLink.removeAttribute('href');
    const related=viewer.querySelector('.fw-related');related.replaceChildren();
    for(const id of relatedFor(ref)){const r=byId[id],b=document.createElement('button');b.type='button';b.className='cursor-interaction';b.setAttribute('aria-label','Read notes for '+r.name);const img=document.createElement('img');img.src=images[id];img.alt='';b.append(img);b.addEventListener('click',()=>openImage(r,returnFocus));related.append(b);}
    setViewer(true);viewer.querySelector('.fw-back').focus();announcement.textContent=ref.name+(note.trim()?'. Note shown with the photo.':'. No note.');persist();
  }
  root.querySelector('.fw-back').addEventListener('click',closeViewer);
  root.querySelector('.fw-home').addEventListener('click',()=>{overview=true;selected=null;setViewer(false);moveTo({x:.5,y:.5,z:1});announcement.textContent='The whole world';});
  function zoom(factor,px=width/2,py=(height-60)/2,kind='button'){
    const direction=Math.sign(Math.log(factor));if(!direction)return;
    if(motion!==kind||(zoomDirection&&direction!==zoomDirection)){Object.assign(target,camera);velocity.z=0;}
    velocity.x=velocity.y=0;coast.x=coast.y=0;motion=kind;zoomDirection=direction;zoomAnchor=worldAt(px,py);overview=false;
    const pending=Math.log(target.z)+Math.log(factor),visible=Math.log(camera.z);
    target.z=clamp(Math.exp(kind==='wheel'?clamp(pending,visible-.42,visible+.42):pending),1,limits.max);Object.assign(target,centerAt(zoomAnchor,target.z));requestFrame();scheduleSave();
  }
  root.querySelector('[data-action=in]').addEventListener('click',()=>zoom(1.4));root.querySelector('[data-action=out]').addEventListener('click',()=>zoom(1/1.4));
  field.addEventListener('wheel',event=>{
    if(!viewer.hidden||gesture)return;event.preventDefault();const r=field.getBoundingClientRect(),unit=event.deltaMode===1?16:event.deltaMode===2?height:1;
    if(!event.ctrlKey&&Math.abs(event.deltaX)>Math.abs(event.deltaY)*1.5){stopMotion();const e=extent();camera.x=clamp(camera.x+event.deltaX*unit/(e.x*spread(camera.z)),...panLimits.x);Object.assign(target,camera);overview=false;requestFrame();scheduleSave();return;}
    const amount=clamp(-event.deltaY*unit*(event.ctrlKey?.012:.004),-.32,.32);zoom(Math.exp(amount),event.clientX-r.left,event.clientY-r.top,'wheel');
  },{passive:false});
  root.addEventListener('keydown',event=>{if(event.key==='Escape'){closeViewer();return;}if(!viewer.hidden)return;const direction={ArrowLeft:[-.13,0],ArrowRight:[.13,0],ArrowUp:[0,-.13],ArrowDown:[0,.13]}[event.key];if(direction){event.preventDefault();overview=false;moveTo({x:target.x+direction[0],y:target.y+direction[1]});}});
  const pointers=new Map();let pinch=null;
  function pinchFromPoints(){const p=[...pointers.values()],r=field.getBoundingClientRect(),px=(p[0].x+p[1].x)/2-r.left,py=(p[0].y+p[1].y)/2-r.top;return {distance:Math.max(1,Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y)),spread:spread(camera.z),anchor:worldAt(px,py)};}
  function applyPinch(start,ratio,px,py){const z=clamp(Math.exp((start.spread*ratio-1)/zoomSpread),1,limits.max);Object.assign(camera,centerAt({...start.anchor,px,py},z),{z});Object.assign(target,camera);motion='drag';overview=false;requestFrame();}
  field.addEventListener('pointerdown',event=>{if(event.target.closest('.fw-controls,.fw-viewer')||event.button!==0)return;stopMotion();motion='drag';if(!pointers.size){moved=false;dragSpeed.x=dragSpeed.y=0;}pointers.set(event.pointerId,{x:event.clientX,y:event.clientY,ox:event.clientX,oy:event.clientY,time:event.timeStamp});if(!event.target.closest('button'))field.setPointerCapture(event.pointerId);if(pointers.size===2){moved=true;dragSpeed.x=dragSpeed.y=0;pinch=pinchFromPoints();}});
  field.addEventListener('pointermove',event=>{
    const rect=field.getBoundingClientRect();
    const p=pointers.get(event.pointerId);if(!p)return;const dx=event.clientX-p.x,dy=event.clientY-p.y,elapsed=Math.max(8,event.timeStamp-p.time);if(Math.hypot(event.clientX-p.ox,event.clientY-p.oy)>3){moved=true;field.setPointerCapture(event.pointerId);field.classList.add('fw-dragging');}p.x=event.clientX;p.y=event.clientY;p.time=event.timeStamp;if(!moved)return;overview=false;
    if(pointers.size===2&&pinch){const ps=[...pointers.values()],d=Math.hypot(ps[0].x-ps[1].x,ps[0].y-ps[1].y);applyPinch(pinch,d/pinch.distance,(ps[0].x+ps[1].x)/2-rect.left,(ps[0].y+ps[1].y)/2-rect.top);}else{const e=extent(),s=spread(camera.z);camera.x=clamp(camera.x-dx/(e.x*s),...panLimits.x);camera.y=clamp(camera.y-dy/(e.y*s),...panLimits.y);Object.assign(target,camera);dragSpeed.x=clamp(dragSpeed.x*.35+dx/elapsed*650,-1000,1000);dragSpeed.y=clamp(dragSpeed.y*.35+dy/elapsed*650,-1000,1000);requestFrame();}
  });
  function finish(event){const p=pointers.get(event.pointerId);if(!p)return;const wasPinch=!!pinch;pointers.delete(event.pointerId);if(pointers.size<2)pinch=null;if(!pointers.size){field.classList.remove('fw-dragging');const canCoast=moved&&!wasPinch&&!reduced.matches&&event.type==='pointerup'&&event.timeStamp-p.time<70;if(canCoast){coast.x=dragSpeed.x;coast.y=dragSpeed.y;motion='coast';}else motion='idle';requestFrame();scheduleSave();}else{dragSpeed.x=dragSpeed.y=0;for(const remaining of pointers.values()){remaining.ox=remaining.x;remaining.oy=remaining.y;remaining.time=event.timeStamp;}}if(field.hasPointerCapture(event.pointerId))field.releasePointerCapture(event.pointerId);}
  field.addEventListener('pointerup',finish);field.addEventListener('pointercancel',finish);field.addEventListener('lostpointercapture',event=>{if(event.target===field)finish(event);});
  field.addEventListener('click',event=>{if(moved&&!event.target.closest('.fw-controls,.fw-viewer')){event.preventDefault();event.stopPropagation();moved=false;}},true);
  // Safari trackpads report native gesture events rather than Control-wheel events.
  field.addEventListener('gesturestart',event=>{if(!viewer.hidden||pointers.size>1)return;event.preventDefault();stopMotion();const r=field.getBoundingClientRect(),px=Number.isFinite(event.clientX)?event.clientX-r.left:width/2,py=Number.isFinite(event.clientY)?event.clientY-r.top:(height-60)/2;gesture={spread:spread(camera.z),anchor:worldAt(px,py)};motion='drag';},{passive:false});
  field.addEventListener('gesturechange',event=>{if(!gesture)return;event.preventDefault();if(!(event.scale>0))return;const r=field.getBoundingClientRect();applyPinch(gesture,event.scale,Number.isFinite(event.clientX)?event.clientX-r.left:gesture.anchor.px,Number.isFinite(event.clientY)?event.clientY-r.top:gesture.anchor.py);},{passive:false});
  field.addEventListener('gestureend',event=>{if(!gesture)return;event.preventDefault();gesture=null;motion='idle';scheduleSave();},{passive:false});
  function applyDesign(){root.style.setProperty('--fw-glow',0);requestFrame();}
  function restore(state){if(state?.version!=='portfolio-v1')return;stopMotion();if(state.camera&&['x','y','z'].every(key=>Number.isFinite(state.camera[key]))){Object.assign(target,{x:state.camera.x,y:state.camera.y,z:clamp(state.camera.z,1,limits.max)});Object.assign(camera,target);overview=!!state.overview;}if(state.design){design.spring=Number.isFinite(state.design.spring)?clamp(state.design.spring,0,100):45;}applyDesign();}
  try{restore(JSON.parse(localStorage.getItem('say-now-world-v1')));}catch{}
  function resizeWorld(){if(!viewer.hidden)return;const nextWidth=field.clientWidth,nextHeight=field.clientHeight;if(!nextWidth||!nextHeight)return;if(!ready||width!==nextWidth||height!==nextHeight){width=nextWidth;height=nextHeight;buildLayout();}ready=true;draw();}
  new ResizeObserver(resizeWorld).observe(field);
  reduced.addEventListener('change',requestFrame);
  document.fonts?.addEventListener('loadingdone',requestFrame);
  document.fonts?.ready.then(requestFrame);
  await document.fonts?.ready;
  field.hidden=false;
  loading.hidden=true;
  resizeWorld();
  } catch(error) {
    console.error('Unable to load the Say Now mood board.',error);
    loading.hidden=true;
    root.querySelector('.fw-field').hidden=true;
    root.querySelector('.fw-error').hidden=false;
  }
})();
