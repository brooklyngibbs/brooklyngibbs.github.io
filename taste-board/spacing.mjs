// Include tilted corners and the small hover lift in each photo's protected area.
export function photoBounds(width,height,angle){
  const radians=Math.abs(angle)*Math.PI/180,c=Math.cos(radians),s=Math.sin(radians);
  return {w:width*c+height*s+4,h:height*c+width*s+8};
}

// Lay out the world once. When relationships are supplied, grow from the
// strongest shared categories and motifs; crossover images seek their shared
// neighbors. Unrelated photos must leave a wider gap even if a slot is empty.
export function keepPhotosApart(photos,zones,{x='x',y='y',gap=28,groupGap=44,relationship,preserveTargets=false}={}){
  const placed=zones.map(zone=>({x:zone.x+zone.w/2,y:zone.y+zone.h/2,w:zone.w,h:zone.h,label:true}));
  const pending=[...photos].sort((a,b)=>Number(!!b.isCover)-Number(!!a.isCover)||(preserveTargets?(a.clusterPriority-b.clusterPriority||(a.clusterId||'').localeCompare(b.clusterId||'')):0)||a.ref.tier-b.ref.tier||a.index-b.index);
  while(pending.length){
    let next=0;
    if(relationship&&!preserveTargets&&!pending[0].isCover){
      let strongest=-1;
      for(const [index,photo] of pending.entries()){
        const strength=Math.max(0,...placed.filter(other=>other.ref).map(other=>relationship(photo.ref,other.ref).strength));
        if(strength>strongest){strongest=strength;next=index;}
      }
    }
    const [photo]=pending.splice(next,1);
    let originalX=photo[x],originalY=photo[y];
    const w=photo.bounds.w,h=photo.bounds.h;
    const clusterPeers=preserveTargets&&photo.clusterId?placed.filter(other=>other.clusterId===photo.clusterId):[];
    if(clusterPeers.length){
      originalX=originalX*.15+clusterPeers.reduce((sum,other)=>sum+other.x,0)/clusterPeers.length*.85;
      originalY=originalY*.15+clusterPeers.reduce((sum,other)=>sum+other.y,0)/clusterPeers.length*.85;
    }
    const peers=relationship&&!preserveTargets&&!photo.isCover?placed.filter(other=>other.ref).map(other=>({other,strength:relationship(photo.ref,other.ref).strength})):[];
    const strongest=Math.max(0,...peers.map(peer=>peer.strength));
    const neighbors=peers.filter(peer=>peer.strength>0&&peer.strength>=strongest*.6);
    if(neighbors.length){
      const weight=neighbors.reduce((sum,peer)=>sum+peer.strength,0);
      originalX=neighbors.reduce((sum,peer)=>sum+peer.other.x*peer.strength,0)/weight;
      originalY=neighbors.reduce((sum,peer)=>sum+peer.other.y*peer.strength,0)/weight;
    }
    // A crossover can occupy the space between its main areas without making
    // every reference a member of both. Keep local relationships and clearance.
    const anchors=!photo.isCover&&!preserveTargets&&photo.placementAnchors?.map(id=>placed.find(other=>other.ref?.id===id));
    if(anchors?.length&&anchors.every(Boolean)){
      const centerX=anchors.reduce((sum,anchor)=>sum+anchor.x,0)/anchors.length;
      const centerY=anchors.reduce((sum,anchor)=>sum+anchor.y,0)/anchors.length;
      originalX=originalX*.2+centerX*.8;
      originalY=originalY*.2+centerY*.8;
    }
    const padding=other=>other.label?18:relationship?relationship(photo.ref,other.ref).gap:other.group===photo.ref.group?gap:groupGap;
    const clear=(cx,cy)=>placed.every(other=>Math.abs(cx-other.x)>=(w+other.w)/2+padding(other)-.001||Math.abs(cy-other.y)>=(h+other.h)/2+padding(other)-.001);
    photo[x]=originalX;photo[y]=originalY;
    if(!clear(originalX,originalY)){
      let best=null,bestDistance=Infinity;
      for(const other of placed){
        const dx=(w+other.w)/2+padding(other),dy=(h+other.h)/2+padding(other);
        const candidates=[[other.x-dx,originalY],[other.x+dx,originalY],[originalX,other.y-dy],[originalX,other.y+dy]];
        if(relationship)candidates.push([other.x-dx,other.y],[other.x+dx,other.y],[other.x,other.y-dy],[other.x,other.y+dy]);
        for(const [cx,cy] of candidates){
          const distance=(cx-originalX)**2+(cy-originalY)**2;
          if(distance<bestDistance&&clear(cx,cy)){best={x:cx,y:cy};bestDistance=distance;}
        }
      }
      // An outside edge of the finite placed set always provides a clear position.
      photo[x]=best.x;photo[y]=best.y;
    }
    placed.push({x:photo[x],y:photo[y],w,h,group:photo.ref.group,ref:photo.ref,clusterId:photo.clusterId});
  }
}

function packClusters(nodes,spacing){
  if(nodes.every(node=>node.clusterPath?.length))packNeighborhoods(nodes,spacing);
  else keepPhotosApart(nodes,[],{...spacing,preserveTargets:true});
}

// Pack from the smallest primary category outward. Each parent owns a compact
// region containing its children; hidden references never spill into another
// starting area's space. This is computed once, not on camera movement.
function packNeighborhoods(nodes,spacing){
  const {relationship}=spacing;
  const signature=group=>relationship.commonMembership(group.map(n=>n.ref));
  const gapBetween=(a,b)=>relationship.clusterGap(a.signature,b.signature);
  const bounds=blocks=>({
    left:Math.min(...blocks.map(b=>b.x-b.w/2)),right:Math.max(...blocks.map(b=>b.x+b.w/2)),
    top:Math.min(...blocks.map(b=>b.y-b.h/2)),bottom:Math.max(...blocks.map(b=>b.y+b.h/2))
  });
  const translate=(block,x,y)=>{for(const node of block.nodes){node.x+=x;node.y+=y;}};
  function photoBlock(group){
    const sig=signature(group),gap=Math.max(relationship.clusterGap(sig,sig),...group.map(n=>n.clusterGap||0));
    const area=group.reduce((sum,n)=>sum+(n.bounds.w+gap)*(n.bounds.h+gap),0);
    const rowWidth=Math.max(...group.map(n=>n.bounds.w),Math.sqrt(area)*1.25),rows=[];
    // Put a below-photo title at the bottom edge of its small cluster rather
    // than reserving an empty caption-sized strip between same-subject photos.
    for(const node of [...group].sort((a,b)=>Number(!!b.isCover)-Number(!!a.isCover)||Math.sign(a.bounds.offsetY)-Math.sign(b.bounds.offsetY)||b.bounds.h-a.bounds.h||a.index-b.index)){
      // Fill forward so a trailing caption never backfills an earlier row and
      // pushes another photo below its text.
      let row=rows.at(-1);if(row&&row.w+gap+node.bounds.w>rowWidth)row=null;
      if(!row){row={nodes:[],w:0,h:node.bounds.h};rows.push(row);}
      node.x=row.w+(row.nodes.length?gap:0)+node.bounds.w/2;
      row.w=node.x+node.bounds.w/2;row.h=Math.max(row.h,node.bounds.h);row.nodes.push(node);
    }
    const w=Math.max(...rows.map(r=>r.w)),h=rows.reduce((s,r)=>s+r.h,0)+gap*(rows.length-1);
    let y=-h/2;
    for(const row of rows){for(const node of row.nodes){node.x-=row.w/2;node.y=y+node.bounds.h/2;}y+=row.h+gap;}
    return {nodes:group,w,h,signature:sig};
  }
  function combine(blocks){
    const placed=[];
    for(const block of blocks){
      let best={x:0,y:0},cost=Infinity;
      const candidates=[[0,0]];
      for(const other of placed){
        const dx=(block.w+other.w)/2+gapBetween(block,other),dy=(block.h+other.h)/2+gapBetween(block,other);
        for(const x of [other.x-dx,other.x,other.x+dx])for(const y of [other.y-dy,other.y,other.y+dy])candidates.push([x,y]);
      }
      if(placed.length){
        const b=bounds(placed),gap=Math.max(...placed.map(other=>gapBetween(block,other)));
        candidates.push([b.left-gap-block.w/2,0],[b.right+gap+block.w/2,0],[0,b.top-gap-block.h/2],[0,b.bottom+gap+block.h/2]);
      }
      for(const [x,y] of candidates){
        if(placed.some(other=>Math.abs(x-other.x)<(block.w+other.w)/2+gapBetween(block,other)-.001&&Math.abs(y-other.y)<(block.h+other.h)/2+gapBetween(block,other)-.001))continue;
        const b=bounds([...placed,{...block,x,y}]),w=b.right-b.left,h=b.bottom-b.top;
        const next=w*h+.65*(w-h)**2+.04*(x*x+y*y);
        if(next<cost){cost=next;best={x,y};}
      }
      translate(block,best.x,best.y);placed.push({...block,...best});
    }
    const b=bounds(placed),all=blocks.flatMap(block=>block.nodes),cx=(b.left+b.right)/2,cy=(b.top+b.bottom)/2;
    for(const node of all){node.x-=cx;node.y-=cy;}
    return {nodes:all,w:b.right-b.left,h:b.bottom-b.top,signature:signature(all)};
  }
  const forest=new Map();
  for(const node of nodes){
    let level=forest,branch;
    for(const id of node.clusterPath){
      if(!level.has(id))level.set(id,{id,nodes:[],children:new Map()});
      branch=level.get(id);level=branch.children;
    }
    branch.nodes.push(node);
  }
  function build(branch){
    const blocks=[];
    // A cover and its same-subject pictures form one small cluster, including
    // independent seeds such as the two clover references.
    if(branch.nodes.length)blocks.push(photoBlock(branch.nodes));
    const children=[...branch.children.values()].map(build);
    // Pack the smaller neighborhoods together beside a large opening cover.
    // Placing each child against the cover would spread them around its perimeter.
    if(children.length>1&&branch.nodes.some(node=>node.isCover))blocks.push(combine(children));
    else blocks.push(...children);
    return blocks.length===1?blocks[0]:combine(blocks);
  }
  const regions=[...forest.values()].map(build).sort((a,b)=>{
    const order=block=>Math.min(...block.nodes.filter(n=>n.isCover).map(n=>n.coverOrder??n.index));
    return order(a)-order(b);
  });
  const gap=Math.max(spacing.groupGap||0,...regions.flatMap((a,i)=>regions.slice(i+1).map(b=>gapBetween(a,b))));
  const v=spacing.viewport||{left:0,top:0,right:1100,bottom:760};
  let chosen,bestFit=-1,bestArea=Infinity;
  for(let columns=1;columns<=regions.length;columns++){
    const rows=[];
    for(let i=0;i<regions.length;i+=columns){const blocks=regions.slice(i,i+columns);rows.push({blocks,w:blocks.reduce((s,b)=>s+b.w,0)+gap*(blocks.length-1),h:Math.max(...blocks.map(b=>b.h))});}
    const w=Math.max(...rows.map(r=>r.w)),h=rows.reduce((s,r)=>s+r.h,0)+gap*(rows.length-1);
    const fit=Math.min((v.right-v.left)/w,(v.bottom-v.top)/h),area=w*h;
    if(fit>bestFit+.00001||(Math.abs(fit-bestFit)<.00001&&area<bestArea)){chosen={rows,w,h};bestFit=fit;bestArea=area;}
  }
  if(!chosen)return;
  let y=(v.top+v.bottom-chosen.h)/2;
  for(const row of chosen.rows){
    let x=(v.left+v.right-row.w)/2;
    for(const block of row.blocks){translate(block,x+block.w/2,y+row.h/2);x+=block.w+gap;}
    y+=row.h+gap;
  }
}

// Reserve every photo and title before the first frame, including hidden layers.
// Camera movement never changes this layout or the order of the photos.
export function createWorldLayout(photos,labels,spacing){
  const nodes=photos.map(photo=>({...photo,bounds:{...photo.bounds}}));
  const anchors=new Map();
  for(const node of nodes){
    const attached=labels.filter(label=>label.refId===node.ref.id);
    const photoHeight=node.bounds.h;
    let left=-node.bounds.w/2,right=node.bounds.w/2,top=-photoHeight/2,bottom=photoHeight/2;
    for(const side of [-1,1]){
      let edge=photoHeight/2+(spacing.labelGap??18);
      const stack=attached.filter(label=>(label.offset[1]<0?-1:1)===side).sort((a,b)=>b.depth-a.depth);
      for(const label of stack){
        const offset={x:label.offset[0],y:side*(edge+label.h/2)};
        anchors.set(label.id,{refId:node.ref.id,...offset,w:label.w,h:label.h});
        left=Math.min(left,offset.x-label.w/2);right=Math.max(right,offset.x+label.w/2);
        top=Math.min(top,offset.y-label.h/2);bottom=Math.max(bottom,offset.y+label.h/2);
        edge+=label.h+(spacing.labelStackGap??12);
      }
    }
    // Reserve only the side occupied by a title, not a matching empty area
    // across the photo. Pack the whole tile, then restore the photo's anchor.
    node.bounds={w:right-left,h:bottom-top,offsetX:(left+right)/2,offsetY:(top+bottom)/2};
    node.x+=node.bounds.offsetX;node.y+=node.bounds.offsetY;
    if(node.isCover&&spacing.viewport){
      const {left,right,top,bottom}=spacing.viewport;
      const fit=(value,min,max)=>min<=max?Math.max(min,Math.min(max,value)):(min+max)/2;
      node.x=fit(node.x,left+node.bounds.w/2,right-node.bounds.w/2);
      node.y=fit(node.y,top+node.bounds.h/2,bottom-node.bounds.h/2);
    }
  }
  // Reserve a visible overview for all main areas before their neighborhoods
  // grow around them. These anchors remain fixed when deeper layers appear.
  const covers=nodes.filter(node=>node.isCover).sort((a,b)=>(a.coverOrder??a.index)-(b.coverOrder??b.index));
  if(spacing.viewport&&covers.length>1&&!spacing.relationship?.placeClusters){
    const {left,right,top,bottom}=spacing.viewport;
    const coverGap=Math.max(spacing.groupGap??26,...covers.flatMap((a,i)=>covers.slice(i+1).map(b=>spacing.relationship?spacing.relationship(a.ref,b.ref).gap:spacing.groupGap??26)));
    let bestRows,bestHeight=0,bestFit=-1,bestFill=-1;
    for(let columns=covers.length;columns>=1;columns--){
      const rows=[];
      for(let i=0;i<covers.length;i+=columns){
        const row=covers.slice(i,i+columns);
        rows.push({nodes:row,w:row.reduce((sum,node)=>sum+node.bounds.w,0)+coverGap*(row.length-1),h:Math.max(...row.map(node=>node.bounds.h))});
      }
      const totalHeight=rows.reduce((sum,row)=>sum+row.h,0)+coverGap*(rows.length-1);
      const fit=Math.min(1,(right-left)/Math.max(...rows.map(row=>row.w)),(bottom-top)/totalHeight);
      const fill=covers.length/(columns*rows.length);
      if(fit>bestFit+.00001||(Math.abs(fit-bestFit)<.00001&&fill>bestFill)){bestRows=rows;bestHeight=totalHeight;bestFit=fit;bestFill=fill;}
    }
    let y=(top+bottom-bestHeight)/2;
    for(const row of bestRows){
      let x=(left+right-row.w)/2;
      for(const node of row.nodes){node.x=x+node.bounds.w/2;node.y=y+row.h/2;x+=node.bounds.w+coverGap;}
      y+=row.h+coverGap;
    }
  }
  if(spacing.relationship?.placeClusters){spacing.relationship.placeClusters(nodes);packClusters(nodes,spacing);}
  else keepPhotosApart(nodes,[],spacing);
  let overview={x:0,y:0,scale:1};
  if(nodes.length&&spacing.viewport){
    const visible=spacing.overviewCoversOnly&&covers.length?covers:nodes;
    const left=Math.min(...visible.map(n=>n.x-n.bounds.w/2)),right=Math.max(...visible.map(n=>n.x+n.bounds.w/2));
    const top=Math.min(...visible.map(n=>n.y-n.bounds.h/2)),bottom=Math.max(...visible.map(n=>n.y+n.bounds.h/2));
    const viewport=spacing.viewport;
    overview={x:(left+right)/2,y:(top+bottom)/2,scale:Math.min(1,(viewport.right-viewport.left)/(right-left),(viewport.bottom-viewport.top)/(bottom-top))};
  }
  for(const node of nodes){node.x-=node.bounds.offsetX;node.y-=node.bounds.offsetY;}
  return {photos:nodes,labels:anchors,overview};
}
