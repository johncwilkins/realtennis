import * as THREE from './three.module.js';
import {COURT as C,wallX} from './court-geometry.js';
// An indoor interpretation of the Vet's concrete bowl and warm original seating.
export function buildVeteransHall(){
 const sides=new THREE.Group(),ends=[],unit=new THREE.BoxGeometry(1,1,1),concrete=new THREE.MeshStandardMaterial({color:'#adafa6',roughness:.96}),dark=new THREE.MeshStandardMaterial({color:'#3e4846',roughness:.9}),steel=new THREE.MeshStandardMaterial({color:'#65706d',roughness:.6,metalness:.4}),light=new THREE.MeshBasicMaterial({color:'#fff3cc'}),seats=['#d7a33e','#c66c32','#795439'].map(color=>new THREE.MeshStandardMaterial({color,roughness:.8}));
 sides.userData.veteransHall=true;
 function box(g,w,h,d,x,y,z,m){const o=new THREE.Mesh(unit,m);o.scale.set(w,h,d);o.position.set(x,y,z);o.receiveShadow=true;g.add(o);return o;}
 function bay(span){const g=new THREE.Group(),count=Math.max(1,Math.round(span/3.6)),step=span/count;
 box(g,span,1.5,.28,0,4.15,0,concrete);box(g,span,.75,.35,0,7.225,0,concrete);
 for(let i=0;i<count;i++){const x=-span/2+(i+.5)*step;box(g,.32,3.1,.5,x-step/2,6,0,concrete);box(g,step-.25,1.95,.12,x,5.85,-.85,dark);
 for(let tier=0;tier<3;tier++){box(g,step-.4,.12,.3,x,5.02+tier*.34,-.2-tier*.2,concrete);for(let j=0;j<4;j++){const seat=box(g,(step-.6)/4,.23,.16,x+(j-1.5)*(step-.6)/4,5.18+tier*.34,-.28-tier*.2,seats[tier]);seat.userData.stadiumSeat=true;}}
 box(g,step-.2,.06,.06,x,5.04,.15,steel);for(let j=0;j<3;j++)box(g,.25,.16,.12,x+(j-1)*.36,7.05,.3,light);
 }box(g,.32,3.1,.5,span/2,6,0,concrete);return g;}
 const rear=C.halfLength+(C.halfLength-C.endRoofInner);
 for(const [a,b]of [[-C.halfLength,C.tambourEnd],[C.tambourEnd,C.tambourStart],[C.tambourStart,rear]]){const xa=wallX(a),xb=wallX(b),g=bay(Math.hypot(xb-xa,b-a));g.position.set((xa+xb)/2,0,(a+b)/2);g.rotation.y=Math.atan2(-(b-a),xb-xa);sides.add(g);}
 const left=bay(rear+C.halfLength);left.position.set(C.roofOuterX,0,(rear-C.halfLength)/2);left.rotation.y=Math.PI/2;sides.add(left);
 for(const side of [-1,1]){const g=bay(5-C.roofOuterX);g.position.set((5+C.roofOuterX)/2,0,side>0?rear:-C.halfLength);g.rotation.y=side>0?Math.PI:0;g.userData.endSide=side;ends.push(g);}
 return {sides,ends,setVisible(active,overview=false){sides.visible=active&&!overview;for(const g of ends)g.visible=active&&!overview;}};
}
