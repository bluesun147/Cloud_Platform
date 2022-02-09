// game engine
// https://www.youtube.com/watch?v=fx40inJ6Xf4
const Game = (function() { // imm invoke func
    // once u declare it'll be executed at the same time
    const KEY_MAP = Object.freeze({ // 객체 동결. 변경 못하고 전달된 동일 객체 반환
        JUMP: 32, // space
        LEFT: 37,
        RIGHT: 39,
    });

    const clouds = [];
    const particles = [];
    const colors = [];

    let canvas = null;
    let context = null;
    let hero = null;
    let isLeft = false;
    let isRight = false;
    let canJump = false;
    let gravity = 0.7;
    let maxYvel = 15;

    const random = (min, max) => Math.random() * (max - min) + min;

    // #000000(흰색) ~ #999999(회색) ~ #ffffff(검정, 16진수)
    for (let i=0; i<=9; i++) {
        colors.push('#' + ""+i+i+i+i+i+i);
    }

    // 연기 particles 생성
    const createParticles = function(n) {
        const size = random(10, 15);
        for (let i=0; i<n; i++) {
            particles.push({
                x: 0,
                y: 0,
                w: size,
                h: size, // 정사각형 particle
                alpha: 1, // opacity. 1일때 불투명, 0일때 투명
                alphaDec: random(0.01, 0.07), // opacity decrease
                speed: -1 * random(1, 5), // 연기 위로 올라가기에 음수
                color: colors[parseInt(random(0, colors.length))]
            })
        }
    };

    function Cloud(x, y, w, h, color) { // using function as class
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.color = color;
        clouds.push(this); // 만들때마다 clouds 배열에 추가
    }

    // detect collision
    // axis aligned bounding box algorithm (AABB)
    const isHit = function(o1, o2) {
        if (o1.x < o2.x + o2.w && o1.x + o1.w > o2.x && 
            o1.y < o2.y + o2.h && o1.y + o1.h > o2.y) {
                return true;
            }
        return false;
    };

    // hero 이미지 없을 때 대체됨.
    // cloud, particle 생성시에도 쓰임. quad 만들때마다 쓰임
    const renderQuad = function(x, y, w, h, color, alpha = 1, withStroke = true) {
        context.beginPath();
        context.fillStyle = color; // 도형 채우는 색
        context.strokeStyle = "#333"; // 윤곽선 색
        context.lineWidth = 5; // 선 두께
        context.globalAlpha = alpha; // opacity
        if (withStroke) { // particle만 테두리 없음. 다른 quad(cloud)는 있음
            context.strokeRect(x, y, w, h); // 테두리만 있는 rect
        }
        context.fillRect(x, y, w, h); // 색 체워진 rect
        context.closePath();
    };

    const onKeyDown = function( {keyCode} ) {
        if (keyCode == KEY_MAP.LEFT) {
            isLeft = true;
        } else if (keyCode === KEY_MAP.RIGHT) {
            isRight = true;
        } else if (keyCode === KEY_MAP.JUMP) {
            hero.vel.y = -12;
        }
    };

    const onKeyUp = function( {keyCode} ) {
        if (keyCode == KEY_MAP.LEFT) {
            isLeft = false;
        } else if (keyCode === KEY_MAP.RIGHT) {
            isRight = false;
        }
    };

    // 키보드 동작
    const attachKeyboardListeners = function() {
        document.body.addEventListener('keydown', onKeyDown);
        document.body.addEventListener('keyup', onKeyUp);
    }

    const render = function() {
        context.clearRect(0, 0, canvas.width, canvas.height); // clear canvas. canvas의 Context의 사각형 지우기. (x,y,w,h)

        // render all clouds
        clouds.forEach(c => {
            renderQuad(c.x, c.y, c.w, c.h, c.color);
        });


        if (!hero.noImage) { // 이미지 있으면
            context.drawImage(hero.img, hero.x, hero.y, hero.w, hero.h);
        } else { // 이미지 없으면 simple rect 생성
            renderQuad(hero.x, hero.y, hero.w, hero.h, hero.color);
        }

        particles.forEach(p => {
            renderQuad(p.x, p.y, p.w, p.h, p.color, p.alpha, false);
        });
    };

    const update = function() {
        hero.vel.y += gravity;

        if (hero.vel.y > maxYvel) { // max velocity
            hero.vel.y = maxYvel;
        }

        // 바닥 닿으면 멈춤. hero.y는 머리(rect 윗부분)
        /*if (hero.y + hero.vel.y> canvas.height - hero.h) { // 내려갈수록 y값 커짐
            hero.y = canvas.height - hero.h;
            hero.vel.y = 0;
        }*/

        hero.x += hero.vel.x;
        hero.y += hero.vel.y;

        if (isLeft) {
            hero.vel.x = -5;
        } else if (isRight) {
            hero.vel.x = 5;
        } else { // 누르고 있지 않으면 멈춤
            hero.vel.x = 0;
        }

        if (hero.x < 0) { // 왼쪽 벽
            hero.x = 0;
        } else if (hero.x + hero.w > canvas.width) { // 오른쪽
            hero.x = canvas.width - hero.w;
        }

        if (hero.y + hero.vel.y < 0) {
            hero.y = 0;
            hero.vel.y = 1;
        }

        clouds.forEach(c => {
            // 부딛혔고, hero몸통 중간이 cloud보다 높이뜨고, hero가 클라우드 밟았을때 landing하도록. 점프중 아니고. 음수면 점프중이라는 뜻. 양수면 landing
            if (isHit(c, hero) && (hero.y + hero.h * 0.5 < c.y) && hero.vel.y > 0) {
                hero.y = c.y - hero.h;
                hero.vel.y = 0;
                canJump = true;
            }
        });

        particles.forEach(p => {
            p.y += p.speed;
            p.alpha -= p.alphaDec;

            if (p.alpha < 0) {
                p.alpha = 1;
                p.alphaDec = random(0.02, 0.05);
                p.x = random(hero.x, (hero.x + hero.w) - p.w); // 머리너비 사이에서 랜덤으로 생성
                p.y = hero.y - p.h; // 머리 바로 위에서 나오기 시작
                p.speed = -random(1, 4);
            }
        });
    };

    // for every single frame in the game loop
    const frame = function() {
        render();
        update();
        // js 내장 함수
        // js에서 애니메이션 구현 방법으로 new Date() 사용한 타이면 함수 만들어 사용
        // 즉 시작과 종료 시점 직접 변수에 저장해 반복 실행.
        // 이 방법은 불필요한 콜스택 너무 많다.
        // 대신 requestAnimationFrame(반복할 함수) 사용
        requestAnimationFrame(frame);
    };

    return {
        init: function(w, h, color) {
            // create canvas to draw
            canvas = document.createElement('canvas');
            context = canvas.getContext('2d');
            canvas.width = w;
            canvas.height = h;
            canvas.style.background = color;
            // put canvas in the middle of the screen
            canvas.style.marginLeft = window.innerWidth/2 - w/2 + "px";
            //canvas.style.marginTop = window.innerHeight/2 - h/2 + "px";

            document.body.appendChild(canvas);

            attachKeyboardListeners(); // 키보드 리스너
        },

        addHero(_hero) {
            if (_hero.imgSrc) { // 그림 있을 때
                _hero.img = new Image();
                _hero.img.src = _hero.imgSrc;
                _hero.noImage = false;
                _hero.w = _hero.img.width * 0.7;
                _hero.h = _hero.img.height * 0.7;
            } else { // 그림 없으면 기본 값
                _hero.w = 20;
                _hero.h = 30;
                _hero.color = "#222";
                _hero.noImage = true;
            }
            _hero.vel = {x:0, y:0}; // hero's velocity
            hero = _hero;
        },

        addCloud(x, y, w, h, color) {
            const cloud = new Cloud(x, y, w, h, color);
        },

        world: { // 객체
            w: () => canvas.width,
            h: () => canvas.height
        },

        // func to start game loop
        start() {
            frame(); // private func
        },

        enableParticles: function(n) {
            createParticles(n);
        }
    }
})();