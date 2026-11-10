import { queryServices, element } from '/js/site-data.js';
import { createAssuranceVisual } from '/js/ai-compute-motion.js';
const mount = document.querySelector('#compute-content');
const status = document.querySelector('#compute-status');
const retry = document.querySelector('#compute-retry');
function section(title, className = '') {
 const section = element('section', '', 'home-section ' + className);
 const container = element('div', '', 'container');
 container.append(element('h2', title));
 section.append(container);
 return { section, container };
}
async function load() {
 retry.hidden = true;
 mount.setAttribute('aria-busy', 'true');
 try {
  const service = (await queryServices(['homepage-ai-compute']))[0];
  const content = service?.pageContent;
  if (!content || !Array.isArray(content.disciplines)) throw new Error('AI Compute content is unavailable.');
  document.querySelector('#service-title').textContent = service.title;
  document.querySelector('#compute-subtitle').textContent = content.title;
  document.querySelector('#compute-positioning').textContent = content.subtitle;
  document.querySelector('#service-summary').textContent = content.introduction;
  const fragment = document.createDocumentFragment();
  const capabilities = section('Intelligence for operational decisions.');
  capabilities.container.append(element('p', content.capabilitiesLead, 'compute-intro'));
  const list = element('ul', '', 'intelligence-capabilities');
  for (const capability of content.capabilities) {
   const item = element('li');
   item.append(element('h3', capability.title), element('p', capability.description));
   list.append(item);
  }
  capabilities.container.append(list);
  fragment.append(capabilities.section);
  const model = section(content.modelTitle, 'approach-section');
  model.container.append(element('p', content.modelSubtitle, 'compute-subheading'), element('p', content.modelIntroduction, 'compute-intro'));
  const layers = element('ul', '', 'layer-map');
  layers.setAttribute('aria-label', 'Layers covered by the common operating model');
  for (const [index, layer] of content.layers.entries()) {
   const item = element('li');
   const badge = element('span', String(index + 1).padStart(2, '0'), 'layer-badge');
   badge.setAttribute('aria-hidden', 'true');
   item.append(badge, element('span', layer));
   layers.append(item);
  }
  model.container.append(layers);
  const disciplines = element('div', '', 'discipline-grid');
  for (const [index, discipline] of content.disciplines.entries()) {
   const card = element('article', '', 'discipline-card');
   const number = element('span', String(index + 1).padStart(2, '0'), 'discipline-number');
   number.setAttribute('aria-hidden', 'true');
   card.append(number, element('h3', discipline.title), element('p', discipline.description));
   disciplines.append(card);
  }
  model.container.append(disciplines);
  fragment.append(model.section);
  const loop = section(content.loopTitle);
  const steps = element('ol', '', 'intelligence-loop');
  steps.setAttribute('aria-label', 'Continuous improvement loop');
  for (const step of content.loopSteps) steps.append(element('li', step));
  const assurance = createAssuranceVisual();
  loop.container.append(assurance.wrap, assurance.replay, steps, element('p', content.loopDescription, 'compute-intro'), element('p', content.closing, 'compute-closing'));
  const link = element('a', 'Discuss AI Compute', 'button');
  link.href = '/contact.html?service=ai-compute';
  loop.container.append(link);
  fragment.append(loop.section);
  mount.replaceChildren(fragment);
  document.dispatchEvent(new CustomEvent('rde:content-ready', { detail: { root: mount } }));
  status.textContent = '';
 } catch (error) {
  console.error(error);
  status.textContent = 'AI Compute details could not load. Please try again or contact RDE.';
  retry.hidden = false;
 } finally { mount.setAttribute('aria-busy', 'false'); }
}
retry.addEventListener('click', load);
load();