import * as THREE from './three.module.js';
import {COURT as C,wallX} from './court-geometry.js';
export function buildCamdenHall({box,brickMap}){const sides=new THREE.Group(),ends=[],brick=new THREE.MeshStandardMaterial({color:'#a55a3d',map:brickMap,roughness:.96,side:THREE.DoubleSide}),iron=new THREE.MeshStandardMaterial({color:'#263f36',roughness:.68,metalness:.35}),stone=new THREE.MeshStandardMaterial({color:'#a79d82',roughness:.94}),amber=new THREE.MeshBasicMaterial({color:'#ffd798'}),glass=new THREE.MeshBasicMaterial({color:'#b6cad0',transparent:true,opacity:.7,side:THREE.DoubleSide}),rear=C.halfLength+(C.halfLength-C.endRoofInner),length=rear+C.halfLength,mid=(rear-C.halfLength)/2,add=(g,o)=>{g.add(o);return o;};sides.userData.camdenHall=true;
const roofTrusses=new THREE.Group();roofTrusses.userData.overheadTrusses=true;sides.add(roofTrusses);const truss=new THREE.MeshStandardMaterial({color:'#263f36',roughness:.68,metalness:.35,transparent:true,opacity:.20,depthWrite:false});
const unitBox=new THREE.BoxGeometry(1,1,1),rodGeometry=new THREE.CylinderGeometry(1,1,1,6),up=new THREE.Vector3(0,1,0);
function block(g,w,h,d,x,y,z,m){const o=new THREE.Mesh(unitBox,m);o.scale.set(w,h,d);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;return add(g,o);}
function beam(g,a,b,r=.035,m=iron){if(g.userData.overheadTrusses)m=truss;const A=new THREE.Vector3(...a),B=new THREE.Vector3(...b),delta=B.clone().sub(A),o=new THREE.Mesh(rodGeometry,m);o.position.copy(A).add(B).multiplyScalar(.5);o.scale.set(r,delta.length(),r);o.quaternion.setFromUnitVectors(up,delta.normalize());o.castShadow=true;return add(g,o);}
function wall(span,centres,sideWall=false){const group=new THREE.Group(),outer=new THREE.Shape();outer.moveTo(-span/2,3.4);outer.lineTo(span/2,3.4);outer.lineTo(span/2,8.1);outer.lineTo(-span/2,8.1);outer.closePath();
for(const u of centres){const w=.73,bottom=sideWall?6.15:4.45,spring=sideWall?6.72:6.45,path=new THREE.Path();path.moveTo(u-w,bottom);path.lineTo(u-w,spring);path.absarc(u,spring,w,Math.PI,0,true);path.lineTo(u+w,bottom);path.closePath();outer.holes.push(path);
const paneShape=new THREE.Shape();paneShape.moveTo(u-w,bottom);paneShape.lineTo(u+w,bottom);paneShape.lineTo(u+w,spring);paneShape.absarc(u,spring,w,0,Math.PI,false);paneShape.lineTo(u-w,bottom);const pane=new THREE.Mesh(new THREE.ShapeGeometry(paneShape,12),glass);pane.position.z=-.12;pane.userData.warehouseWindow=true;pane.userData.sideWindow=sideWall;pane.userData.bottom=bottom;add(group,pane);
beam(group,[u-w,bottom,.035],[u+w,bottom,.035],.045);for(const edge of [-1,1])beam(group,[u+edge*w,bottom,.035],[u+edge*w,spring,.035],.045);
for(let a=0;a<Math.PI;a+=Math.PI/12)beam(group,[u+Math.cos(a)*w,spring+Math.sin(a)*w,.035],[u+Math.cos(a+Math.PI/12)*w,spring+Math.sin(a+Math.PI/12)*w,.035],.045);
for(const dx of [-.24,.24])beam(group,[u+dx,bottom,.035],[u+dx,spring+Math.sqrt(w*w-dx*dx),.035],.022);for(const y of (sideWall?[6.72]:[5.13,5.8,6.45]))beam(group,[u-w,y,.035],[u+w,y,.035],.023);
block(group,1.7,.14,.36,u,bottom-.07,.04,stone);
// Brick arch voussoirs and a small warehouse lamp under each pier.
for(let a=0;a<Math.PI;a+=Math.PI/9){const o=block(group,.14,.25,.12,u+Math.cos(a+.17)*.91,spring+Math.sin(a+.17)*.91,.01,brick);o.rotation.z=a+.17-Math.PI/2;}
const lampU=u+1.25,lampY=sideWall?6.12:4.1;block(group,.15,.33,.15,lampU,lampY,.22,iron);block(group,.11,.23,.16,lampU,lampY,.24,amber);block(group,.24,.05,.24,lampU,lampY+.2,.22,iron);}
const geometry=new THREE.ShapeGeometry(outer,12),uv=geometry.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)/1.4,uv.getY(i)/1.3);const wallMesh=new THREE.Mesh(geometry,brick);wallMesh.castShadow=wallMesh.receiveShadow=true;add(group,wallMesh);
for(const y of (sideWall?[7.7,8.05]:[3.6,7.7,8.05]))block(group,span,.14,.23,0,y,.025,y===3.6?iron:stone);
for(let u=-span/2+.24;u<span/2;u+=4.8){block(group,.32,sideWall?2.2:4.7,.24,u,sideWall?6.95:5.75,.02,brick);block(group,.38,.2,.30,u,7.72,.08,stone);}
return group;}
const left=wall(length,[-12,-7.2,-2.4,2.4,7.2,12],true);left.position.set(C.roofOuterX,0,mid);left.rotation.y=Math.PI/2;add(sides,left);
// The main-wall brick faces share the exact straight/angled tambour profile used by ball collisions.
for(const [a,b]of [[-C.halfLength,C.tambourEnd],[C.tambourEnd,C.tambourStart],[C.tambourStart,rear]]){const xa=wallX(a),xb=wallX(b),span=Math.hypot(xb-xa,b-a),centres=[-13,-7,-2,3,8,13].filter(z=>z>a+1.15&&z<b-1.15).map(z=>(z-(a+b)/2)*span/(b-a)),group=wall(span,centres,true);group.position.set((xa+xb)/2,0,(a+b)/2);group.rotation.y=Math.atan2(-(b-a),xb-xa);group.userData.mainBrickSection={a,b};add(sides,group);}
for(const side of [-1,1]){const g=new THREE.Group(),face=wall(5-C.roofOuterX,[-4.4,-1.5,1.5,4.4]);face.position.x=(5+C.roofOuterX)/2;face.rotation.y=side>0?Math.PI:0;g.add(face);g.position.z=side>0?rear+.2:-C.halfLength-.2;g.userData.endSide=side;ends.push(g);}
// Warehouse roof trusses frame the sky without obscuring the playing court.
for(let z=-C.halfLength+1;z<rear;z+=5.2){const a=[C.roofOuterX,7.82,z],b=[-1.08,9.55,z],c=[5,7.82,z];beam(roofTrusses,a,b,.065);beam(roofTrusses,b,c,.065);beam(roofTrusses,a,c,.045);for(const x of [-5.6,-4,-2.4,-.8,.8,2.4,4]){const top=9.55-Math.abs(x+1.08)/6.1*1.73;beam(roofTrusses,[x,7.82,z],[x,top,z],.025);}for(const x of [-5,-1,3]){block(roofTrusses,.2,.2,.07,x,7.82,z,iron);for(const dx of [-.05,.05])block(roofTrusses,.025,.025,.08,x+dx,7.83,z,stone);}}
for(const x of [C.roofOuterX,-1.08,5])beam(roofTrusses,[x,x===-1.08?9.55:7.82,-C.halfLength],[x,x===-1.08?9.55:7.82,rear],.04);
return {sides,ends,setVisible(active,overview=false){sides.visible=active&&!overview;for(const g of ends)g.visible=active&&!overview;}};}
