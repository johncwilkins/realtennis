export const netHeight=x=>.9144+.61*(Math.abs(x)/5)**1.7;
export function netPoint(x,y){const height=netHeight(x),v=Math.max(0,Math.min(1,y/height)),middle=1-(Math.abs(x)/5)**2,hang=Math.sin(Math.PI*v);return [x,y-.045*middle*hang,(.035+.10*middle)*hang+.012*Math.sin(x*1.7)*hang];}
