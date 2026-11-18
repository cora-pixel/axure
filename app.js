const rules = [
  { id: 'R01', category: '环境变化', condition: 'IP不在常用IP中', score: '-10', mode: '单项扣分', desc: '常用设备命中时仍可保持高分', enabled: true },
  { id: 'R02', category: '环境变化', condition: '有效设备号不在常用设备中', score: '-15', mode: '单项扣分', desc: '设备变化权重大于单纯IP变化', enabled: true },
  { id: 'R03', category: '环境变化', condition: 'IP不在常用IP，且设备无法证明为常用', score: '-45', mode: '覆盖R01/R02', desc: '包含有效陌生设备及非有效设备号，不重复扣分', enabled: true },
  { id: 'R04', category: '环境变化', condition: '本次未获取到有效设备号', score: '-5', mode: '单项扣分', desc: '单独不验证，与陌生IP组合时使用R03', enabled: true },
  { id: 'R05', category: '风险关联', condition: '长期风险IP关联9-20／21-50／51-100／101人以上', score: '-30／-45／-65／-85', mode: '分档取值', desc: '滚动48小时按不同有效用户数统计；与短时同IP多账号只取较高扣分', enabled: true },
  { id: 'R06', category: '风险关联', condition: '长期风险设备关联9-20／21-50／51-100／101人以上', score: '-30／-45／-65／-85', mode: '分档取值', desc: '仅统计device_valid=1的有效设备；与短时同设备多账号只取较高扣分', enabled: true },
  { id: 'R07', category: '行为风险', condition: '24小时内切换3-4个陌生IP或有效设备号／5个及以上', score: '-15／-30', mode: '按最高档扣分', desc: 'IP与设备分别去重，本项只取较高扣分', enabled: true },
  { id: 'R08', category: '高危行为', condition: '2小时内同一有效IP登录3-5／6-8／9个以上不同有效账号', score: '-45／-65／-85', mode: '按最高档扣分', desc: '账号去重；设备号是否有效不影响判断；排除登录IP等于注册IP', enabled: true },
  { id: 'R09', category: '高危行为', condition: '2小时内同一有效设备登录3-5／6-8／9个以上不同有效账号', score: '-45／-65／-85', mode: '按最高档扣分', desc: '最低档单独命中即低于60分；仅统计有效设备', enabled: true },
  { id: 'R10', category: '高危行为', condition: '10分钟内同一账号调用登录认证或密码错误5-9／10-19／20次以上', score: '-45／-65／-85', mode: '按最高档扣分', desc: '页面刷新及Token续期不计；成功与失败合计后只命中一个档位', enabled: true },
  { id: 'R11', category: '行为风险', condition: '沉睡超过90天且IP、设备均变化', score: '-10', mode: '条件扣分', desc: '三个条件必须同时成立，与双陌生环境分别扣分', enabled: true },
  { id: 'R12', category: '行为风险', condition: '新环境登录后立即进行敏感操作', score: '-15', mode: '条件扣分', desc: '登录与敏感操作使用同一本次分数', enabled: true },
  { id: 'R13', category: '高危行为', condition: '10分钟内同一IP调用登录接口60-119／120-239／240次以上', score: '-45／-65／-85', mode: '按最高档扣分', desc: '最低档单独命中即低于60分；只统计登录接口', enabled: true },
];

const scoringConfig = {
  r01Score: 10, r02Score: 15, r03Score: 45, r04Score: 5,
  r05T1: 9, r05T2: 21, r05T3: 51, r05T4: 101,
  r05S1: 30, r05S2: 45, r05S3: 65, r05S4: 85,
  r06T1: 9, r06T2: 21, r06T3: 51, r06T4: 101,
  r06S1: 30, r06S2: 45, r06S3: 65, r06S4: 85,
  r07Hours: 24, r07T1: 3, r07T2: 5, r07S1: 15, r07S2: 30,
  r08Hours: 2, r08T1: 3, r08T2: 6, r08T3: 9, r08S1: 45, r08S2: 65, r08S3: 85,
  r09Hours: 2, r09T1: 3, r09T2: 6, r09T3: 9, r09S1: 45, r09S2: 65, r09S3: 85,
  r10Minutes: 10, r10T1: 5, r10T2: 10, r10T3: 20, r10S1: 45, r10S2: 65, r10S3: 85,
  r11Days: 90, r11Score: 10, r12Score: 15,
  r13Minutes: 10, r13T1: 60, r13T2: 120, r13T3: 240, r13S1: 45, r13S2: 65, r13S3: 85,
};

const riskTgidConfig = {
  baseValue: '',
  defaultValue: '',
  disabled: false,
  siteValues: { h3: '', asia: '', qh: '' },
  inherited: { h3: true, asia: true, qh: true },
};

const commonEnvironmentConfig = {
  ip: { days: 30, count: 5, disabled: false },
  device: { days: 30, count: 5, disabled: false },
};

const bands = [
  { range: '80至100', action: '正常放行', className: 'healthy', detail: '正常登录，不弹出验证；后台记录环境与分数。' },
  { range: '60至79', action: '预警观察', className: 'watch', detail: '不打扰用户；后台保留该次登录评分并继续观察后续登录。' },
  { range: '40至59', action: '单项验证', className: 'single', detail: '从可用方式中任选1项；成功后更新常用环境并恢复100分。' },
  { range: '20至39', action: '双项验证', className: 'double', detail: '完成2种不同验证；可用方式不足2项时转人工。' },
  { range: '0至19', action: '阻断或人工', className: 'block', detail: '停止后续操作；进入待验证名单并引导联系客服。' },
];

const pendingRows = [
  {
    memberId: '2795074', user: 'hxm001@as', score: 0, action: '阻断人工', scoreCondition: 'IP不在常用IP中；设备无法证明为常用；长期风险设备关联51-100人（设备号：Win10-Chrome-RISK51Hxm8K2p）', reason: '陌生IP＋有效陌生设备；命中长期风险设备51至100人', ip: '103.88.14.26', currentDeviceId: 'Win10-Chrome-RISK51Hxm8K2p', device: '有效陌生设备', status: '验证失败', freezeStatus: '冻结', source: '系统评分', time: '2026-11-17 09:46', note: '高风险设备关联，已引导联系客服', operator: '系统', riskIps: [{ value: '45.76.188.92', accounts: 9 }], riskDevices: [{ value: 'Win10-Chrome-RISK51Hxm8K2p', accounts: 68 }],
    breakdown: [['评分基准', '本次登录从100分开始评分', '100', '100'], ['R03 组合规则', '陌生IP：103.88.14.26；有效陌生设备：Win10-Chrome-RISK51Hxm8K2p', '-45', '55'], ['R06 长期风险设备', '设备号Win10-Chrome-RISK51Hxm8K2p在48小时关联68个有效用户', '-65', '0']],
  },
  {
    memberId: '2826222', user: 'yongson005', score: 25, action: '双项验证', scoreCondition: 'IP不在常用IP中；有效设备号不在常用设备中；24小时内切换5个以上陌生环境', reason: '陌生IP＋有效陌生设备；短时间频繁切换登录环境', ip: '202.55.225.254', currentDeviceId: 'Android-Chrome-R8tLp7Qm2Xc9', device: '有效陌生设备', status: '验证失败', freezeStatus: '正常', source: '系统评分', time: '2026-11-17 09:18', note: '用户反馈更换手机', operator: '系统', riskIps: [], riskDevices: [{ value: 'Win10-Chrome-RISK51Hxm8K2p', accounts: 68 }],
    breakdown: [['评分基准', '本次登录从100分开始评分', '100', '100'], ['R03 组合规则', '陌生IP：202.55.225.254；有效陌生设备：Android-Chrome-R8tLp7Qm2Xc9', '-45', '55'], ['R07 频繁更换环境', '24小时切换5个以上陌生环境', '-30', '25']],
  },
  {
    memberId: '2826202', user: 'cora888@as', score: 55, action: '单项验证', scoreCondition: 'IP不在常用IP中；本次未获取到有效设备号', reason: '陌生IP＋设备无法证明可信；组合规则扣45分', ip: '47.76.91.34', currentDeviceId: '', device: '未获取有效设备号', status: '验证失败', freezeStatus: '正常', source: '系统评分', time: '2026-11-17 08:52', note: '风险评分预警', operator: '系统', riskIps: [{ value: '139.162.60.207', accounts: 27 }], riskDevices: [{ value: 'Android-Chrome-RISK21Demo7', accounts: 22 }],
    breakdown: [['评分基准', '本次登录从100分开始评分', '100', '100'], ['R03 组合规则', '陌生IP：47.76.91.34；未获取有效设备号', '-45', '55']],
  },
  {
    memberId: '2827144', user: 'evan001@h8', score: 100, action: '正常放行', scoreCondition: '无扣分条件', reason: '已完成验证并更新常用环境', ip: '139.162.60.207', currentDeviceId: 'Win10-Chrome-95T0XYr9BIOdkdF4a29J', device: '有效常用设备', status: '验证通过', freezeStatus: '正常', source: '系统评分', time: '2026-11-17 10:26', note: '用户验证通过', operator: '系统', resetFrom: 10, resetTime: '2026-11-17 10:26', resetOperator: 'cora', riskIps: [{ value: '139.162.60.207', accounts: 27 }], riskDevices: [],
    breakdown: [['评分基准', '本次登录从100分开始评分', '100', '100'], ['R03 组合规则', '陌生IP：139.162.60.207；有效陌生设备：Win10-Chrome-95T0XYr9BIOdkdF4a29J', '-45', '55'], ['R05 长期风险IP', 'IP 139.162.60.207在48小时关联27个有效用户', '-45', '10'], ['验证成功', '该次有效分数更新为100', '更新', '100']],
  },
  {
    memberId: '2827301', user: 'mika007@as', score: 70, action: '预警观察', scoreCondition: '长期风险IP关联9-20人（IP：45.76.188.92）', reason: '长期风险IP在48小时内关联9个有效用户', ip: '45.76.188.92', currentDeviceId: 'Android-Chrome-L2mQ8vP7sN4', device: '有效陌生设备', status: '验证失败', freezeStatus: '正常', source: '系统评分', time: '2026-11-17 10:05', note: '进入评分预警观察', operator: '系统', riskIps: [{ value: '45.76.188.92', accounts: 9 }], riskDevices: [{ value: 'Android-Chrome-RISK21Demo7', accounts: 22 }],
    breakdown: [['评分基准', '本次登录从100分开始评分', '100', '100'], ['R05 长期风险IP', 'IP 45.76.188.92在48小时关联9个有效用户', '-30', '70']],
  },
];

const alertStateByMember = {
  '2795074': {
    latestLoginScore: 88,
    latestLoginTime: '2026-11-17 10:32',
    alertStatus: '待处理',
    alertOpenedAt: '2026-11-17 08:20',
    riskEvents: [
      { time: '2026-11-17 09:46', type: '低分告警更新', ip: '103.88.14.26', device: 'Win10-Chrome-RISK51Hxm8K2p', rule: 'R03 -45；R06 -65', loginScore: 0, alertScore: 0, result: '阻断并冻结' },
      { time: '2026-11-17 08:20', type: '低分告警生成', ip: '103.88.14.26', device: 'Win10-Chrome-RISK51Hxm8K2p', rule: 'R03 -45', loginScore: 55, alertScore: 55, result: '单项验证' },
    ],
  },
  '2826222': {
    latestLoginScore: 86,
    latestLoginTime: '2026-11-17 10:18',
    alertStatus: '待处理',
    alertOpenedAt: '2026-11-17 09:18',
    riskEvents: [
      { time: '2026-11-17 09:18', type: '低分告警生成', ip: '202.55.225.254', device: 'Android-Chrome-R8tLp7Qm2Xc9', rule: 'R03 -45；R07 -30', loginScore: 25, alertScore: 25, result: '双项验证' },
    ],
  },
  '2826202': {
    latestLoginScore: 55,
    latestLoginTime: '2026-11-17 08:52',
    alertStatus: '待处理',
    alertOpenedAt: '2026-11-17 08:52',
    riskEvents: [
      { time: '2026-11-17 08:52', type: '低分告警生成', ip: '47.76.91.34', device: '未获取', rule: 'R03 -45', loginScore: 55, alertScore: 55, result: '单项验证' },
    ],
  },
  '2827144': {
    latestLoginScore: 100,
    latestLoginTime: '2026-11-17 10:26',
    alertStatus: '已关闭',
    alertOpenedAt: '2026-11-17 08:20',
    riskEvents: [
      { time: '2026-11-17 10:26', type: '告警关闭', ip: '139.162.60.207', device: 'Win10-Chrome-95T0XYr9BIOdkdF4a29J', rule: '验证通过，更新常用环境', loginScore: 10, alertScore: 100, result: '恢复正常' },
      { time: '2026-11-17 08:20', type: '低分告警生成', ip: '139.162.60.207', device: 'Win10-Chrome-95T0XYr9BIOdkdF4a29J', rule: 'R03 -45；R05 -45', loginScore: 10, alertScore: 10, result: '阻断人工' },
    ],
  },
  '2827301': {
    latestLoginScore: 70,
    latestLoginTime: '2026-11-17 10:05',
    alertStatus: '观察中',
    alertOpenedAt: '—',
    riskEvents: [
      { time: '2026-11-17 10:05', type: '风险事件', ip: '45.76.188.92', device: 'Android-Chrome-L2mQ8vP7sN4', rule: 'R05 -30', loginScore: 70, alertScore: 70, result: '预警观察' },
    ],
  },
};

pendingRows.forEach(row => Object.assign(row, alertStateByMember[row.memberId] || {
  latestLoginScore: row.score,
  latestLoginTime: row.time,
  alertStatus: row.score < 60 ? '待处理' : '观察中',
  alertOpenedAt: row.score < 60 ? row.time : '—',
  riskEvents: [],
}));

const loginAlertRows = [
  { id: 'LA202611170005', memberId: '2795074', user: 'hxm001@as', time: '2026-11-17 09:46', ip: '103.88.14.26', device: 'Win10-Chrome-RISK51Hxm8K2p', score: 0, condition: 'IP不在常用IP中；设备无法证明为常用；长期风险IP关联21-50人；长期风险设备关联51-100人', control: '阻断并冻结', status: '待处理', breakdown: [['R03 组合规则', '陌生IP＋有效陌生设备', '-45'], ['R05 长期风险IP', '48小时关联27个有效用户', '-45'], ['R06 长期风险设备', '48小时关联68个有效用户', '-65']] },
  { id: 'LA202611170004', memberId: '2826222', user: 'yongson005', time: '2026-11-17 09:18', ip: '202.55.225.254', device: 'Android-Chrome-R8tLp7Qm2Xc9', score: 25, condition: 'IP不在常用IP中；有效设备号不在常用设备中；24小时切换5个以上陌生环境', control: '双项验证', status: '验证失败', note: '运营核实为异常登录，未更新常用环境', breakdown: [['R03 组合规则', '陌生IP＋有效陌生设备', '-45'], ['R07 频繁更换环境', '24小时切换5个以上陌生环境', '-30']] },
  { id: 'LA202611170003', memberId: '2826202', user: 'cora888@as', time: '2026-11-17 08:52', ip: '47.76.91.34', device: '未获取', score: 55, condition: 'IP不在常用IP中；本次未获取到有效设备号', control: '单项验证', status: '待处理', breakdown: [['R03 组合规则', '陌生IP＋无有效设备号', '-45']] },
  { id: 'LA202611170002', memberId: '2795074', user: 'hxm001@as', time: '2026-11-17 08:20', ip: '103.88.14.26', device: 'Win10-Chrome-RISK51Hxm8K2p', score: 55, condition: 'IP不在常用IP中；设备无法证明为常用', control: '单项验证', status: '待处理', breakdown: [['R03 组合规则', '陌生IP＋有效陌生设备', '-45']] },
];

const loginRiskMarkers = {
  LA202611170005: { riskIp: true, riskDevice: true },
  LA202611170004: { riskIp: false, riskDevice: false },
  LA202611170003: { riskIp: false, riskDevice: false },
  LA202611170002: { riskIp: false, riskDevice: true },
};
loginAlertRows.forEach(row => Object.assign(row, loginRiskMarkers[row.id]));

const loginScoreRows = [
  { id: 'SR202611170020', memberId: '2861020', user: 'normal020@h8', time: '2026-11-17 14:20', ip: '118.31.22.20', device: 'iOS-Safari-NORMAL20', riskIp: false, riskDevice: false, score: 100, condition: '无扣分条件', control: '正常记录', disposition: '无需处置', note: '--', alerted: false, breakdown: [] },
  { id: 'SR202611170019', memberId: '2861019', user: 'nodevice019@h8', time: '2026-11-17 14:05', ip: '118.31.22.19', device: '未获取', riskIp: false, riskDevice: false, score: 95, condition: '本次未获取到有效设备号；IP命中常用IP', control: '正常记录', disposition: '无需处置', note: '--', alerted: false, breakdown: [['R04 设备号缺失', '本次未获取到有效设备号', '-5']] },
  { id: 'SR202611170018', memberId: '2861018', user: 'ipchange018@h8', time: '2026-11-17 13:50', ip: '47.91.18.18', device: 'Win10-Chrome-NORMAL18', riskIp: false, riskDevice: false, score: 90, condition: 'IP不在常用IP中', control: '正常记录', disposition: '无需处置', note: '--', alerted: false, breakdown: [['R01 IP变化', '当前IP不在常用IP中', '-10']] },
  { id: 'SR202611170017', memberId: '2861017', user: 'device017@h8', time: '2026-11-17 13:35', ip: '139.162.17.17', device: 'Android-Chrome-NEW17', riskIp: false, riskDevice: false, score: 85, condition: '有效设备号不在常用设备中', control: '正常记录', disposition: '无需处置', note: '--', alerted: false, breakdown: [['R02 设备变化', '有效设备号不在常用设备中', '-15']] },
  { id: 'SR202611170016', memberId: '2827301', user: 'mika007@as', time: '2026-11-17 13:20', ip: '45.76.188.92', device: 'Android-Chrome-L2mQ8vP7sN4', riskIp: true, riskDevice: false, score: 70, condition: '长期风险IP关联9-20人', control: '预警观察', disposition: '无需处置', note: '--', alerted: false, breakdown: [['R05 长期风险IP', '48小时关联9个有效用户', '-30']] },
  { id: 'SR202611170015', memberId: '2861015', user: 'riskdev015@h8', time: '2026-11-17 13:05', ip: '103.27.15.15', device: 'Android-Chrome-RISK15', riskIp: false, riskDevice: true, score: 70, condition: '长期风险设备关联9-20人', control: '预警观察', disposition: '无需处置', note: '--', alerted: false, breakdown: [['R06 长期风险设备', '48小时关联12个有效用户', '-30']] },
  { id: 'SR202611170014', memberId: '2861014', user: 'sameip014@h8', time: '2026-11-17 12:50', ip: '203.0.113.14', device: 'Win10-Chrome-SAMEIP14', riskIp: true, riskDevice: false, score: 55, condition: '2小时内同一IP登录3-5个不同有效账号', control: '单项验证', disposition: '验证通过', note: '身份核验通过，告警已关闭', alerted: true, breakdown: [['R08 同IP多账号', '2小时内同一IP登录4个有效账号', '-45']] },
  { id: 'SR202611170013', memberId: '2861013', user: 'sameip013@h8', time: '2026-11-17 12:35', ip: '203.0.113.13', device: 'Win10-Chrome-SAMEIP13', riskIp: true, riskDevice: false, score: 35, condition: '2小时内同一IP登录6-8个不同有效账号', control: '双项验证', disposition: '验证通过', note: '身份核验通过，告警已关闭', alerted: true, breakdown: [['R08 同IP多账号', '2小时内同一IP登录7个有效账号', '-65']] },
  { id: 'SR202611170012', memberId: '2861012', user: 'sameip012@h8', time: '2026-11-17 12:20', ip: '203.0.113.12', device: 'Win10-Chrome-SAMEIP12', riskIp: true, riskDevice: false, score: 15, condition: '2小时内同一IP登录9个以上不同有效账号', control: '阻断人工', disposition: '验证通过', note: '人工核验为本人登录，告警已关闭', alerted: true, breakdown: [['R08 同IP多账号', '2小时内同一IP登录11个有效账号', '-85']] },
  { id: 'SR202611170011', memberId: '2861011', user: 'samedev011@h8', time: '2026-11-17 12:05', ip: '103.27.11.11', device: 'Win10-Chrome-SAMEDEVICE11', riskIp: false, riskDevice: true, score: 55, condition: '2小时内同一设备登录3-5个不同有效账号', control: '单项验证', disposition: '验证通过', note: '身份核验通过，告警已关闭', alerted: true, breakdown: [['R09 同设备多账号', '2小时内同一设备登录5个有效账号', '-45']] },
  { id: 'SR202611170010', memberId: '2861010', user: 'samedev010@h8', time: '2026-11-17 11:50', ip: '103.27.10.10', device: 'Win10-Chrome-SAMEDEVICE10', riskIp: false, riskDevice: true, score: 35, condition: '2小时内同一设备登录6-8个不同有效账号', control: '双项验证', disposition: '验证通过', note: '身份核验通过，告警已关闭', alerted: true, breakdown: [['R09 同设备多账号', '2小时内同一设备登录8个有效账号', '-65']] },
  { id: 'SR202611170009', memberId: '2861009', user: 'samedev009@h8', time: '2026-11-17 11:35', ip: '103.27.9.9', device: 'Win10-Chrome-SAMEDEVICE09', riskIp: false, riskDevice: true, score: 15, condition: '2小时内同一设备登录9个以上不同有效账号', control: '阻断人工', disposition: '验证通过', note: '人工核验通过，告警已关闭', alerted: true, breakdown: [['R09 同设备多账号', '2小时内同一设备登录12个有效账号', '-85']] },
  { id: 'SR202611170008', memberId: '2861008', user: 'highfreq008@h8', time: '2026-11-17 11:20', ip: '198.51.100.8', device: 'Android-Chrome-HIGHFREQ08', riskIp: false, riskDevice: false, score: 55, condition: '10分钟内同一账号登录认证或密码错误5-9次', control: '单项验证', disposition: '验证通过', note: '身份核验通过，告警已关闭', alerted: true, breakdown: [['R10 账号高频登录', '10分钟内登录认证或密码错误8次', '-45']] },
  { id: 'SR202611170007', memberId: '2861007', user: 'highfreq007@h8', time: '2026-11-17 11:05', ip: '198.51.100.7', device: 'Android-Chrome-HIGHFREQ07', riskIp: false, riskDevice: false, score: 35, condition: '10分钟内同一账号登录认证或密码错误10-19次', control: '双项验证', disposition: '验证通过', note: '身份核验通过，告警已关闭', alerted: true, breakdown: [['R10 账号高频登录', '10分钟内登录认证或密码错误16次', '-65']] },
  { id: 'SR202611170006', memberId: '2861006', user: 'apiattack006@h8', time: '2026-11-17 10:50', ip: '198.51.100.6', device: '未获取', riskIp: true, riskDevice: false, score: 15, condition: '10分钟内同一IP调用登录接口240次以上', control: '阻断人工', disposition: '验证通过', note: '人工核验通过，来源IP已纳入风险观察', alerted: true, breakdown: [['R13 登录接口高频', '10分钟内同一IP调用登录接口286次', '-85']] },
  { id: 'SR202611170005', memberId: '2795074', user: 'hxm001@as', time: '2026-11-17 09:46', ip: '103.88.14.26', device: 'Win10-Chrome-RISK51Hxm8K2p', riskIp: true, riskDevice: true, score: 0, condition: 'IP不在常用IP中；设备无法证明为常用；长期风险IP关联21-50人；长期风险设备关联51-100人', control: '阻断并冻结', disposition: '待验证', note: '--', alerted: true, breakdown: [['R03 组合规则', '陌生IP＋有效陌生设备', '-45'], ['R05 长期风险IP', '48小时关联27个有效用户', '-45'], ['R06 长期风险设备', '48小时关联68个有效用户', '-65']] },
  { id: 'SR202611170004', memberId: '2826222', user: 'yongson005', time: '2026-11-17 09:18', ip: '202.55.225.254', device: 'Android-Chrome-R8tLp7Qm2Xc9', riskIp: false, riskDevice: false, score: 25, condition: 'IP不在常用IP中；有效设备号不在常用设备中；24小时切换5个以上陌生环境', control: '双项验证', disposition: '验证失败', note: '运营核实为异常登录，未更新常用环境', alerted: true, breakdown: [['R03 组合规则', '陌生IP＋有效陌生设备', '-45'], ['R07 频繁更换环境', '24小时切换5个以上陌生环境', '-30']] },
  { id: 'SR202611170003', memberId: '2826202', user: 'cora888@as', time: '2026-11-17 08:52', ip: '47.76.91.34', device: '未获取', riskIp: false, riskDevice: false, score: 55, condition: 'IP不在常用IP中；本次未获取到有效设备号', control: '单项验证', disposition: '待验证', note: '--', alerted: true, breakdown: [['R03 组合规则', '陌生IP＋无有效设备号', '-45']] },
  { id: 'SR202611170002', memberId: '2795074', user: 'hxm001@as', time: '2026-11-17 08:20', ip: '103.88.14.26', device: 'Win10-Chrome-RISK51Hxm8K2p', riskIp: false, riskDevice: true, score: 55, condition: 'IP不在常用IP中；设备无法证明为常用', control: '单项验证', disposition: '待验证', note: '--', alerted: true, breakdown: [['R03 组合规则', '陌生IP＋有效陌生设备', '-45']] },
  { id: 'SR202611170001', memberId: '2827144', user: 'evan001@h8', time: '2026-11-17 08:05', ip: '139.162.60.207', device: 'Win10-Chrome-95T0XYr9BIOdkdF4a29J', riskIp: true, riskDevice: false, score: 10, condition: 'IP与设备均不在常用环境；长期风险IP关联21-50人', control: '阻断人工', disposition: '验证通过', note: '用户验证通过，已更新本次IP和设备为常用环境', alerted: true, breakdown: [['R03 组合规则', '陌生IP＋有效陌生设备', '-45'], ['R05 长期风险IP', '48小时关联27个有效用户', '-45']] },
];

const riskIpRows = [
  { value: '139.162.60.207', accounts: 27, healthy: 25, alerts: 2, logins: 186, tier: '21-50', first: '2026-11-15 08:12', last: '2026-11-17 10:26', members: [['2827144', 'evan001@h8', 10, '告警'], ['2862301', 'healthy301@h8', 100, '健康'], ['2862302', 'healthy302@h8', 90, '健康']] },
  { value: '45.76.188.92', accounts: 9, healthy: 7, alerts: 2, logins: 74, tier: '9-20', first: '2026-11-16 03:40', last: '2026-11-17 10:05', members: [['2827301', 'mika007@as', 70, '健康'], ['2795074', 'hxm001@as', 0, '告警'], ['2862401', 'healthy401@as', 100, '健康']] },
];

const riskDeviceRows = [
  { value: 'Win10-Chrome-RISK51Hxm8K2p', accounts: 68, healthy: 66, alerts: 2, logins: 312, tier: '51-100', first: '2026-11-14 22:18', last: '2026-11-17 09:46', members: [['2795074', 'hxm001@as', 0, '告警'], ['2826222', 'yongson005', 25, '告警'], ['2862501', 'healthy501@as', 100, '健康']] },
  { value: 'Android-Chrome-RISK21Demo7', accounts: 22, healthy: 20, alerts: 2, logins: 115, tier: '21-50', first: '2026-11-15 14:20', last: '2026-11-17 08:52', members: [['2826202', 'cora888@as', 55, '告警'], ['2862601', 'healthy601@as', 90, '健康'], ['2862602', 'healthy602@as', 100, '健康']] },
];

const commonEnvironmentByMember = {
  '2795074': {
    ips: [['139.162.87.78', '72', '2026-11-15 20:18', '阈值命中'], ['47.76.91.34', '53', '2026-11-12 09:42', '阈值命中']],
    devices: [['Win10-Chrome-xpMhmJ2mV5SVx2NRNZUW', '32', '2026-11-15 20:18', '阈值命中'], ['iOS-Safari-JRPu3of08JTLzcQXOVB8', '9', '2026-11-08 18:06', '验证通过']],
  },
  '2826222': {
    ips: [['202.55.225.254', '26', '2026-11-16 22:10', '阈值命中']],
    devices: [['Android-Chrome-VKgIPg9S6c8pXd8C0fB6', '18', '2026-11-16 22:10', '阈值命中']],
  },
  '2827301': {
    ips: [['103.27.186.14', '18', '2026-11-16 16:40', '阈值命中'], ['45.76.188.92', '4', '2026-11-17 10:05', '观察中']],
    devices: [['Android-Chrome-P8vK3sM2qL9', '11', '2026-11-16 16:40', '阈值命中']],
  },
  '2826202': {
    ips: [['47.76.91.34', '18', '2026-11-14 16:35', '验证通过']],
    devices: [['Win10-Edge-eDC760OPpeNearzyKXK', '12', '2026-11-14 16:35', '验证通过']],
  },
  '2827144': {
    ips: [['139.162.60.207', '42', '2026-11-17 10:26', '验证通过']],
    devices: [['Win10-Chrome-95T0XYr9BIOdkdF4a29J', '23', '2026-11-17 10:26', '验证通过']],
  },
};

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

function formatLoginTime(value) {
  return value && value.length === 16 ? `${value}:00` : value;
}

function getScoreVerificationRecords(row) {
  if (row.verificationHistory?.length) return row.verificationHistory;
  const result = row.disposition || row.status;
  if (!['验证通过', '验证失败'].includes(result)) return [];
  return [{ time: formatLoginTime(row.time), result, note: row.note || '--', operator: 'Cora' }];
}

function appendScoreVerificationRecord(row, result, note) {
  row.verificationHistory = [...getScoreVerificationRecords(row), {
    time: `${formatAdminTime()}:00`, result, note, operator: 'Cora',
  }];
}

function renderScoreVerificationSection(row) {
  const records = getScoreVerificationRecords(row);
  const rows = records.length
    ? records.map(item => `<tr><td>${item.time}</td><td><span class="alert-record-status ${item.result === '验证失败' ? 'failed' : 'closed'}">${item.result}</span></td><td>${item.note || '--'}</td><td>${item.operator}</td></tr>`).join('')
    : '<tr><td colspan="4">暂无验证记录</td></tr>';
  return `<div class="detail-section"><h3>本次评分验证记录</h3><table class="mini-table"><thead><tr><th>验证时间</th><th>验证结果</th><th>备注</th><th>操作人</th></tr></thead><tbody>${rows}</tbody></table></div>`;
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
  const isAuthenticated = screen === 'authenticated';
  background.src = isLogin
    ? 'assets/cora001-login.png'
    : isAuthenticated
      ? 'assets/cora001-home-authenticated.png?v=20261117-9'
      : 'assets/cora001-home.png';
  background.alt = isLogin ? '杏彩体育登录页面' : isAuthenticated ? '杏彩体育已登录首页' : '杏彩体育首页';
  background.closest('.prototype-stage').classList.toggle('authenticated-stage', isAuthenticated);
  if ($('#loginBtn')) $('#loginBtn').classList.toggle('hidden', !isLogin);
  if ($('#loginCloseBtn')) $('#loginCloseBtn').classList.toggle('hidden', !isLogin);
}

function showHome() {
  setPrototypeScreen('home');
}

function showAuthenticatedHome() {
  setPrototypeScreen('authenticated');
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
  $('#modalMask').dataset.closeScreen = options.closeScreen || '';
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
  showAuthenticatedHome();
  closeSecurityModal();
  window.setTimeout(() => {
    openSecurityModal(modalFrame('恭喜您，通过安全验证。', `
      <div class="status-icon success">✓</div>
      <div class="modal-copy success-fund-copy"><span>检测到您未设置资金密码请立即设定。</span></div>
      <div class="modal-actions"><button class="primary wide" data-set-fund disabled>立即设定</button></div>
    `), { maskClose: false, closeScreen: 'authenticated' });
    const setFundButton = $('[data-set-fund]');
    window.clearTimeout(renderVerificationSuccess.readyTimer);
    renderVerificationSuccess.readyTimer = window.setTimeout(() => {
      setFundButton.disabled = false;
      $('#modalMask').dataset.maskClose = 'true';
    }, 800);
    setFundButton.addEventListener('click', () => {
      closeSecurityModal();
      showAuthenticatedHome();
      setFrontState('验证成功', '等待设置资金密码');
    });
  }, 160);
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
  $('#scoreOrb').style.background = state.score >= 80 ? '#3e8e68' : state.score >= 60 ? '#315f9c' : state.score >= 40 ? '#7656a8' : state.score >= 20 ? '#d88618' : '#d9534f';
  $('#controlAction').textContent = actionForScore(state.score);
}

function renderRules(filter = 'all') {
  const body = $('#ruleTableBody');
  body.innerHTML = rules.filter(rule => filter === 'all' || rule.category === filter).map(rule => `
    <tr>
      <td>${rule.id}</td><td>${rule.category}</td><td>${rule.condition}</td>
      <td class="score-text score-block">${rule.score}</td><td>${rule.mode}</td><td>${rule.desc}</td>
    </tr>`).join('');
}

function renderBands() {
  $('#bandGrid').innerHTML = bands.map(band => `<article class="band-card ${band.className}"><strong>${band.range}分</strong><h3>${band.action}</h3><p>${band.detail}</p></article>`).join('');
}

let activeRiskQuickFilter = null;

function riskEntries(row, type) {
  return type === 'ip' ? (row.riskIps || []) : (row.riskDevices || []);
}

function topRiskEntry(row, type) {
  return [...riskEntries(row, type)].sort((a, b) => b.accounts - a.accounts || a.value.localeCompare(b.value))[0] || null;
}

function riskQuickCount(type) {
  return new Set(pendingRows.flatMap(row => riskEntries(row, type).map(item => item.value))).size;
}

function updateRiskQuickCounts() {
  if ($('#riskIpQuickCount')) $('#riskIpQuickCount').textContent = `风险IP共${riskQuickCount('ip')}条`;
  if ($('#riskDeviceQuickCount')) $('#riskDeviceQuickCount').textContent = `风险设备共${riskQuickCount('device')}条`;
}

function riskProfileDisplay(row, type) {
  const values = [...new Set(riskEntries(row, type).map(item => item.value))];
  return values.length ? values.join('<br>') : '--';
}

function renderPending(rows = pendingRows) {
  const sortedRows = [...rows].sort((a, b) => {
    if (!activeRiskQuickFilter) return b.time.localeCompare(a.time);
    const aRisk = topRiskEntry(a, activeRiskQuickFilter);
    const bRisk = topRiskEntry(b, activeRiskQuickFilter);
    const countDifference = (bRisk?.accounts || 0) - (aRisk?.accounts || 0);
    if (countDifference) return countDifference;
    const profileDifference = (aRisk?.value || '').localeCompare(bRisk?.value || '');
    if (profileDifference) return profileDifference;
    return a.score - b.score || b.time.localeCompare(a.time);
  });
  $('#pendingTableBody').innerHTML = sortedRows.map((row, index) => `
    <tr>
      <td><input type="checkbox" class="account-select" data-select-user="${row.user}" aria-label="选择${row.user}"></td><td>${row.memberId}</td><td>${row.user}</td><td class="score-text ${scoreClass(row.score)}">${row.score}</td><td class="score-condition">${row.scoreCondition}</td><td class="risk-profile-cell">${riskProfileDisplay(row, 'ip')}</td><td class="risk-profile-cell">${riskProfileDisplay(row, 'device')}</td><td><span class="verify-status ${row.status === '验证通过' ? 'normal' : 'failed'}">${row.status}</span></td><td><span class="freeze-status ${row.freezeStatus === '冻结' ? 'frozen' : 'normal'}">${row.freezeStatus || '正常'}</span></td><td>${row.note || '—'}</td><td>${row.time}</td><td>${row.operator}</td>
      <td><button class="table-link" data-detail-id="${row.memberId}">评分详情</button><button class="table-link" data-common-id="${row.memberId}">常用IP／设备</button><button class="table-link" data-manual-id="${row.memberId}">手动验证</button><button class="table-link" data-note-id="${row.memberId}">修改备注</button></td>
    </tr>`).join('');
  $('#accountTotal').textContent = sortedRows.length;
  $$('[data-detail-id]').forEach(button => button.addEventListener('click', () => openPendingDetail(button.dataset.detailId)));
  $$('[data-common-id]').forEach(button => button.addEventListener('click', () => openCommonEnvironmentDialog(button.dataset.commonId)));
  $$('[data-manual-id]').forEach(button => button.addEventListener('click', () => openManualVerifyDialog(button.dataset.manualId)));
  $$('[data-note-id]').forEach(button => button.addEventListener('click', () => openNoteDialog(button.dataset.noteId)));
  if ($('#selectAllAccounts')) {
    $('#selectAllAccounts').checked = false;
    $('#selectAllAccounts').indeterminate = false;
  }
  $$('.account-select').forEach(input => input.addEventListener('change', updateAccountSelectionState));
}

function updateAccountSelectionState() {
  const visible = $$('.account-select');
  const checked = visible.filter(input => input.checked);
  if (!$('#selectAllAccounts')) return;
  $('#selectAllAccounts').checked = visible.length > 0 && checked.length === visible.length;
  $('#selectAllAccounts').indeterminate = checked.length > 0 && checked.length < visible.length;
}

function matchesAccountSearch(row, type, keyword) {
  if (!keyword) return true;
  if (type === 'memberId') return row.memberId.includes(keyword);
  if (type === 'user') return row.user.toLowerCase().includes(keyword);
  const environment = commonEnvironmentByMember[row.memberId] || { ips: [], devices: [] };
  if (type === 'ip') return [row.ip, ...environment.ips.map(item => item[0]), ...riskEntries(row, 'ip').map(item => item.value)].filter(Boolean).some(value => value.toLowerCase().includes(keyword));
  if (type === 'device') return [row.currentDeviceId, ...environment.devices.map(item => item[0]), ...riskEntries(row, 'device').map(item => item.value)].filter(Boolean).some(value => value.toLowerCase().includes(keyword));
  return true;
}

function matchesScoreTier(score, tier) {
  const [min, max] = tier.split('-').map(Number);
  return score >= min && score <= max;
}

function selectedScoreTiers() {
  return $$('.score-tier-option:checked').map(input => input.value);
}

function setLowScoreTiers() {
  $$('.score-tier-option').forEach(input => { input.checked = ['40-59', '20-39', '0-19'].includes(input.value); });
  updateScoreTierSummary();
}

function clearScoreTiers() {
  $$('.score-tier-option').forEach(input => { input.checked = false; });
  updateScoreTierSummary();
}

function updateScoreTierSummary() {
  const selected = selectedScoreTiers();
  const toggle = $('#pendingScoreTierToggle');
  if (!toggle) return;
  const isBelow60 = selected.length === 3 && ['40-59', '20-39', '0-19'].every(value => selected.includes(value));
  toggle.textContent = selected.length === 0 || selected.length === 5 ? '全部档位' : isBelow60 ? '60分以下（3档）' : `已选${selected.length}个档位`;
}

function renderFilteredPending() {
  const keyword = $('#pendingUserFilter').value.trim().toLowerCase();
  const searchType = $('#pendingUserType').value;
  const condition = $('#pendingConditionFilter').value.trim().toLowerCase();
  const scoreTiers = selectedScoreTiers();
  const verificationStatus = $('#pendingVerificationStatus').value;
  renderPending(pendingRows.filter(row =>
    matchesAccountSearch(row, searchType, keyword) &&
    (!condition || row.scoreCondition.toLowerCase().includes(condition)) &&
    (scoreTiers.length === 0 || scoreTiers.some(tier => matchesScoreTier(row.score, tier))) &&
    (verificationStatus === 'all' || row.status === verificationStatus) &&
    (!activeRiskQuickFilter || riskEntries(row, activeRiskQuickFilter).length > 0)
  ));
}

function renderLoginAlerts(rows = loginAlertRows) {
  const sortedRows = [...rows].sort((a, b) => b.time.localeCompare(a.time));
  $('#loginAlertTableBody').innerHTML = sortedRows.map(row => `
    <tr><td><input type="checkbox" class="login-alert-select" data-alert-id="${row.id}" aria-label="选择${row.user}的登录告警"></td><td>${row.memberId}</td><td>${row.user}</td><td>${formatLoginTime(row.time)}</td><td class="${row.riskIp ? 'risk-login-value' : ''}">${row.ip}</td><td class="device-value ${row.riskDevice ? 'risk-login-value' : ''}">${row.device}</td><td class="score-text ${scoreClass(row.score)}">${row.score}</td><td class="score-condition">${row.condition}</td><td>${row.control}</td><td class="record-note">${row.note || '--'}</td><td><span class="alert-record-status ${row.status === '验证失败' ? 'failed' : row.status === '验证通过' ? 'closed' : 'pending'}">${row.status}</span></td><td><button class="table-link" data-login-alert-detail="${row.id}">评分明细</button><button class="table-link" data-login-alert-verify="${row.id}">手动验证</button></td></tr>`).join('');
  $('#loginAlertTotal').textContent = sortedRows.length;
  const alertCount = loginAlertRows.length;
  if ($('#loginAlertTabBadge')) $('#loginAlertTabBadge').textContent = alertCount;
  if ($('#accountAlertBadge')) $('#accountAlertBadge').textContent = alertCount;
  $$('[data-login-alert-detail]').forEach(button => button.addEventListener('click', () => openLoginAlertDetail(button.dataset.loginAlertDetail)));
  $$('[data-login-alert-verify]').forEach(button => button.addEventListener('click', () => openLoginAlertVerifyDialog(button.dataset.loginAlertVerify)));
  if ($('#selectAllLoginAlerts')) {
    $('#selectAllLoginAlerts').checked = false;
    $('#selectAllLoginAlerts').indeterminate = false;
  }
  $$('.login-alert-select').forEach(input => input.addEventListener('change', updateLoginAlertSelectionState));
}

function updateLoginAlertSelectionState() {
  const visible = $$('.login-alert-select');
  const checked = visible.filter(input => input.checked);
  if (!$('#selectAllLoginAlerts')) return;
  $('#selectAllLoginAlerts').checked = visible.length > 0 && checked.length === visible.length;
  $('#selectAllLoginAlerts').indeterminate = checked.length > 0 && checked.length < visible.length;
}

function renderFilteredLoginAlerts() {
  const type = $('#loginAlertSearchType').value;
  const keyword = $('#loginAlertKeyword').value.trim().toLowerCase();
  const tier = $('#loginAlertScoreTier').value;
  const status = $('#loginAlertStatus').value;
  renderLoginAlerts(loginAlertRows.filter(row => {
    const searchable = { memberId: row.memberId, user: row.user, ip: row.ip, device: row.device }[type].toLowerCase();
    return (!keyword || searchable.includes(keyword)) &&
      (tier === 'all' || matchesScoreTier(row.score, tier)) &&
      (status === 'all' || row.status === status);
  }));
}

function openLoginAlertDetail(alertId) {
  const alert = loginAlertRows.find(item => item.id === alertId);
  const breakdownRows = alert.breakdown.map((item, index) => `<tr><td>${index + 1}</td><td>${item[0]}</td><td>${item[1]}</td><td>${item[2]}</td></tr>`).join('');
  openDialog('登录评分告警明细', `
    <div class="detail-summary login-alert-summary"><div><span>会员ID／账号</span><strong>${alert.memberId}／${alert.user}</strong></div><div><span>登录时间</span><strong>${formatLoginTime(alert.time)}</strong></div><div><span>本次评分</span><strong class="${scoreClass(alert.score)}">${alert.score}</strong></div><div><span>处置状态</span><strong class="alert-record-status ${alert.status === '验证失败' ? 'failed' : alert.status === '验证通过' ? 'closed' : 'pending'}">${alert.status}</strong></div></div>
    <div class="detail-section"><h3>本次登录环境</h3><table class="mini-table"><tbody><tr><td>登录IP</td><td>${alert.ip}</td><td>登录设备</td><td class="device-value">${alert.device}</td></tr><tr><td>控制结果</td><td>${alert.control}</td><td>扣分判断条件</td><td>${alert.condition}</td></tr><tr><td>备注</td><td colspan="3">${alert.note || '--'}</td></tr></tbody></table></div>
    <div class="detail-section"><h3>本次评分明细</h3><table class="mini-table"><thead><tr><th>顺序</th><th>规则</th><th>命中内容</th><th>扣分</th></tr></thead><tbody>${breakdownRows}</tbody></table></div>
    ${renderScoreVerificationSection(alert)}
    <div class="admin-dialog-actions"><button class="admin-btn secondary" data-alert-verify="${alert.id}">手动验证</button><button class="admin-btn" data-dialog-cancel>关闭</button></div>`);
  $('#adminDialog').classList.add('score-detail-dialog');
  $('[data-alert-verify]').addEventListener('click', () => openLoginAlertVerifyDialog(alert.id));
  $('[data-dialog-cancel]').addEventListener('click', closeDialog);
}

function renderScoreRecords(rows = loginScoreRows) {
  const sortedRows = [...rows].sort((a, b) => b.time.localeCompare(a.time));
  $('#scoreRecordTableBody').innerHTML = sortedRows.map(row => `
    <tr><td>${row.memberId}</td><td>${row.user}</td><td>${formatLoginTime(row.time)}</td><td class="${row.riskIp ? 'risk-login-value' : ''}">${row.ip}</td><td class="device-value ${row.riskDevice ? 'risk-login-value' : ''}">${row.device}</td><td class="score-text ${scoreClass(row.score)}">${row.score}</td><td class="score-condition">${row.condition}</td><td>${row.control}</td><td><span class="alert-record-status ${row.disposition === '验证失败' ? 'failed' : row.disposition === '待验证' ? 'pending' : 'closed'}">${row.disposition === '无需处置' ? '正常' : row.disposition}</span></td><td class="record-note">${row.note || '--'}</td><td><button class="table-link" data-score-record-detail="${row.id}">评分明细</button>${['待验证', '验证失败', '验证通过'].includes(row.disposition) ? `<button class="table-link" data-score-record-verify="${row.id}">手动验证</button>` : ''}</td></tr>`).join('');
  $('#scoreRecordTotal').textContent = sortedRows.length;
  $$('[data-score-record-detail]').forEach(button => button.addEventListener('click', () => openScoreRecordDetail(button.dataset.scoreRecordDetail)));
  $$('[data-score-record-verify]').forEach(button => button.addEventListener('click', () => openScoreRecordVerifyDialog(button.dataset.scoreRecordVerify)));
}

function renderFilteredScoreRecords() {
  const type = $('#scoreRecordSearchType').value;
  const keyword = $('#scoreRecordKeyword').value.trim().toLowerCase();
  const tier = $('#scoreRecordTier').value;
  const status = $('#scoreRecordStatus').value;
  const loginDate = $('#scoreRecordLoginDate').value;
  renderScoreRecords(loginScoreRows.filter(row => {
    const searchable = { memberId: row.memberId, user: row.user, ip: row.ip, device: row.device }[type].toLowerCase();
    const displayStatus = row.disposition === '无需处置' ? '正常' : row.disposition;
    return (!keyword || searchable.includes(keyword)) &&
      (tier === 'all' || matchesScoreTier(row.score, tier)) &&
      (status === 'all' || displayStatus === status) &&
      (!loginDate || formatLoginTime(row.time) === loginDate.replace('T', ' '));
  }));
}

function openScoreRecordDetail(recordId) {
  const record = loginScoreRows.find(item => item.id === recordId);
  const breakdownRows = record.breakdown.length
    ? record.breakdown.map((item, index) => `<tr><td>${index + 1}</td><td>${item[0]}</td><td>${item[1]}</td><td>${item[2]}</td></tr>`).join('')
    : '<tr><td colspan="4">本次登录未命中扣分规则</td></tr>';
  openDialog('登录评分明细', `
    <div class="detail-summary login-alert-summary"><div><span>会员ID／账号</span><strong>${record.memberId}／${record.user}</strong></div><div><span>登录时间</span><strong>${formatLoginTime(record.time)}</strong></div><div><span>本次评分</span><strong class="${scoreClass(record.score)}">${record.score}</strong></div><div><span>状态</span><strong class="alert-record-status ${record.disposition === '验证失败' ? 'failed' : record.disposition === '待验证' ? 'pending' : 'closed'}">${record.disposition === '无需处置' ? '正常' : record.disposition}</strong></div></div>
    <div class="detail-section"><h3>本次登录环境</h3><table class="mini-table"><tbody><tr><td>登录IP</td><td>${record.ip}</td><td>登录设备</td><td class="device-value">${record.device}</td></tr><tr><td>建议动作</td><td>${record.control}</td><td>扣分判断条件</td><td>${record.condition}</td></tr><tr><td>备注</td><td colspan="3">${record.note || '--'}</td></tr></tbody></table></div>
    <div class="detail-section"><h3>本次评分明细</h3><table class="mini-table"><thead><tr><th>顺序</th><th>规则</th><th>命中内容</th><th>扣分</th></tr></thead><tbody>${breakdownRows}</tbody></table></div>
    ${renderScoreVerificationSection(record)}
    <div class="admin-dialog-actions"><button class="admin-btn" data-dialog-cancel>关闭</button></div>`);
  $('#adminDialog').classList.add('score-detail-dialog');
  $('[data-dialog-cancel]').addEventListener('click', closeDialog);
}

function openLoginAlertVerifyDialog(alertId) {
  const alert = loginAlertRows.find(item => item.id === alertId);
  openDialog('登录告警手动验证', `
    <div class="admin-form"><label>会员账号</label><input value="${alert.user}" disabled><label>登录时间</label><input value="${formatLoginTime(alert.time)}" disabled><label>验证结果</label><div class="manual-result-options"><label><input type="radio" name="alertVerifyResult" value="验证通过">验证通过</label><label><input type="radio" name="alertVerifyResult" value="验证失败">验证失败</label></div><label>备注</label><textarea id="alertVerifyNote" placeholder="请输入验证说明，必填"></textarea></div>
    <p class="field-help">验证失败时本条告警继续保留；验证通过后从告警表移除。验证结果和备注均同步写入登录评分总表。</p><p class="config-error" id="alertVerifyError"></p>
    <div class="admin-dialog-actions"><button class="admin-btn secondary" data-dialog-cancel>取消</button><button class="admin-btn" data-save-alert-verify>确认</button></div>`);
  $('[data-dialog-cancel]').addEventListener('click', closeDialog);
  $('[data-save-alert-verify]').addEventListener('click', () => {
    const result = $('input[name="alertVerifyResult"]:checked')?.value;
    const note = $('#alertVerifyNote').value.trim();
    if (!result || !note) { $('#alertVerifyError').textContent = '请选择验证结果并填写备注。'; return; }
    applyLoginAlertVerification(alert, result, note);
    closeDialog();
    renderFilteredLoginAlerts();
    renderFilteredScoreRecords();
  });
}

function openScoreRecordVerifyDialog(recordId) {
  const record = loginScoreRows.find(item => item.id === recordId);
  openDialog('修改验证结果', `
    <div class="admin-form"><label>会员账号</label><input value="${record.user}" disabled><label>登录时间</label><input value="${formatLoginTime(record.time)}" disabled><label>验证结果</label><div class="manual-result-options"><label><input type="radio" name="scoreVerifyResult" value="验证通过" ${record.disposition === '验证通过' ? 'checked' : ''}>验证通过</label><label><input type="radio" name="scoreVerifyResult" value="验证失败" ${record.disposition === '验证失败' ? 'checked' : ''}>验证失败</label></div><label>备注</label><textarea id="scoreVerifyNote" placeholder="请输入验证说明，必填">${record.note === '--' ? '' : record.note}</textarea></div>
    <p class="field-help">修改为验证失败后重新进入告警表；修改为验证通过后从告警表移除。</p><p class="config-error" id="scoreVerifyError"></p>
    <div class="admin-dialog-actions"><button class="admin-btn secondary" data-dialog-cancel>取消</button><button class="admin-btn" data-save-score-verify>确认修改</button></div>`);
  $('[data-dialog-cancel]').addEventListener('click', closeDialog);
  $('[data-save-score-verify]').addEventListener('click', () => {
    const result = $('input[name="scoreVerifyResult"]:checked')?.value;
    const note = $('#scoreVerifyNote').value.trim();
    if (!result || !note) { $('#scoreVerifyError').textContent = '请选择验证结果并填写备注。'; return; }
    appendScoreVerificationRecord(record, result, note);
    record.disposition = result;
    record.note = note;
    record.alerted = true;
    const alertId = record.id.replace(/^SR/, 'LA');
    const existingAlert = loginAlertRows.find(item => item.id === alertId);
    if (result === '验证通过') {
      const alertIndex = loginAlertRows.findIndex(item => item.id === alertId);
      if (alertIndex >= 0) loginAlertRows.splice(alertIndex, 1);
    } else if (existingAlert) {
      existingAlert.status = '验证失败';
      existingAlert.note = note;
    } else {
      loginAlertRows.push({
        id: alertId, memberId: record.memberId, user: record.user, time: record.time,
        ip: record.ip, device: record.device, riskIp: record.riskIp, riskDevice: record.riskDevice,
        score: record.score, condition: record.condition, control: record.control,
        status: '验证失败', note, breakdown: record.breakdown,
      });
    }
    closeDialog();
    renderFilteredScoreRecords();
    renderFilteredLoginAlerts();
  });
}

function applyLoginAlertVerification(alert, result, note) {
  appendScoreVerificationRecord(alert, result, note);
  const existingRecord = loginScoreRows.find(item => item.id === alert.id.replace(/^LA/, 'SR'));
  const record = { ...alert, id: alert.id.replace(/^LA/, 'SR'), disposition: result, note, alerted: true };
  if (existingRecord) Object.assign(existingRecord, record);
  else loginScoreRows.push(record);
  if (result === '验证通过') {
    const alertIndex = loginAlertRows.findIndex(item => item.id === alert.id);
    if (alertIndex >= 0) loginAlertRows.splice(alertIndex, 1);
  } else {
    alert.status = '验证失败';
    alert.note = note;
  }
}

function openLoginAlertBatchVerifyDialog(alertIds) {
  const alerts = loginAlertRows.filter(item => alertIds.includes(item.id));
  if (!alerts.length) {
    openDialog('批量验证', '<p class="config-error">请先在告警列表中选择需要验证的记录。</p><div class="admin-dialog-actions"><button class="admin-btn" data-dialog-cancel>关闭</button></div>');
    $('[data-dialog-cancel]').addEventListener('click', closeDialog);
    return;
  }
  openDialog('批量验证', `
    <div class="admin-form"><label>已选记录</label><textarea disabled>${alerts.map(item => `${item.user}／${formatLoginTime(item.time)}`).join('\n')}</textarea><label>验证结果</label><div class="manual-result-options"><label><input type="radio" name="batchAlertResult" value="验证通过">验证通过</label><label><input type="radio" name="batchAlertResult" value="验证失败">验证失败</label></div><label>备注 <em class="required-mark">*</em></label><textarea id="batchAlertNote" placeholder="请输入本次批量验证说明"></textarea></div>
    <p class="field-help">验证失败的记录继续保留在告警表；验证通过的记录从告警表移除。共选择${alerts.length}条。</p><p class="config-error" id="batchAlertError"></p>
    <div class="admin-dialog-actions"><button class="admin-btn secondary" data-dialog-cancel>取消</button><button class="admin-btn" data-save-batch-alert>确认</button></div>`);
  $('[data-dialog-cancel]').addEventListener('click', closeDialog);
  $('[data-save-batch-alert]').addEventListener('click', () => {
    const result = $('input[name="batchAlertResult"]:checked')?.value;
    const note = $('#batchAlertNote').value.trim();
    if (!result || !note) { $('#batchAlertError').textContent = '请选择验证结果并填写备注。'; return; }
    alerts.forEach(alert => applyLoginAlertVerification(alert, result, note));
    closeDialog();
    renderFilteredLoginAlerts();
    renderFilteredScoreRecords();
  });
}

function renderRiskEntities(type, rows) {
  const body = type === 'ip' ? $('#riskIpTableBody') : $('#riskDeviceTableBody');
  body.innerHTML = rows.map(row => `<tr><td class="device-value">${row.value}</td><td>${row.accounts}</td><td>${row.healthy}</td><td>${row.alerts}</td><td>${row.logins}</td><td>${row.tier.replace('-', '至')}人</td><td>${row.first}</td><td>${row.last}</td><td><button class="table-link" data-risk-entity="${type}" data-risk-value="${row.value}">关联账号</button></td></tr>`).join('');
  $(`#risk${type === 'ip' ? 'Ip' : 'Device'}Total`).textContent = rows.length;
  $$('[data-risk-entity]').forEach(button => button.addEventListener('click', () => openRiskEntityDetail(button.dataset.riskEntity, button.dataset.riskValue)));
}

function filterRiskEntities(type) {
  const rows = type === 'ip' ? riskIpRows : riskDeviceRows;
  const prefix = type === 'ip' ? 'riskIp' : 'riskDevice';
  const keyword = $(`#${prefix}Keyword`).value.trim().toLowerCase();
  const tier = $(`#${prefix}Tier`).value;
  renderRiskEntities(type, rows.filter(row => (!keyword || row.value.toLowerCase().includes(keyword)) && (tier === 'all' || row.tier === tier)));
}

function openRiskEntityDetail(type, value) {
  const row = (type === 'ip' ? riskIpRows : riskDeviceRows).find(item => item.value === value);
  const memberRows = row.members.sort((a, b) => a[2] - b[2]).map(item => `<tr><td>${item[0]}</td><td>${item[1]}</td><td class="score-text ${scoreClass(item[2])}">${item[2]}</td><td><span class="${item[3] === '告警' ? 'alert-record-status pending' : 'record-alert-flag no'}">${item[3]}</span></td></tr>`).join('');
  openDialog(type === 'ip' ? '风险IP关联账号' : '风险设备关联账号', `<div class="environment-account"><span>${type === 'ip' ? '风险IP' : '风险设备号'}</span><strong>${row.value}</strong></div><div class="detail-section"><table class="mini-table"><thead><tr><th>会员ID</th><th>会员账号</th><th>最近登录评分</th><th>当前状态</th></tr></thead><tbody>${memberRows}</tbody></table><p class="detail-help">关联账号包含健康分用户；示例仅展示部分账号，完整数量为${row.accounts}人。</p></div><div class="admin-dialog-actions"><button class="admin-btn" data-dialog-cancel>关闭</button></div>`);
  $('[data-dialog-cancel]').addEventListener('click', closeDialog);
}

function openRiskListDialog(type) {
  const isIp = type === 'ip';
  const rows = [...(isIp ? riskIpRows : riskDeviceRows)].sort((a, b) => b.accounts - a.accounts || b.logins - a.logins);
  const listRows = rows.map(row => `<tr><td class="${isIp ? '' : 'device-value'}">${row.value}</td><td>${row.accounts}个</td><td>${row.last}</td><td>${row.logins}次</td></tr>`).join('');
  openDialog(isIp ? '风险IP名单' : '风险设备名单', `<div class="detail-section"><table class="mini-table"><thead><tr><th>${isIp ? '风险IP' : '风险设备'}</th><th>关联账号</th><th>风控时间</th><th>登录次数</th></tr></thead><tbody>${listRows}</tbody></table></div><div class="admin-dialog-actions"><button class="admin-btn" data-dialog-cancel>关闭</button></div>`);
  $('[data-dialog-cancel]').addEventListener('click', closeDialog);
}

function syncRulesFromConfig() {
  const update = (id, values) => Object.assign(rules.find(rule => rule.id === id), values);
  update('R01', { score: `-${scoringConfig.r01Score}` });
  update('R02', { score: `-${scoringConfig.r02Score}` });
  update('R03', { score: `-${scoringConfig.r03Score}` });
  update('R04', { score: `-${scoringConfig.r04Score}` });
  update('R05', {
    condition: `长期风险IP关联${scoringConfig.r05T1}-${scoringConfig.r05T2 - 1}／${scoringConfig.r05T2}-${scoringConfig.r05T3 - 1}／${scoringConfig.r05T3}-${scoringConfig.r05T4 - 1}／${scoringConfig.r05T4}人以上`,
    score: `-${scoringConfig.r05S1}／-${scoringConfig.r05S2}／-${scoringConfig.r05S3}／-${scoringConfig.r05S4}`,
  });
  update('R06', {
    condition: `长期风险设备关联${scoringConfig.r06T1}-${scoringConfig.r06T2 - 1}／${scoringConfig.r06T2}-${scoringConfig.r06T3 - 1}／${scoringConfig.r06T3}-${scoringConfig.r06T4 - 1}／${scoringConfig.r06T4}人以上`,
    score: `-${scoringConfig.r06S1}／-${scoringConfig.r06S2}／-${scoringConfig.r06S3}／-${scoringConfig.r06S4}`,
  });
  update('R07', {
    condition: `${scoringConfig.r07Hours}小时内切换${scoringConfig.r07T1}-${scoringConfig.r07T2 - 1}个陌生IP或有效设备号／${scoringConfig.r07T2}个及以上`,
    score: `-${scoringConfig.r07S1}／-${scoringConfig.r07S2}`,
  });
  update('R08', {
    condition: `${scoringConfig.r08Hours}小时内同一有效IP登录${scoringConfig.r08T1}-${scoringConfig.r08T2 - 1}／${scoringConfig.r08T2}-${scoringConfig.r08T3 - 1}／${scoringConfig.r08T3}个以上不同有效账号`,
    score: `-${scoringConfig.r08S1}／-${scoringConfig.r08S2}／-${scoringConfig.r08S3}`,
  });
  update('R09', {
    condition: `${scoringConfig.r09Hours}小时内同一有效设备登录${scoringConfig.r09T1}-${scoringConfig.r09T2 - 1}／${scoringConfig.r09T2}-${scoringConfig.r09T3 - 1}／${scoringConfig.r09T3}个以上不同有效账号`,
    score: `-${scoringConfig.r09S1}／-${scoringConfig.r09S2}／-${scoringConfig.r09S3}`,
  });
  update('R10', {
    condition: `${scoringConfig.r10Minutes}分钟内同一账号调用登录认证或密码错误${scoringConfig.r10T1}-${scoringConfig.r10T2 - 1}／${scoringConfig.r10T2}-${scoringConfig.r10T3 - 1}／${scoringConfig.r10T3}次以上`,
    score: `-${scoringConfig.r10S1}／-${scoringConfig.r10S2}／-${scoringConfig.r10S3}`,
  });
  update('R11', { condition: `沉睡超过${scoringConfig.r11Days}天且IP、设备均变化`, score: `-${scoringConfig.r11Score}` });
  update('R12', { score: `-${scoringConfig.r12Score}` });
  update('R13', {
    condition: `${scoringConfig.r13Minutes}分钟内同一IP调用登录接口${scoringConfig.r13T1}-${scoringConfig.r13T2 - 1}／${scoringConfig.r13T2}-${scoringConfig.r13T3 - 1}／${scoringConfig.r13T3}次以上`,
    score: `-${scoringConfig.r13S1}／-${scoringConfig.r13S2}／-${scoringConfig.r13S3}`,
  });
}

function configNumber(key, label = '', suffix = '') {
  return `<label class="config-number">${label ? `<span>${label}</span>` : ''}<input type="number" min="1" step="1" data-config-key="${key}" value="${scoringConfig[key]}">${suffix ? `<em>${suffix}</em>` : ''}</label>`;
}

function openScoringSettingsDialog() {
  const row = (id, title, condition, score) => `<tr><td><strong>${id}</strong><span>${title}</span></td><td><div class="config-fields">${condition}</div></td><td><div class="config-fields">${score}</div></td></tr>`;
  openDialog('规则设置', `
    <p class="config-help">配置触发门槛和扣分值。所有数字均填写正整数，扣分值无需输入负号。</p>
    <div class="config-table-wrap"><table class="config-table"><thead><tr><th>规则</th><th>触发条件</th><th>扣分值</th></tr></thead><tbody>
      ${row('R01', '陌生IP', 'IP不在常用IP中', configNumber('r01Score'))}
      ${row('R02', '陌生设备', '有效设备号不在常用设备中', configNumber('r02Score'))}
      ${row('R03', '双陌生组合', 'IP陌生且设备无法证明为常用', configNumber('r03Score'))}
      ${row('R04', '设备号缺失', '本次未获取到有效设备号', configNumber('r04Score'))}
      ${row('R05', '长期风险IP', `${configNumber('r05T1', '第1档≥', '人')}${configNumber('r05T2', '第2档≥', '人')}${configNumber('r05T3', '第3档≥', '人')}${configNumber('r05T4', '第4档≥', '人')}`, `${configNumber('r05S1', '第1档')}${configNumber('r05S2', '第2档')}${configNumber('r05S3', '第3档')}${configNumber('r05S4', '第4档')}`)}
      ${row('R06', '长期风险设备', `${configNumber('r06T1', '第1档≥', '人')}${configNumber('r06T2', '第2档≥', '人')}${configNumber('r06T3', '第3档≥', '人')}${configNumber('r06T4', '第4档≥', '人')}`, `${configNumber('r06S1', '第1档')}${configNumber('r06S2', '第2档')}${configNumber('r06S3', '第3档')}${configNumber('r06S4', '第4档')}`)}
      ${row('R07', '环境切换', `${configNumber('r07Hours', '统计', '小时')}${configNumber('r07T1', '第1档≥', '个')}${configNumber('r07T2', '第2档≥', '个')}`, `${configNumber('r07S1', '第1档')}${configNumber('r07S2', '第2档')}`)}
      ${row('R08', '同IP多账号', `${configNumber('r08Hours', '统计', '小时')}${configNumber('r08T1', '第1档≥', '人')}${configNumber('r08T2', '第2档≥', '人')}${configNumber('r08T3', '第3档≥', '人')}`, `${configNumber('r08S1', '第1档')}${configNumber('r08S2', '第2档')}${configNumber('r08S3', '第3档')}`)}
      ${row('R09', '同设备多账号', `${configNumber('r09Hours', '统计', '小时')}${configNumber('r09T1', '第1档≥', '人')}${configNumber('r09T2', '第2档≥', '人')}${configNumber('r09T3', '第3档≥', '人')}`, `${configNumber('r09S1', '第1档')}${configNumber('r09S2', '第2档')}${configNumber('r09S3', '第3档')}`)}
      ${row('R10', '账号高频登录', `${configNumber('r10Minutes', '统计', '分钟')}${configNumber('r10T1', '第1档≥', '次')}${configNumber('r10T2', '第2档≥', '次')}${configNumber('r10T3', '第3档≥', '次')}`, `${configNumber('r10S1', '第1档')}${configNumber('r10S2', '第2档')}${configNumber('r10S3', '第3档')}`)}
      ${row('R11', '沉睡账号', configNumber('r11Days', '沉睡超过', '天'), configNumber('r11Score'))}
      ${row('R12', '敏感操作', '新环境登录后立即进行敏感操作', configNumber('r12Score'))}
      ${row('R13', '登录接口高频', `${configNumber('r13Minutes', '统计', '分钟')}${configNumber('r13T1', '第1档≥', '次')}${configNumber('r13T2', '第2档≥', '次')}${configNumber('r13T3', '第3档≥', '次')}`, `${configNumber('r13S1', '第1档')}${configNumber('r13S2', '第2档')}${configNumber('r13S3', '第3档')}`)}
    </tbody></table></div>
    <p class="config-error" id="configError" aria-live="polite"></p>
    <div class="admin-dialog-actions"><button class="admin-btn secondary" data-dialog-cancel>取消</button><button class="admin-btn" data-save-scoring>保存设置</button></div>
  `);
  $('#adminDialog').classList.add('rule-settings-dialog');
  $('[data-dialog-cancel]').addEventListener('click', closeDialog);
  $('[data-save-scoring]').addEventListener('click', () => {
    const values = {};
    $$('[data-config-key]').forEach(input => { values[input.dataset.configKey] = Number(input.value); });
    const invalidNumber = Object.values(values).some(value => !Number.isInteger(value) || value < 1);
    const ascending = [
      ['r05T1', 'r05T2', 'r05T3', 'r05T4'], ['r05S1', 'r05S2', 'r05S3', 'r05S4'],
      ['r06T1', 'r06T2', 'r06T3', 'r06T4'], ['r06S1', 'r06S2', 'r06S3', 'r06S4'],
      ['r07T1', 'r07T2'], ['r07S1', 'r07S2'],
      ['r08T1', 'r08T2', 'r08T3'], ['r08S1', 'r08S2', 'r08S3'],
      ['r09T1', 'r09T2', 'r09T3'], ['r09S1', 'r09S2', 'r09S3'],
      ['r10T1', 'r10T2', 'r10T3'], ['r10S1', 'r10S2', 'r10S3'],
      ['r13T1', 'r13T2', 'r13T3'], ['r13S1', 'r13S2', 'r13S3'],
    ].every(keys => keys.every((key, index) => index === 0 || values[key] > values[keys[index - 1]]));
    if (invalidNumber || !ascending) {
      $('#configError').textContent = invalidNumber ? '请填写大于0的整数。' : '同一规则的分档门槛必须从低到高填写。';
      return;
    }
    Object.assign(scoringConfig, values);
    syncRulesFromConfig();
    renderRules();
    closeDialog();
  });
}

function renderRiskTgidConfigRow() {
  if (!$('#riskTgidBaseValue')) return;
  $('#riskTgidBaseValue').textContent = riskTgidConfig.baseValue || '—';
  $('#riskTgidDefaultValue').textContent = riskTgidConfig.defaultValue || '—';
  $('#riskTgidStatus').textContent = riskTgidConfig.disabled ? '禁用' : '启用';
  $('#riskTgidStatus').className = riskTgidConfig.disabled ? 'status-disabled' : 'status-enabled';
  $('#toggleRiskTgidBtn').textContent = riskTgidConfig.disabled ? '设为启用' : '设为禁用';
}

function configSiteField(label, key) {
  const inherited = riskTgidConfig.inherited[key];
  return `<div class="config-detail-label">${label}配置属性：</div><div class="config-site-field"><input data-site-value="${key}" value="${riskTgidConfig.siteValues[key]}" ${inherited ? 'disabled' : ''}><label><input type="checkbox" data-site-inherit="${key}" ${inherited ? 'checked' : ''}>继承</label></div>`;
}

function openRiskTgidConfigDialog() {
  openDialog('设置配置：风险评分提醒tgid', `
    <div class="config-detail-form">
      <div class="config-detail-label">配置分组：</div><select><option>风险评分配置</option></select>
      <div class="config-detail-label">系统名称：</div><input value="risk_score_alert_tgid" disabled>
      <div class="config-detail-label">配置标题：</div><input value="风险评分提醒tgid" disabled>
      <div class="config-detail-label">基础配置：</div><div><input id="riskTgidBaseInput" value="${riskTgidConfig.baseValue}" placeholder="请输入TGID，多个用英文逗号分隔"><p class="field-help">填写接收风险评分提醒的Telegram ID，多个TGID使用英文逗号分隔。</p></div>
      ${configSiteField('恒行3', 'h3')}
      ${configSiteField('亚体', 'asia')}
      ${configSiteField('启航', 'qh')}
      <div class="config-detail-label">配置默认值：</div><input id="riskTgidDefaultInput" value="${riskTgidConfig.defaultValue}" placeholder="未配置站点值时使用">
      <div class="config-detail-label">配置分组：</div><select><option>单值型</option></select>
      <div class="config-detail-label">配置值属性：</div><select><option>字符串</option></select>
      <div class="config-detail-label">配置描述：</div><textarea disabled>用于配置用户账号风险评分提醒的Telegram ID。账号分数进入提醒范围时，系统向配置的TGID发送预警消息；多个TGID使用英文逗号分隔。</textarea>
      <div class="config-detail-label">是否禁用：</div><label class="config-disabled-check"><input type="checkbox" id="riskTgidDisabled" ${riskTgidConfig.disabled ? 'checked' : ''}>选中禁用</label>
    </div>
    <p class="config-error" id="riskTgidError" aria-live="polite"></p>
    <div class="admin-dialog-actions"><button class="admin-btn" data-save-tgid>保存配置</button><button class="admin-btn secondary" data-reset-tgid>重新设置</button><button class="admin-btn secondary" data-dialog-cancel>返回列表</button></div>
  `);
  $('#adminDialog').classList.add('config-detail-dialog');
  $$('[data-site-inherit]').forEach(input => input.addEventListener('change', () => {
    const field = $(`[data-site-value="${input.dataset.siteInherit}"]`);
    field.disabled = input.checked;
    if (input.checked) field.value = '';
  }));
  $('[data-reset-tgid]').addEventListener('click', () => {
    $('#riskTgidBaseInput').value = riskTgidConfig.baseValue;
    $('#riskTgidDefaultInput').value = riskTgidConfig.defaultValue;
    $('#riskTgidDisabled').checked = riskTgidConfig.disabled;
    $$('[data-site-inherit]').forEach(input => {
      const key = input.dataset.siteInherit;
      input.checked = riskTgidConfig.inherited[key];
      const field = $(`[data-site-value="${key}"]`);
      field.value = riskTgidConfig.siteValues[key];
      field.disabled = input.checked;
    });
    $('#riskTgidError').textContent = '';
  });
  $('[data-dialog-cancel]').addEventListener('click', closeDialog);
  $('[data-save-tgid]').addEventListener('click', () => {
    const normalize = value => value.trim().replace(/\s+/g, '');
    const baseValue = normalize($('#riskTgidBaseInput').value);
    const defaultValue = normalize($('#riskTgidDefaultInput').value);
    const isValid = value => !value || /^-?\d+(,-?\d+)*$/.test(value);
    const siteValues = {};
    const inherited = {};
    $$('[data-site-inherit]').forEach(input => {
      const key = input.dataset.siteInherit;
      inherited[key] = input.checked;
      siteValues[key] = input.checked ? '' : normalize($(`[data-site-value="${key}"]`).value);
    });
    if (![baseValue, defaultValue, ...Object.values(siteValues)].every(isValid)) {
      $('#riskTgidError').textContent = 'TGID仅支持整数；多个TGID请使用英文逗号分隔。';
      return;
    }
    Object.assign(riskTgidConfig, { baseValue, defaultValue, siteValues, inherited, disabled: $('#riskTgidDisabled').checked });
    renderRiskTgidConfigRow();
    closeDialog();
  });
}

function renderCommonEnvironmentConfigRows() {
  const ipValue = `${commonEnvironmentConfig.ip.days},${commonEnvironmentConfig.ip.count}`;
  const deviceValue = `${commonEnvironmentConfig.device.days},${commonEnvironmentConfig.device.count}`;
  if ($('#commonIpBaseValue')) $('#commonIpBaseValue').textContent = ipValue;
  if ($('#commonIpDefaultValue')) $('#commonIpDefaultValue').textContent = ipValue;
  if ($('#commonDeviceBaseValue')) $('#commonDeviceBaseValue').textContent = deviceValue;
  if ($('#commonDeviceDefaultValue')) $('#commonDeviceDefaultValue').textContent = deviceValue;
  [['ip', 'commonIpStatus', 'toggleCommonIpBtn'], ['device', 'commonDeviceStatus', 'toggleCommonDeviceBtn']].forEach(([type, statusId, toggleId]) => {
    const status = $(`#${statusId}`);
    const toggle = $(`#${toggleId}`);
    if (status) {
      status.textContent = commonEnvironmentConfig[type].disabled ? '禁用' : '启用';
      status.className = commonEnvironmentConfig[type].disabled ? 'status-disabled' : 'status-enabled';
    }
    if (toggle) toggle.textContent = commonEnvironmentConfig[type].disabled ? '设为启用' : '设为禁用';
  });
}

function openCommonEnvironmentConfigDialog(type) {
  const isIp = type === 'ip';
  const config = commonEnvironmentConfig[type];
  const title = isIp ? '常用IP判定配置' : '常用设备判定配置';
  const systemName = isIp ? 'common_ip_rule' : 'common_device_rule';
  const targetLabel = isIp ? 'IP' : '设备';
  const description = `配置格式为“统计天数,${targetLabel}使用次数”。例如30,5表示同一账号的同一有效${targetLabel}在30天内成功登录达到5次后，认定为常用${targetLabel}。`;
  openDialog(`设置配置：${title}`, `
    <div class="config-detail-form">
      <div class="config-detail-label">配置分组：</div><select><option>常用IP／设备配置</option></select>
      <div class="config-detail-label">系统名称：</div><input value="${systemName}" disabled>
      <div class="config-detail-label">配置标题：</div><input value="${title}" disabled>
      <div class="config-detail-label">基础配置：</div><div><input id="commonConfigValue" value="${config.days},${config.count}" placeholder="统计天数,${targetLabel}使用次数"><p class="field-help">参数1为统计天数，参数2为${targetLabel}使用次数；例如30,5表示30天内使用达到5次。</p></div>
      <div class="config-detail-label">恒行3配置属性：</div><div class="config-site-field"><input disabled><label><input type="checkbox" checked>继承</label></div>
      <div class="config-detail-label">亚体配置属性：</div><div class="config-site-field"><input disabled><label><input type="checkbox" checked>继承</label></div>
      <div class="config-detail-label">启航配置属性：</div><div class="config-site-field"><input disabled><label><input type="checkbox" checked>继承</label></div>
      <div class="config-detail-label">配置默认值：</div><input value="${config.days},${config.count}" disabled>
      <div class="config-detail-label">配置类型：</div><select><option>组合值</option></select>
      <div class="config-detail-label">配置值属性：</div><select><option>整数,整数</option></select>
      <div class="config-detail-label">配置描述：</div><textarea disabled>${description}</textarea>
      <div class="config-detail-label">统计口径：</div><textarea disabled>只统计成功登录；页面刷新、Token续期和无效${targetLabel}不计次数。同一${targetLabel}按会员ID分别统计。</textarea>
    </div>
    <p class="config-error" id="commonConfigError" aria-live="polite"></p>
    <div class="admin-dialog-actions"><button class="admin-btn" data-save-common-config>保存配置</button><button class="admin-btn secondary" data-dialog-cancel>返回列表</button></div>
  `);
  $('#adminDialog').classList.add('config-detail-dialog');
  $('[data-dialog-cancel]').addEventListener('click', closeDialog);
  $('[data-save-common-config]').addEventListener('click', () => {
    const value = $('#commonConfigValue').value.trim().replace(/\s+/g, '');
    if (!/^\d+,\d+$/.test(value)) {
      $('#commonConfigError').textContent = `请按“统计天数,${targetLabel}使用次数”填写，并使用英文逗号。`;
      return;
    }
    const [days, count] = value.split(',').map(Number);
    if (![days, count].every(item => Number.isInteger(item) && item > 0)) {
      $('#commonConfigError').textContent = '统计天数和使用次数均须为大于0的整数。';
      return;
    }
    commonEnvironmentConfig[type] = { ...commonEnvironmentConfig[type], days, count };
    renderCommonEnvironmentConfigRows();
    closeDialog();
  });
}

function showAdminFeature(feature) {
  const showConfig = feature === 'config';
  $('#scoreFeature').classList.toggle('hidden', showConfig);
  $('#basicConfigFeature').classList.toggle('hidden', !showConfig);
  $('#accountScoreMenu').classList.toggle('active', !showConfig);
  $('#basicConfigMenu').classList.toggle('active', showConfig);
}

function openDialog(title, body) {
  $('#adminDialog').className = 'admin-dialog';
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
    closeDialog(); renderRules();
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

function openPendingDetail(memberId) {
  const row = pendingRows.find(item => item.memberId === memberId);
  const breakdownRows = row.breakdown.map((item, order) => `<tr><td>${order + 1}</td><td>${item[0]}</td><td>${item[1]}</td><td>${item[2]}</td><td>${item[3]}</td></tr>`).reverse().join('');
  const riskEventRows = row.riskEvents.length
    ? row.riskEvents.map(event => `<tr><td>${event.time}</td><td>${event.type}</td><td>${event.ip || '--'}</td><td class="device-value">${event.device || '--'}</td><td>${event.rule}</td><td>${event.loginScore}</td><td>${event.alertScore}</td><td>${event.result}</td></tr>`).join('')
    : '<tr><td colspan="8">暂无需要关注的风险评分事件</td></tr>';
  const resetRecord = row.resetFrom !== undefined
    ? `<tr><td>${row.resetTime}</td><td>验证记录</td><td>${row.manualResult === '验证通过' ? '手动验证通过' : '验证成功'}，该次登录有效分数由${row.resetFrom}更新为100，并更新常用环境</td><td>${row.resetOperator}</td></tr>`
    : '';
  const latestRecord = row.resetFrom === undefined
    ? `<tr><td>${row.time}</td><td>${row.source}</td><td>分数更新为${row.score}；扣分条件：${row.scoreCondition}${row.manualResult ? `；手动验证：${row.manualResult}` : ''}</td><td>${row.operator}</td></tr>`
    : '';
  openDialog('账号评分详情', `
    <div class="detail-summary alert-detail-summary">
      <div><span>会员ID／账号</span><strong>${row.memberId}／${row.user}</strong></div><div><span>当前告警分数</span><strong class="${scoreClass(row.score)}">${row.score}</strong></div><div><span>最近登录评分</span><strong class="${scoreClass(row.latestLoginScore)}">${row.latestLoginScore}</strong><small>${row.latestLoginTime}</small></div><div class="condition-summary"><span>告警扣分判断条件</span><strong>${row.scoreCondition}</strong></div><div><span>告警状态</span><strong class="alert-status ${row.alertStatus === '待处理' ? 'pending' : 'closed'}">${row.alertStatus}</strong></div><div><span>冻结状态</span><strong class="freeze-status ${row.freezeStatus === '冻结' ? 'frozen' : 'normal'}">${row.freezeStatus || '正常'}</strong></div>
    </div>
    <div class="alert-lock-note"><strong>告警分数已锁定：</strong>每次登录仍从100分独立评分；在当前告警处理完成前，后续高分不覆盖告警分数，只有新的更低分会更新该告警。</div>
    <div class="detail-section"><h3>当前告警评分明细</h3><table class="mini-table"><thead><tr><th>顺序</th><th>规则</th><th>命中内容</th><th>分值</th><th>告警分数</th></tr></thead><tbody>${breakdownRows}</tbody></table></div>
    <div class="detail-section"><h3>风险评分事件明细</h3><p class="detail-help">仅记录低于60分、高危规则命中、验证和人工处理事件；普通登录不在此处逐条展示。</p><div class="table-wrap"><table class="mini-table risk-event-history"><thead><tr><th>事件时间</th><th>事件类型</th><th>风险IP</th><th>风险设备</th><th>命中规则／处理</th><th>本次登录评分</th><th>更新后告警分数</th><th>控制结果</th></tr></thead><tbody>${riskEventRows}</tbody></table></div></div>
    <div class="detail-section"><div class="detail-section-head"><h3>风险与环境信息</h3><button class="table-link" data-view-common="${row.memberId}">查看常用IP／设备</button></div><table class="mini-table"><tbody><tr><td>触发原因</td><td colspan="3">${row.reason}</td></tr><tr><td>当前IP</td><td>${row.ip}</td><td>当前设备号</td><td class="device-value">${row.currentDeviceId || '未获取'}</td></tr><tr><td>备注</td><td colspan="3">${row.note || '—'}</td></tr></tbody></table></div>
    <div class="detail-section"><h3>验证及变更记录</h3><table class="mini-table"><thead><tr><th>时间</th><th>类型</th><th>内容</th><th>操作人</th></tr></thead><tbody>${resetRecord}${latestRecord}<tr><td>2026-11-17 08:20</td><td>评分记录</td><td>${row.reason}</td><td>系统</td></tr></tbody></table></div>
    <div class="admin-dialog-actions"><button class="admin-btn secondary" data-dialog-cancel>关闭</button></div>
  `);
  $('#adminDialog').classList.add('score-detail-dialog');
  $('[data-dialog-cancel]').addEventListener('click', closeDialog);
  $('[data-view-common]').addEventListener('click', () => openCommonEnvironmentDialog(row.memberId, true));
}

function openCommonEnvironmentDialog(memberId, returnToDetail = false) {
  const row = pendingRows.find(item => item.memberId === memberId);
  const environment = commonEnvironmentByMember[memberId] || { ips: [], devices: [] };
  const ipRows = environment.ips.length
    ? environment.ips.map(item => `<tr><td>${item[0]}</td><td>${item[1]}</td><td>${item[2]}</td><td>${item[3]}</td></tr>`).join('')
    : '<tr><td colspan="4">暂无常用IP</td></tr>';
  const deviceRows = environment.devices.length
    ? environment.devices.map(item => `<tr><td class="device-value">${item[0]}</td><td>${item[1]}</td><td>${item[2]}</td><td>${item[3]}</td></tr>`).join('')
    : '<tr><td colspan="4">暂无常用设备</td></tr>';
  openDialog('常用IP／设备', `
    <div class="environment-account"><span>会员ID／账号</span><strong>${row.memberId}／${row.user}</strong></div>
    <div class="detail-section"><h3>常用IP</h3><table class="mini-table"><thead><tr><th>IP</th><th>${commonEnvironmentConfig.ip.days}天内使用次数（达到${commonEnvironmentConfig.ip.count}次）</th><th>最近活跃时间</th><th>来源</th></tr></thead><tbody>${ipRows}</tbody></table></div>
    <div class="detail-section"><h3>常用设备</h3><table class="mini-table"><thead><tr><th>设备号</th><th>${commonEnvironmentConfig.device.days}天内使用次数（达到${commonEnvironmentConfig.device.count}次）</th><th>最近活跃时间</th><th>来源</th></tr></thead><tbody>${deviceRows}</tbody></table></div>
    <div class="admin-dialog-actions">${returnToDetail ? '<button class="admin-btn secondary" data-back-detail>返回评分详情</button>' : ''}<button class="admin-btn" data-dialog-cancel>关闭</button></div>
  `);
  if ($('[data-back-detail]')) $('[data-back-detail]').addEventListener('click', () => openPendingDetail(memberId));
  $('[data-dialog-cancel]').addEventListener('click', closeDialog);
}

function formatAdminTime() {
  const now = new Date();
  const pad = value => String(value).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

function applyVerificationResult(row, result, note) {
  const previousScore = row.score;
  row.manualResult = result;
  row.status = result;
  row.source = '手动验证';
  row.operator = 'Cora';
  row.time = formatAdminTime();
  if (result === '验证通过') {
    row.score = 100;
    row.action = '正常放行';
    row.freezeStatus = '正常';
    row.scoreCondition = '无扣分条件';
    row.resetFrom = previousScore;
    row.resetTime = row.time;
    row.resetOperator = 'Cora';
    row.reason = '后台确认验证通过并更新常用环境';
    row.note = note || '后台手动确认验证通过';
    row.alertStatus = '已关闭';
    row.latestLoginScore = 100;
    row.latestLoginTime = row.time;
    row.riskEvents.unshift({ time: row.time, type: '告警关闭', ip: row.ip, device: row.currentDeviceId || '未获取', rule: '手动验证通过，更新常用环境', loginScore: previousScore, alertScore: 100, result: '恢复正常' });
    if (previousScore < 100) row.breakdown.push(['验证通过', '该次登录有效分数更新为100并写入常用环境', '更新', '100']);
  } else {
    row.reason = '后台确认验证失败，冻结状态保持不变';
    row.note = note || '后台手动确认验证失败';
    row.alertStatus = '待处理';
    row.riskEvents.unshift({ time: row.time, type: '验证失败', ip: row.ip, device: row.currentDeviceId || '未获取', rule: '保留当前未处理告警', loginScore: row.latestLoginScore, alertScore: row.score, result: '告警继续保留' });
    row.breakdown.push(['验证失败', '保留当前告警分数和冻结状态；后续登录独立评分但不覆盖未处理告警', '—', row.score]);
    delete row.resetFrom;
    delete row.resetTime;
    delete row.resetOperator;
  }
}

function openManualVerifyDialog(memberId) {
  const row = pendingRows.find(item => item.memberId === memberId);
  openDialog('手动验证', `
    <div class="admin-form">
      <label>会员ID</label><input value="${row.memberId}" disabled>
      <label>会员账号</label><input value="${row.user}" disabled>
      <label>验证结果</label><div class="manual-result-options"><label><input type="radio" name="manualResult" value="验证通过">验证通过</label><label><input type="radio" name="manualResult" value="验证失败">验证失败</label></div>
      <label>备注</label><textarea id="manualVerifyNote" placeholder="原备注：${row.note || '无'}；请输入本次验证说明"></textarea>
    </div>
    <p class="config-error" id="manualVerifyError" aria-live="polite"></p>
    <div class="admin-dialog-actions"><button class="admin-btn secondary" data-dialog-cancel>取消</button><button class="admin-btn" data-save-manual>确认</button></div>
  `);
  $('[data-dialog-cancel]').addEventListener('click', closeDialog);
  $('[data-save-manual]').addEventListener('click', () => {
    const selected = $('input[name="manualResult"]:checked');
    if (!selected) {
      $('#manualVerifyError').textContent = '请选择验证通过或验证失败。';
      return;
    }
    applyVerificationResult(row, selected.value, $('#manualVerifyNote').value.trim());
    closeDialog();
    renderFilteredPending();
  });
}

function openBatchVerifyDialog(initialUsers = []) {
  openDialog('批量验证', `
    <div class="admin-form batch-verify-form">
      <label>会员账号</label><textarea id="batchVerifyUsers" placeholder="例如：hxm001@as,yongson005">${initialUsers.join(',')}</textarea>
      <span></span><div class="batch-input-help">多个会员账号请使用英文逗号分隔，不填写会员ID。</div>
      <label>验证结果</label><div class="manual-result-options"><label><input type="radio" name="batchResult" value="验证通过">验证通过</label><label><input type="radio" name="batchResult" value="验证失败">验证失败</label></div>
      <label>备注 <em class="required-mark">*</em></label><textarea id="batchVerifyNote" placeholder="请输入本次批量验证说明"></textarea>
    </div>
    <p class="config-error" id="batchVerifyError" aria-live="polite"></p>
    <div class="admin-dialog-actions"><button class="admin-btn secondary" data-dialog-cancel>取消</button><button class="admin-btn" data-save-batch>确认</button></div>
  `);
  $('[data-dialog-cancel]').addEventListener('click', closeDialog);
  $('[data-save-batch]').addEventListener('click', () => {
    const raw = $('#batchVerifyUsers').value.trim();
    const result = $('input[name="batchResult"]:checked');
    const note = $('#batchVerifyNote').value.trim();
    if (!raw) {
      $('#batchVerifyError').textContent = '请输入会员账号。';
      return;
    }
    if (raw.includes('，')) {
      $('#batchVerifyError').textContent = '会员账号之间请使用英文逗号分隔。';
      return;
    }
    const parts = raw.split(',').map(value => value.trim());
    if (parts.some(value => !value)) {
      $('#batchVerifyError').textContent = '请检查会员账号格式，英文逗号前后都需要填写账号。';
      return;
    }
    const users = [...new Set(parts)];
    const unknown = users.filter(user => !pendingRows.some(row => row.user === user));
    if (unknown.length) {
      $('#batchVerifyError').textContent = `未找到会员账号：${unknown.join('、')}`;
      return;
    }
    if (!result) {
      $('#batchVerifyError').textContent = '请选择验证通过或验证失败。';
      return;
    }
    if (!note) {
      $('#batchVerifyError').textContent = '备注为必填项。';
      return;
    }
    users.forEach(user => applyVerificationResult(pendingRows.find(row => row.user === user), result.value, note));
    closeDialog();
    renderFilteredPending();
  });
}

function openNoteDialog(memberId) {
  const row = pendingRows.find(item => item.memberId === memberId);
  openDialog('修改备注', `<div class="admin-form"><label>会员ID／账号</label><input value="${row.memberId}／${row.user}" disabled><label>备注</label><textarea id="noteValue">${row.note || ''}</textarea></div><div class="admin-dialog-actions"><button class="admin-btn secondary" data-dialog-cancel>取消</button><button class="admin-btn" data-save-note>保存</button></div>`);
  $('[data-dialog-cancel]').addEventListener('click', closeDialog);
  $('[data-save-note]').addEventListener('click', () => { row.note = $('#noteValue').value.trim(); row.operator = 'Cora'; row.time = '2026-11-17 11:30'; closeDialog(); renderFilteredPending(); });
}

$$('.view-tab').forEach(tab => tab.addEventListener('click', () => {
  $$('.view-tab').forEach(item => item.classList.toggle('active', item === tab));
  $$('.view').forEach(view => view.classList.remove('active'));
  $(`#${tab.dataset.view}View`).classList.add('active');
}));

$$('.admin-page-tab').forEach(tab => tab.addEventListener('click', () => {
  $$('.admin-page-tab').forEach(item => item.classList.toggle('active', item === tab));
  $$('.admin-tab-panel').forEach(panel => panel.classList.remove('active'));
  $(`#${tab.dataset.adminTab}Panel`).classList.add('active');
  const breadcrumb = $('.admin-breadcrumb span');
  const breadcrumbTitles = { alerts: '登录评分告警', records: '登录评分总表', rules: '评分规则设置' };
  if (breadcrumb) breadcrumb.textContent = breadcrumbTitles[tab.dataset.adminTab];
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
    const closeScreen = $('#modalMask').dataset.closeScreen;
    closeSecurityModal();
    if (closeScreen === 'authenticated') showAuthenticatedHome();
    else if (closeScreen === 'home') showHome();
  }
});
if ($('#password')) $('#password').addEventListener('keydown', event => { if (event.key === 'Enter') startLoginFlow(); });

if ($('#ruleSettingsBtn')) $('#ruleSettingsBtn').addEventListener('click', openScoringSettingsDialog);
if ($('#editBandsBtn')) $('#editBandsBtn').addEventListener('click', openBandsDialog);
if ($('#websiteManagementMenu')) $('#websiteManagementMenu').addEventListener('click', event => {
  if (event.target.closest('#basicConfigMenu')) return;
  const submenu = $('.website-submenu');
  const willOpen = submenu.classList.contains('hidden');
  submenu.classList.toggle('hidden', !willOpen);
  $('#websiteManagementMenu').firstChild.nodeValue = willOpen ? '－ 网站管理' : '＋ 网站管理';
});
if ($('#basicConfigMenu')) $('#basicConfigMenu').addEventListener('click', event => {
  event.stopPropagation();
  showAdminFeature('config');
});
if ($('#accountScoreMenu')) $('#accountScoreMenu').addEventListener('click', () => showAdminFeature('score'));
if ($('#setRiskTgidBtn')) $('#setRiskTgidBtn').addEventListener('click', openRiskTgidConfigDialog);
if ($('#editRiskTgidBtn')) $('#editRiskTgidBtn').addEventListener('click', openRiskTgidConfigDialog);
if ($('#setCommonIpBtn')) $('#setCommonIpBtn').addEventListener('click', () => openCommonEnvironmentConfigDialog('ip'));
if ($('#editCommonIpBtn')) $('#editCommonIpBtn').addEventListener('click', () => openCommonEnvironmentConfigDialog('ip'));
if ($('#setCommonDeviceBtn')) $('#setCommonDeviceBtn').addEventListener('click', () => openCommonEnvironmentConfigDialog('device'));
if ($('#editCommonDeviceBtn')) $('#editCommonDeviceBtn').addEventListener('click', () => openCommonEnvironmentConfigDialog('device'));
if ($('#toggleCommonIpBtn')) $('#toggleCommonIpBtn').addEventListener('click', () => {
  commonEnvironmentConfig.ip.disabled = !commonEnvironmentConfig.ip.disabled;
  renderCommonEnvironmentConfigRows();
});
if ($('#toggleCommonDeviceBtn')) $('#toggleCommonDeviceBtn').addEventListener('click', () => {
  commonEnvironmentConfig.device.disabled = !commonEnvironmentConfig.device.disabled;
  renderCommonEnvironmentConfigRows();
});
if ($('#addConfigBtn')) $('#addConfigBtn').addEventListener('click', openRiskTgidConfigDialog);
if ($('#toggleRiskTgidBtn')) $('#toggleRiskTgidBtn').addEventListener('click', () => {
  riskTgidConfig.disabled = !riskTgidConfig.disabled;
  renderRiskTgidConfigRow();
});
if ($('#configSearchBtn')) $('#configSearchBtn').addEventListener('click', () => {
  const systemKeyword = $('#configSystemFilter').value.trim().toLowerCase();
  const titleKeyword = $('#configTitleFilter').value.trim().toLowerCase();
  $$('[data-config-row]').forEach(row => {
    const matchesSystem = (row.dataset.configSystem || '').toLowerCase().includes(systemKeyword);
    const matchesTitle = (row.dataset.configTitle || '').toLowerCase().includes(titleKeyword);
    row.classList.toggle('hidden', !matchesSystem || !matchesTitle);
  });
});
if ($('#refreshConfigBtn')) $('#refreshConfigBtn').addEventListener('click', () => {
  $('#configSystemFilter').value = '';
  $('#configTitleFilter').value = '';
  $$('[data-config-row]').forEach(row => row.classList.remove('hidden'));
  renderRiskTgidConfigRow();
  renderCommonEnvironmentConfigRows();
});
if ($('#batchVerifyBtn')) $('#batchVerifyBtn').addEventListener('click', () => {
  openBatchVerifyDialog($$('.account-select:checked').map(input => input.dataset.selectUser));
});
if ($('#selectAllAccounts')) $('#selectAllAccounts').addEventListener('change', event => {
  $$('.account-select').forEach(input => { input.checked = event.target.checked; });
  updateAccountSelectionState();
});
if ($('#pendingSearchBtn')) $('#pendingSearchBtn').addEventListener('click', () => {
  renderFilteredPending();
});
if ($('#pendingScoreTierToggle')) $('#pendingScoreTierToggle').addEventListener('click', event => {
  event.stopPropagation();
  const menu = $('#pendingScoreTierMenu');
  const willOpen = menu.classList.contains('hidden');
  menu.classList.toggle('hidden', !willOpen);
  $('#pendingScoreTierToggle').setAttribute('aria-expanded', String(willOpen));
});
if ($('#pendingScoreTierMenu')) $('#pendingScoreTierMenu').addEventListener('click', event => event.stopPropagation());
$$('.score-tier-option').forEach(input => input.addEventListener('change', updateScoreTierSummary));
$$('[data-risk-quick]').forEach(button => button.addEventListener('click', () => {
  activeRiskQuickFilter = button.dataset.riskQuick;
  $$('[data-risk-quick]').forEach(item => item.classList.toggle('active', item === button));
  clearScoreTiers();
  $('#pendingUserFilter').value = '';
  $('#pendingConditionFilter').value = '';
  $('#pendingVerificationStatus').value = 'all';
  $('#pendingScoreTierMenu').classList.add('hidden');
  $('#pendingScoreTierToggle').setAttribute('aria-expanded', 'false');
  renderFilteredPending();
  $('.table-wrap').scrollIntoView({ block: 'nearest' });
}));
document.addEventListener('click', () => {
  if (!$('#pendingScoreTierMenu')) return;
  $('#pendingScoreTierMenu').classList.add('hidden');
  $('#pendingScoreTierToggle').setAttribute('aria-expanded', 'false');
});
if ($('#pendingUserType')) $('#pendingUserType').addEventListener('change', () => {
  const placeholders = { memberId: '输入会员ID', user: '输入会员账号', ip: '请输入关联IP', device: '请输入关联设备号' };
  $('#pendingUserFilter').value = '';
  $('#pendingUserFilter').placeholder = placeholders[$('#pendingUserType').value];
});
if ($('#pendingResetBtn')) $('#pendingResetBtn').addEventListener('click', () => {
  activeRiskQuickFilter = null;
  $$('[data-risk-quick]').forEach(button => button.classList.remove('active'));
  $('#pendingUserType').value = 'memberId';
  $('#pendingUserFilter').value = '';
  $('#pendingUserFilter').placeholder = '输入会员ID';
  $('#pendingConditionFilter').value = '';
  setLowScoreTiers();
  $('#pendingVerificationStatus').value = 'all';
  renderFilteredPending();
});
if ($('#loginAlertSearchType')) $('#loginAlertSearchType').addEventListener('change', () => {
  const placeholders = { memberId: '输入会员ID', user: '输入会员账号', ip: '输入登录IP', device: '输入登录设备号' };
  $('#loginAlertKeyword').value = '';
  $('#loginAlertKeyword').placeholder = placeholders[$('#loginAlertSearchType').value];
});
if ($('#loginAlertSearchBtn')) $('#loginAlertSearchBtn').addEventListener('click', renderFilteredLoginAlerts);
if ($('#loginAlertBatchVerifyBtn')) $('#loginAlertBatchVerifyBtn').addEventListener('click', () => openLoginAlertBatchVerifyDialog($$('.login-alert-select:checked').map(input => input.dataset.alertId)));
if ($('#riskIpListBtn')) $('#riskIpListBtn').addEventListener('click', () => openRiskListDialog('ip'));
if ($('#riskDeviceListBtn')) $('#riskDeviceListBtn').addEventListener('click', () => openRiskListDialog('device'));
if ($('#selectAllLoginAlerts')) $('#selectAllLoginAlerts').addEventListener('change', event => {
  $$('.login-alert-select').forEach(input => { input.checked = event.target.checked; });
  updateLoginAlertSelectionState();
});
if ($('#loginAlertResetBtn')) $('#loginAlertResetBtn').addEventListener('click', () => {
  $('#loginAlertSearchType').value = 'memberId';
  $('#loginAlertKeyword').value = '';
  $('#loginAlertKeyword').placeholder = '输入会员ID';
  $('#loginAlertScoreTier').value = 'all';
  $('#loginAlertStatus').value = 'all';
  renderLoginAlerts();
});
if ($('#scoreRecordSearchType')) $('#scoreRecordSearchType').addEventListener('change', () => {
  const placeholders = { memberId: '输入会员ID', user: '输入会员账号', ip: '输入登录IP', device: '输入登录设备号' };
  $('#scoreRecordKeyword').value = '';
  $('#scoreRecordKeyword').placeholder = placeholders[$('#scoreRecordSearchType').value];
});
if ($('#scoreRecordSearchBtn')) $('#scoreRecordSearchBtn').addEventListener('click', renderFilteredScoreRecords);
if ($('#scoreRecordResetBtn')) $('#scoreRecordResetBtn').addEventListener('click', () => {
  $('#scoreRecordSearchType').value = 'memberId';
  $('#scoreRecordKeyword').value = '';
  $('#scoreRecordKeyword').placeholder = '输入会员ID';
  $('#scoreRecordTier').value = 'all';
  $('#scoreRecordStatus').value = 'all';
  $('#scoreRecordLoginDate').value = '';
  renderScoreRecords();
});
if ($('#dialogMask')) $('#dialogMask').addEventListener('click', event => { if (event.target === $('#dialogMask')) closeDialog(); });

if ($('#ruleTableBody')) { syncRulesFromConfig(); renderRules(); }
if ($('#bandGrid')) renderBands();
if ($('#pendingTableBody')) { updateRiskQuickCounts(); updateScoreTierSummary(); renderFilteredPending(); }
if ($('#loginAlertTableBody')) renderLoginAlerts();
if ($('#riskIpListCount')) $('#riskIpListCount').textContent = riskIpRows.length;
if ($('#riskDeviceListCount')) $('#riskDeviceListCount').textContent = riskDeviceRows.length;
if ($('#scoreRecordTableBody')) renderScoreRecords();
if ($('#riskTgidBaseValue')) renderRiskTgidConfigRow();
if ($('#commonIpBaseValue')) renderCommonEnvironmentConfigRows();
if ($('#scoreOrb')) updateScoreUI();
