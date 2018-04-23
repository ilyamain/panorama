function panorama (wrapper) 
{
	var options = {}; // Panorama options
	var dragging = false; // Drag mode switcher
	var start_vars = // Default panorama options
	{
		w: 4000, // initial width
		h: 2000, // initial height
		x: 0, // initial x-position
		y: 0, // initial y-position
		z: 1, // initial z-position
		dx_dy: 0, // initial dx-position (have no matter, because it change after first panorama moving)
		zmin: 1, // minimal z-position
		zmax: 5, // maximal z-position
		zstep: 0.1, // step of z-position change on scroll
		pultarrows: true, // allow arrows pult on the panorama
		pultzoom: true, // allow zoom pult on the panorama
		nozoom: false, // deny zoom
		pultstep: 100, // default step for pult moving
		sphearic: false, // if true, y-position become a circular
		cylinder: true, // if true, x-position become a circular
		add_html: '', // addition html in panorama wrapper
		title_text: 'Panorama', // default title text
		title_class: 'pano-title', // default title class
		shell_class: 'pano-images', // default panorama shell class
		bgclass: 'pano-img', // default panorama background class
		bgsrc: '/example.jpg', // default panorama image
		attr_name: 'panorama', // default attribute of panorama with options
		link_text: '', // default link text
		link_class: 'pano-goto', // default link classname
		links: new Array(), // default links array
	};

	var pano = 
	{
		title: $('<div>'), // Panorama title
		shell: $('<div>'), // The shell of images and links
		bg: $('<div>'), // Panorama background
		current: new Object(), // Current panorama options
		links: new Array(), // Current panorama links
		size: // Current scaled size of panorama background
		{
			w: start_vars.w, 
			h: start_vars.h, 
		}, 
		pos: // Current panorama position
		{
			x: start_vars.x, 
			y: start_vars.y, 
			z: start_vars.z, 
			px: start_vars.x, // previous x (before drag mousemove)
			py: start_vars.y, // previous y (before drag mousemove)
			dx: start_vars.dx_dy, // delta x (after drag mousemove)
			dy: start_vars.dx_dy, // delta y (after drag mousemove)
		}, 
	};

	// Panorama results
	var results = 
	{
		set: function (defaults) 
		{
			for (var k in defaults) {start_vars[k] = defaults[k];};
		}, 
		render: function (pano_options) 
		{
			options = pano_options; // get options from request
			get_html(start_vars.attr_name); // get options from html attribute
			defaults(); // set defaults
			calculate(); // calculate current panorama
			set_dom(); // set elements classes, texts etc.
			paint(); // render elements
		}, 
	};

	// Dragging panorama
	$(wrapper).on('mousemove touchmove mousedown touchstart mouseup mouseout touchend', pano, function (event) 
	{
		var cursor = new Object;
		cursor.x = (event.type === 'touchmove') ? event.targetTouches[0].pageX : event.clientX;
		cursor.y = (event.type === 'touchmove') ? event.targetTouches[0].pageY : event.clientY;
		moving(cursor);
		if ((event.type === 'mousedown')||(event.type === 'touchstart')) dragging = true;
		if ((event.type === 'mouseup')||(event.type === 'mouseout')||(event.type === 'touchend')) dragging = false;
		return false; //Disable standart action
	});

	// Scaling panorama
	$(wrapper).on('mousewheel', pano, function (event) 
	{
		var delta = 1;
		var cursor = new Object;
		if (event.originalEvent.deltaY > 0) delta = -1;
		cursor.x = (event.type === 'touchmove') ? event.targetTouches[0].pageX : event.clientX;
		cursor.y = (event.type === 'touchmove') ? event.targetTouches[0].pageY : event.clientY;
		scaling(delta, cursor);
		return false; //Disable standart action
	});
	// Return results
	return results;

	/////////////////////////////////////////////////////////////////////////////////////////////////
	/////////////////////////////////////////// FUNCTIONS ///////////////////////////////////////////
	/////////////////////////////////////////////////////////////////////////////////////////////////
	// Initiate options
	function defaults () 
	{
		// Common initiation
		if (missed(options.pano)) options.pano = {empty_pano:{}};
		if (missed(options.def)) options.def = Object.keys(options.pano)[0];
		// Panorama items
		for (var k in options.pano) 
		{
			// impossible to set false
			if (missed(options.pano[k].pultstep)) options.pano[k].pultstep = start_vars.pultstep;
			if (missed(options.pano[k].add_html)) options.pano[k].add_html = start_vars.add_html;
			if (missed(options.pano[k].shell_class)) options.pano[k].shell_class = start_vars.shell_class;
			if (missed(options.pano[k].title_class)) options.pano[k].title_class = start_vars.title_class;
			if (missed(options.pano[k].title_text)) options.pano[k].title_text = start_vars.title_text;
			if (missed(options.pano[k].bgclass)) options.pano[k].bgclass = start_vars.bgclass;
			if (missed(options.pano[k].bgsrc)) options.pano[k].bgsrc = start_vars.bgsrc;
			if (missed(options.pano[k].bgw)) options.pano[k].bgw = start_vars.w;
			if (missed(options.pano[k].bgh)) options.pano[k].bgh = start_vars.h;
			if (missed(options.pano[k].bgx)) options.pano[k].bgx = start_vars.x;
			if (missed(options.pano[k].bgy)) options.pano[k].bgy = start_vars.y;
			if (missed(options.pano[k].bgz)) options.pano[k].bgz = start_vars.z;
			if (missed(options.pano[k].bgzmin)) options.pano[k].bgzmin = start_vars.zmin;
			if (missed(options.pano[k].bgzmax)) options.pano[k].bgzmax = start_vars.zmax;
			if (missed(options.pano[k].bgzstep)) options.pano[k].bgzstep = start_vars.zstep;
			if (missed(options.pano[k].links)) options.pano[k].links = start_vars.links;
			// possible to set false
			if ((missed(options.pano[k].sphearic))&&(options.pano[k].sphearic != false)) options.pano[k].sphearic = start_vars.sphearic;
			if ((missed(options.pano[k].cylinder))&&(options.pano[k].cylinder != false)) options.pano[k].cylinder = start_vars.cylinder;
			if ((missed(options.pano[k].pultarrows))&&(options.pano[k].pultarrows != false)) options.pano[k].pultarrows = start_vars.pultarrows;
			if ((missed(options.pano[k].pultzoom))&&(options.pano[k].pultzoom != false)) options.pano[k].pultzoom = start_vars.pultzoom;
			if ((missed(options.pano[k].nozoom))&&(options.pano[k].nozoom != false)) options.pano[k].nozoom = start_vars.nozoom;
		};
	}

	// Replace defaults from html attribute
	function get_html (attr_name) 
	{
		var html_options = $(wrapper).attr(attr_name);
		if (!missed(html_options)) 
		{
			var json_options = JSON.parse(html_options.replace(/'/g, '"'));
			for (var k in json_options) {start_vars[k] = json_options[k];};
		};
	}

	// Set current panorama options
	function calculate () 
	{
		// Get current panorama options
		pano.current.pultarrows = options.pano[options.def].pultarrows;
		pano.current.pultzoom = options.pano[options.def].pultzoom;
		pano.current.nozoom = options.pano[options.def].nozoom;
		pano.current.pultstep = options.pano[options.def].pultstep;
		pano.current.sphearic = options.pano[options.def].sphearic;
		pano.current.cylinder = options.pano[options.def].cylinder;
		pano.current.add_html = options.pano[options.def].add_html;
		pano.current.shell_class = options.pano[options.def].shell_class;
		pano.current.title_class = options.pano[options.def].title_class;
		pano.current.title_text = options.pano[options.def].title_text;
		pano.current.bgclass = options.pano[options.def].bgclass;
		pano.current.bgsrc = options.pano[options.def].bgsrc;
		pano.current.bgw = options.pano[options.def].bgw;
		pano.current.bgh = options.pano[options.def].bgh;
		pano.current.bgx = options.pano[options.def].bgx;
		pano.current.bgy = options.pano[options.def].bgy;
		pano.current.bgz = options.pano[options.def].bgz;
		pano.current.bgzmin = options.pano[options.def].bgzmin;
		pano.current.bgzmax = options.pano[options.def].bgzmax;
		pano.current.bgzstep = options.pano[options.def].bgzstep;
		pano.current.links = options.pano[options.def].links;
		// Calculate current panorama size and position
		pano.pos.x = pano.current.bgx;
		pano.pos.y = pano.current.bgy;
		pano.pos.z = pano.current.bgz;
		confines('xyz'); // set x,y,z confines
		// Links initiation
		pano.links = [];
		pano.current.links.map(function (item) 
		{
			if (missed(item.content)) item.content = start_vars.link_text;
			if (missed(item.class_name)) item.class_name = start_vars.link_class;
			if (missed(item.x)) item.x = 0;
			if (missed(item.y)) item.y = 0;
			if (missed(item.center_x)) item.center_x = 0;
			if (missed(item.center_y)) item.center_y = 0;
			if (missed(item.drag)) item.drag = false;
			if (missed(item.set)) item.set = options.def;
			var img_link = 
			{
				cx: item.x, // constant X
				cy: item.y, // constant Y
				center_x: item.center_x, 
				center_y: item.center_y, 
				drag: item.drag, 
				set: item.set, 
				dom: $('<div>'), 
				class_name: item.class_name, 
				content: item.content, 
			};
			pano.links.push(img_link);
		});
	}

	// Set x,y,z with considering of confines
	function confines (coordinate) 
	{
		if (coordinate.indexOf('z') > -1) 
		{
			if (pano.pos.z < pano.current.bgzmin) pano.pos.z = pano.current.bgzmin;
			if (pano.pos.z > pano.current.bgzmax) pano.pos.z = pano.current.bgzmax;
		}
		pano.size.w = pano.current.bgw * pano.pos.z;
		pano.size.h = pano.current.bgh * pano.pos.z;
		if (coordinate.indexOf('x') > -1) pano.pos.x = circulate(pano.pos.x);
		if (coordinate.indexOf('y') > -1) 
		{
			pano.pos.y = pano.pos.y % pano.size.h;
			if (!pano.current.sphearic) 
			{
				var bottom_pixel = $(wrapper).height() - pano.size.h;
				if (pano.pos.y >= 0) pano.pos.y = 0;
				if (pano.pos.y <= bottom_pixel) pano.pos.y = bottom_pixel;
			}
		}
	}

	// Set elements classes and html inner
	function set_dom () 
	{
		pano.shell.addClass(pano.current.shell_class);
		pano.title.addClass(pano.current.title_class);
		pano.title.html(pano.current.title_text);
		pano.bg.addClass(pano.current.bgclass);
		// Append elements
		clean(pano.current.add_html); // clean panorama
		$(wrapper).append(pano.title);
		$(wrapper).append(pano.shell);
		pano.shell.append(pano.bg);
		// Create links
		pano.links.map(function (item) 
		{
			item.dom.addClass(item.class_name);
			item.dom.html(item.content);
			$(item.dom).on('click', function () 
			{
				options.def = item.set;
				calculate(); // calculate current panorama
				set_dom(); // set elements classes, texts etc.
				paint(); // render elements
			});
			pano.shell.append(item.dom);
		});
		// Add pult
		if (pano.current.pultarrows) 
		{
			var pult = 
			{
				dom: $('<div class="pano-arrows">'), 
				arrows: 
				{
					l: $('<div class="pano-arrow pano-arrow-left">'), 
					r: $('<div class="pano-arrow pano-arrow-right">'), 
					u: $('<div class="pano-arrow pano-arrow-top">'), 
					d: $('<div class="pano-arrow pano-arrow-bottom">'), 
				}, 
				buttons: 
				{
					p: $('<div class="pano-zoom pano-zoom-plus">'), 
					m: $('<div class="pano-zoom pano-zoom-minus">'), 
				}, 
			};
			// Pult arrows
			for (let k in pult.arrows) 
			{
				$(pult.arrows[k]).on('click', function () {pult_moving(k);});
				pult.dom.append(pult.arrows[k]);
			};
			pano.shell.append(pult.dom);
			// Pult zoom
			if ((pano.current.pultzoom)&&(!pano.current.nozoom)) for (let k in pult.buttons) 
			{
				$(pult.buttons[k]).on('click', function () {pult_scaling(k);});
				pano.shell.append(pult.buttons[k]);
			};
		}
	}

	// Panorama scaling with pult
	function pult_scaling (direction) 
	{
		var pos = 
		{
			x: pano.pos.px, 
			y: pano.pos.py, 
		};
		if (direction == 'p') delta = 1;
		if (direction == 'm') delta = -1;
		scaling(delta, pos);
	}

	// Panorama moving with pult
	function pult_moving (direction) 
	{
		var pos = 
		{
			x: pano.pos.px, 
			y: pano.pos.py, 
		};
		if (direction == 'l') pos.x += pano.current.pultstep;
		if (direction == 'r') pos.x -= pano.current.pultstep;
		if (direction == 'u') pos.y += pano.current.pultstep;
		if (direction == 'd') pos.y -= pano.current.pultstep;
		dragging = true;
		moving(pos);
		dragging = false;
	}

	// Panorama scaling
	function scaling (delta) 
	{
		pano.pos.z = (!pano.current.nozoom) ? pano.pos.z + delta * pano.current.bgzstep : pano.pos.z;
		confines('xyz'); // set x,y,z confines
		pano.size.w = pano.current.bgw * pano.pos.z;
		pano.size.h = pano.current.bgh * pano.pos.z;
		paint();
	}

	// Panorama moving
	function moving (cursor) 
	{
		// calculate position (x, y)
		pano.pos.dx = cursor.x - pano.pos.px;
		pano.pos.dy = cursor.y - pano.pos.py;
		if (dragging) 
		{
			pano.pos.x += pano.pos.dx;
			pano.pos.y += pano.pos.dy;
		}
		pano.pos.px = cursor.x;
		pano.pos.py = cursor.y;
		// arrange the elements
		confines('xy'); // set x,y,z confines
		paint();
	}

	// Paint panorama elements
	function paint () 
	{
		pano.bg.css('background-image', 'url(' + pano.current.bgsrc + ')');
		pano.bg.css('background-repeat', 'repeat');
		pano.bg.css('background-position', (pano.pos.x) + 'px ' + (pano.pos.y) + 'px');
		pano.bg.css('background-size', pano.size.w + 'px ' + pano.size.h + 'px');
		pano.links.map(function (item) 
		{
			item.x = (item.drag) ? (item.cx * pano.pos.z) + pano.pos.x - item.center_x : item.cx - item.center_x;
			item.y = (item.drag) ? (item.cy * pano.pos.z) + pano.pos.y - item.center_y : item.cy - item.center_y;
			item.x = circulate(item.x);
			item.dom.css('left', item.x + 'px');
			item.dom.css('top', item.y + 'px');
		});
	}

	// Panorama clean
	function clean (set_html) 
	{
		var current_html = (missed(set_html)) ? '' : set_html;
		$(wrapper).html(current_html);
		pano.shell.html('');
	}

	// Circulate panorama by axis X
	function circulate (x) 
	{
		var widths = 
		{
			wrapper: $(wrapper).width(), 
			pano: pano.size.w - 1, // -1 it's because the next action is % pano.size.w
		};
		if (!pano.current.cylinder) 
		{
			if (x <= widths.wrapper) x = widths.wrapper;
			if (x >= widths.pano) x = widths.pano;
		}
		x = x % pano.size.w;
		while (x <= 0) x += pano.size.w;
		return x;
	}

	// Simple test for empty values
	function missed (a) 
	{
		if (a == undefined) return true;
		if (a == null) return true;
		if (a == false) return true;
		if (a == 'none') return true;
		if (a == '') return true;
		if (a == '0') return true;
		if (a == 0) return true;
		if ((a instanceof Array)&&(a.length == 0)) return true;
		return false;
	}
}