import assert from 'node:assert/strict';
import * as THREE from '../dist/three.module.js';
import fs from 'node:fs';
import {buildPlaygroundLighting,setSceneNight} from '../dist/playground-lighting.js';
import {buildUrbanPlayground} from '../dist/urban-playground.js';
import {COURT_SCHEMES,paintedFloorColor,saveCourtScheme,readCourtScheme} from '../dist/court-schemes.js';
import {cleanSettings} from '../dist/preferences.js';
import {Tournament} from '../dist/tournament.js';
import {ROSTER} from '../dist/roster.js';
const lighting=buildPlaygroundLighting();assert.equal(lighting.group.visible,false);lighting.setNight(true);assert.equal(lighting.group.visible,true);
const spots=lighting.lights.filter(l=>l.isSpotLight),tennis=spots.filter(l=>l.userData.playgroundFlood==='tennis'),basket=spots.filter(l=>l.userData.playgroundFlood==='basketball');assert.equal(tennis.length,4);assert.equal(basket.length,2);assert.equal(lighting.fixtures.length,6);assert.equal(spots.filter(l=>l.castShadow).length,2);
for(const light of spots){assert.ok(light.position.y>5.85,'all fixtures above chain link');assert.ok(light.target.position.y<light.position.y);assert.ok(light.intensity>0&&light.distance>20);}
for(const side of [-1,1])assert.equal(tennis.filter(l=>Math.sign(l.position.x)===side).length,2);
for(const light of basket)assert.equal(light.target.position.x,20,'basketball lights aim into the adjacent lot');assert.ok(lighting.lights.some(l=>l.userData.basketballSpill));
// Actual inverse-square cone illumination covers both halves and the playing center.
function lightAt(point,list){let brightness=0;for(const light of list){const aim=light.target.position.clone().sub(light.position).normalize(),delta=point.clone().sub(light.position),distance=delta.length(),cos=delta.normalize().dot(aim),outer=Math.cos(light.angle),inner=Math.cos(light.angle*(1-light.penumbra)),t=Math.max(0,Math.min(1,(cos-outer)/(inner-outer))),falloff=Math.max(0,1-(distance/light.distance)**4)**2;brightness+=light.intensity/(distance*distance)*falloff*t*t*(3-2*t)*light.position.y/distance;}return brightness;}
for(const z of [-10,-5,0,5,10])for(const x of [-3,0,3])assert.ok(lightAt(new THREE.Vector3(x,0,z),tennis)>.15,`playable light at ${x},${z}`);assert.ok(lightAt(new THREE.Vector3(20,0,0),basket)>1,'basketball court receives real light');
const sceneLights={hemisphere:new THREE.HemisphereLight(),ambient:new THREE.AmbientLight(),sun:new THREE.DirectionalLight(),fill:new THREE.PointLight(),renderer:{toneMappingExposure:1.25}};
setSceneNight(sceneLights,true);assert.ok(sceneLights.sun.intensity<.2);assert.ok(sceneLights.hemisphere.intensity<.3);setSceneNight(sceneLights,false,true);assert.equal(sceneLights.sun.intensity,2.5);assert.equal(sceneLights.sun.shadow.intensity,.55);setSceneNight(sceneLights,false);assert.equal(sceneLights.sun.intensity,1.45);assert.equal(sceneLights.ambient.intensity,.65);assert.equal(sceneLights.fill.intensity,28,'other venues restore their lighting');
const venue=buildUrbanPlayground(),before=[];venue.sides.traverse(o=>{if(o.userData.apartmentFacade||o.userData.chainLink||o.userData.basketballCourt)before.push(o.uuid);});venue.setNight(true);venue.setVisible(true);const after=[];venue.sides.traverse(o=>{if(o.userData.apartmentFacade||o.userData.chainLink||o.userData.basketballCourt)after.push(o.uuid);});assert.deepEqual(after,before,'same backdrop objects at night');venue.setNight(false);assert.equal(venue.sides.children.find(o=>o.userData.playgroundNightLights).visible,false);
assert.equal(cleanSettings({court:'13'}).court,'13');const values=new Map(),storage={getItem:k=>values.get(k),setItem:(k,v)=>values.set(k,v)};saveCourtScheme(storage,'13');assert.equal(readCourtScheme(storage),'13');assert.equal(paintedFloorColor('13',0,0),paintedFloorColor('12',0,0));assert.deepEqual(COURT_SCHEMES['13'].colors,COURT_SCHEMES['12'].colors);
const tournament=new Tournament({entrants:ROSTER.slice(0,8).map(p=>p.id),courts:['13','12','1','2','3','4','5']});assert.equal(tournament.courtFor('q1'),'13');
const html=fs.readFileSync(new URL('../dist/index.html',import.meta.url),'utf8');assert.ok(html.includes('value="12">Playground · Day'));assert.ok(html.includes('value="13">Playground · Night'));
console.log('Passed: sunny daytime restoration, fence floodlight coverage, basketball ambient spill, shared backdrop geometry, bounded shadow cost, persistent selection and tournament eligibility.');
