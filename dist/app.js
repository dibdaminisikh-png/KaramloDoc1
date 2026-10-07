const groups = [
  { title: 'پذیرش و امور مالی', steps: [
    ['ثبت اطلاعات و تخصیص کارشناس', 'اداری'],
    ['بررسی مدارک', 'کارشناس طراحی', [], 'docs'],
    ['صدور پیش‌فاکتور و پرداخت پارت اول', 'اداری']
  ]},
  { title: 'طراحی و تأیید', steps: [
    ['انجام طراحی', 'کارشناس طراحی', ['دکتر پرهیز', 'جراح', 'کارشناس طراحی دوم']],
    ['تسویه', 'کارشناس اداری']
  ]},
  { title: 'تولید و کنترل', steps: [
    ['تولید مولاژ', 'کارشناس تولید', ['دکتر پرهیز']],
    ['تولید پروتز', 'کارشناس تولید', ['کارشناس طراحی', 'دکتر پرهیز']],
    ['سایر مراحل یک', 'کارشناس تولید', ['کارشناس طراحی', 'دکتر پرهیز']],
    ['سایر مراحل دو', 'کارشناس تولید', ['کارشناس طراحی', 'دکتر پرهیز']]
  ]},
  { title: 'آماده‌سازی و تحویل', steps: [
    ['عکاسی', 'کارشناس مارکتینگ'],
    ['شستشو و استریل', 'کارشناس تولید'],
    ['تحویل', 'کارشناس اداری']
  ]}
];
const fa = n => String(n).padStart(2, '0').replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[d]);
let index = 0;
document.getElementById('stages').innerHTML = groups.map((group, g) => `<section class="group" aria-labelledby="group-${g}"><h2 class="group-heading" id="group-${g}"><span>${fa(g+1)}</span><b>${group.title}</b></h2>${group.steps.map(([title, owner, approvals = [], note]) => {
  index++;
  return `<div class="row"><article class="card" role="button" tabindex="0" aria-label="نمایش مرحله ${fa(index)} در مرکز تصویر: ${title}، ${owner}"><span class="number" aria-hidden="true">${fa(index)}</span><div><h3>${title}</h3><p class="owner">${owner}</p></div></article>${approvals.length ? `<div class="approvals" aria-label="تأییدها به ترتیب">${approvals.map((a,i) => `${i ? '<span class="approve-arrow" aria-hidden="true">←</span>' : ''}<span class="approval"><i aria-hidden="true"></i>تأیید ${a}</span>`).join('')}<p class="return-note">عدم تأیید: بازگشت به «${title}» برای اصلاح</p></div>` : note === 'docs' ? '<div class="docs-note"><strong>مدارک کامل: ادامه به پیش‌فاکتور</strong>مدارک ناقص: بازگشت به مرحله ثبت و تکمیل اطلاعات</div>' : ''}</div>`;
}).join('')}</section>`).join('');
const motionAllowed = window.matchMedia('(prefers-reduced-motion: no-preference)');
let frame = 0;
document.addEventListener('pointermove', e => {
  if (e.pointerType === 'touch' || !motionAllowed.matches) return;
  if (frame) cancelAnimationFrame(frame);
  const x=e.clientX, y=e.clientY, card=e.target.closest('.card');
  frame=requestAnimationFrame(() => {
    document.documentElement.style.setProperty('--mx', `${x}px`);
    document.documentElement.style.setProperty('--my', `${y}px`);
    if (card) { const rect=card.getBoundingClientRect(); card.style.setProperty('--x',`${x-rect.left}px`);card.style.setProperty('--y',`${y-rect.top}px`); }
    frame=0;
  });
}, {passive:true});

// Content remains visible without animation support or when reduced motion is requested.
const rows = [...document.querySelectorAll('.row')];
const trace = document.querySelector('.process-trace');
const process = document.querySelector('.process');
const end = document.querySelector('.terminus.end');
function layoutTop(element) {
  let top = 0;
  for (let node = element; node; node = node.offsetParent) top += node.offsetTop;
  return top;
}
function measureLayout() {
  // Leave just enough room to center both ends of the process when selected.
  document.body.style.paddingBottom = '0px';
  const main = document.querySelector('main');
  main.style.paddingTop = '';
  const firstCard = rows[0].querySelector('.card');
  const firstCenter = layoutTop(firstCard) + firstCard.offsetHeight / 2;
  if (firstCenter < innerHeight / 2) main.style.paddingTop = `${parseFloat(getComputedStyle(main).paddingTop) + Math.ceil(innerHeight / 2 - firstCenter)}px`;
  const lastCard = rows.at(-1).querySelector('.card');
  const needed = layoutTop(lastCard) + lastCard.offsetHeight / 2 + innerHeight / 2 - document.documentElement.scrollHeight;
  document.body.style.paddingBottom = `${Math.max(0, Math.ceil(needed))}px`;
  const startDot = document.querySelector('.terminus > span');
  const endDot = end.querySelector('span');
  const start = layoutTop(startDot) + startDot.offsetHeight / 2;
  const finish = layoutTop(endDot) + endDot.offsetHeight / 2;
  trace.style.top = `${start - layoutTop(process)}px`;
  trace.style.bottom = 'auto';
  trace.style.height = `${finish - start}px`;
  trace.dataset.start = start;
  queueScroll();
}
let scrollFrame = 0;
let revealObserver;
function updateScroll() {
  scrollFrame = 0;
  const focus = window.innerHeight * .55;
  const startScroll = Math.max(0, Number(trace.dataset.start) - focus);
  const maxScroll = document.documentElement.scrollHeight - innerHeight;
  const progress = Math.min(1, Math.max(0, (scrollY - startScroll) / Math.max(1, maxScroll - startScroll)));
  trace.style.setProperty('--progress', progress);
  end.classList.toggle('is-complete', maxScroll > 0 && maxScroll - scrollY <= 1);
  let current = null;
  rows.forEach(row => { if (row.getBoundingClientRect().top < focus) current = row; });
  rows.forEach(row => row.classList.toggle('is-current', row === current));
}
function queueScroll() {
  if (!scrollFrame) scrollFrame = requestAnimationFrame(updateScroll);
}
function setupMotion() {
  revealObserver?.disconnect();
  document.documentElement.classList.toggle('scroll-motion', motionAllowed.matches && 'IntersectionObserver' in window);
  if (motionAllowed.matches && 'IntersectionObserver' in window) {
    revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) {entry.target.classList.add('is-visible'); revealObserver.unobserve(entry.target);} });
    }, {threshold: .12, rootMargin: '0px 0px -35px 0px'});
    rows.forEach(row => revealObserver.observe(row));
  }
  queueScroll();
}
rows.forEach(row => {
  row.addEventListener('focusin', () => row.classList.add('is-visible'));
  const card = row.querySelector('.card');
  function centerStage() {
    row.classList.add('is-visible');
    const top = layoutTop(card) + card.offsetHeight / 2 - innerHeight / 2;
    window.scrollTo({top: Math.max(0, top), behavior: motionAllowed.matches ? 'smooth' : 'instant'});
  }
  card.addEventListener('click', centerStage);
  card.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') {event.preventDefault(); centerStage();}
  });
});
window.addEventListener('scroll', queueScroll, {passive:true});
window.addEventListener('resize', measureLayout, {passive:true});
motionAllowed.addEventListener('change', setupMotion);
measureLayout();
document.fonts?.ready.then(measureLayout);
setupMotion();
