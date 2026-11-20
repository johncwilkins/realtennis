import * as THREE from './three.module.js';
import {COURT as C,wallX} from './court-geometry.js';
import {mainWallRuns,mainWallSurface,wallSurface,venueRear} from './venue-walls.js';
const savedUV=new WeakMap();
export function sphereWallUV(p){const x=p.x+1.08,z=p.z-1;const u=.5+Math.atan2(z,x)/(2*Math.PI);return [u,.29+p.y*.047];}
export function setSphereWallUV(mesh,active){const g=mesh.geometry,uv=g?.attributes.uv;if(!uv)return;if(!savedUV.has(g))savedUV.set(g,uv.array.slice());if(!active){uv.array.set(savedUV.get(g));uv.needsUpdate=true;return;}mesh.updateWorldMatrix(true,false);const p=g.attributes.position,v=new THREE.Vector3();for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i).applyMatrix4(mesh.matrixWorld);const [u,w]=sphereWallUV(v);uv.setXY(i,u,w);}uv.needsUpdate=true;}
export const SPHERE_SHOWS=['Aurora ribbons','Star tunnel','Prismatic waves','Bioluminescent ocean'];
export function sphereShow(time){const cycle=((time%96)+96)%96;return {index:Math.floor(cycle/24),next:(Math.floor(cycle/24)+1)%4,blend:Math.max(0,(cycle%24-20)/4)};}
export function buildSphereHall(){
 const sides=new THREE.Group(),ends=[],walls=new THREE.Group();sides.add(walls);sides.userData.sphereHall=true;let time=0,last=-1,active=false;
 const canvas=typeof document!=='undefined'?document.createElement('canvas'):null;if(canvas){canvas.width=1536;canvas.height=768;}const ctx=canvas?.getContext('2d'),map=canvas?new THREE.CanvasTexture(canvas):null;if(map){map.colorSpace=THREE.SRGBColorSpace;map.userData.animated=true;map.wrapS=THREE.RepeatWrapping;}
 const screen=new THREE.MeshBasicMaterial({color:map?'#ffffff':'#1c4262',map,side:THREE.BackSide,fog:false});const dome=new THREE.Mesh(new THREE.SphereGeometry(49,64,32),screen);dome.position.set(-1.08,-5,1);dome.userData.immersiveScreen=true;sides.add(dome);
 // The display is on solid court walls as well as the surrounding dome.
 const upperDisplay=new THREE.MeshBasicMaterial({color:'#c4d4dc',map,side:THREE.DoubleSide,fog:false}),lowerDisplay=new THREE.MeshBasicMaterial({color:'#647d91',map,side:THREE.DoubleSide,fog:false});
 const uvAt=sphereWallUV;
 function panel(group,corners,material){const o=wallSurface(group,corners,material,uvAt);o.userData.sphereScreenWall=true;return o;}
 for(const run of mainWallRuns()){for(const [low,high,material]of [[3.4,8.25,upperDisplay]]){const o=mainWallSurface(walls,run,low,high,material,uvAt);o.userData.sphereScreenWall=true;}
  // A narrow top cap and an out line make the wall plane readable against the dome.
  const edge=new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(run.xa-.024,6.4,run.a),new THREE.Vector3(run.xb-.024,6.4,run.b)]),new THREE.LineBasicMaterial({color:'#7eaabb'}));walls.add(edge);
 }
 panel(walls,[[C.roofOuterX+.012,3.4,-C.halfLength],[C.roofOuterX+.012,3.4,venueRear],[C.roofOuterX+.012,8.25,venueRear],[C.roofOuterX+.012,8.25,-C.halfLength]],upperDisplay);
 for(const side of [-1,1]){const g=new THREE.Group();g.userData.endSide=side;const rear=side>0?venueRear:-C.halfLength,xr=wallX(rear),z=rear-side*.014;panel(g,[[C.roofOuterX,3.4,z],[xr,3.4,z],[xr,8.25,z],[C.roofOuterX,8.25,z]],upperDisplay);
  ends.push(g);
 }
 let seed=1237;const random=()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296;};const stars=Array.from({length:360},()=>({x:random()*1536,y:random()*768,r:.7+random()*2.2,p:random()*6.28}));
 function paint(show,t,alpha){const w=1536,h=768;ctx.save();ctx.globalAlpha=alpha;const gradient=ctx.createLinearGradient(0,0,0,h);const colors=[['#07172c','#11424c','#183647'],['#050c27','#1a164a','#12404c'],['#162447','#3d1c53','#142e48'],['#06182f','#124b68','#102e45']][show];gradient.addColorStop(0,colors[0]);gradient.addColorStop(.55,colors[1]);gradient.addColorStop(1,colors[2]);ctx.fillStyle=gradient;ctx.fillRect(0,0,w,h);
 if(show===0){for(let band=0;band<8;band++){ctx.beginPath();for(let x=0;x<=w;x+=12){const y=240+band*35+Math.sin(x*.005+t*.14+band*.4)*105+Math.sin(x*.013-t*.11)*24;if(x===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);}ctx.strokeStyle=['#3da7a28a','#67cfbe77','#666cc075','#b464b170'][band%4];ctx.lineWidth=28+band*2;ctx.stroke();}}
 if(show===1){const cx=w*.5+Math.sin(t*.07)*130,cy=h*.44;for(let i=20;i>0;i--){const phase=(i/20+t*.018)%1,r=phase*phase*1000;ctx.beginPath();ctx.ellipse(cx,cy,r,r*.6,0,0,Math.PI*2);ctx.strokeStyle=i%2?'#6088bc88':'#65c6c377';ctx.lineWidth=2+phase*6;ctx.stroke();}for(const s of stars){const angle=s.x/w*6.28,rr=((s.y/h+t*.035)%1)**2*1000;ctx.fillStyle='#c7e3ea';ctx.beginPath();ctx.arc(cx+Math.cos(angle)*rr,cy+Math.sin(angle)*rr*.6,s.r,0,Math.PI*2);ctx.fill();}}
 if(show===2){for(let row=0;row<18;row++){ctx.beginPath();for(let x=0;x<=w;x+=16){const y=row*50+Math.sin(x*.009+t*.21+row*.5)*47;x?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.strokeStyle=`hsla(${185+row*5+Math.sin(t*.06)*25},58%,62%,.60)`;ctx.lineWidth=3;ctx.stroke();}for(let x=0;x<w;x+=96){ctx.beginPath();ctx.moveTo(x,0);ctx.bezierCurveTo(x+Math.sin(t*.1)*75,256,x-60,512,x+20,h);ctx.strokeStyle='#9896c936';ctx.stroke();}}
 if(show===3){const glow=ctx.createRadialGradient(1050,260,4,1050,260,200);glow.addColorStop(0,'#8fe3cc');glow.addColorStop(.15,'#387f8c');glow.addColorStop(1,'#14394d00');ctx.fillStyle=glow;ctx.fillRect(800,10,500,500);for(let row=0;row<34;row++){ctx.beginPath();for(let x=0;x<=w;x+=16){const y=350+row*13+Math.sin(x*.011+t*.27+row*.4)*(8+row*.6);x?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.strokeStyle=row%3?'#46aaa267':'#9bd7c978';ctx.lineWidth=1+row/26;ctx.stroke();}}
 if(show!==1)for(const s of stars){ctx.fillStyle=`rgba(188,220,228,${.35+.25*Math.sin(s.p+t*.15)})`;ctx.beginPath();ctx.arc(s.x,(s.y*.5+t*1.2)%350,s.r*.7,0,6.28);ctx.fill();}ctx.restore();}
 function update(dt){if(!active)return;time+=Math.max(0,dt);if(!ctx||Math.floor(time*10)===last)return;last=Math.floor(time*10);const state=sphereShow(time);paint(state.index,time,1);if(state.blend>0)paint(state.next,time,state.blend);map.needsUpdate=true;}
 if(ctx){paint(0,0,1);map.needsUpdate=true;}
 return {sides,ends,screenMap:map,shows:SPHERE_SHOWS,setVisible(on,overview=false){active=on;sides.visible=on;walls.visible=!overview;for(const g of ends)g.visible=on&&!overview;},setEndView(){},update};
}
