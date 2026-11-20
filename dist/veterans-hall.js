import * as THREE from './three.module.js';
import {COURT as C,wallX} from './court-geometry.js';

// An indoor interpretation of the Vet's concrete concourses, without toy-like seating.
function concreteTexture(){
 if(typeof document==='undefined')return null;
 const canvas=document.createElement('canvas');canvas.width=512;canvas.height=512;const ctx=canvas.getContext('2d');
 let seed=7071;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
 ctx.fillStyle='#d2d0c8';ctx.fillRect(0,0,512,512);
 // Fine aggregate, faint shuttering lines, runoff and occasional tie holes.
 for(let i=0;i<22000;i++){ctx.fillStyle=random()>.5?'rgba(255,255,248,.075)':'rgba(42,42,35,.065)';ctx.fillRect(random()*512,random()*512,.5+random()*2,.5+random()*1.5);}
 for(let y=0;y<512;y+=128){ctx.fillStyle='rgba(57,57,49,.10)';ctx.fillRect(0,y,512,1);ctx.fillStyle='rgba(255,255,244,.13)';ctx.fillRect(0,y+1,512,1);}
 for(let i=0;i<13;i++){const x=random()*512,y=random()*400,w=4+random()*20,h=40+random()*110,stain=ctx.createLinearGradient(x,y,x,y+h);stain.addColorStop(0,'rgba(58,58,47,.06)');stain.addColorStop(1,'rgba(58,58,47,0)');ctx.fillStyle=stain;ctx.fillRect(x,y,w,h);}
 for(const y of [48,304])for(const x of [64,320]){ctx.beginPath();ctx.arc(x,y,1.5,0,Math.PI*2);ctx.fillStyle='rgba(42,43,36,.20)';ctx.fill();}
 const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.wrapS=texture.wrapT=THREE.RepeatWrapping;return texture;
}

export function buildVeteransHall(){
 const sides=new THREE.Group(),ends=[],unit=new THREE.BoxGeometry(1,1,1),map=concreteTexture(),concrete=new THREE.MeshStandardMaterial({color:'#c0c2b9',map,bumpMap:map,bumpScale:.009,roughness:.95}),soffit=new THREE.MeshStandardMaterial({color:'#838981',roughness:.97}),dark=new THREE.MeshStandardMaterial({color:'#434d48',roughness:.96}),steel=new THREE.MeshStandardMaterial({color:'#555e58',roughness:.64,metalness:.45}),light=new THREE.MeshBasicMaterial({color:'#f4dfb3'}),signs=['#ad903e','#ae6740','#79614d'].map(color=>new THREE.MeshStandardMaterial({color,roughness:.8}));
 sides.userData.veteransHall=true;const geometries=new Map(),pole=new THREE.CylinderGeometry(1,1,1,8),up=new THREE.Vector3(0,1,0);
 function block(g,w,h,d,x,y,z,m,soft=false){
  let geometry=unit;
  if(soft){const key=[w,h,d].join(':');if(!geometries.has(key)){const r=Math.min(.035,w/5,h/5,d/5),shape=new THREE.Shape();shape.moveTo(-w/2+r,-h/2+r);shape.lineTo(w/2-r,-h/2+r);shape.lineTo(w/2-r,h/2-r);shape.lineTo(-w/2+r,h/2-r);shape.closePath();const geo=new THREE.ExtrudeGeometry(shape,{depth:d-2*r,bevelEnabled:true,bevelThickness:r,bevelSize:r,bevelSegments:3,steps:1});geo.translate(0,0,-d/2+r);geometries.set(key,geo);}geometry=geometries.get(key);}
  const o=new THREE.Mesh(geometry,m);if(!soft)o.scale.set(w,h,d);o.position.set(x,y,z);o.receiveShadow=o.castShadow=true;g.add(o);return o;
 }
 function rail(g,a,b,r=.018){const A=new THREE.Vector3(...a),B=new THREE.Vector3(...b),delta=B.clone().sub(A),o=new THREE.Mesh(pole,steel);o.position.copy(A).add(B).multiplyScalar(.5);o.scale.set(r,delta.length(),r);o.quaternion.setFromUnitVectors(up,delta.normalize());g.add(o);}
 function bay(span){
  const g=new THREE.Group(),count=Math.max(1,Math.round(span/3.6)),step=span/count;
  for(let i=0;i<count;i++){
   const x=-span/2+(i+.5)*step;
   // Individual cast panels, gently eased edges and a deep shaded passage behind.
   block(g,step-.012,1.5,.30,x,4.15,0,concrete,true);
   block(g,step-.012,.73,.44,x,7.235,.035,concrete,true);
   block(g,step-.05,.13,.54,x,4.94,.035,concrete,true);
   const rear=block(g,step-.25,1.93,.16,x,5.9,-1.3,dark);rear.userData.concourseRear=true;
   block(g,step-.3,.10,1.3,x,5.01,-.49,soffit);
   block(g,step-.3,.12,1.3,x,6.84,-.49,soffit);
   const pier=block(g,.36,3.2,1.02,x-step/2,5.94,-.23,concrete,true);pier.userData.concretePier=true;
   // A back doorway and an offset wall sconce give each recess an interior scale.
   block(g,.66,1.40,.04,x+.18,5.75,-1.195,steel,true);
   block(g,.57,1.32,.045,x+.18,5.73,-1.163,dark);
   block(g,.32,.075,.14,x-.60,6.59,-1.04,steel,true);
   block(g,.25,.034,.11,x-.60,6.55,-.98,light);
   // Thin round guardrails replace the broad, brightly colored rows of seats.
   rail(g,[x-step/2+.2,5.77,.11],[x+step/2-.2,5.77,.11],.024);
   rail(g,[x-step/2+.2,5.39,.11],[x+step/2-.2,5.39,.11],.014);
   for(const dx of [-step/2+.22,0,step/2-.22])rail(g,[x+dx,5.04,.11],[x+dx,5.78,.11],.017);
   // Small desaturated enamel section plaques carry the original stadium palette.
   const plaque=block(g,.22,.27,.035,x-step/2+.005,6.12,.30,signs[i%3],true);plaque.userData.stadiumAccent=true;
   for(let mark=0;mark<2+(i%3);mark++)block(g,.09,.014,.009,x-step/2+.005,6.17-mark*.045,.324,light);
   block(g,.82,.065,.19,x,7.05,.31,steel,true);block(g,.71,.028,.12,x,7.018,.34,light);
  }
  block(g,.36,3.2,1.02,span/2,5.94,-.23,concrete,true);return g;
 }
 const rear=C.halfLength+(C.halfLength-C.endRoofInner);
 for(const [a,b]of [[-C.halfLength,C.tambourEnd],[C.tambourEnd,C.tambourStart],[C.tambourStart,rear]]){const xa=wallX(a),xb=wallX(b),g=bay(Math.hypot(xb-xa,b-a));g.position.set((xa+xb)/2,0,(a+b)/2);g.rotation.y=Math.atan2(-(b-a),xb-xa);sides.add(g);}
 const left=bay(rear+C.halfLength);left.position.set(C.roofOuterX,0,(rear-C.halfLength)/2);left.rotation.y=Math.PI/2;sides.add(left);
 for(const side of [-1,1]){const g=bay(5-C.roofOuterX);g.position.set((5+C.roofOuterX)/2,0,side>0?rear:-C.halfLength);g.rotation.y=side>0?Math.PI:0;g.userData.endSide=side;ends.push(g);}
 return {sides,ends,setVisible(active,overview=false){sides.visible=active&&!overview;for(const g of ends)g.visible=active&&!overview;}};
}
