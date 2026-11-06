import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {photoBounds,keepPhotosApart,createWorldLayout} from './spacing.mjs';
import {createRelationships} from './relationships.mjs';
import {worldScale,zoomFromScale,photoScale} from './camera.mjs';

const collection=JSON.parse(readFileSync(new URL('./collection.json',import.meta.url)));
const covers=new Set(collection.categories.map(category=>category.coverRef).filter(Boolean));
function verifyGaps(photos,zones,gap,groupGap){
  for(const [index,a] of photos.entries()){
    assert.ok(Number.isFinite(a.x)&&Number.isFinite(a.y),'Every photo keeps a finite position');
    for(const b of photos.slice(index+1)){
      const required=a.ref.group===b.ref.group?gap:groupGap;
      const dx=Math.abs(a.x+(a.bounds.offsetX||0)-b.x-(b.bounds.offsetX||0))-(a.bounds.w+b.bounds.w)/2;
      const dy=Math.abs(a.y+(a.bounds.offsetY||0)-b.y-(b.bounds.offsetY||0))-(a.bounds.h+b.bounds.h)/2;
      assert.ok(Math.max(dx,dy)>=required-.01,`${a.ref.id} and ${b.ref.id} need a clear gap`);
    }
    for(const zone of zones){
      const dx=Math.abs(a.x-zone.x-zone.w/2)-(a.bounds.w+zone.w)/2;
      const dy=Math.abs(a.y-zone.y-zone.h/2)-(a.bounds.h+zone.h)/2;
      assert.ok(Math.max(dx,dy)>=17.99,'Photos must leave room for titles');
    }
  }
}

test('real collection keeps gaps at crowded and open depths on desktop and phone',()=>{
  for(const mobile of [false,true])for(const scale of [1,1.4,1.8,2.6]){
    const width=mobile?375:1113,height=mobile?599:811,gap=mobile?22:28,groupGap=mobile?34:44;
    const photos=collection.items.map((ref,index)=>{
      const group=collection.groups[ref.group],center=mobile?group.mobileCenter:group.center,slot=group.slots[ref.slot];
      const size=covers.has(ref.id)?(mobile?158:220):Math.min(mobile?140:182,Math.max(mobile?96:130,ref.size*(mobile?1.65:2.25)));
      return {ref,index,x:center[0]*width+slot[0]*scale,y:center[1]*height+slot[1]*scale,bounds:photoBounds(size*ref.w/Math.max(ref.w,ref.h),size*ref.h/Math.max(ref.w,ref.h),ref.angle*.55)};
    });
    const zones=[{x:width*.3,y:height*.4,w:155,h:40},{x:width*.6,y:height*.3,w:175,h:36}];
    keepPhotosApart(photos,zones,{gap,groupGap});
    verifyGaps(photos,zones,gap,groupGap);
    const settled=photos.map(photo=>[photo.x,photo.y]);
    keepPhotosApart(photos,zones,{gap,groupGap});
    assert.deepEqual(photos.map(photo=>[photo.x,photo.y]),settled,'A clear layout remains still');
  }
});

test('one permanent layout stays separated through zoom, reverse zoom and pan',()=>{
  const photos=collection.items.map((ref,index)=>{
    const group=collection.groups[ref.group],slot=group.slots[ref.slot],size=covers.has(ref.id)?220:150;
    return {ref,index,x:group.center[0]*1000+slot[0],y:group.center[1]*700+slot[1],bounds:photoBounds(size*ref.w/Math.max(ref.w,ref.h),size*ref.h/Math.max(ref.w,ref.h),ref.angle*.55)};
  });
  const labels=collection.categories.filter(category=>category.labelAnchor).map(category=>({id:category.id,refId:category.labelAnchor.ref,offset:category.labelAnchor.offset,w:180,h:40,depth:category.parents.length?1:0}));
  const original=structuredClone(photos),layout=createWorldLayout(photos,labels,{gap:4,groupGap:8,labelGap:8,labelStackGap:5});
  assert.deepEqual(photos,original,'Layout preparation must not mutate the collection');
  const positions=layout.photos.map(photo=>[photo.x,photo.y]);
  for(let frame=0;frame<=240;frame++){
    const scale=1+1.5*Math.sin(Math.PI*frame/240),panX=frame*2,panY=-frame;
    const projected=layout.photos.map(photo=>({...photo,x:photo.x*scale-panX,y:photo.y*scale-panY}));
    verifyGaps(projected,[],4,8);
    // Revealing a subset only filters what is drawn; it cannot change any world position.
    const visible=projected.filter(photo=>photo.index%3!==frame%3);
    verifyGaps(visible,[],4,8);
  }
  assert.deepEqual(layout.photos.map(photo=>[photo.x,photo.y]),positions);
  for(const label of layout.labels.values()){
    const photo=original.find(photo=>photo.ref.id===label.refId);
    assert.ok(Math.abs(label.y)-label.h/2>=photo.bounds.h/2+7.99,'Titles stay outside their own photo');
  }
});

test('protected bounds enclose rotated corners and the hover lift',()=>{
  for(const angle of [-4,-1,0,3,8]){
    const w=174,h=220,bounds=photoBounds(w,h,angle),radians=angle*Math.PI/180;
    for(const x of [-w/2,w/2])for(const y of [-h/2,h/2]){
      assert.ok(Math.abs(x*Math.cos(radians)-y*Math.sin(radians))<bounds.w/2);
      assert.ok(Math.abs(x*Math.sin(radians)+y*Math.cos(radians)-4)<bounds.h/2);
    }
  }
});

test('all main covers and their titles fit the desktop and phone overview',()=>{
  const relationship=createRelationships(collection);
  for(const mobile of [false,true]){
    const viewport={left:0,top:0,right:mobile?351:1089,bottom:mobile?507:719};
    const photos=collection.items.filter(ref=>covers.has(ref.id)).map((ref,index)=>{
      const size=mobile?140:220;
      return {ref,index,isCover:true,x:30,y:30,bounds:photoBounds(size*ref.w/Math.max(ref.w,ref.h),size*ref.h/Math.max(ref.w,ref.h),ref.angle*.55)};
    });
    const labels=collection.categories.filter(category=>category.labelAnchor).map(category=>({id:category.id,refId:mobile?(category.labelAnchor.mobileRef||category.labelAnchor.ref):category.labelAnchor.ref,offset:mobile?(category.labelAnchor.mobileOffset||category.labelAnchor.offset):category.labelAnchor.offset,w:mobile?135:180,h:44,depth:category.labelDepth??(category.parents.length?1:0)}));
    const layout=createWorldLayout(photos,labels,{relationship,viewport,labelGap:8,labelStackGap:5});
    assert.equal(layout.photos.length,3);
    for(const photo of layout.photos){
      const {w,h,offsetX,offsetY}=photo.bounds,x=photo.x+offsetX,y=photo.y+offsetY;
      assert.ok(x-w/2>=viewport.left-.01&&x+w/2<=viewport.right+.01,`${photo.ref.id} stays within the overview width`);
      assert.ok(y-h/2>=viewport.top-.01&&y+h/2<=viewport.bottom+.01,`${photo.ref.id} and its title stay above the controls`);
    }
  }
});

test('close neighbors require an actual shared category or motif',()=>{
  const relationship=createRelationships(collection),byId=new Map(collection.items.map(ref=>[ref.id,ref]));
  const pair=(a,b)=>relationship(byId.get(a),byId.get(b));
  assert.equal(pair('vintage-floral','chandelier-headpiece').shared.length,0,'A shared placement bucket is not a category');
  assert.equal(pair('looking-glass-book','carousel').shared.length,0,'A loose related-image link is not a category');
  assert.equal(pair('looking-glass-book','vintage-floral').shared.length,0,'Alice crossing into Florals does not make every Alice image floral');
  assert.ok(pair('floral-hat','vintage-floral').shared.includes('florals'));
  assert.ok(pair('vintage-floral','mismatched-socks').close.includes('floral-patterns'));
  assert.ok(pair('floral-hat','chandelier-headpiece').close.includes('headwear'),'A crossover can join different old placement groups');
  assert.ok(pair('glass-perception','alice-mirrors').close.includes('perception'));
  assert.ok(pair('looking-glass-book','flower-people').shared.includes('alice'),'The botanical subgroup retains its Alice connection');
  assert.ok(pair('flower-people','vegetable-people').close.includes('botanical-people'));
  assert.ok(pair('ribbon-dress','lampshade-people').close.includes('bows-ribbon'),'Visible bows connect costumes across placement groups');
  assert.ok(!pair('vegetable-people','vintage-floral').shared.includes('florals'),'A crossover does not turn vegetables into flowers');
  assert.deepEqual(pair('looking-glass-book','matilda-176').close,[],'Separate stories retain their own tight clusters');
  assert.ok(pair('looking-glass-book','matilda-176').shared.includes('british-literature'));
  assert.ok(pair('vintage-floral','chandelier-headpiece').gap>pair('looking-glass-book','matilda-176').gap);
});

test('semantic packing preserves the required relationship gaps on desktop and phone',()=>{
  const relationship=createRelationships(collection);
  for(const mobile of [false,true]){
    const photos=collection.items.map((ref,index)=>{
      const group=collection.groups[ref.group],center=mobile?group.mobileCenter:group.center,slot=group.slots[ref.slot],size=covers.has(ref.id)?(mobile?158:220):(mobile?120:150);
      return {ref,index,isCover:covers.has(ref.id),x:center[0]*(mobile?340:1000)+slot[0]*.8,y:center[1]*(mobile?470:700)+slot[1]*.8,bounds:photoBounds(size*ref.w/Math.max(ref.w,ref.h),size*ref.h/Math.max(ref.w,ref.h),ref.angle*.55)};
    });
    const labels=collection.categories.filter(category=>category.labelAnchor).map(category=>({id:category.id,refId:mobile?(category.labelAnchor.mobileRef||category.labelAnchor.ref):category.labelAnchor.ref,offset:mobile?(category.labelAnchor.mobileOffset||category.labelAnchor.offset):category.labelAnchor.offset,w:180,h:40,depth:category.parents.length?1:0}));
    const options={relationship,labelGap:8,labelStackGap:5};
    const layout=createWorldLayout(photos,labels,options);
    assert.deepEqual(createWorldLayout(photos,labels,options),layout,'The same collection produces the same stable layout');
    for(const scale of [1,1.07,1.18,1.02])for(const [index,a] of layout.photos.entries())for(const b of layout.photos.slice(index+1)){
      const dx=Math.abs((a.x-b.x)*scale+a.bounds.offsetX-b.bounds.offsetX)-(a.bounds.w+b.bounds.w)/2;
      const dy=Math.abs((a.y-b.y)*scale+a.bounds.offsetY-b.bounds.offsetY)-(a.bounds.h+b.bounds.h)/2;
      assert.ok(Math.max(dx,dy)>=relationship(a.ref,b.ref).gap-.01,`${a.ref.id} / ${b.ref.id} must respect their category gap`);
    }
  }
});

test('small photos can grow through spatial zoom without colliding or becoming oversized',()=>{
  const relationship=createRelationships(collection);
  for(const mobile of [false,true]){
    const photos=collection.items.map((ref,index)=>{
      const isCover=covers.has(ref.id),size=isCover?(mobile?72:90):Math.min(mobile?46:56,Math.max(mobile?32:38,ref.size*.72));
      const group=collection.groups[ref.group],slot=group.slots[ref.slot];
      return {ref,index,isCover,x:group.center[0]*1000+slot[0],y:group.center[1]*700+slot[1],bounds:photoBounds(Math.max(44,size*ref.w/Math.max(ref.w,ref.h)),Math.max(44,size*ref.h/Math.max(ref.w,ref.h)),ref.angle*.55)};
    });
    const labels=collection.categories.filter(c=>c.labelAnchor).map(c=>{
      const refId=mobile?(c.labelAnchor.mobileRef||c.labelAnchor.ref):c.labelAnchor.ref;
      const atReveal=photoScale(Math.max(1,c.reveal[0]),covers.has(refId));
      return {id:c.id,refId,offset:mobile?(c.labelAnchor.mobileOffset||c.labelAnchor.offset):c.labelAnchor.offset,w:130/atReveal,h:32/atReveal,renderW:130,renderH:32,reveal:c.reveal[0],depth:c.labelDepth??(c.parents.length?1:0)};
    });
    const layout=createWorldLayout(photos,labels,{relationship,labelGap:8,labelStackGap:5});
    for(const z of [1,1.4,2,3.4,5,8,12,24,6,1,...labels.map(label=>Math.max(1,label.reveal+.001))]){
      const s=worldScale(z);
      assert.ok(Math.abs(zoomFromScale(s)-z)<1e-9,'Pinching uses the inverse of the spatial zoom scale');
      assert.ok(photoScale(z,true)<=1.8&&photoScale(z)<=3.2,'Photos stay capped while the world continues expanding');
      const projected=layout.photos.map(p=>{
        const k=photoScale(z,p.isCover);
        return {ref:p.ref,x:p.x*s+p.bounds.offsetX*k,y:p.y*s+p.bounds.offsetY*k,w:p.bounds.w*k,h:p.bounds.h*k};
      });
      for(const [i,a] of projected.entries())for(const b of projected.slice(i+1)){
        const dx=Math.abs(a.x-b.x)-(a.w+b.w)/2,dy=Math.abs(a.y-b.y)-(a.h+b.h)/2;
        assert.ok(Math.max(dx,dy)>=relationship(a.ref,b.ref).gap-.01,`${a.ref.id} / ${b.ref.id} stay clear at zoom ${z}`);
      }
      for(const label of labels.filter(label=>z>=label.reveal)){
        const anchor=layout.labels.get(label.id),photo=layout.photos.find(p=>p.ref.id===label.refId),tile=projected.find(p=>p.ref.id===label.refId),k=photoScale(z,photo.isCover);
        const x=photo.x*s+anchor.x*k,y=photo.y*s+anchor.y*k;
        assert.ok(Math.abs(x-tile.x)+label.renderW/2<=tile.w/2+.01,`${label.id} fits its reserved width as soon as it reveals`);
        assert.ok(Math.abs(y-tile.y)+label.renderH/2<=tile.h/2+.01,`${label.id} fits its reserved height as soon as it reveals`);
      }
    }
  }
});
