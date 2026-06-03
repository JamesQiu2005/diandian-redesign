// ============================================================================
// 模拟数据 — 点点 Demo
// 所有数据为虚构。封面图用 picsum.photos（按 id 取种子，保证每次一致）。
// 离线时由 CSS 渐变兜底，不影响版式。
// ============================================================================

const mockNotes = {
  // ===== 兴趣 / 审美驱动 =====
  fashion: [
    { id: 'f001', title: '短发肌肉女的日常穿搭｜慵懒chic不油腻', author: '小可', avatar: '👩‍🦱', likes: 12453, tag: '穿搭', h: 460 },
    { id: 'f002', title: '健身房到街头｜oversize白T的100种穿法', author: 'Mia健身日记', avatar: '💪', likes: 8821, tag: '穿搭', h: 360 },
    { id: 'f003', title: '短发+宽肩 = 高级感天花板', author: 'KIKI', avatar: '✂️', likes: 23106, tag: '穿搭', h: 520 },
    { id: 'f004', title: '日系男友风｜慵懒大男孩穿搭分享', author: '阿岛', avatar: '🏝️', likes: 5621, tag: '穿搭', h: 400 },
    { id: 'f005', title: '复古胶片色调｜如何穿出90年代东京味', author: 'tokyo_film', avatar: '📷', likes: 9874, tag: '穿搭', h: 480 },
  ],
  // ===== 美食 / 腌制（对照现有点点预设问题）=====
  food: [
    { id: 'fd001', title: '腌肉嫩到出水的秘诀｜厨师朋友亲传', author: '吃货阿宁', avatar: '🍖', likes: 18203, tag: '美食', h: 380 },
    { id: 'fd002', title: '广式叉烧腌料配方｜30年老师傅版本', author: '粤食研究所', avatar: '🥢', likes: 7421, tag: '美食', h: 440 },
    { id: 'fd003', title: '韩式烤肉腌料｜在家复刻明洞味道', author: 'Seoul_Eats', avatar: '🇰🇷', likes: 4519, tag: '美食', h: 340 },
  ],
  // ===== 旅行攻略 =====
  travel: [
    { id: 't001', title: '京都5天行程｜避开人潮的本地视角', author: '京都阿姨', avatar: '🏯', likes: 32108, tag: '旅行', h: 500 },
    { id: 't002', title: '上海周末2日｜本地人推荐的小众路线', author: '上海土著', avatar: '🥟', likes: 15623, tag: '旅行', h: 420 },
    { id: 't003', title: '一个人去大阪｜安全感+性价比攻略', author: '独行Lucy', avatar: '🎒', likes: 8901, tag: '旅行', h: 360 },
    { id: 't004', title: '台州M9事故现场｜路过实拍', author: '路人甲', avatar: '🚗', likes: 4231, tag: '资讯', h: 300 },
  ],
  // ===== 数码 / 产品测评 =====
  product: [
    { id: 'p001', title: '油皮亲妈防晒霜｜10款实测排名', author: '油皮研究员', avatar: '🌞', likes: 28934, tag: '美妆', h: 470 },
    { id: 'p002', title: '电子书阅读器 vs 平板｜真实使用1年对比', author: 'Reader_K', avatar: '📚', likes: 12056, tag: '数码', h: 390 },
    { id: 'p003', title: 'i3长轴版车主｜3万公里使用感受', author: '车圈老王', avatar: '🚙', likes: 6781, tag: '汽车', h: 420 },
    { id: 'p004', title: 'PS5方向盘选购指南｜从500到5000', author: '赛车模拟器', avatar: '🏎️', likes: 4523, tag: '游戏', h: 350 },
  ],
  // ===== 其他生活场景 =====
  life: [
    { id: 'l001', title: '从前研发很慢，一周只用干一件事', author: 'K博', avatar: '👨‍💻', likes: 1755, tag: '职场', h: 300 },
    { id: 'l002', title: '当我被问到单身原因时', author: '欧美报刊亭', avatar: '🌸', likes: 3171, tag: '生活', h: 520 },
    { id: 'l003', title: '广州到华发冰雪世界｜2小时车程值得吗', author: '岭南阿明', avatar: '🎿', likes: 892, tag: '生活', h: 380 },
    { id: 'l004', title: '明制汉服穿搭｜日常通勤可行性', author: '汉服日常', avatar: '👘', likes: 5634, tag: '穿搭', h: 450 },
  ],
};

// 扁平索引：id -> note
const noteById = {};
Object.values(mockNotes).forEach((arr) => arr.forEach((n) => (noteById[n.id] = n)));

// 主页瀑布流顺序（混排，制造真实信息流的多样性）
const feedOrder = [
  'f001', 't001', 'p001', 'fd001', 'f003', 'l002',
  'p003', 't002', 'f005', 'p002', 'fd002', 'f002',
  't003', 'l004', 'p004', 'f004', 'l001', 't004',
  'fd003', 'l003',
];
const feedNotes = feedOrder.map((id) => noteById[id]);

// 封面图 URL —— picsum 按 id 取种子，保证稳定；宽度固定、高度随卡片变化
function coverUrl(note) {
  const h = note.h || 400;
  return `https://picsum.photos/seed/${note.id}/600/${h}`;
}

// 离线兜底渐变（按 tag 给不同色相，避免一片灰）
const tagHue = { 穿搭: 348, 美食: 22, 旅行: 200, 美妆: 332, 数码: 218, 汽车: 12, 游戏: 268, 职场: 150, 生活: 48, 资讯: 0 };
function fallbackGradient(note) {
  const hue = tagHue[note.tag] ?? 340;
  return `linear-gradient(150deg, hsl(${hue} 55% 88%), hsl(${(hue + 30) % 360} 45% 78%))`;
}

function formatLikes(n) {
  return n >= 10000 ? (n / 10000).toFixed(1).replace(/\.0$/, '') + '万' : String(n);
}

// ============================================================================
// AI 对话脚本 —— Section「对话流嵌入笔记卡片」核心演示
// ============================================================================

const conversations = {
  fashion_scene: {
    title: '兴趣驱动 · 内容发现',
    intent: '“我就想看某种东西”',
    messages: [
      { role: 'user', content: '我想看短发肌肉女的穿搭' },
      { role: 'ai', content: '为你找到以下相关创作者和笔记：', notes: ['f001', 'f002', 'f003'] },
      { role: 'user', content: '有更日系一点的吗' },
      { role: 'ai', content: '日系风格里「慵懒大男孩感」和「复古胶片色调」是高频方向，这两篇契合度较高：', notes: ['f004', 'f005'] },
    ],
  },
  product_scene: {
    title: '决策驱动 · 可溯源建议',
    intent: '“帮我做个判断”',
    messages: [
      { role: 'user', content: '适合油皮的防晒霜推荐' },
      {
        role: 'ai',
        content: '根据小红书 1.2 万篇真实测评汇总，油皮高频认可的有三类：化学防晒（轻薄不闷）、纯物理（敏感肌友好）、防晒喷雾（补涂方便）。以下笔记可作参考：',
        notes: ['p001'],
        reason: '10 款实测横评，评论区高赞集中在“控油”与“不假白”',
        followups: ['化学防晒推荐', '纯物理防晒推荐', '防晒喷雾推荐'],
      },
    ],
  },
  travel_scene: {
    title: '规划驱动 · 结构化攻略',
    intent: '“给我一份能用的计划”',
    messages: [
      { role: 'user', content: '5天京都行程，想避开人潮' },
      {
        role: 'ai',
        content: '基于本地视角创作者的笔记，建议路线如下：',
        itinerary: [
          { day: 'Day 1', place: '岚山', note: '清晨抵达，避开旅行团高峰' },
          { day: 'Day 2', place: '哲学之道 · 银阁寺', note: '安排在工作日下午' },
          { day: 'Day 3', place: '伏见稻荷', note: '傍晚后人少，光线最美' },
          { day: 'Day 4', place: '宇治', note: '半日游，喝一杯地道抹茶' },
          { day: 'Day 5', place: '河原町 · 鸭川', note: '留作机动与采买时间' },
        ],
        notes: ['t001', 't003'],
      },
    ],
  },
};

// 搜索历史（含 AI session 标记 —— 绿色 glow）
const searchHistory = [
  { q: '短发肌肉女穿搭', ai: true },
  { q: '5天京都行程', ai: true },
  { q: '油皮防晒霜', ai: true },
  { q: '小红书桌面端', ai: false },
  { q: 'Lab1327', ai: false },
  { q: 'ONIST平台', ai: false },
  { q: '大提顿 日落', ai: false },
  { q: 'ps5 方向盘', ai: true },
  { q: 'moza方向盘 ps5', ai: false },
  { q: 'i3长轴版', ai: false },
];
