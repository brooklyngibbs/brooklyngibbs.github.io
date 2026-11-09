import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createConnections,projectConnections,connectionCurve} from './connections.mjs';
import {applyDraft,emptyDraft} from './drafts.mjs';

const collection=JSON.parse(readFileSync(new URL('./collection.json',import.meta.url)));

test('lines expose real routes and shared categories without connecting unrelated seeds',()=>{
  const graph=createConnections(collection);
  const paths=graph.edges.filter(edge=>edge.kind==='path');
  assert.ok(paths.length>0);
  for(const edge of paths)assert.equal(graph.refs.get(edge.b).discovery.parent,edge.a);
  for(const edge of graph.edges)assert.notEqual(graph.refs.get(edge.a).revealCategory,graph.refs.get(edge.b).revealCategory,'Same-subject pictures do not need a line');
  for(const edge of graph.edges.filter(edge=>edge.kind==='overlap'))for(const id of edge.categories){
    const category=graph.categories.get(id);
    assert.equal(edge.a,category.coverRef||category.labelAnchor.ref);
    assert.ok(graph.members.get(id).has(edge.b));
  }
  const jem=graph.edges.filter(edge=>[edge.a,edge.b].includes('jem'));
  assert.equal(jem.length,1);
  assert.ok(jem[0].categories.has('hot-pink'));
  assert.ok(!graph.edges.some(edge=>[edge.a,edge.b].includes('daft-punk-graffiti')),'a music mention alone is not a shared category');
});

test('Star Trek and clovers have no internal lines, while their crossovers remain',()=>{
  const graph=createConnections(collection);
  for(const visible of [()=>true,id=>['made-of-stardust','lucky-clovers','hot-pink-desire'].includes(id)]){
    const lines=projectConnections(graph,visible);
    for(const edge of lines){
      assert.notEqual(graph.refs.get(edge.a).revealCategory,graph.refs.get(edge.b).revealCategory);
      assert.ok(!(edge.a.includes('clovers')&&edge.b.includes('clovers')));
    }
  }
  assert.ok(graph.edges.some(edge=>edge.categories.has('vivid-blue')&&[edge.a,edge.b].includes('star-trek-blue')));
  assert.ok(graph.edges.some(edge=>edge.categories.has('night-skies')&&[edge.a,edge.b].includes('final-frontier')));
});

test('overview aggregates hidden overlaps, with specific endpoints returning at depth',()=>{
  const graph=createConnections(collection),covers=new Set(collection.categories.filter(c=>c.kind==='main').map(c=>c.coverRef));
  const overview=projectConnections(graph,id=>covers.has(id),{type:'image',id:'jem'});
  assert.ok(overview.length>0);
  assert.equal(new Set(overview.map(edge=>[edge.kind,...[edge.a,edge.b].sort()].join('|'))).size,overview.length);
  for(const edge of overview){assert.ok(covers.has(edge.a)&&covers.has(edge.b));assert.notEqual(edge.a,edge.b);}
  const active=overview.filter(edge=>edge.active);
  assert.equal(active.length,1);
  assert.deepEqual(new Set([active[0].a,active[0].b]),new Set(['hot-pink-desire','jem']));
  const detailed=projectConnections(graph,()=>true,{type:'category',id:'hot-pink'});
  assert.ok(detailed.some(edge=>edge.active&&[edge.a,edge.b].includes('hot-pink-desire')&&[edge.a,edge.b].includes('jem')));
  assert.ok(detailed.some(edge=>edge.active&&[edge.a,edge.b].includes('hot-pink-desire')&&[edge.a,edge.b].includes('pink-star-pattern')));
  assert.deepEqual(projectConnections(graph,()=>false),[]);
});

test('removals repair lines without stale endpoints or changes to personal notes',()=>{
  const before=structuredClone(collection),draft=emptyDraft();
  draft.removed=['pink-star-pattern','make-believe-castles','blue-muppets'];
  const next=applyDraft(collection,draft),graph=createConnections(next);
  for(const edge of projectConnections(graph,()=>true)){
    assert.ok(graph.refs.has(edge.a)&&graph.refs.has(edge.b));
    assert.ok(!draft.removed.includes(edge.a)&&!draft.removed.includes(edge.b));
  }
  draft.removed=collection.items.map(ref=>ref.id);
  assert.deepEqual(createConnections(applyDraft(collection,draft)).edges,[]);
  assert.deepEqual(collection,before);
});

test('a thousand shared references use spokes rather than a quadratic web',()=>{
  const items=Array.from({length:1000},(_,i)=>({id:'image-'+i,group:'world',themes:[],revealCategory:'world',discovery:{parent:i?'image-0':null,via:'World'}}));
  items.push({id:'pink',themes:[],revealCategory:'color',discovery:{parent:null}});
  const graph=createConnections({items,categories:[{id:'world',kind:'main',parents:[],coverRef:'image-0',refs:items.slice(0,1000).map(r=>r.id)},{id:'color',name:'Pink',kind:'main',parents:[],coverRef:'pink',refs:items.map(r=>r.id)}]});
  assert.equal(graph.edges.length,1000);
  assert.equal(projectConnections(graph,id=>id==='image-0'||id==='pink').length,1);
});

test('line endpoints stop outside photos and handle coincident positions',()=>{
  const a={x:0,y:0,w:40,h:60},b={x:100,y:0,w:20,h:40};
  const curve=connectionCurve(a,b);
  assert.equal(curve.x1,24);assert.equal(curve.x2,86);
  assert.equal(connectionCurve(a,a),null);
  assert.equal(connectionCurve(a,{...b,x:10}),null);
});
