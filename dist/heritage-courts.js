import * as THREE from './three.module.js';
import {COURT as C,wallX} from './court-geometry.js';
import {mainWallRuns,wallFrame,mainWallSurface,venueRear,wallSurface} from './venue-walls.js';
import {block,beam,finish} from './venue-tools.js';
import {architecturalGlass} from './window-glass.js';
export const HERITAGE_IDS=['16','17','18','19'];
const random=seed=>()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);
function canvasMap(paint,transparent=false){if(typeof document==='undefined')return null;const c=document.createElement('canvas');c.width=c.height=512;paint(c.getContext('2d'),random(381));const map=new THREE.CanvasTexture(c);map.colorSpace=THREE.SRGBColorSpace;map.wrapS=map.wrapT=THREE.RepeatWrapping;map.userData.heritageTexture=true;return map;}
function masonryMap(id){return canvasMap((c,rnd)=>{const base={'15':'#88513f','16':'#b8aa91','17':'#719a92','18':'#85867b','19':'#bb8e75'}[id];c.fillStyle=base;c.fillRect(0,0,512,512);
 if(id==='15'||id==='16'||id==='17'){const w=id==='15'?80:id==='16'?126:32,h=id==='15'?32:id==='16'?76:32;c.strokeStyle=id==='17'?'#596f6955':'#493e3455';c.lineWidth=id==='17'?2:3;for(let y=0;y<512;y+=h)for(let x=(y/h%2&&id!=='17')?-w/2:0;x<512;x+=w){c.fillStyle=id==='15'?['#995942','#9c634c','#7d5141','#ac7458'][Math.floor(rnd()*4)]:id==='16'?['#c0b49a','#b4a68b','#cbbda3'][Math.floor(rnd()*3)]:['#83aaa1','#92b5a9','#789c94','#9bb8ac'][Math.floor(rnd()*4)];c.fillRect(x+1,y+1,w-2,h-2);c.strokeRect(x,y,w,h);}}
 for(let i=0;i<6500;i++){c.fillStyle=i%2?'#ffffff0c':'#15221e12';c.fillRect(rnd()*512,rnd()*512,1+rnd()*7,1+rnd()*3);}
 for(let i=0;i<40;i++){const x=rnd()*512,y=rnd()*512;c.strokeStyle=id==='18'?'#704d2e45':'#2f393339';c.lineWidth=.6+rnd()*2;c.beginPath();c.moveTo(x,y);c.lineTo(x+3+rnd()*15,y+12+rnd()*50);c.lineTo(x-5+rnd()*20,y+30+rnd()*55);c.stroke();}
 if(id==='19'){for(let i=0;i<25;i++){const x=rnd()*512,y=rnd()*512;c.fillStyle='#9e655349';c.fillRect(x,y,12+rnd()*45,6+rnd()*15);}}
 });}
function ivyMap(){return canvasMap((c,rnd)=>{for(let i=0;i<1350;i++){const x=rnd()*512,y=rnd()*512;if(y>280&&rnd()<(y-280)/235)continue;c.fillStyle=['#24472e','#3e6134','#55713b','#6a7c44','#304e2f'][Math.floor(rnd()*5)];c.beginPath();c.ellipse(x,y,3+rnd()*8,2+rnd()*5,rnd()*Math.PI,0,Math.PI*2);c.fill();}},true);}
export function setHeritageWallUV(mesh){const p=mesh.geometry?.attributes.position,uv=mesh.geometry?.attributes.uv;if(!p||!uv)return;mesh.updateWorldMatrix(true,false);const v=new THREE.Vector3(),n=new THREE.Vector3().fromBufferAttribute(mesh.geometry.attributes.normal,0).transformDirection(mesh.matrixWorld),alongZ=Math.abs(n.x)>Math.abs(n.z);for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i).applyMatrix4(mesh.matrixWorld);uv.setXY(i,(alongZ?v.z:v.x)/4,v.y/2);}uv.needsUpdate=true;}
function archShape(x,bottom,spring,r){const shape=new THREE.Shape();shape.moveTo(x-r,bottom);shape.lineTo(x+r,bottom);shape.lineTo(x+r,spring);shape.absarc(x,spring,r,0,Math.PI,false);shape.lineTo(x-r,bottom);shape.closePath();return shape;}
export function buildHeritageCourt(id){if(!HERITAGE_IDS.includes(id))throw Error('Unknown heritage venue');
 const sides=new THREE.Group(),upper=new THREE.Group(),ends=[],overhead=[],wallMap=masonryMap(id),rough=finish('#ffffff',{map:wallMap,side:THREE.DoubleSide}),iron=finish(id==='15'?'#315c48':id==='19'?'#345b4d':'#606762',{metalness:.45}),stone=finish(id==='16'?'#baa88b':'#aca89a'),brass=finish('#a58b50',{metalness:.55}),glass=architecturalGlass(.32),ivy=finish('#ffffff',{map:ivyMap(),transparent:true,alphaTest:.2,side:THREE.DoubleSide});sides.add(upper);sides.userData.heritageVenue=id;
 function railing(g,span,y=4.4){for(let x=-span/2;x<=span/2+.01;x+=Math.max(.2,span/Math.ceil(span/1.15)))beam(g,[x,y-.85,.05],[x,y,.05],.018,iron);beam(g,[-span/2,y,.05],[span/2,y,.05],.025,iron);}
 function archedPanel(span,height=11.3,venice=false){const g=new THREE.Group(),shape=new THREE.Shape();shape.moveTo(-span/2,3.4);shape.lineTo(span/2,3.4);shape.lineTo(span/2,height);shape.lineTo(-span/2,height);shape.closePath();const count=Math.max(1,Math.floor(span/(venice?3.1:4.1))),step=span/count;
  for(let i=0;i<count;i++)for(const row of (venice?[0,1]:[0])){const x=-span/2+(i+.5)*step,r=Math.min(venice?.55:1.1,step*.31),bottom=venice?5.25+row*2.55:5.0,spring=venice?7+row*2.55:8.6,arch=archShape(x,bottom,spring,r);shape.holes.push(new THREE.Path(arch.getPoints(20).reverse()));const pane=new THREE.Mesh(new THREE.ShapeGeometry(arch,20),glass);const pos=pane.geometry.attributes.position,uv=pane.geometry.attributes.uv;for(let j=0;j<uv.count;j++)uv.setXY(j,(pos.getX(j)-x+r)/(2*r),(pos.getY(j)-bottom)/(spring+r-bottom));pane.position.z=-.19;pane.userData.heritageWindow=true;g.add(pane);
   for(let n=0;n<16;n++){const a=n*Math.PI/16,b=(n+1)*Math.PI/16;beam(g,[x+r*Math.cos(a),spring+r*Math.sin(a),.025],[x+r*Math.cos(b),spring+r*Math.sin(b),.025],.045,venice?stone:brass);}for(const dx of [-r,r])block(g,.12,spring-bottom,.26,x+dx,(spring+bottom)/2,-.02,stone);
   if(venice){for(const side of [-1,1]){const shutter=block(g,.42,1.8,.06,x+side*(r+.27),6.28+row*2.55,.10,iron);shutter.rotation.y=side*.25;for(let y=5.5+row*2.55;y<7.1+row*2.55;y+=.14)block(g,.38,.025,.04,x+side*(r+.27),y,.145,stone);}block(g,2*r+.7,.12,.66,x,5.1+row*2.55,.22,stone);for(const dx of [-r-.2,0,r+.2])beam(g,[x+dx,5.15+row*2.55,.47],[x+dx,5.75+row*2.55,.47],.012,iron);beam(g,[x-r-.2,5.75+row*2.55,.47],[x+r+.2,5.75+row*2.55,.47],.018,iron);}
   else {beam(g,[x,bottom,-.05],[x,spring+r,-.05],.035,brass);for(const y of [6.2,7.4,8.6])beam(g,[x-r,y,-.05],[x+r,y,-.05],.025,brass);block(g,.34,height-3.4,.42,x-step/2+.17,(height+3.4)/2,-.02,stone);}
  }
  const wall=new THREE.Mesh(new THREE.ExtrudeGeometry(shape,{depth:.20,bevelEnabled:false,curveSegments:20}),rough);wall.position.z=-.22;wall.receiveShadow=true;wall.userData.heritageUpperWall=true;const wallUV=wall.geometry.attributes.uv;for(let j=0;j<wallUV.count;j++)wallUV.setXY(j,wallUV.getX(j)/4,wallUV.getY(j)/2);g.add(wall);block(g,span,.18,.28,0,3.5,.025,stone);block(g,span,.18,.32,0,height-.1,0,stone);return g;
 }
 function panel(span,kind=id){const g=new THREE.Group();
  if(kind==='16'||kind==='19')return archedPanel(span,kind==='16'?11.3:10.2,kind==='19');
  const top=kind==='15'?5.5:kind==='17'?4.5:6.4;const wall=block(g,span,top-3.4,.22,0,(top+3.4)/2,-.12,rough);wall.userData.heritageUpperWall=true;wall.geometry=wall.geometry.clone();const wallUV=wall.geometry.attributes.uv;for(let j=0;j<wallUV.count;j++)wallUV.setXY(j,wallUV.getX(j)*span/4,wallUV.getY(j)*(top-3.4)/2);block(g,span,.14,.42,0,top,.01,stone);
  if(kind==='15'){const leaves=new THREE.Mesh(new THREE.PlaneGeometry(span,3.2),ivy);leaves.position.set(0,3.9,.018);const uv=leaves.geometry.attributes.uv;for(let n=0;n<uv.count;n++)uv.setX(n,uv.getX(n)*span/3);leaves.userData.wrigleyIvy=true;g.add(leaves);railing(g,span,6.5);}
  if(kind==='17'){
   // Short ladders hang just beneath the coping, safely above player height.
   const count=span>5?Math.max(1,Math.floor(span/12)):0;for(let i=0;i<count;i++){const x=-span/2+(i+.5)*span/count,ladder=new THREE.Group();ladder.position.x=x;ladder.userData.poolLadder=true;g.add(ladder);
    for(const side of [-1,1]){const X=side*.32,V=(y,z)=>new THREE.Vector3(X,y,z),path=new THREE.CurvePath();path.add(new THREE.QuadraticBezierCurve3(V(3.65,.27),V(3.68,.43),V(3.80,.43)));path.add(new THREE.LineCurve3(V(3.80,.43),V(4.45,.43)));path.add(new THREE.CubicBezierCurve3(V(4.45,.43),V(5.3,.43),V(5.3,-.36),V(4.45,-.36)));const rail=new THREE.Mesh(new THREE.TubeGeometry(path,96,.032,10,false),iron);rail.userData.ladderRail=true;ladder.add(rail);}
    for(let y=3.80;y<=4.35;y+=.25){const tread=block(ladder,.64,.045,.13,0,y,.43,iron);tread.userData.ladderTread=true;}
   }for(let x=-span/2+.3;x<span/2;x+=2.4)for(let n=0;n<3;n++)beam(g,[x,4.55,0],[x+(n-1)*.12,4.8+n*.10,.04],.012,finish('#606747'));
  }
  if(kind==='18'){railing(g,span,7.4);for(let x=-span/2+.6;x<span/2;x+=3){block(g,.26,.25,.35,x,6.6,.02,iron);block(g,.48,.10,.25,x,6.74,.02,iron);beam(g,[x,3.5,.04],[x,6.3,.04],.035,iron);for(let y=3.6;y<6.3;y+=.3)beam(g,[x-.23,y,.05],[x+.23,y,.05],.022,iron);}}
  return g;
 }
 for(const run of mainWallRuns()){const frame=wallFrame(run),span=Math.hypot(run.xb-run.xa,run.b-run.a);if(id!=='19')frame.add(panel(span));if(id==='19'){// The visible canal-side wall reaches the same out line as the ball collision wall.
   const canalWall=mainWallSurface(sides,run,3.4,6.1,rough);canalWall.userData.canalCourtWall=true;setHeritageWallUV(canalWall);block(frame,span,.14,.30,0,6.12,0,stone);
  }upper.add(frame);mainWallSurface(sides,run,3.16,3.38,id==='16'?brass:stone);}
 const left=panel(venueRear+C.halfLength);left.position.set(C.roofOuterX,0,(venueRear-C.halfLength)/2);left.rotation.y=Math.PI/2;upper.add(left);
 for(const side of [-1,1]){const g=new THREE.Group(),z=side>0?venueRear:-C.halfLength,span=wallX(z)-C.roofOuterX;g.userData.endSide=side;const p=panel(span);p.position.set((wallX(z)+C.roofOuterX)/2,0,z);p.rotation.y=side>0?Math.PI:0;g.add(p);ends.push(g);}
 let reflectionMap=null,causticsMap=null;
 if(id==='16'){
  const ceilingMat=finish('#456c70',{side:THREE.DoubleSide}),gold=new THREE.MeshBasicMaterial({color:'#cfb775'}),rnd=random(717);
  for(let z=-C.halfLength;z<venueRear;z+=3.6){const roof=new THREE.Group();roof.userData.trussZ=z;overhead.push(roof);sides.add(roof);const height=x=>11.4+4.6*Math.sqrt(Math.max(0,1-((x+1.15)/6.45)**2));for(let n=0;n<16;n++){const x=-7.5+n*12.8/16,xx=x+12.8/16;wallSurface(roof,[[x,height(x),z],[xx,height(xx),z],[xx,height(xx),z+3.6],[x,height(x),z+3.6]],ceilingMat);beam(roof,[x,height(x)-.04,z],[xx,height(xx)-.04,z],.035,brass);}for(let n=0;n<17;n++){const x=-6.6+rnd()*11.4,y=height(x)-.06,Z=z+rnd()*3.5;beam(roof,[x-.055,y,Z],[x+.055,y,Z],.009,gold);beam(roof,[x,y,Z-.075],[x,y,Z+.075],.009,gold);if(n%3===0)beam(roof,[x,y,Z],[x+.32,height(x+.32)-.06,Z+.35],.003,gold);}}
  for(const end of ends){const face=end.children[0],clock=new THREE.Group();clock.position.set(0,10.1,.20);face.add(clock);const rim=new THREE.Mesh(new THREE.TorusGeometry(.35,.035,8,32),brass);clock.add(rim);block(clock,.018,.24,.025,0,.09,.02,iron);const hand=block(clock,.22,.018,.025,.09,-.02,.025,iron);hand.rotation.z=.24;}
 }
 if(id==='17'){
  for(let z=-13;z<venueRear;z+=4.5){const roof=new THREE.Group();roof.userData.trussZ=z;sides.add(roof);overhead.push(roof);beam(roof,[-7.4,8,z],[-1,9.5,z],.055,iron);beam(roof,[-1,9.5,z],[5.3,8,z],.055,iron);beam(roof,[-7.4,8,z],[5.3,8,z],.04,iron);for(let x=-6;x<5;x+=2)beam(roof,[x,8,z],[x+1,9.1-Math.abs(x+1)*.12,z],.022,iron);const skylight=new THREE.Mesh(new THREE.PlaneGeometry(12,3.9),architecturalGlass(.22));skylight.rotation.x=Math.PI/2;skylight.position.set(-1,9.6,z+2);roof.add(skylight);}

 }
 if(id==='19'){
  // A continuous canal and bank run well beyond the camera in either direction.
  const canalNear=5.3,canalFar=13.5,extent=120,waterLevel=-.28;
  reflectionMap=canvasMap((c,rnd)=>{const depth=c.createLinearGradient(0,0,512,0);depth.addColorStop(0,'#2b5149');depth.addColorStop(.45,'#3a655a');depth.addColorStop(1,'#6b7d64');c.fillStyle=depth;c.fillRect(0,0,512,512);
   for(let n=0;n<1400;n++){const x=rnd()*512,y=rnd()*512,w=3+rnd()*38;c.strokeStyle=['#b4a07829','#c1ae8524','#28534740','#91aaa52b','#4a655b40'][n%5];c.lineWidth=.5+rnd()*2;c.beginPath();c.moveTo(x,y);c.quadraticCurveTo(x+w*.5,y-1+rnd()*3,x+w,y+(rnd()-.5)*3);c.stroke();}
   for(let n=0;n<120;n++){const x=290+rnd()*210,y=rnd()*512;c.fillStyle=n%3?'#bba17d22':'#234d4029';c.fillRect(x,y,3+rnd()*19,2+rnd()*12);}
  });
  const size=128,data=new Uint8Array(size*size*4);for(let y=0;y<size;y++)for(let x=0;x<size;x++){const i=(y*size+x)*4,dx=.15*Math.sin(x*.21+y*.31)+.07*Math.sin(x*.57-y*.19),dy=.12*Math.cos(x*.26-y*.43)+.06*Math.sin(y*.51);data[i]=Math.round(128+dx*127);data[i+1]=Math.round(128+dy*127);data[i+2]=250;data[i+3]=255;}
  const normals=new THREE.DataTexture(data,size,size,THREE.RGBAFormat);normals.wrapS=normals.wrapT=THREE.RepeatWrapping;normals.repeat.set(3,65);normals.needsUpdate=true;
  reflectionMap?.repeat.set(1,20);const waterMaterial=new THREE.MeshPhysicalMaterial({color:'#a1b5a5',map:reflectionMap,normalMap:normals,normalScale:new THREE.Vector2(.38,.38),metalness:.12,roughness:.28,clearcoat:.6,clearcoatRoughness:.2});
  const water=new THREE.Mesh(new THREE.PlaneGeometry(canalFar-canalNear,extent*2),waterMaterial);water.rotation.x=-Math.PI/2;water.position.set((canalNear+canalFar)/2,waterLevel,0);water.userData.venetianCanal=true;water.userData.canalBounds={near:canalNear,far:canalFar,extent,waterLevel};upper.add(water);
  const bank=new THREE.Group();bank.position.x=canalFar;bank.rotation.y=-Math.PI/2;bank.userData.canalBank=true;upper.add(bank);
  const face=archedPanel(80,12,true);face.userData.canalFacade=true;bank.add(face);
  const base=block(bank,extent*2,5.4,.45,0,.70,-.23,rough);base.geometry=base.geometry.clone();const buv=base.geometry.attributes.uv;for(let n=0;n<buv.count;n++)buv.setXY(n,buv.getX(n)*extent/2,buv.getY(n)*2.7);base.userData.canalBuildingBase=true;
  for(const side of [-1,1]){const continuation=block(bank,extent-40,8.6,.45,side*(40+(extent-40)/2),7.7,-.23,rough);continuation.geometry=continuation.geometry.clone();const cuv=continuation.geometry.attributes.uv;for(let n=0;n<cuv.count;n++)cuv.setXY(n,cuv.getX(n)*(extent-40)/4,cuv.getY(n)*4.3);continuation.userData.canalBankContinuation=true;}
  const quay=new THREE.Mesh(new THREE.PlaneGeometry(1.2,extent*2),stone);quay.rotation.x=-Math.PI/2;quay.position.set(canalNear-.60,waterLevel+.05,0);upper.add(quay);
  causticsMap=canvasMap((c,rnd)=>{for(let y=0;y<512;y+=32){c.strokeStyle='#b9dfab66';c.lineWidth=2;c.beginPath();for(let x=0;x<=512;x+=12)c.lineTo(x,y+Math.sin(x*.035+y)*12);c.stroke();}});const shimmer=new THREE.MeshBasicMaterial({color:'#a7c9a8',map:causticsMap,transparent:true,opacity:.13,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending,polygonOffset:true,polygonOffsetFactor:-1});for(const run of mainWallRuns()){const patch=mainWallSurface(sides,run,1.5,3.1,shimmer);patch.userData.canalReflection=true;setHeritageWallUV(patch);}
  // Tile eaves and chimney pots complete the surrounding courtyard facades.
  for(const parent of [left,...ends.map(e=>e.children[0])]){block(parent,4.5,.18,1.1,0,10.3,-.10,finish('#9e6049'));for(const x of [-1.6,1.6])block(parent,.35,.8,.4,x,10.7,-.2,rough);}
 }
 let active=false,overview=false,time=0;return {sides,ends,wallMap,setVisible(on,over=false){active=on;overview=over;sides.visible=on;upper.visible=!over;for(const e of ends)e.visible=on&&!over;},setEndView(side){for(const roof of overhead)roof.visible=active&&!overview&&roof.userData.trussZ*side<2;},update(dt){if(active&&id==='19'&&reflectionMap){time+=dt;reflectionMap.offset.set(Math.sin(time*.18)*.03,time*.002);if(causticsMap)causticsMap.offset.set(Math.sin(time*.35)*.08,time*.015);const water=upper.children.find(o=>o.userData.venetianCanal);if(water?.material.normalMap)water.material.normalMap.offset.set(time*.012,Math.sin(time*.2)*.02);}}};
}
