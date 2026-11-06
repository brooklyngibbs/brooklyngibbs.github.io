import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {isLocalPreview,validateCollection,readCollection} from './collection.mjs';

const collection=JSON.parse(readFileSync(new URL('./collection.json',import.meta.url)));

test('editing controls are limited to loopback previews',()=>{
  for(const host of ['localhost','127.0.0.1','[::1]','::1'])assert.equal(isLocalPreview(host),true);
  for(const host of ['brooklyngibbs.github.io','example.com','localhost.example.com','127.0.0.1.example.com','192.168.1.10',''])assert.equal(isLocalPreview(host),false);
});

test('validation accepts the entire collection without changing original quotes',()=>{
  const before=structuredClone(collection);
  assert.equal(validateCollection(collection),collection);
  assert.deepEqual(collection,before);
});

test('refresh reads the latest collection, including new images and memberships',async()=>{
  const original=structuredClone(collection);
  const next=structuredClone(collection);
  next.items.push({...next.items[0],id:'new-floral-reference',name:'New floral reference',slot:99,note:'My exact words.',noteAuthor:'user'});
  next.categories.find(category=>category.id==='florals').refs=['new-floral-reference'];
  let request;
  const result=await readCollection('/collection.json',async(url,options)=>{
    request={url,options};return {ok:true,json:async()=>next};
  });
  assert.equal(request.options.cache,'no-store');
  assert.equal(result.items.length,collection.items.length+1);
  assert.equal(result.items.at(-1).note,'My exact words.');
  assert.deepEqual(result.categories.find(category=>category.id==='florals').refs,['new-floral-reference']);
  assert.deepEqual(collection,original,'Refreshing must not modify the previous collection used by Undo');
});

test('invalid refreshed data is rejected before replacing a valid board',async()=>{
  await assert.rejects(readCollection('/collection.json',async()=>({ok:false})),/could not be loaded/);
  const duplicate=structuredClone(collection);duplicate.items.push(duplicate.items[0]);
  assert.throws(()=>validateCollection(duplicate),/unique ID/);
  const missing=structuredClone(collection);missing.categories[0].labelAnchor.ref='missing';
  assert.throws(()=>validateCollection(missing),/title anchor/);
  const cycle=structuredClone(collection);cycle.categories.find(category=>category.id==='alice').parents=['mirrors-glass'];
  assert.throws(()=>validateCollection(cycle),/loop/);
  const badImage=structuredClone(collection);badImage.items[0].w=0;
  assert.throws(()=>validateCollection(badImage),/image information/);
  assert.equal(validateCollection(collection),collection);
});

test('every subcategory connects to a main category through real parents',()=>{
  const byId=new Map(collection.categories.map(category=>[category.id,category]));
  const roots=id=>byId.get(id).parents.length?byId.get(id).parents.flatMap(roots):[id];
  assert.deepEqual(roots('wearable-lighting'),['surreal-styling']);
  assert.deepEqual(roots('bows-ribbon'),['surreal-styling']);
  for(const category of collection.categories)for(const id of roots(category.id)){
    assert.equal(byId.get(id).kind,'main');assert.ok(byId.get(id).coverRef);
  }
  const disconnected=structuredClone(collection);
  disconnected.categories.find(category=>category.id==='surreal-hats').parents=[];
  assert.throws(()=>validateCollection(disconnected),/Every subcategory needs a parent/);
  const coverless=structuredClone(collection);
  delete coverless.categories.find(category=>category.id==='surreal-styling').coverRef;
  assert.throws(()=>validateCollection(coverless),/Each main category needs its own cover/);
});
