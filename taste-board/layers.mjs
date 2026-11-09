// Presentation weights are revisable curation, not a numerical measure of taste.
// Recurrence counts unique references; explicit significance is recorded in the
// collection separately so one beloved reference is not mistaken for indifference.
export function createLayers(collection){
  const categories=new Map(collection.categories.map(c=>[c.id,c]));
  const categoryProfiles=new Map(),imageProfiles=new Map(),members=new Map();
  function evidence(id){
    if(members.has(id))return members.get(id);
    const c=categories.get(id),ids=new Set(collection.items.filter(ref=>ref.revealCategory===id||(c.refs||[]).includes(ref.id)||(c.groups||[]).includes(ref.group)||(c.themes||[]).some(t=>ref.themes.includes(t))).map(ref=>ref.id));
    for(const child of collection.categories.filter(child=>(child.parents||[]).includes(id)))for(const ref of evidence(child.id))ids.add(ref);
    members.set(id,ids);return ids;
  }
  function profile(id){
    if(categoryProfiles.has(id))return categoryProfiles.get(id);
    const c=categories.get(id),count=evidence(id).size;
    const parentLevel=Math.max(0,...(c.parents||[]).map(parent=>profile(parent).level));
    const emphasis=c.presentation?.emphasis;
    let level;
    if(!c.parents?.length)level=0;
    else if(emphasis==='signature')level=parentLevel+1;
    else if(emphasis==='recurring')level=Math.max(1,parentLevel);
    else level=parentLevel+(count>=4?1:1.6);
    const entry=c.coverRef||c.labelAnchor?.ref||evidence(id).values().next().value;
    // Depth controls when a reference appears. Keep image sizes within a
    // narrower range so the detail is recognizable at its reveal scale.
    let edge=Math.max(108,150-12*(level-1));
    if(level===0)edge=220+Math.min(24,count*2);
    else if(emphasis==='signature')edge=170+Math.min(20,count*2);
    edge=Math.round(edge*(c.presentation?.coverScale??1));
    const path=[...(c.parents?.length?profile(c.parents[0]).path:[]),id];
    const value={id,level,count,entry,edge,path,reveal:revealAt(level)};
    categoryProfiles.set(id,value);return value;
  }
  for(const c of collection.categories)profile(c.id);
  for(const ref of collection.items){
    const primary=categoryProfiles.get(ref.revealCategory);
    const level=(primary?.level||0)+1.2;
    imageProfiles.set(ref.id,{level,edge:Math.max(96,116-5*level),reveal:revealAt(level),opening:false});
  }
  for(const c of collection.categories){
    const p=categoryProfiles.get(c.id),image=imageProfiles.get(p.entry);if(!image)continue;
    image.level=Math.min(image.level,p.level);image.edge=Math.max(image.edge,p.edge);
    // Every independent path gets an opening cover, even with few references.
    if(p.level===0)image.opening=true;
    image.reveal=image.opening?[0,0]:revealAt(image.level);
  }
  return {categories:categoryProfiles,images:imageProfiles,members};
}

export function revealAt(level){
  if(level===0)return [0,0];
  const start=Math.pow(1.9,level);return [start,start*1.24];
}

// Relative zoom makes the same layers reachable on a narrow or wide viewport.
// Opacity is a pure function of zoom: no threshold flicker or accumulated drift.
export function layerOpacity(profile,relativeZoom){
  const [start,end]=profile.reveal;if(start===end)return 1;
  const t=Math.max(0,Math.min(1,(relativeZoom-start)/(end-start)));
  return t*t*(3-2*t);
}
