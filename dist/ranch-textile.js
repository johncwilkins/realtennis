import * as THREE from './three.module.js';
export const RANCH_TEXTILE_COLORS={turquoise:'#239e91',red:'#b82f35',black:'#172423',gold:'#d7b15e'};
export function ranchTextileMaterial(){let map=null;if(typeof document!=='undefined'){const canvas=document.createElement('canvas');canvas.width=512;canvas.height=256;const c=canvas.getContext('2d'),{turquoise,red,black,gold}=RANCH_TEXTILE_COLORS;
 c.fillStyle=black;c.fillRect(0,0,512,256);
 for(const [y,h,color] of [[0,5,red],[5,20,turquoise],[25,5,black],[30,7,red],[37,5,gold],[42,4,black],[210,4,black],[214,5,gold],[219,7,red],[226,5,black],[231,20,turquoise],[251,5,red]]){c.fillStyle=color;c.fillRect(0,y,512,h);}
 c.fillStyle=gold;for(let x=0;x<512;x+=16){c.fillRect(x,47,11,7);c.fillRect(x+4,202,11,7);}
 // Stepped diamonds and nested lozenges echo the provided woven reference.
 for(let x=64;x<512;x+=128){c.fillStyle=red;c.beginPath();for(const [dx,dy] of [[0,-65],[13,-65],[13,-52],[26,-52],[26,-39],[39,-39],[39,-26],[52,-26],[52,-13],[64,-13],[64,13],[52,13],[52,26],[39,26],[39,39],[26,39],[26,52],[13,52],[13,65],[0,65],[-13,65],[-13,52],[-26,52],[-26,39],[-39,39],[-39,26],[-52,26],[-52,13],[-64,13],[-64,-13],[-52,-13],[-52,-26],[-39,-26],[-39,-39],[-26,-39],[-26,-52],[-13,-52],[-13,-65]])c.lineTo(x+dx,128+dy);c.closePath();c.fill();
  for(const [r,color]of [[47,black],[28,turquoise],[17,gold],[8,black]]){c.fillStyle=color;c.beginPath();c.moveTo(x,128-r);c.lineTo(x+r*.7,128);c.lineTo(x,128+r);c.lineTo(x-r*.7,128);c.closePath();c.fill();}
  c.fillStyle=gold;for(const side of [-1,1])for(let n=0;n<4;n++){const y=side<0?61+n*9:195-n*9;c.fillRect(x+51-n*9,y,23+n*18,5);}
 }
 for(let y=0;y<256;y+=2){c.fillStyle=y%4?'#0000000b':'#fff3cb0d';c.fillRect(0,y,512,1);}for(let x=0;x<512;x+=3){c.fillStyle='#101a1710';c.fillRect(x,0,1,256);}
 map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;map.wrapS=map.wrapT=THREE.RepeatWrapping;map.userData.ranchWovenTextile=true;
 }const material=new THREE.MeshStandardMaterial({color:'#ffffff',map,roughness:.98,side:THREE.DoubleSide});material.userData.ranchWovenTextile=true;return material;
}
