define([
	'underscore','draw',
	'shape/rect','shape/ellipse','shape/circle','shape/path'
],function(_,Draw,Rect, Ellipse, Circle, Path){
	var shapeMap = {}, optionsMap = {},
		Shape = function(type){
			switch(type){
				case 'rect': return Rect; break;
				case 'ellipse': return Ellipse; break;
				case 'circle': return Circle; break;
				case 'path': return Path; break;
			}
		},
		revert = function(){
			return new Record(this);
		},
		get = function(){
			return this;
		},
		Record = function(data){
			var hash, type, options, original;
			if(data._shape){
				hash = data.getHash();
				type = data.getType();
				options = data.getOptions();

				if(!shapeMap[hash]){
					//new shape
				}
				shapeMap[hash] = data;
			}else{
				hash = data.hash;
				type = data.type;
				options = data.options;
				//create/modify shape
				if(hash in shapeMap)
					shapeMap[hash].setOptions(options);
				else{
					shapeMap[hash] = new Shape(type)(options,hash);
					//todo: specific layer
					Draw.add(shapeMap[hash]);
				}
			}
			optionsMap[hash] = optionsMap[hash]
				|| {visible:false};
			original = {};
			_(options).each(function(val,key){
				if(optionsMap[hash][key] != val){
					if(key in optionsMap[hash])
						original[key] = optionsMap[hash][key];
				}else delete options[key];
			});
			_(optionsMap[hash]).extend(options);
			
			this.revert = _(revert).bind({
				type:type, options:original, hash:hash
			});
			this.get = _(get).bind({
				type:type, options:options, hash:hash
			});
		};

	return Record;
});
