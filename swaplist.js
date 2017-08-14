if(!SwapList)
var SwapList = {
	swapSelected: function(){
		var $src = this.src;
		var $target = this.target;
		var $base = this.base;
		var all = {}, ea = {type: this.swapType, selected: $base.SwapList(':selected')};
		ea[ea.type] = []
		$src.children(':selected').each(function(){all[this.order] = $(this);ea[ea.type].push(this.value);});
		$target.children().each(function(){all[this.order] = $(this);});
		if($base.triggerHandler('swaplist.beforeswap', [ea]) === false)return;
		Object.keys(all).sort(function(a,b){return a-b;}).forEach(function(order){
			all[order].remove();
			$target.append(all[order]);
		});
		$target.val([]);
		$src.focus();
		ea = {selected:$base.SwapList(':selected'), unselected:$base.SwapList(':unselected'), $elements:{selected:$base.prop('SwapListSet').$selected.children(), unselected: $base.children()}};
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
	$.fn.SwapList = function(a){
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
							var $src = this.targetSwapList?$(this):this.SwapListSet.$selected;
							if($src) {
								$src.children().each(function(){
									if(typeof this.value != 'undefined')
										values.push(this.value);
								});
							}
						});
					}
					return values;
				case 'reset':case ':reset':
					this.each(function(){
						var $selected = (this.targetSwapList?$(this.targetSwapList):this.SwapListSet.$selected);
						$selected.children('option').prop('selected', true)
						var tmp = {swapSelected: SwapList.swapSelected, base: $(this), src: $selected, target: $($selected.prop('targetSwapList'))};
						tmp.swapSelected();
					});
					return this;
			}
		}
		if(Array.isArray(a)){
			this.each(function(){
				var $src = this.SwapListSet ? $(this) : $(this.targetSwapList);
				var tmp = {swapSelected: SwapList.swapSelected, base: $(this), src: $src, target: $src.prop('SwapListSet').$selected};
				$src.val([]).val(a);
				tmp.swapSelected();
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
