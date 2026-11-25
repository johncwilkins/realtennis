import * as THREE from './three.module.js';
import {COURT as C,wallX} from './court-geometry.js';
import {mainWallRuns,wallFrame,mainWallSurface,wallSurface,venueRear} from './venue-walls.js';
import {architecturalGlass} from './window-glass.js';
import {block,beam,finish} from './venue-tools.js';
export const PARDEE_SCHEME={name:'Pardee Hall',description:'Pardee-inspired rusticated brownstone, pale sandstone window surrounds, widely spaced flush windows and a broad, steep slate mansard roofline. Maroon, ivory and warm hardwood take their color cues from Kirby’s basketball court. No signs or logos.',floor:'maple',sky:'#76858c',sun:'#fff0d7',colors:{upper:'#987a65',lower:'#71313f',roof:'#595e64',wood:'#74523c',trim:'#e2d5bc',ink:'#f1ead9',tape:'#ece1cd',cord:'#292932',out:'#963d4c'}};
function masonryMap(){const canvas=document.createElement('canvas');canvas.width=canvas.height=512;const c=canvas.getContext('2d');let seed=1873;const rnd=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);c.fillStyle='#51443c';c.fillRect(0,0,512,512);for(let row=0;row<10;row++)for(let x=(row%2)*-64;x<512;x+=128){const y=row*52;c.fillStyle=['#a1836e','#92745e','#ad8b72','#856b59'][Math.floor(rnd()*4)];c.fillRect(x+2,y+2,124,48);c.fillStyle='#e5cfaa42';c.fillRect(x+3,y+3,122,3);c.fillStyle='#332c244d';c.fillRect(x+3,y+45,122,4);for(let n=0;n<70;n++){c.fillStyle=n%2?'#2c252018':'#f7dfbb20';c.fillRect(x+rnd()*124,y+rnd()*44+3,2+rnd()*9,1+rnd()*3);}}const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;map.wrapS=map.wrapT=THREE.RepeatWrapping;return map;}
function windowView(){const canvas=document.createElement('canvas');canvas.width=128;canvas.height=256;const c=canvas.getContext('2d'),g=c.createLinearGradient(0,0,0,256);g.addColorStop(0,'#78909b');g.addColorStop(.55,'#a3aba0');g.addColorStop(1,'#465b50');c.fillStyle=g;c.fillRect(0,0,128,256);c.fillStyle='#283c3440';for(const x of [15,93]){c.fillRect(x,95,4,161);for(let y=110;y<230;y+=29){c.beginPath();c.ellipse(x,y,23,36,.3,0,Math.PI*2);c.fill();}}const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;return map;}
function archShape(w,h){const s=new THREE.Shape();s.moveTo(-w/2,0);s.lineTo(w/2,0);s.lineTo(w/2,h-.28);s.quadraticCurveTo(0,h+.28,-w/2,h-.28);s.closePath();return s;}
export function buildPardeeHall(){
 const sides=new THREE.Group(),walls=new THREE.Group(),ends=[];sides.userData.pardeeHall=true;sides.add(walls);
 const stone=finish('#ffffff',{map:masonryMap()}),trim=finish('#dfd1b7'),slate=finish('#454c55'),iron=finish('#3c3b3c',{metalness:.4}),maroon=finish('#71313f'),glass=architecturalGlass(.24),backing=new THREE.MeshBasicMaterial({map:windowView(),side:THREE.DoubleSide});glass.transmission=.55;
 // The original collision walls stay intact; this map gives their maroon finish a fine grain.
 const wallMap=masonryMap();wallMap.repeat.set(.5,.5);
 function window(g,x,y,w=1.05,h=1.35){
  // Flat stone trim and shallow glazing read as a continuous, predictable wall face.
  const shape=archShape(w+.16,h+.12),hole=new THREE.Path();hole.moveTo(-w/2,.04);hole.lineTo(-w/2,h-.28);hole.quadraticCurveTo(0,h+.28,w/2,h-.28);hole.lineTo(w/2,.04);hole.closePath();shape.holes.push(hole);
  const surround=new THREE.Mesh(new THREE.ShapeGeometry(shape,12),trim);surround.position.set(x,y,-.012);surround.userData.pardeeWindowTrim=true;g.add(surround);
  const geo=new THREE.ShapeGeometry(archShape(w,h),12),p=geo.attributes.position,uv=geo.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,(p.getX(i)+w/2)/w,p.getY(i)/h);
  const pane=new THREE.Mesh(geo,glass);pane.position.set(x,y,-.05);pane.userData.pardeeWindow=true;g.add(pane);const view=new THREE.Mesh(geo,backing);view.position.set(x,y,-.16);g.add(view);
  for(const dx of [-w/2,0,w/2])block(g,.024,h-.16,.016,x+dx,y+(h-.16)/2,-.025,iron);block(g,w,.024,.016,x,y+h*.48,-.025,iron);block(g,w+.20,.065,.035,x,y-.01,-.015,trim);
 }
 function panel(span,pavilion=false){const g=new THREE.Group(),count=Math.max(1,Math.floor(span/5.8)),step=span/count;
  block(g,span,2.7,.30,0,4.75,-.17,stone);block(g,span,.12,.12,0,6.1,-.04,trim);block(g,span,.11,.10,0,3.5,.02,maroon);
  // Cut real arched openings through the masonry, with glass recessed behind the trim.
  const face=new THREE.Shape();face.moveTo(-span/2,6.2);face.lineTo(span/2,6.2);face.lineTo(span/2,8.55);face.lineTo(-span/2,8.55);face.closePath();
  if(span>=4.5)for(let i=0;i<count;i++){const x=-span/2+(i+.5)*step,w=Math.min(1.05,step-.52);for(const y of [6.65]){window(g,x,y,w);const hole=new THREE.Path();hole.moveTo(x-w/2,y);hole.lineTo(x-w/2,y+1.07);hole.quadraticCurveTo(x,y+1.63,x+w/2,y+1.07);hole.lineTo(x+w/2,y);hole.closePath();face.holes.push(hole);}}
  const facade=new THREE.Mesh(new THREE.ExtrudeGeometry(face,{depth:.12,bevelEnabled:false,curveSegments:12}),stone);facade.position.z=-.14;g.add(facade);
  for(const x of [-span/2+.12,span/2-.12])for(let y=3.5;y<8.5;y+=.4)block(g,.25,.34,.055,x,y,-.015,trim);
  block(g,span+.14,.16,.22,0,8.56,-.015,trim);block(g,span+.3,.14,.30,0,8.74,-.025,trim);
  // A tall, continuous double-pitch silhouette is the main architectural feature.
  const roof=new THREE.Group();roof.userData.pardeeMansard=true;g.add(roof);const top=12.25;
  wallSurface(roof,[[-span/2,8.85,-.05],[span/2,8.85,-.05],[span/2,top,-1.7],[-span/2,top,-1.7]],slate);
  wallSurface(roof,[[-span/2,top,-1.7],[span/2,top,-1.7],[span/2,top+.18,-3.8],[-span/2,top+.18,-3.8]],slate);
  for(const [y,z]of [[8.92,-.08],[12.25,-1.68]])block(roof,span+.14,.07,.11,0,y,z,iron);
  // Sparse, shallow dormers sit against the slope rather than projecting like boxes.
  if(span>=4.5)for(let i=0;i<count;i++){const x=-span/2+(i+.5)*step,dormer=new THREE.Group();dormer.userData.pardeeDormer=true;dormer.position.set(x,9.95,-.58);dormer.rotation.x=-Math.atan(1.65/3.4);roof.add(dormer);window(dormer,0,0,.55,.85);}
  if(pavilion){const tower=new THREE.Group();tower.userData.pardeePavilion=true;g.add(tower);block(tower,3.1,3.25,.6,0,10.475,-.42,stone);const upperWindow=new THREE.Group();upperWindow.position.z=-.055;tower.add(upperWindow);window(upperWindow,0,10,.9,1.35);block(tower,3.35,.16,.8,0,12.14,-.4,trim);
   wallSurface(tower,[[-1.73,12.25,-.04],[1.73,12.25,-.04],[1.22,14.25,-1.18],[-1.22,14.25,-1.18]],slate);block(tower,2.6,.13,1.8,0,14.3,-1.95,iron);
   for(const x of [-1.17,0,1.17])beam(tower,[x,14.38,-1.17],[x,14.7,-1.17],.018,iron);beam(tower,[-1.23,14.65,-1.17],[1.23,14.65,-1.17],.018,iron);
  }
  // Keep rustication at a stable physical scale on every wall face.
  g.traverse(o=>{if(o.isMesh&&o.material===stone){o.geometry=o.geometry.clone();const uv=o.geometry.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*Math.max(.1,o.scale.x/3),uv.getY(i)*Math.max(.1,o.scale.y/1.2));}});return g;
 }
 for(const run of mainWallRuns()){const frame=wallFrame(run),span=Math.hypot(run.xb-run.xa,run.b-run.a);frame.add(panel(span));walls.add(frame);mainWallSurface(sides,run,3.4,6.1,stone);}
 const left=panel(venueRear+C.halfLength);left.position.set(C.roofOuterX,0,(venueRear-C.halfLength)/2);left.rotation.y=Math.PI/2;walls.add(left);
 for(const side of [-1,1]){const g=new THREE.Group(),z=side>0?venueRear:-C.halfLength,right=wallX(z),face=panel(right-C.roofOuterX,true);g.userData.endSide=side;face.position.set((right+C.roofOuterX)/2,0,z);face.rotation.y=side>0?Math.PI:0;g.add(face);ends.push(g);}
 // A court-facing cutaway leaves the far architecture visible from either end.
 return {sides,ends,wallMap,setVisible(on,over=false){sides.visible=on;walls.visible=!over;for(const g of ends)g.visible=on&&!over;},setEndView(){},update(){}};
}
