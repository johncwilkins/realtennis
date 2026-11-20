// A visual timer only; prediction and ball dynamics never depend on it.
export class ImpactReveal {
 constructor(){this.clear();}
 clear(){this.times=new Map();}
 hit(side,surface){this.times.set(`${side}:${surface}`,1.1);}
 tick(dt){for(const [k,t] of this.times)this.times.set(k,Math.max(0,t-Math.max(0,dt)));}
 strength(side,surface){const t=this.times.get(`${side}:${surface}`)||0;return Math.min(1,t/.9);}
}
