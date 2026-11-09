// One photographic scale: overview thumbnails grow into inspectable images.
// Their spacing grows in exactly the same proportion, so groups stay cohesive.
const spatialExponent=.6;
export const worldScale=zoom=>Math.pow(zoom,spatialExponent);
export const zoomFromScale=scale=>Math.pow(scale,1/spatialExponent);
export function photoScale(zoom,profile){
  const scale=worldScale(zoom);
  if(!profile?.edge)return scale;
  // Opening covers give way to the finer layers instead of becoming enormous.
  // Detail photos still grow to a useful inspection size, with a smooth limit.
  const start=profile.level===0?220:360,ceiling=profile.level===0?320:520;
  const edge=profile.edge*scale;
  return edge<=start?scale:(start+(ceiling-start)*(1-Math.exp(-(edge-start)/(ceiling-start))))/profile.edge;
}
export function photoDimensions(ref,isCover=false,mobile=false,profile=null){
  const longEdge=profile?profile.edge:(isCover?(mobile?62:70):Math.max(48,Math.min(mobile?54:60,(ref.size||66)*.85)));
  return {w:longEdge*ref.w/Math.max(ref.w,ref.h),h:longEdge*ref.h/Math.max(ref.w,ref.h)};
}
export const photoHitSize=coarse=>coarse?44:28;
