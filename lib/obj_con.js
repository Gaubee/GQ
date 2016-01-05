//JS-Object对象对比
(function() {
	function obj_eql(obj_a, obj_b) {
		//non-Object
		var result = obj_a === obj_b;
		if (!result) {
			var keys_a = obj_a instanceof Object ? Object.keys(obj_a) : [];
			var keys_b = obj_b instanceof Object ? Object.keys(obj_b) : [];
			if (String(keys_a) == String(keys_b) && String(obj_a) === String(obj_b) /*RegExp,Function*/ ) {
				result = keys_a.every(function(key) {
					var value_a = obj_a[key];
					var value_b = obj_b[key];
					if (value_a === value_b) {
						return true;
					} else {
						var type_a = typeof value_a instanceof Object;
						var type_b = typeof value_b instanceof Object;
						if (type_a === type_b === true) {
							return obj_eql(value_a, value_b);
						}
					}
				});
			}
		}
		return result;
	};

	function obj_has(obj_big, obj_small) {
		//non-Object
		var result = obj_big === obj_small;
		if (!result && String(obj_big) === String(obj_small) /*RegExp,Function*/ ) {
			var keys_big = obj_big instanceof Object ? Object.keys(obj_big) : [];
			var keys_small = obj_small instanceof Object ? Object.keys(obj_small) : [];
			if (keys_big.length >= keys_small.length) {
				result = keys_small.every(function(key) {
					if (obj_big.hasOwnProperty(key)) {
						var obj_a = obj_big[key];
						var obj_b = obj_small[key];
						if (obj_a === obj_b) {
							return true;
						} else {
							return obj_has(obj_a, obj_b);
						}
					}
				});
			}
		}
		return result;
	};
	module.exports = {
		equal: obj_eql,
		has: obj_has
	};
}());