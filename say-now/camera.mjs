// Spatial zoom keeps revealing room beyond the current collection. Photos stop
// growing before their surroundings do, so old references never fill the view.
export const worldScale=zoom=>Math.pow(zoom,.55);
export const zoomFromScale=scale=>Math.pow(scale,1/.55);
export const photoScale=(zoom,isCover=false)=>Math.min(worldScale(zoom),isCover?1.8:3.2);
