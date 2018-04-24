window.requestAnimFrame =(function () {
    /*requestAnimFrame可以直接调用，也可以通过window来调用，接收一个函数作为回调，返回一个ID值，
    * 通过把这个ID值传给window.cancelAnimationFrame()可以取消该次动画。*/
    return window.requestAnimFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame||
        function( /* function FrameRequestCallback */ callback, /* DOMElement Element */ element) {
        return window.setTimeout(callback, 1000 / 60);
    };
})();
function lerpDistance(arm,cur,ratio) { ////aim：目标   cur：当前   ratio：百分比     每一次趋近的距离
    var delta = cur-arm;
    return arm+delta*ratio;
}
function lerpAngle(a,b,t) {//每一次旋转角度，a=目标角度，b=现在的角度
    var d=b-a;
    if(d < -Math.PI){
        d = d+2*Math.PI;
    }
    else if(d>Math.PI){
        d = d - 2*Math.PI;
    }
    return a+d*t;
}
function calLength2(x1, y1, x2, y2) {    //计算两个点之间的距离，，， 先求平方和，再开平方
    return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
}