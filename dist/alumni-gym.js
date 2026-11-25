import * as THREE from './three.module.js';
import {COURT as C,wallX} from './court-geometry.js';
import {mainWallRuns,mainWallSurface,wallSurface,venueRear} from './venue-walls.js';
import {architecturalGlass} from './window-glass.js';
import {block,beam,finish} from './venue-tools.js';
export const ALUMNI_SCHEME={name:'Lafayette Alumni Gym',description:'An old-school interpretation of Lafayette’s Alumni Memorial Gymnasium: pale masonry piers, tall recessed windows, aged plaster, exposed roof trusses and a slightly banked oval wooden running track with iron railings. Maroon, ivory and worn hardwood; no signs or logos.',floor:'maple',sky:'#667272',sun:'#fff1df',lighting:{hemisphere:1.65,ambient:.38,sun:1.7,fill:20,exposure:1.15},colors:{upper:'#bbb39f',lower:'#71313f',roof:'#595e64',wood:'#74523c',trim:'#e2d5bc',ink:'#f1ead9',tape:'#ece1cd',cord:'#292932',out:'#963d4c'}};
function texture(kind){const canvas=document.createElement('canvas');canvas.width=canvas.height=512;const c=canvas.getContext('2d');let seed=1924;const rnd=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);c.fillStyle=kind==='wood'?'#9b8565':kind==='plaster'?'#b4ad9b':'#b3aa94';c.fillRect(0,0,512,512);
 if(kind==='stone')for(let y=0;y<512;y+=64)for(let x=(y/64%2)*-80;x<512;x+=160){c.fillStyle=['#b7ae99','#bdb49e','#afa791','#c1b7a1'][Math.floor(rnd()*4)];c.fillRect(x+1,y+1,158,62);c.fillStyle='#e5dbc123';c.fillRect(x+2,y+2,155,2);}
 if(kind==='wood')for(let y=0;y<512;y+=32){c.fillStyle='#362e2530';c.fillRect(0,y,512,1);for(let n=0;n<9;n++){c.strokeStyle='#382a2018';c.lineWidth=.5;c.beginPath();c.moveTo(0,y+n*3);c.bezierCurveTo(150,y+n*3+3,300,y+n*3-2,512,y+n*3);c.stroke();}}
 for(let i=0;i<14000;i++){c.fillStyle=i%2?'#ffefc914':'#272d2810';c.fillRect(rnd()*512,rnd()*512,.5+rnd()*3,.5+rnd()*2);}for(let i=0;i<45;i++){const x=rnd()*512,y=rnd()*512,r=20+rnd()*50,g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,'#423e2f0d');g.addColorStop(1,'#423e2f00');c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2);}const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;map.wrapS=map.wrapT=THREE.RepeatWrapping;return map;}
function litWindow(){const canvas=document.createElement('canvas');canvas.width=128;canvas.height=256;const c=canvas.getContext('2d'),g=c.createLinearGradient(0,0,0,256);g.addColorStop(0,'#7d939d');g.addColorStop(.55,'#b1bbb0');g.addColorStop(1,'#5d7165');c.fillStyle=g;c.fillRect(0,0,128,256);c.fillStyle='#30483c24';for(const x of [18,96]){c.fillRect(x,95,3,161);for(let y=110;y<250;y+=37){c.beginPath();c.ellipse(x,y,18,30,.25,0,Math.PI*2);c.fill();}}const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;return map;}
export function buildAlumniGym(){
 const sides=new THREE.Group(),upper=new THREE.Group(),ends=[],roofGroups=[],trackSides=new THREE.Group();sides.userData.alumniGym=true;sides.add(upper,trackSides);
 const plaster=finish('#ffffff',{map:texture('plaster')}),stone=finish('#e0d5be',{map:texture('stone')}),iron=finish('#454843',{metalness:.25,roughness:.78}),timber=finish('#635142',{map:texture('wood')}),ceiling=finish('#a39d8d',{map:texture('plaster'),side:THREE.DoubleSide}),track=finish('#76604d',{map:texture('wood')}),mark=finish('#b2a58a'),glass=architecturalGlass(.25),backing=new THREE.MeshBasicMaterial({map:litWindow(),color:'#b8c1b7',side:THREE.DoubleSide}),lamp=new THREE.MeshBasicMaterial({color:'#e8d7b2'});glass.transmission=.55;glass.roughness=.22;
 const wallMap=texture('plaster'),z0=-C.halfLength,z1=venueRear,outerL=-9.05,outerR=7.0,trackY=6.65,bank=Math.tan(7*Math.PI/180),shellZ0=z0-2.05,shellZ1=z1+2.05;
 function facade(span){const g=new THREE.Group(),count=Math.max(1,Math.floor(span/4.6)),step=span/count,w=Math.min(1.7,step-.65);block(g,span,.38,.40,0,6.2,-.18,stone);block(g,span,.30,.45,0,9.35,-.18,stone);block(g,span,.12,.55,0,9.56,-.13,stone);
  for(let i=0;i<count;i++){const x=-span/2+(i+.5)*step;block(g,step-w,2.9,.34,x-step/2+(step-w)/2,7.8,-.18,plaster);block(g,w,.48,.34,x,6.55,-.18,stone);block(g,w,.36,.34,x,9.05,-.18,plaster);
   const pane=new THREE.Mesh(new THREE.PlaneGeometry(w-.14,2.10),glass);pane.position.set(x,7.82,-.19);pane.userData.alumniWindow=true;g.add(pane);const view=new THREE.Mesh(new THREE.PlaneGeometry(w-.1,2.14),backing);view.position.set(x,7.82,-.52);g.add(view);
   for(const dx of [-w/2,w/2]){block(g,.10,2.35,.30,x+dx,7.83,-.10,stone);}for(const y of [6.68,8.98])block(g,w+.20,.10,.30,x,y,-.09,stone);for(const dx of [-w/2+.07,0,w/2-.07])block(g,.025,2.1,.035,x+dx,7.82,-.14,iron);for(const y of [7.3,7.82,8.35])block(g,w-.1,.025,.035,x,y,-.14,iron);
  }
  for(const x of [-span/2+.16,span/2-.16]){block(g,.32,2.95,.42,x,7.8,-.08,stone);block(g,.46,.16,.46,x,9.19,-.05,stone);}
  return g;
 }
 const right=facade(shellZ1-shellZ0);right.position.set(outerR,0,(z1+z0)/2);right.rotation.y=-Math.PI/2;upper.add(right);const left=facade(shellZ1-shellZ0);left.position.set(outerL,0,(z1+z0)/2);left.rotation.y=Math.PI/2;upper.add(left);
 // Continuous outer masonry closes the void behind and below the raised track.
 for(const x of [outerL,outerR]){const wall=block(upper,.24,6.25,shellZ1-shellZ0,x,3.125,(shellZ0+shellZ1)/2,plaster);wall.userData.alumniShell=true;}
 // All playable side-wall sections follow the physical straight/angled/straight tambour profile.
 for(const run of mainWallRuns())mainWallSurface(sides,run,3.4,6.1,plaster);
 block(sides,.15,2.7,z1-z0,C.roofOuterX,4.75,(z1+z0)/2,plaster);
 for(const side of [-1,1]){const g=new THREE.Group(),z=side>0?z1:z0;g.userData.endSide=side;const face=facade(outerR-outerL);face.position.set((outerR+outerL)/2,0,z+side*2.05);face.rotation.y=side>0?Math.PI:0;g.add(face);const shell=block(g,outerR-outerL,6.25,.24,(outerR+outerL)/2,3.125,z+side*2.05,plaster);shell.userData.alumniShell=true;
  const capGeo=new THREE.BufferGeometry();capGeo.setAttribute('position',new THREE.Float32BufferAttribute([outerL,9.5,z+side*2.05,outerR,9.5,z+side*2.05,(outerL+outerR)/2,10.82,z+side*2.05],3));capGeo.computeVertexNormals();const cap=new THREE.Mesh(capGeo,ceiling);cap.userData.alumniShell=true;g.add(cap);const width=wallX(z)-C.roofOuterX;block(g,width,2.7,.22,(wallX(z)+C.roofOuterX)/2,4.75,z+side*.05,plaster);ends.push(g);}
 // A true oval: two long side galleries joined by uninterrupted semicircular ends.
 // Its deck and supports sit above the out-of-court wall height and outside the floor footprint.
 function ribbon(parent,points){const g=new THREE.Group();g.userData.alumniTrack=true;g.userData.deckHeight=trackY;g.userData.bankDegrees=7;g.userData.centerline=points;parent.add(g);const pos=[],uv=[],width=1.22;let distance=0;
  const edge=(p,offset)=>[p.x+p.nx*offset,trackY+offset*bank,p.z+p.nz*offset];
  for(let i=0;i<points.length-1;i++){const a=points[i],b=points[i+1],next=distance+Math.hypot(b.x-a.x,b.z-a.z),corners=[edge(a,-width/2),edge(b,-width/2),edge(b,width/2),edge(a,width/2)];for(const j of [0,2,1,0,3,2]){pos.push(...corners[j]);uv.push((j===0||j===3?distance:next)/3,j<2?0:1);}distance=next;
   for(const offset of [-width/2,width/2]){const A=edge(a,offset),B=edge(b,offset);beam(g,[A[0],A[1]+.91,A[2]],[B[0],B[1]+.91,B[2]],.027,timber);beam(g,[A[0],A[1]+.22,A[2]],[B[0],B[1]+.22,B[2]],.014,iron);beam(g,[A[0],A[1]-.12,A[2]],[B[0],B[1]-.12,B[2]],.065,iron);for(let t=0;t<1;t+=Math.min(1,.35/Math.max(.01,Math.hypot(B[0]-A[0],B[2]-A[2])))){const x=A[0]+(B[0]-A[0])*t,z=A[2]+(B[2]-A[2])*t,y=A[1]+(B[1]-A[1])*t;beam(g,[x,y+.1,z],[x,y+.9,z],.012,iron);}}
   // A continuous shallow apron hides daylight below the banked inner track edge.
   const A=edge(a,-width/2),B=edge(b,-width/2),apron=wallSurface(g,[[A[0],6.02,A[2]],[B[0],6.02,B[2]],B,A],plaster);apron.material.side=THREE.DoubleSide;apron.userData.alumniTrackApron=true;
   for(const offset of [-.20,.20]){const A=edge(a,offset),B=edge(b,offset);beam(g,[A[0],A[1]+.006,A[2]],[B[0],B[1]+.006,B[2]],.009,mark);}
  }
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.computeVertexNormals();const deck=new THREE.Mesh(geo,track);deck.material.side=THREE.DoubleSide;deck.receiveShadow=deck.castShadow=true;deck.userData.alumniTrackDeck=true;g.add(deck);return g;
 }
 const xl=-7.8,xr=5.8,za=z0-.75,zb=z1+.75,r=(xr-xl)/2,cx=(xl+xr)/2,centerA=za+r,centerB=zb-r,straight=(x,zA,zB,nx,nz)=>{const count=Math.ceil(Math.abs(zB-zA)/.9)+1;return Array.from({length:count},(_,i)=>({x,z:zA+(zB-zA)*i/(count-1),nx,nz}));};
 ribbon(trackSides,straight(xl,centerA,centerB,-1,0));ribbon(trackSides,straight(xr,centerA,centerB,1,0));
 for(const side of [-1,1]){const end=ends.find(e=>e.userData.endSide===side),cz=side<0?centerA:centerB,points=[];for(let i=0;i<=64;i++){const angle=Math.PI+(side<0?1:-1)*Math.PI*i/64;points.push({x:cx+r*Math.cos(angle),z:cz+r*Math.sin(angle),nx:Math.cos(angle),nz:Math.sin(angle)});}const curve=ribbon(end,points);curve.userData.ovalEnd={cx,cz,r};}
 // Old painted steel trusses, timber purlins, suspension rods, and modest pendant fixtures.
 for(let z=shellZ0;z<shellZ1;z+=3.7){const g=new THREE.Group();g.userData.trussZ=z;roofGroups.push(g);sides.add(g);const x0=outerL,x1=outerR,mid=(x0+x1)/2,endZ=Math.min(z+3.71,shellZ1);
  for(const [a,b,ya,yb]of [[x0,mid,9.5,10.65],[mid,x1,10.65,9.5]])wallSurface(g,[[a,ya+.09,z],[b,yb+.09,z],[b,yb+.09,endZ],[a,ya+.09,endZ]],ceiling);
  beam(g,[x0,9.5,z],[mid,10.65,z],.07,iron);beam(g,[mid,10.65,z],[x1,9.5,z],.07,iron);beam(g,[x0,9.3,z],[x1,9.3,z],.055,iron);
  for(let x=x0;x<x1-.1;x+=2){const xx=Math.min(x+2,x1),top=q=>10.65-Math.abs(q-mid)/(x1-x0)*2.3;beam(g,[x,9.3,z],[xx,top(xx),z],.025,iron);beam(g,[xx,9.3,z],[xx,top(xx),z],.022,iron);}
  for(const x of [xl,xr]){beam(g,[x,9.35,z],[x,trackY-.12,z],.022,iron);beam(g,[x-.65,trackY-.2,z],[x+.65,trackY-.2,z],.05,iron);}
  for(const x of [-4,2]){beam(g,[x,9.3,z],[x,8.8,z],.012,iron);const shade=new THREE.Mesh(new THREE.ConeGeometry(.19,.14,16,1,true),iron);shade.position.set(x,8.78,z);shade.rotation.z=Math.PI;g.add(shade);block(g,.23,.025,.23,x,8.7,z,lamp);}
  for(const x of [-6,-3,0,3,6])beam(g,[x,10.6-Math.abs(x-mid)/7,z],[x,10.6-Math.abs(x-mid)/7,endZ],.038,timber);
 }
 // Give the shared unit boxes their own UVs before applying physical texture scale.
 sides.traverse(o=>{if(o.isMesh&&[stone,plaster,timber].includes(o.material)&&o.geometry.type==='BoxGeometry'){o.geometry=o.geometry.clone();const uv=o.geometry.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*Math.max(.1,o.scale.x/2),uv.getY(i)*Math.max(.1,o.scale.y/2));}});
 let active=false,overview=false;return {sides,ends,wallMap,setVisible(on,over=false){active=on;overview=over;sides.visible=on;upper.visible=trackSides.visible=!over;for(const g of ends)g.visible=on&&!over;},setEndView(side){for(const g of roofGroups)g.visible=active&&!overview&&g.userData.trussZ*side<2;},update(){}};
}
