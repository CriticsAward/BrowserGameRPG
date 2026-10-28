/* Первый прототип. Без боевой системы: карта, движение, два преследующих врага. */
const WORLD={w:960,h:1280};
class Dungeon extends Phaser.Scene{
 constructor(){super('Dungeon');this.joy={id:null,x:0,y:0,dx:0,dy:0};}
 create(){
  this.cameras.main.setBackgroundColor('#071923');
  this.physics.world.setBounds(45,45,WORLD.w-90,WORLD.h-90);
  this.drawFloor();
  this.walls=this.physics.add.staticGroup();
  this.addWalls();
  this.makeTextures();
  this.player=this.physics.add.sprite(480,1060,'guardian').setDepth(5).setCircle(26,14,25);
  this.player.setCollideWorldBounds(true).setMaxVelocity(220);
  this.physics.add.collider(this.player,this.walls);
  this.enemies=this.physics.add.group();
  [[310,300],[700,560]].forEach(([x,y])=>{
   const enemy=this.enemies.create(x,y,'crab').setDepth(5).setCircle(22,10,14);
   enemy.setCollideWorldBounds(true).setMaxVelocity(110);
   this.physics.add.collider(enemy,this.walls);
  });
  this.physics.add.collider(this.enemies,this.enemies);
  this.physics.add.collider(this.player,this.enemies);
  this.cameras.main.startFollow(this.player,true,1,1);
  this.cameras.main.setBounds(0,0,WORLD.w,WORLD.h);
  this.cameras.main.setZoom(1);
  this.keys=this.input.keyboard.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT');
  this.setupJoystick();
  this.fpsText=this.add.text(12,58,'FPS: …',{fontFamily:'Arial',fontSize:'15px',color:'#b5e5de',backgroundColor:'#06141caa',padding:{x:7,y:5}}).setScrollFactor(0).setDepth(60);
  this.fpsElapsed=0;
  this.scale.on('resize',this.positionJoystick,this);
  this.add.text(480,1195,'ВХОД В РУИНЫ',{fontFamily:'Arial',fontSize:'20px',color:'#78c9c8',letterSpacing:3}).setOrigin(.5).setAlpha(.7);
 }
 drawFloor(){
  const g=this.add.graphics().setDepth(0);
  g.fillStyle(0x0b2934).fillRect(0,0,WORLD.w,WORLD.h);
  const rng=new Phaser.Math.RandomDataGenerator(['abyss-dungeon-1']);
  for(let y=35;y<WORLD.h-25;y+=65)for(let x=30;x<WORLD.w-20;x+=65){
   const ox=rng.between(-6,6),oy=rng.between(-6,6);
   g.fillStyle(rng.pick([0x153845,0x173e49,0x1b4550,0x11323f]),1);
   g.fillRoundedRect(x+ox,y+oy,61,61,6);
   g.lineStyle(2,0x071d29,.8).strokeRoundedRect(x+ox,y+oy,61,61,6);
   if(rng.frac()<.17){g.lineStyle(1,0x3d7780,.4).lineBetween(x+ox+8,y+oy+12,x+ox+34,y+oy+26);}
  }
  for(let i=0;i<85;i++){
   const x=rng.between(60,900),y=rng.between(80,1200),r=rng.between(3,11);
   g.fillStyle(rng.pick([0x167c83,0x205e6c,0x3b7e83,0x8d5168]),.7).fillCircle(x,y,r);
   if(rng.frac()<.35){g.lineStyle(2,0x64c6c0,.4).lineBetween(x,y,x+rng.between(-10,10),y-18);}
  }
  const light=this.add.graphics().setDepth(1);
  [[120,160],[830,110],[170,800],[760,1090]].forEach(([x,y])=>{
   for(let r=120;r>0;r-=12){light.fillStyle(0x1b9b9d,.012).fillCircle(x,y,r);}
   light.fillStyle(0x54d2c7,.5).fillCircle(x,y,5);
  });
 }
 addWalls(){
  const blocks=[[480,50,950,70],[480,1230,950,70],[35,640,70,1200],[925,640,70,1200],[210,450,115,115],[750,350,115,115],[270,810,115,115],[735,925,115,115]];
  blocks.forEach(([x,y,w,h])=>{
   const shadow=this.add.rectangle(x+9,y+13,w,h,0x031018,.7).setDepth(2);
   const rect=this.add.rectangle(x,y,w,h,0x1a3b49).setStrokeStyle(5,0x3e7180).setDepth(3);
   this.add.rectangle(x,y-h*.22,w*.83,Math.max(9,h*.18),0x356474,.75).setDepth(4);
   this.physics.add.existing(rect,true);this.walls.add(rect);
  });
 }
 makeTextures(){
  const p=this.add.graphics();
  // Shell-backed, nonhuman abyssal guardian, top-down gameplay silhouette.
  p.fillStyle(0x051923,.5).fillEllipse(48,78,65,23);
  p.fillStyle(0x102d39).fillEllipse(48,52,68,68);
  p.fillStyle(0x244856).fillEllipse(48,43,59,57);
  p.fillStyle(0x3d6470).fillEllipse(48,36,44,36);
  p.fillStyle(0x0d2631).fillEllipse(48,30,35,28);
  p.lineStyle(4,0x5b8a93).strokeEllipse(48,35,45,38);
  p.fillStyle(0x67d9d0).fillCircle(39,28,4).fillCircle(57,28,4);
  p.fillStyle(0x254957).fillEllipse(16,51,22,35).fillEllipse(80,51,22,35);
  p.fillStyle(0x1b3743).fillEllipse(30,79,20,20).fillEllipse(66,79,20,20);
  p.fillStyle(0x4d7b7d).fillTriangle(17,33,6,47,28,48).fillTriangle(79,33,68,48,90,47);
  p.fillStyle(0x267d85).fillCircle(47,51,8);
  p.lineStyle(5,0x89b7b5).lineBetween(75,50,91,72);
  p.fillStyle(0x42c9c5).fillRoundedRect(79,65,19,18,4);
  p.generateTexture('guardian',100,100);p.clear();
  // Two coral-crab enemies.
  p.fillStyle(0x04131b,.5).fillEllipse(42,56,72,18);
  p.lineStyle(6,0x803f5b);
  [[10,20,23,35],[74,20,61,35],[9,50,24,45],[75,50,60,45]].forEach(a=>p.lineBetween(...a));
  p.fillStyle(0x873d5d).fillEllipse(42,34,54,40);
  p.fillStyle(0xb65a73).fillEllipse(42,28,44,27);
  p.fillStyle(0x0b1b29).fillCircle(32,24,5).fillCircle(52,24,5);
  p.fillStyle(0x79f1e3).fillCircle(32,23,2).fillCircle(52,23,2);
  p.fillStyle(0xa9536c).fillTriangle(10,17,2,2,26,24).fillTriangle(74,17,82,2,58,24);
  p.generateTexture('crab',84,70);p.destroy();
 }
 setupJoystick(){
  this.input.addPointer(2);
  this.joy.radius=54;
  this.joy.base=this.add.circle(0,0,58,0x092632,.65).setStrokeStyle(3,0x72b9bb,.8).setScrollFactor(0).setDepth(50);
  this.joy.knob=this.add.circle(0,0,23,0x4db6b8,.85).setStrokeStyle(2,0xa8e5df).setScrollFactor(0).setDepth(51);
  this.positionJoystick();
  this.input.on('pointerdown',p=>{
   if(this.joy.id!==null)return;
   const dx=p.x-this.joy.x,dy=p.y-this.joy.y;
   if(Math.hypot(dx,dy)>110)return;
   this.joy.id=p.id;
   this.moveJoystick(p);
  });
  this.input.on('pointermove',p=>{if(p.id===this.joy.id)this.moveJoystick(p);});
  const end=p=>{
   if(p.id!==this.joy.id)return;
   this.joy.id=null;this.joy.dx=this.joy.dy=0;
   this.joy.knob.setPosition(this.joy.x,this.joy.y);
  };
  this.input.on('pointerup',end);
  this.input.on('pointerupoutside',end);
 }
 positionJoystick(){
  this.joy.x=Math.min(90,this.scale.width*.24);
  this.joy.y=this.scale.height-100;
  this.joy.base.setPosition(this.joy.x,this.joy.y);
  if(this.joy.id===null)this.joy.knob.setPosition(this.joy.x,this.joy.y);
 }
 moveJoystick(p){
  const dx=p.x-this.joy.x,dy=p.y-this.joy.y,len=Math.hypot(dx,dy);
  const power=Math.min(len/this.joy.radius,1),unit=len||1;
  this.joy.dx=dx/unit*power;this.joy.dy=dy/unit*power;
  this.joy.knob.setPosition(this.joy.x+this.joy.dx*this.joy.radius,this.joy.y+this.joy.dy*this.joy.radius);
 }
 update(time,delta){
  if(!this.player)return;
  this.fpsElapsed+=delta;
  if(this.fpsElapsed>=500){this.fpsText.setText('FPS: '+Math.round(this.game.loop.actualFps));this.fpsElapsed=0;}
  const k=this.keys;
  let x=this.joy.dx+(k.D.isDown||k.RIGHT.isDown?1:0)-(k.A.isDown||k.LEFT.isDown?1:0);
  let y=this.joy.dy+(k.S.isDown||k.DOWN.isDown?1:0)-(k.W.isDown||k.UP.isDown?1:0);
  const n=Math.hypot(x,y)||1;
  this.player.setVelocity(x/n*185,y/n*185);
  if(Math.abs(x)>.05)this.player.setFlipX(x<0);
  this.enemies.children.iterate(e=>{
   if(!e||!e.active)return;
   const d=Phaser.Math.Distance.Between(e.x,e.y,this.player.x,this.player.y);
   if(d<370&&d>64){this.physics.moveToObject(e,this.player,78);e.setFlipX(e.x>this.player.x);}
   else e.setVelocity(0,0);
  });
 }
}
new Phaser.Game({type:Phaser.AUTO,parent:'game',backgroundColor:'#071923',scale:{mode:Phaser.Scale.RESIZE,autoCenter:Phaser.Scale.CENTER_BOTH,width:window.innerWidth,height:window.innerHeight},physics:{default:'arcade',arcade:{debug:false}},scene:[Dungeon],fps:{target:60,forceSetTimeOut:false},render:{pixelArt:false,antialias:true,roundPixels:true}});
