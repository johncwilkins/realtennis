import * as THREE from './three.module.js';
import {block,beam,finish,sign} from './venue-tools.js';
export function buildAugustaGarden(){
 const sides=new THREE.Group(),ends=[],white=finish('#f0ebda'),green=finish('#174d36'),roof=finish('#35473d'),grass=finish('#63834b'),bark=finish('#655343'),pine=[finish('#28472d'),finish('#355b37'),finish('#43663e')],yellow=finish('#e5c645'),pink=[finish('#c65a86'),finish('#e187a5'),finish('#e9dad3')],leaf=finish('#385d33');sides.userData.augustaGarden=true;
 let seed=931;const random=()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296;};
 const ground=[],xs=[-50,-36,-24,-16,-11,-8.4,5.1,10,16,24,36,50],zs=[-50,-36,-26,-20,-17,-12,-6,0,6,12,17.5,23,32,42,50];for(let i=0;i<xs.length-1;i++)for(let j=0;j<zs.length-1;j++){const x=xs[i],X=xs[i+1],z=zs[j],Z=zs[j+1];if(x>=-8.4&&X<=5.1&&z>=-17&&Z<=17.5)continue;ground.push(x,-.22,z,x,-.22,Z,X,-.22,Z,x,-.22,z,X,-.22,Z,X,-.22,z);}const land=new THREE.BufferGeometry();land.setAttribute('position',new THREE.Float32BufferAttribute(ground,3));land.computeVertexNormals();const turf=new THREE.Mesh(land,grass);turf.receiveShadow=true;sides.add(turf);
 // Pines frame both ends, leaving the playing floor and the camera lane clear.
 const crown=new THREE.SphereGeometry(1,9,7),trunk=new THREE.CylinderGeometry(.1,.18,1,7);
 for(let i=0;i<44;i++){const angle=i/44*Math.PI*2,r=25+random()*16,x=Math.cos(angle)*r,z=Math.sin(angle)*r;if(Math.abs(x)<8&&Math.abs(z)<36)continue;const h=10+random()*8,g=new THREE.Group();g.position.set(x,0,z);const t=new THREE.Mesh(trunk,bark);t.scale.y=h*.8;t.position.y=h*.4;g.add(t);for(let n=0;n<5;n++){const m=new THREE.Mesh(crown,pine[(i+n)%3]);m.position.set((random()-.5)*2,h-2+random()*3,(random()-.5)*2);m.scale.set(1.6+random(),1.1+random(),1.4+random());m.castShadow=true;g.add(m);}sides.add(g);}
 // Azalea borders: clusters of leaves and irregular pink/white blossoms.
 const bloom=new THREE.SphereGeometry(1,6,5);for(const side of [-1,1]){const x=side>0?6.1:-8.2;for(let z=-14;z<19;z+=1.3){const shrub=new THREE.Mesh(crown,leaf);shrub.position.set(x,.65,z);shrub.scale.set(.8,.65,.85);sides.add(shrub);for(let n=0;n<7;n++){const flower=new THREE.Mesh(bloom,pink[Math.floor(random()*3)]);flower.position.set(x+(random()-.5)*1.1,.8+random()*.5,z+(random()-.5)*1.1);flower.scale.setScalar(.15+random()*.12);sides.add(flower);}}}
 for(const side of [-1,1]){const g=new THREE.Group(),z=side>0?19.1:-16.8;g.userData.endSide=side;block(g,15,4.8,2.8,-1,5.5,z,white);block(g,15.5,.25,4,-1,7.8,z-side*.6,white);block(g,15.8,.18,4.5,-1,3.35,z-side*.9,white);
 for(let x=-7;x<6;x+=2.1){block(g,.24,4.25,.24,x,5.55,z-side*2.0,white);block(g,1.02,1.75,.05,x+.8,5.8,z-side*1.43,green);for(const dx of [-.65,.65])block(g,.22,1.9,.08,x+.8+dx,5.8,z-side*1.49,green);block(g,1,.08,.07,x+.8,5.8,z-side*1.51,white);}
 for(const slope of [-1,1]){const panel=block(g,8.1,.16,4.1,-1+slope*3.8,8.65,z,roof);panel.rotation.z=-slope*.20;}
 sign(g,'AUGUSTA INVITATIONAL',-1,7.2,z-side*2.02,5.2,'#e5cc64','#174b32',side>0?Math.PI:0);
 for(const x of [-7.2,5.2]){beam(g,[x,7.95,z],[x,10.4,z],.025,white);const flag=new THREE.Mesh(new THREE.PlaneGeometry(.85,.48,6,2),yellow);const pos=flag.geometry.attributes.position;for(let i=0;i<pos.count;i++)pos.setZ(i,Math.sin(pos.getX(i)*7)*.07);pos.needsUpdate=true;flag.geometry.computeVertexNormals();flag.material.side=THREE.DoubleSide;flag.position.set(x+.42,10.1,z);g.add(flag);}
 // Green manual-style leaderboard with small cream slats.
 const boardZ=z-side*2.07;block(g,3.9,1.85,.09,3.0,4.6,boardZ,green);for(let row=0;row<4;row++){block(g,3.45,.028,.02,3.0,5.25-row*.38,boardZ-side*.06,white);for(let col=0;col<4;col++)block(g,.38,.17,.025,2+col*.65,5.05-row*.38,boardZ-side*.07,row===0?yellow:white);}ends.push(g);}
 // White lattice above the gallery and brass-colored trim echo the veranda.
 for(let z=-13;z<17;z+=2.5){block(sides,.17,2.7,.18,-7.25,4.75,z,white);beam(sides,[-7.2,3.5,z],[-7.2,6,z+2.2],.02,white);beam(sides,[-7.2,6,z],[-7.2,3.5,z+2.2],.02,white);}block(sides,.22,.18,33,-7.25,6.15,1,white);
 return {sides,ends,setVisible(on,overview=false){sides.visible=on;for(const g of ends)g.visible=on&&!overview;},setEndView(){},update(){}};
}
