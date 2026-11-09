import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createDiscovery} from './discovery.mjs';
import {validateCollection} from './collection.mjs';
import {applyDraft,emptyDraft} from './drafts.mjs';

const collection=JSON.parse(readFileSync(new URL('./collection.json',import.meta.url)));

test('every reference has a traceable path to a visible starting image',()=>{
  const graph=createDiscovery(collection);
  for(const ref of collection.items){
    const path=graph.trail(ref.id);
    assert.equal(path.at(-1).id,ref.id);
    assert.ok(graph.roots.has(path[0].id),ref.id);
    assert.equal(new Set(path.map(item=>item.id)).size,path.length);
    if(ref.discovery.parent)assert.ok(graph.children(ref.discovery.parent).some(child=>child.id===ref.id));
  }
  assert.deepEqual(graph.trail('pressed-clovers').map(ref=>ref.id),['lucky-clovers','pressed-clovers']);
  assert.ok(graph.roots.has('lucky-clovers'),'Luck has a visible entry rather than being hidden inside an unrelated theme');
  assert.ok(graph.roots.has('daft-punk-graffiti'),'Graffiti is not forced into a generic music route');
  assert.ok(graph.roots.has('white-christmas-tree'),'Christmas has an entrance beyond its Disney crossover');
  validateCollection(collection);
  assert.deepEqual(graph.trail('smoke-crocodile').map(ref=>ref.id),['make-believe-castles','alice-cheshire','smoke-dragon','smoke-crocodile']);
  assert.deepEqual(graph.trail('telescope-wizard').map(ref=>ref.id),['knight-helmets','star-wizard','telescope-wizard']);
  assert.deepEqual(graph.trail('christmas-cats').map(ref=>ref.id),['mermaid-cocktail-cat','christmas-cats']);
  assert.ok(graph.roots.has('lily-pads'));
});

test('image trails follow category ancestry without crossing sibling subjects',()=>{
  const graph=createDiscovery(collection);
  const categories=new Map(collection.categories.map(category=>[category.id,category]));
  function entrances(id){
    const category=categories.get(id);
    const ancestors=category.parents.length?entrances(category.parents[0]):[];
    return [...ancestors,category.coverRef||category.labelAnchor.ref];
  }
  for(const ref of collection.items){
    const expected=[...new Set([...entrances(ref.revealCategory),ref.id])];
    assert.deepEqual(graph.trail(ref.id).map(r=>r.id),expected,ref.id);
  }
  for(const id of ['wonderland-flower-garden','bread-and-butterflies','smoke-dragon']){
    assert.equal(graph.parent(id).id,'alice-cheshire');
  }
  assert.equal(graph.label('merry-bright-tree'),'Christmas');
});

test('future branches may deepen beyond the current collection without a fixed ceiling',()=>{
  const extended=structuredClone(collection),seed=extended.categories.find(c=>c.id==='wonderland-flowers');
  let parent=seed;
  for(let level=seed.labelDepth+1;level<=8;level++){
    const start=3.2+(level-1)*1.65;
    parent={...structuredClone(seed),id:'future-detail-'+level,parents:[parent.id],labelDepth:level,reveal:[start,start+.8],focusZoom:start+1.5};
    extended.categories.push(parent);
  }
  validateCollection(extended);
});

test('invalid image routes fail before replacing the visible board',()=>{
  for(const mutate of [
    c=>{delete c.items.find(r=>r.id==='pressed-clovers').discovery;},
    c=>{c.items.find(r=>r.id==='pressed-clovers').discovery.parent='missing-reference';},
    c=>{c.items.find(r=>r.id==='pressed-clovers').discovery.parent=null;},
    c=>{c.items.find(r=>r.id==='lucky-clovers').discovery={parent:'pressed-clovers',via:'loop'};},
  ]){
    const invalid=structuredClone(collection);mutate(invalid);assert.throws(()=>validateCollection(invalid));
  }
});

test('removing parents or starting images repairs routes without changing any user notes',()=>{
  const before=structuredClone(collection);
  const removals=[...collection.items.map(ref=>[ref.id]),['pink-elephant','pinto-pink','painted-disney','blue-muppets','lucky-clovers'],collection.items.map(ref=>ref.id)];
  for(const removed of removals){
    const draft=emptyDraft();draft.removed=removed;
    const next=applyDraft(collection,draft);validateCollection(next);
    const graph=createDiscovery(next);
    for(const ref of next.items){
      assert.ok(graph.roots.has(graph.trail(ref.id)[0].id));
      assert.equal(ref.note,collection.items.find(source=>source.id===ref.id).note);
    }
  }
  assert.deepEqual(collection,before);
});
