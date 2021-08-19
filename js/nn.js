// ============================================================================
// ============================== NEURAL NETWORK ==============================
// ============================================================================

var nn_s = null
var nn_id = "neuralnet"      // the id of the svg tag we work on
var nn_interval_min = 5;
var nn_interval_max = 15;

var c_r = 10              // radius of each node
var c_color_in = "white"
var c_color_out = "black"
var c_draw_delay = 250    // delay between drawing each node

var l_colors = ["#ff5c33", "#3399ff"]   // for [negative, positive] values
var l_d_colors = ["#ff3300", "#0073e6"] // for [negative, positive] values
var l_draw_delay = 250    // delay between drawing each node
var l_d_draw_delay = 100  // delay between drawing each node (in each pass)

var nodes_svg = []      // hold svg elements of nodes
var lines_svg = []      // hold svg elements of lines
var lines_d_svg = []    // lines double are used to simulate forward/backwad pass

var nodes = [
  {x: 050, y:70}, 
  {x: 050, y:120}, 
  {x: 050, y:170}, 
  {x: 050, y:220}, 
  {x: 050, y:270}, 
  {x: 180, y:030}, 
  {x: 150, y:130}, 
  {x: 160, y:195}, 
  {x: 240, y:075}, 
  {x: 300, y:135}, 
  {x: 260, y:205}, 
  {x: 200, y:255}, 
  {x: 350, y:085}, 
  {x: 330, y:245}, 
  {x: 420, y:145}, 
]

var lines = [
  {start: 1, end: 6, val: 0}, 
  {start: 1, end: 7, val: 0}, 
  {start: 2, end: 9, val: 0}, 
  {start: 3, end: 7, val: 0}, 
  {start: 3, end: 8, val: 0}, 
  {start: 4, end: 7, val: 0}, 
  {start: 5, end: 8, val: 0}, 
  {start: 5, end: 11, val: 0}, 
  {start: 6, end: 7, val: 0}, 
  {start: 6, end: 13, val: 0}, 
  {start: 7, end: 10, val: 0}, 
  {start: 7, end: 11, val: 0}, 
  {start: 8, end: 10, val: 0}, 
  {start: 8, end: 12, val: 0}, 
  {start: 9, end: 10, val: 0}, 
  {start: 9, end: 15, val: 0}, 
  {start: 10, end: 14, val: 0}, 
  {start: 11, end: 15, val: 0}, 
  {start: 12, end: 14, val: 0}, 
  {start: 13, end: 15, val: 0}, 
  {start: 14, end: 15, val: 0}, 
]

// This function will create and draw the network
function create_nn(){
  if (nn_s == null){
    nn_s = Snap("#" + nn_id);
    if (nn_s == null){
        console.log("nn_s is null!")
    }
  }

  // clean stuff
  nn_s.clear()
  nodes_svg = []
  lines_svg = []
  lines_d_svg = []
  
  update_weights(1.5)

  // order matters (they'll draw on top of each other)
  create_lines()
  create_nodes()

  draw_nodes(0, c_draw_delay)
  draw_lines(0, l_draw_delay)
}

// trains the network (forward, backwad pass and update weights)
function train_nn(){
  var pass_time = lines.length * l_d_draw_delay   // time needed to do a pass
  draw_d_lines(0, l_d_draw_delay, +1)
  setTimeout(draw_d_lines, pass_time + 500, 0, l_d_draw_delay, -1)
  setTimeout(update_weights, 2*pass_time + 500, 2)
  setTimeout(update_lines, 2*pass_time + 1000)
}

// does a forward pass and calls itself in random time
function forward_loop_nn(){
  draw_d_lines(0, l_d_draw_delay, +1)
  var rand = nn_interval_min + Math.random() * (nn_interval_max - nn_interval_min);
  setTimeout(forward_loop_nn, rand * 1000);
}



// create the nodes
function create_nodes(){
  for (var i=0 ; i<nodes.length ; i++){
    var node = nodes[i]
    var c = nn_s.circle(node.x, node.y, c_r)
    nodes_svg.push(c)
    
    var c_len = c.getTotalLength();
    c.attr({
      fill: c_color_in,
      stroke: c_color_out,
      strokeWidth: 1,
      strokeDasharray: c_len,
      strokeDashoffset: c_len
    });
  }
}

// create the lines
function create_lines(){
  for (var i=0 ; i<lines.length ; i++){
    var line = lines[i]
    var l = nn_s.line(nodes[line.start-1].x, nodes[line.start-1].y, nodes[line.end-1].x, nodes[line.end-1].y)
    lines_svg.push(l)
    
    var l_len = l.getTotalLength();
    l.attr({
      stroke: l_colors[(line.val < 0) ? 0 : 1],
      strokeWidth: Math.abs(line.val),
      strokeDasharray: l_len,
      strokeDashoffset: l_len
    });

    // double line
    var l_d = nn_s.line(nodes[line.start-1].x, nodes[line.start-1].y, nodes[line.end-1].x, nodes[line.end-1].y)
    lines_d_svg.push(l_d)
    
    l_d.attr({
      stroke: l_d_colors[(line.val < 0) ? 0 : 1],
      strokeWidth: Math.abs(line.val) * 1.5,
      strokeDasharray: l_len,
      strokeDashoffset: l_len
    });
  }
}

// each time draws a node and with a delay calls itself for drawing another node
function draw_nodes(i, ms){
  var c = nodes_svg[i]
  c.animate({strokeDashoffset: 0}, 500);
  if (i+1 < nodes.length)
    setTimeout(draw_nodes, ms, i+1, ms)
}

// each time draws a line and with a delay calls itself for drawing another line
function draw_lines(i, ms){
  var l = lines_svg[i]
  l.animate({strokeDashoffset: 0}, 500);
  if (i+1 < lines.length)
    setTimeout(draw_lines, ms, i+1, ms)
}

// simulate forward/backward pass (direction = +1/-1)
// each time draws a double line and with a delay calls itself for drawing another line
function draw_d_lines(i, ms, direction){
  var l = lines_d_svg[(direction == 1) ? i : lines.length-1 - i]
  var l_len = l.getTotalLength();
  l.attr({strokeDashoffset: direction*l_len});
  l.animate({strokeDashoffset: -direction*l_len}, 500);
  if (i+1 < lines.length)
    setTimeout(draw_d_lines, ms, i+1, ms, direction)
}

// updtaes lines' val by random value from [-lr, lr] and clips
function update_weights(lr){
  for (var i=0 ; i<lines.length ; i++){
    var tmp = lr * (2*Math.random()-1)
    lines[i].val += Math.min(Math.max(tmp, -4), 4)
  }
}

// updtaes each line's color and stroke with respect to its val
function update_lines(){
  for (var i=0 ; i<lines.length ; i++){
    var line = lines[i]
    var l = lines_svg[i]
    var l_d = lines_d_svg[i]

    l.animate({
      stroke: l_colors[(line.val < 0) ? 0 : 1],
      strokeWidth: Math.abs(line.val)
    }, 500);
    l_d.animate({
      stroke: l_d_colors[(line.val < 0) ? 0 : 1],
      strokeWidth: Math.abs(line.val) * 1.5
    }, 500);
  }
}