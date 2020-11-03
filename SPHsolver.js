window.onload = function() {
	var canvas = document.getElementById("canvas"),
		context = canvas.getContext("2d"),
		width = canvas.width = window.innerWidth,
		height = canvas.height = window.innerHeight;
		canvas.style.background = "#4BDCE7";
		
	var Particles = [],
	    G = new Vector2(0,9.8),
	    REST_DENS = 1000,
	    GAS_CONST = 2000,
	    H = 16,
	    HSQ = H * H,
	    Mass = 65,
	    VISC = 250,
	    DT = 0.038,
	    damp = -0.5;
	    
	var POLY6 = 315/(65 * Math.PI * Math.pow(H, 9));
	var SPIKY_GRAD = -45/(Math.PI * Math.pow(H, 6));
	var VISC_LAP = 45/(Math.PI * Math.pow(H, 6));
  
  var x = y = 0;
  function createParticles() {
  	for (var i = 0; i < 20; i++) {
  		for (var j = 0; j < 20; j++) {
  			Particles.push({
                          pos: new Vector2(200+x, 1100+y),
                       	  vel: new Vector2(0, 0),
  		          f: new Vector2(0, 0),
  			  rho: 0,
  			  p: 0
  			});
  			x += H;
  		}
  		x = 0;
  		y += H;
  	}
  }
  createParticles();
 
    function integrate() {
  	for (var i = 0; i < Particles.length; i++) {
  		var p = Particles[i];
  		/*
  		p.v += DT * p.f / p.rho
  		*/
  		var df = p.f.scale(DT);
  		p.vel = p.vel.add(df.div(p.rho));
  	
  		var dv = p.vel.scale(DT);
  		p.pos = p.pos.add(dv);
  
  		
  		if (p.pos.x > width) {
  			p.vel = p.vel.scale(damp);
  			p.pos.x = width;
  		}
  		if (p.pos.x < 0) {
  			p.vel = p.vel.scale(damp);
  			p.pos.x = 0;
  		}
  		if (p.pos.y > height) {
  			p.vel = p.vel.scale(damp);
  			p.pos.y = height;
  		}
  		  		
  	}
  	
  }
 
  function computeDensityPressure() {
  	for (var i = 0; i < Particles.length; i++) {
  		var pi = Particles[i];
  		pi.rho = 0;
  		for (var j = 0; j < Particles.length; j++) {
  			var pj = Particles[j];
  			var dij = pj.pos.subtract(pi.pos);
  			
  			var r2 = dij.magnitude_squared();
  			
  			if (r2 < HSQ) {
  				pi.rho += Mass*POLY6*Math.pow(HSQ - r2, 3);
  			}
  		}
  		pi.p = GAS_CONST*(pi.rho - REST_DENS);
  	}
  }
  
  function computeForces() {
      var i, j;
  	for (i = 0; i < Particles.length; i++) {
  		var pi = Particles[i];
  		var fPress = new Vector2(0, 0);
  		var fVisc = new Vector2(0, 0);
  		for (j = 0; j < Particles.length; j++) {
  			var pj = Particles[j];
  			if (i == j) {
  				continue;
  			}
  			
  			var dij = pj.pos.subtract(pi.pos);
  					
			  var r = dij.magnitude();
			  /*		  
				fpress += -rij.normalized()*MASS*(pi.p + pj.p)/(2.f * pj.rho) * SPIKY_GRAD*pow(H-r,2.f);
				
				
				fvisc += VISC*MASS*(pj.v - pi.v)/pj.rho * VISC_LAP*(H-r);
			  */
			  if (r < H) {
			  //normalize the dij
	    		  var uv = dij.unit_vector();
	         //negative (-rij.normalized())
    			  var n = uv.scale(-1);
			      var uvs = n.scale(Mass * (pi.p + pj.p) / (2 * pj.rho) * SPIKY_GRAD * Math.pow(H - r, 2));
			     
			      fPress = fPress.add(uvs);
			      
			      var dv = pj.vel.subtract(pi.vel);
			      //visc * mass * (pj.v - pi.v) ↓
			      dv = dv.scale(VISC * Mass);			      
			      var vl = pj.rho * VISC_LAP * (H - r);
			      var approx = dv.div(vl);
			      
			      fVisc = fVisc.add(approx);

			  }
  			
  		}
  		
		  var fGrav = G.scale(pi.rho);
		  pi.f = pi.f.add(fPress.add(fVisc.add(fGrav)));
  	}
  }
  
  
  update();
  function update() {
  	computeDensityPressure();
  	computeForces();
  	integrate();
  	renderParticles();
  	requestAnimationFrame(update);
  }
  
	function renderParticles() {
			context.clearRect(0, 0, width, height);
			for (var i = 0; i < Particles.length; i++) {
				var p = Particles[i];
				context.beginPath();
				context.fillStyle = "#ffffff";
				context.arc(p.pos.x, p.pos.y, 6, 0, Math.PI * 2);
				context.fill();
				}
  }
	
};
