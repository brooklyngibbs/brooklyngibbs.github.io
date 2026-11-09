// Sparse, evidence-backed lines. Category membership provides overlap spokes;
// we never invent every possible pair within a broad theme.
export function createConnections(collection){
  const refs=new Map(collection.items.map(ref=>[ref.id,ref]));
  const categories=new Map(collection.categories.map(category=>[category.id,category]));
  const paths=new Map();
  function ancestry(id){
    if(!paths.has(id))paths.set(id,new Set([id,...(categories.get(id)?.parents||[]).flatMap(parent=>[...ancestry(parent)])]));
    return paths.get(id);
  }
  const members=new Map(collection.categories.map(category=>[category.id,new Set()]));
  const edges=new Map();
  function add(a,b,kind,category,reason){
    if(a===b||!refs.has(a)||!refs.has(b))return;
    // Proximity already explains a shared subject. Lines are for the steps
    // between subjects and their secondary overlaps, not within one cluster.
    if(refs.get(a).revealCategory&&refs.get(a).revealCategory===refs.get(b).revealCategory)return;
    const key=[kind,...[a,b].sort()].join('|');
    if(!edges.has(key))edges.set(key,{a,b,kind,categories:new Set(),reasons:new Set()});
    const edge=edges.get(key);if(category)edge.categories.add(category);if(reason)edge.reasons.add(reason);
  }
  for(const ref of refs.values()){
    add(ref.discovery?.parent,ref.id,'path',ref.revealCategory,ref.discovery?.via);
    const primary=ancestry(ref.revealCategory);
    const direct=collection.categories.filter(category=>(category.refs||[]).includes(ref.id)||(category.groups||[]).includes(ref.group)||(category.themes||[]).some(theme=>(ref.themes||[]).includes(theme)));
    for(const category of direct)for(const id of ancestry(category.id))members.get(id)?.add(ref.id);
    const secondary=direct.filter(category=>!primary.has(category.id));
    for(const category of secondary){
      // A specific crossover supersedes its broad parent, keeping lines useful.
      if(secondary.some(other=>other.id!==category.id&&ancestry(other.id).has(category.id)))continue;
      add(category.coverRef||category.labelAnchor?.ref,ref.id,'overlap',category.id,category.name);
    }
  }
  return {edges:[...edges.values()],members,refs,categories};
}

// Before a deeper picture is revealed, its shared themes connect through its
// nearest revealed discovery ancestor. Panning never changes the endpoint.
export function projectConnections(graph,isRevealed,focus=null){
  const endpoints=new Map(),projected=new Map();
  function endpoint(id){
    if(endpoints.has(id))return endpoints.get(id);
    const trail=[],seen=new Set();let current=id;
    while(graph.refs.has(current)&&!seen.has(current)&&!isRevealed(current)){
      trail.push(current);seen.add(current);current=graph.refs.get(current).discovery?.parent;
    }
    const result=graph.refs.has(current)&&!seen.has(current)?current:null;
    for(const child of [...trail,id])endpoints.set(child,result);
    return result;
  }
  const focusedMembers=focus?.type==='category'?graph.members.get(focus.id):null;
  for(const edge of graph.edges){
    // Primary paths appear only with their actual photos; overlaps may summarize
    // a hidden branch at its existing entrance.
    if(edge.kind==='path'&&(!isRevealed(edge.a)||!isRevealed(edge.b)))continue;
    const a=endpoint(edge.a),b=endpoint(edge.b);if(!a||!b||a===b)continue;
    if(graph.refs.get(a).revealCategory===graph.refs.get(b).revealCategory)continue;
    const key=[edge.kind,...[a,b].sort()].join('|');
    if(!projected.has(key))projected.set(key,{a,b,kind:edge.kind,categories:new Set(),reasons:new Set(),active:false});
    const line=projected.get(key);
    for(const id of edge.categories)line.categories.add(id);
    for(const reason of edge.reasons)line.reasons.add(reason);
    line.active ||= focus?.type==='image'?(a===focus.id||b===focus.id||edge.a===focus.id||edge.b===focus.id):!!focusedMembers&&(focusedMembers.has(edge.a)||focusedMembers.has(edge.b)||edge.categories.has(focus.id));
  }
  return [...projected.values()];
}

// End at a photo's outside edge, leaving the image itself unobscured.
export function connectionCurve(a,b){
  const dx=b.x-a.x,dy=b.y-a.y,distance=Math.hypot(dx,dy);if(distance<1)return null;
  const ux=dx/distance,uy=dy/distance;
  const padding=point=>Math.min(ux?point.w/2/Math.abs(ux):Infinity,uy?point.h/2/Math.abs(uy):Infinity)+4;
  const start=padding(a),end=padding(b);if(start+end>=distance)return null;
  const bend=Math.min(36,distance*.09);
  return {x1:a.x+ux*start,y1:a.y+uy*start,cx:(a.x+b.x)/2-uy*bend,cy:(a.y+b.y)/2+ux*bend,x2:b.x-ux*end,y2:b.y-uy*end};
}
