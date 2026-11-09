// Spatial relationships use declared categories and motifs, never the legacy
// placement bucket or a loose "related picture" recommendation.
export const categorySpacing={same:2,linked:4,related:8,separate:22,overview:30};

export function createRelationships(collection){
  const categories=new Map(collection.categories.map(category=>[category.id,category]));
  const ancestorCache=new Map();
  const ancestors=id=>{
    if(!ancestorCache.has(id))ancestorCache.set(id,new Set((categories.get(id)?.parents||[]).flatMap(parent=>[parent,...ancestors(parent)])));
    return ancestorCache.get(id);
  };
  const parents=new Map([...categories.keys()].map(id=>[id,ancestors(id)]));
  const declaredRefs=new Map(collection.categories.map(category=>[category.id,new Set(category.refs||[])]));
  const membership=new Map(),specific=new Map(),primaryPaths=new Map(),counts=new Map(),categoryCounts=new Map();
  for(const ref of collection.items){
    primaryPaths.set(ref.id,new Set([ref.revealCategory,...(parents.get(ref.revealCategory)||[])]));
    const direct=new Set(ref.themes||[]);
    for(const category of categories.values()){
      if(declaredRefs.get(category.id).has(ref.id)||(category.groups||[]).includes(ref.group)||(category.themes||[]).some(theme=>direct.has(theme)))direct.add(category.id);
    }
    const all=new Set(direct),narrow=new Set(direct);
    for(const id of direct)for(const parent of parents.get(id)||[]){all.add(parent);narrow.delete(parent);}
    membership.set(ref.id,all);specific.set(ref.id,narrow);
    for(const id of narrow)counts.set(id,(counts.get(id)||0)+1);
    for(const id of all)if(categories.has(id))categoryCounts.set(id,(categoryCounts.get(id)||0)+1);
  }
  const cache=new Map();
  const relationship=(a,b)=>{
    const key=[a.id,b.id].sort().join('|');if(cache.has(key))return cache.get(key);
    const shared=[...membership.get(a.id)].filter(id=>membership.get(b.id).has(id));
    const close=shared.filter(id=>specific.get(a.id).has(id)&&specific.get(b.id).has(id));
    const strength=close.reduce((sum,id)=>sum+1/Math.sqrt(counts.get(id)),0);
    // Secondary color and motif matches remain crossovers. Only shared primary
    // paths pull whole neighborhoods together; otherwise a star pattern could
    // pull a childhood-world reference out of its discovery branch.
    const categoryLinks=shared.filter(id=>categories.has(id)&&categories.get(id).kind!=='main'&&primaryPaths.get(a.id).has(id)&&primaryPaths.get(b.id).has(id));
    const specificLinks=categoryLinks.filter(id=>!categoryLinks.some(other=>parents.get(other).has(id)));
    const cohesion=specificLinks.reduce((sum,id)=>sum+1/Math.max(1,categoryCounts.get(id)-1),0);
    const connected=a.discovery?.parent===b.id||b.discovery?.parent===a.id;
    const sameSubject=!!a.revealCategory&&a.revealCategory===b.revealCategory;
    const relationship={shared,close,cohesion:cohesion+(connected?.8:0),strength:strength+(connected?.6:0)||(shared.length?.06:0),gap:sameSubject?categorySpacing.same:connected||close.length?categorySpacing.linked:shared.length?categorySpacing.related:categorySpacing.separate};
    cache.set(key,relationship);return relationship;
  };
  // Whole clusters can be compared without constructing every image pair.
  relationship.commonMembership=refs=>{
    const common=key=>new Set([...(key.get(refs[0]?.id)||[])].filter(id=>refs.every(ref=>key.get(ref.id).has(id))));
    return {all:common(membership),specific:common(specific),primary:refs.every(ref=>ref.revealCategory===refs[0]?.revealCategory)?refs[0]?.revealCategory:null};
  };
  relationship.clusterGap=(a,b)=>a.primary&&a.primary===b.primary?categorySpacing.same:[...a.specific].some(id=>b.specific.has(id))?categorySpacing.linked:[...a.all].some(id=>b.all.has(id))?categorySpacing.related:categorySpacing.separate;
  // Give each small category a stable neighborhood within its parent area.
  // Each reference starts in its curated primary neighborhood. Additional
  // motifs remain crossovers; the spacing pass reserves every photo and title.
  relationship.placeClusters=nodes=>{
    const centers=new Map(),byId=new Map(nodes.map(node=>[node.ref.id,node]));
    const center=id=>{
      if(centers.has(id))return centers.get(id);
      const category=categories.get(id),cover=byId.get(category.coverRef);
      let point;
      if(cover)point={x:cover.x-cover.bounds.offsetX,y:cover.y-cover.bounds.offsetY};
      else {
        const anchors=(category.layoutBetween||category.parents||[]).map(center);
        point={x:anchors.reduce((sum,p)=>sum+p.x,0)/anchors.length+(category.layoutOffset?.[0]||0)*.55,y:anchors.reduce((sum,p)=>sum+p.y,0)/anchors.length+(category.layoutOffset?.[1]||0)*.55};
      }
      centers.set(id,point);return point;
    };
    const sizes=new Map([...categories.keys()].map(id=>[id,nodes.filter(node=>membership.get(node.ref.id).has(id)).length]));
    const primaryPath=id=>categories.get(id)?.parents?.length?[...primaryPath(categories.get(id).parents[0]),id]:[id];
    for(const node of nodes){
      const all=[...membership.get(node.ref.id)].filter(id=>categories.has(id));
      const leaf=all.filter(id=>!all.some(other=>parents.get(other).has(id)));
      const primary=categories.has(node.ref.revealCategory)?node.ref.revealCategory:[...leaf].sort((a,b)=>sizes.get(a)-sizes.get(b)||parents.get(b).size-parents.get(a).size||a.localeCompare(b))[0];
      node.clusterId=primary;node.clusterPriority=sizes.get(primary)||Infinity;
      // Primary ancestry owns space; secondary palette matches remain links.
      node.clusterPath=primary?primaryPath(primary):[node.ref.group||node.ref.id];
      node.clusterGap=categorySpacing.same;
      if(node.isCover)continue;
      const targets=primary?[center(primary)]:leaf.map(center);
      if(!targets.length)continue;
      node.x=targets.reduce((sum,p)=>sum+p.x,0)/targets.length+node.bounds.offsetX;
      node.y=targets.reduce((sum,p)=>sum+p.y,0)/targets.length+node.bounds.offsetY;
    }
  };
  return relationship;
}
