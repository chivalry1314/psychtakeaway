// ==================== 核心游戏类型定义 ====================

export type GameScreen = 
  | 'MAIN_MENU' 
  | 'LEVEL_SELECT' 
  | 'STORY' 
  | 'PLAYING' 
  | 'PAUSED' 
  | 'GAME_OVER' 
  | 'LEVEL_COMPLETE';

export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
export type TrafficLightState = 'RED' | 'YELLOW' | 'GREEN';
export type Weather = 'CLEAR' | 'RAIN' | 'NIGHT';

export interface Vec2 {
  x: number;
  y: number;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Entity {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  vx: number;
  vy: number;
  rotation: number;
  active: boolean;
}

// 玩家
export interface Player extends Entity {
  speed: number;
  maxSpeed: number;
  health: number;
  maxHealth: number;
  hasOrder: boolean;
  currentOrderId: string | null;
  invincible: boolean;
  invincibleTimer: number;
  violationCount: number;
  isWrongWay: boolean;
}

// AI车辆
export interface Vehicle extends Entity {
  speed: number;
  maxSpeed: number;
  direction: Direction;
  stopped: boolean;
  stopTimer: number;
  vehicleType: 'car' | 'truck';
  image: string;
}

// 交通灯
export interface TrafficLight {
  id: string;
  x: number;
  y: number;
  state: TrafficLightState;
  timer: number;
  redDuration: number;
  yellowDuration: number;
  greenDuration: number;
  direction: 'NS' | 'EW';
  intersectionId: string;
}

// 路口
export interface Intersection {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  stopLines: StopLine[];
  trafficLightIds: string[];
}

// 停止线
export interface StopLine {
  x: number;
  y: number;
  width: number;
  height: number;
  direction: Direction;
  intersectionId: string;
}

// 道路
export interface Road {
  x: number;
  y: number;
  width: number;
  height: number;
  direction: 'HORIZONTAL' | 'VERTICAL';
  oneWay: boolean;
  allowedDirection: Direction | null;
}

// 建筑物
export interface Building {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  image: string;
}

// 商家
export interface Restaurant extends Entity {
  name: string;
  image: string;
}

// 顾客
export interface Customer extends Entity {
  name: string;
  orderId: string | null;
  image: string;
  patience: number;
}

// 订单
export interface Order {
  id: string;
  restaurantId: string;
  customerId: string;
  restaurantName: string;
  customerName: string;
  timeLimit: number;
  timeRemaining: number;
  reward: number;
  status: 'PENDING' | 'PICKED_UP' | 'DELIVERED' | 'FAILED';
  pickedUp: boolean;
}

// 对话行
export interface DialogueLine {
  speaker: string;
  text: string;
  isSystem?: boolean;
}

// 关卡配置
export interface LevelConfig {
  id: number;
  name: string;
  theme: string;
  description: string;
  targetOrders: number;
  rentCost: number;
  mapWidth: number;
  mapHeight: number;
  intersections: number;
  oneWayStreets: boolean;
  baseTime: number;
  trafficDensity: number;
  redLightDuration: number;
  greenLightDuration: number;
  yellowLightDuration: number;
  weather: Weather;
  maxConcurrentOrders: number;
  specialMechanic?: string;
  openingDialogue: DialogueLine[];
  endingDialogue: DialogueLine[];
  truckEnabled: boolean;
  showTimer: boolean;
}

// 粒子
export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  text?: string;
  size: number;
}

// 浮动文字
export interface FloatingText {
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
  maxLife: number;
}

// 系统通知
export interface GameNotification {
  id: string;
  text: string;
  type: 'info' | 'warning' | 'danger' | 'success';
  duration: number;
}

// 经济事件
export interface EconomyEvent {
  type: 'BASE_FEE' | 'ONTIME_BONUS' | 'LATE_PENALTY' | 'DAMAGE_PENALTY' | 'RENT' | 'FIRST_VIOLATION' | 'COMBO_BONUS' | 'WAITING_PENALTY';
  amount: number;
  description: string;
  timestamp: number;
}

// 成就/徽章
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;       // emoji
  unlocked: boolean;
  reward: number;     // 奖励金额
  threshold: number;  // 触发阈值
  showPopup: boolean; // 是否需要弹窗
}

// 排行榜骑手
export interface LeaderboardEntry {
  rank: number;
  name: string;
  orders: number;
  violations: number;
  isPlayer: boolean;
}

// 催命消息
export interface TauntMessage {
  id: string;
  text: string;
  customerName: string;
  intensity: number; // 1-5, 越高压越极端
  duration: number;
}

// 游戏状态
export interface GameState {
  screen: GameScreen;
  player: Player;
  vehicles: Vehicle[];
  trafficLights: TrafficLight[];
  intersections: Intersection[];
  roads: Road[];
  buildings: Building[];
  restaurants: Restaurant[];
  customers: Customer[];
  orders: Order[];
  particles: Particle[];
  floatingTexts: FloatingText[];
  notifications: GameNotification[];
  economyEvents: EconomyEvent[];
  camera: Vec2;
  
  // 关卡
  currentLevel: number;
  unlockedLevel: number;
  
  // 经济
  todayIncome: number;
  totalIncome: number;
  rentCost: number;
  violations: number;
  crashes: number;
  completedOrders: number;
  
  // 特效
  screenShake: number;
  vignetteIntensity: number;
  
  // 输入
  keys: Set<string>;
  touchInput: Vec2 | null;
  
  // 时间
  gameTime: number;
  lastFrameTime: number;
  paused: boolean;
  
  // 对话
  currentDialogue: DialogueLine[];
  dialogueIndex: number;
  
  // 天气
  weather: Weather;
  
  // 游戏结果
  gameOverReason: string;
  
  // 统计
  stats: GameStats;

  // ====== 新增：隐喻系统 ======
  
  // 成就系统
  achievements: Achievement[];
  // Combo连击
  violationStreak: number;      // 连续闯红灯次数
  maxViolationStreak: number;   // 历史最高
  // 排行榜
  leaderboard: LeaderboardEntry[];
  // 催命弹幕
  tauntMessages: TauntMessage[];
  // 等红灯计时（用于惩罚）
  redLightWaitTime: number;
  // 当前是否在路口决策点
  isAtIntersection: boolean;
  nearestIntersectionId: string | null;
  // 诱导弹窗显示
  showLurePopup: boolean;
  lurePopupText: string;
  // 心跳效果强度
  heartbeatIntensity: number;
}

export interface GameStats {
  totalPlayTime: number;
  totalOrdersCompleted: number;
  totalViolations: number;
  totalCrashes: number;
  firstViolationTime: string | null;
  hasSeenHiddenEnding: boolean;
}

// 存档数据
export interface SaveData {
  unlockedLevel: number;
  stats: GameStats;
}
