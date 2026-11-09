// A revisable route through the references, separate from the user's notes.
// Primary links give every image a way home; related links retain crossovers.
export function createDiscovery(collection){
  const refs=new Map(collection.items.map(ref=>[ref.id,ref]));
  const roots=new Map(collection.categories.filter(c=>c.kind==='main').map(c=>[c.coverRef,c]));
  const children=new Map(collection.items.map(ref=>[ref.id,[]]));
  for(const ref of refs.values())if(ref.discovery?.parent&&children.has(ref.discovery.parent))children.get(ref.discovery.parent).push(ref);
  const categories=new Map(collection.categories.map(category=>[category.id,category]));
  const label=id=>{
    const ref=refs.get(id),category=categories.get(ref?.revealCategory);
    if(category?.labelAnchor?.ref===id)return category.name;
    return roots.get(id)?.name||ref?.name||'';
  };
  const trail=id=>{
    const path=[],seen=new Set();
    while(refs.has(id)&&!seen.has(id)){seen.add(id);path.unshift(refs.get(id));id=refs.get(id).discovery?.parent;}
    return path;
  };
  return {roots,label,trail,children:id=>children.get(id)||[],parent:id=>refs.get(refs.get(id)?.discovery?.parent)||null};
}
