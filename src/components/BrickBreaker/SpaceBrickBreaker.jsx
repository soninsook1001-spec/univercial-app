import React, { useEffect, useRef, useState, useCallback } from 'react';
import './SpaceBrickBreaker.css';
import sound from './SoundEffects';
import { Volume2, VolumeX, Play, RotateCcw, Pause, HelpCircle, Trophy } from 'lucide-react';

// 게임 상수 정의
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const PADDLE_HEIGHT = 16;
const BALL_RADIUS = 8;
const LASER_WIDTH = 4;
const LASER_HEIGHT = 15;
const BRICK_ROWS = 6;
const BRICK_COLS = 10;
const BRICK_HEIGHT = 24;
const BRICK_GAP = 6;
const BRICK_TOP_OFFSET = 60;

// 레벨 벽돌 맵 설계 (1: 일반, 2: 강화, 3: 폭발, 4: 강철/골드, 0: 없음)
const LEVEL_LAYOUTS = [
  // 레벨 1: 기본 아케이드 배치
  [
    [4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
    [2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
    [1, 1, 3, 1, 1, 1, 1, 3, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [0, 0, 1, 1, 0, 0, 1, 1, 0, 0]
  ],
  // 레벨 2: 우주선 인베이더 형태 배치
  [
    [0, 0, 4, 0, 0, 0, 0, 4, 0, 0],
    [0, 2, 2, 2, 0, 0, 2, 2, 2, 0],
    [2, 3, 1, 3, 2, 2, 3, 1, 3, 2],
    [4, 1, 1, 1, 4, 4, 1, 1, 1, 4],
    [4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
    [0, 0, 2, 2, 0, 0, 2, 2, 0, 0]
  ],
  // 레벨 3: 피라미드 & 폭발 코어 배치
  [
    [0, 0, 0, 0, 4, 4, 0, 0, 0, 0],
    [0, 0, 0, 2, 3, 3, 2, 0, 0, 0],
    [0, 0, 2, 4, 1, 1, 4, 2, 0, 0],
    [0, 2, 3, 1, 2, 2, 1, 3, 2, 0],
    [2, 4, 1, 1, 3, 3, 1, 1, 4, 2],
    [4, 1, 1, 1, 4, 4, 1, 1, 1, 4]
  ]
];

export default function SpaceBrickBreaker() {
  const canvasRef = useRef(null);

  // 게임 상태 변수들
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);
  const [gameState, setGameState] = useState('START'); // START, PLAYING, PAUSED, GAMEOVER, VICTORY
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('space_bb_highscore') || '0', 10);
  });
  const [isMuted, setIsMuted] = useState(false);
  const [activeItemsText, setActiveItemsText] = useState([]);
  const [showHelp, setShowHelp] = useState(false);

  // 조작 방식 (mouse / keyboard)
  const [controlType, setControlType] = useState('mouse');

  // 내부 물리 엔진 루프 및 객체들을 저장할 ref
  const gameStateRef = useRef(gameState);
  gameStateRef.current = gameState;

  // 우주선 패들 상태
  const paddleRef = useRef({
    x: CANVAS_WIDTH / 2 - 50,
    y: CANVAS_HEIGHT - 45,
    width: 100,
    height: PADDLE_HEIGHT,
    speed: 8,
    dx: 0, // 이동 방향 및 속도 (기울기 계산용)
    targetWidth: 100,
    hasLaser: false,
    laserTimer: 0,
    expandTimer: 0,
    shieldTimer: 0,
    hasShieldGrid: false // 화면 바닥 쉴드
  });

  // 공 배열 (멀티볼 지원)
  const ballsRef = useRef([]);

  // 벽돌 배열
  const bricksRef = useRef([]);

  // 떨어지는 아이템 배열
  const itemsRef = useRef([]);

  // 레이저 탄환 배열
  const lasersRef = useRef([]);

  // 파티클 폭발 효과 배열
  const particlesRef = useRef([]);

  // 패럴랙스 별배경 배열
  const starsRef = useRef([]);

  // 성운 가스 효과 상태
  const nebulaRef = useRef([
    { x: 200, y: 150, r: 180, color: 'rgba(99, 102, 241, 0.15)', angle: 0, speed: 0.005 },
    { x: 600, y: 400, r: 220, color: 'rgba(236, 72, 153, 0.12)', angle: Math.PI, speed: 0.003 }
  ]);

  // 공 속도 배율
  const speedMultiplierRef = useRef(1); // 1: 일반, 1.5: Speed Up, 0.75: Speed Down
  const speedUpTimerRef = useRef(0);
  const speedDownTimerRef = useRef(0);

  // 키 입력 매핑
  const keysPressed = useRef({
    ArrowLeft: false,
    ArrowRight: false,
    a: false,
    d: false,
    Space: false
  });

  // 레이저 쿨다운
  const lastLaserTime = useRef(0);

  // --- 사운드 제어 ---
  const toggleMute = () => {
    const nextMuted = sound.toggleMute();
    setIsMuted(nextMuted);
  };

  // --- 별배경 생성 ---
  const initStars = () => {
    const stars = [];
    const layers = [
      { speed: 0.15, sizeMax: 1, count: 50, color: '#94a3b8' },
      { speed: 0.4, sizeMax: 1.8, count: 35, color: '#cbd5e1' },
      { speed: 1.0, sizeMax: 2.5, count: 15, color: '#38bdf8' }
    ];

    layers.forEach(layer => {
      for (let i = 0; i < layer.count; i++) {
        stars.push({
          x: Math.random() * CANVAS_WIDTH,
          y: Math.random() * CANVAS_HEIGHT,
          size: Math.random() * layer.sizeMax + 0.5,
          speed: layer.speed,
          color: layer.color,
          twinkleSpeed: Math.random() * 0.02 + 0.005,
          twinklePhase: Math.random() * Math.PI * 2
        });
      }
    });
    starsRef.current = stars;
  };

  // --- 벽돌 생성 ---
  const initBricks = useCallback((lvl) => {
    const layout = LEVEL_LAYOUTS[Math.min(lvl - 1, LEVEL_LAYOUTS.length - 1)];
    const bricks = [];

    // 벽돌 너비 자동 조절
    const brickWidth = (CANVAS_WIDTH - (BRICK_COLS - 1) * BRICK_GAP - 40) / BRICK_COLS;

    for (let r = 0; r < layout.length; r++) {
      for (let c = 0; c < layout[r].length; c++) {
        const type = layout[r][c];
        if (type > 0) {
          bricks.push({
            x: 20 + c * (brickWidth + BRICK_GAP),
            y: BRICK_TOP_OFFSET + r * (BRICK_HEIGHT + BRICK_GAP),
            width: brickWidth,
            height: BRICK_HEIGHT,
            type: type, // 1: 일반, 2: 강화, 3: 폭발, 4: 강철
            maxHp: type === 4 ? 3 : type === 2 ? 2 : 1,
            hp: type === 4 ? 3 : type === 2 ? 2 : 1,
            scoreValue: type === 4 ? 500 : type === 3 ? 300 : type === 2 ? 200 : 100
          });
        }
      }
    }
    bricksRef.current = bricks;
  }, []);

  // --- 공 초기화 ---
  const initBalls = () => {
    ballsRef.current = [
      {
        x: CANVAS_WIDTH / 2,
        y: CANVAS_HEIGHT - 70,
        vx: (Math.random() * 4 - 2) || 2, // 0 방지
        vy: -5,
        radius: BALL_RADIUS,
        trail: [] // 잔상 위치 히스토리
      }
    ];
    speedMultiplierRef.current = 1.0;
    speedUpTimerRef.current = 0;
    speedDownTimerRef.current = 0;
  };

  // --- 초기화 통합 ---
  const restartGame = (resetScoreAndLives = true) => {
    if (resetScoreAndLives) {
      setScore(0);
      setLives(3);
      setLevel(1);
      initBricks(1);
    } else {
      initBricks(level);
    }

    initStars();
    initBalls();
    itemsRef.current = [];
    lasersRef.current = [];
    particlesRef.current = [];

    // 패들 상태 초기화
    paddleRef.current = {
      x: CANVAS_WIDTH / 2 - 50,
      y: CANVAS_HEIGHT - 45,
      width: 100,
      height: PADDLE_HEIGHT,
      speed: 8,
      dx: 0,
      targetWidth: 100,
      hasLaser: false,
      laserTimer: 0,
      expandTimer: 0,
      shieldTimer: 0,
      hasShieldGrid: false
    };

    setGameState('PLAYING');
    sound.init();
  };

  // --- 파티클 폭발 생성 ---
  const createExplosion = (x, y, color, count = 12) => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 4 + 1.5;
      particlesRef.current.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1, // 위쪽으로 튀도록 미세 보정
        radius: Math.random() * 3 + 1,
        color: color,
        alpha: 1.0,
        decay: Math.random() * 0.03 + 0.015
      });
    }
  };

  // --- 아이템 생성 로직 ---
  const spawnItem = (x, y) => {
    // 20% 확률로 아이템 등장
    if (Math.random() > 0.22) return;

    const itemTypes = [
      { type: 'SPEED_UP', color: '#ef4444', label: 'S+', desc: '공 속도 증가 (점수 x2)' },
      { type: 'SPEED_DOWN', color: '#10b981', label: 'S-', desc: '공 속도 감소' },
      { type: 'EXPAND', color: '#3b82f6', label: 'E', desc: '쉴드 패들 확대' },
      { type: 'LASER', color: '#eab308', label: 'L', desc: '레이저 무기 장착' },
      { type: 'MULTIBALL', color: '#ec4899', label: 'M', desc: '멀티볼 추가' },
      { type: 'SHIELD_GRID', color: '#a855f7', label: 'G', desc: '바닥 방어막 설치' },
      { type: 'LIFE', color: '#f43f5e', label: '♥', desc: '생명 증가' }
    ];

    // 가끔 속도가 빨라지는 아이템이 떨어지게 해달라는 기획 요구를 반영하여 SPEED_UP 확률 가중
    let rand = Math.random();
    let selectedType;
    if (rand < 0.25) {
      selectedType = itemTypes[0]; // SPEED_UP (25% 확률)
    } else {
      selectedType = itemTypes[Math.floor(Math.random() * (itemTypes.length - 1)) + 1];
    }

    itemsRef.current.push({
      x: x,
      y: y,
      width: 22,
      height: 22,
      vy: 2.2,
      ...selectedType
    });
  };

  // --- 폭발 벽돌 체인 액션 ---
  const triggerBrickExplosion = (targetBrick, currentBricks) => {
    sound.playExplosion();
    createExplosion(targetBrick.x + targetBrick.width / 2, targetBrick.y + targetBrick.height / 2, '#ef4444', 20);

    const radius = 90; // 폭발 반경
    const bx = targetBrick.x + targetBrick.width / 2;
    const by = targetBrick.y + targetBrick.height / 2;

    // 인접 벽돌들 동시 제거/데미지
    currentBricks.forEach(brick => {
      if (brick === targetBrick) return;

      const brickCenterX = brick.x + brick.width / 2;
      const brickCenterY = brick.y + brick.height / 2;
      const dist = Math.hypot(brickCenterX - bx, brickCenterY - by);

      if (dist <= radius) {
        if (brick.type === 4) {
          brick.hp -= 1; // 강철 벽돌은 피격
        } else {
          brick.hp = 0; // 일반/폭발 등은 한 번에 파괴
        }
      }
    });
  };

  // --- 레이저 발사 ---
  const fireLaser = () => {
    const now = Date.now();
    if (now - lastLaserTime.current < 250) return; // 쿨다운 250ms
    lastLaserTime.current = now;

    sound.playLaser();
    const paddle = paddleRef.current;
    // 패들의 좌측 날개와 우측 날개에서 2발 발사
    lasersRef.current.push({
      x: paddle.x + 8,
      y: paddle.y - 5,
      vy: -8
    });
    lasersRef.current.push({
      x: paddle.x + paddle.width - 12,
      y: paddle.y - 5,
      vy: -8
    });
  };

  // 키보드 조작 이벤트 리스너 설정
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['ArrowLeft', 'ArrowRight', 'a', 'd', 'KeyA', 'KeyD'].includes(e.code) || e.code === 'Space') {
        setControlType('keyboard');
      }

      if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        keysPressed.current.ArrowLeft = true;
      }
      if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        keysPressed.current.ArrowRight = true;
      }
      if (e.code === 'Space') {
        keysPressed.current.Space = true;
        if (gameStateRef.current === 'PLAYING' && paddleRef.current.hasLaser) {
          fireLaser();
        }
      }
      if (e.code === 'Escape') {
        if (gameStateRef.current === 'PLAYING') {
          setGameState('PAUSED');
        } else if (gameStateRef.current === 'PAUSED') {
          setGameState('PLAYING');
        }
      }
    };

    const handleKeyUp = (e) => {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        keysPressed.current.ArrowLeft = false;
      }
      if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        keysPressed.current.ArrowRight = false;
      }
      if (e.code === 'Space') {
        keysPressed.current.Space = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // 마우스 조작 리스너 설정
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (gameStateRef.current !== 'PLAYING') return;

      const canvas = canvasRef.current;
      if (!canvas) return;

      // 마우스가 움직이면 마우스 제어 모드로 복귀
      setControlType('mouse');

      const rect = canvas.getBoundingClientRect();
      const relativeX = (e.clientX - rect.left) * (CANVAS_WIDTH / rect.width);

      const paddle = paddleRef.current;
      const targetX = Math.max(0, Math.min(CANVAS_WIDTH - paddle.width, relativeX - paddle.width / 2));

      // 부드러운 기우뚱(Tilt) 애니메이션을 위해 이전 x값과의 차이를 저장
      paddle.dx = targetX - paddle.x;
      paddle.x = targetX;
    };

    const handleCanvasClick = () => {
      if (gameStateRef.current === 'PLAYING' && paddleRef.current.hasLaser) {
        fireLaser();
      }
    };

    const canvas = canvasRef.current;
    if (canvas) {
      window.addEventListener('mousemove', handleMouseMove);
      canvas.addEventListener('click', handleCanvasClick);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (canvas) {
        canvas.removeEventListener('click', handleCanvasClick);
      }
    };
  }, []);

  // 하이스코어 동기화
  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('space_bb_highscore', score.toString());
    }
  }, [score, highScore]);

  // 액티브 아이템 텍스트 목록 갱신을 위한 타이머 루프
  useEffect(() => {
    const interval = setInterval(() => {
      if (gameStateRef.current !== 'PLAYING') return;

      const active = [];
      const p = paddleRef.current;
      if (p.hasLaser) active.push(`레이저 함선 (${Math.max(0, Math.ceil(p.laserTimer / 60))}s)`);
      if (p.width > 100) active.push(`보호막 확장 (${Math.max(0, Math.ceil(p.expandTimer / 60))}s)`);
      if (p.hasShieldGrid) active.push(`행성 방어 그리드(Active)`);

      if (speedUpTimerRef.current > 0) {
        active.push(`공 과부하 스피드업 (${Math.max(0, Math.ceil(speedUpTimerRef.current / 60))}s)`);
      }
      if (speedDownTimerRef.current > 0) {
        active.push(`공 감속 필드 (${Math.max(0, Math.ceil(speedDownTimerRef.current / 60))}s)`);
      }

      setActiveItemsText(active);
    }, 150);

    return () => clearInterval(interval);
  }, []);

  // 게임 물리 엔진 메인 렌더링 루프
  useEffect(() => {
    let animationId;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // 벽돌 맵 첫 로드
    initBricks(level);
    initStars();
    initBalls();

    // 메인 루프 함수
    const updateAndRender = () => {
      if (!ctx || !canvas) return;

      // 1. 화면 비우기
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // --- 2. 우주 성운 배경 그리기 (Nebula Effect) ---
      nebulaRef.current.forEach(neb => {
        neb.angle += neb.speed;
        const driftX = Math.sin(neb.angle) * 15;
        const driftY = Math.cos(neb.angle) * 10;

        const grad = ctx.createRadialGradient(
          neb.x + driftX, neb.y + driftY, 0,
          neb.x + driftX, neb.y + driftY, neb.r
        );
        grad.addColorStop(0, neb.color);
        grad.addColorStop(1, 'rgba(0,0,0,0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(neb.x + driftX, neb.y + driftY, neb.r, 0, Math.PI * 2);
        ctx.fill();
      });

      // --- 3. 패럴랙스 별 무리 이동 및 그리기 ---
      starsRef.current.forEach(star => {
        if (gameStateRef.current === 'PLAYING') {
          star.y += star.speed;
          if (star.y > CANVAS_HEIGHT) {
            star.y = 0;
            star.x = Math.random() * CANVAS_WIDTH;
          }
        }

        // 반짝임 적용 (Twinkle)
        star.twinklePhase += star.twinkleSpeed;
        const alpha = 0.5 + Math.sin(star.twinklePhase) * 0.4;

        ctx.fillStyle = star.color;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
      });

      const paddle = paddleRef.current;

      if (gameStateRef.current === 'PLAYING') {
        // --- 4. 타이머 감소 관리 ---
        if (paddle.hasLaser) {
          paddle.laserTimer--;
          if (paddle.laserTimer <= 0) paddle.hasLaser = false;
        }

        if (paddle.expandTimer > 0) {
          paddle.expandTimer--;
          if (paddle.expandTimer <= 0) {
            paddle.targetWidth = 100;
          }
        }

        if (speedUpTimerRef.current > 0) {
          speedUpTimerRef.current--;
          if (speedUpTimerRef.current <= 0) speedMultiplierRef.current = 1.0;
        }

        if (speedDownTimerRef.current > 0) {
          speedDownTimerRef.current--;
          if (speedDownTimerRef.current <= 0) speedMultiplierRef.current = 1.0;
        }

        // 패들 크기 보간 (부드러운 크기 증가/감소)
        if (paddle.width !== paddle.targetWidth) {
          const diff = paddle.targetWidth - paddle.width;
          paddle.width += diff * 0.1;
        }

        // --- 5. 키보드 조작 패들 이동 ---
        if (controlType === 'keyboard') {
          let movement = 0;
          if (keysPressed.current.ArrowLeft) {
            movement = -paddle.speed;
          }
          if (keysPressed.current.ArrowRight) {
            movement = paddle.speed;
          }
          paddle.dx = movement;
          paddle.x = Math.max(0, Math.min(CANVAS_WIDTH - paddle.width, paddle.x + movement));
        }

        // --- 6. 레이저 빔 이동 및 충돌 감지 ---
        lasersRef.current.forEach((laser, lIdx) => {
          laser.y += laser.vy;

          // 벽돌과 충돌
          bricksRef.current.forEach(brick => {
            if (brick.hp > 0 &&
                laser.x > brick.x &&
                laser.x < brick.x + brick.width &&
                laser.y > brick.y &&
                laser.y < brick.y + brick.height) {
              
              // 레이저 소멸
              laser.markedForDeletion = true;

              // 벽돌 체력 감소
              if (brick.type !== 4) {
                brick.hp -= 1;
              } else {
                brick.hp -= 0.5; // 강철 벽돌은 레이저 데미지가 낮음
              }

              if (brick.hp <= 0) {
                // 부서짐
                setScore(prev => prev + brick.scoreValue * (speedMultiplierRef.current > 1 ? 2 : 1));
                if (brick.type === 3) {
                  triggerBrickExplosion(brick, bricksRef.current);
                } else {
                  sound.playExplosion();
                  createExplosion(brick.x + brick.width / 2, brick.y + brick.height / 2, getColorForBrick(brick.type));
                }
                spawnItem(brick.x + brick.width / 2, brick.y + brick.height);
              } else {
                sound.playHitBrick();
                createExplosion(laser.x, laser.y, '#eab308', 4);
              }
            }
          });

          // 화면 상단 이탈
          if (laser.y < 0) laser.markedForDeletion = true;
        });
        lasersRef.current = lasersRef.current.filter(l => !l.markedForDeletion);

        // --- 7. 아이템 낙하 및 획득 ---
        itemsRef.current.forEach((item, iIdx) => {
          item.y += item.vy;

          // 패들과 충돌
          if (item.y + item.height >= paddle.y &&
              item.x + item.width >= paddle.x &&
              item.x <= paddle.x + paddle.width &&
              item.y <= paddle.y + paddle.height) {
            
            // 아이템 획득 효과음
            sound.playPowerUp();
            item.markedForDeletion = true;

            // 쉴드 스파크 연출
            createExplosion(item.x + 10, paddle.y, item.color, 15);

            // 아이템 타입별 로직 적용
            switch (item.type) {
              case 'SPEED_UP':
                speedMultiplierRef.current = 1.6;
                speedUpTimerRef.current = 600; // 약 10초
                speedDownTimerRef.current = 0;
                break;
              case 'SPEED_DOWN':
                speedMultiplierRef.current = 0.65;
                speedDownTimerRef.current = 600;
                speedUpTimerRef.current = 0;
                break;
              case 'EXPAND':
                paddle.targetWidth = 150;
                paddle.expandTimer = 720; // 약 12초
                break;
              case 'LASER':
                paddle.hasLaser = true;
                paddle.laserTimer = 600; // 약 10초
                break;
              case 'MULTIBALL':
                // 현재 있는 모든 공을 3갈래로 분배
                const newBalls = [];
                ballsRef.current.forEach(ball => {
                  const baseAngle = Math.atan2(ball.vy, ball.vx);
                  // 왼쪽 20도, 오른쪽 20도 회전한 공 2개 추가
                  const angleDiff = 25 * (Math.PI / 180);
                  const speed = Math.hypot(ball.vx, ball.vy);

                  newBalls.push({
                    x: ball.x,
                    y: ball.y,
                    vx: Math.cos(baseAngle - angleDiff) * speed,
                    vy: Math.sin(baseAngle - angleDiff) * speed,
                    radius: BALL_RADIUS,
                    trail: []
                  });
                  newBalls.push({
                    x: ball.x,
                    y: ball.y,
                    vx: Math.cos(baseAngle + angleDiff) * speed,
                    vy: Math.sin(baseAngle + angleDiff) * speed,
                    radius: BALL_RADIUS,
                    trail: []
                  });
                });
                ballsRef.current.push(...newBalls);
                break;
              case 'SHIELD_GRID':
                paddle.hasShieldGrid = true;
                break;
              case 'LIFE':
                setLives(l => Math.min(5, l + 1));
                break;
              default:
                break;
            }
          }

          // 화면 바닥 낙사
          if (item.y > CANVAS_HEIGHT) item.markedForDeletion = true;
        });
        itemsRef.current = itemsRef.current.filter(i => !i.markedForDeletion);

        // --- 8. 공 이동 및 물리 계산 ---
        ballsRef.current.forEach((ball, bIdx) => {
          // 잔상(trail) 기록
          ball.trail.push({ x: ball.x, y: ball.y });
          if (ball.trail.length > 7) ball.trail.shift();

          // 속도 계수 반영 이동
          const baseSpeed = 5.5;
          const currentSpeed = baseSpeed * speedMultiplierRef.current;
          
          // 방향 벡터 노멀라이즈 후 적용
          const length = Math.hypot(ball.vx, ball.vy);
          if (length > 0) {
            ball.x += (ball.vx / length) * currentSpeed;
            ball.y += (ball.vy / length) * currentSpeed;
          }

          // 벽 충돌 (좌/우)
          if (ball.x - ball.radius <= 0) {
            ball.x = ball.radius;
            ball.vx = -ball.vx;
            sound.playHitPaddle();
            createExplosion(0, ball.y, '#38bdf8', 4);
          } else if (ball.x + ball.radius >= CANVAS_WIDTH) {
            ball.x = CANVAS_WIDTH - ball.radius;
            ball.vx = -ball.vx;
            sound.playHitPaddle();
            createExplosion(CANVAS_WIDTH, ball.y, '#38bdf8', 4);
          }

          // 벽 충돌 (상단)
          if (ball.y - ball.radius <= 0) {
            ball.y = ball.radius;
            ball.vy = -ball.vy;
            sound.playHitPaddle();
            createExplosion(ball.x, 0, '#38bdf8', 4);
          }

          // 화면 밑바닥 안전 그리드(방호벽) 작동
          if (paddle.hasShieldGrid && ball.y + ball.radius >= CANVAS_HEIGHT - 12) {
            ball.y = CANVAS_HEIGHT - 12 - ball.radius;
            ball.vy = -Math.abs(ball.vy);
            paddle.hasShieldGrid = false; // 일회용 소멸
            sound.playHitPaddle();
            createExplosion(ball.x, CANVAS_HEIGHT - 10, '#a855f7', 25);
          }

          // 패들과 충돌
          if (ball.y + ball.radius >= paddle.y &&
              ball.y - ball.radius <= paddle.y + paddle.height &&
              ball.x + ball.radius >= paddle.x &&
              ball.x - ball.radius <= paddle.x + paddle.width) {
            
            // 튕기기
            ball.y = paddle.y - ball.radius;
            
            // 튕김 각도 조절: 패들의 중심에서 맞은 부위의 상대 위치에 따라 튀는 방향 조절
            const paddleCenter = paddle.x + paddle.width / 2;
            const hitOffset = ball.x - paddleCenter;
            const normalizedHit = hitOffset / (paddle.width / 2); // -1.0 ~ 1.0
            
            const maxBounceAngle = 60 * (Math.PI / 180); // 최대 60도
            const bounceAngle = normalizedHit * maxBounceAngle;

            const speed = Math.hypot(ball.vx, ball.vy);
            ball.vx = speed * Math.sin(bounceAngle);
            ball.vy = -speed * Math.cos(bounceAngle);

            sound.playHitPaddle();
            // 패들 스파크
            createExplosion(ball.x, paddle.y, '#00f6ff', 8);
          }

          // 벽돌과 충돌
          bricksRef.current.forEach(brick => {
            if (brick.hp <= 0) return;

            // 벽돌 사각형과 공의 충돌
            // 가장 가까운 좌표 계산 (AABB vs Circle)
            const closestX = Math.max(brick.x, Math.min(ball.x, brick.x + brick.width));
            const closestY = Math.max(brick.y, Math.min(ball.y, brick.y + brick.height));

            const distanceX = ball.x - closestX;
            const distanceY = ball.y - closestY;
            const distanceSquared = (distanceX * distanceX) + (distanceY * distanceY);

            if (distanceSquared < ball.radius * ball.radius) {
              // 충돌 감지!
              // 부딪힌 면 판단
              const overlapX = ball.radius - Math.abs(distanceX);
              const overlapY = ball.radius - Math.abs(distanceY);

              if (closestX === brick.x || closestX === brick.x + brick.width) {
                // 좌우 측면 충돌
                if (overlapX < overlapY) {
                  ball.vx = -ball.vx;
                  ball.x += ball.vx > 0 ? overlapX : -overlapX;
                } else {
                  ball.vy = -ball.vy;
                  ball.y += ball.vy > 0 ? overlapY : -overlapY;
                }
              } else {
                // 상하 충돌
                ball.vy = -ball.vy;
                ball.y += ball.vy > 0 ? overlapY : -overlapY;
              }

              // 벽돌 데미지 처리
              brick.hp -= 1;
              if (brick.hp <= 0) {
                setScore(prev => prev + brick.scoreValue * (speedMultiplierRef.current > 1 ? 2 : 1));
                
                if (brick.type === 3) {
                  // 폭발 벽돌 체인
                  triggerBrickExplosion(brick, bricksRef.current);
                } else {
                  sound.playExplosion();
                  createExplosion(brick.x + brick.width / 2, brick.y + brick.height / 2, getColorForBrick(brick.type));
                }

                // 아이템 드랍 시도
                spawnItem(brick.x + brick.width / 2, brick.y + brick.height);
              } else {
                sound.playHitBrick();
                createExplosion(closestX, closestY, getColorForBrick(brick.type), 6);
              }
            }
          });

          // 바닥 이탈 감지 (낙사)
          if (ball.y - ball.radius > CANVAS_HEIGHT) {
            ball.markedForDeletion = true;
          }
        });

        // 죽은 공 제거
        ballsRef.current = ballsRef.current.filter(b => !b.markedForDeletion);

        // 공이 모두 없어지면 라이프 감소 및 재생성
        if (ballsRef.current.length === 0) {
          setLives(prevLives => {
            const nextLives = prevLives - 1;
            if (nextLives <= 0) {
              sound.playGameOver();
              setGameState('GAMEOVER');
            } else {
              initBalls();
              // 패들 초기화 (마이너 효과들 초기화)
              paddle.hasLaser = false;
              paddle.laserTimer = 0;
              paddle.targetWidth = 100;
              paddle.expandTimer = 0;
            }
            return nextLives;
          });
        }

        // 스테이지 클리어 검증 (파괴 가능한 벽돌이 모두 파괴되었는지)
        const breakableLeft = bricksRef.current.filter(b => b.hp > 0 && b.type !== 4).length;
        if (breakableLeft === 0 && bricksRef.current.length > 0) {
          sound.playLevelUp();
          
          if (level < LEVEL_LAYOUTS.length) {
            // 다음 스테이지
            const nextLvl = level + 1;
            setLevel(nextLvl);
            initBricks(nextLvl);
            initBalls();
            itemsRef.current = [];
            lasersRef.current = [];
          } else {
            // 전체 올 클리어 승리
            setGameState('VICTORY');
          }
        }
      }

      // --- 9. 드로잉: 파티클(Particle Sparks) 렌더링 ---
      particlesRef.current.forEach((part, pIdx) => {
        if (gameStateRef.current === 'PLAYING') {
          part.x += part.vx;
          part.y += part.vy;
          part.alpha -= part.decay;
        }

        if (part.alpha > 0) {
          ctx.fillStyle = part.color;
          ctx.globalAlpha = part.alpha;
          ctx.beginPath();
          ctx.arc(part.x, part.y, part.radius, 0, Math.PI * 2);
          ctx.fill();
        }
      });
      ctx.globalAlpha = 1.0;
      particlesRef.current = particlesRef.current.filter(p => p.alpha > 0);

      // --- 10. 드로잉: 바닥 쉴드망 렌더링 ---
      if (paddle.hasShieldGrid) {
        ctx.save();
        ctx.strokeStyle = 'rgba(168, 85, 247, 0.65)';
        ctx.lineWidth = 4;
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#a855f7';
        ctx.beginPath();
        // 격자 격문 무늬(Grid line)
        ctx.moveTo(0, CANVAS_HEIGHT - 6);
        ctx.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT - 6);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(168, 85, 247, 0.35)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let gx = 0; gx < CANVAS_WIDTH; gx += 40) {
          ctx.moveTo(gx, CANVAS_HEIGHT - 12);
          ctx.lineTo(gx + 15, CANVAS_HEIGHT - 2);
        }
        ctx.stroke();
        ctx.restore();
      }

      // --- 11. 드로잉: 레이저 빔 그리기 ---
      lasersRef.current.forEach(laser => {
        ctx.save();
        ctx.fillStyle = '#facc15';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#facc15';
        ctx.fillRect(laser.x - LASER_WIDTH / 2, laser.y, LASER_WIDTH, LASER_HEIGHT);
        ctx.restore();
      });

      // --- 12. 드로잉: 떨어지는 아이템 캡슐 그리기 ---
      itemsRef.current.forEach(item => {
        ctx.save();
        // 캡슐 외곽 원형 네온
        ctx.strokeStyle = item.color;
        ctx.lineWidth = 2.5;
        ctx.shadowBlur = 8;
        ctx.shadowColor = item.color;
        
        ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
        ctx.beginPath();
        ctx.arc(item.x + 11, item.y + 11, 11, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // 아이콘 텍스트 렌더링
        ctx.fillStyle = item.color;
        ctx.font = 'bold 11px Orbitron, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(item.label, item.x + 11, item.y + 11);
        ctx.restore();
      });

      // --- 13. 드로잉: 벽돌 그리기 ---
      bricksRef.current.forEach(brick => {
        if (brick.hp <= 0) return;

        ctx.save();
        const baseColor = getColorForBrick(brick.type);
        
        // 내구도(체력)에 따른 투명도 조절로 손상 느낌 부여
        let colorGrad = ctx.createLinearGradient(brick.x, brick.y, brick.x, brick.y + brick.height);
        
        if (brick.type === 4) {
          // 강철/골드는 3스택 그라데이션
          colorGrad.addColorStop(0, '#fde047'); // 황금빛
          colorGrad.addColorStop(0.5, '#ca8a04');
          colorGrad.addColorStop(1, '#854d0e');
        } else {
          colorGrad.addColorStop(0, lightenDarkenColor(baseColor, 40));
          colorGrad.addColorStop(1, lightenDarkenColor(baseColor, -40));
        }

        ctx.fillStyle = colorGrad;
        
        // 네온 테두리
        ctx.strokeStyle = baseColor;
        ctx.lineWidth = 1.5;
        ctx.shadowBlur = 5;
        ctx.shadowColor = baseColor;

        // 둥근 사각형 그리기 (Rounded Rect)
        drawRoundedRect(ctx, brick.x, brick.y, brick.width, brick.height, 4);
        ctx.fill();
        ctx.stroke();

        // 2회 타격 강화 벽돌이 데미지 입었을 때 금이 간 효과
        if (brick.type === 2 && brick.hp === 1) {
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(brick.x + 5, brick.y + 5);
          ctx.lineTo(brick.x + brick.width / 2, brick.y + brick.height / 2);
          ctx.lineTo(brick.x + brick.width - 8, brick.y + 3);
          ctx.moveTo(brick.x + brick.width / 2, brick.y + brick.height / 2);
          ctx.lineTo(brick.x + 10, brick.y + brick.height - 6);
          ctx.stroke();
        }

        // 강철(4등급) 벽돌의 내구도 선
        if (brick.type === 4) {
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          // 강철 질감 격자
          ctx.moveTo(brick.x + brick.width * 0.3, brick.y);
          ctx.lineTo(brick.x + brick.width * 0.3, brick.y + brick.height);
          ctx.moveTo(brick.x + brick.width * 0.7, brick.y);
          ctx.lineTo(brick.x + brick.width * 0.7, brick.y + brick.height);
          ctx.stroke();

          // HP 잔량 크랙
          if (brick.hp <= 2) {
            ctx.strokeStyle = '#ef4444';
            ctx.beginPath();
            ctx.moveTo(brick.x + 10, brick.y + 5);
            ctx.lineTo(brick.x + 20, brick.y + 18);
            if (brick.hp === 1) {
              ctx.lineTo(brick.x + brick.width - 15, brick.y + 12);
            }
            ctx.stroke();
          }
        }

        ctx.restore();
      });

      // --- 14. 드로잉: 공 그리기 (잔상 꼬리 포함) ---
      ballsRef.current.forEach(ball => {
        ctx.save();
        
        // 속도에 따라 글로우 색상 다르게 (Speed Up: 빨강, Speed Down: 민트, 일반: 시안)
        let glowColor = '#00f6ff';
        if (speedMultiplierRef.current > 1.2) glowColor = '#f43f5e';
        else if (speedMultiplierRef.current < 0.8) glowColor = '#10b981';

        // 1) 꼬리 그리기 (Trail)
        ball.trail.forEach((pos, idx) => {
          const ratio = (idx + 1) / ball.trail.length;
          ctx.fillStyle = glowColor;
          ctx.globalAlpha = ratio * 0.25;
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, ball.radius * ratio, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.globalAlpha = 1.0;

        // 2) 실제 공 그리기
        ctx.fillStyle = '#ffffff';
        ctx.shadowBlur = 12;
        ctx.shadowColor = glowColor;
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // --- 15. 드로잉: 우주선(패들) 그리기 ---
      ctx.save();
      // 패들 조작에 따른 살짝 기우는 효과 (Tilt)
      const maxTiltAngle = 7 * (Math.PI / 180); // 7도
      // 프레임 이동속도 dx에 비례하여 틸트 산정
      const tiltVal = Math.max(-1, Math.min(1, paddle.dx * 0.12));
      const tiltAngle = tiltVal * maxTiltAngle;

      ctx.translate(paddle.x + paddle.width / 2, paddle.y + paddle.height / 2);
      ctx.rotate(tiltAngle);

      const px = -paddle.width / 2;
      const py = -paddle.height / 2;

      // 엔진 추진 화염 효과 (Flame booster animation)
      if (gameStateRef.current === 'PLAYING') {
        const flameHeight = Math.random() * 15 + 10;
        ctx.fillStyle = Math.random() > 0.5 ? '#f97316' : '#ef4444';
        
        // 왼쪽 제트 부스터 불꽃
        ctx.beginPath();
        ctx.moveTo(px + paddle.width * 0.2, py + paddle.height);
        ctx.lineTo(px + paddle.width * 0.25, py + paddle.height + flameHeight);
        ctx.lineTo(px + paddle.width * 0.3, py + paddle.height);
        ctx.closePath();
        ctx.fill();

        // 오른쪽 제트 부스터 불꽃
        ctx.beginPath();
        ctx.moveTo(px + paddle.width * 0.7, py + paddle.height);
        ctx.lineTo(px + paddle.width * 0.75, py + paddle.height + flameHeight);
        ctx.lineTo(px + paddle.width * 0.8, py + paddle.height);
        ctx.closePath();
        ctx.fill();
      }

      // 우주선 동체 그리기 (삼각형 윙 스타일)
      ctx.fillStyle = '#e2e8f0'; // 기체 색
      ctx.strokeStyle = '#00f6ff'; // 네온 라인
      ctx.lineWidth = 2;
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#00f6ff';

      ctx.beginPath();
      // 머리 부분 (콕핏)
      ctx.moveTo(0, py - 6);
      // 우측 날개
      ctx.lineTo(paddle.width * 0.4, py + 2);
      ctx.lineTo(paddle.width * 0.5, py + paddle.height - 2);
      ctx.lineTo(paddle.width * 0.3, py + paddle.height);
      // 왼쪽 날개 대칭
      ctx.lineTo(-paddle.width * 0.3, py + paddle.height);
      ctx.lineTo(-paddle.width * 0.5, py + paddle.height - 2);
      ctx.lineTo(-paddle.width * 0.4, py + 2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // 콕핏 유리창 (Cyan)
      ctx.fillStyle = '#06b6d4';
      ctx.shadowBlur = 0;
      ctx.beginPath();
      ctx.moveTo(0, py - 3);
      ctx.lineTo(paddle.width * 0.12, py + 4);
      ctx.lineTo(-paddle.width * 0.12, py + 4);
      ctx.closePath();
      ctx.fill();

      // 레이저 무기 장착 시 레이저 포문 추가
      if (paddle.hasLaser) {
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 2.5;
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#facc15';

        // 왼쪽 날개 포대
        ctx.beginPath();
        ctx.moveTo(px + 8, py + 8);
        ctx.lineTo(px + 8, py - 4);
        ctx.stroke();

        // 오른쪽 날개 포대
        ctx.beginPath();
        ctx.moveTo(px + paddle.width - 8, py + 8);
        ctx.lineTo(px + paddle.width - 8, py - 4);
        ctx.stroke();
      }

      ctx.restore();

      // 패들 dx 감쇠 (키보드 멈췄을 때 기울기 복원을 위해)
      paddle.dx *= 0.85;

      // 루프 계속
      animationId = requestAnimationFrame(updateAndRender);
    };

    animationId = requestAnimationFrame(updateAndRender);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [level, controlType, initBricks]);

  // 벽돌 컬러 헬퍼
  const getColorForBrick = (type) => {
    switch (type) {
      case 1: return '#06b6d4'; // Cyan (일반)
      case 2: return '#a855f7'; // Purple (강화)
      case 3: return '#ef4444'; // Red (폭발)
      case 4: return '#fbbf24'; // Gold (단단한/강철)
      default: return '#cbd5e1';
    }
  };

  // 둥근 모서리 사각형 그리기 헬퍼
  const drawRoundedRect = (ctx, x, y, width, height, radius) => {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  };

  // 색상 톤 조절 헬퍼
  const lightenDarkenColor = (col, amt) => {
    let usePound = false;
    if (col[0] === "#") {
      col = col.slice(1);
      usePound = true;
    }
    let num = parseInt(col, 16);
    let r = (num >> 16) + amt;
    if (r > 255) r = 255;
    else if (r < 0) r = 0;
    let b = ((num >> 8) & 0x00FF) + amt;
    if (b > 255) b = 255;
    else if (b < 0) b = 0;
    let g = (num & 0x0000FF) + amt;
    if (g > 255) g = 255;
    else if (g < 0) g = 0;
    return (usePound ? "#" : "") + (g | (b << 8) | (r << 16)).toString(16).padStart(6, '0');
  };

  return (
    <div className="game-wrapper">
      <div className="game-hud-container">
        {/* 상단 스코어 / 최고점수 전광판 */}
        <div className="hud-panel glass">
          <div className="hud-item text-glow-cyan">
            <span className="hud-label">SCORE</span>
            <span className="hud-value">{score}</span>
          </div>

          <div className="hud-center">
            <h1 className="game-title">COSMIC BREAKER</h1>
            <div className="hud-level text-glow-purple">STAGE {level}</div>
          </div>

          <div className="hud-item text-glow-gold">
            <span className="hud-label"><Trophy size={14} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} /> BEST</span>
            <span className="hud-value">{highScore}</span>
          </div>
        </div>

        {/* 메인 게임 영역 */}
        <div className="canvas-frame">
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className="game-canvas"
          />

          {/* 1. 시작 화면 오버레이 */}
          {gameState === 'START' && (
            <div className="overlay start-overlay flex-col">
              <div className="cosmic-glow-1"></div>
              <div className="cosmic-glow-2"></div>
              <div className="cosmic-glow-3"></div>
              <div className="starry-bg"></div>
              <div className="cosmic-dust">
                <div className="dust-particle dp-1"></div>
                <div className="dust-particle dp-2"></div>
                <div className="dust-particle dp-3"></div>
                <div className="dust-particle dp-4"></div>
                <div className="dust-particle dp-5"></div>
              </div>
              <div className="cosmic-corner cc-tl"></div>
              <div className="cosmic-corner cc-tr"></div>
              <div className="cosmic-corner cc-bl"></div>
              <div className="cosmic-corner cc-br"></div>

              <div className="neon-logo-container">
                <span className="pulsing-logo">VIBE SPACE</span>
                <span className="sub-logo">BRICK BREAKER</span>
              </div>
              <p className="overlay-desc">우주 전함을 조종하여 크리스탈 장벽을 폭파하고 소행성대를 통과하세요.</p>
              
              <button className="play-button btn-neon-cyan" onClick={() => restartGame(true)}>
                <Play size={20} style={{ marginRight: 8 }} /> MISSION START
              </button>

              <button className="help-toggle-btn" onClick={() => setShowHelp(!showHelp)}>
                <HelpCircle size={16} style={{ marginRight: 4 }} /> 조작 방법 및 아이템 가이드
              </button>
            </div>
          )}

          {/* 2. 일시 정지 오버레이 */}
          {gameState === 'PAUSED' && (
            <div className="overlay glass flex-col">
              <h2 className="overlay-title text-glow-cyan">SYSTEM PAUSED</h2>
              <p className="overlay-desc">정비 구역에 진입했습니다. 우주선 동력을 재부팅하십시오.</p>
              
              <div className="button-group">
                <button className="play-button btn-neon-cyan" onClick={() => setGameState('PLAYING')}>
                  <Play size={18} style={{ marginRight: 8 }} /> RESUME
                </button>
                <button className="reset-button btn-neon-red" onClick={() => restartGame(true)}>
                  <RotateCcw size={18} style={{ marginRight: 8 }} /> RESTART
                </button>
              </div>
            </div>
          )}

          {/* 3. 게임 오버 오버레이 */}
          {gameState === 'GAMEOVER' && (
            <div className="overlay glass flex-col">
              <h2 className="overlay-title text-glow-red">MISSION FAILED</h2>
              <p className="overlay-desc">우주선이 충돌하여 파괴되었습니다.</p>
              <div className="score-summary">
                <div>FINAL SCORE: <span className="text-glow-cyan">{score}</span></div>
                {score >= highScore && score > 0 && <div className="new-record text-glow-gold">★ NEW HIGH SCORE! ★</div>}
              </div>
              
              <button className="play-button btn-neon-cyan" onClick={() => restartGame(true)}>
                <RotateCcw size={20} style={{ marginRight: 8 }} /> TRY AGAIN
              </button>
            </div>
          )}

          {/* 4. 최종 승리 오버레이 */}
          {gameState === 'VICTORY' && (
            <div className="overlay glass flex-col">
              <h2 className="overlay-title text-glow-gold">GALAXY CLEANSED</h2>
              <p className="overlay-desc">축하합니다! 모든 크리스탈 벽을 허물고 은하계의 평화를 지켰습니다.</p>
              <div className="score-summary">
                <div>TOTAL SCORE: <span className="text-glow-gold">{score}</span></div>
              </div>
              
              <button className="play-button btn-neon-gold" onClick={() => restartGame(true)}>
                <RotateCcw size={20} style={{ marginRight: 8 }} /> REPLAY MISSIONS
              </button>
            </div>
          )}

          {/* 조작법 가이드 오버레이 */}
          {showHelp && (
            <div className="help-modal glass">
              <h3 className="help-title">MISSION GUIDE</h3>
              <div className="help-grid">
                <div className="help-section">
                  <h4>🛸 조작 방법</h4>
                  <ul>
                    <li><strong>마우스</strong>: 마우스 위치로 우주선 이동</li>
                    <li><strong>키보드</strong>: <code>←</code>, <code>→</code> 또는 <code>A</code>, <code>D</code> 키로 우주선 이동</li>
                    <li><strong>레이저 발사</strong>: 아이템 획득 후 <code>Space</code> 키 또는 마우스 클릭</li>
                    <li><strong>일시 정지</strong>: <code>ESC</code> 키</li>
                  </ul>
                </div>

                <div className="help-section">
                  <h4>🔋 우주 보급 캡슐 (아이템)</h4>
                  <ul className="items-list">
                    <li><span className="item-badge speed-up">S+</span> 스피드 업: 공 속도가 빨라지나 <strong>모든 벽돌 점수 2배</strong></li>
                    <li><span className="item-badge speed-down">S-</span> 스피드 다운: 공 속도를 낮춰 조작이 용이해짐</li>
                    <li><span className="item-badge expand">E</span> 쉴드 확장: 패들의 방어 범위가 1.5배 넓어짐</li>
                    <li><span className="item-badge laser">L</span> 레이저 포: 10초간 벽돌을 타격하는 레이저 장착</li>
                    <li><span className="item-badge multi">M</span> 멀티 볼: 현재 맵의 모든 공을 3개로 분열시킴</li>
                    <li><span className="item-badge grid">G</span> 에너지 가드: 바닥으로 떨어지는 낙사 1회 완전 방지</li>
                    <li><span className="item-badge heart">♥</span> 라이프 보강: 우주선 보호막(목숨) 1회 복구</li>
                  </ul>
                </div>
              </div>
              <button className="btn-neon-purple close-help-btn" onClick={() => setShowHelp(false)}>
                확인 및 닫기
              </button>
            </div>
          )}
        </div>

        {/* 하단 패널 (목숨, 컨트롤러 유형, 사운드 온오프, 활성화된 보너스 정보) */}
        <div className="hud-panel glass bottom-hud">
          {/* 하트 표시 */}
          <div className="lives-container">
            {Array.from({ length: 5 }).map((_, i) => (
              <span
                key={i}
                className={`heart-glow ${i < lives ? 'filled text-glow-red' : 'empty'}`}
              >
                ♥
              </span>
            ))}
          </div>

          {/* 현재 활성 효과 표시 */}
          <div className="active-buffs">
            {activeItemsText.length > 0 ? (
              activeItemsText.map((text, index) => (
                <span key={index} className="buff-pill animate-pulse">
                  {text}
                </span>
              ))
            ) : (
              <span className="buff-none">액티브 부스터 없음</span>
            )}
          </div>

          {/* 설정 컨트롤 */}
          <div className="controls-group">
            <span className="control-indicator">
              컨트롤: {controlType === 'mouse' ? '🖱️ 마우스' : '⌨️ 키보드'}
            </span>
            <button className="icon-btn" onClick={toggleMute} title="음향 토글">
              {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
