export const DISPLAY_KEY='royal-court-display-size-v1';
export function readDisplaySize(storage){try{const value=storage.getItem(DISPLAY_KEY);return ['auto','1','1.15','1.3'].includes(value)?value:'auto';}catch{return 'auto';}}
export function saveDisplaySize(storage,value){try{storage.setItem(DISPLAY_KEY,value);return true;}catch{return false;}}
export function courtZoom(value,width,height,view='play'){if(view==='overview')return 1;if(value==='auto')return width>=900&&height<=900&&width/height>=.85?1.16:1;const zoom=Number(value);return [1,1.15,1.3].includes(zoom)?zoom:1;}
export function courtAim(side,portrait,zoom=1){return portrait?0:side*(-.7+(zoom-1)*16);}
