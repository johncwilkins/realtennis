import {COURT as C} from './court-geometry.js';
// Two planes meet in a valley from the low inside corner to the high outside corner.
export function serviceRoofJunction(){const run=C.halfLength-C.endRoofInner,A=[C.roofInnerX,C.roofLow,C.halfLength],B=[C.roofOuterX,C.roofHigh,C.halfLength],D=[C.roofInnerX,C.roofHigh,C.halfLength+run],E=[C.roofOuterX,C.roofHigh,C.halfLength+run];return {side:[B,A,E,E],end:[A,D,E,E],valley:[A,E]};}
