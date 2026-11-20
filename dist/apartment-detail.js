import * as THREE from './three.module.js';
import {block,finish} from './venue-tools.js';
const palettes=[['#835343','#98634e','#704b3e','#aa7356'],['#6d5044','#865e49','#987156','#765344'],['#9a7255','#876247','#ae8765','#765744'],['#73564a','#8e6553','#9d7560','#665044']];
function rng(seed){return ()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};}
function texture(paint,color=true){if(typeof document==='undefined')return null;const canvas=document.createElement('canvas');canvas.width=canvas.height=1024;paint(canvas.getContext('2d'));const map=new THREE.CanvasTexture(canvas);if(color)map.colorSpace=THREE.SRGBColorSpace;map.wrapS=map.wrapT=THREE.RepeatWrapping;map.anisotropy=4;return map;}
export function agedBrickMaterials(){return palettes.map((palette,variant)=>{
 const paint=(c,height=false)=>{const random=rng(820+variant*311);c.fillStyle=height?'#303030':'#6b6355';c.fillRect(0,0,1024,1024);for(let row=0;row<37;row++)for(let col=-1;col<13;col++){const x=col*88+(row%2)*44,y=row*28,chip=random()*2;c.fillStyle=height?`rgb(${170+Math.floor(random()*35)},${170},${170})`:palette[Math.floor(random()*palette.length)];c.fillRect(x+2+chip,y+2,83-chip,23);c.fillStyle=height?'#cccccc':'#d7bb8b24';c.fillRect(x+3,y+2,80,1.5);c.fillStyle=height?'#707070':'#241e1855';c.fillRect(x+3,y+24,81,2);for(let n=0;n<8;n++){c.fillStyle=height?'#aaaaaa':n%2?'#211e1728':'#dfcba22c';c.fillRect(x+3+random()*79,y+3+random()*20,1+random()*4,.5+random()*2);}}
  // Uneven soot, damp streaks, spalled faces and old mortar repairs.
  for(let i=0;i<110;i++){const x=random()*1024,y=random()*1024,w=2+random()*34,h=15+random()*220;c.fillStyle=height?'#99999918':'#1e29251b';c.fillRect(x,y,w,h);}for(let i=0;i<2000;i++){c.fillStyle=height?'#b4b4b433':i%3?'#d9c7a016':'#2c292421';c.fillRect(random()*1024,random()*1024,1+random()*5,1+random()*3);}
  for(let i=0;i<22;i++){const x=random()*1024,y=Math.floor(random()*36)*28;c.strokeStyle=height?'#5b5b5b':'#c3b69766';c.lineWidth=1+random()*2;c.beginPath();c.moveTo(x,y);c.lineTo(x+15,y+28);c.lineTo(x+6,y+57);c.stroke();}
 };
 const map=texture(c=>paint(c)),bumpMap=texture(c=>paint(c,true),false),m=finish('#eee4d3',{map,bumpMap,bumpScale:.026,roughness:.96,side:THREE.DoubleSide});m.userData.agedBrick=true;m.userData.brickVariant=variant;return m;
 });}
export function buildApartmentDetails({span,centre=0,bottom=-24,top=42,seed=1,brickMaterials}){
 const g=new THREE.Group(),random=rng(seed),start=centre-span/2,end=centre+span/2,columns=Math.max(1,Math.ceil(span/6.2)),bay=span/columns,geometry=new THREE.PlaneGeometry(span,top-bottom,columns,1),uv=geometry.attributes.uv,position=geometry.attributes.position;
 for(let i=0;i<uv.count;i++)uv.setXY(i,(position.getX(i)+centre)/2.7,(position.getY(i)+(bottom+top)/2)/3.2);geometry.clearGroups();const variants=[];for(let i=0;i<columns;i++){const v=Math.floor(random()*brickMaterials.length);variants.push(v);geometry.addGroup(i*6,6,v);}
 const facade=new THREE.Mesh(geometry,brickMaterials);facade.position.set(centre,(bottom+top)/2,-1.1);facade.receiveShadow=true;facade.userData.apartmentFacade=true;facade.userData.backdropExtent={bottom,top,width:span};g.add(facade);
 const stone=[finish('#9d9481'),finish('#b2a28a'),finish('#857f70')],frame=[finish('#5d6359'),finish('#817767'),finish('#c2b69b')],reveal=finish('#333730'),rooms=[finish('#26302c'),finish('#383a31'),finish('#444133'),finish('#232e30')],curtains=[finish('#a99b7e'),finish('#726e5e'),finish('#adab96')],rust=finish('#655347'),acMaterial=finish('#8a9186');
 const glasses=[.24,.32,.41].map((opacity,i)=>{const m=new THREE.MeshPhysicalMaterial({color:['#8da7a3','#a9b6a5','#789595'][i],roughness:.13+i*.045,metalness:.08,transmission:.32,thickness:.025,transparent:true,opacity,depthWrite:false,side:THREE.DoubleSide,envMapIntensity:.6});m.userData.apartmentGlass=true;return m;});
 for(let col=0;col<columns;col++){const offset=start+(col+.5)*bay,v=variants[col],spacing=2.65+random()*.24,shift=.15+random()*.3;
  // Different masonry bays have staggered floor levels, window sizes and trim.
  block(g,.10,Math.min(top,25)-2,.10,offset-bay/2,13,-1.015,stone[v%3]);
  for(let row=0,y=3.3+shift;y<Math.min(top,26);y+=spacing,row++)for(const side of [-1,1]){const x=offset+side*bay*.23;if(x<start+.6||x>end-.6)continue;const width=.95+random()*.32,height=1.52+random()*.28,stoneMat=stone[(v+row)%3],frameMat=frame[(v+col)%3],half=width/2;
   const window=new THREE.Group();window.position.set(x,y,0);window.userData.recessedApartmentWindow=true;window.userData.recessDepth=.16;window.userData.roomVariant=Math.floor(random()*4);g.add(window);
   // Dark room, side returns and objects behind genuinely translucent glazing.
   block(window,width,height,.02,0,0,-1.07,rooms[window.userData.roomVariant]);for(const edge of [-1,1])block(window,.10,height+.14,.30,edge*(half+.035),0,-.94,reveal);
   for(const edge of [-1,1])block(window,.065,height+.1,.17,edge*half,0,-.94,frameMat);for(const yy of [-height/2,height/2])block(window,width+.12,.065,.17,0,yy,-.94,frameMat);
   const curtain=curtains[Math.floor(random()*3)],open=.12+random()*.25;for(const edge of [-1,1]){const w=width*open;block(window,w,height-.1,.018,edge*(half-w/2-.035),0,-1.025,curtain);}
   block(window,width*.4,.12,.08,(random()-.5)*width*.4,-height*.34,-1.02,rooms[(window.userData.roomVariant+1)%4]);
   const pane=new THREE.Mesh(new THREE.PlaneGeometry(width-.07,height-.07),glasses[(row+col)%3]);pane.position.z=-.91;pane.userData.apartmentPane=true;window.add(pane);block(window,.035,height,.06,0,0,-.875,frameMat);block(window,width,.045,.06,0,(random()-.5)*.22,-.875,frameMat);
   block(window,width+.36,.12,.43,0,-height/2-.08,-.91,stoneMat);block(window,width+.28,.14,.24,0,height/2+.09,-.98,stoneMat);
   if(random()<.22){const ac=block(window,.54,.30,.30,side*.12,-height*.3,-.72,acMaterial);ac.userData.windowAC=true;for(let line=0;line<4;line++)block(window,.43,.014,.012,side*.12,-height*.3-.09+line*.055,-.561,rust);}
   if(random()<.16){const board=block(window,width*.7,.065,.06,0,.1,-.84,rust);board.rotation.z=(random()-.5)*.18;}
  }
 }
 // Batch static detail meshes so varied windows stay inexpensive to draw.
 g.updateMatrixWorld(true);const batches=new Map(),planeUnit=new THREE.PlaneGeometry(1,1);g.traverse(o=>{if(!o.isMesh||o===facade)return;const plane=o.geometry.type==='PlaneGeometry',key=o.material.uuid+':'+(plane?'pane':o.geometry.uuid);if(!batches.has(key))batches.set(key,{material:o.material,geometry:plane?planeUnit:o.geometry,items:[]});const matrix=o.matrixWorld.clone();if(plane)matrix.multiply(new THREE.Matrix4().makeScale(o.geometry.parameters.width,o.geometry.parameters.height,1));batches.get(key).items.push({o,matrix});});
 for(const batch of batches.values()){const positions=[],normals=[],uvs=[];for(const {o,matrix}of batch.items){const source=batch.geometry.index?batch.geometry.toNonIndexed():batch.geometry.clone();source.applyMatrix4(matrix);positions.push(...source.attributes.position.array);normals.push(...source.attributes.normal.array);uvs.push(...source.attributes.uv.array);source.dispose();o.removeFromParent();if(o.geometry.type==='PlaneGeometry')o.geometry.dispose();}const merged=new THREE.BufferGeometry();merged.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));merged.setAttribute('normal',new THREE.Float32BufferAttribute(normals,3));merged.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));merged.computeBoundingSphere();const mesh=new THREE.Mesh(merged,batch.material);mesh.userData.apartmentDetailBatch=true;mesh.userData.detailCount=batch.items.length;if(batch.material.userData.apartmentGlass)mesh.userData.apartmentPane=true;mesh.receiveShadow=!batch.material.transparent;g.add(mesh);}
 planeUnit.dispose();
 return g;
}
