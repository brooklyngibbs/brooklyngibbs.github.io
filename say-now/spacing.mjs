// Include tilted corners and the small hover lift in each photo's protected area.
export function photoBounds(width,height,angle){
  const radians=Math.abs(angle)*Math.PI/180,c=Math.cos(radians),s=Math.sin(radians);
  return {w:width*c+height*s+4,h:height*c+width*s+12};
}

// Lay out the world once. When relationships are supplied, grow from the
// strongest shared categories and motifs; crossover images seek their shared
// neighbors. Unrelated photos must leave a wider gap even if a slot is empty.
export function keepPhotosApart(photos,zones,{x='x',y='y',gap=28,groupGap=44,relationship}={}){
  const placed=zones.map(zone=>({x:zone.x+zone.w/2,y:zone.y+zone.h/2,w:zone.w,h:zone.h,label:true}));
  const pending=[...photos].sort((a,b)=>Number(!!b.isCover)-Number(!!a.isCover)||a.ref.tier-b.ref.tier||a.index-b.index);
  while(pending.length){
    let next=0;
    if(relationship&&!pending[0].isCover){
      let strongest=-1;
      for(const [index,photo] of pending.entries()){
        const strength=Math.max(0,...placed.filter(other=>other.ref).map(other=>relationship(photo.ref,other.ref).strength));
        if(strength>strongest){strongest=strength;next=index;}
      }
    }
    const [photo]=pending.splice(next,1);
    let originalX=photo[x],originalY=photo[y];
    const w=photo.bounds.w,h=photo.bounds.h;
    const peers=relationship&&!photo.isCover?placed.filter(other=>other.ref).map(other=>({other,strength:relationship(photo.ref,other.ref).strength})):[];
    const strongest=Math.max(0,...peers.map(peer=>peer.strength));
    const neighbors=peers.filter(peer=>peer.strength>0&&peer.strength>=strongest*.6);
    if(neighbors.length){
      const weight=neighbors.reduce((sum,peer)=>sum+peer.strength,0);
      originalX=neighbors.reduce((sum,peer)=>sum+peer.other.x*peer.strength,0)/weight;
      originalY=neighbors.reduce((sum,peer)=>sum+peer.other.y*peer.strength,0)/weight;
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
    placed.push({x:photo[x],y:photo[y],w,h,group:photo.ref.group,ref:photo.ref});
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
  keepPhotosApart(nodes,[],spacing);
  for(const node of nodes){node.x-=node.bounds.offsetX;node.y-=node.bounds.offsetY;}
  return {photos:nodes,labels:anchors};
}
