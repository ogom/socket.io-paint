document.addEventListener('DOMContentLoaded', function(){

  var paint = new io.connect('/paint');
  paint.on('paint points', function(points) {
    painting(points);
  });

  var canvas = document.querySelector('canvas');
  var context = canvas.getContext('2d');

  context.lineWidth = 4;
  context.lineCap = 'round';
  context.fillStyle = 'black';
  context.strokeStyle = 'black';

  var positioning = null;
  var drawing = false;

  canvas.addEventListener('mousedown', function(event) {
    event.preventDefault();
    positioning = position(event);
    drawing = true;

    context.beginPath();
    context.arc(positioning.x, positioning.y, context.lineWidth/2, 0, Math.PI*2, true)
    context.fill();
    context.beginPath();
    context.moveTo(positioning.x, positioning.y);
  }, false);

  canvas.addEventListener('mousemove', function(event) {
    event.preventDefault();
    if (drawing == true) {
      draw(event);
    }
  }, false);

  canvas.addEventListener('mouseup', function(event) {
    event.preventDefault();
    if (drawing == true) {
      draw(event);
      drawing = false;
    }
  }, false);

  canvas.addEventListener('mouseout', function(event) {
    event.preventDefault();
    if (drawing == true) {
      draw(event);
      drawing = false;
    }
  }, false);

  var save = document.getElementById('save');
  save.addEventListener('click', function() {
    var url = canvas.toDataURL();
    window.open(url, 'data url');
  }, false);

  var clear = document.getElementById('clear');
  clear.addEventListener('click', function() {
    context.clearRect(0, 0, canvas.width, canvas.height)
  }, false);

  var colors = document.getElementById('colors').childNodes;
  for (var i = 0, color; color = colors[i]; i++) {
    if (color.nodeName.toLowerCase() != 'div') continue;
    color.addEventListener('click', function (event) {
      var style = event.target.getAttribute('style');
      var color = style.match(/background:(#......)/)[1];
      context.strokeStyle = color;
      context.fillStyle = context.strokeStyle
    }, false);
  }

  function draw(event) {
    points = brush(event, positioning, context);
    paint.json.emit('paint points', points);
    painting(points);
    positioning = points;
  }

  function painting(points) {
    context.strokeStyle = points.color;
    context.fillStyle = context.strokeStyle
    context.beginPath();
    context.moveTo(points.x, points.y);
    context.lineTo(points.xp, points.yp);
    context.closePath();
    context.stroke();
  }
}, false);

function brush(event, positioning, context) {
  var positions = position(event);
  return {
      x: positions.x
    , y: positions.y
    , xp: positioning.x
    , yp: positioning.y
    , color: context.strokeStyle
  }
}

function position(event) {
  var rect = event.target.getBoundingClientRect();
  return {
      x: event.clientX - rect.left
    , y: event.clientY - rect.top
  }
}
