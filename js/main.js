const NUM_LINES = 7;
const LINE_HEIGHT = 120;
const IMG_SIZE = 80;
const SVG_WIDTH = 600;

/* ---------- Path generators ---------- */
// (These remain unchanged for now, but could be simplified if desired)
function sinePath(w,h){const c=Math.floor(Math.random()*2)+2;let d=`M0 ${h/2}`;const step=w/(c*20);for(let x=0;x<=w;x+=step){const y=h/2+(h/2.5)*Math.sin((x/w)*c*2*Math.PI);d+=` L ${x.toFixed(1)} ${y.toFixed(1)}`;}return d;}
function squarePath(w,h){const seg=Math.floor(Math.random()*3)+4,amp=h/2.5,dx=w/seg;let d=`M0 ${h/2-amp}`;for(let i=0;i<seg;i++){const x=(i+1)*dx,y=i%2? h/2-amp: h/2+amp;d+=` L ${x.toFixed(1)} ${y.toFixed(1)}`;}return d;}
function sawPath(w,h){const t=Math.floor(Math.random()*3)+5,dx=w/t,amp=h/2.2;let d=`M0 ${h/2}`;for(let i=0;i<t;i++){d+=` L ${(i*dx+dx/2).toFixed(1)} ${(h/2-amp).toFixed(1)} L ${((i+1)*dx).toFixed(1)} ${h/2}`;}return d;}
function loopsPath(w,h){const l=Math.floor(Math.random()*3)+4,dx=w/l,r=dx/2;let d=`M${r} ${h/2}`;for(let i=0;i<l;i++){d+=` a ${r} ${r} 0 1 1 ${dx} 0`; }return d;}
function zigzagPath(w,h){const seg=Math.floor(Math.random()*4)+6,dx=w/seg,amp=h/2.5;let d=`M0 ${h/2}`;for(let i=0;i<seg;i++){const x=(i+1)*dx,y=i%2? h/2+amp*Math.random():h/2-amp*Math.random();d+=` L ${x.toFixed(1)} ${y.toFixed(1)}`;}return d;}
function bezierPath(w,h){const pts=[],n=Math.floor(Math.random()*3)+4;for(let i=0;i<=n;i++){pts.push([ (w/n)*i, h/2+(Math.random()-0.5)*h/1.8 ]);}let d=`M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;for(let i=1;i<pts.length;i++){const p=pts[i-1],c=pts[i];const c1x=p[0]+(c[0]-p[0])/3,c2x=p[0]+2*(c[0]-p[0])/3;d+=` C ${c1x.toFixed(1)} ${p[1].toFixed(1)} ${c2x.toFixed(1)} ${c[1].toFixed(1)} ${c[0].toFixed(1)} ${c[1].toFixed(1)}`;}return d;}
const pathFns=[sinePath,squarePath,sawPath,loopsPath,zigzagPath,bezierPath];

/* ---------- helpers ---------- */
function randomPath(){return pathFns[Math.floor(Math.random()*pathFns.length)](SVG_WIDTH,LINE_HEIGHT);}

function makeImgSlot(){
  const label=document.createElement('label');
  // Use specific class for CSS targeting instead of Tailwind utilities
  label.className='img-slot';
  label.style.width=IMG_SIZE+'px';
  label.style.height=IMG_SIZE+'px';

  // plus sign
  const plus=document.createElement('span');
  plus.textContent='+';
  // Use specific class for CSS targeting
  plus.className='plus';
  label.appendChild(plus);

  // hidden input
  const input=document.createElement('input');
  input.type='file';
  input.accept='image/*';
  // Class name remains 'hidden' but is now styled by our CSS
  input.className='hidden';
  label.appendChild(input);

  // click triggers input (label default) – keep input present always
  input.addEventListener('change',e=>handleImageUpload(e,label,plus));
  return label;
}

function handleImageUpload(e,label,plus){
  const file=e.target.files[0];
  if(!file) return;
  const reader=new FileReader();
  reader.onload=ev=>{
    label.style.backgroundImage=`url(${ev.target.result})`;
    label.style.backgroundSize='contain';
    label.style.backgroundPosition='center';
    label.style.backgroundRepeat='no-repeat';
    plus.style.opacity='0'; // Hide plus sign when image is loaded
  };
  reader.readAsDataURL(file);
  // allow selecting same file again
  e.target.value='';
}

function buildRow(){
  const row=document.createElement('div');
  // Use specific class for CSS targeting
  row.className='trace-row';
  row.style.height=LINE_HEIGHT+'px';

  const left=makeImgSlot();
  const right=makeImgSlot();

  const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
  svg.setAttribute('width',SVG_WIDTH);
  svg.setAttribute('height',LINE_HEIGHT);
  // Use specific class for CSS targeting
  svg.classList.add('trace-svg');
  const path=document.createElementNS('http://www.w3.org/2000/svg','path');
  svg.appendChild(path);

  function updatePath(){
    path.setAttribute('d',randomPath());
    path.setAttribute('fill','none');
    path.setAttribute('stroke','#4B5563'); // Use hex color directly
    path.setAttribute('stroke-width','2');
    path.setAttribute('stroke-dasharray','8 6');
    path.setAttribute('stroke-linecap','round');
  }
  updatePath();
  // Store the update function on the row element for later access
  row._updatePath=updatePath;

  row.append(left,svg,right);
  return row;
}

function buildSheet(){
  const sheet=document.getElementById('sheet');
  sheet.innerHTML=''; // Clear previous content
  const rows=[];
  for(let i=0;i<NUM_LINES;i++){
    const newRow = buildRow();
    rows.push(newRow);
    sheet.appendChild(newRow);
  }
  return rows;
}

// Initial sheet build
let rows=buildSheet();

// Add event listener for the randomize button
document.getElementById('randomizeBtn').addEventListener('click', () => {
  rows.forEach(r => r._updatePath());
});

// Download button logic is removed as html2canvas is removed.
