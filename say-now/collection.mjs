export function isLocalPreview(hostname){
  return ['localhost','127.0.0.1','[::1]','::1'].includes(hostname);
}

// Check a refreshed collection before replacing the board that is on screen.
export function validateCollection(collection){
  const fail=message=>{throw new Error(message);};
  const pair=value=>Array.isArray(value)&&value.length===2&&value.every(Number.isFinite);
  const strings=value=>Array.isArray(value)&&value.every(item=>typeof item==='string');
  if(!collection||!Array.isArray(collection.items)||!collection.items.length||!Array.isArray(collection.categories)||!collection.groups)fail('The collection is incomplete.');
  const refs=new Map(),categories=new Map(collection.categories.map(category=>[category.id,category]));
  if(categories.size!==collection.categories.length)fail('Category IDs must be unique.');
  for(const [id,group] of Object.entries(collection.groups)){
    if(!pair(group.center)||!pair(group.mobileCenter)||!Array.isArray(group.slots)||!group.slots.every(pair))fail('Check the placement information for '+id+'.');
  }
  for(const ref of collection.items){
    if(!ref.id||refs.has(ref.id))fail('Every image needs a unique ID.');
    if(typeof ref.name!=='string'||typeof ref.src!=='string'||!collection.groups[ref.group]||!strings(ref.themes)||![ref.w,ref.h].every(value=>Number.isFinite(value)&&value>0)||!Number.isFinite(ref.angle)||!Number.isFinite(ref.tier))fail('Check the image information for '+ref.id+'.');
    refs.set(ref.id,ref);
  }
  for(const category of collection.categories){
    if(!category.id||typeof category.name!=='string'||!pair(category.reveal)||!Number.isFinite(category.focusZoom))fail('Check the category information for '+category.id+'.');
    if(category.labelDepth!==undefined&&(!Number.isInteger(category.labelDepth)||category.labelDepth<0||category.labelDepth>3))fail('Check the title size level for '+category.id+'.');
    if(category.kind==='main'){
      if((category.parents||[]).length||!category.coverRef)fail('Each main category needs its own cover and no parent.');
    }else if(!(category.parents||[]).length)fail('Every subcategory needs a parent category: '+category.id+'.');
    for(const key of ['parents','crossovers']){
      if(category[key]&&(!strings(category[key])||category[key].some(id=>!categories.has(id))))fail('Check the category links for '+category.id+'.');
    }
    for(const key of ['refs','themes','groups'])if(category[key]&&!strings(category[key]))fail('Check the memberships for '+category.id+'.');
    if((category.refs||[]).some(id=>!refs.has(id))||(category.groups||[]).some(id=>!collection.groups[id]))fail('A category refers to a missing image or group.');
    const anchor=category.labelAnchor;
    if(category.coverRef&&!refs.has(category.coverRef))fail('A category cover is missing.');
    if(anchor&&(!refs.has(anchor.ref)||!pair(anchor.offset)||(anchor.mobileRef&&!refs.has(anchor.mobileRef))||(anchor.mobileOffset&&!pair(anchor.mobileOffset))))fail('Check the title anchor for '+category.id+'.');
  }
  for(const ref of refs.values())if(ref.revealCategory&&!categories.has(ref.revealCategory))fail('An image refers to a missing category.');
  const complete=new Set(),active=new Set();
  function visit(id){
    if(active.has(id))fail('Category parents contain a loop.');if(complete.has(id))return;
    active.add(id);for(const parent of categories.get(id).parents||[])visit(parent);active.delete(id);complete.add(id);
  }
  for(const id of categories.keys())visit(id);
  return collection;
}

export async function readCollection(url,fetcher=fetch){
  const response=await fetcher(url,{cache:'no-store'});
  if(!response.ok)throw new Error('The collection could not be loaded.');
  return validateCollection(await response.json());
}
