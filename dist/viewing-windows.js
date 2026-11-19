import * as THREE from './three.module.js';
import {COURT as C} from './court-geometry.js';
import {gallerySpectator} from './spectators.js';
export const VIEWING_WINDOW={centres:[-4.2,-1.1,2],halfWidth:1.05,bottom:4.5,top:6,depth:.62};
// The end wall is built around the holes. Everything in the viewing room is behind its court face.
export function buildViewingWindows(side,{box,upper,wood,red,layout=VIEWING_WINDOW}){const group=new THREE.Group(),W=layout,rear=side*(side<0?C.halfLength:C.halfLength+(C.halfLength-C.endRoofInner)),face=rear+side*.04,inside=face+side*W.depth,add=o=>{group.add(o);return o;};group.userData.viewingWindows=true;group.userData.faceZ=face;group.userData.endSide=side;
const wall=(a,b,lo,hi)=>{if(b>a)add(box(b-a,hi-lo,.2,(a+b)/2,(lo+hi)/2,face+side*.1,upper));};wall(C.roofOuterX,5,3.4,W.bottom);wall(C.roofOuterX,5,W.top,7.6);let edge=C.roofOuterX;for(const x of W.centres){wall(edge,x-W.halfWidth,W.bottom,W.top);edge=x+W.halfWidth;}wall(edge,5,W.bottom,W.top);
const reveal=new THREE.MeshStandardMaterial({color:W.blue?'#89abc0':'#d0c5aa',roughness:.9}),room=new THREE.MeshStandardMaterial({color:'#33342f',roughness:1}),sill=new THREE.MeshStandardMaterial({color:W.blue?'#87adc1':'#d5c9ae',roughness:.8});
for(const [i,x]of W.centres.entries()){
const back=add(box(2*W.halfWidth,W.top-W.bottom,.04,x,(W.bottom+W.top)/2,inside+side*.42,room));back.userData.viewingRoomBack=true;
for(const X of [x-W.halfWidth,x+W.halfWidth])add(box(.065,W.top-W.bottom,W.depth,X,(W.bottom+W.top)/2,face+side*W.depth/2,reveal));
for(const Y of [W.bottom,W.top]){const o=add(box(2*W.halfWidth+.08,.07,W.depth,x,Y,face+side*W.depth/2,sill));o.userData.windowSill=Y===W.bottom;}
for(const X of [x-W.halfWidth-.04,x+W.halfWidth+.04])add(box(.055,W.top-W.bottom+.1,.05,X,(W.bottom+W.top)/2,face+side*.025,wood));
for(const Y of [W.bottom-.04,W.top+.04])add(box(2*W.halfWidth+.13,.055,.05,x,Y,face+side*.025,wood));
for(let n=0;n<(W.count??3);n++){const spectator=gallerySpectator((side>0?0:9)+i*3+n);const scale=spectator.scale.y;spectator.position.set(x-W.halfWidth+(n+1)*2*W.halfWidth/((W.count??3)+1),W.bottom-.82*scale-.025,face+side*.40);spectator.rotation.y=side>0?Math.PI:0;add(spectator);}
const lamp=new THREE.PointLight('#ffe3b4',1.4,2.3,2);lamp.position.set(x,5.85,face+side*.3);add(lamp);
}
add(box(5-C.roofOuterX,.075,.025,(5+C.roofOuterX)/2,6.4,face-side*.015,red));return group;}
