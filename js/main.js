const NUM_LINES = 7;
const LINE_HEIGHT = 120;
const IMG_SIZE = 80;
// Adjust SVG width for better A4 print fit
const SVG_WIDTH = 520;

// Import path generation logic and PRNG functions from paths.js
import { setPrngSeed, generateRandomPath } from './paths.js';

/* ---------- DOM Manipulation and Application Logic ---------- */

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
    // Use imported generateRandomPath and pass SVG_WIDTH, LINE_HEIGHT
    path.setAttribute('d',generateRandomPath(SVG_WIDTH, LINE_HEIGHT));
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

// Global rows variable, will be populated by buildSheetAndSyncURL
let rows = [];

function buildSheetAndSyncURL(generateNewSeed = false) {
  let seedToUse;
  if (generateNewSeed) {
    // Generate a new seed using Math.random() for initial unpredictability.
    // LCG_M is not defined here anymore, use a large enough integer range.
    seedToUse = Math.floor(Math.random() * Math.pow(2, 32));
  } else {
    // Try to get seed from URL or generate if not present
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.substring(1)); // Remove #
    const seedFromURL = params.get('seed');
    if (seedFromURL && !isNaN(parseInt(seedFromURL))) {
      seedToUse = parseInt(seedFromURL);
    } else {
      seedToUse = Math.floor(Math.random() * Math.pow(2, 32)); // Fallback if no seed or invalid
    }
  }

  setPrngSeed(seedToUse); // Initialize PRNG in paths.js with this seed
  window.location.hash = `seed=${seedToUse}`; // Update URL

  const sheet = document.getElementById('sheet');
  sheet.innerHTML = ''; // Clear previous content
  const newRows = [];
  for (let i = 0; i < NUM_LINES; i++) {
    const newRow = buildRow(); // buildRow will use the PRNG via updatePath -> randomPath
    newRows.push(newRow);
    sheet.appendChild(newRow);
  }
  rows = newRows; // Update global rows
}

// Initial setup
function initialize() {
  // buildSheetAndSyncURL now handles seed retrieval or generation
  // Pass false to indicate it should try to use existing URL seed first,
  // or generate a new one if not present/valid, then build.
  buildSheetAndSyncURL(false);
}

// Add event listener for the randomize button
document.getElementById('randomizeBtn').addEventListener('click', () => {
  // Pass true to force generation of a new seed and rebuild
  buildSheetAndSyncURL(true);
});

// Call initialize on script load
initialize();

// Download button logic is removed as html2canvas is removed.
