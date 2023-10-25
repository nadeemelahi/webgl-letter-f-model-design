// author: "nadeem@webscripts.biz"

var gl = ngl.get_gl();

var idx , jdx;

var xAngle=0, yAngle=0, zAngle=0;
var xScale=1, yScale=1, zScale=1;
var xLoc=0.0, yLoc=0.0, zLoc=0; 

// mouse event - we are using fullscreen canvas
// so we can listen on window just the same
window.addEventListener("mousedown", mouseDown, false);
window.addEventListener("mouseup", mouseUp, false);
window.addEventListener("mouseout", mouseUp, false);
window.addEventListener("mousemove", mouseMove, false);

var isDragging = false, rotdamp = 0.1;
var pvmx , pvmy ;
// pv -previous  mx -mouse x location 
function mouseDown(e){ 
	isDragging = true; 
	pvmx = e.clientX ;
	pvmy = e.clientY ;
}
function mouseMove(e){
	if(!isDragging) return;
	// dragging on x should rotate y and vice versa
	yAngle += (e.clientX - pvmx) * rotdamp;
	xAngle += (e.clientY - pvmy) * rotdamp;
}
function mouseUp(e){ isDragging = false; }

// 2 x 11 quads: x 3D(x,y,z)
// 6 x 3D(red,green,blue) colour channels 
var dim = 3;

var verts11front =  [ 
	 0, 0, -1  ,  1, 0, -1  ,  1, 1, -1  ,  0, 1, -1  ,  // 0 1 2 3 red 
	 0, 2, -1  ,  2, 2, -1  ,  2, 3, -1  ,  0, 3, -1  ,  // 4 5 6 7 green 
	-1,-2, -1  ,  0,-2, -1  , -1, 3, -1                  // 8 9 10 blue 
];

var verts11back =  [ ];
for(idx = 0 ; idx < 33 ; idx += 3){
	verts11back[idx] = verts11front[idx];
	verts11back[idx + 1] = verts11front[idx + 1];
	verts11back[idx + 2] = 1;
}

var verts22 = [];
for(idx = 0; idx < 33; idx++){
	verts22[idx] = verts11front[idx];
}

for(idx = 33; idx < 66; idx++){
	verts22[idx] = verts11back[idx - 33];
}

//for(idx = 0; idx < verts.length; idx += 3){ console.log(verts[idx] + "," + verts[idx+1] + "," + verts[idx+2] ); }

var indices = [           
	//__front__0->17
	0,1,2 , 0,2,3   , // red 
	4,5,6 , 4,6,7   , // green 
	8,9,7 , 8,7,10  , // blue
	// __back__18->35
	0,2,1 , 0,3,2   , // cyan 
	4,6,5 , 4,7,6   , // magenta
	8,7,9 , 8,10,7  , // yellow 
]; 
// we have depth test enable in configuration a00.js
// convention is counter clockwise for front face
// converts triangles to clockwise, swap the 2nd and 3rd verts
// verts: front 0->10 , 11->21
// indices: front 0->17 , back 18->35
// must add 11 to indicies 18->35 obviously
for(idx = 18; idx < 36; idx++){
	indices[idx] += 11;
}

yAngle = -60; xAngle = 20;

var coloursIndices = [ 
	0.0 , 0.9 , 0.4 ,
	0.0 , 0.9 , 0.4 ,
	0.0 , 0.9 , 0.4 , 

	0.4 , 0.0 , 0.4 ,
	0.4 , 0.0 , 0.4 ,
	0.4 , 0.0 , 0.4 ,

	0.4 , 0.2 , 0.2 , //
	0.2 , 0.2 , 0.4 , //

	0.9 , 0.9 , 0.9 , //
	0.7 , 0.7 , 0.7 , //
	0.4 , 0.4 , 0.4 , //

	0.2 , 0.4 , 0.4 , //
	0.5 , 0.4 , 0.6 , //
	0.7 , 0.9 , 0.9 , //
	0.2 , 0.1 , 0.2 , //
	0.4 , 0.2 , 0.3 , //
]; 

var backIndicies = [
	 8 , 19 , 21  ,   8 , 21 , 10   ,
	10 , 21 , 17  ,  10 , 17 ,  6   ,

	 8 , 19 , 20  ,   8 , 20 ,  9   ,
	 9 , 20 , 11  ,   9 , 11 ,  0   ,
	 0 , 11 , 12  ,   0 , 12 ,  1   ,
	
	 1 , 12 , 13  ,   1 , 13 ,  2   ,
	 3 ,  2 , 13  ,   3 , 13 , 14   ,
	 3 , 14 , 15  ,   3 , 15 ,  4   ,
	 4 , 15 , 16  ,   4 , 16 ,  5   ,
	 5 , 16 , 17  ,   5 , 17 ,  6   ,

];
var len = backIndicies.length;
for(idx = 0; idx < len; idx++){
	indices[36 + idx] = backIndicies[idx];
}



// generate vertices 
var cnt = dim * len;
var cntVerts = [];
// loop indices[]
for(idx = 0; idx < cnt; idx++){ 
	cntVerts.push( verts22[ indices[idx] * dim ] );
	cntVerts.push( verts22[ (indices[idx] * dim) + 1 ] );
	cntVerts.push( verts22[ (indices[idx] * dim) + 2 ] );
}

var cntColours = [];
// loop colours2[] by three(rgb)
var verts2paintCnt = 6; // 3 indices/verts x 2 triangles/quad
for(idx = 0; idx < cnt; idx += 3){ 
	// setting same colour for 2 triangles
	for( jdx = 0; jdx < verts2paintCnt; jdx++){ 
		cntColours.push( coloursIndices[ idx ] );     // red
		cntColours.push( coloursIndices[ idx + 1 ] ); // green
		cntColours.push( coloursIndices[ idx + 2 ] ); // blue
	}
}

var verts = new Float32Array(cntVerts);
var colours =  new Float32Array(cntColours);

function scalexyz(scale){ xScale = yScale = zScale = scale; }
scalexyz(.1);

ngl.configureDraw();
loadData();
drawframe();

function drawframe(){

	gl.clear(gl.COLOR_BUFFER_BIT);
	gl.drawArrays(gl.TRIANGLES, 0, cnt);


	yAngle++; if(yAngle>360) yAngle = 0;
	xAngle++; if(xAngle>360) yAngle = 0;
	ngl.loadUniform1f("yAngle",yAngle);
	ngl.loadUniform1f("xAngle",xAngle);
	
	setTimeout(drawframe,50);
}

function loadData(){
	ngl.loadAttribute("vert",verts,dim);
	ngl.loadAttribute("colour",colours,dim);

	ngl.loadUniform1f("xAngle",xAngle);
	ngl.loadUniform1f("yAngle",yAngle);
	ngl.loadUniform1f("zAngle",zAngle);

	ngl.loadUniform1f("xScale",xScale);
	ngl.loadUniform1f("yScale",yScale);
	ngl.loadUniform1f("zScale",zScale);

	ngl.loadUniform1f("xLoc",xLoc);
	ngl.loadUniform1f("yLoc",yLoc);
	ngl.loadUniform1f("zLoc",zLoc);
}

