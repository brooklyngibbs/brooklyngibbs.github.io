// Spatial relationships use declared categories and motifs, never the legacy
// placement bucket or a loose "related picture" recommendation.
export function createRelationships(collection){
  const categories=new Map(collection.categories.map(category=>[category.id,category]));
  const ancestors=id=>new Set((categories.get(id)?.parents||[]).flatMap(parent=>[parent,...ancestors(parent)]));
  const parents=new Map([...categories.keys()].map(id=>[id,ancestors(id)]));
  const membership=new Map(),specific=new Map(),counts=new Map();
  for(const ref of collection.items){
    const direct=new Set(ref.themes||[]);
    for(const category of categories.values()){
      if((category.refs||[]).includes(ref.id)||(category.groups||[]).includes(ref.group)||(category.themes||[]).some(theme=>direct.has(theme)))direct.add(category.id);
    }
    const all=new Set(direct),narrow=new Set(direct);
    for(const id of direct)for(const parent of parents.get(id)||[]){all.add(parent);narrow.delete(parent);}
    membership.set(ref.id,all);specific.set(ref.id,narrow);
    for(const id of narrow)counts.set(id,(counts.get(id)||0)+1);
  }
  const cache=new Map();
  return (a,b)=>{
    const key=[a.id,b.id].sort().join('|');if(cache.has(key))return cache.get(key);
    const shared=[...membership.get(a.id)].filter(id=>membership.get(b.id).has(id));
    const close=shared.filter(id=>specific.get(a.id).has(id)&&specific.get(b.id).has(id));
    const strength=close.reduce((sum,id)=>sum+1/Math.sqrt(counts.get(id)),0);
    const relationship={shared,close,strength:strength||(shared.length?.06:0),gap:close.length?4:shared.length?32:76};
    cache.set(key,relationship);return relationship;
  };
}
