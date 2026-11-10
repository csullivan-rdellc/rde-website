import { createFormStore, FORM_ERROR } from '/js/wix/form-store.js';
const store = createFormStore({ formId: '8ad56d98-bd3c-4123-8edf-b30cefa86b8c' });
const mount = document.querySelector('#wix-contact');
const status = document.querySelector('#contact-form-status');
const formEl = document.createElement('form');
formEl.noValidate = true;
formEl.setAttribute('aria-label', 'Contact RDE');
let signature = '', prefilled = false;
const controls = new Map();
function el(tag, text, className) {
 const node = document.createElement(tag);
 if (text) node.textContent = text;
 if (className) node.className = className;
 return node;
}
function render(state) {
 if (state.outcome) {
  if (state.outcome.url) {
   if (state.outcome.newTab) window.open(state.outcome.url, '_blank', 'noopener');
   else location.assign(state.outcome.url);
   return;
  }
  const message = el('div', '', 'wix-success');
  message.setAttribute('role', 'status');
  for (const text of (state.outcome.message || 'Thank you. Your enquiry has been sent to RDE.').split('\n')) {
   if (text) message.append(el('p', text));
  }
  mount.replaceChildren(message); document.dispatchEvent(new CustomEvent('rde:content-ready', { detail: { root: mount } })); status.textContent = ''; return;
 }
 if (!state.form) { status.textContent = state.errors[FORM_ERROR] || 'Loading contact form…'; return; }
 if (state.closed) { status.textContent = state.form.disabledMessage || 'This form is not accepting enquiries. Please contact RDE directly.'; mount.replaceChildren(); return; }
 status.textContent = '';
 const step = state.form.steps[state.step];
 const fields = state.form.fields.filter(f => !step || f.stepId === step.id);
 const key = JSON.stringify([state.step, fields.map(f => [f.target, f.control, f.label, f.required, f.readOnly, f.choices])]);
 if (key !== signature) {
  signature = key; controls.clear(); formEl.replaceChildren();
  for (const field of fields) {
   const group = el('div', '', 'wix-field');
   const label = el('label', field.label + (field.required && state.form.requiredIndicator !== 'NONE' ? ' *' : ''));
   label.htmlFor = field.target;
   if (field.showLabel === false) label.className = 'sr-only';
   let input;
   if (field.control === 'textarea') {
    input = el('textarea');
    if (field.validation?.maxLength) input.maxLength = field.validation.maxLength;
   } else if (field.control === 'select') {
    input = el('select');
    for (const choice of field.choices || []) {
     const option = el('option', choice.label); option.value = choice.value; input.append(option);
    }
   } else {
    input = el('input');
    input.type = ({ phone: 'tel', datetime: 'datetime-local' })[field.control] || (['email','url','password','number','date','time','checkbox'].includes(field.control) ? field.control : 'text');
   }
   input.id = field.target; input.name = field.target;
   input.required = Boolean(field.required); input.disabled = Boolean(field.readOnly);
   if (field.placeholder) input.placeholder = field.placeholder;
   const helpId = 'help-' + field.target, errorId = 'error-' + field.target;
   input.setAttribute('aria-describedby', errorId + (field.description ? ' ' + helpId : ''));
   const error = el('p', '', 'field-error'); error.id = errorId; error.setAttribute('role', 'alert');
   group.append(label, input);
   if (field.description) { const help = el('p', field.description, 'form-help'); help.id = helpId; group.append(help); }
   group.append(error); formEl.append(group); controls.set(field.target, { input, error, field });
  }
  const error = el('p', '', 'form-error'); error.id = 'contact-form-error'; error.setAttribute('role', 'alert'); formEl.append(error);
  const actions = el('div', '', 'form-actions');
  if (state.step > 0) { const back = el('button', state.form.previousText || 'Back'); back.type = 'button'; back.addEventListener('click', () => store.previous()); actions.append(back); }
  const button = el('button', state.form.submitText || 'Send enquiry', 'button');
  button.type = 'submit'; button.id = 'contact-submit'; actions.append(button); formEl.append(actions);
  mount.replaceChildren(formEl);
  document.dispatchEvent(new CustomEvent('rde:content-ready', { detail: { root: mount } }));
 }
 for (const [target, { input, error }] of controls) {
  if (input.type === 'checkbox') input.checked = Boolean(state.values[target]);
  else if (input.value !== String(state.values[target] ?? '')) input.value = String(state.values[target] ?? '');
  error.textContent = state.errors[target] || '';
  input.setAttribute('aria-invalid', String(Boolean(state.errors[target])));
 }
 formEl.querySelector('#contact-form-error').textContent = state.errors[FORM_ERROR] || '';
 const button = formEl.querySelector('#contact-submit');
 button.disabled = state.loading;
 button.textContent = state.loading ? 'Sending…' : state.step < state.form.steps.length - 1 ? (state.form.nextText || 'Continue') : (state.form.submitText || 'Send enquiry');
 if (!prefilled) {
  prefilled = true;
  const params = new URLSearchParams(location.search), selected = params.get('service') || params.get('plan');
  const field = state.form.fields.find(f => f.choices?.some(c => c.value === selected));
  if (field) store.setValue(field.target, selected);
 }
}
formEl.addEventListener('input', event => {
 const input = event.target;
 if (input.name) store.setValue(input.name, input.type === 'checkbox' ? input.checked : input.value);
});
formEl.addEventListener('change', event => {
 const input = event.target;
 if (input.name) store.setValue(input.name, input.type === 'checkbox' ? input.checked : input.value);
});
formEl.addEventListener('focusout', event => { if (event.target.name) store.validate(event.target.name); });
formEl.addEventListener('submit', event => {
 const state = store.getState();
 if (state.form && state.step < state.form.steps.length - 1) store.next(event);
 else store.submit(event);
});
store.subscribe(render); render(store.getState()); store.start();
