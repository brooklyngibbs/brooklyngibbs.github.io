// Local curation is stored separately from the imported Pinterest collection.
export const emptyDraft=()=>({version:1,removed:[],added:[],notes:{}});

export function applyDraft(base,draft=emptyDraft()){
  const collection=structuredClone(base),removed=new Set(draft.removed);
  const original=new Map(collection.items.map(ref=>[ref.id,ref]));
  collection.items=[...collection.items,...structuredClone(draft.added)].filter(ref=>!removed.has(ref.id));
  const ids=new Set(collection.items.map(ref=>ref.id));
  for(const ref of collection.items){
    ref.related=(ref.related||[]).filter(id=>ids.has(id));
    if(Object.hasOwn(draft.notes,ref.id)){
      ref.note=draft.notes[ref.id];
      if(ref.note.trim())ref.noteAuthor='user';else delete ref.noteAuthor;
    }
  }
  for(const category of collection.categories){
    category.refs=[...(category.refs||[]).filter(id=>ids.has(id)),...collection.items.filter(ref=>ref.categoryIds?.includes(category.id)).map(ref=>ref.id)];
  }
  const members=new Map();
  function collect(category){
    if(members.has(category.id))return members.get(category.id);
    const found=new Set(collection.items.filter(ref=>category.refs.includes(ref.id)||(category.themes||[]).some(theme=>ref.themes.includes(theme))||(category.groups||[]).includes(ref.group)).map(ref=>ref.id));
    for(const child of collection.categories.filter(child=>child.parents?.includes(category.id)))for(const id of collect(child))found.add(id);
    members.set(category.id,found);return found;
  }
  for(const category of collection.categories)collect(category);
  collection.categories=collection.categories.filter(category=>members.get(category.id).size);
  const categories=new Set(collection.categories.map(category=>category.id));
  for(const category of collection.categories){
    const fallback=[...members.get(category.id)][0];
    if(category.kind==='main'&&!ids.has(category.coverRef))category.coverRef=fallback;
    if(category.labelAnchor){
      if(!ids.has(category.labelAnchor.ref))category.labelAnchor.ref=category.coverRef||fallback;
      if(category.labelAnchor.mobileRef&&!ids.has(category.labelAnchor.mobileRef))category.labelAnchor.mobileRef=category.labelAnchor.ref;
    }
    category.parents=(category.parents||[]).filter(id=>categories.has(id));
    category.crossovers=(category.crossovers||[]).filter(id=>categories.has(id));
    if(category.layoutBetween?.some(id=>!categories.has(id)))delete category.layoutBetween;
  }
  if(collection.schemaVersion>=3){
    const covers=new Set(collection.categories.filter(c=>c.kind==='main').map(c=>c.coverRef));
    const oldRoots=new Map(base.categories.filter(c=>c.kind==='main').map(c=>[c.coverRef,c.id]));
    for(const ref of collection.items){
      if(covers.has(ref.id)){ref.discovery={parent:null};continue;}
      let parent=ref.discovery?.parent,skipped=false;
      const seen=new Set([ref.id]);
      while(parent&&!ids.has(parent)&&!seen.has(parent)){seen.add(parent);skipped=true;parent=original.get(parent)?.discovery?.parent;}
      if(!parent||parent===ref.id){
        let ancestor=original.get(ref.id),visited=new Set();
        while(ancestor?.discovery?.parent&&!visited.has(ancestor.id)){visited.add(ancestor.id);ancestor=original.get(ancestor.discovery.parent);}
        const category=collection.categories.find(c=>c.id===oldRoots.get(ancestor?.id))||collection.categories.find(c=>c.kind==='main'&&c.id===ref.group)||collection.categories.find(c=>c.kind==='main');
        parent=category?.coverRef;skipped=true;
      }
      if(parent)ref.discovery={parent,via:skipped?'Earlier in this branch':ref.discovery.via};
    }
  }
  return collection;
}

function openStore(){
  return new Promise((resolve,reject)=>{
    const request=indexedDB.open('brooklyn-taste-board',1);
    request.onupgradeneeded=()=>request.result.createObjectStore('drafts');
    request.onsuccess=()=>resolve(request.result);
    request.onerror=()=>reject(request.error);
  });
}
export async function readDraft(){
  const db=await openStore();
  return new Promise((resolve,reject)=>{
    const transaction=db.transaction('drafts','readonly'),request=transaction.objectStore('drafts').get('personal-links');
    transaction.oncomplete=()=>{db.close();resolve(request.result||emptyDraft());};
    transaction.onerror=()=>{db.close();reject(transaction.error);};
  });
}
export async function writeDraft(draft){
  const db=await openStore();
  return new Promise((resolve,reject)=>{
    const transaction=db.transaction('drafts','readwrite');
    transaction.objectStore('drafts').put(draft,'personal-links');
    transaction.oncomplete=()=>{db.close();resolve();};
    transaction.onerror=()=>{db.close();reject(transaction.error);};
    transaction.onabort=()=>{db.close();reject(transaction.error||new Error('Draft could not be saved.'));};
  });
}
