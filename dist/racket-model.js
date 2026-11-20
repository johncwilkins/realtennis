import * as THREE from './three.module.js';
import {racketWoodMaterials} from './racket-wood.js';
// A solid wooden throat and skewed laminated hoop, based on the supplied racket.
// The head origin stays at the existing stroke/contact location.
export function racketOutline(rx=.226,ry=.105){return Array.from({length:97},(_,i)=>{const t=i/96*Math.PI*2,x=rx*Math.cos(t);return new THREE.Vector2(x,ry*Math.sin(t)*(1-.09*Math.cos(t))-.045*x/.226);});}
export function createRacketModel(){
 const group=new THREE.Group(),wood=racketWoodMaterials();
 const trim=new THREE.MeshStandardMaterial({color:'#79756b',roughness:.8}),dark=new THREE.MeshStandardMaterial({color:'#302c25',roughness:.8});
 function solid(shape,material,depth=.024){const geometry=new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.002,bevelThickness:.002});geometry.translate(0,0,-depth/2);const mesh=new THREE.Mesh(geometry,material);mesh.castShadow=true;return mesh;}

 const outer=racketOutline(.226,.105),inner=racketOutline(.209,.088),shape=new THREE.Shape(outer);shape.holes.push(new THREE.Path([...inner].reverse()));const rim=solid(shape,wood.rim);rim.position.x=-.45;rim.name='racket-head';group.add(rim);
 // Fine concentric ash laminations on both faces of the hoop.
 for(const inset of [.004,.011])for(const z of [-.014,.014]){const pts=racketOutline(.226-inset,.105-inset).map(v=>new THREE.Vector3(v.x-.45,v.y,z));group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),new THREE.LineBasicMaterial({color:inset===.003?'#a88e6a':'#e9d6b2'})));}
 const throat=new THREE.Shape();throat.moveTo(-.164,-.015);throat.lineTo(-.263,-.091);throat.quadraticCurveTo(-.223,-.035,-.262,.014);throat.lineTo(-.164,.015);throat.closePath();group.add(solid(throat,wood.rim,.022));
 const handle=new THREE.Mesh(new THREE.CylinderGeometry(.014,.018,.225,12),wood.shaft);handle.rotation.z=Math.PI/2;handle.position.x=-.08;handle.castShadow=true;group.add(handle);
 const butt=new THREE.Mesh(new THREE.CylinderGeometry(.018,.018,.012,12),wood.shaft);butt.rotation.z=Math.PI/2;butt.position.x=.033;group.add(butt);
 // Small grey bindings around the shaft and alternating throat detail.
 for(const x of [-.035,-.164,-.184,-.204,-.224]){const width=x<-.21?.024+(Math.abs(x)-.21)*.6:.032;const band=new THREE.Mesh(new THREE.BoxGeometry(.003,width,.027),trim);band.position.set(x,0,0);group.add(band);}
 const badge=new THREE.Mesh(new THREE.BoxGeometry(.016,.040,.028),dark);badge.position.set(-.24,-.035,0);group.add(badge);
 // Clip every string to the inner hoop polygon rather than a symmetric oval.
 const lines=[];for(const axis of [0,1])for(let v=axis===0?-.198:-.114;v<=(axis===0?.198:.114);v+=.018){const cuts=[];for(let i=0;i<inner.length-1;i++){const a=inner[i],b=inner[i+1],av=axis===0?a.x:a.y,bv=axis===0?b.x:b.y;if((av<=v&&bv>v)||(bv<=v&&av>v)){const t=(v-av)/(bv-av);cuts.push(axis===0?a.y+(b.y-a.y)*t:a.x+(b.x-a.x)*t);}}if(cuts.length>=2){cuts.sort((a,b)=>a-b);if(axis===0)lines.push(v-.45,cuts[0],0,v-.45,cuts.at(-1),0);else lines.push(cuts[0]-.45,v,0,cuts.at(-1)-.45,v,0);}}
 const strings=new THREE.BufferGeometry();strings.setAttribute('position',new THREE.Float32BufferAttribute(lines,3));group.add(new THREE.LineSegments(strings,new THREE.LineBasicMaterial({color:'#c4b58d',transparent:true,opacity:.92})));
 return group;
}

