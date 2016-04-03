var customTagsInit = jSouper.customTagsInit;
var modulesInit = jSouper.modulesInit;

var _is_ueditor_css_load = false;
customTagsInit["ueditor"] = function(vm) {
	_is_ueditor_css_load || $('head').append($('<link rel="stylesheet" type="text/css" />').attr('href', 'umeditor1_2_2-utf8-php/themes/default/css/umeditor.css'));
	_is_ueditor_css_load = true;
	var ueditorNode = vm.getOneElementByTagName("ueditor");
	var ueNode = vm.getOneElementByTagName("uecontanier");
	$.when(
		$.getScript("umeditor1_2_2-utf8-php/umeditor.js"),
		$.getScript("umeditor1_2_2-utf8-php/umeditor.config.js")
	).done(function() {
		//语言包
		$.getScript("umeditor1_2_2-utf8-php/lang/zh-cn/zh-cn.js", function() {
			var id = ueNode.id = Math.random().toString(36).substr(2);
			var ue;
			var _ue_init_ti;
			var _ue_set_ti;
			jSouper.onElementPropertyChange(ueditorNode, "value", function _init_value(key, value) {
				if (!ue && document.getElementById(id)) {
					window.ue = ue = UM.getEditor(id);

					ue.setOpt("imageCompressEnable", true); //启用压缩
					ue.setOpt("imageCompressBorder", 1200); //多图上传压缩最大宽度
					ue.setWidth(ueditorNode.clientWidth)

					ue.addListener("contentChange", function() {
						var bind_input_key = ueditorNode.getAttribute("input");
						if (bind_input_key) {
							vm.set(bind_input_key, ue.getContent());
						}
						jSouper.dispatchEvent(ueditorNode, "input");
					});
					ue.ready(function() {
						//DOM remove 后，又append，这是UM的isReady任然认为是1，其实iframe需要重载，所以这边又再次出发，value会被正确绑定
						var value = ueditorNode.getAttribute("value");
						typeof value === "string" && (value != ue.getContent()) && ue.setContent(value);
					});

					clearTimeout(_ue_init_ti);
					var args = Array.prototype.slice.call(arguments);
					var self = this;
					_ue_init_ti = setTimeout(function() {
						_init_value.apply(self, args);
					}, 200)
					return
				}
				value && (value != ue.getContent()) && ue.setContent(value)
			}, true);
			jSouper.onElementPropertyChange(ueditorNode, "input", function(key, bind_input_key) {
				bind_input_key && ue && vm.set(bind_input_key, ue.getContent());
			});
		});
	}).fail(function() {
		console.error(arguments);
	});
};

customTagsInit["pagecut2"] = function(vm) {
	var node = vm.getOneElementByTagName("pagecut2");
	//每页数量
	jSouper.onElementPropertyChange(node, "num", function(attrKey, value) {
		value = ~~value;
		vm.set("$CPrivate.$Cache.num", value);
	}, true);
	//当前页号
	jSouper.onElementPropertyChange(node, "page", function(attrKey, value) {
		value = ~~value;
		vm.set("$CPrivate.$Cache.page", value);
		vm.set("$CPrivate.$Cache.thepagenum", value + 1);
	}, true);
	//页号数组
	jSouper.onElementPropertyChange(node, "total-page", function(attrKey, value) {
		var number_list = [];
		number_list.length = ~~value;
		jSouper.forEach(number_list, function(v, i) {
			number_list[i] = i + 1;
		});
		vm.set("$CPrivate.$Cache.number_list", number_list);
	}, true)

	function _change_page(num, page) {
		Path.setHash({
			num: num,
			page: page
		});
		jSouper.dispatchEvent(node, "change");
	};
	vm.set("$CPrivate.$Event.pre_page", function() {
		_change_page(vm.get("$CPrivate.$Cache.num"), vm.get("$CPrivate.$Cache.page") - 1);
	});
	vm.set("$CPrivate.$Event.next_page", function() {
		_change_page(vm.get("$CPrivate.$Cache.num"), vm.get("$CPrivate.$Cache.page") + 1);
	});
	vm.set("$CPrivate.$Event.change_page", function(e, cvm) {
		_change_page(vm.get("$CPrivate.$Cache.num"), cvm.get("$Index"));
	});
};

customTagsInit["img-uploader"] = function(vm) {
	var uploaderNode = vm.getOneElementByTagName("imgUploaderWrap");
	var inputNode = vm.getOneElementByTagName("input");
	var markNode = vm.getOneElementByTagName("imgMark");

	vm.set("$CPrivate.$Cache.text", "初始化中");
	inputNode.disabled = true;
	require(["localResizeIMG"], function() {

		function _set_url(url) {
			var _bind_input_key = uploaderNode.getAttribute("input-key");
			if (_bind_input_key) {
				vm.set(_bind_input_key, url);
			}
			//显示预览
			_show_preview(url);
		}
		var _ti;

		function _show_preview(url) {
			clearInterval(_ti);
			//是否在控件上显示图片
			var _one_way = uploaderNode.getAttribute("one-way");
			if (_one_way != "true") {
				vm.set("$CPrivate.$Cache.img_url", url);
				if (!uploaderNode.clientWidth) {
					_ti = setInterval(function() {
						_show_preview(url)
					}, 200);
					//中断
					return;
				}
				vm.set("$CPrivate.$Cache.img_width", uploaderNode.clientWidth);
				vm.set("$CPrivate.$Cache.img_height", uploaderNode.clientHeight);
			}
		}

		function _set_status(value) {
			var _upload_status = uploaderNode.getAttribute("status");
			_upload_status && vm.set(_upload_status, value);
			vm.set("$CPrivate.$Cache.uploading", value);
		}

		inputNode.removeAttribute("disabled");
		jSouper.onElementPropertyChange(uploaderNode, "text", function(attr, text) {
			vm.set("$CPrivate.$Cache.text", text || "点击选择文件上传");
		}, true);
		jSouper.onElementPropertyChange(uploaderNode, "url", function(attr, value) {
			_show_preview(value)
		}, true);
		//压缩图片的配置与回调
		var localResizeIMG_config = {
			maxWidth: 1024,
			quality: 1,
			before: function() {
				_set_status(true);
			},
			success: function(result) {
				//使用BASE64上传
				coAjax.post(appConfig.other.upload_base64_image, {
					img_base64: result.base64
				}, function(result) {
					_set_status(false);
					var img_url = appConfig.img_server_url + result.result.key;
					//给绑定的值赋值
					_set_url(img_url);
					//运行回调
					var _upload_callback = uploaderNode.getAttribute("upload-callback");
					if (_upload_callback) {
						var _cb = vm.get(_upload_callback);
						(_cb instanceof Function) && _cb(img_url);
					}
				}, function(errorCode, xhr, errorMsg) {
					_set_status(false);
					alert("error", errorMsg);
				}, function() {
					_set_status(false);
					alert("error", "网络异常，请重试！")
				});
			}
		};
		//动态修改配置
		jSouper.onElementPropertyChange(uploaderNode, "max-width", function(attr, value) {
			var _maxWidth = +uploaderNode.getAttribute("max-width");
			isNaN(_maxWidth) && (_maxWidth = 1024);
			localResizeIMG_config.maxWidth = _maxWidth;
		}, true);
		$inputNode = $(inputNode);
		$inputNode.localResizeIMG(localResizeIMG_config);
	});


	vm.set("$CPrivate.$Event.show_mark", function() {
		markNode.className = "show";
	});
	vm.set("$CPrivate.$Event.hide_mark", function() {
		markNode.className = "";
	});
	vm.set("$CPrivate.$Event.toggle_mark", function() {
		markNode.className = markNode.className ? "" : "show"
	});
	vm.set("$CPrivate.$Event.remove", function() {
		_set_url();
	});
};

customTagsInit["weibo-share"] = function(vm) {
	var shareNode = vm.getOneElementByTagName("div");
	vm.set("$CPrivate.$Event.shareToWeibo", function() {
		var title = shareNode.getAttribute("title") || "";
		var src = shareNode.getAttribute("src");
		var href = shareNode.getAttribute("href");
		window.open("http://service.weibo.com/share/share.php?pic=" + encodeURIComponent(src) +
			"&title=" + encodeURIComponent(title.replace(/&nbsp;/g, " ").replace(/<br \/>/g, " ")) +
			"&url=" + encodeURIComponent(href),
			"分享至新浪微博",
			"toolbar=no,menubar=no,scrollbars=no, resizable=no,location=no, status=no");
	});
};

customTagsInit["href"] = function(vm) {
	var aNode = vm.getOneElementByTagName("href");
	if (!!history.pushState) {
		//使用History Api封装跳转
		vm.set("$CPrivate.$Event.noreload_jump", function(e) {
			jSouper.dispatchEvent(this, "beforejump");
			if (jSouper.$.strToBool(aNode.getAttribute("stop-jump"))) {
				return false;
			}
			var _to_url = aNode.getAttribute("to");
			if (_to_url) {
				Path.jump(_to_url);
			}
			return false;
		});
	}
};



customTagsInit["pagination2"] = function(vm) {
	var paginationNode = vm.getOneElementByTagName("pagination2");
	jSouper.onElementPropertyChange(paginationNode, "page-num", function(attr, value) {
		vm.set("_number_list", new Array(~~value));
	}, true);
	vm.set("$CPrivate.$Event.first_page", function() {
		Path.setQuery("page", 0)
	});
	vm.set("$CPrivate.$Event.jump_page", function(e, cvm) {
		Path.setQuery("page", cvm.get("$Index"))
	});
	vm.set("$CPrivate.$Event.end_page", function(e, cvm) {
		Path.setQuery("page", vm.get("total_page"))
	});
	vm.set("$CPrivate.$Event.pre_page", function() {
		Path.setQuery("page", ~~Path.getQuery("page") - 1)
	});
	vm.set("$CPrivate.$Event.next_page", function() {
		Path.setQuery("page", ~~Path.getQuery("page") + 1)
	});
};

modulesInit["goods-item"] = function(vm) {
	var node = vm.getOneElementByTagName("commodity");

	var eventManager = require("eventManager");

	function _filter_cash() {
		var finally_cash = vm.get("cash");
		var sou_cash = vm.get("price");
		var user_card_id_list = App.get("loginer.card_list") || [];
		jSouper.forEach(user_card_id_list, function(card_id) {
			var card_info = card_id.split(/[\:\|]/);
			var bus_id = card_info[1];
			if (bus_id == window.busInfo ? busInfo._id : appConfig.bus_id) {
				var card_factory_id = card_info[3];
				var new_finally_cash = (vm.get("card_cash_map") || {})[card_factory_id] || finally_cash;
				if (new_finally_cash !== finally_cash) {
					finally_cash = new_finally_cash;
				}
				return false;
			}
		});
		vm.set("$Private.finally_cash", finally_cash);
		// console.log("_filter_cash");
	}
	vm.set("$Private.$Event.add_to_cart", function(e, cvm) {
		var _notify = alert("info waiting", "请稍后……", 10000);
		require(["/js/common/goodsCart.js"], function(goodsCart) {
			_notify.close();

			function _goodsCart(e, cvm) {
				goodsCart.add_to_cart(cvm.get("_id"), 1, function(result) {
					Path.jump("cart.html");
				});
			};
			_goodsCart(e, cvm);
			vm.set("$Private.$Event.add_to_cart", _goodsCart);
		});
	});
	/*
	 * 用户登录完成后跳转，节点数据重新下载，会触发onfollow，这时候再重新计算也行。无效马上重计算所有
	 * eventManager.after("getLoginer", _filter_cash, true);
	 */
	vm.model.onfollow = _filter_cash;
	jSouper.onElementPropertyChange(node, "goods-id", _filter_cash);
};
customTagsInit["addressinput"] = function(vm) {
	var selectNodes = vm.getElementsByTagName("select");
	var provinceNode = selectNodes[0];
	var townNode = selectNodes[1];
	var countyNode = selectNodes[2];
	var detailNode = vm.getOneElementByTagName("input");
	var selectNodesMap = {
		province: provinceNode,
		town: townNode,
		county: countyNode
	};
	var inputNode = vm.getOneElementByTagName("addressinput");
	inputNode.data = {};

	//绑定事件，选择省后
	vm.set("$CPrivate.$Event.province", function(e, cvm, ccvm) {
		if (!ccvm) {
			return;
		}
		debugger
		inputNode.data.province = ccvm.get();
		var id = ccvm.get("region_id");
		select_xz(id, 'town', '请选择市');
		vm.set("$CPrivate.$Cache.town_disabled", id > 0);
		vm.set("$CPrivate.$Cache.county_disabled", false);
		vm.set("$CPrivate.$Cache.county_list", []);
		emit_change();
		return false;
	});
	//选择市后
	vm.set("$CPrivate.$Event.town", function(e, cvm, ccvm) {
		if (!ccvm) {
			return;
		}
		inputNode.data.town = ccvm.get();
		var id = ccvm.get("region_id");
		select_xz(id, 'county', '请选择地区');
		vm.set("$CPrivate.$Cache.county_disabled", id > 0);
		emit_change();
		return false;
	});

	vm.set("$CPrivate.$Event.county", function(e, cvm, ccvm) {
		if (!ccvm) {
			return;
		}
		inputNode.data.county = ccvm.get();
		emit_change();
		return false;
	});

	vm.set("$CPrivate.$Event.detail", function(e, cvm) {
		inputNode.data.detail = vm.get("$CPrivate.$Cache.detail");
		emit_change();
		return false;
	});

	//简单的回调时间注册表
	var select_cb_map = {};
	//地区选中函数
	function select_xz(id, name) { //id>后台数据id， name=>下拉框name值,titel=>下拉列表首选项
		var selectNode = selectNodesMap[name];
		selectNode && (selectNode.selectedIndex = 0);
		coAjax.get("http://api.dotnar.com/city/by_parent_id/" + id, function(data) {
			vm.set("$CPrivate.$Cache." + name + "_list", data);
			var cb = select_cb_map[name];
			cb instanceof Function && cb(selectNode);
		});
	};

	function emit_change() {
		jSouper.dispatchEvent(inputNode, "change");
	};


	function _onPropertyChange(attrName, attrValue) {
		var selectNode = selectNodesMap[attrName];
		if (attrValue && selectNode.value != String(attrValue)) {

			function set_value() {
				selectNode.value = attrValue;
				jSouper.dispatchEvent(selectNode, "change");
			};
			if (vm.get("$CPrivate.$Cache." + attrName + "_list")) { //如果有列表数据，直接触发
				set_value();
			} else {
				//否则注册回调事件
				select_cb_map[attrName] = set_value;
			}
		}
	};

	jSouper.onElementPropertyChange(inputNode, "province", _onPropertyChange, true);

	jSouper.onElementPropertyChange(inputNode, "town", _onPropertyChange, true);

	jSouper.onElementPropertyChange(inputNode, "county", _onPropertyChange, true);

	jSouper.onElementPropertyChange(inputNode, "detail", function(attrName, attrValue) {
		if (attrValue) {
			vm.set("$CPrivate.$Cache.detail", attrValue);
			jSouper.dispatchEvent(detailNode, "change");
		}
	}, true);

	//选中城市初始化
	select_xz(1, "province");
};

//地区选中函数
function select_xz(name, key, vm, region_type, cb) { //id>后台数据id， name=>下拉框name值,titel=>下拉列表首选项
	require(["coAjax"], function(coAjax) {
		// 	coAjax.get(appConfig.other.get_city + name, function(data) {
		// 		vm.set(key, data.result);
		// 		cb instanceof Function && cb(data.result);
		// 	});
		coAjax.get("http://api.dotnar.com/city/by_name/" + name, {
			region_type: region_type
		}, function(data) {
			vm.set(key, data);
			cb instanceof Function && cb(data);
		});
	});
};
customTagsInit['addressinput'] = function(vm) {
	var addressNode = vm.getOneElementByTagName("address");
	//初始化数据
	var _province_map = {
		// 23个省
		"省": ['安徽', '福建', '甘肃', '广东', '贵州',
			'海南', '河北', '河南', '黑龙江', '湖北', '湖南',
			'江苏', '江西', '吉林', '辽宁', '青海',
			'山东', '山西', '陕西', '四川', '台湾', '云南', '浙江'
			// ,'南海诸岛'/*PS，隶属于海南*/
		],
		// 5个自治区
		"自治区": ['新疆', '广西', '宁夏', '内蒙古', '西藏'],
		// 4个直辖市
		"直辖市": ['北京', '天津', '上海', '重庆'],
		// 2个特别行政区
		"特別行政区": ['香港', '澳门']
	};
	var _province_array = [];
	jSouper.forEach(_province_map, function(list, province_type) {
		_province_array.push({
			group_name: province_type,
			list: list
		});
	});
	vm.set("$CPrivate.province_list", _province_array);

	//选择省后
	vm.set("$CPrivate.$Event.province", function(e, cvm) {
		//清空子集数据
		vm.set("$CPrivate.city", "");
		vm.get("$CPrivate.$Event.city")();
		//获取数据
		var region_name = vm.get("$CPrivate.province");
		if (region_name) {
			region_name && select_xz(region_name, '$CPrivate.city_list', vm, "1");
		} else {
			vm.set("$CPrivate.city_list", null);
		}
		var province_input_key = addressNode.getAttribute("province-input");
		if (province_input_key) {
			vm.set(province_input_key, region_name);
		}
		jSouper.dispatchEvent(addressNode, "changeprovince");
	});
	//选择市后
	vm.set("$CPrivate.$Event.city", function(e, cvm) {
		//清空子集的数据
		vm.set("$CPrivate.county", "");
		vm.get("$CPrivate.$Event.county")();
		//获取数据
		var region_name = vm.get("$CPrivate.city");
		if (region_name) {
			region_name && select_xz(region_name, "$CPrivate.county_list", vm, "2");
		} else {
			vm.set("$CPrivate.county_list", null);
		}
		var city_input_key = addressNode.getAttribute("city-input");
		if (city_input_key) {
			vm.set(city_input_key, region_name);
		}
		jSouper.dispatchEvent(addressNode, "changecity");
	});
	//选择县、区后
	vm.set("$CPrivate.$Event.county", function(e, cvm) {
		var region_name = vm.get("$CPrivate.county");
		// if (region_name) {
		var county_input_key = addressNode.getAttribute("county-input");
		if (county_input_key) {
			vm.set(county_input_key, region_name);
		}
		// }
		jSouper.dispatchEvent(addressNode, "changecounty");
	});
	//详细地址
	vm.set("$CPrivate.$Event.detail", function(e, cvm) {
		var detail_input_key = addressNode.getAttribute("detail-input");
		if (detail_input_key) {
			vm.set(detail_input_key, vm.get("$CPrivate.detail"));
		}
		jSouper.dispatchEvent(addressNode, "changedetail");
	});
	/*
	 * 反向绑定
	 */
	jSouper.forEach(["province",
		"city",
		"county",
		"detail"
	], function(key) {
		jSouper.onElementPropertyChange(addressNode, key + "-value", function(k, v) {
			var list = vm.get("$CPrivate." + key + "_list");
			//V可能是完整的地区名，因为显示的只是最短地域名称，所以要做一定的匹配
			if (list instanceof Array) {
				jSouper.forEach(list, function(item) {
					if (v.indexOf(item.region_name) !== -1) {
						v = item.region_name;
						return false;
					}
				});
			}
			vm.set("$CPrivate." + key, v);
			// bind_handle[key](v);
		}, true);
	});
	//反向绑定加载数据的处理函数
	var bind_handle = {
		"province": function(region_name) {
			if (region_name) {
				region_name && select_xz(region_name, '$CPrivate.city_list', vm);
			} else {
				vm.set("$CPrivate.city_list", null);
			}
		}
	};
	//是否显示编辑详细地址
	jSouper.onElementPropertyChange(addressNode, "edit-detail", function(k, v) {
		vm.set("$Private.edit_detail", !!v);
	}, true);
};