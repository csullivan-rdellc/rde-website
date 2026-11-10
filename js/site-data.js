const CLIENT_ID = '00e30a1b-6809-473a-bb61-db5cc441ff79';
const API = 'https://www.wixapis.com';
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

export { element };
export async function queryServices(ids) {
 const response = await fetch(API + '/wix-data/v2/items/query', {
  method: 'POST', headers: { Authorization: await token(), 'Content-Type': 'application/json' },
  body: JSON.stringify({ dataCollectionId: 'RDEServices', query: { filter: { $and: [{ isVisible: { $eq: true } }, { _id: { $hasSome: ids } }] }, paging: { limit: 100, offset: 0 } } })
 });
 if (!response.ok) throw new Error('Services request failed (' + response.status + ')');
 const data = await response.json();
 return data.dataItems.map(i => i.data).filter(i => i.isVisible === true && i.approvalStatus !== 'draft');
}
