// JavaScript draw source code written by Andrew Polanyi
var canvas_count = 0;
var context;
var cur_canvas;
var cur_canvaso;
var drawtool;
var tools = {};
var current_canvas;
var colors = ["#ff3838", "#EE5A24", "#5758BB", "#006266", "#0057a0", "#fff200", "#8ebbe8", "2ed573", "#8ee8b7", "#e320f5"]

function makeNewCanvas() {

    var canvas, canvaso, contexto;

    var canvaso = document.createElement("canvas");
    canvaso.id = "canvas_" + canvas_count;


    canvaso.style.backgroundColor = "transparent";


    canvaso.zIndex = "10";


    var canvas_div = document.createElement("div");
    //canvas_div.style.position = "absolute";
    canvas_div.style.backgroundColor = "transparent";
    //canvas_div.style.left = (500 * canvas_count) + "px";
    canvas_div.id = "canvas_div" + canvas_count;
    canvas_div.style.zIndex = 0;

    canvas_div.style.height = "500px";
    canvas_div.style.width = "50%";
    
    
    canvas_div.appendChild(canvaso);


    var cr = document.getElementById("canvas_relm");
    cr.appendChild(canvas_div);


    function init() {
        var canvaso = document.getElementById("canvas_" + canvas_count);

        canvaso.style.position = "absolute";
        var canvas_div = document.getElementById("canvas_div" + canvas_count);
        cur_canvaso = canvaso.id;

        canvaso.width = canvas_div.clientWidth;
        canvaso.height = canvas_div.clientHeight;
        canvaso.style.border = "1px solid #3498db";

        // get the canvas context
        contexto = canvaso.getContext('2d');

        // Build the tempcanvas. 
        var container = canvaso.parentNode;
        canvas = document.createElement('canvas');

        if (!canvas) {
            alert('Error! Cannot create a new canvas element!');
            return;
        }
        canvas.id = 'tempCanvas_0';
        cur_canvas = canvas.id;

        canvas.width = canvaso.width;
        canvas.height = canvaso.height;
        canvas.style.position = "absolute";
        canvas.style.zIndex = 1;
        canvas.style.backgroundColor = "transparent";
        canvas.style.border = "1px solid #3498db";
        container.appendChild(canvas);          //inject into drawingCanvas
        context = canvas.getContext('2d');
        img = document.createElement('img');
        canvas.onclick = function () {

            cur_canvas = this.id;
            var num = this.id.split("_");
            canvas = document.getElementById(cur_canvas);
            context = canvas.getContext('2d');
            cur_canvaso = "canvas_" + num[1];
        }



        context.strokeStyle = colors[Math.floor(Math.random() * 9) ];
        context.lineWidth = 4.0;// Default stroke weight. 

        drawtool = new tools['draw'];
        

        
        // Event Listeners for draw
        canvas.addEventListener('mousedown', ev_init, false);     //THIS IS A BUG, when changed to window.addEventListener it works when mouse is off screen #1
        canvas.addEventListener('mousemove', ev_init, false);
        canvas.addEventListener('mouseup', ev_init, false);
        
        


        
    }// end init

    // Get the mouse position. 
    function ev_init(ev) {
        ev.preventDefault();
        if (ev.layerX || ev.layerX == 0) { // Firefox 
            ev._x = ev.layerX;
            ev._y = ev.layerY;
        } else if (ev.offsetX || ev.offsetX == 0) { // Opera 
            ev._x = ev.offsetX;
            ev._y = ev.offsetY;
        }
        var func = drawtool[ev.type];
        if (func) {
            func(ev);
        }
        
    }

    // Create the temporary canvas on top of the canvas, which is cleared each time the user draws. 
    function img_update() {

        var canvas = document.getElementById(cur_canvas);
        var canvaso = document.getElementById(cur_canvaso);
        context = canvas.getContext('2d');
        contexto = canvaso.getContext('2d');

        contexto.drawImage(canvas, 0, 0); //this draws the temp canvas stroke to the background drawing canvas



        context.clearRect(0, 0, canvas.width, canvas.height);       //clears temp canvas stroke

    }



     
    tools.draw = function() {
        var drawtool = this;
        var i_x;        //initial x and y mouse position
        var i_y;
        drawtool.started = false;
        
        
        this.mousedown = function (ev) {
            
            //context.lineCap = "round";
            context.beginPath();
            i_x = ev._x;
            i_y = ev._y;
            context.moveTo(ev._x, ev._y);

            drawtool.started = true;
        };
        this.mousemove = function (ev) {
            if (drawtool.started) {
                context.lineTo(ev._x, ev._y);
                context.stroke();
            }    
            
        };
        this.mouseup = function (ev) {
            if (drawtool.started) {
                drawtool.started = false;
                if (i_x != ev._x || i_y != ev._y) {     //check if any draw has occured

                    img_update();

                }
            }
           

        };
    };


    init();

}