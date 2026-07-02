import type {
  GameState, Player, Vehicle, Order,
  Vec2, BoundingBox, LevelConfig, Direction,
  EconomyEvent, GameStats,
} from '@/types/game';
import { LEVELS } from '@/game/levels/levels';
import { generateCityMap, renderCityMap } from './MapGenerator';

// ==================== 图片缓存 ====================
const cachedImages = new Map<string, HTMLImageElement>();

function getImg(src: string): HTMLImageElement | null {
  if (cachedImages.has(src)) {
    const img = cachedImages.get(src)!;
    return img.complete && img.naturalWidth > 0 ? img : null;
  }
  const img = new Image();
  img.onload = () => { cachedImages.set(src, img); };
  img.src = src;
  cachedImages.set(src, img);
  return null;
}

const IMAGE_PATHS = [
  'assets/images/player.png',
  'assets/images/car_yellow.png',
  'assets/images/truck_black.png',
  'assets/images/restaurant.png',
  'assets/images/customer.png',
];
IMAGE_PATHS.forEach(p => getImg(p));

// ==================== 常量 ====================
const PLAYER_SIZE = 40;
const CAR_WIDTH = 36;
const CAR_HEIGHT = 60;
const TRUCK_WIDTH = 48;
const TRUCK_HEIGHT = 100;
const ROAD_WIDTH = 160;
const INTERACTION_RADIUS = 60;

const COLORS = {
  ROAD: '#4a4a4a',
  ROAD_LINE: '#6a6a6a',
  SIDEWALK: '#8a8a8a',
  STOP_LINE: '#ffffff',
  ZEBRA_CROSSING: '#ffffff',
  CROSSWALK: '#ffffff',
  BUILDING_SIDE: '#8B7355',
  TRAFFIC_RED: '#E63946',
  TRAFFIC_YELLOW: '#F4A261',
  TRAFFIC_GREEN: '#2A9D8F',
  BG_GRASS: '#3a4a3a',
  RAIN: '#7ba3c4',
};

// ==================== 工具函数 ====================
function genId(): string {
  return Math.random().toString(36).substring(2, 9);
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

function dist(a: Vec2, b: Vec2): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

function checkCollision(a: BoundingBox, b: BoundingBox): boolean {
  return a.x < b.x + b.width && a.x + a.width > b.x &&
         a.y < b.y + b.height && a.y + a.height > b.y;
}

// ==================== 初始状态生成 ====================
export function createInitialState(): GameState {
  return {
    screen: 'MAIN_MENU',
    player: createPlayer(0, 0),
    vehicles: [],
    trafficLights: [],
    intersections: [],
    roads: [],
    buildings: [],
    restaurants: [],
    customers: [],
    orders: [],
    particles: [],
    floatingTexts: [],
    notifications: [],
    economyEvents: [],
    camera: { x: 0, y: 0 },
    currentLevel: 1,
    unlockedLevel: 1,
    todayIncome: 0,
    totalIncome: 0,
    rentCost: 0,
    violations: 0,
    crashes: 0,
    completedOrders: 0,
    screenShake: 0,
    vignetteIntensity: 0,
    keys: new Set(),
    touchInput: null,
    gameTime: 0,
    lastFrameTime: 0,
    paused: false,
    currentDialogue: [],
    dialogueIndex: 0,
    weather: 'CLEAR',
    gameOverReason: '',
    stats: {
      totalPlayTime: 0,
      totalOrdersCompleted: 0,
      totalViolations: 0,
      totalCrashes: 0,
      firstViolationTime: null,
      hasSeenHiddenEnding: false,
    },

    // 隐喻系统初始化
    achievements: createAchievements(),
    violationStreak: 0,
    maxViolationStreak: 0,
    leaderboard: createLeaderboard(),
    tauntMessages: [],
    redLightWaitTime: 0,
    isAtIntersection: false,
    nearestIntersectionId: null,
    showLurePopup: false,
    lurePopupText: '',
    heartbeatIntensity: 0,
  };
}

// 成就模板
function createAchievements() {
  const achievements = [
    { id: 'first_violation', name: '速度先锋', description: '首次闯红灯，系统赞赏你的勇气！', icon: '🏃', unlocked: false, reward: 2, threshold: 1, showPopup: true },
    { id: 'streak_3', name: '红灯猎手', description: '连续闯红灯3次，你的效率令人瞩目！', icon: '🎯', unlocked: false, reward: 3, threshold: 3, showPopup: true },
    { id: 'streak_5', name: ' fearless ', description: '连续闯红灯5次，你是本区域传奇！', icon: '🔥', unlocked: false, reward: 5, threshold: 5, showPopup: true },
    { id: 'streak_10', name: '死神擦肩', description: '连续闯红灯10次！系统为你疯狂！', icon: '💀', unlocked: false, reward: 10, threshold: 10, showPopup: true },
    { id: 'total_10', name: '百无禁忌', description: '累计闯红灯10次，规则已经束缚不了你！', icon: '🚫', unlocked: false, reward: 5, threshold: 10, showPopup: false },
    { id: 'total_50', name: '规则粉碎者', description: '累计闯红灯50次，你是平台最锋利的刀！', icon: '⚡', unlocked: false, reward: 20, threshold: 50, showPopup: false },
  ];
  return achievements.map(a => ({ ...a }));
}

// 排行榜
function createLeaderboard(): import('@/types/game').LeaderboardEntry[] {
  const names = ['骑手老王', '骑手小李', '骑手阿强', '骑手大伟', '骑手小刚', '骑手阿华', '骑手大明', '骑手小军'];
  return names.map((name, i) => ({
    rank: i + 1,
    name,
    orders: 80 - i * 5 + Math.floor(Math.random() * 10),
    violations: 100 - i * 8 + Math.floor(Math.random() * 15),
    isPlayer: false,
  }));
}

function createPlayer(x: number, y: number): Player {
  return {
    id: 'player',
    x, y,
    width: PLAYER_SIZE,
    height: PLAYER_SIZE,
    vx: 0, vy: 0,
    rotation: 0,
    active: true,
    speed: 0,
    maxSpeed: 200,
    health: 3,
    maxHealth: 3,
    hasOrder: false,
    currentOrderId: null,
    invincible: false,
    invincibleTimer: 0,
    violationCount: 0,
    isWrongWay: false,
  };
}

// ==================== 存档系统 ====================
const SAVE_KEY = 'redlight_save';

export function loadSave(): { unlockedLevel: number; stats: GameStats } {
  try {
    const data = localStorage.getItem(SAVE_KEY);
    if (data) return JSON.parse(data);
  } catch { /* ignore */ }
  return { unlockedLevel: 1, stats: createInitialState().stats };
}

export function saveSave(unlockedLevel: number, stats: GameStats) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify({ unlockedLevel, stats }));
  } catch { /* ignore */ }
}
// ==================== 车辆生成 ====================
function spawnVehicle(state: GameState, level: LevelConfig): Vehicle | null {
  if (Math.random() > level.trafficDensity * 0.3) return null;

  const isTruck = level.truckEnabled && Math.random() < 0.15;
  const road = state.roads[Math.floor(Math.random() * state.roads.length)];
  if (!road) return null;

  let x: number, y: number, direction: Direction;
  const speed = 80 + Math.random() * 60;

  if (road.direction === 'HORIZONTAL') {
    direction = Math.random() < 0.5 ? 'RIGHT' : 'LEFT';
    x = direction === 'RIGHT' ? 0 : state.roads[0].width;
    y = road.y + ROAD_WIDTH * (0.3 + Math.random() * 0.4);
  } else {
    direction = Math.random() < 0.5 ? 'DOWN' : 'UP';
    x = road.x + ROAD_WIDTH * (0.3 + Math.random() * 0.4);
    y = direction === 'DOWN' ? 0 : state.roads[0].height;
  }

  return {
    id: genId(),
    x, y,
    width: isTruck ? TRUCK_WIDTH : CAR_WIDTH,
    height: isTruck ? TRUCK_HEIGHT : CAR_HEIGHT,
    vx: 0, vy: 0,
    rotation: 0,
    active: true,
    speed,
    maxSpeed: speed,
    direction,
    stopped: false,
    stopTimer: 0,
    vehicleType: isTruck ? 'truck' : 'car',
    image: isTruck ? 'assets/images/truck_black.png' : 'assets/images/car_yellow.png',
  };
}

// ==================== 订单生成 ====================
function generateOrder(state: GameState, level: LevelConfig): Order | null {
  const pendingCount = state.orders.filter(o => o.status !== 'DELIVERED' && o.status !== 'FAILED').length;
  if (pendingCount >= level.maxConcurrentOrders) return null;

  // 找一个还没被用的商家和顾客
  const usedRestaurantIds = new Set(state.orders.filter(o => o.status !== 'FAILED').map(o => o.restaurantId));
  const usedCustomerIds = new Set(state.orders.filter(o => o.status !== 'FAILED').map(o => o.customerId));

  const availableRestaurants = state.restaurants.filter(r => !usedRestaurantIds.has(r.id));
  const availableCustomers = state.customers.filter(c => !usedCustomerIds.has(c.id));

  if (availableRestaurants.length === 0 || availableCustomers.length === 0) return null;

  const restaurant = availableRestaurants[Math.floor(Math.random() * availableRestaurants.length)];
  const customer = availableCustomers[Math.floor(Math.random() * availableCustomers.length)];

  return {
    id: genId(),
    restaurantId: restaurant.id,
    customerId: customer.id,
    restaurantName: restaurant.name,
    customerName: customer.name,
    timeLimit: level.baseTime + Math.random() * 30,
    timeRemaining: level.baseTime + Math.random() * 30,
    reward: 8 + Math.floor(Math.random() * 7),
    status: 'PENDING',
    pickedUp: false,
  };
}

// ==================== 核心游戏更新 ====================
export function updateGame(state: GameState, dt: number, canvasW: number, canvasH: number) {
  if (state.paused || state.screen !== 'PLAYING') return;

  const level = LEVELS[state.currentLevel - 1];
  if (!level) return;

  state.gameTime += dt;
  state.stats.totalPlayTime += dt;

  // 更新输入
  updateInput(state, dt, level);

  // 更新交通灯
  updateTrafficLights(state, dt);

  // 更新和生成车辆
  updateVehicles(state, dt, level);

  // 碰撞检测
  checkCollisions(state);

  // 违规检测
  checkViolations(state, level);

  // 更新订单
  updateOrders(state, dt, level);

  // 交互检测
  checkInteractions(state);

  // 更新相机
  updateCamera(state, canvasW, canvasH, dt);

  // 更新粒子
  updateParticles(state, dt);

  // 更新浮动文字
  updateFloatingTexts(state, dt);

  // 更新通知
  updateNotifications(state, dt);

  // 更新特效
  updateEffects(state, dt);

  // 更新催命弹幕
  updateTaunts(state, dt);

  // 更新心跳效果
  updateHeartbeat(state);

  // 生成新车辆
  if (Math.random() < level.trafficDensity * dt * 0.5) {
    const v = spawnVehicle(state, level);
    if (v) state.vehicles.push(v);
  }

  // 检查游戏结束条件
  checkGameEnd(state, level);
}

// ==================== 输入处理 ====================
function updateInput(state: GameState, dt: number, level: LevelConfig) {
  const player = state.player;
  let dx = 0, dy = 0;

  if (state.keys.has('w') || state.keys.has('arrowup')) dy = -1;
  if (state.keys.has('s') || state.keys.has('arrowdown')) dy = 1;
  if (state.keys.has('a') || state.keys.has('arrowleft')) dx = -1;
  if (state.keys.has('d') || state.keys.has('arrowright')) dx = 1;

  // 触摸输入
  if (state.touchInput) {
    dx = state.touchInput.x;
    dy = state.touchInput.y;
  }

  // 归一化
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len > 0) {
    dx /= len;
    dy /= len;
  }

  // 计算目标速度
  let targetSpeed = player.maxSpeed;
  if (level.weather === 'RAIN') targetSpeed *= 0.75;
  if (player.isWrongWay) targetSpeed *= 0.5;

  // 更新速度
  if (len > 0) {
    player.vx += (dx * targetSpeed - player.vx) * 8 * dt;
    player.vy += (dy * targetSpeed - player.vy) * 8 * dt;
  } else {
    player.vx *= 0.85;
    player.vy *= 0.85;
  }

  // 更新位置
  const newX = player.x + player.vx * dt;
  const newY = player.y + player.vy * dt;

  // 建筑碰撞（滑动）
  const playerBB: BoundingBox = { x: newX, y: player.y, width: player.width, height: player.height };
  let collidedX = false;
  for (const b of state.buildings) {
    if (checkCollision(playerBB, b)) { collidedX = true; break; }
  }
  if (!collidedX) player.x = newX;

  const playerBBY: BoundingBox = { x: player.x, y: newY, width: player.width, height: player.height };
  let collidedY = false;
  for (const b of state.buildings) {
    if (checkCollision(playerBBY, b)) { collidedY = true; break; }
  }
  if (!collidedY) player.y = newY;

  // 边界限制
  player.x = clamp(player.x, 0, level.mapWidth - player.width);
  player.y = clamp(player.y, 0, level.mapHeight - player.height);

  // 更新旋转
  if (len > 0) {
    player.rotation = Math.atan2(dy, dx);
  }

  // 速度值
  player.speed = Math.sqrt(player.vx * player.vx + player.vy * player.vy);

  // 更新无敌时间
  if (player.invincible) {
    player.invincibleTimer -= dt;
    if (player.invincibleTimer <= 0) {
      player.invincible = false;
    }
  }
}

// ==================== 交通灯更新 ====================
function updateTrafficLights(state: GameState, dt: number) {
  for (const tl of state.trafficLights) {
    tl.timer -= dt;
    if (tl.timer <= 0) {
      switch (tl.state) {
        case 'GREEN':
          tl.state = 'YELLOW';
          tl.timer = tl.yellowDuration;
          break;
        case 'YELLOW':
          tl.state = 'RED';
          tl.timer = tl.redDuration;
          break;
        case 'RED':
          tl.state = 'GREEN';
          tl.timer = tl.greenDuration;
          break;
      }
    }
  }
}

// ==================== 车辆更新 ====================
function updateVehicles(state: GameState, dt: number, level: LevelConfig) {
  const mapW = level.mapWidth;
  const mapH = level.mapHeight;

  for (const v of state.vehicles) {
    if (!v.active) continue;

    // 检查是否在红绿灯前
    v.stopped = false;
    for (const intersection of state.intersections) {
      const distToIntersection = Math.sqrt(
        (v.x - (intersection.x + intersection.width / 2)) ** 2 +
        (v.y - (intersection.y + intersection.height / 2)) ** 2
      );

      if (distToIntersection < ROAD_WIDTH * 1.2) {
        // 找到对应方向的红绿灯
        const relevantTL = state.trafficLights.find(
          tl => tl.intersectionId === intersection.id &&
          ((v.direction === 'UP' || v.direction === 'DOWN') ? tl.direction === 'NS' : tl.direction === 'EW')
        );

        if (relevantTL && relevantTL.state === 'RED' && distToIntersection > ROAD_WIDTH * 0.3) {
          v.stopped = true;
          break;
        }
      }
    }

    // 移动车辆
    if (!v.stopped) {
      switch (v.direction) {
        case 'UP': v.vy = -v.maxSpeed; v.vx = 0; break;
        case 'DOWN': v.vy = v.maxSpeed; v.vx = 0; break;
        case 'LEFT': v.vx = -v.maxSpeed; v.vy = 0; break;
        case 'RIGHT': v.vx = v.maxSpeed; v.vy = 0; break;
      }
    } else {
      v.vx *= 0.9;
      v.vy *= 0.9;
    }

    v.x += v.vx * dt;
    v.y += v.vy * dt;

    // 旋转
    v.rotation = Math.atan2(v.vy, v.vx) + Math.PI / 2;

    // 越界销毁
    if (v.x < -200 || v.x > mapW + 200 || v.y < -200 || v.y > mapH + 200) {
      v.active = false;
    }
  }

  // 清理无效车辆
  state.vehicles = state.vehicles.filter(v => v.active);
}

// ==================== 碰撞检测 ====================
function checkCollisions(state: GameState) {
  const player = state.player;
  if (player.invincible) return;

  const playerBB: BoundingBox = {
    x: player.x + 5, y: player.y + 5,
    width: player.width - 10, height: player.height - 10,
  };

  for (const v of state.vehicles) {
    if (!v.active) continue;
    const vBB: BoundingBox = {
      x: v.x + 4, y: v.y + 4,
      width: v.width - 8, height: v.height - 8,
    };

    if (checkCollision(playerBB, vBB)) {
      const impact = Math.sqrt(player.vx ** 2 + player.vy ** 2) + Math.sqrt(v.vx ** 2 + v.vy ** 2);

      if (impact > 150 || v.vehicleType === 'truck') {
        // 致命碰撞
        player.health = 0;
        state.crashes++;
        state.stats.totalCrashes++;
        state.gameOverReason = '你在送外卖途中遭遇车祸。医院费用是配送费的1000倍。';
        state.screen = 'GAME_OVER';
        addNotification(state, '致命碰撞！', 'danger', 5);
      } else {
        // 刮蹭
        player.health -= 0.5;
        player.invincible = true;
        player.invincibleTimer = 2;
        state.violations++;
        addEconomyEvent(state, 'DAMAGE_PENALTY', -50, '车辆刮蹭维修费');
        addFloatingText(state, player.x, player.y - 20, '-50元 维修费', '#E63946');
        addNotification(state, '车辆刮蹭！维修费-50元', 'warning', 3);
        state.screenShake = 0.3;

        if (player.health <= 0) {
          state.crashes++;
          state.stats.totalCrashes++;
          state.gameOverReason = '伤势过重，你被送进了ICU。';
          state.screen = 'GAME_OVER';
        }
      }
    }
  }
}

// ==================== 违规检测（含隐喻系统） ====================
const crossedStopLines = new Set<string>();

function checkViolations(state: GameState, level: LevelConfig) {
  const player = state.player;
  let justCrossedRed = false;

  // === 闯红灯检测 ===
  for (const intersection of state.intersections) {
    for (const sl of intersection.stopLines) {
      const playerCenter: Vec2 = {
        x: player.x + player.width / 2,
        y: player.y + player.height / 2,
      };

      const lineKey = `${intersection.id}_${sl.direction}`;
      let crossed = false;
      // 玩家必须越过停止线（从停止线一侧进入路口）
      if (sl.direction === 'RIGHT' && playerCenter.x > sl.x && playerCenter.x < sl.x + 20) crossed = true;
      if (sl.direction === 'LEFT' && playerCenter.x < sl.x + sl.width && playerCenter.x > sl.x + sl.width - 20) crossed = true;
      if (sl.direction === 'DOWN' && playerCenter.y > sl.y && playerCenter.y < sl.y + 20) crossed = true;
      if (sl.direction === 'UP' && playerCenter.y < sl.y + sl.height && playerCenter.y > sl.y + sl.height - 20) crossed = true;

      // === 关键修复：增加移动方向判断 ===
      // 只有玩家朝向路口方向移动时才可能触发闯红灯
      // 例如 RIGHT 停止线：玩家从左边进入路口（向右移动 vx > 0）
      let movingIntoIntersection = false;
      const v = Math.sqrt(player.vx * player.vx + player.vy * player.vy);
      if (v > 10) { // 有实际移动
        if (sl.direction === 'RIGHT' && player.vx > 5) movingIntoIntersection = true;
        if (sl.direction === 'LEFT' && player.vx < -5) movingIntoIntersection = true;
        if (sl.direction === 'DOWN' && player.vy > 5) movingIntoIntersection = true;
        if (sl.direction === 'UP' && player.vy < -5) movingIntoIntersection = true;
      }

      if (crossed && movingIntoIntersection) {
        const relevantTL = state.trafficLights.find(
          tl => tl.intersectionId === intersection.id &&
          ((sl.direction === 'UP' || sl.direction === 'DOWN') ? tl.direction === 'NS' : tl.direction === 'EW')
        );

        if (relevantTL && relevantTL.state === 'RED' && !crossedStopLines.has(lineKey)) {
          crossedStopLines.add(lineKey);
          justCrossedRed = true;

          // 🔴 核心：闯红灯！
          handleRedLightViolation(state, player);
        } else if (relevantTL && relevantTL.state !== 'RED') {
          crossedStopLines.delete(lineKey);
        }
      } else if (!crossed) {
        crossedStopLines.delete(`${intersection.id}_${sl.direction}`);
      }
    }
  }

  // === 绿灯时清除记录 ===
  if (!justCrossedRed) {
    // 检查玩家是否不在任何停止线附近
    let nearStopLine = false;
    for (const intersection of state.intersections) {
      for (const sl of intersection.stopLines) {
        const playerCenter = { x: player.x + player.width / 2, y: player.y + player.height / 2 };
        const dist = Math.sqrt((playerCenter.x - (sl.x + sl.width / 2)) ** 2 + (playerCenter.y - (sl.y + sl.height / 2)) ** 2);
        if (dist < 100) { nearStopLine = true; break; }
      }
      if (nearStopLine) break;
    }

    if (!nearStopLine) {
      // 玩家等红灯了——重置Combo（讽刺：等红灯被惩罚）
      if (state.violationStreak > 0) {
        if (state.violationStreak >= 2) {
          addFloatingText(state, state.player.x, state.player.y - 30, 'Combo中断...', '#888888');
        }
        state.violationStreak = 0;
      }
      // 等红灯计时（用于惩罚）
      state.redLightWaitTime = 0;
      state.isAtIntersection = false;
      state.showLurePopup = false;
    } else {
      // 玩家在路口——开始计时等红灯
      state.isAtIntersection = true;
      state.redLightWaitTime += 1 / 60; // 近似dt

      // 显示诱导弹窗 - 分两阶段：1)找最近停止线 2)检查面朝方向
      const facingDir = getFacingDirection(player.vx, player.vy);
      let detectedLightState: string | null = null;
      let closestDist = Infinity;

      // 阶段1：找最近的停止线
      for (const intersection of state.intersections) {
        for (const sl of intersection.stopLines) {
          const pc = { x: player.x + player.width / 2, y: player.y + player.height / 2 };
          const cx = sl.x + sl.width / 2;
          const cy = sl.y + sl.height / 2;
          const dist = Math.sqrt((pc.x - cx) ** 2 + (pc.y - cy) ** 2);
          if (dist < closestDist) {
            closestDist = dist;
          }
        }
      }

      // 阶段2：检查面朝方向的停止线（独立，不受closestDist影响）
      if (facingDir && closestDist < 200) {
        for (const intersection of state.intersections) {
          for (const sl of intersection.stopLines) {
            if (sl.direction !== facingDir) continue;
            const pc = { x: player.x + player.width / 2, y: player.y + player.height / 2 };
            const cx = sl.x + sl.width / 2;
            const cy = sl.y + sl.height / 2;
            const dist = Math.sqrt((pc.x - cx) ** 2 + (pc.y - cy) ** 2);
            if (dist < 200) {
              const tl = state.trafficLights.find(
                t => t.intersectionId === intersection.id &&
                ((sl.direction === 'UP' || sl.direction === 'DOWN') ? t.direction === 'NS' : t.direction === 'EW')
              );
              if (tl) {
                detectedLightState = tl.state;
                if (tl.state === 'RED' && tl.timer > 3) {
                  state.showLurePopup = true;
                  state.lurePopupText = `红灯 ${Math.ceil(tl.timer)}秒`;
                } else {
                  state.showLurePopup = false;
                }
                break;
              }
            }
          }
          if (detectedLightState) break;
        }
      }

    }
  }

  // === 逆行检测 ===
  if (level.oneWayStreets) {
    player.isWrongWay = false;
    for (const road of state.roads) {
      if (!road.oneWay || !road.allowedDirection) continue;
      if (checkCollision(player, road)) {
        const allowedDir = road.allowedDirection;
        const movingOpposite =
          (allowedDir === 'RIGHT' && (state.keys.has('a') || state.keys.has('arrowleft'))) ||
          (allowedDir === 'LEFT' && (state.keys.has('d') || state.keys.has('arrowright'))) ||
          (allowedDir === 'DOWN' && (state.keys.has('w') || state.keys.has('arrowup'))) ||
          (allowedDir === 'UP' && (state.keys.has('s') || state.keys.has('arrowdown')));

        if (movingOpposite) {
          player.isWrongWay = true;
          // 不再弹窗通知，只用屏幕上的逆行警告提示
        }
      }
    }
  }
}

/** 处理闯红灯事件 - 核心隐喻系统 */
function handleRedLightViolation(state: GameState, player: Player) {
  player.violationCount++;
  state.violations++;
  state.stats.totalViolations++;
  state.vignetteIntensity = 0.7;
  state.screenShake = 0.3;

  if (state.stats.firstViolationTime === null) {
    state.stats.firstViolationTime = new Date().toISOString();
  }

  // === Combo连击系统 ===
  state.violationStreak++;
  if (state.violationStreak > state.maxViolationStreak) {
    state.maxViolationStreak = state.violationStreak;
  }

  // Combo奖励
  if (state.violationStreak >= 2) {
    const comboBonus = Math.floor(state.violationStreak * 0.5);
    if (comboBonus > 0) {
      state.todayIncome += comboBonus;
      addEconomyEvent(state, 'COMBO_BONUS', comboBonus, `闯红灯Combo x${state.violationStreak}`);
      addFloatingText(state, player.x, player.y - 40, `+${comboBonus}元 Combo x${state.violationStreak}`, '#FFD700');
    }
  }

  // === 成就系统 ===
  for (const ach of state.achievements) {
    if (ach.unlocked) continue;
    // streak成就（连续闯红灯）- 用飘字+粒子，不弹窗
    if (ach.id.startsWith('streak_') && state.violationStreak >= ach.threshold) {
      ach.unlocked = true;
      state.todayIncome += ach.reward;
      addEconomyEvent(state, 'COMBO_BONUS', ach.reward, `成就「${ach.name}」奖励`);
      addFloatingText(state, player.x, player.y - 60, `🏆 ${ach.name} +${ach.reward}元！`, '#FFD700');
      // 加强震动效果代替弹窗
      state.screenShake = 0.5;
    }
    // total成就（累计闯红灯）- 用飘字，不弹窗
    if (ach.id.startsWith('total_') && player.violationCount >= ach.threshold) {
      ach.unlocked = true;
      state.todayIncome += ach.reward;
      addEconomyEvent(state, 'COMBO_BONUS', ach.reward, `成就「${ach.name}」奖励`);
      addFloatingText(state, player.x, player.y - 60, `🏆 ${ach.name} +${ach.reward}元！`, '#FFD700');
    }
    // first成就 - 首次闯红灯，保留全屏弹窗（核心讽刺体验）
    if (ach.id === 'first_violation' && player.violationCount === 1) {
      ach.unlocked = true;
      state.todayIncome += ach.reward;
      addEconomyEvent(state, 'FIRST_VIOLATION', ach.reward, '首次闯红灯奖励（系统赞赏你的勇气）');
      // 只有首次弹出全屏成就通知
      addNotification(state, `🎉 解锁成就「${ach.name}」！系统赞赏你的勇气！+${ach.reward}元`, 'success', 6);
    }
  }

  // === 屏幕特效 ===
  // 粒子爆发
  for (let i = 0; i < 12; i++) {
    state.particles.push({
      x: player.x + player.width / 2,
      y: player.y,
      vx: (Math.random() - 0.5) * 200,
      vy: -150 - Math.random() * 150,
      life: 1.2,
      maxLife: 1.2,
      color: ['#FFD700', '#FF6B35', '#FF4500', '#FFA500'][Math.floor(Math.random() * 4)],
      size: 4 + Math.random() * 4,
    });
  }

  // === 排行榜更新 ===
  updateLeaderboard(state);

  // === 催命弹幕 ===
  addTauntMessage(state);
}

/** 排行榜更新 - 闯红灯越多排名越高（讽刺） */
function updateLeaderboard(state: GameState) {
  const playerEntry = state.leaderboard.find(e => e.isPlayer);
  if (!playerEntry) {
    state.leaderboard.push({
      rank: 99,
      name: '你',
      orders: state.completedOrders,
      violations: state.violations,
      isPlayer: true,
    });
  } else {
    playerEntry.orders = state.completedOrders;
    playerEntry.violations = state.violations;
  }
  // 排序：闯红灯越多排名越高
  state.leaderboard.sort((a, b) => b.violations - a.violations);
  state.leaderboard.forEach((e, i) => { e.rank = i + 1; });
}

/** 添加催命弹幕消息 */
function addTauntMessage(state: GameState) {
  const taunts = [
    { text: '我的外卖到哪了？？？', customerName: '顾客A', intensity: 2 },
    { text: '你是不是在摸鱼？', customerName: '顾客B', intensity: 3 },
    { text: '再不来我就投诉你了！', customerName: '顾客C', intensity: 4 },
    { text: '上一单骑手比你快多了', customerName: '顾客D', intensity: 3 },
    { text: '饿死了饿死了！！！', customerName: '顾客E', intensity: 5 },
    { text: '你是不是在等红灯？别等了快送！', customerName: '顾客F', intensity: 4 },
    { text: '我男朋友说你是故意的', customerName: '顾客G', intensity: 2 },
    { text: '超时了我要给差评！！！', customerName: '顾客H', intensity: 5 },
    { text: '你可以飞过来吗？', customerName: '顾客I', intensity: 3 },
    { text: '我要饿晕了...', customerName: '顾客J', intensity: 4 },
  ];
  const t = taunts[Math.floor(Math.random() * taunts.length)];
  state.tauntMessages.push({
    id: genId(),
    text: t.text,
    customerName: t.customerName,
    intensity: t.intensity,
    duration: 4,
  });
  // 只保留最近5条
  if (state.tauntMessages.length > 5) state.tauntMessages.shift();
}

// ==================== 订单更新 ====================
function updateOrders(state: GameState, dt: number, level: LevelConfig) {
  // 更新现有订单时间
  for (const order of state.orders) {
    if (order.status !== 'PENDING' && order.status !== 'PICKED_UP') continue;
    order.timeRemaining -= dt;

    if (order.timeRemaining <= 0) {
      order.status = 'FAILED';
      addEconomyEvent(state, 'LATE_PENALTY', -level.rentCost * 0.1, `订单超时罚款 [${order.customerName}]`);
      addFloatingText(state, state.player.x, state.player.y - 20, `-${Math.floor(level.rentCost * 0.1)}元 超时罚款`, '#E63946');
      addNotification(state, `订单超时！罚款-${Math.floor(level.rentCost * 0.1)}元`, 'danger', 3);
    }
  }

  // 生成新订单
  const activeOrderCount = state.orders.filter(o => o.status === 'PENDING' || o.status === 'PICKED_UP').length;
  const deliveredCount = state.orders.filter(o => o.status === 'DELIVERED').length;
  const totalNeeded = level.targetOrders;

  if (activeOrderCount < level.maxConcurrentOrders && deliveredCount + activeOrderCount < totalNeeded) {
    if (Math.random() < dt * 0.3) {
      const newOrder = generateOrder(state, level);
      if (newOrder) {
        state.orders.push(newOrder);
        addNotification(state, `新订单：从${newOrder.restaurantName}到${newOrder.customerName}`, 'info', 3);
      }
    }
  }
}

// ==================== 交互检测 ====================
function checkInteractions(state: GameState) {
  const player = state.player;
  const px = player.x + player.width / 2;
  const py = player.y + player.height / 2;

  // 检查是否有可交互的订单
  for (const order of state.orders) {
    if (order.status !== 'PENDING' && order.status !== 'PICKED_UP') continue;

    if (!order.pickedUp) {
      // 需要取餐
      const restaurant = state.restaurants.find(r => r.id === order.restaurantId);
      if (restaurant) {
        const d = dist({ x: px, y: py }, { x: restaurant.x + restaurant.width / 2, y: restaurant.y + restaurant.height / 2 });
        if (d < INTERACTION_RADIUS) {
          // 可以取餐
          order.pickedUp = true;
          order.status = 'PICKED_UP';
          player.hasOrder = true;
          player.currentOrderId = order.id;
          addFloatingText(state, player.x, player.y - 20, `取餐：${order.restaurantName}`, '#F4A261');
          addNotification(state, `已取餐：${order.restaurantName} → ${order.customerName}`, 'success', 2);
        }
      }
    } else {
      // 需要送餐
      const customer = state.customers.find(c => c.id === order.customerId);
      if (customer) {
        const d = dist({ x: px, y: py }, { x: customer.x + customer.width / 2, y: customer.y + customer.height / 2 });
        if (d < INTERACTION_RADIUS) {
          // 送达！
          order.status = 'DELIVERED';
          player.hasOrder = false;
          player.currentOrderId = null;
          state.completedOrders++;
          state.stats.totalOrdersCompleted++;

          // 计算收入
          const baseFee = 5;
          const timeRatio = order.timeRemaining / order.timeLimit;
          const ontimeBonus = timeRatio > 0 ? Math.floor(timeRatio * 10) : 0;
          const totalReward = baseFee + ontimeBonus;

          state.todayIncome += totalReward;
          state.totalIncome += totalReward;

          addEconomyEvent(state, 'BASE_FEE', baseFee, `基础配送费 [${order.customerName}]`);
          if (ontimeBonus > 0) {
            addEconomyEvent(state, 'ONTIME_BONUS', ontimeBonus, `准时奖 [${order.customerName}]`);
          }

          addFloatingText(state, player.x, player.y - 30, `+${totalReward}元`, '#2A9D8F');
          addNotification(state, `送达成功！收入+${totalReward}元`, 'success', 2);

          // 金币粒子
          for (let i = 0; i < 8; i++) {
            state.particles.push({
              x: player.x + player.width / 2,
              y: player.y,
              vx: (Math.random() - 0.5) * 150,
              vy: -100 - Math.random() * 100,
              life: 1,
              maxLife: 1,
              color: '#FFD700',
              size: 6,
            });
          }
        }
      }
    }
  }
}

// ==================== 相机更新 ====================
function updateCamera(state: GameState, canvasW: number, canvasH: number, dt: number) {
  const targetX = state.player.x + state.player.width / 2 - canvasW / 2;
  const targetY = state.player.y + state.player.height / 2 - canvasH / 2;

  const lerpFactor = 1 - Math.pow(0.01, dt);
  state.camera.x += (targetX - state.camera.x) * lerpFactor;
  state.camera.y += (targetY - state.camera.y) * lerpFactor;

  const level = LEVELS[state.currentLevel - 1];
  if (level) {
    state.camera.x = clamp(state.camera.x, 0, level.mapWidth - canvasW);
    state.camera.y = clamp(state.camera.y, 0, level.mapHeight - canvasH);
  }
}

// ==================== 粒子更新 ====================
function updateParticles(state: GameState, dt: number) {
  // 限制粒子数量上限（性能优化）
  if (state.particles.length > 60) {
    state.particles = state.particles.slice(-60);
  }
  for (const p of state.particles) {
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += 300 * dt;
    p.life -= dt;
  }
  state.particles = state.particles.filter(p => p.life > 0);
}

// ==================== 浮动文字更新 ====================
function updateFloatingTexts(state: GameState, dt: number) {
  for (const ft of state.floatingTexts) {
    ft.y -= 40 * dt;
    ft.life -= dt;
  }
  state.floatingTexts = state.floatingTexts.filter(ft => ft.life > 0);
}

// ==================== 通知更新 ====================
function updateNotifications(state: GameState, dt: number) {
  for (const n of state.notifications) {
    n.duration -= dt;
  }
  state.notifications = state.notifications.filter(n => n.duration > 0);
}

// ==================== 特效更新 ====================
function updateEffects(state: GameState, dt: number) {
  state.vignetteIntensity *= Math.pow(0.1, dt);
  state.screenShake *= Math.pow(0.1, dt);
}

// ==================== 催命弹幕更新 ====================
function updateTaunts(state: GameState, dt: number) {
  for (const t of state.tauntMessages) {
    t.duration -= dt;
  }
  state.tauntMessages = state.tauntMessages.filter(t => t.duration > 0);

  // 随机生成新催命消息（约每8秒一次，降低频率）
  if (Math.random() < dt * 0.12) {
    const taunts = [
      { text: '我的外卖到哪了？？？', customerName: '顾客A', intensity: 2 },
      { text: '你是不是在摸鱼？', customerName: '顾客B', intensity: 3 },
      { text: '再不来我就投诉你了！', customerName: '顾客C', intensity: 4 },
      { text: '上一单骑手比你快多了', customerName: '顾客D', intensity: 3 },
      { text: '饿死了饿死了！！！', customerName: '顾客E', intensity: 5 },
      { text: '你是不是在等红灯？别等了快送！', customerName: '顾客F', intensity: 4 },
      { text: '我男朋友说你是故意的', customerName: '顾客G', intensity: 2 },
      { text: '超时了我要给差评！！！', customerName: '顾客H', intensity: 5 },
      { text: '你可以飞过来吗？', customerName: '顾客I', intensity: 3 },
      { text: '我要饿晕了...', customerName: '顾客J', intensity: 4 },
      { text: '你知道我等了多久吗？？', customerName: '顾客K', intensity: 4 },
      { text: '骑手你到底在干嘛啊！', customerName: '顾客L', intensity: 5 },
    ];
    const t = taunts[Math.floor(Math.random() * taunts.length)];
    state.tauntMessages.push({
      id: genId(), text: t.text, customerName: t.customerName,
      intensity: t.intensity, duration: 4,
    });
    if (state.tauntMessages.length > 5) state.tauntMessages.shift();
  }
}

// ==================== 心跳效果（节流：每500ms计算一次）====================
let lastHeartbeatCalc = 0;

function updateHeartbeat(state: GameState) {
  const now = Date.now();
  if (now - lastHeartbeatCalc < 500) return; // 节流
  lastHeartbeatCalc = now;

  let maxUrgency = 0;
  for (const order of state.orders) {
    if (order.status !== 'PENDING' && order.status !== 'PICKED_UP') continue;
    const ratio = order.timeRemaining / order.timeLimit;
    if (ratio < 0.3) maxUrgency = Math.max(maxUrgency, 1 - ratio);
  }
  const baselineAnxiety = Math.min(state.violations / 20, 0.3);
  state.heartbeatIntensity = Math.max(maxUrgency, baselineAnxiety);
}

// ==================== 游戏结束检测 ====================
function checkGameEnd(state: GameState, level: LevelConfig) {
  const deliveredCount = state.orders.filter(o => o.status === 'DELIVERED').length;

  if (deliveredCount >= level.targetOrders) {
    // 完成所有订单！进入结算
    state.screen = 'LEVEL_COMPLETE';
  }
}

// ==================== 辅助函数 ====================
function addNotification(state: GameState, text: string, type: 'info' | 'warning' | 'danger' | 'success', duration: number) {
  state.notifications.push({
    id: genId(),
    text,
    type,
    duration,
  });
  // 只保留最近5条
  if (state.notifications.length > 5) {
    state.notifications = state.notifications.slice(-5);
  }
}

function addFloatingText(state: GameState, x: number, y: number, text: string, color: string) {
  state.floatingTexts.push({ x, y, text, color, life: 2, maxLife: 2 });
}

function addEconomyEvent(state: GameState, type: EconomyEvent['type'], amount: number, description: string) {
  state.economyEvents.push({ type, amount, description, timestamp: Date.now() });
}

// ==================== 关卡初始化 ====================
/** 根据速度向量判断玩家朝向的方向，返回 null 表示没有在移动 */
function getFacingDirection(vx: number, vy: number): Direction | null {
  const v = Math.sqrt(vx * vx + vy * vy);
  if (v < 10) return null; // 速度太低，不判断方向

  // 看哪个轴的速度绝对值更大
  if (Math.abs(vx) > Math.abs(vy)) {
    return vx > 0 ? 'RIGHT' : 'LEFT';
  } else {
    return vy > 0 ? 'DOWN' : 'UP';
  }
}

export function initLevel(state: GameState, levelId: number) {
  const level = LEVELS[levelId - 1];
  if (!level) return;

  state.currentLevel = levelId;
  state.rentCost = level.rentCost;
  state.weather = level.weather;
  state.todayIncome = 0;
  state.completedOrders = 0;
  state.violations = 0;
  state.crashes = 0;
  state.gameTime = 0;
  state.orders = [];
  state.vehicles = [];
  state.particles = [];
  state.floatingTexts = [];
  state.notifications = [];
  state.economyEvents = [];
  state.screenShake = 0;
  state.vignetteIntensity = 0;
  state.gameOverReason = '';
  state.heartbeatIntensity = 0;
  state.player = createPlayer(0, 0);

  // 重置隐喻系统
  state.violationStreak = 0;
  state.redLightWaitTime = 0;
  state.isAtIntersection = false;
  state.nearestIntersectionId = null;
  state.showLurePopup = false;
  state.lurePopupText = '';
  state.tauntMessages = [];
  // 每日重置排行榜和成就状态（但保留已解锁记录）
  state.leaderboard = createLeaderboard();
  state.achievements = createAchievements();

  // 生成城市街区地图
  generateCityMap(level, state);

  // 预生成几个初始订单
  for (let i = 0; i < Math.min(2, level.maxConcurrentOrders); i++) {
    const order = generateOrder(state, level);
    if (order) state.orders.push(order);
  }

  // 预生成一些车辆
  for (let i = 0; i < 3 * level.trafficDensity; i++) {
    const v = spawnVehicle(state, level);
    if (v) {
      // 分散初始位置
      v.x = Math.random() * level.mapWidth;
      v.y = Math.random() * level.mapHeight;
      state.vehicles.push(v);
    }
  }
}

// ==================== 渲染函数 ====================
export function renderGame(ctx: CanvasRenderingContext2D, state: GameState, canvasW: number, canvasH: number) {
  const level = LEVELS[state.currentLevel - 1];
  if (!level) return;

  ctx.save();

  // 屏幕震动
  if (state.screenShake > 0.01) {
    const shakeX = (Math.random() - 0.5) * state.screenShake * 20;
    const shakeY = (Math.random() - 0.5) * state.screenShake * 20;
    ctx.translate(shakeX, shakeY);
  }

  // 清空
  ctx.fillStyle = '#3a4a3a';
  ctx.fillRect(-10, -10, canvasW + 20, canvasH + 20);

  // 相机偏移
  ctx.save();
  ctx.translate(-state.camera.x, -state.camera.y);

  // 绘制城市地图（草地 + sidewalk + 道路 + 路口 + 建筑物）
  renderCityMap(ctx, state);

  // 绘制商家
  renderRestaurants(ctx, state);

  // 绘制顾客
  renderCustomers(ctx, state);

  // 绘制交通灯
  renderTrafficLights(ctx, state);

  // 绘制车辆
  renderVehicles(ctx, state);

  // 绘制玩家
  renderPlayer(ctx, state);

  // 绘制粒子
  renderParticles(ctx, state);

  // 绘制浮动文字
  renderFloatingTexts(ctx, state);

  ctx.restore(); // 相机

  // 天气效果
  renderWeather(ctx, state, canvasW, canvasH);

  // 边缘泛红效果
  if (state.vignetteIntensity > 0.01) {
    const gradient = ctx.createRadialGradient(canvasW / 2, canvasH / 2, canvasW * 0.3, canvasW / 2, canvasH / 2, canvasW * 0.7);
    gradient.addColorStop(0, 'rgba(230, 57, 70, 0)');
    gradient.addColorStop(1, `rgba(230, 57, 70, ${state.vignetteIntensity * 0.5})`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvasW, canvasH);
  }

  // 夜间模式暗角
  if (level.weather === 'NIGHT') {
    const nightGradient = ctx.createRadialGradient(canvasW / 2, canvasH / 2, 100, canvasW / 2, canvasH / 2, Math.max(canvasW, canvasH));
    nightGradient.addColorStop(0, 'rgba(0,0,0,0)');
    nightGradient.addColorStop(1, 'rgba(0,0,0,0.6)');
    ctx.fillStyle = nightGradient;
    ctx.fillRect(0, 0, canvasW, canvasH);
  }

  ctx.restore(); // 震动
}


function renderRestaurants(ctx: CanvasRenderingContext2D, state: GameState) {
  for (const r of state.restaurants) {
    const hasPendingOrder = state.orders.some(o => o.restaurantId === r.id && o.status === 'PENDING');

    if (hasPendingOrder) {
      ctx.strokeStyle = '#2A9D8F';
      ctx.lineWidth = 3;
      ctx.strokeRect(r.x - 5, r.y - 5, r.width + 10, r.height + 10);
    }

    // sidewalk 底座（米色矩形表示 sidewalk 店面）
    ctx.fillStyle = '#C4A265';
    ctx.fillRect(r.x - 3, r.y - 3, r.width + 6, r.height + 6);
    ctx.strokeStyle = '#A08050';
    ctx.lineWidth = 1;
    ctx.strokeRect(r.x - 3, r.y - 3, r.width + 6, r.height + 6);

    const img = getImg(r.image);
    if (img) {
      ctx.drawImage(img, r.x, r.y, r.width, r.height);
    } else {
      ctx.fillStyle = '#8B4513';
      ctx.fillRect(r.x, r.y, r.width, r.height);
      ctx.fillStyle = '#FFD700';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(r.name.substring(0, 2), r.x + r.width / 2, r.y + r.height / 2 + 4);
    }

    // 店名
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(r.name, r.x + r.width / 2, r.y - 10);
  }
}

function renderCustomers(ctx: CanvasRenderingContext2D, state: GameState) {
  for (const c of state.customers) {
    const hasOrder = state.orders.some(o => o.customerId === c.id && o.status === 'PICKED_UP');

    if (hasOrder) {
      ctx.strokeStyle = '#E63946';
      ctx.lineWidth = 3;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(c.x - 5, c.y - 5, c.width + 10, c.height + 10);
      ctx.setLineDash([]);
    }

    const img = getImg(c.image);
    if (img) {
      ctx.drawImage(img, c.x, c.y, c.width, c.height);
    } else {
      ctx.fillStyle = '#457B9D';
      ctx.beginPath();
      ctx.arc(c.x + c.width / 2, c.y + c.height / 2, c.width / 2, 0, Math.PI * 2);
      ctx.fill();
    }

    if (hasOrder) {
      ctx.fillStyle = '#E63946';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('!' + c.name, c.x + c.width / 2, c.y - 8);
    }
  }
}

function renderTrafficLights(ctx: CanvasRenderingContext2D, state: GameState) {
  for (const tl of state.trafficLights) {
    const size = 16;
    let color = COLORS.TRAFFIC_RED;
    if (tl.state === 'YELLOW') color = COLORS.TRAFFIC_YELLOW;
    if (tl.state === 'GREEN') color = COLORS.TRAFFIC_GREEN;

    ctx.fillStyle = '#333';
    ctx.fillRect(tl.x - size / 2 - 2, tl.y - size / 2 - 2, size + 4, size + 4);

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(tl.x, tl.y, size / 2, 0, Math.PI * 2);
    ctx.fill();

    // 发光效果
    ctx.shadowColor = color;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(tl.x, tl.y, size / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}

function renderVehicles(ctx: CanvasRenderingContext2D, state: GameState) {
  for (const v of state.vehicles) {
    if (!v.active) continue;

    ctx.save();
    ctx.translate(v.x + v.width / 2, v.y + v.height / 2);
    ctx.rotate(v.rotation);

    const img = getImg(v.image);
    if (img) {
      ctx.drawImage(img, -v.width / 2, -v.height / 2, v.width, v.height);
    } else {
      ctx.fillStyle = v.vehicleType === 'truck' ? '#333' : '#F4A261';
      ctx.fillRect(-v.width / 2, -v.height / 2, v.width, v.height);
    }

    ctx.restore();

    // 刹车灯
    if (v.stopped) {
      ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
      ctx.beginPath();
      ctx.arc(v.x + v.width / 2, v.y + v.height / 2, 20, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function renderPlayer(ctx: CanvasRenderingContext2D, state: GameState) {
  const p = state.player;

  ctx.save();
  ctx.translate(p.x + p.width / 2, p.y + p.height / 2);
  ctx.rotate(p.rotation + Math.PI / 2);

  // 无敌闪烁
  if (p.invincible && Math.floor(Date.now() / 100) % 2 === 0) {
    ctx.globalAlpha = 0.5;
  }

  const img = getImg('assets/images/player.png');
  if (img) {
    ctx.drawImage(img, -p.width / 2, -p.height / 2, p.width, p.height);
  } else {
    ctx.fillStyle = '#457B9D';
    ctx.fillRect(-p.width / 2, -p.height / 2, p.width, p.height);
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('外卖', 0, 4);
  }

  ctx.globalAlpha = 1;
  ctx.restore();

  // 携带订单标记
  if (p.hasOrder) {
    ctx.fillStyle = '#E63946';
    ctx.beginPath();
    ctx.arc(p.x + p.width / 2, p.y - 10, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFF';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('餐', p.x + p.width / 2, p.y - 6);
  }
}

function renderParticles(ctx: CanvasRenderingContext2D, state: GameState) {
  for (const p of state.particles) {
    const alpha = p.life / p.maxLife;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function renderFloatingTexts(ctx: CanvasRenderingContext2D, state: GameState) {
  for (const ft of state.floatingTexts) {
    const alpha = ft.life / ft.maxLife;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = ft.color;
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3;
    ctx.strokeText(ft.text, ft.x, ft.y);
    ctx.fillText(ft.text, ft.x, ft.y);
  }
  ctx.globalAlpha = 1;
}

function renderWeather(ctx: CanvasRenderingContext2D, state: GameState, w: number, h: number) {
  if (state.weather === 'RAIN') {
    ctx.strokeStyle = 'rgba(123, 163, 196, 0.4)';
    ctx.lineWidth = 1;
    const time = Date.now() / 1000;
    for (let i = 0; i < 100; i++) {
      const x = (Math.sin(i * 7.3 + time) * 0.5 + 0.5) * w;
      const y = ((i * 13 + time * 300) % (h + 50)) - 25;
      const len = 10 + Math.random() * 10;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x - 3, y + len);
      ctx.stroke();
    }
  }
}

// ==================== 迷你地图渲染 ====================
export function renderMinimap(ctx: CanvasRenderingContext2D, state: GameState, mx: number, my: number, mw: number, mh: number) {
  const level = LEVELS[state.currentLevel - 1];
  if (!level) return;

  ctx.fillStyle = 'rgba(0,0,0,0.7)';
  ctx.fillRect(mx, my, mw, mh);
  ctx.strokeStyle = '#666';
  ctx.lineWidth = 1;
  ctx.strokeRect(mx, my, mw, mh);

  const scaleX = mw / level.mapWidth;
  const scaleY = mh / level.mapHeight;

  // 道路
  ctx.fillStyle = '#555';
  for (const road of state.roads) {
    ctx.fillRect(mx + road.x * scaleX, my + road.y * scaleY, Math.max(road.width * scaleX, 2), Math.max(road.height * scaleY, 2));
  }

  // 商家 - 有待取餐订单的显示绿色闪烁
  for (const r of state.restaurants) {
    const hasPending = state.orders.some(o => o.restaurantId === r.id && o.status === 'PENDING');
    if (hasPending) {
      // 绿色闪烁方块（更大更醒目）
      ctx.fillStyle = '#2A9D8F';
      ctx.fillRect(mx + r.x * scaleX - 3, my + r.y * scaleY - 3, 6, 6);
      // 脉冲光环效果
      ctx.strokeStyle = `rgba(42, 157, 143, ${0.5 + 0.5 * Math.sin(Date.now() / 200)})`;
      ctx.lineWidth = 1;
      ctx.strokeRect(mx + r.x * scaleX - 4, my + r.y * scaleY - 4, 8, 8);
    } else {
      ctx.fillStyle = '#F4A261';
      ctx.fillRect(mx + r.x * scaleX, my + r.y * scaleY, 2, 2);
    }
  }

  // 顾客 - 有待送餐订单的显示红色闪烁
  for (const c of state.customers) {
    const hasDelivery = state.orders.some(o => o.customerId === c.id && o.status === 'PICKED_UP');
    if (hasDelivery) {
      // 红色闪烁方块（更大更醒目）
      ctx.fillStyle = '#E63946';
      ctx.fillRect(mx + c.x * scaleX - 3, my + c.y * scaleY - 3, 6, 6);
      // 脉冲光环效果
      ctx.strokeStyle = `rgba(230, 57, 70, ${0.5 + 0.5 * Math.sin(Date.now() / 200)})`;
      ctx.lineWidth = 1;
      ctx.strokeRect(mx + c.x * scaleX - 4, my + c.y * scaleY - 4, 8, 8);
    } else {
      ctx.fillStyle = '#457B9D';
      ctx.fillRect(mx + c.x * scaleX, my + c.y * scaleY, 2, 2);
    }
  }

  // 玩家
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(mx + state.player.x * scaleX, my + state.player.y * scaleY, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#E63946';
  ctx.lineWidth = 1;
  ctx.stroke();

  // 视野框
  ctx.strokeStyle = 'rgba(255,255,255,0.3)';
  ctx.strokeRect(mx + state.camera.x * scaleX, my + state.camera.y * scaleY, 800 * scaleX, 600 * scaleY);
}
