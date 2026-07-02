import type {
  GameState, Road, Intersection, TrafficLight, Building,
  Restaurant, Customer, LevelConfig, Vec2,
} from '@/types/game';

// ==================== 常量 ====================
const ROAD_WIDTH = 140;
const SIDEWALK_WIDTH = 50;     // 人行道在道路两侧
const BLOCK_SIZE = 300;        // 街区大小
const PLAYER_SIZE = 40;

const COLORS = {
  GRASS: '#5a7d4a',      // 绿色草地/空地
  ROAD: '#4a4a4a',        // 灰色道路
  SIDEWALK: '#9B8B7A',    // 砖红色人行道
  BUILDING: '#8B7355',    // 建筑物
};

// ==================== 街区网格地图生成 ====================
export function generateCityMap(level: LevelConfig, state: GameState) {
  const { mapWidth, mapHeight } = level;

  // 计算行列数
  const cols = Math.floor((mapWidth - ROAD_WIDTH) / (BLOCK_SIZE + ROAD_WIDTH));
  const rows = Math.floor((mapHeight - ROAD_WIDTH) / (BLOCK_SIZE + ROAD_WIDTH));

  const roads: Road[] = [];
  const intersections: Intersection[] = [];
  const trafficLights: TrafficLight[] = [];
  const buildings: Building[] = [];
  const restaurants: Restaurant[] = [];
  const customers: Customer[] = [];

  // 道路位置（像素坐标）
  const roadXs: number[] = []; // 垂直道路的 x 坐标（道路左边缘）
  const roadYs: number[] = []; // 水平道路的 y 坐标（道路上边缘）

  // 生成道路布局
  for (let c = 0; c <= cols; c++) {
    roadXs.push(ROAD_WIDTH / 2 + c * (BLOCK_SIZE + ROAD_WIDTH) - ROAD_WIDTH / 2);
  }
  for (let r = 0; r <= rows; r++) {
    roadYs.push(ROAD_WIDTH / 2 + r * (BLOCK_SIZE + ROAD_WIDTH) - ROAD_WIDTH / 2);
  }

  // 创建水平道路
  for (const ry of roadYs) {
    roads.push({
      x: 0, y: ry,
      width: mapWidth, height: ROAD_WIDTH,
      direction: 'HORIZONTAL',
      oneWay: false, allowedDirection: null,
    });
  }
  // 创建垂直道路
  for (const rx of roadXs) {
    roads.push({
      x: rx, y: 0,
      width: ROAD_WIDTH, height: mapHeight,
      direction: 'VERTICAL',
      oneWay: false, allowedDirection: null,
    });
  }

  // 创建路口和红绿灯
  let ixId = 0;
  for (let ri = 0; ri < roadYs.length; ri++) {
    for (let ci = 0; ci < roadXs.length; ci++) {
      const ix = roadXs[ci];
      const iy = roadYs[ri];
      const id = `ix_${ixId}`;

      intersections.push({
        id,
        x: ix, y: iy,
        width: ROAD_WIDTH, height: ROAD_WIDTH,
        stopLines: [
          { x: ix - 4, y: iy + ROAD_WIDTH * 0.3, width: 4, height: ROAD_WIDTH * 0.4, direction: 'RIGHT', intersectionId: id },
          { x: ix + ROAD_WIDTH, y: iy + ROAD_WIDTH * 0.3, width: 4, height: ROAD_WIDTH * 0.4, direction: 'LEFT', intersectionId: id },
          { x: ix + ROAD_WIDTH * 0.3, y: iy - 4, width: ROAD_WIDTH * 0.4, height: 4, direction: 'DOWN', intersectionId: id },
          { x: ix + ROAD_WIDTH * 0.3, y: iy + ROAD_WIDTH, width: ROAD_WIDTH * 0.4, height: 4, direction: 'UP', intersectionId: id },
        ],
        trafficLightIds: [],
      });

      // 红绿灯：NS 在路口上方，EW 在路口右方
      const tlOffset = 20;
      const tlNS: TrafficLight = {
        id: `tl_${ixId}_NS`, x: ix + ROAD_WIDTH / 2, y: iy - tlOffset,
        state: (ri + ci) % 2 === 0 ? 'GREEN' : 'RED',
        timer: (ri + ci) % 2 === 0 ? level.greenLightDuration : level.redLightDuration,
        redDuration: level.redLightDuration,
        yellowDuration: level.yellowLightDuration,
        greenDuration: level.greenLightDuration,
        direction: 'NS',
        intersectionId: id,
      };
      const tlEW: TrafficLight = {
        id: `tl_${ixId}_EW`, x: ix + ROAD_WIDTH + tlOffset, y: iy + ROAD_WIDTH / 2,
        state: (ri + ci) % 2 === 0 ? 'RED' : 'GREEN',
        timer: (ri + ci) % 2 === 0 ? level.redLightDuration : level.greenLightDuration,
        redDuration: level.redLightDuration,
        yellowDuration: level.yellowLightDuration,
        greenDuration: level.greenLightDuration,
        direction: 'EW',
        intersectionId: id,
      };
      trafficLights.push(tlNS, tlEW);
      ixId++;
    }
  }

  // 街区 = 道路之间的区域
  const blocks: Array<{ x: number; y: number; w: number; h: number; row: number; col: number }> = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const bx = roadXs[c] + ROAD_WIDTH;
      const by = roadYs[r] + ROAD_WIDTH;
      const bw = roadXs[c + 1] - bx;
      const bh = roadYs[r + 1] - by;
      blocks.push({ x: bx, y: by, w: bw, h: bh, row: r, col: c });
    }
  }

  // 在街区内部生成建筑物
  let bId = 0;
  for (const block of blocks) {
    // 每个街区放1-2个建筑物
    const count = 1 + Math.floor(Math.random() * 2);
    for (let i = 0; i < count; i++) {
      const margin = 30;
      const bw = block.w * 0.3;
      const bh = block.h * 0.3;
      const bx = block.x + margin + (i * block.w * 0.35);
      const by = block.y + margin + Math.random() * (block.h - bh - margin * 2);
      if (bw > 30 && bh > 30) {
        buildings.push({
          id: `b_${bId++}`,
          x: bx, y: by,
          width: bw, height: bh,
          image: '/assets/images/building.png',
        });
      }
    }
  }

  // 商家和顾客放在 sidewalk 上（道路两侧）
  const restaurantNames = ['兰州拉面', '沙县小吃', '黄焖鸡', '麻辣烫', '煎饼果子', '奶茶店', '盖浇饭', '饺子馆'];
  const customerNames = ['张先生', '李女士', '王同学', '赵大哥', '陈小姐', '刘先生', '周阿姨', '吴同学'];

  // sidewalk 候选位置：每条道路两侧，间距合理
  const sidewalkPos: Vec2[] = [];

  // 水平道路的上下 sidewalk
  for (const ry of roadYs) {
    for (let x = 200; x < mapWidth - 200; x += 250) {
      sidewalkPos.push({ x, y: ry - SIDEWALK_WIDTH / 2 }); // 上方
      sidewalkPos.push({ x, y: ry + ROAD_WIDTH + SIDEWALK_WIDTH / 2 }); // 下方
    }
  }
  // 垂直道路的左右 sidewalk
  for (const rx of roadXs) {
    for (let y = 200; y < mapHeight - 200; y += 250) {
      sidewalkPos.push({ x: rx - SIDEWALK_WIDTH / 2, y }); // 左方
      sidewalkPos.push({ x: rx + ROAD_WIDTH + SIDEWALK_WIDTH / 2, y }); // 右方
    }
  }

  // 过滤：在地图内 + 不在路口内 + 不在建筑物上 + 不在道路上
  const MARGIN = 80; // 距离地图边界的最小距离
  const validPos = sidewalkPos.filter(p => {
    // 必须在地图内（留边距）
    if (p.x < MARGIN || p.x > mapWidth - MARGIN || p.y < MARGIN || p.y > mapHeight - MARGIN) return false;
    // 排除路口区域（大缓冲）
    for (const ix of intersections) {
      if (p.x >= ix.x - 60 && p.x <= ix.x + ix.width + 60 &&
          p.y >= ix.y - 60 && p.y <= ix.y + ix.height + 60) return false;
    }
    // 排除建筑物区域
    for (const b of buildings) {
      if (p.x >= b.x - 10 && p.x <= b.x + b.width + 10 &&
          p.y >= b.y - 10 && p.y <= b.y + b.height + 10) return false;
    }
    // 排除道路区域
    for (const r of roads) {
      if (p.x >= r.x && p.x <= r.x + r.width && p.y >= r.y && p.y <= r.y + r.height) return false;
    }
    return true;
  });

  // 打乱
  for (let i = validPos.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [validPos[i], validPos[j]] = [validPos[j], validPos[i]];
  }

  // 生成商家
  const needed = Math.min(level.targetOrders + 3, validPos.length / 2);
  for (let i = 0; i < needed; i++) {
    const pos = validPos[i];
    restaurants.push({
      id: `r_${i}`,
      x: pos.x - 25, y: pos.y - 25,
      width: 50, height: 50,
      vx: 0, vy: 0, rotation: 0, active: true,
      name: restaurantNames[i % restaurantNames.length],
      image: '/assets/images/restaurant.png',
    });
  }
  // 生成顾客
  for (let i = 0; i < needed; i++) {
    const pos = validPos[validPos.length - 1 - i];
    customers.push({
      id: `c_${i}`,
      x: pos.x - 20, y: pos.y - 20,
      width: 40, height: 40,
      vx: 0, vy: 0, rotation: 0, active: true,
      name: customerNames[i % customerNames.length],
      orderId: null,
      image: '/assets/images/customer.png',
      patience: 100,
    });
  }

  // 赋值
  state.roads = roads;
  state.intersections = intersections;
  state.trafficLights = trafficLights;
  state.buildings = buildings;
  state.restaurants = restaurants;
  state.customers = customers;

  // 玩家出生在第一个商家附近的道路中心
  if (restaurants.length > 0) {
    const r = restaurants[0];
    // 找到最近的水平道路中心
    let nearestY = mapHeight / 2;
    let minDist = Infinity;
    for (const ry of roadYs) {
      const d = Math.abs(r.y - (ry + ROAD_WIDTH / 2));
      if (d < minDist) { minDist = d; nearestY = ry + ROAD_WIDTH / 2; }
    }
    state.player.x = r.x;
    state.player.y = nearestY - PLAYER_SIZE / 2;
  }

  // 相机
  state.camera.x = state.player.x - 400;
  state.camera.y = state.player.y - 300;
}

// ==================== 渲染 ====================
export function renderCityMap(ctx: CanvasRenderingContext2D, state: GameState) {
  // 1. 草地背景
  ctx.fillStyle = COLORS.GRASS;
  ctx.fillRect(state.camera.x, state.camera.y, ctx.canvas.width, ctx.canvas.height);

  // 2. 街区（绿色草地中的街区区域）
  for (const road of state.roads) {
    if (road.direction === 'HORIZONTAL') {
      // 道路上方和下方的街区
      // 实际上街区已经在草地中了，不需要额外绘制
    }
  }

  // 3. 人行道（道路两侧）
  ctx.fillStyle = COLORS.SIDEWALK;
  for (const road of state.roads) {
    if (road.direction === 'HORIZONTAL') {
      // 上下 sidewalk
      ctx.fillRect(road.x, road.y - SIDEWALK_WIDTH, road.width, SIDEWALK_WIDTH);
      ctx.fillRect(road.x, road.y + road.height, road.width, SIDEWALK_WIDTH);
    } else {
      // 左右 sidewalk
      ctx.fillRect(road.x - SIDEWALK_WIDTH, road.y, SIDEWALK_WIDTH, road.height);
      ctx.fillRect(road.x + road.width, road.y, SIDEWALK_WIDTH, road.height);
    }
  }

  // 4. 道路
  ctx.fillStyle = COLORS.ROAD;
  for (const road of state.roads) {
    ctx.fillRect(road.x, road.y, road.width, road.height);
    // 中心虚线
    ctx.strokeStyle = '#6a6a6a';
    ctx.lineWidth = 2;
    ctx.setLineDash([20, 20]);
    if (road.direction === 'HORIZONTAL') {
      ctx.beginPath();
      ctx.moveTo(road.x, road.y + road.height / 2);
      ctx.lineTo(road.x + road.width, road.y + road.height / 2);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.moveTo(road.x + road.width / 2, road.y);
      ctx.lineTo(road.x + road.width / 2, road.y + road.height);
      ctx.stroke();
    }
    ctx.setLineDash([]);
  }

  // 5. 路口 - 只画四角 sidewalk + 中心道路（ sidewalks 左方/右方已经在道路 sidewalks 中）
  for (const ix of state.intersections) {
    // 四角 sidewalk（连接两边的 sidewalk）
    ctx.fillStyle = COLORS.SIDEWALK;
    ctx.fillRect(ix.x - SIDEWALK_WIDTH, ix.y - SIDEWALK_WIDTH, SIDEWALK_WIDTH, SIDEWALK_WIDTH);
    ctx.fillRect(ix.x + ix.width, ix.y - SIDEWALK_WIDTH, SIDEWALK_WIDTH, SIDEWALK_WIDTH);
    ctx.fillRect(ix.x - SIDEWALK_WIDTH, ix.y + ix.height, SIDEWALK_WIDTH, SIDEWALK_WIDTH);
    ctx.fillRect(ix.x + ix.width, ix.y + ix.height, SIDEWALK_WIDTH, SIDEWALK_WIDTH);

    // 路口中心（道路颜色）
    ctx.fillStyle = '#4a4a4a';
    ctx.fillRect(ix.x, ix.y, ix.width, ix.height);
    // 停止线
    ctx.fillStyle = '#ffffff';
    for (const sl of ix.stopLines) {
      ctx.fillRect(sl.x, sl.y, sl.width, sl.height);
    }
  }

  // 6. 建筑物
  for (const b of state.buildings) {
    ctx.fillStyle = COLORS.BUILDING;
    ctx.fillRect(b.x, b.y, b.width, b.height);
    ctx.strokeStyle = '#5a4a3a';
    ctx.lineWidth = 2;
    ctx.strokeRect(b.x, b.y, b.width, b.height);
  }
}
