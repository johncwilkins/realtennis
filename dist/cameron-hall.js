import * as THREE from './three.module.js';
import {COURT as C,wallX} from './court-geometry.js';
import {mainWallRuns,wallFrame,mainWallSurface,venueRear} from './venue-walls.js';
import {architecturalGlass} from './window-glass.js';
import {block,beam,finish} from './venue-tools.js';
function stoneMap(){if(typeof document==='undefined')return null;const canvas=document.createElement('canvas');canvas.width=canvas.height=512;const c=canvas.getContext('2d');let seed=1940;const rnd=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);c.fillStyle='#6c685f';c.fillRect(0,0,512,512);for(let y=0;y<512;y+=38)for(let x=-60+(y/38%2)*60;x<512;x+=94){c.fillStyle=['#a59c88','#948e80','#b0a692','#8b8579'][Math.floor(rnd()*4)];c.fillRect(x+2,y+2,90,34);c.fillStyle='#d6cbb329';c.fillRect(x+4,y+3,86,3);}const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;map.wrapS=map.wrapT=THREE.RepeatWrapping;map.repeat.set(1,2);return map;}
function recessMap(){if(typeof document==='undefined')return null;const canvas=document.createElement('canvas');canvas.width=128;canvas.height=256;const c=canvas.getContext('2d'),light=c.createLinearGradient(0,0,0,256);light.addColorStop(0,'#7d9395');light.addColorStop(.45,'#c4c8b2');light.addColorStop(1,'#71877a');c.fillStyle=light;c.fillRect(0,0,128,256);c.fillStyle='#384f4a33';for(const x of [9,73,112]){c.fillRect(x,90,3,166);c.beginPath();c.moveTo(x,110);c.lineTo(x-17,77);c.lineTo(x+2,98);c.lineTo(x+17,57);c.lineTo(x+3,125);c.fill();}const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;return map;}
export function buildCameronHall(){
 const sides=new THREE.Group(),ends=[],walls=new THREE.Group(),rafters=[];sides.add(walls);sides.userData.cameronHall=true;
 const blue=finish('#063b92'),ivory=finish('#d2cbbb'),stone=finish('#b8b0a0',{map:stoneMap()}),steel=finish('#3d454a',{metalness:.45,roughness:.7}),glass=architecturalGlass(.22),backing=new THREE.MeshBasicMaterial({map:recessMap(),color:'#e0e3d1',side:THREE.DoubleSide}),lamp=new THREE.MeshBasicMaterial({color:'#fff0cf'});
 glass.transmission=.55;glass.roughness=.12;
 function panel(span){const g=new THREE.Group(),count=Math.max(1,Math.floor(span/3)),step=span/count;
  block(g,span,1.1,.19,0,3.95,-.10,stone);block(g,span,.10,.23,0,4.52,.015,ivory);block(g,span,.16,.28,0,8.85,-.02,stone);
  // Recessed glazing is built into real openings, with stone piers between them.
  for(let i=0;i<count;i++){const x=-span/2+(i+.5)*step,w=step-.32;block(g,.28,4.18,.35,x-step/2+.14,6.7,-.12,stone);block(g,w,.90,.20,x,4.98,-.12,stone);block(g,w,1.18,.20,x,8.18,-.12,stone);
   const pane=new THREE.Mesh(new THREE.PlaneGeometry(w,2.1),glass);pane.position.set(x,6.48,-.21);pane.userData.cameronWindow=true;g.add(pane);const view=new THREE.Mesh(new THREE.PlaneGeometry(w+.03,2.12),backing);view.position.set(x,6.48,-.73);view.userData.cameronWindowBackdrop=true;g.add(view);for(const side of [-1,1])block(g,.055,2.14,.60,x+side*w/2,6.48,-.43,stone);
   for(const dx of [-w/2,0,w/2])beam(g,[x+dx,5.42,-.10],[x+dx,7.54,-.10],.025,steel);for(const y of [5.42,6.48,7.54])beam(g,[x-w/2,y,-.10],[x+w/2,y,-.10],.025,steel);
   block(g,w+.10,.10,.34,x,5.36,-.05,stone);

  }block(g,.24,4.18,.35,span/2-.12,6.7,-.12,stone);g.traverse(o=>{if(o.isMesh&&o.material===stone){o.geometry=o.geometry.clone();const uv=o.geometry.attributes.uv;for(let n=0;n<uv.count;n++)uv.setXY(n,uv.getX(n)*Math.max(.2,o.scale.x/2),uv.getY(n)*Math.max(.2,o.scale.y/2));}});return g;
 }
 for(const run of mainWallRuns()){const frame=wallFrame(run);frame.add(panel(Math.hypot(run.xb-run.xa,run.b-run.a)));walls.add(frame);mainWallSurface(sides,run,3.17,3.38,blue);}
 const left=panel(venueRear+C.halfLength);left.position.set(C.roofOuterX,0,(venueRear-C.halfLength)/2);left.rotation.y=Math.PI/2;walls.add(left);
 for(const side of [-1,1]){const g=new THREE.Group(),z=side>0?venueRear:-C.halfLength,right=wallX(z);g.userData.endSide=side;const face=panel(right-C.roofOuterX);face.position.set((right+C.roofOuterX)/2,0,z);face.rotation.y=side>0?Math.PI:0;g.add(face);ends.push(g);}
 // Broad barrel roof, exposed triangulated steel, longitudinal purlins and suspended lamps.
 for(let z=-13;z<venueRear;z+=4){const truss=new THREE.Group();truss.userData.trussZ=z;sides.add(truss);rafters.push(truss);const top=x=>8.95+2.4*Math.sqrt(Math.max(0,1-((x+1)/6.5)**2));for(let n=0;n<14;n++){const x=-7.2+n*12.5/14,xx=x+12.5/14;beam(truss,[x,top(x),z],[xx,top(xx),z],.075,steel);beam(truss,[x,top(x)-.5,z],[xx,top(xx)-.5,z],.045,steel);beam(truss,[x,top(x)-.5,z],[xx,top(xx),z],.026,steel);}for(const x of [-4,2]){beam(truss,[x,top(x)-.4,z],[x,8.55,z],.012,steel);block(truss,.70,.07,.28,x,8.51,z,lamp);}
  for(const x of [-5,-2,1,4])beam(truss,[x,top(x),z],[x,top(x),z+3.95],.025,steel);
 }
 let active=false,overview=false;return {sides,ends,setVisible(on,over=false){active=on;overview=over;sides.visible=on;walls.visible=!over;for(const g of ends)g.visible=on&&!over;},setEndView(side){for(const truss of rafters)truss.visible=active&&!overview&&truss.userData.trussZ*side<2;},update(){}};
}
