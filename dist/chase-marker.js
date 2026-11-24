import * as THREE from './three.module.js';
export function chaseMarkerColor(lineColor){const c=new THREE.Color(lineColor);return .2126*c.r+.7152*c.g+.0722*c.b>.42?'#ed3349':'#efbd32';}
export function createChaseMarker(scene){const group=new THREE.Group(),ink=new THREE.MeshBasicMaterial({color:'#ed3349'}),edge=new THREE.MeshBasicMaterial({color:'#20272a'}),dot=new THREE.PlaneGeometry(.15,.10),outline=new THREE.PlaneGeometry(.20,.15);
 for(let x=-4.82;x<=4.83;x+=.27){const border=new THREE.Mesh(outline,edge),mark=new THREE.Mesh(dot,ink);border.rotation.x=mark.rotation.x=-Math.PI/2;border.position.set(x,.025,0);mark.position.set(x,.028,0);border.renderOrder=2;mark.renderOrder=3;group.add(border,mark);}
 group.visible=false;group.position.z=8;group.userData.dottedChase=true;group.setLineColor=color=>ink.color.set(chaseMarkerColor(color));scene.add(group);return group;
}
