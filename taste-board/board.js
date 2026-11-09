import {applyDraft,emptyDraft,readDraft} from './drafts.mjs?v=4';
import {mountEditor} from './editor.js?v=3';
import {photoBounds,createWorldLayout} from './spacing.mjs?v=11';
import {createRelationships,categorySpacing} from './relationships.mjs?v=9';
import {isLocalPreview,readCollection} from './collection.mjs?v=5';
import {worldScale,zoomFromScale,photoScale,photoDimensions,photoHitSize} from './camera.mjs?v=6';
import {createLayers,layerOpacity} from './layers.mjs?v=7';
import {createDiscovery} from './discovery.mjs?v=2';
import {createConnections,projectConnections,connectionCurve} from './connections.mjs?v=2';

(async () => {
  const root=document.getElementById('taste-board-world');
  const loading=root.querySelector('.fw-loading');
  try {
  const collectionUrl=new URL('collection.json',import.meta.url);
  let sourceCollection=await readCollection(collectionUrl),draft=emptyDraft(),draftError=false;
  const local=isLocalPreview(location.hostname);
  if(local)try{draft=await readDraft();}catch{draftError=true;}
  let collection=local?applyDraft(sourceCollection,draft):sourceCollection;
  const layoutRevision=()=>collection.organization?.revision+':anchored-captions-v1';
  let images,refs,relationship,groups,byId,groupMembers,items,itemsById,topics,labels,discovery,layers;
  const field=root.querySelector('.fw-field'),pictures=root.querySelector('.fw-pictures'),names=root.querySelector('.fw-names'),viewer=root.querySelector('.fw-viewer'),controls=root.querySelector('.fw-controls'),announcement=root.querySelector('.fw-announcement');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)'),coarsePointer=matchMedia('(pointer:coarse)');
  const connectionCanvas=root.querySelector('.fw-connections'),connectionKey=root.querySelector('.fw-connections-key'),connectionToggle=root.querySelector('.fw-connections-toggle input'),connectionContext=root.querySelector('.fw-connections-context');
  const connectionPen=connectionCanvas.getContext('2d');
  let connectionGraph,connectionHover=null,connectionFocus=null,connectionPinned=null,showConnections=false;
  try{showConnections=localStorage.getItem('taste-board-connections-v1')==='true';}catch{}
  connectionToggle.checked=showConnections;
  root.querySelector('#connections-help').textContent=coarsePointer.matches?'Tap a category title to trace its connections.':'Hover or focus a picture or title to trace its connections.';
  const design={spring:45};
  // Keep logarithmic zoom positive all the way down to numeric precision.
  const limits={min:Number.MIN_VALUE,max:24};
  let homeCamera={x:.5,y:.5,z:1};
  let width=0,height=0,ready=false,frame=0,lastTime=0,selected=null,returnFocus=null,moved=false,overview=true;
  let activeBranch=null;
  const camera={x:.5,y:.5,z:1},target={...camera},velocity={x:0,y:0,z:0};
  let motion='idle',zoomAnchor=null,zoomDirection=0,saveTimer=0,gesture=null;
  const coast={x:0,y:0},dragSpeed={x:0,y:0};
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const smooth=v=>{const t=clamp(v,0,1);return t*t*(3-2*t);};
  let worldPoints=new Map(),worldLabels=new Map();
  function mountCollection(next){
  collection=next;refs=collection.items;groups=collection.groups;root.querySelector('.fw-empty').hidden=!!refs.length||!sourceCollection.items.length;controls.hidden=!sourceCollection.items.length;
  images=Object.fromEntries(refs.map(ref=>[ref.id,ref.thumbnail||ref.src]));
  byId=Object.fromEntries(refs.map(ref=>[ref.id,ref]));relationship=createRelationships(collection);discovery=createDiscovery(collection);connectionGraph=createConnections(collection);layers=createLayers(collection);
  connectionHover=connectionFocus=connectionPinned=null;
  groupMembers=new Map(Object.keys(groups).map(id=>[id,refs.filter(ref=>ref.group===id)]));
  pictures.replaceChildren();names.replaceChildren();
  items=refs.map((ref,index)=>{
    const button=document.createElement('button');button.type='button';button.className='fw-picture cursor-interaction';button.setAttribute('aria-label',ref.name);button.dataset.image=ref.id;
    const floating=document.createElement('span');floating.className='fw-float';
    const halo=document.createElement('span');halo.className='fw-halo';halo.setAttribute('aria-hidden','true');
    const img=document.createElement('img');img.alt='';img.draggable=false;img.decoding='async';img.className='fw-photo';floating.append(halo,img);button.append(floating);pictures.append(button);
    button.addEventListener('click',()=>{if(!moved)openImage(ref,button);});
    bindConnectionFocus(button,{type:'image',id:ref.id});
    return {ref,index,button,floating,image:img,loaded:false,fullSize:false,x:0,y:0,w:0,h:0};
  });
  itemsById=new Map(items.map(item=>[item.ref.id,item]));
  topics=Object.fromEntries(collection.categories.map(category=>[category.id,category]));
  labels=collection.categories.filter(category=>layers.members.get(category.id).size).map(category=>{
    const button=document.createElement('button');button.type='button';button.className='fw-name cursor-interaction';button.textContent=category.name;button.dataset.category=category.id;button.dataset.depth=Math.min(3,categoryDepth(category));
    const parentNames=(category.parents||[]).map(id=>topics[id].name),crossovers=(category.crossovers||[]).map(id=>topics[id].name);
    button.setAttribute('aria-label','Explore '+category.name+(parentNames.length?' via '+parentNames.join(' and '):'')+(crossovers.length?'; also connected to '+crossovers.join(' and '):''));names.append(button);
    bindConnectionFocus(button,{type:'category',id:category.id});
    button.addEventListener('click',()=>{if(!moved){exploreBranch(layers.categories.get(category.id).entry,category.id);if(coarsePointer.matches){connectionPinned={type:'category',id:category.id};requestFrame();}}});return {category,button};
  });
  setBranch(activeBranch?.id,activeBranch?.zoom,activeBranch?.categoryId);
  }
  mountCollection(collection);
  function bindConnectionFocus(button,value){
    button.addEventListener('pointerenter',event=>{if(event.pointerType==='touch')return;connectionHover=value;requestFrame();});
    button.addEventListener('pointerleave',()=>{connectionHover=null;requestFrame();});
    button.addEventListener('focus',()=>{connectionFocus=value;requestFrame();});
    button.addEventListener('blur',()=>{connectionFocus=null;requestFrame();});
  }
  connectionToggle.addEventListener('change',()=>{
    showConnections=connectionToggle.checked;connectionHover=connectionFocus=connectionPinned=null;
    try{localStorage.setItem('taste-board-connections-v1',String(showConnections));}catch{}
    announcement.textContent=showConnections?'Connections shown between different groups. Solid lines connect branches; dotted lines show shared themes.':'Connections hidden.';
    requestFrame();
  });
  function categoryDepth(category){return Math.ceil(layers.categories.get(category.id).level);}
  function categoryOpacity(category,z){
    // Zoom adds layers. A revealed title only fades when returning to a shallower depth.
    return layerOpacity(layers.categories.get(category.id),z/homeCamera.z);
  }
  function labelPosition(category){
    const label=worldLabels.get(category.id),p=worldPoints.get(label.refId),e=extent(),s=spread(camera.z);
    const localScale=photoScale(camera.z,layers.images.get(label.refId));
    const scale=categoryDepth(category)===0?Math.min(1,s/spread(homeCamera.z)):Math.min(1,label.w*localScale/label.renderW);
    const w=label.renderW*scale,h=label.renderH*scale;
    // Align the near edge of the rendered caption to its reserved slot.
    // Centering it in the slot opens a gap once the text stops growing.
    const side=Math.sign(label.y);
    const centerOffset=side*((Math.abs(label.y)-label.h/2)*localScale+h/2);
    return {x:(p.x-camera.x)*e.x*s+width/2+label.x*localScale-w/2,y:(p.y-camera.y)*e.y*s+(height-60)/2+centerOffset-h/2,w,h,scale};
  }
  function groupCenter(id){const group=groups[id];return width<450?group.mobileCenter:group.center;}
  function slotFor(ref){const group=groups[ref.group],slot=ref.slot??groupMembers.get(ref.group).indexOf(ref);if(group.slots[slot])return group.slots[slot];const angle=slot*2.399963229728653,radius=53*Math.sqrt(slot);return [Math.cos(angle)*radius,Math.sin(angle)*radius];}
  function seedPoint(ref){const center=groupCenter(ref.group),offset=slotFor(ref),e=extent(),scale=width<450?.76:1,compact=.8;return {x:.5+(center[0]-.5+offset[0]*scale/e.x)*compact,y:.5+(center[1]-.5+offset[1]*scale/e.y)*compact};}
  function point(ref){return worldPoints.get(ref.id)||seedPoint(ref);}
  function relatedFor(ref){const immediate=new Set([ref.id,discovery.parent(ref.id)?.id,...discovery.children(ref.id).map(child=>child.id)]);return (ref.related||[]).filter(id=>byId[id]&&!immediate.has(id)).slice(0,4);}
  function spread(z){return worldScale(z);}
  function extent(){return {x:Math.max(200,width-(width<450?34:90)),y:Math.max(180,height-125)};}
  function buildLayout(){
    const e=extent(),mobile=width<450;
    const placements=collection.categories.filter(category=>category.layoutBetween).map(category=>({members:layers.members.get(category.id),anchors:category.layoutBetween.map(id=>topics[id].coverRef)}));
    const photos=items.map(item=>{
      const profile=layers.images.get(item.ref.id);
      Object.assign(item,photoDimensions(item.ref,profile.opening,mobile,profile));
      const p=seedPoint(item.ref);
      const isCover=profile.opening;
      const revealZoom=Math.max(1,profile.reveal[0]);
      const touchSize=photoHitSize(coarsePointer.matches)/worldScale(revealZoom);
      return {ref:item.ref,index:item.index,isCover,coverOrder:collection.categories.findIndex(category=>category.coverRef===item.ref.id),placementAnchors:placements.find(placement=>placement.members.has(item.ref.id))?.anchors,x:p.x*e.x,y:p.y*e.y,bounds:photoBounds(Math.max(touchSize,item.w),Math.max(touchSize,item.h),item.ref.angle*.55)};
    });
    const titles=labels.map(({category,button})=>{
      const hidden=button.hidden;button.hidden=false;
      const w=button.offsetWidth,h=button.offsetHeight;button.hidden=hidden;
      const anchor=category.labelAnchor||{ref:layers.categories.get(category.id).entry,offset:[0,-72]};
      const refId=mobile?(anchor.mobileRef||anchor.ref):anchor.ref;
      // Detail titles grow with their images. Reserve a compact world-space
      // caption so a fixed-size title cannot push a whole neighborhood apart.
      const depth=categoryDepth(category);
      const labelWidth=depth?Math.max(115,layers.categories.get(category.id).edge*1.15):w;
      return {id:category.id,refId,offset:mobile?(anchor.mobileOffset||anchor.offset):anchor.offset,w:labelWidth,h:h*labelWidth/w,renderW:w,renderH:h,depth};
    });
    const viewport={left:(e.x-width)/2+12,right:(e.x+width)/2-12,top:(e.y-height+60)/2+16,bottom:(e.y+height-60)/2-16};
    // Account for the opening fit when reserving fixed-size title footprints.
    // Both passes happen before rendering; camera movement never repacks images.
    const options={relationship,overviewCoversOnly:true,labelGap:3,labelStackGap:3,groupGap:mobile?categorySpacing.separate:categorySpacing.overview,viewport};
    let labelFit=mobile?.25:.5,layout;
    for(let pass=0;pass<5;pass++){
      layout=createWorldLayout(photos,titles.map(t=>t.depth?t:{...t,w:t.w/labelFit,h:t.h/labelFit}),options);
      if(layout.overview.scale>=labelFit)break;
      labelFit=layout.overview.scale*.9;
    }
    homeCamera=refs.length?{x:layout.overview.x/e.x,y:layout.overview.y/e.y,z:zoomFromScale(layout.overview.scale)}:{x:.5,y:.5,z:1};
    limits.max=Math.max(48,homeCamera.z*Math.max(1,...[...layers.images.values()].map(p=>p.reveal[1]))*6);
    if(overview){stopMotion();Object.assign(camera,homeCamera);Object.assign(target,homeCamera);}
    else{camera.z=clamp(camera.z,limits.min,limits.max);target.z=clamp(target.z,limits.min,limits.max);}
    worldPoints=new Map(layout.photos.map(photo=>[photo.ref.id,{x:photo.x/e.x,y:photo.y/e.y}]));
    worldLabels=layout.labels;
    for(const title of titles)Object.assign(worldLabels.get(title.id),{renderW:title.renderW,renderH:title.renderH});
  }
  function draw(){
    const e=extent(),s=spread(camera.z);
    // Large independent entrances first, then progressively smaller branches.
    // Once revealed, a picture stays visible until zooming back out.
    for(const item of items){
      const {button}=item;
      const opacity=layerOpacity(layers.images.get(item.ref.id),camera.z/homeCamera.z);
      const p=point(item.ref),scale=photoScale(camera.z,layers.images.get(item.ref.id)),w=item.w*scale,h=item.h*scale;
      // At the overview, invisible oversized hit areas would cover neighbors.
      // Grow each target with its photo until it reaches the normal minimum.
      const hit=photoHitSize(coarsePointer.matches)*Math.min(1,scale);
      item.x=(p.x-camera.x)*e.x*s+width/2;
      item.y=(p.y-camera.y)*e.y*s+(height-60)/2;
      const offscreen=item.x+w/2<0||item.y+h/2<0||item.x-w/2>width||item.y-h/2>height;
      const hidden=offscreen||opacity<.002;
      if(button.hidden!==hidden)button.hidden=hidden;
      if(button.hidden)continue;
      button.style.opacity=opacity;button.style.pointerEvents=opacity>.6?'auto':'none';button.tabIndex=opacity>.6?0:-1;
      const needsFullSize=!!item.ref.src&&Math.max(w,h)*(window.devicePixelRatio||1)>380;
      if(!item.loaded||(!item.fullSize&&needsFullSize)){
        item.fullSize=needsFullSize;item.image.src=needsFullSize?(item.ref.poster||item.ref.src):images[item.ref.id];item.loaded=true;
      }
      button.style.width=Math.max(hit,w)+'px';button.style.height=Math.max(hit,h)+'px';
      const photo=item.floating;photo.style.width=w+'px';photo.style.height=h+'px';photo.style.margin='auto';
      button.style.transform=`translate3d(${item.x-Math.max(hit,w)/2}px,${item.y-Math.max(hit,h)/2}px,0) rotate(${item.ref.angle*.55}deg)`;
    }
    drawLabels();
    drawConnections();
    field.style.backgroundPosition=`${width/2-camera.x*e.x*s}px ${(height-60)/2-camera.y*e.y*s}px`;
    root.querySelector('[data-action=out]').disabled=target.z<=limits.min;root.querySelector('[data-action=in]').disabled=target.z>=limits.max-.001;
  }
  function drawConnections(){
    const enabled=showConnections&&viewer.hidden&&!!refs.length;
    connectionCanvas.hidden=connectionKey.hidden=!enabled;
    const focus=enabled?(connectionHover||connectionFocus||connectionPinned):null;
    const highlighted=new Set();
    if(enabled&&connectionPen){
      const ratio=Math.min(2,window.devicePixelRatio||1);
      if(connectionCanvas.width!==Math.round(width*ratio)||connectionCanvas.height!==Math.round(height*ratio)){
        connectionCanvas.width=Math.round(width*ratio);connectionCanvas.height=Math.round(height*ratio);
      }
      connectionPen.setTransform(ratio,0,0,ratio,0,0);connectionPen.clearRect(0,0,width,height);
      const lines=projectConnections(connectionGraph,id=>layerOpacity(layers.images.get(id),camera.z/homeCamera.z)>.6,focus);
      const e=extent(),s=spread(camera.z),screen=new Map();
      for(const item of items){const p=point(item.ref),scale=photoScale(camera.z,layers.images.get(item.ref.id));screen.set(item.ref.id,{x:(p.x-camera.x)*e.x*s+width/2,y:(p.y-camera.y)*e.y*s+(height-60)/2,w:item.w*scale,h:item.h*scale});}
      // Quiet lines first; the focused relationships remain readable on top.
      lines.sort((a,b)=>Number(a.active)-Number(b.active));
      const overlapNames=new Set();
      for(const line of lines){
        const a=screen.get(line.a),b=screen.get(line.b);if(!a||!b)continue;
        if(line.active){highlighted.add(line.a);highlighted.add(line.b);if(line.kind==='overlap')for(const reason of line.reasons)overlapNames.add(reason);}
        if(Math.max(a.x,b.x)<-40||Math.min(a.x,b.x)>width+40||Math.max(a.y,b.y)<-40||Math.min(a.y,b.y)>height+40)continue;
        const curve=connectionCurve(a,b);if(!curve)continue;
        connectionPen.globalAlpha=focus?(line.active?.8:.055):(line.kind==='overlap'?.34:.19);
        connectionPen.strokeStyle='#706779';connectionPen.lineWidth=line.active?1.4:1;
        connectionPen.lineCap='round';connectionPen.setLineDash(line.kind==='overlap'?[2,5]:[]);
        connectionPen.beginPath();connectionPen.moveTo(curve.x1,curve.y1);connectionPen.quadraticCurveTo(curve.cx,curve.cy,curve.x2,curve.y2);connectionPen.stroke();
      }
      const name=focus?.type==='image'?byId[focus.id]?.name:topics[focus?.id]?.name;
      const shared=[...overlapNames];
      const text=name?name+(shared.length?' · overlaps: '+shared.slice(0,4).join(', ')+(shared.length>4?' + '+(shared.length-4)+' more':''):lines.some(line=>line.active)?' · discovery path':' · no visible connections at this depth'):'';
      if(connectionContext.textContent!==text)connectionContext.textContent=text;
    }
    for(const item of items)item.button.classList.toggle('fw-connection-target',!!focus&&highlighted.has(item.ref.id));
    for(const label of labels)label.button.classList.toggle('fw-connection-target',focus?.type==='category'&&focus.id===label.category.id);
  }
  function drawLabels(){
    for(const {category,button} of labels){
      const anchor=itemsById.get(worldLabels.get(category.id).refId);
      const levelOpacity=categoryOpacity(category,camera.z);
      button.hidden=!anchor||anchor.button.hidden||levelOpacity<.002;if(button.hidden)continue;
      const box=labelPosition(category);
      const edgeOpacity=smooth(Math.min(box.x,width-box.x-box.w,box.y,height-box.y-box.h)/8),opacity=levelOpacity*edgeOpacity;
      button.hidden=opacity<.002;button.style.opacity=opacity;if(button.hidden)continue;
      button.style.transformOrigin='0 0';button.style.transform=`translate3d(${box.x}px,${box.y}px,0) scale(${box.scale})`;
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
      camera.x-=coast.x*distance/(e.x*s);camera.y-=coast.y*distance/(e.y*s);Object.assign(target,camera);coast.x*=decay;coast.y*=decay;
      if(Math.hypot(coast.x,coast.y)>10)moving=true;else{motion='idle';coast.x=coast.y=0;scheduleSave();}
    }else if(motion!=='drag'){
      const rate=motion==='wheel'?56:motion==='button'?44:36;
      const z=damp(Math.log(camera.z),Math.log(target.z),velocity.z,rate,dt);camera.z=clamp(Math.exp(z.value),limits.min,limits.max);velocity.z=z.speed;
      if(zoomAnchor){Object.assign(camera,centerAt(zoomAnchor,camera.z));Object.assign(target,centerAt(zoomAnchor,target.z));}
      else for(const axis of ['x','y']){const next=damp(camera[axis],target[axis],velocity[axis],rate,dt);camera[axis]=next.value;velocity[axis]=next.speed;}
      if(Math.abs(Math.log(camera.z/target.z))+Math.abs(camera.x-target.x)+Math.abs(camera.y-target.y)+Math.abs(velocity.z)+Math.abs(velocity.x)+Math.abs(velocity.y)>.00012)moving=true;
      else{Object.assign(camera,target);velocity.x=velocity.y=velocity.z=0;motion='idle';zoomAnchor=null;}
    }
    draw();if(moving&&!snap)frame=requestAnimationFrame(step);else lastTime=0;
  }
  function requestFrame(){if(!ready||frame)return;frame=requestAnimationFrame(step);}
  function persist(){try{localStorage.setItem('taste-board-world-v3',JSON.stringify({version:'taste-board-v1',layoutRevision:layoutRevision(),camera:{...target},overview,branch:activeBranch,design:{...design}}));}catch{}}
  window.addEventListener('pagehide',persist);
  function scheduleSave(){clearTimeout(saveTimer);saveTimer=setTimeout(persist,400);}
  function moveTo(next){stopMotion();motion='fly';Object.assign(target,next);target.z=clamp(target.z,limits.min,limits.max);requestFrame();scheduleSave();}
  function fillTrail(nav,id,inViewer=false,categoryId){
    nav.replaceChildren();
    const home=document.createElement('button');home.type='button';home.textContent='taste board';home.addEventListener('click',resetWorld);nav.append(home);
    const category=layers.categories.get(categoryId);
    const path=category?category.path.map(id=>({ref:byId[layers.categories.get(id).entry],name:topics[id].name,categoryId:id})):
      discovery.trail(id).map(ref=>({ref,name:discovery.label(ref.id)}));
    for(const [index,step] of path.entries()){
      const divider=document.createElement('span');divider.textContent='›';divider.setAttribute('aria-hidden','true');nav.append(divider);
      const {ref,name,categoryId}=step;
      const end=index===path.length-1,part=document.createElement(end?'span':'button');part.textContent=name;
      if(end)part.setAttribute('aria-current','page');
      else{part.type='button';part.setAttribute('aria-label',(inViewer?'Read notes for ':'Explore branch: ')+(inViewer?ref.name:name));part.addEventListener('click',()=>inViewer?openImage(ref,returnFocus):exploreBranch(ref.id,categoryId));}
      nav.append(part);
    }
  }
  function setBranch(id,zoom=2,categoryId){
    const nav=root.querySelector('.fw-trail');activeBranch=byId[id]?{id,zoom,categoryId}:null;nav.hidden=!activeBranch;
    if(!activeBranch){nav.replaceChildren();return;}
    fillTrail(nav,id,false,categoryId);
  }
  function exploreBranch(id,categoryId){
    const ref=byId[id];if(!ref)return;
    setViewer(false);selected=null;overview=false;
    categoryId ||= collection.categories.find(c=>(c.coverRef||c.labelAnchor?.ref)===id)?.id||ref.revealCategory;
    const members=categoryId?refs.filter(r=>r.id!==id&&layers.categories.get(r.revealCategory)?.path.includes(categoryId)):discovery.children(id);
    const entry=layers.categories.get(categoryId)||layers.images.get(id);
    const later=members.map(r=>layers.images.get(r.id).reveal[1]).filter(end=>end>entry.reveal[1]);
    const revealZoom=Math.max(2.4,later.length?Math.min(...later):entry.reveal[1]*1.3);
    // Enter the next layer near its supporting images, rather than centering an
    // increasingly enormous parent cover or jumping over intermediate layers.
    const next=members.filter(r=>layers.images.get(r.id).reveal[1]<=revealZoom+.001);
    const focused=next.length?next:[ref];
    const e=extent(),boxes=focused.map(r=>{const p=point(r),item=items.find(i=>i.ref.id===r.id);return {x:p.x*e.x,y:p.y*e.y,w:item.w,h:item.h};});
    const left=Math.min(...boxes.map(p=>p.x-p.w/2)),right=Math.max(...boxes.map(p=>p.x+p.w/2)),top=Math.min(...boxes.map(p=>p.y-p.h/2)),bottom=Math.max(...boxes.map(p=>p.y+p.h/2));
    const fit=zoomFromScale(Math.min(Math.max(180,width-120)/(right-left+40),Math.max(160,height-150)/(bottom-top+40)));
    const z=clamp(Math.max(homeCamera.z*revealZoom,Math.min(fit,homeCamera.z*revealZoom*1.5)),limits.min,limits.max);
    setBranch(id,z,categoryId);moveTo({x:(left+right)/2/e.x,y:(top+bottom)/2/e.y,z});
    root.querySelector('[data-action=in]').focus({preventScroll:true});
    announcement.textContent=(topics[categoryId]?.name||discovery.label(id))+'. Zoom further to uncover more references.';
  }
  function resetWorld(){overview=true;selected=null;connectionHover=connectionFocus=connectionPinned=null;setBranch(null);setViewer(false);moveTo(homeCamera);announcement.textContent='Your top-level themes. Zoom in to uncover smaller groups.';}
  function setViewer(open){viewer.hidden=!open;field.classList.toggle('fw-detail-open',open);pictures.inert=open;names.inert=open;controls.inert=open;connectionToggle.disabled=open;if(!open)resizeWorld();else{connectionCanvas.hidden=true;connectionKey.hidden=true;}}
  function closeViewer(){if(viewer.hidden)return;setViewer(false);selected=null;returnFocus?.focus({preventScroll:true});persist();}
  function mountLocalTools(){
    if(!local)return;
    const editor=mountEditor({root,getBase:()=>sourceCollection,getDraft:()=>draft,getCollection:()=>collection,getSelected:()=>selected,
      apply(next){stopMotion();draft=next;mountCollection(applyDraft(sourceCollection,draft));buildLayout();draw();persist();},
      async reorganize(){
        const next=await readCollection(collectionUrl),changed=JSON.stringify(next)!==JSON.stringify(sourceCollection);
        if(changed){if(next.organization?.revision!==sourceCollection.organization?.revision){overview=true;setBranch(null);}sourceCollection=next;stopMotion();mountCollection(applyDraft(sourceCollection,draft));buildLayout();draw();persist();}
        return collection.items.length+' images checked. '+(changed?'Collection updated.':'Already organized.');
      },
      closeImage:closeViewer,
      showImage(id){const ref=byId[id];if(ref)openImage(ref,items.find(item=>item.ref.id===id)?.button);}
    });
    if(draftError){editor.report('Local edits could not be loaded. Reload before making changes.');for(const button of root.querySelectorAll('.fw-editor button,.fw-curate button'))button.disabled=true;}
  }
  function openImage(ref,button){
    stopMotion();selected=ref;returnFocus=button;const hero=viewer.querySelector('.fw-hero');hero.src=(reduced.matches&&ref.poster)||ref.src||images[ref.id];hero.alt=ref.description||ref.name;
    viewer.querySelector('.fw-caption').textContent=ref.name;
    fillTrail(viewer.querySelector('.fw-route'),ref.id,true);
    const connection=viewer.querySelector('.fw-connection');connection.hidden=!ref.discovery?.parent;connection.textContent=ref.discovery?.via||'';
    const branchSection=viewer.querySelector('.fw-branches'),branchList=branchSection.querySelector('.fw-branch-list'),children=discovery.children(ref.id);branchList.replaceChildren();branchSection.hidden=!children.length;
    for(const child of children){
      const b=document.createElement('button');b.type='button';b.setAttribute('aria-label','Follow '+child.name+' — '+child.discovery.via);
      const img=document.createElement('img');img.src=images[child.id];img.alt='';img.loading='lazy';
      const caption=document.createElement('span');caption.textContent=child.discovery.via;b.append(img,caption);b.addEventListener('click',()=>openImage(child,returnFocus));branchList.append(b);
    }
    viewer.querySelector('.fw-explore').textContent=children.length?'explore this branch →':'see where this connects →';
    // Only the user's original words belong in the note; never fill gaps with a summary.
    const note=ref.noteAuthor==='user'&&typeof ref.note==='string'?ref.note:'';
    viewer.querySelector('.fw-note-block').hidden=false;
    const quote=viewer.querySelector('.fw-note');quote.hidden=!note.trim();quote.textContent=note.trim()?'“'+note+'”':'';
    viewer.querySelector('.fw-no-note').hidden=!!note.trim();
    const sourceLink=viewer.querySelector('.fw-source');sourceLink.hidden=!ref.source?.url;if(ref.source?.url)sourceLink.href=ref.source.url;else sourceLink.removeAttribute('href');
    const related=viewer.querySelector('.fw-related');related.replaceChildren();
    for(const id of relatedFor(ref)){const r=byId[id],b=document.createElement('button');b.type='button';b.className='cursor-interaction';b.setAttribute('aria-label','Read notes for '+r.name);const img=document.createElement('img');img.src=images[id];img.alt='';b.append(img);b.addEventListener('click',()=>openImage(r,returnFocus));related.append(b);}
    viewer.querySelector('.fw-crossovers').hidden=!related.children.length;
    setViewer(true);viewer.querySelector('.fw-back').focus();announcement.textContent=ref.name+(note.trim()?'. Note shown with the photo.':'. No note.');persist();
  }
  root.querySelector('.fw-back').addEventListener('click',closeViewer);
  root.querySelector('.fw-explore').addEventListener('click',()=>{if(selected)exploreBranch(selected.id);});
  root.querySelector('.fw-home').addEventListener('click',resetWorld);
  function zoom(factor,px=width/2,py=(height-60)/2,kind='button'){
    const direction=Math.sign(Math.log(factor));if(!direction)return;
    if(motion!==kind||(zoomDirection&&direction!==zoomDirection)){Object.assign(target,camera);velocity.z=0;}
    velocity.x=velocity.y=0;coast.x=coast.y=0;motion=kind;zoomDirection=direction;zoomAnchor=worldAt(px,py);overview=false;
    const pending=Math.log(target.z)+Math.log(factor),visible=Math.log(camera.z);
    target.z=clamp(Math.exp(kind==='wheel'?clamp(pending,visible-.42,visible+.42):pending),limits.min,limits.max);Object.assign(target,centerAt(zoomAnchor,target.z));requestFrame();scheduleSave();
  }
  root.querySelector('[data-action=in]').addEventListener('click',()=>zoom(1.4));root.querySelector('[data-action=out]').addEventListener('click',()=>zoom(1/1.4));
  field.addEventListener('wheel',event=>{
    if(!viewer.hidden||gesture)return;event.preventDefault();const r=field.getBoundingClientRect(),unit=event.deltaMode===1?16:event.deltaMode===2?height:1;
    if(!event.ctrlKey&&Math.abs(event.deltaX)>Math.abs(event.deltaY)*1.5){stopMotion();const e=extent();camera.x+=event.deltaX*unit/(e.x*spread(camera.z));Object.assign(target,camera);overview=false;requestFrame();scheduleSave();return;}
    const amount=clamp(-event.deltaY*unit*(event.ctrlKey?.012:.004),-.32,.32);zoom(Math.exp(amount),event.clientX-r.left,event.clientY-r.top,'wheel');
  },{passive:false});
  root.addEventListener('keydown',event=>{if(event.target.closest('dialog,input,textarea,select'))return;if(event.key==='Escape'){closeViewer();return;}if(!viewer.hidden)return;const direction={ArrowLeft:[-.13,0],ArrowRight:[.13,0],ArrowUp:[0,-.13],ArrowDown:[0,.13]}[event.key];if(direction){event.preventDefault();overview=false;const scale=spread(camera.z);moveTo({x:target.x+direction[0]/scale,y:target.y+direction[1]/scale});}});
  const pointers=new Map();let pinch=null;
  function pinchFromPoints(){const p=[...pointers.values()],r=field.getBoundingClientRect(),px=(p[0].x+p[1].x)/2-r.left,py=(p[0].y+p[1].y)/2-r.top;return {distance:Math.max(1,Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y)),spread:spread(camera.z),anchor:worldAt(px,py)};}
  function applyPinch(start,ratio,px,py){const z=clamp(zoomFromScale(start.spread*ratio),limits.min,limits.max);Object.assign(camera,centerAt({...start.anchor,px,py},z),{z});Object.assign(target,camera);motion='drag';overview=false;requestFrame();}
  field.addEventListener('pointerdown',event=>{if(event.target.closest('.fw-controls,.fw-viewer,.fw-trail')||event.button!==0)return;stopMotion();motion='drag';if(!pointers.size){moved=false;dragSpeed.x=dragSpeed.y=0;}pointers.set(event.pointerId,{x:event.clientX,y:event.clientY,ox:event.clientX,oy:event.clientY,time:event.timeStamp});if(!event.target.closest('button'))field.setPointerCapture(event.pointerId);if(pointers.size===2){moved=true;dragSpeed.x=dragSpeed.y=0;pinch=pinchFromPoints();}});
  field.addEventListener('pointermove',event=>{
    const rect=field.getBoundingClientRect();
    const p=pointers.get(event.pointerId);if(!p)return;const dx=event.clientX-p.x,dy=event.clientY-p.y,elapsed=Math.max(8,event.timeStamp-p.time);if(Math.hypot(event.clientX-p.ox,event.clientY-p.oy)>3){moved=true;field.setPointerCapture(event.pointerId);field.classList.add('fw-dragging');}p.x=event.clientX;p.y=event.clientY;p.time=event.timeStamp;if(!moved)return;overview=false;
    if(pointers.size===2&&pinch){const ps=[...pointers.values()],d=Math.hypot(ps[0].x-ps[1].x,ps[0].y-ps[1].y);applyPinch(pinch,d/pinch.distance,(ps[0].x+ps[1].x)/2-rect.left,(ps[0].y+ps[1].y)/2-rect.top);}else{const e=extent(),s=spread(camera.z);camera.x-=dx/(e.x*s);camera.y-=dy/(e.y*s);Object.assign(target,camera);dragSpeed.x=clamp(dragSpeed.x*.35+dx/elapsed*650,-1000,1000);dragSpeed.y=clamp(dragSpeed.y*.35+dy/elapsed*650,-1000,1000);requestFrame();}
  });
  function finish(event){const p=pointers.get(event.pointerId);if(!p)return;const wasPinch=!!pinch;pointers.delete(event.pointerId);if(pointers.size<2)pinch=null;if(!pointers.size){field.classList.remove('fw-dragging');const canCoast=moved&&!wasPinch&&!reduced.matches&&event.type==='pointerup'&&event.timeStamp-p.time<70;if(canCoast){coast.x=dragSpeed.x;coast.y=dragSpeed.y;motion='coast';}else motion='idle';requestFrame();scheduleSave();}else{dragSpeed.x=dragSpeed.y=0;for(const remaining of pointers.values()){remaining.ox=remaining.x;remaining.oy=remaining.y;remaining.time=event.timeStamp;}}if(field.hasPointerCapture(event.pointerId))field.releasePointerCapture(event.pointerId);}
  field.addEventListener('pointerup',finish);field.addEventListener('pointercancel',finish);field.addEventListener('lostpointercapture',event=>{if(event.target===field)finish(event);});
  field.addEventListener('click',event=>{if(moved&&!event.target.closest('.fw-controls,.fw-viewer,.fw-trail')){event.preventDefault();event.stopPropagation();moved=false;}},true);
  // Safari trackpads report native gesture events rather than Control-wheel events.
  field.addEventListener('gesturestart',event=>{if(!viewer.hidden||pointers.size>1)return;event.preventDefault();stopMotion();const r=field.getBoundingClientRect(),px=Number.isFinite(event.clientX)?event.clientX-r.left:width/2,py=Number.isFinite(event.clientY)?event.clientY-r.top:(height-60)/2;gesture={spread:spread(camera.z),anchor:worldAt(px,py)};motion='drag';},{passive:false});
  field.addEventListener('gesturechange',event=>{if(!gesture)return;event.preventDefault();if(!(event.scale>0))return;const r=field.getBoundingClientRect();applyPinch(gesture,event.scale,Number.isFinite(event.clientX)?event.clientX-r.left:gesture.anchor.px,Number.isFinite(event.clientY)?event.clientY-r.top:gesture.anchor.py);},{passive:false});
  field.addEventListener('gestureend',event=>{if(!gesture)return;event.preventDefault();gesture=null;motion='idle';scheduleSave();},{passive:false});
  function applyDesign(){root.style.setProperty('--fw-glow',0);requestFrame();}
  function restore(state){if(state?.version!=='taste-board-v1'||state.layoutRevision!==layoutRevision())return;stopMotion();if(state.camera&&['x','y','z'].every(key=>Number.isFinite(state.camera[key]))){Object.assign(target,{x:state.camera.x,y:state.camera.y,z:clamp(state.camera.z,limits.min,limits.max)});Object.assign(camera,target);overview=!!state.overview;}if(state.branch&&Number.isFinite(state.branch.zoom))setBranch(state.branch.id,state.branch.zoom,state.branch.categoryId);if(state.design){design.spring=Number.isFinite(state.design.spring)?clamp(state.design.spring,0,100):45;}applyDesign();}
  try{restore(JSON.parse(localStorage.getItem('taste-board-world-v3')));}catch{}
  function resizeWorld(){if(!viewer.hidden)return;const nextWidth=field.clientWidth,nextHeight=field.clientHeight;if(!nextWidth||!nextHeight)return;if(!ready||width!==nextWidth||height!==nextHeight){width=nextWidth;height=nextHeight;buildLayout();}ready=true;draw();}
  new ResizeObserver(resizeWorld).observe(field);
  reduced.addEventListener('change',requestFrame);
  coarsePointer.addEventListener('change',()=>{buildLayout();requestFrame();});
  document.fonts?.addEventListener('loadingdone',requestFrame);
  document.fonts?.ready.then(requestFrame);
  await document.fonts?.ready;
  field.hidden=false;
  loading.hidden=true;
  resizeWorld();
  mountLocalTools();
  } catch(error) {
    console.error('Unable to load the personal taste board.',error);
    loading.hidden=true;
    root.querySelector('.fw-field').hidden=true;
    root.querySelector('.fw-error').hidden=false;
  }
})();
