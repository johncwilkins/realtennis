import * as THREE from './three.module.js';
import {COURT as C,wallX} from './court-geometry.js';
import {mainWallRuns,mainWallSurface,wallSurface,venueRear} from './venue-walls.js';
export const SPHERE_WALL_HEIGHT=42;
const savedUV=new WeakMap();
export function sphereWallUV(p){const x=p.x+1.08,z=p.z-1;const u=.5+Math.atan2(z,x)/(2*Math.PI);return [u,.12+.88*p.y/SPHERE_WALL_HEIGHT];}
export function setSphereWallUV(mesh,active){const g=mesh.geometry,uv=g?.attributes.uv;if(!uv)return;if(!savedUV.has(g))savedUV.set(g,uv.array.slice());if(!active){uv.array.set(savedUV.get(g));uv.needsUpdate=true;return;}mesh.updateWorldMatrix(true,false);const p=g.attributes.position,v=new THREE.Vector3();for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i).applyMatrix4(mesh.matrixWorld);const [u,w]=sphereWallUV(v);uv.setXY(i,u,w);}uv.needsUpdate=true;}
export const SPHERE_SHOWS=['Nebula currents','Hyperspace lattice','Liquid prism','Bioluminescent depths'];
export function sphereShow(time){const cycle=((time%96)+96)%96;return {index:Math.floor(cycle/24),next:(Math.floor(cycle/24)+1)%4,blend:Math.max(0,(cycle%24-20)/4)};}
export function buildSphereHall(){
 const sides=new THREE.Group(),ends=[],walls=new THREE.Group();sides.add(walls);sides.userData.sphereHall=true;let time=0,last=-1,active=false;
 const canvas=typeof document!=='undefined'?document.createElement('canvas'):null;if(canvas){canvas.width=1536;canvas.height=768;}const ctx=canvas?.getContext('2d'),map=canvas?new THREE.CanvasTexture(canvas):null;if(map){map.colorSpace=THREE.SRGBColorSpace;map.userData.animated=true;map.wrapS=THREE.RepeatWrapping;}
 // Tall planar display walls fill the view; there is no background dome.
 const upperDisplay=new THREE.MeshBasicMaterial({color:'#c4d4dc',map,side:THREE.DoubleSide,fog:false}),lowerDisplay=new THREE.MeshBasicMaterial({color:'#647d91',map,side:THREE.DoubleSide,fog:false});
 const uvAt=sphereWallUV;
 function panel(group,corners,material){const o=wallSurface(group,corners,material,uvAt);o.userData.sphereScreenWall=true;return o;}
 for(const run of mainWallRuns()){for(const [low,high,material]of [[3.4,SPHERE_WALL_HEIGHT,upperDisplay]]){const o=mainWallSurface(walls,run,low,high,material,uvAt);o.userData.sphereScreenWall=true;}
  // A narrow top cap and an out line make the wall plane readable against the animated wall.
  const edge=new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(run.xa-.024,6.4,run.a),new THREE.Vector3(run.xb-.024,6.4,run.b)]),new THREE.LineBasicMaterial({color:'#7eaabb'}));walls.add(edge);
 }
 panel(walls,[[C.roofOuterX+.012,3.4,-C.halfLength],[C.roofOuterX+.012,3.4,venueRear],[C.roofOuterX+.012,SPHERE_WALL_HEIGHT,venueRear],[C.roofOuterX+.012,SPHERE_WALL_HEIGHT,-C.halfLength]],upperDisplay);
 for(const side of [-1,1]){const g=new THREE.Group();g.userData.endSide=side;const rear=side>0?venueRear:-C.halfLength,xr=wallX(rear),z=rear-side*.014;panel(g,[[C.roofOuterX,3.4,z],[xr,3.4,z],[xr,SPHERE_WALL_HEIGHT,z],[C.roofOuterX,SPHERE_WALL_HEIGHT,z]],upperDisplay);
  ends.push(g);
 }
 let seed=1237;const random=()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296;};const stars=Array.from({length:360},()=>({x:random()*1536,y:random()*768,r:.7+random()*2.2,p:random()*6.28}));
 function paint(show,t,alpha){const w=1536,h=768;ctx.save();ctx.globalAlpha=alpha;ctx.fillStyle='#030c1c';ctx.fillRect(0,0,w,h);
 function glow(x,y,r,color){const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,color);g.addColorStop(.4,color.slice(0,7)+'75');g.addColorStop(1,color.slice(0,7)+'00');ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2);}
 const drift=t*.10;
 if(show===0){
  // Layered nebula clouds, hundreds of stars and fine luminous currents.
  for(let i=0;i<9;i++)glow((i*239+Math.sin(drift+i)*95)%w,160+(i%3)*190+Math.cos(drift*.6+i)*75,230+i%3*60,['#17437b','#51428b','#146b76'][i%3]);
  for(let layer=0;layer<32;layer++){ctx.beginPath();for(let x=0;x<=w;x+=12){const y=190+layer*12+Math.sin(x*.004+drift+layer*.055)*125+Math.sin(x*.011-drift*.7+layer*.10)*35;x?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.lineWidth=layer%5===0?2.4:1.1;ctx.strokeStyle=`hsla(${175+layer*3},68%,${45+layer%6*4}%,${layer%5===0?.65:.24})`;ctx.stroke();}
 }
 if(show===1){
  const cx=w*.52+Math.sin(t*.04)*100,cy=h*.48;glow(cx,cy,410,'#19326c');glow(cx,cy,145,'#503a82');
  for(let ring=0;ring<22;ring++){const p=(ring/22+t*.022)%1,r=30+p*p*1050,spin=t*.025+p*.7;ctx.beginPath();for(let n=0;n<=12;n++){const a=n/12*Math.PI*2+spin,x=cx+Math.cos(a)*r,y=cy+Math.sin(a)*r*.53;n?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.lineWidth=.7+p*2.5;ctx.strokeStyle=`hsla(${185+p*80},72%,65%,${.10+p*.55})`;ctx.stroke();}
  for(let spoke=0;spoke<24;spoke++){const a=spoke/24*6.283+t*.025;ctx.beginPath();ctx.moveTo(cx+Math.cos(a)*30,cy+Math.sin(a)*16);ctx.lineTo(cx+Math.cos(a)*1300,cy+Math.sin(a)*690);ctx.strokeStyle='#5fbad42b';ctx.lineWidth=1;ctx.stroke();}
 }
 if(show===2){
  for(let i=0;i<7;i++)glow(i*260+Math.sin(drift+i)*75,350+Math.sin(i+drift)*160,250,['#58346e','#155d78','#3569a0'][i%3]);
  for(let row=0;row<42;row++){ctx.beginPath();for(let x=0;x<=w;x+=12){const y=row*22-70+Math.sin(x*.005+drift+row*.12)*90+Math.cos(x*.012-drift+row*.075)*35;x?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.strokeStyle=`hsla(${185+row*2.5+Math.sin(drift)*20},70%,${50+row%5*4}%,.6)`;ctx.lineWidth=row%7===0?3:1.1;ctx.stroke();}
 }
 if(show===3){
  for(let i=0;i<6;i++)glow(i*320+Math.sin(drift+i)*80,220+Math.sin(i)*150,300,['#0b5263','#173d70','#204e62'][i%3]);
  for(let row=0;row<30;row++){ctx.beginPath();for(let x=0;x<=w;x+=14){const y=150+row*22+Math.sin(x*.008+drift*1.3+row*.4)*(22+row*.6)+Math.cos(x*.017-drift*.5+row*.3)*15;x?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.strokeStyle=row%4?'#42a7ac55':'#8cdbcc99';ctx.lineWidth=row%4?1:2;ctx.stroke();}
  for(let i=0;i<12;i++){const x=(i*157+Math.sin(drift+i)*70+w)%w,y=(i*79-t*6+h*10)%h;glow(x,y,12+i%3*5,'#5bcdc6');ctx.beginPath();ctx.moveTo(x,y);ctx.quadraticCurveTo(x+12,y+28,x-5,y+58);ctx.strokeStyle='#6ac7be88';ctx.lineWidth=1;ctx.stroke();}
 }
 for(const s of stars){const x=(s.x+Math.sin(s.p+t*.015)*8+w)%w,y=(s.y+t*(show===1?7:1.1))%h;ctx.fillStyle=`rgba(204,229,244,${.28+.24*Math.sin(s.p+t*.20)})`;ctx.beginPath();ctx.arc(x,y,s.r*(show===1?.7:.55),0,6.283);ctx.fill();if(s.r>2.5){ctx.fillStyle='#a7dbdf48';ctx.fillRect(x-3,y-.4,6,.8);}}
 ctx.restore();}
 function update(dt){if(!active)return;time+=Math.max(0,dt);if(!ctx||Math.floor(time*10)===last)return;last=Math.floor(time*10);const state=sphereShow(time);paint(state.index,time,1);if(state.blend>0)paint(state.next,time,state.blend);map.needsUpdate=true;}
 if(ctx){paint(0,0,1);map.needsUpdate=true;}
 return {sides,ends,screenMap:map,shows:SPHERE_SHOWS,setVisible(on,overview=false){active=on;sides.visible=on;walls.visible=!overview;for(const g of ends)g.visible=on&&!overview;},setEndView(){},update};
}
