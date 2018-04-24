//document.write("<script language='javascript' src='common.js'></script>");
(function () {
    var imgUrl = 'http://7xtawy.com1.z0.glb.clouddn.com/tinyheart';//????
    var can1,can2;//画布canvas1,canvas2
    var ctx1,ctx2;//画笔ctx1,ctx2
    var canWidth,canHeight;//画布宽高
    var lastframetime,diffframetime = 0;//上一帧动画时间，两帧时间差
    var aneOb,fruitOb,monOb,babyOb;//创建海草，果实，母鱼和子鱼
    var scoreOb,waveOb,halOb,dustOb;//创建计分、海浪对象
    var mx,my;//鼠标横纵坐标值

    window.jzk ={};//定义一个全局变量
    jzk.startGame = function () {

        jzk.init();
        lastframetime = Date.now();
        jzk.gameLoop();
    };
    jzk.init = function () {
        can1 = document.getElementById("canvas1");
        if(can1.getContext){     //确定浏览器支持canvas
            ctx1 = can1.getContext("2d");
            ctx1.fillStyle = "white";
            ctx1.font = "20px 微软雅黑";
            ctx1.textAlign = "center";
        }
        can2 = document.getElementById("canvas2");
        ctx2 = can2.getContext('2d');

        can1.addEventListener("mousemove",jzk.onMouseMove,false);
        can1.addEventListener("click",jzk.onClick,false);

        canWidth = can1.width;
        canHeight = can1.height;

        mx = canWidth*0.5;
        my = canHeight*0.5;

        aneOb =new aneObject();
        aneOb.init();

        fruitOb = new fruitObject();
        fruitOb.init();

        monOb = new monObject();
        monOb.init();

        babyOb = new babyObject();
        babyOb.init();

        scoreOb = new scoreObject();
        scoreOb.init();

        waveOb = new waveObject();
        waveOb.init();

        halOb = new halObject();
        halOb.init();

        dustOb = new dustObject();
        dustOb.init();
   };
   
   jzk.gameLoop = function () { //使用帧绘画
       window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
       requestAnimationFrame(jzk.gameLoop);//requestAnimationFrame解决了浏览器不知道javascript动画什么时候开始、不知道最佳循环间隔时间的问题。它是跟着浏览器的绘制走的，如果浏览器绘制间隔是16.7ms，它就按这个间隔绘制；如果浏览器绘制间隔是10ms, 它就按10ms绘制。这样就不会存在过度绘制的问题，动画不会丢帧。
       var now = Date.now();
       diffframetime = now - lastframetime;
       lastframetime = now;
        if (diffframetime > 40){
            diffframetime = 40;//防止切换浏览器，differ时间变长，果实长到无限大??????
        }

        ctx2.clearRect(0,0,canWidth,canHeight);//给定矩形内的指定像素,像橡皮檫
        can2App.drawbackground();//画背景
       aneOb.drawAne();
       computeFruit();
       fruitOb.drawFruit();

       ctx1.clearRect(0,0,canWidth,canHeight);
       monOb.drawMom();
       babyOb.drawBaby();

       if(!scoreOb.gameover){
           jzk.momEatFruit();
           jzk.momFoodBaby();
       }
       scoreOb.drawScore();
       waveOb.drawWave();
       dustOb.drawDust();
       halOb.drawHalo();
    };

    jzk.onMouseMove = function (e) {//鼠标移动事件
        if(!scoreOb.gameover){
            if(e.offsetX||e.layerX){ //layerX是FF所特有的
                mx = e.offsetX == undefined?e.layerX:e.offsetX;
                my = e.offsetY == undefined?e.offsetY:e.layerY;
            }
        }
    };
    jzk.onClick = function () {
        if(scoreOb.gameover){
            scoreOb.gameover = false;
            /*fruitOb.init();
            monOb.init();
            babyOb.init();
            scoreOb.init();*/
            jzk.startGame();//调用startGame从新开始
        }
    };
    jzk.momEatFruit = function () {//判断大鱼和果实之间的距离，小于30说明被吃掉
        for(var i=0;i<fruitOb.num;i++){
            if(fruitOb.alive[i]&&fruitOb.grow[i]){
                var len = calLength2(fruitOb.x[i],fruitOb.y[i],monOb.x,monOb.y);
                if(len<30){
                    fruitOb.dead(i);
                    waveOb.born(i);
                    scoreOb.fruitNum ++;
                    monOb.momBobyIndex = monOb.momBobyIndex==7?monOb.momBobyIndex:(monOb.momBobyIndex+1);
                    if(fruitOb.type[i]=="blue"){
                        scoreOb.doubleNum++;
                    }
                }
            }
        }
    };
    jzk.momFoodBaby = function () {////判断大鱼和小鱼之间的距离，小于30，小鱼的颜色变深
        if(scoreOb.fruitNum > 0 ){
            var len = calLength2(monOb.x,monOb.y,babyOb.x,babyOb.y);
            if(len < 30){//距离小于30，而且大鱼吃到了果实，才能喂小鱼
                halOb.born();
                monOb.bodyIndex = 0; //大鱼体力变0
                var num = scoreOb.doubleNum * scoreOb.fruitNum;
                var index = babyOb.bodyIndex - num;
                if(index<0){
                    index = 0;
                }
                var strength = scoreOb.strength + (index/2).toFixed(0);
                //toFixed() 方法可把 Number 四舍五入为指定小数位数的数字。
                if(strength>10){
                    strength = 10;
                }
                scoreOb.strength = strength;
                babyOb.bodyIndex = index;
                scoreOb.comcuteScore()
            }
        }
    };
    //******************************在画布2上绘图****************************
    window.can2App = {}
    can2App.drawbackground = function () {
        var img = new Image();
        img.src = imgUrl + 'background.jpg';
        ctx2.drawImage(img,0,0,canWidth,canHeight);//drawImage() 方法绘制一幅图像。
    };
    //********************************定义海藻类************************
    var aneObject = function () {
        this.num = 50;
        this.rootx = [];
        this.headx = [];
        this.heady = [];
        this.amp = [];//振幅
        this.bate = 0; //sin的幅度
    }
    aneObject.prototype.init = function () {
        for(var i = 0; i<this.num;i++){
            this.rootx[i] =  i * 18 + Math.random() * 30;//Math.random() * 30取1~30之间得随机数
            this.headx[i] = this.rootx[i];
            this.heady[i] = (canHeight-220)+Math.random()*50;
            this.amp[i] = Math.random()*50 + 60;
        }
    }
    aneObject.prototype.drawAne = function () {
        this.bate += diffframetime * 0.0008;//这个是什么？
        var l = Math.sin(this.bate);

        ctx2.save();//save() 方法保存当前图像状态的一份拷贝。
        ctx2.globalAlpha = 0.7;//透明度
        ctx2.lineWidth = 20;//线条宽度
        ctx2.lineCap="round";//线条末端线帽的样式:圆形
        ctx2.strokeStyle = "#3b154e";//strokeStyle 属性设置或返回用于笔触的颜色、渐变或模式
        for(var i = 0 ;i<this.num;i++){
            var endx = this.headx[i] + l*this.amp[i];
            ctx2.beginPath();
            ctx2.moveTo(this.headx[i],canHeight);//将绘图游标移动到(x,y)，不画线
            ctx2.quadraticCurveTo(this.rootx[i],canHeight-100,endx,this.heady[i]);//quadraticCurveTo() 方法通过使用表示二次贝塞尔曲线的指定控制点，向当前路径添加一个点。
            ctx2.stroke();//stroke() 方法会实际地绘制出通过 moveTo() 和 lineTo() 方法定义的路径。默认颜色是黑色。
        }
        ctx2.restore();//restore() 方法将绘图状态置为保存值。
    }

    //*************************定义果实类*****************************
    var fruitObject = function () {
        this.num = 20;
        this.x = [];
        this.y = [];
        this.size = [];//果实大小
        this.type = [];//果实类型
        this.speed = [];//果实速度
        this.grow = [];//果实是否长大
        this.alive = [];//果实是否存活
        this.orange = new Image();
        this.blue = new Image();
    };
    fruitObject.prototype.init = function () {

        this.orange.src = "./img/fruit.png";
        this.blue.src = imgUrl + "blue.png";
        for(var i = 0;i<this.num;i++){
            this.x[i] = this.y[i] = 0;
            this.grow[i] = false;//表示未长大
            this.alive[i] = false;//表示不存在
            this.type[i] = "";
            this.speed[i] = Math.random()*0.015+0.005;//速度范围在[0.005,0.02）
        }
    };
    fruitObject.prototype.drawFruit = function () {
        for(var i = 0;i<this.num;i++){
            if(this.alive[i]){//如果存活
                if(this.size[i]<16){//如果还未长大
                    this.grow[i] = false;
                    this.size[i] += this.speed[i]*diffframetime*0.8;
                }
                else {//如果已经长大
                    this.grow[i] = true;
                    this.y[i] -= this.speed[i]*diffframetime*5;
                }
                var pic = this.orange;
                if(this.type[i] == "blue"){
                    pic = this.blue;
                }
                ctx2.drawImage(pic,this.x[i] - this.size[i]*0.5,this.y[i] - this.size[i]*0.5,this.size[i],this.size[i]);
                if(this.y[i]<8){
                    this.alive[i] = false;
                }
            }
        }
    };
    fruitObject.prototype.born = function (i) {
        var aneId = Math.floor(Math.random()*aneOb.num);
        this.x[i] = aneOb.headx[aneId];//果实的横坐标
        this.y[i] = aneOb.heady[aneId];//果实的纵坐标
        this.size[i] = 0;
        this.alive[i] = true;
        var flag = Math.random();
        if(flag<0.1){//随即产生蓝色或橙色的果实
            this.type[i] = "blue";
        }
        else {
            this.type[i] = "orange";
        }
    };
    fruitObject.prototype.dead = function (i) {
        this.alive[i] = false;
    };
    function computeFruit() { //计算屏幕上果实的数量
        var count = 0;
        for(var i = 0;i<fruitOb.num;i++){
            if(fruitOb.alive[i]){
                count++;
            }
            if(count<15){
                bornFruit();
                return false;//阻止事件的继续传播
            }
        }
    }
    function bornFruit() {//循环30个果实，如果为false,就出生
        for(var i=0;i<fruitOb.num;i++){
            if(!fruitOb.alive[i]){
                fruitOb.born(i);
                return false;
            }
        }
    }

    //************************在画布1上绘制**************************
    window.can1App ={}
    //***********************定义妈妈鱼类*****************************
    var monObject = function () {
        this.x = 0;
        this.y = 0;
        this.angle;//鱼的角度
        this.monTailArr = [];
        this.monTailTimer = 0;
        this.monTailIndex = 0;

        this.monEyeArr = [];
        this.monEyeTimer = 0;
        this.momEyeIndex = 0;
        this.momEyeInterval = 1000;

        this.momOrangeArr = [];
        this.momBlueArr = [];
        this.momBobyIndex = 0;
    }
    monObject.prototype.init = function () {
        this.x = canWidth*0.5;
        this.y = canHeight*0.5;
        this.angle = 0;
        //大鱼尾巴
        for(var i=0;i<8;i++){
            this.monTailArr[i] = new Image();//创建一个Image对象：var a=new Image();
            //定义Image对象的src: a.src=”xxx.gif”;  这样做就相当于给浏览器缓存了一张图片。
            this.monTailArr[i].src = imgUrl + "bigTail"+i+".png";
        }
        for(var i = 0;i<2;i++){
            this.monEyeArr[i] = new Image();
            this.monEyeArr[i].src = imgUrl+'bigEye'+ i +'.png';
        }
        for(var i =0;i<8;i++){
            this.momOrangeArr[i] =  new Image();
            this.momOrangeArr[i].src = imgUrl + "bigSwim"+i+".png";
            this.momBlueArr[i] = new Image();
            this.momBlueArr[i].src = imgUrl + "bigSwimBlue"+i+".png";
        }
    };
    monObject.prototype.drawMom = function () {
        this.x =lerpDistance(mx,this.x,0.96);
        this.y =lerpDistance(my,this.y,0.98);
        //lerp angle    让大鱼的角度倾向于鼠标的角度
        var deltaX = mx - this.x;//横坐标差
        var deltaY = my - this.y;//纵坐标差
        var beta = Math.atan2(deltaY,deltaX)+Math.PI;//目标角度
        this.angle =lerpAngle(beta,this.angle,0.6);

        this.monTailTimer += diffframetime;
        if(this.monTailTimer>50){
            this.monTailIndex = (this.monTailIndex+1)%8;//8是有8张图的意思
            this.monTailTimer %= 50;
        }
        this.monEyeTimer += diffframetime;
        if(this.monEyeTimer > this.momEyeInterval){
            this.momEyeIndex = (this.momEyeIndex+1)%2;
            this.monEyeTimer %= this.momEyeInterval;

            if(this.momEyeIndex == 0){
                this.momEyeInterval = Math.random()*1500+1500;
            }
            else {
                this.momEyeInterval = 200;
            }
        }
        ctx1.save();
        ctx1.translate(this.x,this.y);//把原点变成(this.x , this.y);
        ctx1.rotate(this.angle);//rotate() 方法旋转当前的绘图。

        var momTailImage = this.monTailArr[this.monTailIndex];
        ctx1.drawImage(momTailImage,-momTailImage.width * 0.5 + 30, -momTailImage.height * 0.5);

        var momBodyImage;
        if(scoreOb.doubleNum !=1){//说明吃了蓝色果实
            momBodyImage = this.momBlueArr[this.momBobyIndex];
        }
        else {
            momBodyImage = this.momOrangeArr[this.momBobyIndex];
        }
        ctx1.drawImage(momBodyImage,-momBodyImage.width * 0.5, -momBodyImage.height * 0.5);

        var momEyeImage = this.monEyeArr[this.momEyeIndex];
        ctx1.drawImage(momBodyImage,-momEyeImage.width*0.5,-momEyeImage.height*0.5);
        ctx1.restore();
    };

    //***********************定义baby鱼类******************************
    var babyObject = function () {
        this.x=0;
        this.y= 0;
        this.angle;//大鱼的角度
        this.babyTailArr = [];
        this.babyTailTimer = 0;//计数器
        this.babyTailIndex =0;

        this.babyEyeArr = [];
        this.babyEyeTimer = 0;
        this.babyEyeIndex = 0;
        this.babyEyeInterval = 1000;//初始间隔时间为1秒

        this.bodyArr = [];
        this.bodyTimer = 0;
        this.bodyIndex=0;
    };
    babyObject.prototype.init  =function () {
      this.x = canWidth*0.5-50;
      this.y = canHeight*0.5+50;
      this.angle = 0;
      for(var i=0;i<8;i++){
          this.babyTailArr[i] = new Image();
          this.babyTailArr[i].src = imgUrl + "babyTail"+i+".png";
      }
      for(var j=0;j<2;j++){
          this.babyEyeArr[j] = new Image();
          this.babyEyeArr[j].src = imgUrl + "babyEye"+j+".png";
      }
      for(var n=0;n<20;n++){
          this.bodyArr[n] = new Image();
          this.bodyArr[n].src = imgUrl+"babyFade"+n+".png";
      }
    };
    babyObject.prototype.drawBaby = function () {
        this.x = lerpDistance(monOb.x,this.x,0.98);
        this.y = lerpDistance(monOb.y,this.y,0.99);

        //小鱼的角度随大鱼的角度
        var deltaX = monOb.x - this.x;
        var deltaY = monOb.y - this.y;
        var beta = Math.atan2(deltaY,deltaX)+Math.PI;
        this.angle = lerpAngle(beta,this.angle,0.6);

        this.babyTailTimer += diffframetime;
        if(this.babyTailTimer>50){
            this.babyTailIndex = (this.babyTailIndex+1)%8;
            this.babyTailTimer %= 50;
        }
        this.babyEyeTimer += diffframetime;
        if(this.babyEyeTimer>this.babyEyeInterval){
            this.babyEyeIndex = (this.babyTailIndex+1)%2;
            this.babyEyeTimer %= this.babyEyeInterval;

            if(this.babyEyeIndex == 0){
                this.babyEyeInterval = Math.random()*1500+1500;
            }
            else{
                this.babyEyeInterval = 200;
            }
        }
        this.bodyTimer += diffframetime;
        if(this.bodyTimer > 550){
            this.bodyIndex += 1;
            this.bodyTimer %= 550;
            scoreOb.strength = ((20-this.bodyIndex)/2).toFixed(0);
            //toFixed() 方法可把 Number 四舍五入为指定小数位数的数字。
            if(this.bodyIndex > 19){
                this.bodyIndex = 19;
                scoreOb.gameover = true;
                can1.style.cursor = "pointer";
            }
        }

        ctx1.save();
        ctx1.translate(this.x,this.y);
        ctx1.rotate(this.angle);

        var babyTailImage = this.babyTailArr[this.babyTailIndex];
        ctx1.drawImage(babyTailImage,-babyTailImage.width * 0.5 + 24, -babyTailImage.height * 0.5);

        var babyEyeImage = this.babyEyeArr[this.babyEyeIndex];
        ctx1.drawImage(babyEyeImage,-babyEyeImage.width * 0.5, -babyEyeImage.height * 0.5);

        var babyBodyImage = this.bodyArr[this.bodyIndex];
        ctx1.drawImage(babyBodyImage,-babyBodyImage.width*0.5,-babyBodyImage.height*0.5);

        ctx1.restore();

    };
    //***********************定义数据类*******************************
    var scoreObject = function () {
        this.fruitNum = 0;
        this.doubleNum = 1;
        this.score = 0;
        this.strength=10;
        this.alpha = 0;
        this.gameover = false;
    };
    scoreObject.prototype.init = function () {
        this.fruitNum = 0;
        this.doubleNum = 1 ;
        this.score = 0;
    };
    scoreObject.prototype.drawScore = function () {
        ctx1.fillText("num:"+this.fruitNum,canWidth*0.5,canHeight-30);
        ctx1.fillText("double:"+this.doubleNum,canWidth*0.5,canHeight-70);

        ctx1.save();
        ctx1.font = "30px verdana";
        ctx1.fillText("SCORE:"+this.score,canWidth*0.5,50);
        ctx1.font = "20px verdana";
        ctx1.fillText("strength:",650,45);
        if(this.strength<=3){
            ctx1.fillStyle = "red";
        }
        ctx1.fillText(scoreOb.strength,710,45);

        if(scoreOb.gameover){
            //这里不用this.gameover的原因是在属性中this.gameover = false;应该考录实例中的gameover情况
            this.alpha += diffframetime*0.0005;
            if(this.alpha > 1){
                this.alpha = 1;
            }
            ctx1.font = "40px verdana";
            ctx1.shadowBlur = 10;
            ctx1.shadowColor = "white";
            ctx1.fillStyle = "rgba(255,255,255,"+this.alpha+")";
            ctx1.fillText("GAME OVER",canWidth*0.5,canHeight*0.5-25);
            ctx1.save();
            ctx1.font = "25px verdana";
            ctx1.fillText("CLICK TO RRSET",canWidth*0.5,canHeight*0.5+25);
            ctx1.restore();

        }
        ctx1.restore();

    };
    scoreObject.prototype.comcuteScore = function () {
        scoreOb.score += scoreOb.fruitNum*scoreOb.doubleNum;
        this.fruitNum = 0;
        this.doubleNum =1;
    };
    //**********************定义大鱼吃果实波浪类*************************
    var waveObject = function () {
        this.num = 10;
        this.x = [];
        this.y = [];
        this.r = [];
        this.status = [];//当前半径使用状态
    };
    waveObject.prototype.init = function () {
        for(var i=0;i<this.num;i++){
            this.x[i] = canWidth*0.5;
            this.y[i] = canHeight*0.5;
            this.r[i] = 0;
            this.status[i] = false;
        }
    };
    waveObject.prototype.drawWave = function () {//画圆圈
        ctx1.save();
        ctx1.lineWidth = 3;
        for(var i = 0;i<this.num;i++){
            if(this.status[i]){
                this.r[i] += diffframetime*0.04;
                if(this.r[i] > 60){
                    this.status[i] =false;
                    return false;
                }
                var alpha =1-this.r[i]/60;

                ctx1.strokeStyle="rgba(255,255,255,"+alpha+")";
                ctx1.beginPath();
                ctx1.arc(this.x[i],this.y[i],this.r[i],0,2*Math.PI);
                ctx1.stroke();
            }

        }
        ctx1.restore();
    };
    waveObject.prototype.born = function (index) {
        for(var i=0;i<this.num;i++){
            if(!this.status[i]){
                this.status[i] = true;
                this.x = fruitOb.x[index];
                this.y = fruitOb.y[index];
                this.r[i] = 10;
                return false;
            }
        }
    };
    //*********************定义大鱼吃小鱼光环类**************************
    var halObject =function () {
        this.num = 10;
        this.r=[];
        this.x = [];
        this.y = [];
        this.status = [];
    };
    halObject.prototype.init = function () {
        for(var i = 0;i<this.num;i++){
            this.x[i] = canWidth*0.5;
            this.y[i] = canHeight*0.5;
            this.r[i] = 0;
            this.status[i] = false;
        }
    };
    halObject.prototype.drawHalo = function () {
        ctx1.save();
        ctx1.lineWidth = 4;
        for(var i = 0;i<this.num;i++){
            if(this.status[i]){
                this.r[i] += diffframetime*0.04;
                if(this.r[i]>100){
                    this.status[i] = false;
                    return false;
                }
                var alpha = 1-this.r[i]/60;

                ctx1.strokeStyle = "rgba(203,91,0,"+alpha+")";
                ctx1.beginPath();
                ctx1.arc(this.x[i],this.y[i],this.r[i],0,2*Math.PI);
                ctx1.stroke();
            }
        }
        ctx1.restore();
    };
    halObject.prototype.born = function () {
        for(var i = 0;i<this.num;i++){
            if(!this.status[i]){
                this.status[i] = true;
                this.x[i] = babyOb.x;
                this.y[i] = babyOb.y;
                this.r[i] = 10;
                return false;//找到一个未使用的光环，就结束。
            }
        }
    }
    //*****************************************************************
    var dustObject =function () {
        this.num = 30;
        this.dustPic = [];
        this.x = [];
        this.y = [];
        this.amp = [];
        this.index = [];
        this.beta = 0;
    }
    dustObject.prototype.init = function () {
        for(var i =0;i<7;i++){
            this.dustPic[i] = new Image();
            this.dustPic[i].src = imgUrl+"dust"+i+".png";
        }
        for(var i=0;i<this.num;i++){
            this.x[i]=Math.random()*canWidth;
            this.y[i]=Math.random()*canHeight;
            this.amp = 20+Math.random()+15;
            this.index[i] = Math.floor(Math.random()*7);
        }
    }
    dustObject.prototype.drawDust = function () {
        for(var i = 0;i<this.num;i++){
            var index = this.index[i];
            ctx1.drawImage(this.dustPic[index],this.x,this.y);
        }
    }

})();