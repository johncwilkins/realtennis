import {COURT as C,wallX} from './court-geometry.js';
// Camera-side guide stays on the actual rebound plane; the opaque end assembly stays hidden.
export function endGuideGeometry(side){const z=side*((side<0?C.endRoofInner:C.halfLength)-.1),left=C.roofOuterX,right=wallX(z),top=C.roofLow,inner=side>0?C.halfLength:-C.endRoofInner;
 const opening=side===1?{left:C.dedans.x-C.dedans.w/2,right:C.dedans.x+C.dedans.w/2,bottom:C.dedans.y-C.dedans.h/2,top:C.dedans.y+C.dedans.h/2}:{left:C.grille.x-C.grille.w/2,right:C.grille.x+C.grille.w/2,bottom:C.grille.y-C.grille.h/2,top:C.grille.y+C.grille.h/2};
 const panel=(a,b,lo,hi)=>[[a,lo,z],[b,lo,z],[b,hi,z],[a,hi,z]];
 const panels=[panel(left,opening.left,0,top),panel(opening.right,right,0,top),panel(opening.left,opening.right,0,opening.bottom),panel(opening.left,opening.right,opening.top,top)];
 const border=[[left,0,z],[right,0,z],[right,top,z],[left,top,z],[left,0,z]],aperture=[[opening.left,opening.bottom,z],[opening.right,opening.bottom,z],[opening.right,opening.top,z],[opening.left,opening.top,z],[opening.left,opening.bottom,z]];
 const roofLeft=side>0?C.roofInnerX:left;const roof=[[roofLeft,C.roofLow,inner],[right,C.roofLow,inner],[right,C.roofHigh,(side>0?C.halfLength+(C.halfLength-C.endRoofInner):-C.halfLength)],[C.roofOuterX,C.roofHigh,(side>0?C.halfLength+(C.halfLength-C.endRoofInner):-C.halfLength)]];
 return {z,panels,border,aperture,roof,opening};}
