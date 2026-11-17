const rules = [
  { id: 'R01', category: '环境变化', condition: 'IP不在常用IP中', score: '-10', mode: '单项扣分', desc: '常用设备命中时仍可保持高分', enabled: true },
  { id: 'R02', category: '环境变化', condition: '有效设备号不在常用设备中', score: '-15', mode: '单项扣分', desc: '设备变化权重大于单纯IP变化', enabled: true },
  { id: 'R03', category: '环境变化', condition: 'IP不在常用IP，且设备无法证明为常用', score: '直接-45', mode: '覆盖R01/R02', desc: '包含有效陌生设备及非有效设备号，不重复扣分', enabled: true },
  { id: 'R04', category: '环境变化', condition: '本次未获取到有效设备号', score: '-5', mode: '单项扣分', desc: '单独不验证，与陌生IP组合时使用R03', enabled: true },
  { id: 'R05', category: '风险关联', condition: '风险IP关联9-10／11-20／21-50／51-100／100人以上', score: '-8/-12/-20/-30/-40', mode: '分档取值', desc: '按滚动48小时关联的不同有效用户数统计', enabled: true },
  { id: 'R06', category: '风险关联', condition: '风险设备号关联9-10／11-20／21-50／51-100／100人以上', score: '-10/-18/-30/-45/-60', mode: '分档取值', desc: '仅统计device_valid=1的有效设备号', enabled: true },
  { id: 'R07', category: '行为风险', condition: '短时间频繁切换IP或设备号', score: '-10至-20', mode: '区间扣分', desc: '与用户自己的历史切换频率比较', enabled: true },
  { id: 'R08', category: '行为风险', condition: '短时间同IP或设备号登录多个账号', score: '-15至-30', mode: '取较高值', desc: '与48小时风险关联规则不重复累计', enabled: true },
  { id: 'R09', category: '行为风险', condition: '沉睡超过90天且IP、设备均变化', score: '-10', mode: '条件扣分', desc: '仅在设备无法证明可信且IP陌生时扣分', enabled: true },
  { id: 'R10', category: '行为风险', condition: '新环境登录后立即进行敏感操作', score: '-15', mode: '条件扣分', desc: '登录与敏感操作使用同一本次分数', enabled: true },
  { id: 'R11', category: '行为风险', condition: '密码连续错误、撞库或接口高频', score: '-20至-40', mode: '区间扣分', desc: '需要失败登录及接口请求日志支持', enabled: true },
];

const bands = [
  { range: '80至100', action: '正常放行', className: 'healthy', detail: '正常登录，不弹出验证；后台记录环境与分数。' },
  { range: '60至79', action: '预警观察', className: 'watch', detail: '不打扰用户；进入观察名单并持续累积风险信号。' },
  { range: '40至59', action: '单项验证', className: 'single', detail: '从可用方式中任选1项；成功后更新常用环境并恢复100分。' },
  { range: '20至39', action: '双项验证', className: 'double', detail: '完成2种不同验证；可用方式不足2项时转人工。' },
  { range: '0至19', action: '阻断或人工', className: 'block', detail: '停止后续操作；进入待验证名单并引导联系客服。' },
];

const pendingRows = [
  {
    memberId: '2795074', user: 'hxm001@as', score: 15, action: '阻断人工', reason: '陌生IP＋设备无法证明可信；命中风险设备号51至100人', ip: '103.88.14.26', device: '非有效设备号', status: '未通过验证', source: '自动添加', time: '2026-11-17 09:46', note: '高风险设备关联，已引导联系客服', operator: '系统',
    breakdown: [['初始分', '每次登录从100分开始', '100', '100'], ['R03 组合规则', '陌生IP＋设备无法证明可信', '-45', '55'], ['R06 风险设备号', '48小时关联68个有效用户', '-45', '10'], ['R07 变化速度', '短时高频切换环境', '-10', '0']],
  },
  {
    memberId: '2826222', user: 'yongson005', score: 35, action: '双项验证', reason: '陌生IP＋有效陌生设备；风险IP关联21至50人', ip: '202.55.225.254', device: '有效陌生设备', status: '两步验证', source: '自动添加', time: '2026-11-17 09:18', note: '用户反馈更换手机', operator: '系统',
    breakdown: [['初始分', '每次登录从100分开始', '100', '100'], ['R03 组合规则', 'IP和有效设备均未命中常用环境', '-45', '55'], ['R05 风险IP', '48小时关联27个有效用户', '-20', '35']],
  },
  {
    memberId: '2826202', user: 'cora888@as', score: 55, action: '单项验证', reason: '陌生IP＋设备无法证明可信；组合规则直接扣45分', ip: '47.76.91.34', device: '未获取有效设备号', status: '一步验证', source: '手动添加', time: '2026-11-17 08:52', note: '运营复核', operator: 'Cora',
    breakdown: [['初始分', '每次登录从100分开始', '100', '100'], ['R03 组合规则', '陌生IP＋未获取有效设备号', '-45', '55']],
  },
  {
    memberId: '2827144', user: 'evan001@h8', score: 100, action: '正常放行', reason: '已完成验证并更新常用环境', ip: '139.162.60.207', device: '有效常用设备', status: '正常', source: '自动添加', time: '2026-11-17 10:26', note: '用户验证通过', operator: '系统', resetFrom: 35, resetTime: '2026-11-17 10:26', resetOperator: '系统',
    breakdown: [['初始分', '每次登录从100分开始', '100', '100'], ['R03 组合规则', 'IP和设备均未命中常用环境', '-45', '55'], ['R05 风险IP', '48小时关联27个有效用户', '-20', '35'], ['验证成功', '更新常用IP及有效设备号', '+65', '100']],
  },
];

const methodMeta = {
  phone: { name: '手机验证', sub: '+86 137****8374', placeholder: '请输入6位验证码', expected: '863921', hint: '验证码已发送至 +86 137****8374' },
  email: { name: '邮箱验证', sub: 'cor***@mail.com', placeholder: '请输入6位验证码', expected: '863921', hint: '验证码已发送至 cor***@mail.com' },
  withdraw: { name: '上次成功提款账号', sub: '银行卡／支付宝／微信／电子钱包', placeholder: '请输入完整账号', expected: '6222533452567006509', hint: '请输入上一次成功提款使用的完整账号' },
  fund: { name: '资金密码验证', sub: '已设置资金密码', placeholder: '请输入资金密码', expected: '123456', hint: '请输入当前资金密码' },
};

const state = {
  score: 55,
  attempts: 3,
  maxAttempts: 3,
  required: 1,
  completed: [],
  selectedMethod: null,
  available: { phone: true, email: true, withdraw: true, fund: false },
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

function scoreClass(score) {
  if (score >= 80) return 'score-healthy';
  if (score >= 60) return 'score-watch';
  if (score >= 40) return 'score-single';
  if (score >= 20) return 'score-double';
  return 'score-block';
}

function actionForScore(score) {
  if (score >= 80) return '正常放行';
  if (score >= 60) return '预警观察';
  if (score >= 40) return '单项验证';
  if (score >= 20) return '双项验证';
  return '阻断或人工';
}

function setFrontState(title, detail) {
  $('#frontState').textContent = title;
  $('#frontStateDetail').textContent = detail;
}

function showToast(message) {
  const toast = $('#toast');
  toast.textContent = message;
  toast.classList.remove('hidden');
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.add('hidden'), 3200);
}

function setPrototypeScreen(screen) {
  const background = $('#prototypeBackground');
  if (!background) return;
  const isLogin = screen === 'login';
  background.src = isLogin ? 'assets/cora001-login.png' : 'assets/cora001-home.png';
  background.alt = isLogin ? '杏彩体育登录页面' : '杏彩体育首页';
  if ($('#loginBtn')) $('#loginBtn').classList.toggle('hidden', !isLogin);
  if ($('#loginCloseBtn')) $('#loginCloseBtn').classList.toggle('hidden', !isLogin);
}

function showHome() {
  setPrototypeScreen('home');
}

function resetFront() {
  state.attempts = state.maxAttempts;
  state.completed = [];
  state.selectedMethod = null;
  $('#modalMask').classList.add('hidden');
  $('#securityModal').innerHTML = '';
  setPrototypeScreen('login');
  setFrontState('等待登录', '风险分数将在登录时生效');
}

function openSecurityModal(html, options = {}) {
  $('#securityModal').innerHTML = html;
  $('#modalMask').dataset.maskClose = options.maskClose ? 'true' : 'false';
  $('#modalMask').classList.remove('hidden');
  $('#securityModal').scrollTop = 0;
  bindModalCommon();
}

function closeSecurityModal() {
  $('#modalMask').classList.add('hidden');
}

function modalFrame(title, body, showClose = true) {
  return `<div class="modal-head"><h2>${title}</h2>${showClose ? '<button class="icon-close" data-close>×</button>' : ''}</div><div class="modal-body">${body}</div>`;
}

function bindModalCommon() {
  $$('[data-close]').forEach(button => button.addEventListener('click', closeSecurityModal));
}

function startLoginFlow() {
  state.attempts = state.maxAttempts;
  state.completed = [];
  state.selectedMethod = null;
  const score = state.score;
  const action = actionForScore(score);
  setFrontState(action, `登录风险分数：${score}分`);
  showHome();

  if (score >= 80) {
    showHome();
    showToast('登录成功，正常放行');
    return;
  }
  if (score >= 60) {
    showHome();
    return;
  }
  if (score < 20) {
    renderManualBlock('当前登录存在较高安全风险');
    return;
  }
  state.required = score < 40 ? 2 : 1;
  const usableCount = Object.values(state.available).filter(Boolean).length;
  if (usableCount < state.required) {
    renderManualBlock(`可用验证方式不足${state.required}项`);
    return;
  }
  renderSecurityPrompt();
}

function renderSecurityPrompt() {
  const countText = state.required === 1 ? '完成1项验证后继续登录' : '需要完成2项不同的验证';
  openSecurityModal(modalFrame('温馨提示', `
    <a class="customer-link" href="javascript:void(0)">联系客服</a>
    <div class="modal-copy"><strong>检测到您正在新的登录环境中登录</strong><span>为了保障账号安全，${countText}</span></div>
    <div class="modal-actions"><button class="secondary-action" data-cancel>取消</button><button class="primary" data-start>立即验证</button></div>
  `));
  $('[data-cancel]').addEventListener('click', closeSecurityModal);
  $('[data-start]').addEventListener('click', renderMethodChoice);
}

function renderMethodChoice() {
  const isDouble = state.required === 2;
  const remaining = state.required - state.completed.length;
  const title = isDouble ? `选择第${state.completed.length + 1}种验证方式` : '选择验证方式';
  const progress = state.completed.length / state.required * 100;
  const methods = Object.entries(methodMeta).map(([key, meta]) => {
    const available = state.available[key];
    const completed = state.completed.includes(key);
    const disabled = !available || completed;
    const stateClass = completed ? 'completed' : disabled ? 'disabled' : state.selectedMethod === key ? 'selected' : '';
    const sub = completed ? '已验证完成' : available ? meta.sub : '未绑定或未设置';
    return `<button class="method-option ${stateClass}" data-method="${key}" ${disabled ? 'disabled' : ''}><strong>${meta.name}</strong><span>${sub}</span></button>`;
  }).join('');

  openSecurityModal(modalFrame(title, `
    <div class="progress-track"><div class="progress-fill" style="width:${progress}%"></div></div>
    <div class="progress-label">${isDouble ? `双项验证 ${state.completed.length} / 2` : '单项验证 0 / 1'}</div>
    <div class="method-note">请选择可用方式完成剩余${remaining}项验证</div>
    <div class="method-grid">${methods}</div>
    <div class="modal-actions"><button class="secondary-action" data-back-login>返回登录</button><button class="primary" data-method-next ${state.selectedMethod ? '' : 'disabled'}>下一步</button></div>
  `));
  $$('[data-method]').forEach(button => button.addEventListener('click', () => {
    state.selectedMethod = button.dataset.method;
    renderMethodChoice();
  }));
  $('[data-back-login]').addEventListener('click', () => { closeSecurityModal(); setFrontState('已取消验证', '返回登录页'); });
  $('[data-method-next]').addEventListener('click', () => renderVerifyInput());
}

function renderVerifyInput(error = '') {
  const meta = methodMeta[state.selectedMethod];
  openSecurityModal(modalFrame(meta.name, `
    <div class="progress-track"><div class="progress-fill" style="width:${(state.completed.length + 1) / state.required * 100}%"></div></div>
    <div class="progress-label">${state.required === 2 ? `双项验证 ${state.completed.length + 1} / 2` : '单项验证 1 / 1'}</div>
    <div class="modal-copy"><span>${meta.hint}</span></div>
    <div class="field-row">
      <div class="field-meta"><span>${meta.placeholder}</span><span class="attempts">剩余验证次数：${state.attempts}次</span></div>
      <input class="verify-input" id="verifyValue" placeholder="${meta.placeholder}" ${state.selectedMethod === 'fund' ? 'type="password"' : ''}>
      <div class="field-hint">输入演示校验值后确认验证</div>
      ${error ? `<div class="error-copy">${error}</div>` : ''}
    </div>
    <div class="modal-actions"><button class="secondary-action" data-back-method>上一步</button><button class="primary" data-confirm>确认验证</button></div>
  `));
  $('[data-back-method]').addEventListener('click', renderMethodChoice);
  $('[data-confirm]').addEventListener('click', confirmVerification);
  $('#verifyValue').addEventListener('keydown', event => { if (event.key === 'Enter') confirmVerification(); });
  $('#verifyValue').focus();
}

function confirmVerification() {
  const meta = methodMeta[state.selectedMethod];
  const value = $('#verifyValue').value.trim();
  if (value !== meta.expected) {
    state.attempts -= 1;
    if (state.attempts <= 0) {
      renderManualBlock('验证次数已达上限');
      setFrontState('阻断或人工', '验证失败次数已达到上限');
      return;
    }
    renderVerifyInput('您输入的信息与原记录不一致，请重新输入');
    setFrontState('验证未通过', `剩余验证次数：${state.attempts}次`);
    return;
  }

  state.completed.push(state.selectedMethod);
  state.selectedMethod = null;
  if (state.completed.length < state.required) {
    setFrontState('双项验证中', `已完成${state.completed.length}/2项验证`);
    renderMethodChoice();
    return;
  }
  renderVerificationSuccess();
}

function renderVerificationSuccess() {
  state.score = 100;
  updateScoreUI();
  setFrontState('验证成功', '本次分数恢复100分；下次登录重新评分');
  openSecurityModal(modalFrame('恭喜您，通过安全验证。', `
    <div class="status-icon success">✓</div>
    <div class="modal-copy success-fund-copy"><span>检测到您未设置资金密码请立即设定。</span></div>
    <div class="modal-actions"><button class="primary wide" data-set-fund>立即设定</button></div>
  `, false), { maskClose: true });
  $('[data-set-fund]').addEventListener('click', () => {
    closeSecurityModal();
    showHome();
    setFrontState('验证成功', '等待设置资金密码');
  });
}

function renderManualBlock(reason) {
  openSecurityModal(modalFrame('需要人工协助', `
    <div class="status-icon failure">×</div>
    <div class="modal-copy"><strong>${reason}</strong><span>为保障账号安全，请联系客服核实身份后处理</span></div>
    <div class="modal-actions"><button class="primary wide" data-service>联系客服</button></div>
  `));
  $('[data-service]').addEventListener('click', () => showToast('已打开客服入口（原型演示）'));
  setFrontState('阻断或人工', reason);
}

function updateScoreUI() {
  $('#scoreOrb').textContent = state.score;
  $('#scoreOrb').style.background = state.score >= 80 ? '#3e8e68' : state.score >= 60 ? '#315f9c' : state.score >= 40 ? '#d88618' : state.score >= 20 ? '#7656a8' : '#d9534f';
  $('#controlAction').textContent = actionForScore(state.score);
}

function renderRules(filter = 'all') {
  const body = $('#ruleTableBody');
  body.innerHTML = rules.filter(rule => filter === 'all' || rule.category === filter).map(rule => `
    <tr>
      <td>${rule.id}</td><td>${rule.category}</td><td>${rule.condition}</td>
      <td class="score-text score-block">${rule.score}</td><td>${rule.mode}</td><td>${rule.desc}</td>
      <td class="status-enabled">${rule.enabled ? '启用' : '停用'}</td>
      <td><button class="table-link" data-edit-rule="${rule.id}">修改</button><button class="table-link" data-toggle-rule="${rule.id}">${rule.enabled ? '停用' : '启用'}</button><button class="table-link">日志</button></td>
    </tr>`).join('');
  $$('[data-edit-rule]').forEach(button => button.addEventListener('click', () => openRuleDialog(button.dataset.editRule)));
  $$('[data-toggle-rule]').forEach(button => button.addEventListener('click', () => {
    const rule = rules.find(item => item.id === button.dataset.toggleRule);
    rule.enabled = !rule.enabled;
    renderRules($('#ruleCategoryFilter').value);
  }));
}

function renderBands() {
  $('#bandGrid').innerHTML = bands.map(band => `<article class="band-card ${band.className}"><strong>${band.range}分</strong><h3>${band.action}</h3><p>${band.detail}</p></article>`).join('');
}

function verificationStatusClass(status) {
  return status === '正常' ? 'normal' : status === '一步验证' ? 'one' : status === '两步验证' ? 'two' : 'failed';
}

function renderPending(rows = pendingRows) {
  const sortedRows = [...rows].sort((a, b) => b.time.localeCompare(a.time));
  $('#pendingTableBody').innerHTML = sortedRows.map((row, index) => `
    <tr>
      <td>${row.memberId}</td><td>${row.user}</td><td class="score-text ${scoreClass(row.score)}">${row.score}</td><td>${row.source}</td><td><span class="verify-status ${verificationStatusClass(row.status)}">${row.status}</span></td><td>${row.note || '—'}</td><td>${row.time}</td><td>${row.operator}</td>
      <td><button class="table-link" data-detail-id="${row.memberId}">评分详情</button><button class="table-link" data-manual-id="${row.memberId}">手动验证</button><button class="table-link" data-note-id="${row.memberId}">修改备注</button></td>
    </tr>`).join('');
  $('#accountTotal').textContent = sortedRows.length;
  $$('[data-detail-id]').forEach(button => button.addEventListener('click', () => openPendingDetail(button.dataset.detailId)));
  $$('[data-manual-id]').forEach(button => button.addEventListener('click', () => openManualVerifyDialog(button.dataset.manualId)));
  $$('[data-note-id]').forEach(button => button.addEventListener('click', () => openNoteDialog(button.dataset.noteId)));
}

function openDialog(title, body) {
  $('#adminDialog').innerHTML = `<div class="admin-dialog-head"><h2>${title}</h2><button data-dialog-close>×</button></div><div class="admin-dialog-body">${body}</div>`;
  $('#dialogMask').classList.remove('hidden');
  $('[data-dialog-close]').addEventListener('click', closeDialog);
}

function closeDialog() { $('#dialogMask').classList.add('hidden'); }

function openRuleDialog(ruleId = null) {
  const rule = ruleId ? rules.find(item => item.id === ruleId) : { id: `R${String(rules.length + 1).padStart(2, '0')}`, category: '环境变化', condition: '', score: '', mode: '单项扣分', desc: '', enabled: true };
  openDialog(ruleId ? '修改评分规则' : '新增评分规则', `
    <div class="admin-form">
      <label>规则ID</label><input id="dialogRuleId" value="${rule.id}" ${ruleId ? 'disabled' : ''}>
      <label>规则分类</label><select id="dialogRuleCategory"><option ${rule.category === '环境变化' ? 'selected' : ''}>环境变化</option><option ${rule.category === '风险关联' ? 'selected' : ''}>风险关联</option><option ${rule.category === '行为风险' ? 'selected' : ''}>行为风险</option></select>
      <label>判断条件</label><textarea id="dialogRuleCondition">${rule.condition}</textarea>
      <label>扣分值</label><input id="dialogRuleScore" value="${rule.score}" placeholder="例如：-10或-10至-20">
      <label>累计方式</label><input id="dialogRuleMode" value="${rule.mode}">
      <label>规则说明</label><textarea id="dialogRuleDesc">${rule.desc}</textarea>
    </div>
    <div class="admin-dialog-actions"><button class="admin-btn secondary" data-dialog-cancel>取消</button><button class="admin-btn" data-save-rule>保存</button></div>
  `);
  $('[data-dialog-cancel]').addEventListener('click', closeDialog);
  $('[data-save-rule]').addEventListener('click', () => {
    const payload = {
      id: $('#dialogRuleId').value.trim(), category: $('#dialogRuleCategory').value,
      condition: $('#dialogRuleCondition').value.trim(), score: $('#dialogRuleScore').value.trim(),
      mode: $('#dialogRuleMode').value.trim(), desc: $('#dialogRuleDesc').value.trim(), enabled: true,
    };
    if (!payload.condition || !payload.score) return;
    if (ruleId) Object.assign(rule, payload); else rules.push(payload);
    closeDialog(); renderRules($('#ruleCategoryFilter').value);
  });
}

function openBandsDialog() {
  openDialog('修改风险控制区间', `
    <div class="admin-form">
      ${bands.map((band, index) => `<label>${band.action}</label><input data-band-range="${index}" value="${band.range}">`).join('')}
    </div>
    <div class="admin-dialog-actions"><button class="admin-btn secondary" data-dialog-cancel>取消</button><button class="admin-btn" data-save-bands>保存</button></div>
  `);
  $('[data-dialog-cancel]').addEventListener('click', closeDialog);
  $('[data-save-bands]').addEventListener('click', () => {
    $$('[data-band-range]').forEach(input => bands[Number(input.dataset.bandRange)].range = input.value.trim());
    closeDialog(); renderBands();
  });
}

function openAddPendingDialog() {
  openDialog('手动添加用户账号评分', `
    <div class="admin-form">
      <label>会员账号</label><textarea id="addValue" placeholder="输入多个会员账号，每行一个；也支持逗号或空格分隔"></textarea>
      <label>验证要求</label><select id="addAction"><option>一步验证</option><option>两步验证</option></select>
      <label>备注</label><textarea id="addNote" placeholder="请输入手动添加原因，批量账号共用该备注"></textarea>
    </div>
    <div class="batch-help">账号重复时不新增记录，直接更新为本次选择的验证要求、备注、添加方式及操作人。</div>
    <div class="batch-preview" id="batchPreview">待添加账号：0 个</div>
    <div class="admin-dialog-actions"><button class="admin-btn secondary" data-dialog-cancel>取消</button><button class="admin-btn" data-save-pending>提交</button></div>
  `);
  $('[data-dialog-cancel]').addEventListener('click', closeDialog);
  const parseUsers = () => [...new Set($('#addValue').value.split(/[\s,，;；]+/).map(item => item.trim()).filter(Boolean))];
  $('#addValue').addEventListener('input', () => { $('#batchPreview').textContent = `待添加账号：${parseUsers().length} 个`; });
  $('[data-save-pending]').addEventListener('click', () => {
    const users = parseUsers();
    if (!users.length) return;
    const status = $('#addAction').value;
    const score = status === '一步验证' ? 55 : 35;
    const note = $('#addNote').value.trim() || '后台手动添加';
    let nextMemberId = 2900000 + pendingRows.length;
    users.forEach(user => {
      const existing = pendingRows.find(row => row.user.toLowerCase() === user.toLowerCase());
      const record = {
        user, score, action: status === '一步验证' ? '单项验证' : '双项验证', reason: `后台手动指定${status}`,
        ip: existing?.ip || '—', device: existing?.device || '—', status, source: '手动添加', time: '2026-11-17 11:20', note, operator: 'Cora',
        breakdown: [['手动添加', `后台指定${status}`, '—', score]],
      };
      if (existing) Object.assign(existing, record);
      else pendingRows.push({ memberId: String(nextMemberId++), ...record });
    });
    closeDialog(); renderPending();
  });
}

function openPendingDetail(memberId) {
  const row = pendingRows.find(item => item.memberId === memberId);
  const breakdownRows = row.breakdown.map((item, order) => `<tr><td>${order + 1}</td><td>${item[0]}</td><td>${item[1]}</td><td>${item[2]}</td><td>${item[3]}</td></tr>`).reverse().join('');
  const resetRecord = row.resetFrom !== undefined
    ? `<tr><td>${row.resetTime}</td><td>分数重置</td><td>验证成功，分数由${row.resetFrom}重置为100，并更新常用环境</td><td>${row.resetOperator}</td></tr>`
    : '';
  const latestRecord = row.resetFrom === undefined
    ? `<tr><td>${row.time}</td><td>${row.source}</td><td>分数更新为${row.score}，验证状态：${row.status}</td><td>${row.operator}</td></tr>`
    : '';
  const successButton = row.score === 100
    ? '<button class="admin-btn" disabled>当前已重置为100分</button>'
    : '<button class="admin-btn" data-mark-common>验证成功并重置为100分</button>';
  openDialog('账号评分详情', `
    <div class="detail-summary">
      <div><span>会员ID／账号</span><strong>${row.memberId}／${row.user}</strong></div><div><span>当前分数</span><strong class="${scoreClass(row.score)}">${row.score}</strong></div><div><span>添加方式</span><strong>${row.source}</strong></div><div><span>验证状态</span><strong>${row.status}</strong></div>
    </div>
    <div class="detail-section"><h3>本次评分明细</h3><table class="mini-table"><thead><tr><th>顺序</th><th>规则</th><th>命中内容</th><th>分值</th><th>累计分数</th></tr></thead><tbody>${breakdownRows}</tbody></table></div>
    <div class="detail-section"><h3>风险与环境信息</h3><table class="mini-table"><tbody><tr><td>触发原因</td><td colspan="3">${row.reason}</td></tr><tr><td>当前IP</td><td>${row.ip}</td><td>设备状态</td><td>${row.device}</td></tr><tr><td>备注</td><td colspan="3">${row.note || '—'}</td></tr></tbody></table></div>
    <div class="detail-section"><h3>验证及变更记录</h3><table class="mini-table"><thead><tr><th>时间</th><th>类型</th><th>内容</th><th>操作人</th></tr></thead><tbody>${resetRecord}${latestRecord}<tr><td>2026-11-17 08:20</td><td>评分记录</td><td>${row.reason}</td><td>系统</td></tr></tbody></table></div>
    <div class="admin-dialog-actions"><button class="admin-btn secondary" data-dialog-cancel>关闭</button>${successButton}</div>
  `);
  $('[data-dialog-cancel]').addEventListener('click', closeDialog);
  if ($('[data-mark-common]')) {
    $('[data-mark-common]').addEventListener('click', () => {
      const previousScore = row.score;
      row.resetFrom = previousScore;
      row.resetTime = '2026-11-17 11:26';
      row.resetOperator = 'Cora';
      if (previousScore < 100) row.breakdown.push(['验证成功', '更新常用IP及有效设备号', `+${100 - previousScore}`, '100']);
      row.score = 100;
      row.action = '正常放行';
      row.status = '正常';
      row.reason = '验证成功，常用环境已更新';
      row.time = row.resetTime;
      row.operator = 'Cora';
      closeDialog(); renderPending();
    });
  }
}

function openManualVerifyDialog(memberId) {
  const row = pendingRows.find(item => item.memberId === memberId);
  openDialog('手动验证', `
    <div class="admin-form">
      <label>会员ID</label><input value="${row.memberId}" disabled>
      <label>会员账号</label><input value="${row.user}" disabled>
      <label>验证要求</label><select id="manualVerifyStatus"><option ${row.status === '一步验证' ? 'selected' : ''}>一步验证</option><option ${row.status === '两步验证' ? 'selected' : ''}>两步验证</option></select>
      <label>备注</label><textarea id="manualVerifyNote" placeholder="请输入手动验证原因">${row.note || ''}</textarea>
    </div>
    <div class="admin-dialog-actions"><button class="admin-btn secondary" data-dialog-cancel>取消</button><button class="admin-btn" data-save-manual>确认</button></div>
  `);
  $('[data-dialog-cancel]').addEventListener('click', closeDialog);
  $('[data-save-manual]').addEventListener('click', () => {
    row.status = $('#manualVerifyStatus').value;
    row.score = row.status === '一步验证' ? 55 : 35;
    row.action = row.status === '一步验证' ? '单项验证' : '双项验证';
    row.source = '手动添加';
    row.note = $('#manualVerifyNote').value.trim() || '后台手动发起验证';
    row.operator = 'Cora';
    row.time = '2026-11-17 11:28';
    row.reason = `后台手动发起${row.status}`;
    row.breakdown = [['手动验证', `后台指定${row.status}`, '—', row.score]];
    closeDialog(); renderPending();
  });
}

function openNoteDialog(memberId) {
  const row = pendingRows.find(item => item.memberId === memberId);
  openDialog('修改备注', `<div class="admin-form"><label>会员ID／账号</label><input value="${row.memberId}／${row.user}" disabled><label>备注</label><textarea id="noteValue">${row.note || ''}</textarea></div><div class="admin-dialog-actions"><button class="admin-btn secondary" data-dialog-cancel>取消</button><button class="admin-btn" data-save-note>保存</button></div>`);
  $('[data-dialog-cancel]').addEventListener('click', closeDialog);
  $('[data-save-note]').addEventListener('click', () => { row.note = $('#noteValue').value.trim(); row.operator = 'Cora'; row.time = '2026-11-17 11:30'; closeDialog(); renderPending(); });
}

$$('.view-tab').forEach(tab => tab.addEventListener('click', () => {
  $$('.view-tab').forEach(item => item.classList.toggle('active', item === tab));
  $$('.view').forEach(view => view.classList.remove('active'));
  $(`#${tab.dataset.view}View`).classList.add('active');
}));

if ($('#scenarioButtons')) $('#scenarioButtons').addEventListener('click', event => {
  const button = event.target.closest('button[data-score]');
  if (!button) return;
  $$('#scenarioButtons button').forEach(item => item.classList.toggle('active', item === button));
  state.score = Number(button.dataset.score);
  updateScoreUI();
  resetFront();
});

$$('[data-method-toggle]').forEach(toggle => toggle.addEventListener('change', () => { state.available[toggle.dataset.methodToggle] = toggle.checked; }));
if ($('#loginBtn')) $('#loginBtn').addEventListener('click', startLoginFlow);
if ($('#loginCloseBtn')) $('#loginCloseBtn').addEventListener('click', () => {
  showHome();
  setFrontState('已关闭登录弹框', '当前显示首页背景');
});
if ($('#modalMask')) $('#modalMask').addEventListener('click', event => {
  if (event.target === $('#modalMask') && $('#modalMask').dataset.maskClose === 'true') {
    closeSecurityModal();
    showHome();
  }
});
if ($('#password')) $('#password').addEventListener('keydown', event => { if (event.key === 'Enter') startLoginFlow(); });

if ($('#ruleSearchBtn')) $('#ruleSearchBtn').addEventListener('click', () => renderRules($('#ruleCategoryFilter').value));
if ($('#ruleResetBtn')) $('#ruleResetBtn').addEventListener('click', () => { $('#ruleCategoryFilter').value = 'all'; renderRules(); });
if ($('#addRuleBtn')) $('#addRuleBtn').addEventListener('click', () => openRuleDialog());
if ($('#editBandsBtn')) $('#editBandsBtn').addEventListener('click', openBandsDialog);
if ($('#addPendingBtn')) $('#addPendingBtn').addEventListener('click', openAddPendingDialog);
if ($('#pendingSearchBtn')) $('#pendingSearchBtn').addEventListener('click', () => {
  const user = $('#pendingUserFilter').value.trim().toLowerCase();
  const status = $('#pendingStatusFilter').value;
  const source = $('#pendingSourceFilter').value;
  const operator = $('#pendingOperatorFilter').value.trim().toLowerCase();
  renderPending(pendingRows.filter(row =>
    (!user || row.user.toLowerCase().includes(user) || row.memberId.includes(user)) &&
    (status === 'all' || row.status === status) &&
    (source === 'all' || row.source === source) &&
    (!operator || row.operator.toLowerCase().includes(operator))
  ));
});
if ($('#pendingResetBtn')) $('#pendingResetBtn').addEventListener('click', () => {
  $('#pendingUserFilter').value = '';
  $('#pendingStatusFilter').value = 'all';
  $('#pendingSourceFilter').value = 'all';
  $('#pendingOperatorFilter').value = '';
  renderPending();
});
if ($('#dialogMask')) $('#dialogMask').addEventListener('click', event => { if (event.target === $('#dialogMask')) closeDialog(); });

if ($('#ruleTableBody')) renderRules();
if ($('#bandGrid')) renderBands();
if ($('#pendingTableBody')) renderPending();
if ($('#scoreOrb')) updateScoreUI();
