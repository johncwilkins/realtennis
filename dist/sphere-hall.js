import {SPHERE_SHOWS,SphereMotifs,paintSphereMotif} from './sphere-motifs.js';
import * as THREE from './three.module.js';
import {COURT as C,wallX} from './court-geometry.js';
import {mainWallRuns,mainWallSurface,wallSurface,venueRear} from './venue-walls.js';
export const SPHERE_WALL_HEIGHT=42;
const savedUV=new WeakMap();
export function sphereWallUV(p){const x=p.x+1.08,z=p.z-1;const u=.5+Math.atan2(z,x)/(2*Math.PI);return [u,.12+.88*p.y/SPHERE_WALL_HEIGHT];}
export function setSphereWallUV(mesh,active){const g=mesh.geometry,uv=g?.attributes.uv;if(!uv)return;if(!savedUV.has(g))savedUV.set(g,uv.array.slice());if(!active){uv.array.set(savedUV.get(g));uv.needsUpdate=true;return;}mesh.updateWorldMatrix(true,false);const p=g.attributes.position,v=new THREE.Vector3();for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i).applyMatrix4(mesh.matrixWorld);const [u,w]=sphereWallUV(v);uv.setXY(i,u,w);}uv.needsUpdate=true;}
export {SPHERE_SHOWS,sphereShow} from './sphere-motifs.js';
export function buildSphereHall(){
 const sides=new THREE.Group(),ends=[],walls=new THREE.Group();sides.add(walls);sides.userData.sphereHall=true;let time=0,last=-1,active=false;const motifs=new SphereMotifs();
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
 function update(dt){if(!active)return;time+=Math.max(0,dt);motifs.tick(dt);if(!ctx||Math.floor(time*10)===last)return;last=Math.floor(time*10);const state=motifs.state();if(state.blend<1){paintSphereMotif(ctx,state.previous,time,1);paintSphereMotif(ctx,state.index,time,state.blend);}else paintSphereMotif(ctx,state.index,time,1);map.needsUpdate=true;}
 if(ctx){paintSphereMotif(ctx,0,0,1);map.needsUpdate=true;}
 return {sides,ends,screenMap:map,shows:SPHERE_SHOWS,motifs,startSession(){motifs.startSession();},gameFinished(result){return motifs.onResult(result);},setVisible(on,overview=false){active=on;sides.visible=on;walls.visible=!overview;for(const g of ends)g.visible=on&&!overview;},setEndView(){},update};
}
