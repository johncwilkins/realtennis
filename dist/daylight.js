// Parallel sun rays projected through each clear, four-pane window.
export const WINDOW_CENTRES=[-9,-4,1,6,11];
export const WINDOW={bottom:4.585,top:5.915,halfWidth:.75};
export function windowPatches(x,z){const panes=[];for(const row of [0,1])for(const col of [0,1]){const y0=WINDOW.bottom+row*.665+.04,y1=WINDOW.bottom+(row+1)*.665-.04,z0=z-.75+col*.75+.04,z1=z-.75+(col+1)*.75-.04;const project=(y,Z)=>[x-y/1.1,.012,Z+y*.45/1.1];panes.push([project(y0,z0),project(y0,z1),project(y1,z1),project(y1,z0)]);}return panes;}
