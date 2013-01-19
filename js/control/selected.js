define(['knockout','underscore','transform','draw','record/shape',
'lib/knockout/svgtemplate', 'text!view/selected.svg'],
function(ko,_,Transform,Draw,Record,svgTemplate, view){
	var selectedTemplate = svgTemplate(Draw.selection,function(shape){
			return shape.view || '<'+shape.getType()+' data-bind="attr:attr" />';
		}),
		selectedBBox = function(shape){
			var b = shape.bbox(),
				r = shape.rotate(),
				w = shape.stroke()!='none' ? 
					shape.strokeWidth()*Draw.zoom():0,
				o = Draw.toView(b);
			o.transform = 'rotate('+r+' '+(o.x+o.width/2)+','+(o.y+o.height/2)+')';
			o.style = null;
			o.x -= w/2 + 1; o.y -= w/2 + 1;
			o.width += w + 2; o.height += w + 2;
			return o;
		},

		check = function(target){
			var selected = _(Draw.selection()).contains(target);
			if(!selected) Draw.deselect();
			return selected;
		},

		angle, trans, scale, changed = false,
		transforming = ko.observable(false);
		buffer = ko.observable({});

		start = function(){
			trans= new Transform(Draw.selection());
			scale = 1;
			angle = null;
			transforming(true);
		},

		drag = function(e){
			if(!angle) 
				angle = e.angle;
			if(e.shiftKey || e.button==2){
				buffer({
					rotate:e.angle - angle,
					origin:Draw.fromView(e.start)
				});
			}else{
				buffer({translate:{
					x:e.distanceX/Draw.zoom(),
					y:e.distanceY/Draw.zoom()
				}});
			}
			changed = true;
		},

		transform = function(e){
			buffer({
				origin:Draw.fromView(e.position),
				rotate:e.rotation,
				scale:e.scale,
				translate:{
					x:e.distanceX/Draw.zoom(),
					y:e.distanceY/Draw.zoom()
				}
			});
			changed = true;
		},

		wheel = function(e){
			if(!changed) start();
			scale *= 1 +e.delta;
			buffer({
				origin:Draw.fromView(e.position),
				scale:scale
			});
			changed = true;
		};

	Draw.debounce.subscribe(function(debounce){
		if(!debounce) transforming(false);
		if(!debounce && changed){
			trans.set(buffer());
			trans.done();
			buffer({});
			Draw.commit.apply(null,_(Draw.selection()).map(function(shape){
				return new Record(shape);
			}));
			changed = false;
		}
	});

	return {
		check:check,
		dragstart:start,
		transformstart:start,
		drag:drag,
		buffer:ko.computed(function(){
			var str = '', e = buffer();
			if(e.origin) 
				str += 'translate('+e.origin.x+','+e.origin.y+') ';
			if(e.rotate) str += 'rotate('+e.rotate+')';
			if(e.scale) str += 'scale('+e.scale+')';
			if(e.origin) 
				str += 'translate('+(-e.origin.x)+','+(-e.origin.y)+') ';
			if(e.translate) 
				str += 'translate('+e.translate.x+','+e.translate.y+') ';
			return str;
		}),
		wheel:wheel,

		view:view,
		selectedBBox:selectedBBox,
		selectedTemplate:selectedTemplate,
		transforming:transforming
	}
});
