if(!SwapList)
var SwapList = {
	swapSelected: function(){
		var $src = this.src;
		var $target = this.target;
		var $base = this.base;
		var all = {}, ea = {type: this.swapType, selected: (!$base.prop('SwapListSet').$targets?$base.SwapList(':selected'):$base.SwapList(':selected', typeof $target.prop('targetIndex')!= 'undefined'?$target.prop('targetIndex'):$src.prop('targetIndex')))};
		ea[ea.type] = []
		ea.$elements = {src:$src, target: $target, selected:$base.children()};
		ea.$elements[ea.type] = $src.children(':selected');
		
		$src.children(':selected').each(function(){all[this.order] = $(this);ea[ea.type].push(this.value);});
		$target.children().each(function(){all[this.order] = $(this);});
		if($base.triggerHandler('swaplist.beforeswap', [ea]) === false)return;
		Object.keys(all).sort(function(a,b){return a-b;}).forEach(function(order){
			all[order].remove();
			$target.append(all[order]);
		});
		$target.val([]);
		$src.focus();
		var $selectedElements = $base.prop('SwapListSet').$selected?$base.prop('SwapListSet').$selected.children():null;
		selected = $base.prop('SwapListSet').$targets?$base.SwapList(':selected', typeof $target.prop('targetIndex')!= 'undefined'?$target.prop('targetIndex'):$src.prop('targetIndex')):$base.SwapList(':selected');
		if($base.prop('SwapListSet').$targets){
			$selectedElements = $base.prop('SwapListSet').$targets[typeof $target.prop('targetIndex')!= 'undefined'?$target.prop('targetIndex'):$src.prop('targetIndex')].children();
			
		}
		ea = {selected:selected, unselected:$base.SwapList(':unselected'), $elements:{src:$src, target: $target, selected:$selectedElements, unselected: $base.children()}};
		$base.trigger('swaplist.swaped', [ea]).trigger('swaplist.change', [ea]);
	},
	executeSearch: function(e){
		var value = this.value;
		var $target = this.$swapListSearchTarget;
		if(e.keyCode != 13 && value.length > 0 && value.length < 3) return;
		$target.children('option').each(function(){
			if(!value || $(this).text().toLowerCase().indexOf(value.toLowerCase()) >= 0) {
				$(this).show();
			}
			else {
				$(this).hide();
			}
		})
	}
}
;(function($){
	if(!$)return;
	if(!$.fn.SwapList)
	$.fn.SwapList = function(a, b){
		if(typeof a == 'string'){
			switch(a){
				case 'unselected':case ':unselected':
					var values = [];
					if(this.length == 1){
						this.each(function(){
							var $src = this.targetSwapList?$(this.targetSwapList):$(this);
							if($src) {
								$src.children().each(function(){
									if(typeof this.value != 'undefined')
										values.push(this.value);
								});
							}
						});
					}
					return values;
				case 'selected':case ':selected':
					var values = [];
					if(this.length == 1){
						this.each(function(){
							var $src = this.targetSwapList?$(this):this.SwapListSet?this.SwapListSet.$selected:null;
							if($src) {
								$src.children().each(function(){
									if(typeof this.value != 'undefined')
										values.push(this.value);
								});
							}
							else {
								if(['undefined', 'string'].includes(typeof b))
									values = {};
								$src = this.SwapListSet && this.SwapListSet.$targets?this.SwapListSet.$targets:null
								if(!$src) return values;
								if(typeof b == 'number'){
									$src[b].children().each(function(){
										values.push(this.value)
									});
								}
								else
								for(var i = 0; i < $src.length; i++){
									var $item = $src[i];
									if(['undefined', 'string'].includes(typeof b)){
										var key = $item.prop('targetIndex');
										if(typeof b == 'string') key = $item.attr(b)||$item.prop(b)||key;
										if(!values.hasOwnProperty(key)){
											values[key] = [];
										}
										$item.children().each(function(){
											values[key].push(this.value);
										})
									}
									else if(typeof b == 'object'){
										for(var p in b){
											if(!['prop', 'attr'].includes(p))continue;
											for(var n in b[p]){
												var v = b[p][n];
												if(Array.isArray(v)){
													v = v.includes($item[p](n));
												}
												else {
													v = v == $item[p](n);
												}
												if(v){
													$item.children().each(function(){
														values.push(this.value);
													})
												}
											}
										}
									}
									else {
										console.log('deu boi');
										if(!values.hasOwnProperty(i)){
											values[i] = [];
										}
										$item.children().each(function(){
											values[i].push(this.value);
										})
									}
								}
							}
						});
					}
					return values;
				case 'reset':case ':reset':
					this.each(function(){
						if((this.targetSwapList && this.targetSwapList.SwapListSet && this.targetSwapList.SwapListSet.$selected)|| 
							(this.SwapListSet && this.SwapListSet.$selected)	
						){
							var $selected = (this.targetSwapList?$(this.targetSwapList):this.SwapListSet?this.SwapListSet.$selected:null);
							$selected.children('option').prop('selected', true);
							var tmp = {swapSelected: SwapList.swapSelected, base: $(this), src: $selected, target: $($selected.prop('targetSwapList')), swapType:'deselecting'};
							tmp.swapSelected();
						}
						else {
							var $src = (this.targetSwapList?$(this.targetSwapList):$(this)), tmp;
							tmp = {swapSelected: SwapList.swapSelected, base: $src, src: null, target: $src, swapType:'deselecting'};
							if(!$src.prop('SwapListSet'))return;
							$src.prop('SwapListSet').$targets.forEach(function($item){
								$item.children('option').prop('selected',true);
								tmp.src = $item;
								tmp.swapSelected();
							})
						}
					});
					return this;
			}
		}
		if(Array.isArray(a)){
			this.each(function(){
				switch(b){
					case 'deselect':case ':deselect':case 'unselect':case ':unselect':
						var $src = this.SwapListSet ? $(this) : $(this.targetSwapList);
						var tmp = {swapSelected: SwapList.swapSelected, base: $(this), src: null, target: $src, swapType:'deselecting'};
						if($src.prop('SwapListSet').$selected){
							tmp = {swapSelected: SwapList.swapSelected, base: $(this), src: $src.prop('SwapListSet').$selected, target: $src, swapType:'deselecting'};
							
						}
						else if($src.prop('SwapListSet').$targets) {
							if(!['object', 'number'].includes(typeof b))return;
							if(typeof b == 'number'){
								tmp.src = $src.prop('SwapListSet').$targets[b];
							}
							else if(typeof b == 'object')
							$src.prop('SwapListSet').$targets.forEach(function($item){
								for(var p in b){
									if(tmp.src)break;
									if(!['prop', 'attr'].includes(p))continue;
									for(var n in b[p]){
										if(tmp.src)break;
										var v = b[p][n];
										if(Array.isArray(v)){
											v = v.includes($item[p](n));
										}
										else {
											v = v == $item[p](n);
										}
										if(v){
											tmp.target = $item;
										}
									}
								}
							});
						}
						if(tmp.src && tmp.target) {
							tmp.src.val([]).val(a);
							tmp.swapSelected();
						}
					break;
					default:
						var $src = this.SwapListSet ? $(this) : $(this.targetSwapList);
						var tmp = {swapSelected: SwapList.swapSelected, base: $(this), src: $src, target: null, swapType:'selecting'};
						$src.val([]).val(a);
						if($src.prop('SwapListSet').$selected){
							tmp = {swapSelected: SwapList.swapSelected, base: $(this), src: $src, target: $src.prop('SwapListSet').$selected, swapType:'selecting'};
							
						}
						else if($src.prop('SwapListSet').$targets) {
							if(!['object', 'number'].includes(typeof b))return;
							if(typeof b == 'number'){
								tmp.target = $src.prop('SwapListSet').$targets[b];
							}
							else if(typeof b == 'object')
							$src.prop('SwapListSet').$targets.forEach(function($item){
								for(var p in b){
									if(tmp.target)break;
									if(!['prop', 'attr'].includes(p))continue;
									for(var n in b[p]){
										if(tmp.target)break;
										var v = b[p][n];
										if(Array.isArray(v)){
											v = v.includes($item[p](n));
										}
										else {
											v = v == $item[p](n);
										}
										if(v){
											tmp.target = $item;
										}
									}
								}
							});
						}
						if(tmp.src && tmp.target) tmp.swapSelected();
					break;
				}
			});
			return this;
		}
		var options = $.extend({selectButtonCaption: '&gt;', deselectButtonCaption: '&lt;'}, a);
		this.each(function(){
			if(this.tagName != 'SELECT')return;
			if(this.targetSwapList) return;
			this.multiple = true;
			if(!this.SwapListSet){
				this.SwapListSet = {};
			}
			if(options.destroy && this.SwapListSet.$holder){
				$(this).insertAfter(this.SwapListSet.$holder);
				this.SwapListSet.$holder.remove();
				delete this.SwapListSet.$holder;
			}
			var order = 0;
			$(this).children('option').each(function(){
				this.order = order++;
			});
			if(!this.SwapListSet.$holder){
				var search=null;
				if(options.targets && Array.isArray(options.targets)){
					this.SwapListSet.$targets = [];
					if(options.searching){
						search = $(document.createElement('TR'))
							.append($(document.createElement('TD')))
							.append($(document.createElement('TD'))
							.append($(document.createElement('INPUT'))
								.addClass('swap-list-search-field')
								.prop({type:'text', targetSwapList: this, $swapListSearchTarget: $(this)})
								.on('keyup', SwapList.executeSearch)
							)
						)
					}
					this.SwapListSet.$holder = $(document.createElement('DIV'))
					.addClass('swap-list-holder')
					.insertAfter($(this))
					.append(
						$(document.createElement('TABLE')).addClass('swap-list-holder-table-multiple-targets').prop({multipleTargets:true})
						.append($(document.createElement('TBODY'))
							.append($(document.createElement('TR'))// title
								.append($(document.createElement('TD'))
									.html((typeof options.title == 'object'?options.title.text:(typeof options.title == 'string'?options.title:''))||'No title')
								)
								.append($(document.createElement('TD')))
							)
							.append(search)// search
							.append($(document.createElement('TR'))// main (left) select list
								.addClass('swap-list-row-source')
								.append($(document.createElement('TD'))
								.prop({rowspan:(options.searching?a.targets.length * 3 - 2:a.targets.length * 2)})
									.append($(this))
								)
							)
						)
						
					);
					
					for(var i = 0; i < a.targets.length; i++){
						var item = a.targets[i];
						if(typeof item == "object"){
							this.SwapListSet.$targets.push($(document.createElement('SELECT'))
							.prop($.extend({targetSwapList: this, multiple: true, targetIndex: i}, item.prop))
							.addClass($(this).attr('class')+" swap-list-selected")
							.attr(item.attr)
							);
							var $target = this.SwapListSet.$targets[this.SwapListSet.$targets.length - 1];
							var $title = $(document.createElement('TR'))
								.addClass('swap-list-row-target')
								.append($(document.createElement('TD')))
								.append($(document.createElement('TD'))
									.html((typeof item.title == 'object'?item.title.text:(typeof item.title == 'string'?item.title:''))||'No title')
							)
							if(i == 0){
								this.SwapListSet.$holder
								.children('table')
									.children('tbody')
									.children('tr:eq(0)')
									.append($title.children('td:eq(1)'))
								$title = null;
							}
							if(options.searching){
								search = $(document.createElement('TR'))
									.addClass('swap-list-row-target')
									.append($(document.createElement('TD')))
									.append($(document.createElement('TD'))
									.append($(document.createElement('INPUT'))
										.addClass('swap-list-search-field')
										.prop({type:'text', targetSwapList: this, $swapListSearchTarget: $target})
										.on('keyup', SwapList.executeSearch)
									)
								)
								if(i == 0){
									this.SwapListSet.$holder
									.children('table')
										.children('tbody')
										.children('tr:eq(1)')
										.append(search.children('td:eq(1)'))
								}
							}
							this.SwapListSet.$holder
								.children('table')
									.children('tbody')
									.append($title)
									.append(search)
									.append($(document.createElement('TR'))
										.addClass('swap-list-row-target')
										.append($(document.createElement('TD'))
											.append($(document.createElement('BUTTON')).addClass('swap-list-select-button').html(options.selectButtonCaption).prop({type:'button', swapType: 'selecting', base:$(this), src:$(this), target: $target}).on('click', SwapList.swapSelected))
											.append($(document.createElement('BUTTON')).addClass('swap-list-deselect-button').html(options.deselectButtonCaption).prop({type:'button', swapType: 'deselecting', base:$(this), src:$target, target: $(this)}).on('click', SwapList.swapSelected))
										)
										.append($(document.createElement('TD'))
											.append($target)
										)
									)
						}
					}
				}
				else {
					this.SwapListSet.$selected = $(document.createElement('SELECT')).prop({targetSwapList: this, multiple: true})
					.addClass($(this).attr('class')+" swap-list-selected");
					
					if(options.searching){
						search = $(document.createElement('TR'))
							.append($(document.createElement('TD'))
								.append($(document.createElement('INPUT'))
									.addClass('swap-list-search-field')
									.prop({type:'text', targetSwapList: this, $swapListSearchTarget: $(this)})
									.on('keyup', SwapList.executeSearch)
								)
							)
							.append($(document.createElement('TD')))
							.append($(document.createElement('TD'))
								.append($(document.createElement('INPUT'))
									.addClass('swap-list-search-field')
									.prop({type:'text', targetSwapList: this, $swapListSearchTarget: this.SwapListSet.$selected})
									.on('keyup', SwapList.executeSearch)
								)
							)
					}
					this.SwapListSet.$holder = $(document.createElement('DIV'))
					.addClass('swap-list-holder')
					.insertAfter($(this))
					.append(
						$(document.createElement('TABLE')).addClass('swap-list-holder-table')
						.append($(document.createElement('TBODY'))
							.append(search)
							.append($(document.createElement('TR'))
								.append($(document.createElement('TD'))
									.append($(this))
								)
								.append($(document.createElement('TD'))
									.append($(document.createElement('BUTTON')).addClass('swap-list-select-button').html(options.selectButtonCaption).prop({type:'button', swapType: 'selecting', base:$(this), src:$(this), target: this.SwapListSet.$selected}).on('click', SwapList.swapSelected))
									.append($(document.createElement('BUTTON')).addClass('swap-list-deselect-button').html(options.deselectButtonCaption).prop({type:'button', swapType: 'deselecting', base:$(this), src:this.SwapListSet.$selected, target: $(this)}).on('click', SwapList.swapSelected))
								)
								.append($(document.createElement('TD'))
									.append(this.SwapListSet.$selected)
								)
							)
						)
						
					);
				}
			}
			if(options.reset){
				// select all itens on the 'selected' list and pass all of them to the 'unselected' list
			}
			$(this).addClass('swap-list-unselected');
			
		})
		return this;
	}
	if(!$.fn.getOptionValues)
	$.fn.getOptionValues = function(){
		var values = [];
		this.find('option').each(function(){
			values.push(this.value);
		});
		
		return values;
	}
}(jQuery))