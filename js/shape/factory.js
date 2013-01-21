define(['knockout','underscore','hash'
],function(ko,_,Hash){
	return function(type, func, config){
		var attrKeys = [
				'fill','stroke','strokeWidth','transform'
			].concat(config.attr),

			optionsKeys = [
				'fill','stroke','strokeWidth','rotate','visible'
			].concat(config.options),
			
			set = function(options){
				var self = this;
				_(ko.toJS(options || {})).
					each(function(val,key){
						if(key in self.options) 
							self[key](val);
					});
			},
			serialize = function(){
				return ko.toJS(this.options);
			},
			clone = function(){
				return new Shape(this);
			},
			isKO = function(val){
				return ko.isObservable(val) || ko.isComputed(val);
			},
			transform = function(){
				if(this.rotate() !== 0){
					var bbox = this.bbox();
					return 'rotate('+this.rotate()+' '+
						(bbox.x+bbox.width/2)+','+
						(bbox.y+bbox.height/2)+')';
				}
			},
			Shape = function(options, hash){
				var self = this;

				func.call(self);

				self.fill = ko.observable();
				self.stroke = ko.observable();
				self.strokeWidth = ko.observable();
				self._destroy = ko.observable(false);

				var rotate = ko.observable(0);
				self.rotate = ko.computed({
					read:rotate, write: function(value){
						while(value < 0) value+=360;
						rotate(value % 360);
					}
				});
				self.transform = ko.computed(transform,self);
				self.visible = ko.observable(true);

				self._shape = true;

				self.getType = function(){
					return type;
				};

				//Hash stuffs
				if(!hash) hash = Hash.generate();
				self.getHash = function(){
					return hash;
				};

				//set up attr
				self.attr = {};
				_(attrKeys).each(function(key){
					self.attr[_(key).dasherize()] = self[key];
				});
				self.options = {};
				_(optionsKeys).each(function(key){
					self.options[key] = self[key];
				});

				set.call(self, options || {});
			};
		_(Shape.prototype).extend({
			set:set,
			serialize:serialize,
			clone:clone
		});
		return Shape;
	};
});
