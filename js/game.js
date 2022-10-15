const BOX = 32;
const NUM_CELLS = {width: 17, height: 15};
const BG_OFFSET = {x: BOX, y: 3*BOX};
const SCORE_OFFSET = {x: BOX*2.5, y: BOX*1.7};
const SNAKE_START = {x: BOX*9, y: BOX*10};

const endGameEvent = new  Event('endgame');

const game = {
	canvas : document.getElementById('game'),
	ctx : null,
	items : [],
  ground: new Image(),
  score:0,
  count: 0,

	init() {	
    this.ground.src = "img/ground.png";
		this.items.push(new Carrot(), new Hamburger(), new Rabbit());
		this.setPixelRatio();
	},
	run(){
		this.ctx.clearRect(0,0, this.canvas.width, this.canvas.height);
    this.ctx.drawImage(this.ground, 0, 0);
    snake.draw(this.ctx);
		for (const item of this.items){
			item.draw(this.ctx);
		}
    this.showScore();
	},
	update(){
    snake.update();
    if(this.count === 5){
		  for (let item of this.items){
        item.update(); 
		  }
      this.count = 0;
    }
    else{
      this.count += 1;
    }
	},
	setPixelRatio(){
		let dpr = window.devicePixelRatio || 1;
		let rect = this.canvas.getBoundingClientRect();
		this.canvas.width = rect.width * dpr;
		this.canvas.height = rect.height * dpr;
		this.ctx = this.canvas.getContext('2d');
		this.ctx.scale(dpr, dpr);
	},
  end(){
    clearInterval(gameRun);
    this.ctx.fillStyle = "white";
    this.ctx.font = "50px Roboto";
    this.ctx.fillText('Game Over', BOX*6, BOX*7);
    this.ctx.fillText('Score: '+this.score, BOX*7, BOX*9);
    this.ctx.fillStyle = "green";
    this.ctx.fillText('Replay',BOX*7.5,BOX*11);
    this.canvas.addEventListener('click',()=>game.replay())
  },
  replay(){
    location.reload(true);
  },
  showScore(e){
    this.ctx.fillStyle ="white";
    this.ctx.font = "50px Roboto";
    this.ctx.fillText(this.score, SCORE_OFFSET.x, SCORE_OFFSET.y);
  }
};

const snake = {
  tail: [{...SNAKE_START}],
  color: 'yellow',
  draw(ctx){
    for (const cell of this.tail ){
      ctx.fillStyle = this.color;
      ctx.fillRect(cell.x,cell.y,BOX,BOX);  
    }
  },
  update(){
    const newHead = {...this.tail[0]};
    if(this.dir === "left") newHead.x -= BOX;
    if(this.dir === "right") newHead.x += BOX;
    if(this.dir === "up") newHead.y -= BOX;
    if(this.dir === "down") newHead.y += BOX;
    if(!this._hasEatenItem(newHead)){
      this.tail.pop();
    }
    this._hasEatenTail(newHead);
    this.tail.unshift(newHead);
    this._checkBorders(newHead);
  },
  _hasEatenTail(head){
    for({x,y} of this.tail){
      if(x === head.x && y === head.y)
        document.dispatchEvent(endGameEvent);
    }
    return false;
  },
  _hasEatenItem(head){
    for(const item of game.items)
      if(item.x === head.x && item.y === head.y)
      {
        return item.wasEaten();
      }
  },
  _checkBorders(head){
    if((head.x < BG_OFFSET.x)||(head.y < BG_OFFSET.y)||(head.x >= game.canvas.width-BOX)||(head.y >= game.canvas.height - BOX)){
      document.dispatchEvent(endGameEvent);
    }
  }
}

class Item{
	constructor(){
    this._move();
    this.bonus = 0;
    this.grow = false;
    this.pic = new Image();
	}
	draw(ctx){
    ctx.drawImage(this.pic, this.x, this.y);
	}
  _move(){
    this.x = Math.floor(Math.random()*NUM_CELLS.width)*BOX+BG_OFFSET.x;
    this.y = Math.floor(Math.random()*NUM_CELLS.height)*BOX+BG_OFFSET.y;
  }
  wasEaten(){
    this._move();
    game.score+=this.bonus;
    return this.grow;
  }
	update(){

	}
}

class Hamburger extends Item{
  constructor(){
    super();
    this.pic.src  = "img/hamburger.png";
    this.grow = true;
    this.bonus = 2;
  }
}

class Carrot extends Item{
  constructor(){
    super();
    this.pic.src  = "img/food.png";
    this.grow = false;
    this.bonus = 1;
  }
}

class Rabbit extends Item{
  constructor(){
    super();
    this.pic.src  = "img/rabbit.png";
    this.grow = true;
    this.bonus = 5;
    this.step = {x: BOX, y: BOX};
  }
  _move(){
    this.x = Math.floor(Math.random()*15)*BOX+BG_OFFSET.x+BOX;
    this.y = Math.floor(Math.random()*13)*BOX+BG_OFFSET.y+BOX;
  }
  _chekNav(){
    if((0 >= this.x - BOX )||((game.canvas.width-BOX) <= (this.x + BOX))){
      this.step.x *= -1;
    }
    if((2*BOX >= this.y - BOX)||((game.canvas.height-BOX) <= (this.y + BOX))){
      this.step.y *= -1;
    } 
  }
  update(){ 
    this._chekNav();

    this.x += this.step.x;
    this.y += this.step.y;    
	}
}

document.addEventListener("keydown", direction);
function direction(event){
  if(event.key === 'ArrowLeft' && snake.dir !== "right")
    snake.dir = "left";
  if(event.key === 'ArrowRight' && snake.dir !== "left")
    snake.dir = "right";
  if(event.key === 'ArrowUp' && snake.dir !== "down")
    snake.dir = "up";
  if(event.key === 'ArrowDown' && snake.dir !== "up")
    snake.dir = "down";
}


document.addEventListener('endgame',()=>game.end());
game.init();
/*window.run = function () {
   window.requestAnimationFrame( run );
   game.run();
   game.update();
};

run();*/
const gameRun = setInterval(()=>{game.run();game.update()},150);
