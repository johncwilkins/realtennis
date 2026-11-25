import {pardeeMaterialMaps} from './pardee-materials.js';
import * as THREE from './three.module.js';
import {COURT as C,wallX} from './court-geometry.js';
import {mainWallRuns,wallFrame,mainWallSurface,wallSurface,venueRear} from './venue-walls.js';
import {architecturalGlass} from './window-glass.js';
import {block,beam,finish} from './venue-tools.js';
export const PARDEE_SCHEME={name:'Pardee Hall',description:'Pardee-inspired rusticated brownstone, pale sandstone window surrounds, a prominent blue-gray mansard roof band, raised corner roofs, pale crest trim and sparse gabled dormers. Maroon, ivory and warm hardwood take their color cues from Kirby’s basketball court. No signs or logos.',floor:'maple',sky:'#76858c',sun:'#fff5e8',lighting:{hemisphere:1.5,ambient:.32,sun:2.0,fill:18,exposure:1.10},colors:{upper:'#987a65',lower:'#71313f',roof:'#595e64',wood:'#74523c',trim:'#e2d5bc',ink:'#f1ead9',tape:'#ece1cd',cord:'#292932',out:'#963d4c'}};
function masonryMap(){const canvas=document.createElement('canvas');canvas.width=canvas.height=512;const c=canvas.getContext('2d');let seed=1873;const rnd=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);c.fillStyle='#51443c';c.fillRect(0,0,512,512);for(let row=0;row<10;row++)for(let x=(row%2)*-64;x<512;x+=128){const y=row*52;c.fillStyle=['#a1836e','#92745e','#ad8b72','#856b59'][Math.floor(rnd()*4)];c.fillRect(x+2,y+2,124,48);c.fillStyle='#e5cfaa42';c.fillRect(x+3,y+3,122,3);c.fillStyle='#332c244d';c.fillRect(x+3,y+45,122,4);for(let n=0;n<70;n++){c.fillStyle=n%2?'#2c252018':'#f7dfbb20';c.fillRect(x+rnd()*124,y+rnd()*44+3,2+rnd()*9,1+rnd()*3);}}const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;map.wrapS=map.wrapT=THREE.RepeatWrapping;return map;}
function windowView(){const canvas=document.createElement('canvas');canvas.width=128;canvas.height=256;const c=canvas.getContext('2d'),g=c.createLinearGradient(0,0,0,256);g.addColorStop(0,'#78909b');g.addColorStop(.55,'#a3aba0');g.addColorStop(1,'#465b50');c.fillStyle=g;c.fillRect(0,0,128,256);c.fillStyle='#283c3440';for(const x of [15,93]){c.fillRect(x,95,4,161);for(let y=110;y<230;y+=29){c.beginPath();c.ellipse(x,y,23,36,.3,0,Math.PI*2);c.fill();}}const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;return map;}
export function buildPardeeHall(){
 const sides=new THREE.Group(),walls=new THREE.Group(),ends=[];sides.userData.pardeeHall=true;sides.add(walls);
 const stone=finish('#ffffff',pardeeMaterialMaps('stone')),trim=finish('#d5cebe',pardeeMaterialMaps('limestone')),slate=finish('#8c9aaa',pardeeMaterialMaps('slate')),iron=finish('#494a48',{metalness:.2,roughness:.87}),maroon=finish('#71313f'),glass=architecturalGlass(.28),backing=new THREE.MeshStandardMaterial({map:windowView(),color:'#46565c',roughness:.96,side:THREE.DoubleSide});glass.transmission=.58;glass.roughness=.24;glass.color.set('#6c8190');
 // The original collision walls stay intact; this map gives their maroon finish a fine grain.
 const wallMap=masonryMap();wallMap.repeat.set(.5,.5);
 function stoneEdge(group,a,b,width,depth){const A=new THREE.Vector3(...a),B=new THREE.Vector3(...b),edge=block(group,width,A.distanceTo(B),depth,0,0,0,trim);edge.position.copy(A).add(B).multiplyScalar(.5);edge.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),B.sub(A).normalize());return edge;}
 // Roof faces are real sloped surfaces with openings, rather than a slab behind the dormers.
 function roofBay(parent,{x,width,base=6.35,height=2.0,inset=.48,front=-.05,raised=false,dormer=true}){
  const group=new THREE.Group();group.position.set(x,base,front);group.rotation.x=-Math.atan(inset/height);parent.add(group);
  const length=Math.hypot(height,inset),topWidth=width*(raised?.78:1),shape=new THREE.Shape();shape.moveTo(-width/2,0);shape.lineTo(width/2,0);shape.lineTo(topWidth/2,length);shape.lineTo(-topWidth/2,length);shape.closePath();
  if(dormer){const hole=new THREE.Path();hole.moveTo(-.38,.59);hole.lineTo(-.38,1.75);hole.lineTo(.38,1.75);hole.lineTo(.38,.59);hole.closePath();shape.holes.push(hole);}
  const face=new THREE.Mesh(new THREE.ShapeGeometry(shape),slate);face.userData.pardeeSlateFace=true;face.castShadow=face.receiveShadow=true;group.add(face);
  // Slate courses come from the material, avoiding dark drawn outlines across the roof.
  const uv=face.geometry.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)/2.8,uv.getY(i)/2.8);
  if(raised)for(const edge of [-1,1])stoneEdge(group,[edge*width/2,0,.016],[edge*topWidth/2,length,.016],.055,.04);
  const crest=block(parent,topWidth+.10,.075,.15,x,base+height+.04,front-inset,trim);crest.userData.pardeeRoofCrest=true;
  wallSurface(parent,[[x-topWidth/2,base+height,front-inset],[x+topWidth/2,base+height,front-inset],[x+topWidth/2,base+height+.14,front-inset-1.5],[x-topWidth/2,base+height+.14,front-inset-1.5]],slate);
  if(raised){group.userData.pardeeRaisedRoof=true;for(const edge of [-1,1])wallSurface(parent,[[x+edge*width/2,base,front],[x+edge*topWidth/2,base+height,front-inset],[x+edge*topWidth/2,base+height+.14,front-inset-1.5],[x+edge*width/2,base,front-1.5]],slate);}
  if(dormer){const d=new THREE.Group();d.userData.pardeeDormer=true;group.add(d);
   const pane=new THREE.Mesh(new THREE.PlaneGeometry(.76,1.16),glass);pane.position.set(0,1.17,.018);pane.userData.pardeeWindow=true;d.add(pane);const view=new THREE.Mesh(new THREE.PlaneGeometry(.76,1.16),backing);view.position.set(0,1.17,-.08);d.add(view);
   for(const xx of [-.43,.43])block(d,.055,1.27,.045,xx,1.17,.035,trim);for(const yy of [.55,1.79])block(d,.89,.055,.055,0,yy,.035,trim);block(d,.025,1.16,.025,0,1.17,.04,iron);
   // Solid shallow pediments catch light like dressed stone rather than outlined cartoons.
   const pediment=new THREE.Shape();pediment.moveTo(-.52,1.81);pediment.lineTo(.52,1.81);pediment.lineTo(0,2.04);pediment.closePath();const cap=new THREE.Mesh(new THREE.ExtrudeGeometry(pediment,{depth:.04,bevelEnabled:true,bevelThickness:.006,bevelSize:.008,bevelSegments:1,steps:1}),trim);cap.castShadow=cap.receiveShadow=true;cap.position.z=.025;d.add(cap);
   block(d,.95,.065,.13,0,.53,.02,trim);

  }
 }
 function panel(span,pavilion=false){const g=new THREE.Group();
  // A quiet, flat masonry band meets a strong cornice immediately above the real court wall.
  block(g,span,2.7,.30,0,4.75,-.17,stone);block(g,span,.10,.10,0,6.1,-.035,trim);block(g,span,.11,.10,0,3.5,.02,maroon);
  for(const x of [-span/2+.12,span/2-.12])for(let y=3.5;y<6.1;y+=.4)block(g,.20,.34,.035,x,y,-.025,trim);
  block(g,span+.14,.13,.25,0,6.23,-.025,trim);
  const roof=new THREE.Group();roof.userData.pardeeMansard=true;g.add(roof);
  if(span<5)roofBay(roof,{x:0,width:span,height:2.6,dormer:false});
  else{
   const corner=Math.min(2.75,span*.23),middle=span-2*corner;
   roofBay(roof,{x:-span/2+corner/2,width:corner,height:2.45,inset:.55,raised:true});
   roofBay(roof,{x:span/2-corner/2,width:corner,height:2.45,inset:.55,raised:true});
   const bays=Math.max(1,Math.floor(middle/5.8)),width=middle/bays;
   for(let i=0;i<bays;i++)roofBay(roof,{x:-middle/2+(i+.5)*width,width});
  }
  if(pavilion){roof.userData.pardeePavilion=true;}
  // Keep rustication at a stable physical scale on every wall face.
  g.traverse(o=>{if(o.isMesh&&(o.material===stone||o.material===trim)){o.geometry=o.geometry.clone();const uv=o.geometry.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*Math.max(.1,o.scale.x/3),uv.getY(i)*Math.max(.1,o.scale.y/1.2));}});return g;
 }
 for(const run of mainWallRuns()){const frame=wallFrame(run),span=Math.hypot(run.xb-run.xa,run.b-run.a);frame.add(panel(span));walls.add(frame);mainWallSurface(sides,run,3.4,6.1,stone);}
 const left=panel(venueRear+C.halfLength);left.position.set(C.roofOuterX,0,(venueRear-C.halfLength)/2);left.rotation.y=Math.PI/2;walls.add(left);
 for(const side of [-1,1]){const g=new THREE.Group(),z=side>0?venueRear:-C.halfLength,right=wallX(z),face=panel(right-C.roofOuterX,true);g.userData.endSide=side;face.position.set((right+C.roofOuterX)/2,0,z);face.rotation.y=side>0?Math.PI:0;g.add(face);ends.push(g);}
 // A court-facing cutaway leaves the far architecture visible from either end.
 return {sides,ends,wallMap,setVisible(on,over=false){sides.visible=on;walls.visible=!over;for(const g of ends)g.visible=on&&!over;},setEndView(){},update(){}};
}
