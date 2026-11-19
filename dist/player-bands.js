import * as THREE from './three.module.js';
// Chosen once per player, never flickering as animation frames change.
export function randomPlayerBands(random=Math.random){const colors=['#e0c458','#c84c40','#4c8fc9','#57a384','#b078bb'];const color=colors[Math.min(colors.length-1,Math.floor(random()*colors.length))],material=new THREE.MeshStandardMaterial({color,roughness:1});const head=true,wrist=random()<.8;return {head,wrist,material,wristMaterial:wrist?material:null,color};}
