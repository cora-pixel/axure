const rules = [
  { id: 'S01', category: '常规环境', condition: '当前IP不属于会员常用IP', score: '-5', mode: '命中即扣分', desc: 'IP变化频繁，仅作为轻度风险信号', enabled: true },
  { id: 'S02', category: '常规环境', condition: '当前IP归属城市不属于会员常用城市', score: '-10', mode: '命中即扣分', desc: '城市与IP分别判断', enabled: true },
  { id: 'S03', category: '设备环境', condition: '当前设备号不属于会员常用设备号', score: '-25', mode: '命中即扣分', desc: 'H5清除站点数据后设备号可能变化', enabled: true },
  { id: 'S04', category: '设备环境', condition: '当前设备信息无法匹配会员历史设备信息', score: '-25', mode: '命中即扣分', desc: '设备信息作为设备环境辅助依据', enabled: true },
  { id: 'S05', category: '版本异常', condition: 'Web号缺失或不是当前最新打包版本', score: '-5', mode: '命中即扣分', desc: 'Web号为前端打包时间，不作为设备身份', enabled: true },
  { id: 'S06', category: '风险关联', condition: '当前IP命中风险IP名单', score: '-45', mode: '命中即扣分', desc: '关联账号数量仅在风险详情展示，不影响扣分', enabled: true },
  { id: 'S07', category: '风险关联', condition: '当前设备命中风险设备名单', score: '-45', mode: '命中即扣分', desc: '关联账号数量仅在风险详情展示，不影响扣分', enabled: true },
];

const scoringConfig = {
  ipScore: 5,
  cityScore: 10,
  deviceIdScore: 25,
  deviceInfoScore: 25,
  webVersionScore: 5,
  riskIpScore: 45,
  riskDeviceScore: 45,
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

const riskAssociationConfig = {
  ip: { days: 30, accounts: 90, disabled: false },
  device: { days: 30, accounts: 90, disabled: false },
};

const bands = [
  { range: '80至100', action: '正常放行', className: 'healthy', detail: '正常登录，不弹出验证；后台记录环境与分数。' },
  { range: '60至79', action: '预警观察', className: 'watch', detail: '不打扰用户；后台保留该次登录评分并继续观察后续登录。' },
  { range: '40至59', action: '单项验证', className: 'single', detail: '从可用方式中任选1项；成功后更新常用环境并恢复100分。' },
  { range: '20至39', action: '双项验证', className: 'double', detail: '完成2种不同验证；可用方式不足2项时转人工。' },
  { range: '0至19', action: '手动冻结', className: 'block', detail: '进入待验证名单，由运营核实后手动冻结。' },
];

const pendingRows = [
  {
    memberId: '2795074', user: 'hxm001@as', score: 0, action: '手动冻结', scoreCondition: 'IP不在常用IP中；设备无法证明为常用；长期风险设备关联51-100人（设备号：Win10-Chrome-RISK51Hxm8K2p）', reason: '陌生IP＋有效陌生设备；命中长期风险设备51至100人', ip: '103.88.14.26', currentDeviceId: 'Win10-Chrome-RISK51Hxm8K2p', device: '有效陌生设备', status: '验证失败', freezeStatus: '冻结', source: '系统评分', time: '2026-11-17 09:46', note: '高风险设备关联，已引导联系客服', operator: '系统', riskIps: [{ value: '45.76.188.92', accounts: 9 }], riskDevices: [{ value: 'Win10-Chrome-RISK51Hxm8K2p', accounts: 68 }],
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
      { time: '2026-11-17 09:46', type: '低分告警更新', ip: '103.88.14.26', device: 'Win10-Chrome-RISK51Hxm8K2p', rule: 'R03 -45；R06 -65', loginScore: 0, alertScore: 0, result: '手动冻结' },
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
      { time: '2026-11-17 08:20', type: '低分告警生成', ip: '139.162.60.207', device: 'Win10-Chrome-95T0XYr9BIOdkdF4a29J', rule: 'R03 -45；R05 -45', loginScore: 10, alertScore: 10, result: '手动冻结' },
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
  { id: 'LA202611190006', memberId: '2795074', user: 'hxm001@as', time: '2026-11-19 15:46', ip: '139.162.60.207', device: 'Win10-Chrome-RISK51Hxm8K2p', score: 10, condition: '命中风险IP；命中风险设备', control: '手动冻结', status: '待处理', breakdown: [['S06 风险IP', '30天内关联126个账号', '-45'], ['S07 风险设备', '30天内关联118个账号', '-45']] },
  { id: 'LA202611190021', memberId: '2795074', user: 'hxm001@as', time: '2026-11-19 15:40', ip: '45.76.188.92', device: 'Win10-Chrome-RISK51Hxm8K2p', riskIp: true, riskDevice: true, score: 10, condition: '命中风险IP；命中风险设备', control: '手动冻结', status: '验证失败', note: '同一会员再次触发风险登录，保留告警', breakdown: [['S06 风险IP', '30天内关联96个账号', '-45'], ['S07 风险设备', '30天内关联118个账号', '-45']] },
  { id: 'LA202611190005', memberId: '2826222', user: 'yongson005', time: '2026-11-19 15:18', ip: '202.55.225.254', device: 'Android-Chrome-NEW2Xc9', score: 50, condition: '设备号不常用；设备信息不匹配', control: '单项验证', status: '验证失败', note: '用户反馈更换新手机，等待再次核实', breakdown: [['S03 设备号', '设备号不属于常用设备', '-25'], ['S04 设备信息', '设备信息无法匹配历史设备', '-25']] },
  { id: 'LA202611190004', memberId: '2826202', user: 'cora888@as', time: '2026-11-19 14:52', ip: '47.76.91.34', device: '未获取', score: 30, condition: 'IP、城市、设备号、设备信息均不常用；Web号非最新', control: '双项验证', status: '待处理', breakdown: [['S01 IP', 'IP不常用', '-5'], ['S02 城市', '城市不常用', '-10'], ['S03 设备号', '未获取设备号', '-25'], ['S04 设备信息', '设备信息不匹配', '-25'], ['S05 Web号', 'Web号非最新', '-5']] },
  { id: 'LA202611190003', memberId: '2827301', user: 'mika007@as', time: '2026-11-19 14:20', ip: '45.76.188.92', device: 'Android-Chrome-L2mQ8vP7sN4', score: 55, condition: '命中风险IP', control: '单项验证', status: '待处理', breakdown: [['S06 风险IP', '30天内关联96个账号', '-45']] },
  { id: 'LA202611190002', memberId: '2861015', user: 'riskdev015@h8', time: '2026-11-19 14:05', ip: '103.27.15.15', device: 'Android-Chrome-RISK15', score: 55, condition: '命中风险设备', control: '单项验证', status: '待处理', breakdown: [['S07 风险设备', '30天内关联94个账号', '-45']] },
  { id: 'LA202611190001', memberId: '2861014', user: 'travelweb014@h8', time: '2026-11-19 13:50', ip: '203.0.113.14', device: 'Web-H5-RESET14', score: 55, condition: 'IP不常用；城市不常用；设备号不常用；Web号缺失', control: '单项验证', status: '待处理', breakdown: [['S01 IP', 'IP不常用', '-5'], ['S02 城市', '城市不常用', '-10'], ['S03 设备号', '清除H5数据后设备号变化', '-25'], ['S05 Web号', '未传Web号', '-5']] },
];

const loginRiskMarkers = {
  LA202611190006: { riskIp: true, riskDevice: true },
  LA202611190005: { riskIp: false, riskDevice: false },
  LA202611190004: { riskIp: false, riskDevice: false },
  LA202611190003: { riskIp: true, riskDevice: false },
  LA202611190002: { riskIp: false, riskDevice: true },
  LA202611190001: { riskIp: false, riskDevice: false },
};
loginAlertRows.forEach(row => Object.assign(row, loginRiskMarkers[row.id]));

const loginScoreRows = [
  { id: 'SR202611190020', memberId: '2861020', user: 'normal020@h8', time: '2026-11-19 16:20', ip: '118.31.22.20', device: 'iOS-Safari-NORMAL20', riskIp: false, riskDevice: false, score: 100, condition: '无扣分条件', control: '正常记录', disposition: '无需处置', note: '--', alerted: false, breakdown: [] },
  { id: 'SR202611190019', memberId: '2861019', user: 'ipchange019@h8', time: '2026-11-19 16:05', ip: '118.31.22.19', device: 'iOS-Safari-NORMAL19', riskIp: false, riskDevice: false, score: 95, condition: 'IP不常用', control: '正常记录', disposition: '无需处置', note: '--', alerted: false, breakdown: [['S01 IP', '当前IP不属于常用IP', '-5']] },
  { id: 'SR202611190018', memberId: '2861018', user: 'citychange018@h8', time: '2026-11-19 15:50', ip: '47.91.18.18', device: 'Win10-Chrome-NORMAL18', riskIp: false, riskDevice: false, score: 90, condition: '城市不常用', control: '正常记录', disposition: '无需处置', note: '--', alerted: false, breakdown: [['S02 城市', 'IP归属城市不属于常用城市', '-10']] },
  { id: 'SR202611190017', memberId: '2861017', user: 'webold017@h8', time: '2026-11-19 15:35', ip: '139.162.17.17', device: 'Android-Chrome-NORMAL17', riskIp: false, riskDevice: false, score: 95, condition: 'Web号不是最新版本', control: '正常记录', disposition: '无需处置', note: '建议刷新登录页获取最新版本', alerted: false, breakdown: [['S05 Web号', 'Web号不是当前最新打包版本', '-5']] },
  { id: 'SR202611190016', memberId: '2861016', user: 'h5clear016@h8', time: '2026-11-19 15:20', ip: '118.31.22.16', device: 'Web-H5-RESET16', riskIp: false, riskDevice: false, score: 70, condition: 'IP不常用；清除H5数据后设备号变化', control: '正常记录', disposition: '无需处置', note: '同城且设备信息匹配，Web号为最新', alerted: false, breakdown: [['S01 IP', '当前IP不属于常用IP', '-5'], ['S03 设备号', '清除H5数据后设备号变化', '-25']] },
  { id: 'SR202611190015', memberId: '2861115', user: 'travel015@h8', time: '2026-11-19 15:05', ip: '203.0.113.15', device: 'Web-H5-RESET15', riskIp: false, riskDevice: false, score: 60, condition: 'IP不常用；城市不常用；清除H5数据后设备号变化', control: '预警观察', disposition: '无需处置', note: '出差场景；设备信息匹配且Web号为最新', alerted: false, breakdown: [['S01 IP', '当前IP不属于常用IP', '-5'], ['S02 城市', 'IP归属城市不属于常用城市', '-10'], ['S03 设备号', '清除H5数据后设备号变化', '-25']] },
  { id: 'SR202611190014', memberId: '2861014', user: 'newdevice014@h8', time: '2026-11-19 14:50', ip: '118.31.22.14', device: 'Android-Chrome-NEW14', riskIp: false, riskDevice: false, score: 50, condition: '设备号不常用；设备信息不匹配', control: '单项验证', disposition: '验证通过', note: '核验为本人更换新手机', alerted: true, breakdown: [['S03 设备号', '设备号不属于常用设备', '-25'], ['S04 设备信息', '设备信息无法匹配历史设备', '-25']] },
  { id: 'SR202611190013', memberId: '2861013', user: 'unknown013@h8', time: '2026-11-19 14:35', ip: '203.0.113.13', device: '未获取', riskIp: false, riskDevice: false, score: 30, condition: 'IP、城市、设备号、设备信息均不常用；Web号缺失', control: '双项验证', disposition: '待验证', note: '--', alerted: true, breakdown: [['S01 IP', 'IP不常用', '-5'], ['S02 城市', '城市不常用', '-10'], ['S03 设备号', '未获取有效设备号', '-25'], ['S04 设备信息', '设备信息无法匹配', '-25'], ['S05 Web号', 'Web号缺失', '-5']] },
  { id: 'SR202611190012', memberId: '2827301', user: 'mika007@as', time: '2026-11-19 14:20', ip: '45.76.188.92', device: 'Android-Chrome-L2mQ8vP7sN4', riskIp: true, riskDevice: false, score: 55, condition: '命中风险IP', control: '单项验证', disposition: '待验证', note: '--', alerted: true, breakdown: [['S06 风险IP', '30天内关联96个账号', '-45']] },
  { id: 'SR202611190011', memberId: '2861015', user: 'riskdev015@h8', time: '2026-11-19 14:05', ip: '103.27.15.15', device: 'Android-Chrome-RISK15', riskIp: false, riskDevice: true, score: 55, condition: '命中风险设备', control: '单项验证', disposition: '待验证', note: '--', alerted: true, breakdown: [['S07 风险设备', '30天内关联94个账号', '-45']] },
  { id: 'SR202611190010', memberId: '2795074', user: 'hxm001@as', time: '2026-11-19 13:50', ip: '139.162.60.207', device: 'Win10-Chrome-RISK51Hxm8K2p', riskIp: true, riskDevice: true, score: 10, condition: '命中风险IP；命中风险设备', control: '手动冻结', disposition: '验证失败', note: '核验为异常登录，保留告警', alerted: true, breakdown: [['S06 风险IP', '30天内关联126个账号', '-45'], ['S07 风险设备', '30天内关联118个账号', '-45']] },
  { id: 'SR202611190009', memberId: '2861009', user: 'riskcity009@h8', time: '2026-11-19 13:35', ip: '139.162.60.207', device: 'iOS-Safari-NORMAL09', riskIp: true, riskDevice: false, score: 45, condition: '命中风险IP；城市不常用', control: '单项验证', disposition: '验证通过', note: '身份核验通过，告警已关闭', alerted: true, breakdown: [['S06 风险IP', '30天内关联126个账号', '-45'], ['S02 城市', 'IP归属城市不属于常用城市', '-10']] },
  { id: 'SR202611190008', memberId: '2861008', user: 'newweb008@h8', time: '2026-11-19 13:20', ip: '118.31.22.8', device: 'Android-Chrome-NEW08', riskIp: false, riskDevice: false, score: 45, condition: '设备号不常用；设备信息不匹配；Web号非最新', control: '单项验证', disposition: '验证失败', note: '验证失败，未更新常用设备', alerted: true, breakdown: [['S03 设备号', '设备号不属于常用设备', '-25'], ['S04 设备信息', '设备信息无法匹配历史设备', '-25'], ['S05 Web号', 'Web号非最新', '-5']] },
  { id: 'SR202611190007', memberId: '2861007', user: 'risknew007@h8', time: '2026-11-19 13:05', ip: '45.76.188.92', device: 'Android-Chrome-NEW07', riskIp: true, riskDevice: false, score: 5, condition: '命中风险IP；设备号不常用；设备信息不匹配', control: '手动冻结', disposition: '待验证', note: '--', alerted: true, breakdown: [['S06 风险IP', '30天内关联96个账号', '-45'], ['S03 设备号', '设备号不属于常用设备', '-25'], ['S04 设备信息', '设备信息无法匹配历史设备', '-25']] },
  { id: 'SR202611190006', memberId: '2861006', user: 'riskdevcity006@h8', time: '2026-11-19 12:50', ip: '198.51.100.6', device: 'Win10-Chrome-RISK51Hxm8K2p', riskIp: false, riskDevice: true, score: 45, condition: '命中风险设备；城市不常用', control: '单项验证', disposition: '验证通过', note: '身份核验通过，告警已关闭', alerted: true, breakdown: [['S07 风险设备', '30天内关联118个账号', '-45'], ['S02 城市', 'IP归属城市不属于常用城市', '-10']] },
  { id: 'SR202611190005', memberId: '2827144', user: 'evan001@h8', time: '2026-11-19 12:35', ip: '139.162.60.207', device: 'Win10-Chrome-95T0XYr9BIOdkdF4a29J', riskIp: false, riskDevice: false, score: 100, condition: '无扣分条件', control: '正常记录', disposition: '验证通过', note: '上次告警验证通过，本次环境已纳入常用', alerted: false, breakdown: [] },
  { id: 'SR202611190004', memberId: '2861004', user: 'travelweb004@h8', time: '2026-11-19 12:20', ip: '203.0.113.4', device: 'Web-H5-RESET04', riskIp: false, riskDevice: false, score: 55, condition: 'IP不常用；城市不常用；设备号不常用；Web号缺失', control: '单项验证', disposition: '待验证', note: '--', alerted: true, breakdown: [['S01 IP', 'IP不常用', '-5'], ['S02 城市', '城市不常用', '-10'], ['S03 设备号', '清除H5数据后设备号变化', '-25'], ['S05 Web号', '未传Web号', '-5']] },
  { id: 'SR202611190003', memberId: '2861003', user: 'ipdevice003@h8', time: '2026-11-19 12:05', ip: '203.0.113.3', device: 'Web-H5-RESET03', riskIp: false, riskDevice: false, score: 70, condition: 'IP不常用；设备号不常用', control: '正常记录', disposition: '无需处置', note: '同城且设备信息匹配', alerted: false, breakdown: [['S01 IP', 'IP不常用', '-5'], ['S03 设备号', '设备号不常用', '-25']] },
  { id: 'SR202611190002', memberId: '2861002', user: 'deviceinfo002@h8', time: '2026-11-19 11:50', ip: '118.31.22.2', device: 'Win10-Chrome-DEVICE02', riskIp: false, riskDevice: false, score: 75, condition: '设备信息不匹配', control: '正常记录', disposition: '无需处置', note: '--', alerted: false, breakdown: [['S04 设备信息', '设备信息无法匹配历史设备', '-25']] },
  { id: 'SR202611190021', memberId: '2795074', user: 'hxm001@as', time: '2026-11-19 15:40', ip: '45.76.188.92', device: 'Win10-Chrome-RISK51Hxm8K2p', riskIp: true, riskDevice: true, score: 10, condition: '命中风险IP；命中风险设备', control: '手动冻结', disposition: '验证失败', note: '同一会员再次触发风险登录，保留告警', alerted: true, breakdown: [['S06 风险IP', '30天内关联96个账号', '-45'], ['S07 风险设备', '30天内关联118个账号', '-45']] },
];

const riskIpRows = [
  { value: '139.162.60.207', accounts: 126, healthy: 123, alerts: 3, logins: 486, tier: '达到30天90账号门槛', first: '2026-10-22 08:12', last: '2026-11-19 13:35', members: [['2861009', 'riskcity009@h8', 45, '告警'], ['2827144', 'evan001@h8', 100, '健康'], ['2862302', 'healthy302@h8', 90, '健康']] },
  { value: '45.76.188.92', accounts: 96, healthy: 93, alerts: 3, logins: 274, tier: '达到30天90账号门槛', first: '2026-10-28 03:40', last: '2026-11-19 14:20', members: [['2861007', 'risknew007@h8', 5, '告警'], ['2827301', 'mika007@as', 55, '告警'], ['2862401', 'healthy401@as', 100, '健康']] },
];

const riskDeviceRows = [
  { value: 'Win10-Chrome-RISK51Hxm8K2p', accounts: 118, healthy: 115, alerts: 3, logins: 412, tier: '达到30天90账号门槛', first: '2026-10-23 22:18', last: '2026-11-19 15:46', members: [['2795074', 'hxm001@as', 10, '告警'], ['2861006', 'riskdevcity006@h8', 45, '告警'], ['2862501', 'healthy501@as', 100, '健康']] },
  { value: 'Android-Chrome-RISK15', accounts: 94, healthy: 92, alerts: 2, logins: 215, tier: '达到30天90账号门槛', first: '2026-10-30 14:20', last: '2026-11-19 14:05', members: [['2861011', 'riskdev011@h8', 55, '告警'], ['2862601', 'healthy601@as', 90, '健康'], ['2862602', 'healthy602@as', 100, '健康']] },
];

function isRiskEntityValue(type, value) {
  const rows = type === 'ip' ? riskIpRows : riskDeviceRows;
  return rows.some(item => item.value === value);
}

function loginEnvironmentProfile(row) {
  const cityMap = [
    ['139.162.', '上海市'], ['45.76.', '新加坡'], ['202.55.', '马尼拉市'],
    ['47.76.', '杭州市'], ['203.0.113.', '深圳市'], ['118.31.', '杭州市'],
    ['103.27.', '广州市'], ['103.88.', '曼谷市'], ['198.51.100.', '北京市'],
  ];
  const city = cityMap.find(item => row.ip.startsWith(item[0]))?.[1] || '未知';
  const commonCities = row.condition.includes('城市不常用') ? '上海市、杭州市' : city;
  const deviceInfo = row.device === '未获取'
    ? '未获取'
    : row.device.includes('iOS')
      ? 'iOS 18 / Safari / H5'
      : row.device.includes('Android')
        ? 'Android 15 / Chrome 130 / H5'
        : row.device.includes('Web-H5')
          ? 'Windows 11 / Chrome 130 / H5'
          : 'Windows 10 / Chrome 130 / PC';
  const buildVersion = row.condition.includes('Web号缺失')
    ? '未获取'
    : row.condition.includes('Web号非最新') || row.condition.includes('不是最新')
      ? '2026.11.18.2210（非最新）'
      : '2026.11.19.1540（最新）';
  return { city, commonCities, deviceInfo, buildVersion };
}

function renderLoginEnvironmentRows(row, actionLabel) {
  const environment = loginEnvironmentProfile(row);
  return `<tr><td>登录IP</td><td class="${isRiskEntityValue('ip', row.ip) ? 'risk-detail-value' : ''}">${row.ip}</td><td>登录设备</td><td class="device-value ${isRiskEntityValue('device', row.device) ? 'risk-detail-value' : ''}">${row.device}</td></tr>
    <tr><td>登录城市</td><td>${environment.city}</td><td>常用城市</td><td>${environment.commonCities}</td></tr>
    <tr><td>设备信息</td><td>${environment.deviceInfo}</td><td>构建版本</td><td>${environment.buildVersion}</td></tr>
    <tr><td>${actionLabel}</td><td>${row.control}</td><td>扣分判断条件</td><td>${row.condition}</td></tr>
    <tr><td>备注</td><td colspan="3">${row.note || '--'}</td></tr>`;
}

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
  return '手动冻结';
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
      setFrontState('手动冻结', '验证失败次数已达到上限');
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
  setFrontState('手动冻结', reason);
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
    <tr><td><input type="checkbox" class="login-alert-select" data-alert-id="${row.id}" aria-label="选择${row.user}的登录告警"></td><td>${row.memberId}</td><td>${row.user}</td><td>${formatLoginTime(row.time)}</td><td class="${isRiskEntityValue('ip', row.ip) ? 'risk-login-value' : ''}">${row.ip}</td><td class="device-value ${isRiskEntityValue('device', row.device) ? 'risk-login-value' : ''}">${row.device}</td><td class="score-text ${scoreClass(row.score)}">${row.score}</td><td class="score-condition">${row.condition}</td><td>${row.control}</td><td class="record-note">${row.note || '--'}</td><td><span class="alert-record-status ${row.status === '验证失败' ? 'failed' : row.status === '验证通过' ? 'closed' : 'pending'}">${row.status}</span></td><td><button class="table-link" data-login-alert-detail="${row.id}">评分明细</button><button class="table-link" data-login-alert-verify="${row.id}">手动验证</button></td></tr>`).join('');
  if (!sortedRows.length) $('#loginAlertTableBody').innerHTML = '<tr><td colspan="12" class="empty-table-cell">暂无数据</td></tr>';
  $('#loginAlertTotal').textContent = sortedRows.length;
  const alertCount = loginAlertRows.length;
  if ($('#loginAlertTabBadge')) {
    $('#loginAlertTabBadge').textContent = alertCount;
    $('#loginAlertTabBadge').hidden = alertCount === 0;
  }
  if ($('#accountAlertBadge')) {
    $('#accountAlertBadge').textContent = alertCount;
    $('#accountAlertBadge').hidden = alertCount === 0;
  }
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

function renderBreakdownRule(record, ruleName) {
  const environment = loginEnvironmentProfile(record);
  const currentValues = {
    S01: record.ip,
    S02: environment.city,
    S03: record.device,
    S04: environment.deviceInfo,
    S05: environment.buildVersion,
    S06: record.ip,
    S07: record.device,
  };
  const ruleId = ruleName.split(' ')[0];
  const currentValue = currentValues[ruleId];
  if (!currentValue) return ruleName;
  if (ruleName.includes('风险IP')) {
    return `${ruleName}：<strong class="breakdown-risk-value">${record.ip}</strong>`;
  }
  if (ruleName.includes('风险设备')) {
    return `${ruleName}：<strong class="breakdown-risk-value">${record.device}</strong>`;
  }
  return `${ruleName}：<strong class="breakdown-current-value">${currentValue}</strong>`;
}

function openLoginAlertDetail(alertId) {
  const alert = loginAlertRows.find(item => item.id === alertId);
  const breakdownRows = alert.breakdown.map((item, index) => `<tr><td>${index + 1}</td><td>${renderBreakdownRule(alert, item[0])}</td><td>${item[1]}</td><td>${item[2]}</td></tr>`).join('');
  openDialog('登录评分告警明细', `
    <div class="detail-summary login-alert-summary"><div><span>会员ID／账号</span><strong>${alert.memberId}／${alert.user}</strong></div><div><span>登录时间</span><strong>${formatLoginTime(alert.time)}</strong></div><div><span>本次评分</span><strong class="${scoreClass(alert.score)}">${alert.score}</strong></div><div><span>处置状态</span><strong class="alert-record-status ${alert.status === '验证失败' ? 'failed' : alert.status === '验证通过' ? 'closed' : 'pending'}">${alert.status}</strong></div></div>
    <div class="detail-section"><h3>本次登录环境</h3><table class="mini-table"><tbody>${renderLoginEnvironmentRows(alert, '控制结果')}</tbody></table></div>
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
    <tr><td>${['待验证', '验证失败', '验证通过'].includes(row.disposition) ? `<input type="checkbox" class="score-record-select" data-record-id="${row.id}" aria-label="选择${row.user}的评分记录">` : ''}</td><td>${row.memberId}</td><td>${row.user}</td><td>${formatLoginTime(row.time)}</td><td class="${isRiskEntityValue('ip', row.ip) ? 'risk-login-value' : ''}">${row.ip}</td><td class="device-value ${isRiskEntityValue('device', row.device) ? 'risk-login-value' : ''}">${row.device}</td><td class="score-text ${scoreClass(row.score)}">${row.score}</td><td class="score-condition">${row.condition}</td><td>${row.control}</td><td><span class="alert-record-status ${row.disposition === '验证失败' ? 'failed' : row.disposition === '待验证' ? 'pending' : 'closed'}">${row.disposition === '无需处置' ? '正常' : row.disposition}</span></td><td class="record-note">${row.note || '--'}</td><td><button class="table-link" data-score-record-detail="${row.id}">评分明细</button>${['待验证', '验证失败', '验证通过'].includes(row.disposition) ? `<button class="table-link" data-score-record-verify="${row.id}">手动验证</button>` : ''}</td></tr>`).join('');
  if (!sortedRows.length) $('#scoreRecordTableBody').innerHTML = '<tr><td colspan="12" class="empty-table-cell">暂无数据</td></tr>';
  $('#scoreRecordTotal').textContent = sortedRows.length;
  $$('[data-score-record-detail]').forEach(button => button.addEventListener('click', () => openScoreRecordDetail(button.dataset.scoreRecordDetail)));
  $$('[data-score-record-verify]').forEach(button => button.addEventListener('click', () => openScoreRecordVerifyDialog(button.dataset.scoreRecordVerify)));
  if ($('#selectAllScoreRecords')) {
    $('#selectAllScoreRecords').checked = false;
    $('#selectAllScoreRecords').indeterminate = false;
  }
  $$('.score-record-select').forEach(input => input.addEventListener('change', updateScoreRecordSelectionState));
}

function updateScoreRecordSelectionState() {
  const visible = $$('.score-record-select');
  const checked = visible.filter(input => input.checked);
  if (!$('#selectAllScoreRecords')) return;
  $('#selectAllScoreRecords').checked = visible.length > 0 && checked.length === visible.length;
  $('#selectAllScoreRecords').indeterminate = checked.length > 0 && checked.length < visible.length;
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
    ? record.breakdown.map((item, index) => `<tr><td>${index + 1}</td><td>${renderBreakdownRule(record, item[0])}</td><td>${item[1]}</td><td>${item[2]}</td></tr>`).join('')
    : '<tr><td colspan="4">本次登录未命中扣分规则</td></tr>';
  openDialog('登录评分明细', `
    <div class="detail-summary login-alert-summary"><div><span>会员ID／账号</span><strong>${record.memberId}／${record.user}</strong></div><div><span>登录时间</span><strong>${formatLoginTime(record.time)}</strong></div><div><span>本次评分</span><strong class="${scoreClass(record.score)}">${record.score}</strong></div><div><span>状态</span><strong class="alert-record-status ${record.disposition === '验证失败' ? 'failed' : record.disposition === '待验证' ? 'pending' : 'closed'}">${record.disposition === '无需处置' ? '正常' : record.disposition}</strong></div></div>
    <div class="detail-section"><h3>本次登录环境</h3><table class="mini-table"><tbody>${renderLoginEnvironmentRows(record, '建议动作')}</tbody></table></div>
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
    applyScoreRecordVerification(record, result, note);
    closeDialog();
    renderFilteredScoreRecords();
    renderFilteredLoginAlerts();
  });
}

function applyScoreRecordVerification(record, result, note) {
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
}

function openScoreRecordBatchVerifyDialog(recordIds) {
  const records = loginScoreRows.filter(item => recordIds.includes(item.id));
  if (!records.length) {
    openDialog('批量验证', '<p class="config-error">请先在登录评分总表中勾选需要验证的记录。</p><div class="admin-dialog-actions"><button class="admin-btn" data-dialog-cancel>关闭</button></div>');
    $('[data-dialog-cancel]').addEventListener('click', closeDialog);
    return;
  }
  const users = [...new Set(records.map(item => item.user))];
  openDialog('批量验证', `
    <div class="admin-form"><label>会员账号<br><strong class="batch-user-count">共${users.length}个用户</strong></label><textarea disabled>${users.join(',')}</textarea><label>验证结果</label><div class="manual-result-options"><label><input type="radio" name="batchScoreResult" value="验证通过">验证通过</label><label><input type="radio" name="batchScoreResult" value="验证失败">验证失败</label></div><label>备注 <em class="required-mark">*</em></label><textarea id="batchScoreNote" placeholder="请输入本次批量验证说明"></textarea></div>
    <p class="field-help">同一会员账号只展示一次；本次共选择${records.length}条记录，涉及${users.length}个会员账号。验证失败的记录进入或继续保留在告警表；验证通过的记录从告警表移除。</p><p class="config-error" id="batchScoreError"></p>
    <div class="admin-dialog-actions"><button class="admin-btn secondary" data-dialog-cancel>取消</button><button class="admin-btn" data-save-batch-score>确认</button></div>`);
  $('[data-dialog-cancel]').addEventListener('click', closeDialog);
  $('[data-save-batch-score]').addEventListener('click', () => {
    const result = $('input[name="batchScoreResult"]:checked')?.value;
    const note = $('#batchScoreNote').value.trim();
    if (!result || !note) { $('#batchScoreError').textContent = '请选择验证结果并填写备注。'; return; }
    records.forEach(record => applyScoreRecordVerification(record, result, note));
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
  const users = [...new Set(alerts.map(item => item.user))];
  openDialog('批量验证', `
    <div class="admin-form"><label>会员账号<br><strong class="batch-user-count">共${users.length}个用户</strong></label><textarea disabled>${users.join(',')}</textarea><label>验证结果</label><div class="manual-result-options"><label><input type="radio" name="batchAlertResult" value="验证通过">验证通过</label><label><input type="radio" name="batchAlertResult" value="验证失败">验证失败</label></div><label>备注 <em class="required-mark">*</em></label><textarea id="batchAlertNote" placeholder="请输入本次批量验证说明"></textarea></div>
    <p class="field-help">同一会员账号只展示一次；本次共选择${alerts.length}条告警，涉及${users.length}个会员账号。验证失败的记录继续保留在告警表；验证通过的记录从告警表移除。</p><p class="config-error" id="batchAlertError"></p>
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
  const listRows = rows.map(row => `<tr><td class="${isIp ? '' : 'device-value'}">${row.value}</td><td>${row.accounts}个</td><td>${row.last}</td><td>${row.logins}次</td><td><button class="table-link" data-view-risk-records="${type}" data-risk-value="${row.value}">查看</button></td></tr>`).join('');
  openDialog(isIp ? '风险IP名单' : '风险设备名单', `<div class="detail-section"><table class="mini-table"><thead><tr><th>${isIp ? '风险IP' : '风险设备'}</th><th>关联账号</th><th>风控时间</th><th>登录次数</th><th>操作</th></tr></thead><tbody>${listRows}</tbody></table></div><div class="admin-dialog-actions"><button class="admin-btn" data-dialog-cancel>关闭</button></div>`);
  $$('[data-view-risk-records]').forEach(button => button.addEventListener('click', () => {
    closeDialog();
    $('[data-admin-tab="records"]').click();
    $('#scoreRecordSearchType').value = button.dataset.viewRiskRecords;
    $('#scoreRecordKeyword').value = button.dataset.riskValue;
    $('#scoreRecordKeyword').placeholder = button.dataset.viewRiskRecords === 'ip' ? '输入登录IP' : '输入登录设备号';
    $('#scoreRecordTier').value = 'all';
    $('#scoreRecordStatus').value = 'all';
    $('#scoreRecordLoginDate').value = '';
    renderFilteredScoreRecords();
  }));
  $('[data-dialog-cancel]').addEventListener('click', closeDialog);
}

function syncRulesFromConfig() {
  const update = (id, values) => Object.assign(rules.find(rule => rule.id === id), values);
  update('S01', { score: `-${scoringConfig.ipScore}` });
  update('S02', { score: `-${scoringConfig.cityScore}` });
  update('S03', { score: `-${scoringConfig.deviceIdScore}` });
  update('S04', { score: `-${scoringConfig.deviceInfoScore}` });
  update('S05', { score: `-${scoringConfig.webVersionScore}` });
  update('S06', { score: `-${scoringConfig.riskIpScore}` });
  update('S07', { score: `-${scoringConfig.riskDeviceScore}` });
}

function configNumber(key, label = '', suffix = '') {
  return `<label class="config-number">${label ? `<span>${label}</span>` : ''}<input type="number" min="1" step="1" data-config-key="${key}" value="${scoringConfig[key]}">${suffix ? `<em>${suffix}</em>` : ''}</label>`;
}

function openScoringSettingsDialog() {
  const row = (id, title, condition, score) => `<tr><td><strong>${id}</strong><span>${title}</span></td><td><div class="config-fields">${condition}</div></td><td><div class="config-fields">${score}</div></td></tr>`;
  openDialog('规则设置', `
    <p class="config-help">配置固定扣分值。每次登录从100分开始，命中哪项就扣哪项；扣分值无需输入负号。</p>
    <div class="config-table-wrap"><table class="config-table"><thead><tr><th>规则</th><th>触发条件</th><th>扣分值</th></tr></thead><tbody>
      ${row('S01', 'IP不常用', '当前IP不属于会员常用IP', configNumber('ipScore'))}
      ${row('S02', '城市不常用', '当前IP归属城市不属于会员常用城市', configNumber('cityScore'))}
      ${row('S03', '设备号不常用', '当前设备号不属于会员常用设备号', configNumber('deviceIdScore'))}
      ${row('S04', '设备信息不匹配', '当前设备信息无法匹配历史设备信息', configNumber('deviceInfoScore'))}
      ${row('S05', 'Web号异常', 'Web号缺失或不是当前最新打包版本', configNumber('webVersionScore'))}
      ${row('S06', '命中风险IP', '当前IP存在于风险IP名单', configNumber('riskIpScore'))}
      ${row('S07', '命中风险设备', '当前设备存在于风险设备名单', configNumber('riskDeviceScore'))}
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
    if (invalidNumber) {
      $('#configError').textContent = '请填写大于0的整数。';
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

function renderRiskAssociationConfigRows() {
  ['ip', 'device'].forEach(type => {
    const isIp = type === 'ip';
    const prefix = isIp ? 'riskIpRule' : 'riskDeviceRule';
    const config = riskAssociationConfig[type];
    const value = `${config.days},${config.accounts}`;
    if ($(`#${prefix}BaseValue`)) $(`#${prefix}BaseValue`).textContent = value;
    if ($(`#${prefix}DefaultValue`)) $(`#${prefix}DefaultValue`).textContent = value;
    const status = $(`#${prefix}Status`);
    const toggle = $(`#toggle${isIp ? 'RiskIp' : 'RiskDevice'}RuleBtn`);
    if (status) {
      status.textContent = config.disabled ? '禁用' : '启用';
      status.className = config.disabled ? 'status-disabled' : 'status-enabled';
    }
    if (toggle) toggle.textContent = config.disabled ? '设为启用' : '设为禁用';
  });
}

function openRiskAssociationConfigDialog(type) {
  const isIp = type === 'ip';
  const config = riskAssociationConfig[type];
  const targetLabel = isIp ? 'IP' : '设备号';
  const title = isIp ? '风险IP判定配置' : '风险设备判定配置';
  const systemName = isIp ? 'risk_ip_rule' : 'risk_device_rule';
  const example = `例如30,90表示滚动30天内，至少有90个不同会员ID使用同一有效${targetLabel}成功登录后，将该${targetLabel}加入${isIp ? '风险IP' : '风险设备'}名单。`;
  openDialog(`设置配置：${title}`, `
    <div class="config-detail-form">
      <div class="config-detail-label">配置分组：</div><select><option>风险IP／设备配置</option></select>
      <div class="config-detail-label">系统名称：</div><input value="${systemName}" disabled>
      <div class="config-detail-label">配置标题：</div><input value="${title}" disabled>
      <div class="config-detail-label">基础配置：</div><div><input id="riskRuleConfigValue" value="${config.days},${config.accounts}" placeholder="统计天数,关联账号数"><p class="field-help">参数1为统计天数，参数2为去重关联账号数；${example}</p></div>
      <div class="config-detail-label">恒行3配置属性：</div><div class="config-site-field"><input disabled><label><input type="checkbox" checked>继承</label></div>
      <div class="config-detail-label">亚体配置属性：</div><div class="config-site-field"><input disabled><label><input type="checkbox" checked>继承</label></div>
      <div class="config-detail-label">启航配置属性：</div><div class="config-site-field"><input disabled><label><input type="checkbox" checked>继承</label></div>
      <div class="config-detail-label">配置默认值：</div><input value="${config.days},${config.accounts}" disabled>
      <div class="config-detail-label">配置类型：</div><select><option>组合值</option></select>
      <div class="config-detail-label">配置值属性：</div><select><option>整数,整数</option></select>
      <div class="config-detail-label">配置描述：</div><textarea disabled>${example}</textarea>
      <div class="config-detail-label">统计口径：</div><textarea disabled>仅统计成功登录；关联账号数按会员ID去重。同一会员在同一${targetLabel}下重复登录多次只计算1个关联账号。</textarea>
      <div class="config-detail-label">是否禁用：</div><label class="config-disabled-check"><input type="checkbox" id="riskRuleDisabled" ${config.disabled ? 'checked' : ''}>选中禁用</label>
    </div>
    <p class="config-error" id="riskRuleConfigError" aria-live="polite"></p>
    <div class="admin-dialog-actions"><button class="admin-btn" data-save-risk-rule>保存配置</button><button class="admin-btn secondary" data-dialog-cancel>返回列表</button></div>
  `);
  $('#adminDialog').classList.add('config-detail-dialog');
  $('[data-dialog-cancel]').addEventListener('click', closeDialog);
  $('[data-save-risk-rule]').addEventListener('click', () => {
    const value = $('#riskRuleConfigValue').value.trim().replace(/\s+/g, '');
    if (!/^\d+,\d+$/.test(value)) {
      $('#riskRuleConfigError').textContent = '请按“统计天数,关联账号数”填写，并使用英文逗号。';
      return;
    }
    const [days, accounts] = value.split(',').map(Number);
    if (![days, accounts].every(item => Number.isInteger(item) && item > 0)) {
      $('#riskRuleConfigError').textContent = '统计天数和关联账号数均须为大于0的整数。';
      return;
    }
    riskAssociationConfig[type] = { ...riskAssociationConfig[type], days, accounts, disabled: $('#riskRuleDisabled').checked };
    renderRiskAssociationConfigRows();
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
  const breadcrumbTitles = { alerts: '用户登录评分告警报表', records: '用户登录评分告警报表', rules: '用户登录评分告警报表' };
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
if ($('#setRiskIpRuleBtn')) $('#setRiskIpRuleBtn').addEventListener('click', () => openRiskAssociationConfigDialog('ip'));
if ($('#editRiskIpRuleBtn')) $('#editRiskIpRuleBtn').addEventListener('click', () => openRiskAssociationConfigDialog('ip'));
if ($('#setRiskDeviceRuleBtn')) $('#setRiskDeviceRuleBtn').addEventListener('click', () => openRiskAssociationConfigDialog('device'));
if ($('#editRiskDeviceRuleBtn')) $('#editRiskDeviceRuleBtn').addEventListener('click', () => openRiskAssociationConfigDialog('device'));
if ($('#toggleCommonIpBtn')) $('#toggleCommonIpBtn').addEventListener('click', () => {
  commonEnvironmentConfig.ip.disabled = !commonEnvironmentConfig.ip.disabled;
  renderCommonEnvironmentConfigRows();
});
if ($('#toggleCommonDeviceBtn')) $('#toggleCommonDeviceBtn').addEventListener('click', () => {
  commonEnvironmentConfig.device.disabled = !commonEnvironmentConfig.device.disabled;
  renderCommonEnvironmentConfigRows();
});
if ($('#toggleRiskIpRuleBtn')) $('#toggleRiskIpRuleBtn').addEventListener('click', () => {
  riskAssociationConfig.ip.disabled = !riskAssociationConfig.ip.disabled;
  renderRiskAssociationConfigRows();
});
if ($('#toggleRiskDeviceRuleBtn')) $('#toggleRiskDeviceRuleBtn').addEventListener('click', () => {
  riskAssociationConfig.device.disabled = !riskAssociationConfig.device.disabled;
  renderRiskAssociationConfigRows();
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
  renderRiskAssociationConfigRows();
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
if ($('#scoreRecordBatchVerifyBtn')) $('#scoreRecordBatchVerifyBtn').addEventListener('click', () => openScoreRecordBatchVerifyDialog($$('.score-record-select:checked').map(input => input.dataset.recordId)));
if ($('#selectAllScoreRecords')) $('#selectAllScoreRecords').addEventListener('change', event => {
  $$('.score-record-select').forEach(input => { input.checked = event.target.checked; });
  updateScoreRecordSelectionState();
});
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
renderRiskAssociationConfigRows();
if ($('#riskTgidBaseValue')) renderRiskTgidConfigRow();
if ($('#commonIpBaseValue')) renderCommonEnvironmentConfigRows();
if ($('#scoreOrb')) updateScoreUI();
