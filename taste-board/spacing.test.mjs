import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRelationships,categorySpacing} from './relationships.mjs';
import {createWorldLayout,photoBounds} from './spacing.mjs';
import {worldScale,photoScale,photoDimensions,photoHitSize} from './camera.mjs';
import {createLayers} from './layers.mjs';

const source=JSON.parse(readFileSync(new URL('./collection.json',import.meta.url)));
function layoutInput(collection,mobile=false){
  const layers=createLayers(collection);
  const covers=new Set([...layers.images].filter(([,p])=>p.opening).map(([id])=>id));
  const topics=new Map(collection.categories.map(c=>[c.id,c]));
  const width=mobile?351:1089,height=mobile?620:719;
  const photos=collection.items.map((ref,index)=>{
    const isCover=covers.has(ref.id),size=photoDimensions(ref,isCover,mobile,layers.images.get(ref.id));
    const touch=photoHitSize(mobile)/worldScale(Math.max(1,layers.images.get(ref.id).reveal[0]));
    const center=collection.groups[ref.group][mobile?'mobileCenter':'center'];
    return {ref,index,isCover,coverOrder:collection.categories.findIndex(c=>c.coverRef===ref.id),x:center[0]*width,y:center[1]*height,bounds:photoBounds(Math.max(touch,size.w),Math.max(touch,size.h),ref.angle*.55)};
  });
  const labels=collection.categories.map(c=>{
    const p=layers.categories.get(c.id),level=Math.ceil(p.level);
    const scale=photoScale(Math.max(1,p.reveal[0]));
    const font=[mobile?13:14,10,9.5,9][Math.min(3,level)],maxWidth=mobile?88:100;
    const textWidth=c.name.length*font*.56,renderW=Math.min(maxWidth,textWidth+6),renderH=Math.ceil(textWidth/(maxWidth-6))*font*1.1+8;
    return {id:c.id,refId:c.labelAnchor.ref,offset:c.labelAnchor.offset,w:renderW/scale,h:renderH/scale,depth:level,reveal:p.reveal[0],renderW,renderH};
  });
  return {photos,labels,options:{relationship:createRelationships(collection),labelGap:3,labelStackGap:3,groupGap:mobile?categorySpacing.separate:categorySpacing.overview,viewport:{left:0,top:0,right:width,bottom:height}}};
}
function verifyClear(layout,relationship,zoom){
  const spatial=worldScale(zoom),projected=layout.photos.map(p=>{
    const scale=photoScale(zoom,p.isCover);
    return {ref:p.ref,x:p.x*spatial+p.bounds.offsetX*scale,y:p.y*spatial+p.bounds.offsetY*scale,w:p.bounds.w*scale,h:p.bounds.h*scale};
  });
  for(let i=0;i<projected.length;i++)for(let j=i+1;j<projected.length;j++){
    const a=projected[i],b=projected[j];
    const gap=Math.max(Math.abs(a.x-b.x)-(a.w+b.w)/2,Math.abs(a.y-b.y)-(a.h+b.h)/2);
    // Distant pairs cannot collide; avoid creating a quadratic relation cache.
    if(gap<categorySpacing.separate)assert.ok(gap>=relationship(a.ref,b.ref).gap-.01,`${a.ref.id} / ${b.ref.id} at zoom ${zoom}`);
  }
}
function expandedCollection(count,singleCluster=false){
  const collection=structuredClone(source),covers=new Set(collection.categories.map(c=>c.coverRef));
  const originals=collection.items.filter(ref=>!covers.has(ref.id));
  for(let i=collection.items.length;i<count;i++){
    const original=singleCluster?originals[0]:originals[i%originals.length],ref={...original,id:'capacity-'+i};
    collection.items.push(ref);
    for(const c of collection.categories)if(c.refs.includes(original.id))c.refs.push(ref.id);
  }
  return collection;
}

test('related photos have tight gaps, with extra breathing room between different groups',()=>{
  const relationship=createRelationships(source),byId=new Map(source.items.map(r=>[r.id,r]));
  const gap=(a,b)=>relationship(byId.get(a),byId.get(b)).gap;
  assert.ok(gap('lucky-clovers','pressed-clovers')<gap('love-meter','romantic-clown'));
  assert.ok(gap('love-meter','romantic-clown')<gap('janice','frog-knight'));
  assert.equal(gap('lucky-clovers','star-wizard'),gap('lucky-clovers','frog-knight'),'A new starting branch is not assigned a speculative link to other motifs');
});

test('reserved layers remain stable and clear throughout zoom on desktop and phone',()=>{
  for(const mobile of [false,true]){
    const {photos,labels,options}=layoutInput(source,mobile),before=structuredClone(photos);
    const layout=createWorldLayout(photos,labels,options);
    assert.deepEqual(photos,before);
    assert.deepEqual(createWorldLayout(photos,labels,options),layout,'The layout is deterministic and never repacks while zooming');
    const view=layout.overview,viewport=options.viewport;
    for(const p of layout.photos){
      assert.ok((Math.abs(p.x+p.bounds.offsetX-view.x)+p.bounds.w/2)*view.scale<=(viewport.right-viewport.left)/2+.01,'The starting region fits its reserved space');
      assert.ok((Math.abs(p.y+p.bounds.offsetY-view.y)+p.bounds.h/2)*view.scale<=(viewport.bottom-viewport.top)/2+.01,'Deeper layers reserve space without being displayed');
    }
    for(const z of [1,2.2,4,6,12,24,...labels.map(l=>Math.max(1,l.reveal))])verifyClear(layout,options.relationship,z);
    for(const label of labels){
      const anchor=layout.labels.get(label.id),p=layout.photos.find(p=>p.ref.id===label.refId),scale=photoScale(Math.max(1,label.reveal),p.isCover);
      assert.ok(Math.abs(anchor.x-p.bounds.offsetX)+label.renderW/scale/2<=p.bounds.w/2+.01);
      assert.ok(Math.abs(anchor.y-p.bounds.offsetY)+label.renderH/scale/2<=p.bounds.h/2+.01);
    }
  }
});

test('color crossovers do not pull a subject out of its primary neighborhood',()=>{
  const {photos,labels,options}=layoutInput(source),layout=createWorldLayout(photos,labels,options);
  const byId=new Map(layout.photos.map(photo=>[photo.ref.id,photo]));
  assert.equal(byId.get('dragon-tales-pattern').clusterId,'dragon-tales');
  assert.equal(byId.get('nervous-knight').clusterId,'nervous-knights');
  assert.equal(byId.get('disney-christmas').clusterId,'holiday-rituals');
  assert.equal(options.relationship(byId.get('dragon-tales-pattern').ref,byId.get('pink-star-pattern').ref).cohesion,0);
});

test('1,000 images pack quickly, stay grouped, and remain clear at every viewing scale',()=>{
  for(const singleCluster of [false,true]){
    const collection=expandedCollection(1000,singleCluster),start=performance.now();
    const {photos,labels,options}=layoutInput(collection);
    const layout=createWorldLayout(photos,labels,options),duration=performance.now()-start;
    assert.equal(layout.photos.length,1000);
    assert.ok(duration<1500,`Layout took ${Math.round(duration)}ms`);
    for(const z of [1,4,8,24])verifyClear(layout,options.relationship,z);
    assert.deepEqual(createWorldLayout(photos,labels,options),layout);
    const clusters=new Map();
    for(const photo of layout.photos){
      if(!clusters.has(photo.clusterId))clusters.set(photo.clusterId,[]);
      clusters.get(photo.clusterId).push(photo);
    }
    for(const group of clusters.values()){
      const left=Math.min(...group.map(p=>p.x+p.bounds.offsetX-p.bounds.w/2)),right=Math.max(...group.map(p=>p.x+p.bounds.offsetX+p.bounds.w/2));
      const top=Math.min(...group.map(p=>p.y+p.bounds.offsetY-p.bounds.h/2)),bottom=Math.max(...group.map(p=>p.y+p.bounds.offsetY+p.bounds.h/2));
      const area=group.reduce((sum,p)=>sum+p.bounds.w*p.bounds.h,0);
      assert.ok((right-left)*(bottom-top)<=area*3,'A small category stays in one compact cluster');
    }
  }
});

test('Star Trek and clovers keep tight proportions while their images grow',()=>{
  const layers=createLayers(source);
  for(const mobile of [false,true]){
    const {photos,labels,options}=layoutInput(source,mobile),layout=createWorldLayout(photos,labels,options);
    const stars=layout.photos.filter(p=>p.ref.revealCategory==='star-trek');
    const relativeDistance=(a,b,z)=>Math.hypot(a.x-b.x,a.y-b.y)*worldScale(z)/(layers.images.get(a.ref.id).edge*photoScale(z));
    for(const a of stars)for(const b of stars)assert.ok(Math.abs(relativeDistance(a,b,1)-relativeDistance(a,b,24))<.001,'Neighbors keep the same image-to-gap proportions during inspection');
    const clovers=layout.photos.filter(p=>p.ref.revealCategory==='luck-clovers');
    assert.equal(clovers[0].clusterId,clovers[1].clusterId);
    const [cover,detail]=clovers.sort((a,b)=>Number(b.isCover)-Number(a.isCover));
    assert.ok(relativeDistance(cover,detail,24)<1.5,'Both clover pictures stay together including the larger cover');
  }
});


test('each main area contains its smaller primary paths without unrelated areas interleaving',()=>{
  for(const mobile of [false,true]){
    const {photos,labels,options}=layoutInput(source,mobile),layout=createWorldLayout(photos,labels,options);
    const regions=new Map();
    for(const p of layout.photos){
      const root=p.clusterPath[0];if(!regions.has(root))regions.set(root,[]);regions.get(root).push(p);
    }
    const boxes=[...regions].map(([id,group])=>({id,
      left:Math.min(...group.map(p=>p.x+p.bounds.offsetX-p.bounds.w/2)),right:Math.max(...group.map(p=>p.x+p.bounds.offsetX+p.bounds.w/2)),
      top:Math.min(...group.map(p=>p.y+p.bounds.offsetY-p.bounds.h/2)),bottom:Math.max(...group.map(p=>p.y+p.bounds.offsetY+p.bounds.h/2))
    }));
    for(const [i,a] of boxes.entries())for(const b of boxes.slice(i+1)){
      assert.ok(a.right<=b.left||b.right<=a.left||a.bottom<=b.top||b.bottom<=a.top,`${a.id} must not scatter into ${b.id}`);
    }
  }
});
