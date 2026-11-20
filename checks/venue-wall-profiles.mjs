import assert from 'node:assert/strict';
import * as THREE from '../dist/three.module.js';
import {COURT as C,wallX} from '../dist/court-geometry.js';
import {mainWallRuns} from '../dist/venue-walls.js';
import {buildPalestraHall} from '../dist/palestra-hall.js';
import {buildSphereHall,SPHERE_WALL_HEIGHT} from '../dist/sphere-hall.js';
import {COURT_SCHEMES,readCourtScheme} from '../dist/court-schemes.js';
import {cleanSettings} from '../dist/preferences.js';
const palestra=buildPalestraHall(),sphere=buildSphereHall(),runs=mainWallRuns();assert.equal(runs.length,3);assert.ok(runs[1].xa!==runs[1].xb,'middle wall segment is the actual tambour angle');
for(const venue of [palestra,sphere]){let count=0;venue.sides.traverse(o=>{if(!o.userData.profiledMainWall)return;count++;const p=o.geometry.attributes.position;for(let i=0;i<p.count;i++)assert.ok(Math.abs(p.getX(i)-(wallX(p.getZ(i))-.012))<2e-6,'animated/decorative wall follows collision plane at every vertex');});assert.ok(count>=3);}
palestra.sides.updateMatrixWorld(true);let fronts=0,windows=0;palestra.sides.traverse(o=>{if(o.userData.mainWallRun){o.traverse(m=>{if(!m.userData.windowedWall)return;const p=m.geometry.attributes.position,v=new THREE.Vector3();for(let i=0;i<p.count;i++){if(Math.abs(p.getZ(i))>1e-7)continue;v.fromBufferAttribute(p,i).applyMatrix4(m.matrixWorld);assert.ok(Math.abs(v.x-wallX(v.z))<2e-6);fronts++;}});}if(o.userData.recessedWindow){windows++;assert.ok(o.position.z<-.1);assert.ok(o.geometry.type==='ShapeGeometry');}});assert.ok(fronts>100&&windows>4);
let mainUpper=0,tambour=0;const maps=new Set();sphere.sides.traverse(o=>{if(o.userData.sphereScreenWall){maps.add(o.material.map);if(o.userData.profiledMainWall?.low===3.4){mainUpper++;if(o.userData.profiledMainWall.a===C.tambourEnd)tambour++;}}});assert.equal(mainUpper,3);assert.equal(tambour,1);assert.equal(maps.size,1,'wall and tambour artwork share one animated screen source');
assert.ok(!COURT_SCHEMES['11']);assert.equal(cleanSettings({court:'11'}).court,'1');assert.equal(readCourtScheme({getItem:()=> '11'}),'1');console.log('Passed: both venue walls track the collision tambour at every vertex; Palestra has real recessed arched openings; Sphere artwork covers lower and upper wall sections; saved Augusta selections recover safely.');

assert.ok(SPHERE_WALL_HEIGHT>=35);sphere.sides.traverse(o=>{assert.ok(!o.userData.immersiveScreen,'no background dome');if(o.userData.profiledMainWall)assert.equal(o.userData.profiledMainWall.high,SPHERE_WALL_HEIGHT);});for(const end of sphere.ends){const bounds=new THREE.Box3().setFromObject(end);assert.ok(bounds.max.y>=35);}
