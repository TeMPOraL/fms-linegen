/* ---------- Seeded PRNG ---------- */
let currentSeed;
const LCG_A = 1664525;
const LCG_C = 1013904223;
const LCG_M = Math.pow(2, 32);

export function setPrngSeed(seed) {
  currentSeed = seed;
}

function seededRandom() {
  currentSeed = (LCG_A * currentSeed + LCG_C) % LCG_M;
  return currentSeed / LCG_M; // Normalize to [0, 1)
}

/* ---------- Path generators (use seededRandom) ---------- */
function sinePath(w,h){const c=Math.floor(seededRandom()*2)+2;let d=`M0 ${h/2}`;const step=w/(c*20);for(let x=0;x<=w;x+=step){const y=h/2+(h/2.5)*Math.sin((x/w)*c*2*Math.PI);d+=` L ${x.toFixed(1)} ${y.toFixed(1)}`;}return d;}
function squarePath(w,h){const seg=Math.floor(seededRandom()*3)+4,amp=h/2.5,dx=w/seg;let d=`M0 ${h/2-amp}`;for(let i=0;i<seg;i++){const x=(i+1)*dx,y=i%2? h/2-amp: h/2+amp;d+=` L ${x.toFixed(1)} ${y.toFixed(1)}`;}return d;}
function sawPath(w,h){const t=Math.floor(seededRandom()*3)+5,dx=w/t,amp=h/2.2;let d=`M0 ${h/2}`;for(let i=0;i<t;i++){d+=` L ${(i*dx+dx/2).toFixed(1)} ${(h/2-amp).toFixed(1)} L ${((i+1)*dx).toFixed(1)} ${h/2}`;}return d;}
function loopsPath(w,h){const l=Math.floor(seededRandom()*3)+4,dx=w/l,r=dx/2;let d=`M${r} ${h/2}`;for(let i=0;i<l;i++){d+=` a ${r} ${r} 0 1 1 ${dx} 0`; }return d;}
function zigzagPath(w,h){const seg=Math.floor(seededRandom()*4)+6,dx=w/seg,amp=h/2.5;let d=`M0 ${h/2}`;for(let i=0;i<seg;i++){const x=(i+1)*dx,y=i%2? h/2+amp*seededRandom():h/2-amp*seededRandom();d+=` L ${x.toFixed(1)} ${y.toFixed(1)}`;}return d;}
function bezierPath(w,h){const pts=[],n=Math.floor(seededRandom()*3)+4;for(let i=0;i<=n;i++){pts.push([ (w/n)*i, h/2+(seededRandom()-0.5)*h/1.8 ]);}let d=`M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;for(let i=1;i<pts.length;i++){const p=pts[i-1],c=pts[i];const c1x=p[0]+(c[0]-p[0])/3,c2x=p[0]+2*(c[0]-p[0])/3;d+=` C ${c1x.toFixed(1)} ${p[1].toFixed(1)} ${c2x.toFixed(1)} ${c[1].toFixed(1)} ${c[0].toFixed(1)} ${c[1].toFixed(1)}`;}return d;}
const pathFns=[sinePath,squarePath,sawPath,loopsPath,zigzagPath,bezierPath];

/* ---------- Exported helper to get a random path ---------- */
export function generateRandomPath(svgWidth, lineHeight){
  return pathFns[Math.floor(seededRandom()*pathFns.length)](svgWidth,lineHeight);
}
