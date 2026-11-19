import assert from 'node:assert/strict';
import {readCourtScheme,saveCourtScheme,COURT_SCHEMES,paintedFloorColor} from '../dist/court-schemes.js';
import {COURT as C} from '../dist/court-geometry.js';
// Selection survives reload, tolerates blocked storage and rejects stale/invalid IDs.
const values=new Map(),storage={getItem:k=>values.get(k),setItem:(k,v)=>values.set(k,v)};
assert.equal(readCourtScheme(storage),'1');for(const id of Object.keys(COURT_SCHEMES)){saveCourtScheme(storage,id);assert.equal(readCourtScheme(storage),id);}saveCourtScheme(storage,'bogus');assert.equal(readCourtScheme(storage),'1');const blocked={getItem(){throw Error('blocked');},setItem(){throw Error('blocked');}};assert.equal(readCourtScheme(blocked),'1');assert.doesNotThrow(()=>saveCourtScheme(blocked,'2'));
// Court 3's green receiving box follows the shared service/fault lines, not camera direction.
assert.notEqual(paintedFloorColor('3',C.faultLineX-.2,C.serviceLineZ-.2),paintedFloorColor('3',C.faultLineX+.2,C.serviceLineZ-.2));assert.equal(paintedFloorColor('3',0,C.serviceLineZ+.2),paintedFloorColor('3',0,5));assert.equal(paintedFloorColor('2',0,-12),paintedFloorColor('2',0,12));
console.log('Passed: persistent court choice, invalid/blocked storage recovery and red/green floor boundaries on shared court markings.');
