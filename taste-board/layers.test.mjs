import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createLayers,layerOpacity} from './layers.mjs';
import {applyDraft,emptyDraft} from './drafts.mjs';
import {createConnections,projectConnections} from './connections.mjs';

const collection=JSON.parse(readFileSync(new URL('./collection.json',import.meta.url)));

test('opening gives every independent theme a cover',()=>{
  const layers=createLayers(collection);
  const opening=[...layers.images].filter(([,p])=>layerOpacity(p,1)>.6);
  const roots=collection.categories.filter(c=>!c.parents?.length);
  assert.deepEqual(new Set(opening.map(([id])=>id)),new Set(roots.map(c=>layers.categories.get(c.id).entry)));
  assert.ok(opening.every(([,p])=>p.level===0));
  const alice=layers.images.get('alice-cheshire');
  assert.equal(layerOpacity(alice,1),0);
  assert.equal(layerOpacity(alice,alice.reveal[1]),1);
  assert.ok(opening.every(([,p])=>p.edge>alice.edge));
  assert.equal(layerOpacity(layers.images.get('smoke-dragon'),1),0);
  assert.equal(layerOpacity(layers.images.get('pressed-clovers'),1),0);
  assert.equal(layerOpacity(layers.images.get('lucky-clovers'),1),1);
  assert.equal(layers.categories.get('alice').level,1,'A strong subtheme opens after its parent');
  assert.ok(layers.categories.get('alice').path.includes('storybook-worlds'),'Promotion preserves ancestry');
  assert.ok(layers.categories.get('nervous-knights').level<layers.categories.get('labyrinths').level,'Explicit personal significance matters alongside frequency');
});

test('successive zoom layers reveal more references, keep them, and reverse cleanly',()=>{
  const layers=createLayers(collection),profiles=[...layers.images.values()];
  const counts=[1,3,6,12,100].map(z=>profiles.filter(p=>layerOpacity(p,z)>.6).length);
  for(let i=1;i<counts.length;i++)assert.ok(counts[i]>counts[i-1]||counts[i]===profiles.length,counts.join(','));
  assert.equal(counts.at(-1),collection.items.length);
  for(const p of profiles){
    let previous=0;
    for(let z=1;z<100;z+=.1){const opacity=layerOpacity(p,z);assert.ok(opacity>=previous);previous=opacity;}
    assert.equal(layerOpacity(p,1),p.opening?1:0);
  }
});

test('an independent theme keeps its opening layer as it grows',()=>{
  const before=createLayers(collection),grown=structuredClone(collection);
  const original=grown.items.find(ref=>ref.id==='daft-punk-graffiti');
  for(let i=0;i<4;i++)grown.items.push({...original,id:'more-graffiti-'+i});
  const after=createLayers(grown);
  assert.equal(after.categories.get('bathroom-graffiti').level,0);
  assert.ok(after.images.get('daft-punk-graffiti').edge>before.images.get('daft-punk-graffiti').edge);
});

test('connections never target unrevealed photos or connect same-subject pictures',()=>{
  const layers=createLayers(collection),graph=createConnections(collection);
  for(const z of [1,2.5,5,10,100]){
    const visible=id=>layerOpacity(layers.images.get(id),z)>.6;
    for(const edge of projectConnections(graph,visible)){
      assert.ok(visible(edge.a)&&visible(edge.b));
      assert.notEqual(graph.refs.get(edge.a).revealCategory,graph.refs.get(edge.b).revealCategory);
    }
  }
});

test('local removals repair weighted entrances and preserve exact notes',()=>{
  for(const removed of [['alice-cheshire'],['make-believe-castles','pink-elephant'],collection.items.map(r=>r.id)]){
    const draft=emptyDraft();draft.removed=removed;
    const next=applyDraft(collection,draft),layers=createLayers(next);
    for(const c of next.categories)assert.ok(layers.images.has(layers.categories.get(c.id).entry));
    for(const ref of next.items)assert.equal(ref.note,collection.items.find(r=>r.id===ref.id).note);
  }
});

test('a draft with only a smaller interest keeps an opening image',()=>{
  const draft=emptyDraft();
  draft.removed=collection.items.filter(r=>r.revealCategory!=='luck-clovers').map(r=>r.id);
  const layers=createLayers(applyDraft(collection,draft));
  assert.equal(layerOpacity(layers.images.get('lucky-clovers'),1),1);
});
