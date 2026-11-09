import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {applyDraft,emptyDraft} from './drafts.mjs';
import {validateCollection,isLocalPreview} from './collection.mjs';
import {createRelationships} from './relationships.mjs';
import {createWorldLayout,photoBounds} from './spacing.mjs';

const active=JSON.parse(readFileSync(new URL('./collection.json',import.meta.url)));
// Curation tests use an isolated fixture so the live board can start empty.
const base={schemaVersion:2,groups:{a:{center:[.3,.4],mobileCenter:[.3,.4],slots:[]},b:{center:[.7,.4],mobileCenter:[.7,.4],slots:[]}},categories:[
  {id:'a',name:'Area A',kind:'main',parents:[],refs:['a1','a2'],themes:['a'],coverRef:'a1',reveal:[0,0],focusZoom:2.2,labelAnchor:{ref:'a1',offset:[0,-60]}},
  {id:'b',name:'Area B',kind:'main',parents:[],refs:['b1','b2'],themes:['b'],coverRef:'b1',reveal:[0,0],focusZoom:2.2,labelAnchor:{ref:'b1',offset:[0,-60]}}
],items:['a1','a2','b1','b2'].map(id=>({id,name:id,group:id[0],src:id+'.jpg',w:100,h:120,size:60,angle:0,tier:1,themes:[id[0]],note:''}))};

test('the active collection can start empty and any supplied references have local assets',()=>{
  validateCollection(active);
  for(const ref of active.items){
    assert.ok(existsSync(new URL(ref.src,import.meta.url)));
    assert.ok(existsSync(new URL(ref.thumbnail,import.meta.url)));
    assert.ok(ref.source.url.startsWith('https://www.pinterest.com/'));
    if(ref.note)assert.equal(ref.noteAuthor,'user');else assert.equal(ref.noteAuthor,undefined);
  }
});

test('removing a cover repairs labels and memberships without changing the source',()=>{
  const before=structuredClone(base),draft=emptyDraft(),cover=base.categories.find(c=>c.kind==='main').coverRef;
  draft.removed=[cover];
  const next=applyDraft(base,draft);validateCollection(next);
  assert.equal(next.items.length,base.items.length-1);
  assert.ok(next.categories.every(c=>c.coverRef!==cover&&c.labelAnchor?.ref!==cover));
  assert.deepEqual(base,before);
  assert.deepEqual(applyDraft(base,emptyDraft()).items.map(ref=>ref.id),base.items.map(ref=>ref.id));
});

test('one added image can join several categories and preserves an exact note',()=>{
  const draft=emptyDraft(),categories=base.categories.filter(c=>c.kind==='main').slice(0,2);
  draft.added=[{...base.items[0],id:'local-example',note:'My EXACT words.\nSecond line.',noteAuthor:'user',themes:categories.map(c=>c.id),categoryIds:categories.map(c=>c.id)}];
  const next=applyDraft(base,draft);validateCollection(next);
  for(const category of categories)assert.ok(next.categories.find(c=>c.id===category.id).refs.includes('local-example'));
  assert.equal(next.items.at(-1).note,draft.added[0].note);
  draft.notes['local-example']='';
  const cleared=applyDraft(base,draft).items.at(-1);assert.equal(cleared.note,'');assert.equal(cleared.noteAuthor,undefined);
});

test('an empty board can recover through undo or a new reference',()=>{
  const draft=emptyDraft();draft.removed=base.items.map(ref=>ref.id);
  const empty=applyDraft(base,draft);assert.equal(empty.items.length,0);assert.equal(empty.categories.length,0);
  assert.deepEqual(createWorldLayout([],[],{relationship:createRelationships(empty)}).photos,[]);
  draft.added=[{...base.items[0],id:'new-after-empty',categoryIds:[base.categories[0].id]}];
  validateCollection(applyDraft(base,draft));
});

test('the taste collection packs without photo collisions on desktop and phone',()=>{
  const sample=active.items.length?active:base;
  for(const mobile of [false,true]){
    const relationship=createRelationships(sample),covers=new Set(sample.categories.map(c=>c.coverRef).filter(Boolean));
    const photos=sample.items.map((ref,index)=>{
      const group=sample.groups[ref.group],center=mobile?group.mobileCenter:group.center,size=covers.has(ref.id)?(mobile?72:90):46;
      return {ref,index,isCover:covers.has(ref.id),x:center[0]*(mobile?340:1000),y:center[1]*(mobile?480:700),bounds:photoBounds(size*ref.w/Math.max(ref.w,ref.h),size*ref.h/Math.max(ref.w,ref.h),ref.angle*.55)};
    });
    const labels=sample.categories.map(category=>({id:category.id,refId:category.labelAnchor.ref,offset:category.labelAnchor.offset,w:120,h:32,depth:category.labelDepth||0}));
    const layout=createWorldLayout(photos,labels,{relationship,labelGap:8,labelStackGap:5});
    for(const [i,a] of layout.photos.entries())for(const b of layout.photos.slice(i+1)){
      const dx=Math.abs(a.x+a.bounds.offsetX-b.x-b.bounds.offsetX)-(a.bounds.w+b.bounds.w)/2;
      const dy=Math.abs(a.y+a.bounds.offsetY-b.y-b.bounds.offsetY)-(a.bounds.h+b.bounds.h)/2;
      assert.ok(Math.max(dx,dy)>=relationship(a.ref,b.ref).gap-.01,`${a.ref.id} / ${b.ref.id}`);
    }
  }
});

test('curation stays local',()=>{
  assert.equal(isLocalPreview('127.0.0.1'),true);
  assert.equal(isLocalPreview('brooklyngibbs.github.io'),false);
});
