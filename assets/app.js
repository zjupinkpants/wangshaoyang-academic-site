import { applicationStatus, applicationMilestones, deadlineTime, formatApplicationDate, createApplicationCalendar, applicationReminderTime } from './application-calendar.mjs';

const publications = [
  { year: '2026', title: 'A multi-axial HARM-based p-y + M-θ model with application to monopile offshore wind turbines in clay under multi-directional cyclic loadings', venue: 'Soil Dynamics and Earthquake Engineering', volume: '209', pages: '110483', doi: '10.1016/j.soildyn.2026.110483', authors: 'Wang L., Wang S., Wang L., Hong Y., Li L.', authorPosition: '第二作者', selfAuthor: 'Wang S.', type: 'published', label: '已发表', tone: 'green' },
  { year: '2026', title: '海上风电大直径单桩基础阻尼特性与整机动力响应研究', venue: '能源工程', authors: null, authorPosition: null, selfAuthor: null, needsVerification: true, type: 'published', label: '已发表', tone: 'green' },
  { year: '2025', title: 'A dynamic p-y + M-θ model for monopile in soft clay considering failure mechanism under combined actions of wind and earthquake', venue: 'Computers and Geotechnics', volume: '180', pages: '107074', doi: '10.1016/j.compgeo.2025.107074', authors: 'Wang L., Wang S., Wang L., Hong Y.', authorPosition: '第二作者', selfAuthor: 'Wang S.', type: 'published', label: '已发表', tone: 'green' },
  { year: '2023', title: 'A Detailed Analysis Framework of Fully Coupled Dynamic Responses for Offshore Wind Turbine Blade', venue: 'OMAE 2023 会议论文', doi: '10.1115/omae2023-104430', authors: 'Wang B., Liang X., Zhang J., Rui S., Zha X., Wang S., Chen Y.', authorPosition: '第六作者', selfAuthor: 'Wang S.', type: 'conference', label: '会议论文', tone: 'blue' },
  { year: '2022', title: 'Bending Analysis of Double Viscoelastic Nanoplates Based on the Modified Couple Stress Theory and Relaxation Theory', venue: 'Journal of Applied Mechanics and Technical Physics', pages: '711–720', doi: '10.1134/s0021894422040198', authors: 'Wang S. Y., Fang Y., Wang Y. Y., Zhang Y. Q.', authorPosition: '第一作者', selfAuthor: 'Wang S. Y.', type: 'published', label: '已发表', tone: 'green' },
  { year: '2020', title: '基于修正的偶应力理论的双层粘弹性纳米板双轴屈曲分析', venue: '科技通报', authors: null, authorPosition: null, selfAuthor: null, needsVerification: true, type: 'published', label: '已发表', tone: 'green' }
];

const patents = [
  { title: '一种土工离心机模拟海洋环境桩基多向加载试验装置及其方法', meta: 'CN117804909A · 专利申请公开' },
  { title: '水平地震作用下单桩基础动力响应模拟软件 V1.0', meta: '2024SR0192868 · 软件著作权' }
];


const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const { applications, projects } = JSON.parse($('#content-data').textContent);
const state = { pubFilter: 'all', applicationStage: 'active' };
const titles = {home:'王少扬｜海洋工程与技术博士', projects:'项目经历｜王少扬',publications:'学术成果｜王少扬',applications:'浙江省科技项目申报｜王少扬','404':'页面未找到｜王少扬'};

function renderPublications() {
  $$('#pub-filters button').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === state.pubFilter)));
  $('#publication-list').innerHTML = publications.filter(item => state.pubFilter === 'all' || item.type === state.pubFilter).map(item => {
    const authors = item.authors ? esc(item.authors).replace(esc(item.selfAuthor), '<strong class="author-self">'+esc(item.selfAuthor)+'</strong>') : '';
    return '<li class="publication-item">'+
      (authors ? '<p class="publication-authors">'+authors+'</p>' : '')+
      '<p class="publication-title">'+esc(item.title)+'.</p>'+
      '<p class="publication-meta"><em>'+esc(item.venue)+'</em>, '+item.year+(item.volume?', '+esc(item.volume):'')+(item.pages?', '+esc(item.pages):'')+'.</p>'+
      (item.authorPosition?'<span class="publication-position">'+esc(item.authorPosition)+'</span>':'')+
      (item.doi?' <a class="publication-link" href="https://doi.org/'+item.doi+'" target="_blank" rel="noreferrer">DOI: '+item.doi+'</a>':'')+'</li>';
  }).join('');
  $('#patent-list').innerHTML = '<article class="patent-item"><strong>'+esc(patents[0].title)+'</strong><p>'+esc(patents[0].meta)+'</p></article>';
  $('#software-list').innerHTML = '<article class="patent-item"><strong>'+esc(patents[1].title)+'</strong><p>'+esc(patents[1].meta)+'</p></article>';
}

function renderProjects() {
  $('#project-list').innerHTML = ['本人负责项目','参与科研项目','工程技术和工业软件项目'].map(group =>
    '<section class="project-group"><h2>'+group+'</h2>'+projects.filter(item => item.group === group).map(item =>
      '<article class="project-row'+(item.period?'':' project-row--undated')+'">'+(item.period?'<div class="project-date">'+esc(item.period)+'</div>':'')+'<div><h3>'+esc(item.title)+'</h3><p class="project-role">'+esc(item.role)+(item.highlight?' · '+esc(item.highlight):'')+'</p>'+
      (item.program?'<p>'+esc(item.program)+(item.identifier?' · <code>'+esc(item.identifier)+'</code>':'')+'</p>':'')+
      (item.topic?'<p>技术主题：'+esc(item.topic)+'</p>':'')+
      (item.contribution?'<p>本人工作：'+esc(item.contribution)+'</p>':'')+(item.outputs?'<p>相关成果：'+esc(item.outputs)+'</p>':'')+'</div></article>'
    ).join('')+'</section>'
  ).join('');
}

function renderApplications() {
  const now = Date.now();
  $('#application-update').textContent = '更新：'+applications.updated.replaceAll('-','.')+' · 北京时间';
  $$('#application-filters button').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.stage === state.applicationStage)));
  const selected = applications.items.filter(item => {
    const status = applicationStatus(item, now).id;
    return state.applicationStage === 'all' || (state.applicationStage === 'closed' ? status === 'closed' : status !== 'closed');
  });
  $('#application-list').innerHTML = selected.length ? selected.map(item => {
    const status = applicationStatus(item, now);
    const milestones = applicationMilestones(item);
    const future = milestones.filter(milestone => deadlineTime(milestone.date) >= now);
    return '<article class="application-row" data-application="'+esc(item.id)+'"><div class="application-meta"><span>'+esc(item.category)+'</span><span class="application-state '+status.id+'">'+status.label+'</span></div>'+
      '<h2>'+esc(item.title)+'</h2><p class="application-summary">'+esc(item.summary)+'</p><dl class="application-dates"><div><dt>填报开放</dt><dd>'+formatApplicationDate(item.opensAt)+'</dd></div>'+
      milestones.map(milestone => '<div><dt>'+esc(milestone.label)+'</dt><dd>'+formatApplicationDate(milestone.date)+'</dd></div>').join('')+'</dl>'+
      '<div class="application-links"><a href="'+esc(item.sourceUrl)+'" target="_blank" rel="noreferrer">官方通知</a><a href="'+esc(item.portalUrl)+'" target="_blank" rel="noreferrer">申报入口</a><span>'+esc(item.source)+' · '+item.published.replaceAll('-','.')+'</span></div>'+
      (future.length?'<form class="reminder-form" data-reminder="'+esc(item.id)+'"><label>提醒节点<select name="milestone">'+future.map(milestone=>'<option value="'+milestone.id+'">'+esc(milestone.label)+'</option>').join('')+'</select></label><label>提前提醒<select name="lead"><option value="7">提前7天</option><option value="3">提前3天</option><option value="14">提前14天</option></select></label><button class="button" type="submit">添加到日历</button></form>':'')+'</article>';
  }).join('') : '<p class="empty-state">当前没有开放的申报窗口。可查看往期申报日期和官方通知。</p>';
}

function toggleMenu(open) {
  $('#site-nav').classList.toggle('is-open', open);
  $('.nav-toggle').setAttribute('aria-expanded', String(open));
}
function showRoute() {
  if ($('#figure-dialog').open) $('#figure-dialog').close();
  const hash = location.hash.slice(1) || 'home';
  let route = hash.split('/')[0];
  if (route === 'knowledge' || /^note-\d{2}$/.test(route)) {
    history.replaceState(null, '', '#applications');
    route = 'applications';
  }
  let page = Object.hasOwn(titles, route) ? route : '404';
  $$('.page').forEach(section => section.classList.toggle('is-active', section.dataset.page === page));
  $$('#site-nav a').forEach(link => {
    if (link.dataset.route === page) link.setAttribute('aria-current','page');
    else link.removeAttribute('aria-current');
  });
  document.title = titles[page];
  if (page === 'applications') renderApplications();
  const description = $('meta[name="description"]');
  description.content = page === 'home' ? '海洋工程与技术博士，现于华电（浙江）海洋能源科技有限公司。主要研究方向为海上风电多体系统动力学，长期从事海上风电（场）灾变机理、分析理论与调控技术研究。' : document.title;
  toggleMenu(false);
  $('#main').focus({preventScroll:true});
  window.scrollTo({top:0,behavior:'instant'});
}
$('.nav-toggle').addEventListener('click', () => toggleMenu(!$('#site-nav').classList.contains('is-open')));
$$('.figure-zoom').forEach(button => button.addEventListener('click', () => {
  const image = button.querySelector('img');
  const dialog = $('#figure-dialog');
  dialog.querySelector('img').src = image.src;
  dialog.querySelector('img').alt = image.alt;
  $('#figure-title').textContent = button.closest('figure').querySelector('figcaption strong').textContent;
  dialog.showModal();
}));
$('#figure-dialog').addEventListener('click', event => {
  if (event.target === $('#figure-dialog')) $('#figure-dialog').close();
});
$('#site-nav').addEventListener('click', event => {
  if (event.target.closest('a')) toggleMenu(false);
});
$('#application-filters').addEventListener('click', event => {
  const button = event.target.closest('[data-stage]');
  if (button) { state.applicationStage = button.dataset.stage; renderApplications(); }
});
$('#application-list').addEventListener('submit', event => {
  event.preventDefault();
  const form = event.target.closest('[data-reminder]');
  if (!form) return;
  const item = applications.items.find(item => item.id === form.dataset.reminder);
  const values = new FormData(form);
  const url = URL.createObjectURL(new Blob([createApplicationCalendar(item, values.get('milestone'), Number(values.get('lead')))], {type:'text/calendar;charset=utf-8'}));
  const link = document.createElement('a');
  link.href = url; link.download = item.id+'-'+values.get('milestone')+'.ics';
  document.body.append(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  $('#calendar-status').textContent = applicationReminderTime(item, values.get('milestone'), values.get('lead')) < Date.now()
    ? '日历文件已生成。提前提醒日期已过，可改选较短的提醒间隔。'
    : '日历文件已生成，请打开并导入日历。';
});
document.addEventListener('visibilitychange', () => {
  if (!document.hidden && $('#page-applications').classList.contains('is-active')) renderApplications();
});
setInterval(() => {
  if (!document.hidden && $('#page-applications').classList.contains('is-active') && !$('#application-list').contains(document.activeElement)) renderApplications();
}, 60000);
$('#pub-filters').addEventListener('click', event => {
  const button = event.target.closest('[data-filter]');
  if (button) { state.pubFilter = button.dataset.filter; renderPublications(); }
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && $('#site-nav').classList.contains('is-open')) { toggleMenu(false); $('.nav-toggle').focus(); }
});
window.addEventListener('hashchange', showRoute);
$('.skip-link').addEventListener('click', event => { event.preventDefault(); $('#main').focus(); });
renderPublications(); renderProjects(); renderApplications(); showRoute();
