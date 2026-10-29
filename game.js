/* Первый прототип. Без боевой системы: карта, движение, два преследующих врага. */
const WORLD={w:960,h:1280};
class Dungeon extends Phaser.Scene{
 constructor(){super('Dungeon');this.joy={id:null,x:0,y:0,dx:0,dy:0};}
 preload(){ this.load.image('deepwalker','https://raw.githubusercontent.com/CriticsAward/BrowserGameRPG/prototype/first-dungeon/assets/deepwalker-directions.svg'); }
 create(){
  this.cameras.main.setBackgroundColor('#071923');
  this.physics.world.setBounds(45,45,WORLD.w-90,WORLD.h-90);
  this.drawFloor();
  this.walls=this.physics.add.staticGroup();
  this.addWalls();
  this.makeTextures();
  this.player=this.physics.add.sprite(480,1060,'deepwalker').setCrop(0,0,128,128).setDepth(5).setCircle(26,14,25);
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
  this.fitCamera();
  this.keys=this.input.keyboard.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT');
  this.setupJoystick();
  this.fpsElement=document.getElementById('fps');
  this.fpsElapsed=0;
  this.diagnostic=false;
  this.testButton=document.getElementById('testMode');
  this.testButton.addEventListener('click',()=>{this.diagnostic=!this.diagnostic;this.testButton.textContent=this.diagnostic?'Тест: без карты':'Тест: обычный';this.floorImage.setVisible(!this.diagnostic);this.lightImage.setVisible(!this.diagnostic);this.wallVisuals.forEach(v=>v.setVisible(!this.diagnostic));this.enemies.children.iterate(e=>e.setVisible(!this.diagnostic));});
  this.scale.on('resize',()=>{this.fitCamera();});
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
  // Bake static graphics once instead of rebuilding their geometry every frame.
  g.generateTexture('floor-baked',WORLD.w,WORLD.h);
  light.generateTexture('light-baked',WORLD.w,WORLD.h);
  g.destroy();light.destroy();
  this.floorImage=this.add.image(0,0,'floor-baked').setOrigin(0).setDepth(0);
  this.lightImage=this.add.image(0,0,'light-baked').setOrigin(0).setDepth(1);
 }
 addWalls(){
  const blocks=[[480,50,950,70],[480,1230,950,70],[35,640,70,1200],[925,640,70,1200],[210,450,115,115],[750,350,115,115],[270,810,115,115],[735,925,115,115]];
  this.wallVisuals=[];
  blocks.forEach(([x,y,w,h])=>{
   const shadow=this.add.rectangle(x+9,y+13,w,h,0x031018,.7).setDepth(2);
   const rect=this.add.rectangle(x,y,w,h,0x1a3b49).setStrokeStyle(5,0x3e7180).setDepth(3);
   const trim=this.add.rectangle(x,y-h*.22,w*.83,Math.max(9,h*.18),0x356474,.75).setDepth(4);this.wallVisuals.push(trim);
   this.physics.add.existing(rect,true);this.walls.add(rect);
   this.wallVisuals.push(shadow,rect);
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
 fitCamera(){
  // The camera owns the game world. Screen controls live in DOM, not in world units.
  const w=this.scale.width,h=this.scale.height;
  this.cameras.main.setViewport(0,0,w,h);
  this.cameras.main.setZoom(Math.max(w/WORLD.w,h/WORLD.h,0.75));
 }
 setupJoystick(){
  const zone=document.getElementById('joystick');
  const knob=document.getElementById('joystickKnob');
  const joy=this.joy;
  const reset=()=>{joy.id=null;joy.dx=0;joy.dy=0;knob.style.transform='translate(0px,0px)';};
  const move=e=>{
   if(joy.id!==e.pointerId)return;
   const rect=zone.getBoundingClientRect();
   const x=e.clientX-(rect.left+rect.width/2),y=e.clientY-(rect.top+rect.height/2);
   const length=Math.hypot(x,y),radius=48;
   const power=length>7?1:0;
   joy.dx=power*x/(length||1);joy.dy=power*y/(length||1);
   const distance=Math.min(length,radius);
   knob.style.transform='translate('+joy.dx*distance+'px,'+joy.dy*distance+'px)';
  };
  zone.addEventListener('pointerdown',e=>{if(joy.id!==null)return;e.preventDefault();joy.id=e.pointerId;zone.setPointerCapture(e.pointerId);move(e);});
  zone.addEventListener('pointermove',move);
  zone.addEventListener('pointerup',reset);
  zone.addEventListener('pointercancel',reset);
  zone.addEventListener('lostpointercapture',reset);
 }

 update(time,delta){
  if(!this.player)return;
  this.fpsElapsed+=delta;
  if(this.fpsElapsed>=500){this.fpsElement.textContent='v0.7 · FPS: '+Math.round(this.game.loop.actualFps)+' · '+(this.game.renderer.type===Phaser.WEBGL?'WebGL':'Canvas');this.fpsElapsed=0;}
  const k=this.keys;
  let x=this.joy.dx+(k.D.isDown||k.RIGHT.isDown?1:0)-(k.A.isDown||k.LEFT.isDown?1:0);
  let y=this.joy.dy+(k.S.isDown||k.DOWN.isDown?1:0)-(k.W.isDown||k.UP.isDown?1:0);
  const n=Math.hypot(x,y)||1;
  this.player.setVelocity(x/n*185,y/n*185);
  if(Math.abs(x)>.05){ this.player.setCrop((x<0?1:3)*128,0,128,128); }
  else if(Math.abs(y)>.05){ this.player.setCrop((y<0?2:0)*128,0,128,128); }
  this.enemies.children.iterate(e=>{
   if(!e||!e.active||this.diagnostic){if(e)e.setVelocity(0,0);return;}
   const d=Phaser.Math.Distance.Between(e.x,e.y,this.player.x,this.player.y);
   if(d<370&&d>64){this.physics.moveToObject(e,this.player,78);e.setFlipX(e.x>this.player.x);}
   else e.setVelocity(0,0);
  });
 }
}
const game=new Phaser.Game({type:Phaser.AUTO,parent:'game',backgroundColor:'#071923',scale:{mode:Phaser.Scale.RESIZE,autoCenter:Phaser.Scale.CENTER_BOTH,width:window.innerWidth,height:window.innerHeight},physics:{default:'arcade',arcade:{debug:false}},scene:[Dungeon],fps:{target:60,forceSetTimeOut:false},render:{pixelArt:false,antialias:true,roundPixels:true,powerPreference:'high-performance'}});

// Keep the actual Phaser canvas in sync with the visual viewport.
const syncViewport=()=>{
 const w=document.documentElement.clientWidth,h=window.visualViewport?.height||window.innerHeight;
 if(w>0&&h>0&&game.scale&&(game.scale.width!==Math.round(w)||game.scale.height!==Math.round(h))){
  game.scale.resize(Math.round(w),Math.round(h));
 }
};
window.addEventListener('resize',syncViewport);
window.visualViewport?.addEventListener('resize',syncViewport);
setTimeout(syncViewport,100);
