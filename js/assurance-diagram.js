const icons=[
 '<path d="M-22-24h44v48h-44zM-12-10l4 4 8-9M5-10h10M-12 8l4 4 8-9M5 8h10"/>',
 '<rect x="-20" y="-20" width="40" height="40" rx="4"/><path d="M-10-10h20v20h-20zM-10-32v12M10-32v12M-10 20v12M10 20v12M-32-10h12M-32 10h12M20-10h12M20 10h12"/>',
 '<path d="M0-30l27 11v20c0 18-27 31-27 31S-27 19-27 1v-20z"/><rect x="-12" y="-3" width="24" height="23" rx="3"/><path d="M-7-3v-8a7 7 0 0114 0v8"/>',
 '<rect x="-25" y="-28" width="50" height="16" rx="5"/><rect x="-25" y="-5" width="50" height="16" rx="5"/><path d="M0 11v18M-25 29h50M-15-20h1M-15 3h1"/>',
 '<rect x="-29" y="-23" width="58" height="43" rx="4"/><path d="M-35 27h70M-20 0h8l6-13 10 27 7-17 5 3h7"/>'
];
const labels=['Assess','Architect','Secure','Monitor','Optimize'];
function diagram(mobile){
 const points=labels.map((_,i)=>mobile?[160,110+i*210]:[100+i*200,120]);
 const links=points.slice(0,-1).map(([x,y],i)=>{const [nx,ny]=points[i+1];return `<path class="assurance-path" d="M${mobile?x:x+76} ${mobile?y+80:y}L${mobile?nx:nx-76} ${mobile?ny-80:ny}"/>`}).join('');
 const nodes=points.map(([x,y],i)=>`<g transform="translate(${x} ${y})"><g class="assurance-node diagram-stage"><rect class="diagram-panel" x="-76" y="-80" width="152" height="160" rx="18"/><g class="diagram-icon" transform="translate(0 -15)">${icons[i]}</g><text x="0" y="49">${labels[i]}</text><text class="diagram-index" x="0" y="-57">0${i+1}</text></g></g>`).join('');
 return `<svg class="assurance-${mobile?'mobile':'desktop'}" viewBox="0 0 ${mobile?'320 1060':'1000 240'}" aria-hidden="true" focusable="false">${links}${nodes}<g transform="translate(${mobile?260:965} ${mobile?1015:215})"><g class="assurance-marker"><circle r="17"/><path d="M-8 0l5 6 11-13"/></g></g></svg>`;
}
export function assuranceDiagram(){return diagram(false)+diagram(true)}
