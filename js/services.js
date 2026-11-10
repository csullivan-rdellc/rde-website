const CLIENT_ID = '00e30a1b-6809-473a-bb61-db5cc441ff79';
const API = 'https://www.wixapis.com';
const FEATURED = ["homepage-vciso-services"];
const list = document.querySelector('#services-list');
const status = document.querySelector('#services-status');
const retry = document.querySelector('#retry-services');
let memory;
async function token() {
  const key = 'wix-visitor-' + CLIENT_ID;
  let saved = memory;
  try { saved ||= JSON.parse(localStorage.getItem(key)); } catch {}
  if (saved && saved.expiresAt - 60000 > Date.now()) return saved.accessToken;
  async function mint(grant) {
    const response = await fetch(API + '/oauth2/token', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId: CLIENT_ID, ...grant })
    });
    if (!response.ok) throw new Error('Visitor authentication failed (' + response.status + ')');
    return response.json();
  }
  let data;
  if (saved?.refreshToken) {
    try { data = await mint({ grantType: 'refresh_token', refreshToken: saved.refreshToken }); } catch {}
  }
  data ||= await mint({ grantType: 'anonymous' });
  memory = { accessToken: data.access_token, refreshToken: data.refresh_token, expiresAt: Date.now() + data.expires_in * 1000 };
  try { localStorage.setItem(key, JSON.stringify(memory)); } catch {}
  return memory.accessToken;
}
function element(tag, text, className) {
  const el = document.createElement(tag);
  if (text) el.textContent = text;
  if (className) el.className = className;
  return el;
}
function section(title, className = '') {
  const section = element('section', '', 'vciso-section ' + className);
  section.append(element('h2', title));
  return section;
}
function render(service) {
  const content = service.pageContent;
  if (!content || !Array.isArray(content.deliverables) || !Array.isArray(content.tiers)) throw new Error('Service content is incomplete.');
  const fragment = document.createDocumentFragment();
  const introduction = element('div', '', 'vciso-introduction');
  for (const [heading, text] of [['The Challenge', content.challenge], ['The RDE Solution', content.solution]]) {
    const block = section(heading);
    block.append(element('p', text));
    introduction.append(block);
  }
  fragment.append(introduction);
  const included = section('What You Get');
  const cards = element('div', '', 'deliverables-grid');
  for (const item of content.deliverables) {
    const card = element('article', '', 'deliverable');
    card.append(element('h3', item.title), element('p', item.description));
    cards.append(card);
  }
  included.append(cards);
  fragment.append(included);
  const reasons = section('Why RDE', 'vciso-credentials');
  const credentials = element('ul', '', 'credentials-grid');
  for (const item of content.credentials || []) credentials.append(element('li', item));
  reasons.append(credentials);
  fragment.append(reasons);
  const options = section('Engagement Options');
  const tiers = element('div', '', 'pricing-grid');
  for (const tier of content.tiers) {
    const card = element('article', '', 'pricing-card' + (tier.name === 'Professional' ? ' featured' : ''));
    card.setAttribute('aria-label', tier.name + ' engagement');
    card.append(element('h3', tier.name));
    const price = element('p', tier.price, 'tier-price');
    price.append(element('span', tier.cadence));
    card.append(price);
    if (tier.intro) card.append(element('p', tier.intro, 'tier-intro'));
    if (tier.features?.length) {
      const features = element('ul');
      for (const feature of tier.features) features.append(element('li', feature));
      card.append(features);
    }
    const contact = element('a', 'Discuss ' + tier.name + ' ↗', 'button tier-enquiry');
    contact.href = '/contact.html?plan=' + encodeURIComponent(tier.name.toLowerCase());
    card.append(contact);
    tiers.append(card);
  }
  options.append(tiers);
  fragment.append(options);
  const photo = document.querySelector('#vciso-photo');
  if (service.heroImage || service.image) photo.src = service.heroImage || service.image;
  photo.alt = service.heroImageAlt || service.imageAlt || service.title;
  document.querySelector('h1').textContent = service.title;
  document.querySelector('#service-tagline').textContent = content.tagline;
  list.replaceChildren(fragment);
  document.dispatchEvent(new CustomEvent('rde:content-ready', { detail: { root: list } }));
}
async function load() {
  retry.hidden = true;
  status.textContent = 'Loading engagement details…';
  list.setAttribute('aria-busy', 'true');
  try {
    const response = await fetch(API + '/wix-data/v2/items/query', {
      method: 'POST',
      headers: { Authorization: await token(), 'Content-Type': 'application/json' },
      body: JSON.stringify({
        dataCollectionId: 'RDEServices',
        query: {
          filter: { $and: [{ isVisible: { $eq: true } }, { _id: { $hasSome: FEATURED } }] },
          paging: { limit: 1, offset: 0 }
        }
      })
    });
    if (!response.ok) throw new Error('Services request failed (' + response.status + ')');
    const data = await response.json();
    const service = data.dataItems?.map(item => item.data).find(item => item.isVisible === true && item.approvalStatus !== 'draft');
    if (!service) throw new Error('The vCISO service is currently unavailable.');
    render(service);
    status.textContent = '';
  } catch (error) {
    console.error(error);
    list.replaceChildren();
    status.textContent = 'We couldn’t load the engagement details. Try again or contact RDE.';
    retry.hidden = false;
  } finally {
    list.setAttribute('aria-busy', 'false');
  }
}
retry.addEventListener('click', load);
load();
