import * as THREE from './three.module.js';
const palettes=[{shirt:'#202328',shorts:'#17191d',accent:'#f1c52e',second:'#d52d3b',shoes:'#b92a36'},{shirt:'#c92d3b',shorts:'#202126',accent:'#f0c52b',second:'#202328',shoes:'#e8bd2c'}];
export function applyCourtOutfit(player,night,index=0){
 const clothing=player.clothing;if(!clothing)return;
 if(!player.streetwear){const group=new THREE.Group(),primary=new THREE.MeshStandardMaterial({roughness:.9}),secondary=new THREE.MeshStandardMaterial({roughness:.9});
  for(const side of [-1,1])for(const [y,w,h,material] of [[1.245,.30,.065,primary],[1.16,.27,.035,secondary]]){const stripe=new THREE.Mesh(new THREE.PlaneGeometry(w,h),material);stripe.position.set(0,y,side*.198);stripe.rotation.y=side<0?Math.PI:0;stripe.rotation.z=.14;group.add(stripe);}
  group.userData.nightStreetwear=true;player.body.add(group);
  const shoes=[];for(const leg of player.footRig.legs)leg.shoe.traverse(o=>{if(o.isMesh&&o.material.color?.equals(clothing.base.color)&&!shoes.some(s=>s.material===o.material))shoes.push({material:o.material,color:o.material.color.clone()});});
  player.streetwear={group,primary,secondary,shoes};
 }
 const outfit=palettes[index%palettes.length],street=player.streetwear;street.group.visible=Boolean(night);
 clothing.shirt.color.set(night?outfit.shirt:clothing.shirtColor);clothing.base.color.set(night?outfit.shorts:clothing.baseColor);
 for(const shoe of street.shoes)shoe.material.color.set(night?outfit.shoes:shoe.color);
 const character=player.character;if(character){player.bands.material.color.set(night?outfit.accent:character.band);player.bands.wristMaterial.color.set(night?outfit.second:character.wrist);player.capMaterial?.color.set(night?outfit.shorts:character.hatColor);}
 street.primary.color.set(outfit.accent);street.secondary.color.set(outfit.second);
}
