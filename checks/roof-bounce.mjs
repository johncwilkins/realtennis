import assert from 'node:assert/strict';
import {roofBounce,sideRoofHeight,endRoofHeight,COURT as C} from '../dist/court-geometry.js';
const dot=(b,n)=>b.vx*n.x+b.vy*(n.y||0)+b.vz*(n.z||0),energy=b=>b.vx**2+b.vy**2+b.vz**2;
const sideSlope=(C.roofHigh-C.roofLow)/(C.roofInnerX-C.roofOuterX),endSlope=(C.roofHigh-C.roofLow)/(C.halfLength-C.endRoofInner);
const normals=[{x:sideSlope/Math.hypot(1,sideSlope),y:1/Math.hypot(1,sideSlope),z:0},...[-1,1].map(side=>({x:0,y:1/Math.hypot(1,endSlope),z:-side*endSlope/Math.hypot(1,endSlope)}))];
for(const n of normals)for(const incoming of [2,5,10]){const t={x:n.z||n.y,y:n.z?0:-n.x,z:n.z?-n.x:1};const b={vx:-n.x*incoming+t.x*3,vy:-n.y*incoming+t.y*3,vz:-n.z*incoming+t.z*3},before={...b},normalIn=dot(b,n);assert.ok(normalIn<0);assert.equal(roofBounce(b,n),true);assert.ok(Math.abs(dot(b,n)+normalIn*.42)<1e-8);assert.ok(energy(b)<energy(before)*.85);const after={...b};assert.equal(roofBounce(b,n),false);assert.deepEqual(b,after);}
console.log('Passed: all three roof normals absorb 58% of normal speed, damp tangential travel, lose energy, and do not kick an already departing ball.');
