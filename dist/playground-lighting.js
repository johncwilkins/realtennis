import * as THREE from './three.module.js';
import {COURT as C} from './court-geometry.js';
import {block,beam,finish} from './venue-tools.js';
// Shared geometry: only artificial illumination changes between the two playgrounds.
export function buildPlaygroundLighting(){
 const group=new THREE.Group(),fixtures=[],lights=[],metal=finish('#3c4548',{metalness:.7,roughness:.64});group.userData.playgroundNightLights=true;
 const lens=new THREE.MeshStandardMaterial({color:'#fff2cf',emissive:'#ffe4ae',emissiveIntensity:3.5,roughness:.24});
 function flood(x,y,z,tx,tz,basketball=false){
  beam(group,[x,-.3,z],[x,y+.3,z],.065,metal);const head=new THREE.Group();head.position.set(x,y,z);head.lookAt(tx,0,tz);group.add(head);
  const housing=block(head,.72,.32,.22,0,0,0,metal);housing.castShadow=false;const bulb=block(head,.61,.23,.025,0,0,.125,lens);bulb.castShadow=false;bulb.userData.floodlightLens=true;fixtures.push(head);
  const light=new THREE.SpotLight(basketball?'#ffc78b':'#fff0d3',basketball?650:300, basketball?46:30,basketball?.82:.68,.65,2);light.target.position.set(tx,0,tz);light.position.set(x,y,z).addScaledVector(light.target.position.clone().sub(new THREE.Vector3(x,y,z)).normalize(),.28);light.userData.playgroundFlood=basketball?'basketball':'tennis';
  // Two shadow maps retain player/fence shadows without six extra shadow renders.
  light.castShadow=!basketball&&lights.length<2;if(light.castShadow){light.shadow.mapSize.set(1024,1024);light.shadow.normalBias=.025;light.shadow.bias=-.0001;light.shadow.radius=3;}
  group.add(light,light.target);lights.push(light);
 }
 for(const x of [-5.65,5.65])for(const z of [-8,8])flood(x,7.4,z,x<0?-1.3:1.3,z*.7);
 for(const z of [-12,12])flood(31,9,z,20,z*.55,true);
 const spill=new THREE.PointLight('#e9b781',34,25,2);spill.position.set(11,3.8,0);spill.userData.basketballSpill=true;group.add(spill);lights.push(spill);
 for(const side of [-1,1]){const wash=new THREE.PointLight('#ffe2b5',22,12,2);wash.position.set(0,4.2,side*((side>0?C.halfLength:C.endRoofInner)-2.2));wash.userData.playgroundEndWash=side;group.add(wash);lights.push(wash);}
 group.visible=false;return {group,fixtures,lights,setNight(on){group.visible=Boolean(on);}};
}
export function setSceneNight({hemisphere,ambient,sun,fill,renderer},night,sunny=false){
 hemisphere.intensity=night?.24:sunny?2.05:2;hemisphere.color.set(night?'#8397bc':'#eee9dd');hemisphere.groundColor.set(night?'#27313c':'#66766b');
 ambient.intensity=night?.12:sunny?.45:.65;sun.intensity=night?.10:sunny?2.5:1.45;sun.shadow.intensity=night?.25:sunny?.55:.38;fill.intensity=night?3:sunny?18:28;renderer.toneMappingExposure=night?1.2:1.25;
}
