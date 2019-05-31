var EventUtil = {
	addHandler: function(element, type, handler){
		if (element.addEventListener){
			element.addEventListener(type, handler, false);
		} else if (element.attachEvent){
			element.attachEvent("on" + type, handler);
		} else {
			element["on" + type] = handler;
		}
	},
	removeHandler: function(element, type, handler){
		if (element.removeEventListener){
			element.removeEventListener(type, handler, false);
		} else if (element.detachEvent){
			element.detachEvent("on" + type, handler);
		} else {
			element["on" + type] = null;
		}
	},
	getEvent: function(event){
		return event ? event : window.event;
	},
	getTarget: function(event){
		return event.target || event.srcElement;
	},
	preventDefault: function(event){
		if (event.preventDefault){
			event.preventDefault();
		} else {
			event.returnValue = false;
		}
	},
	stopPropagation: function(event){
		if (event.stopPropagation){
			event.stopPropagation();
		} else {
			event.cancelBubble = true;
		}
	}
};
function EventTarget () {
	this.handlers = {}
}

EventTarget.prototype = {
	constructor: EventTarget,
	addHandler: function (type, handler) {
		if (typeof this.handlers[type] === "undefined") {
			this.handlers[type] = []
		}
		this.handlers[type].push(handler)
	},
	fire: function (event) {
		if (!event.target) {
			event.target = this
		}
		if (this.handlers[event.type] instanceof Array) {
			var handlers = this.handlers[event.type]
			for (var i = 0, len = handlers.length; i < len; i++) {
				handlers[i](event)
			}
		}
	},
	removeHandler: function (type, handler) {
		if (this.handlers[type] instanceof Array) {
			var handlers = this.handlers[type]
			for (var i = 0, len = handlers.length; i < len; i++) {
				if (handler[i] === handler) {
					break
				}
			}
			handlers.splice(i, 1)
		}
	}
}

var DragDrop = function(){
	var dragdrop = new EventTarget(),
	dragging = null,
	diffX = 0,
	diffY = 0;
	function handleEvent(event){
		//获取事件和对象
		event = EventUtil.getEvent(event);
		var target = EventUtil.getTarget(event);
		//确定事件类型
		switch(event.type){
			case "mousedown":
				if (target.className.indexOf("draggable") > -1){
					dragging = target;
					diffX = event.clientX - target.offsetLeft;
					diffY = event.clientY - target.offsetTop;
					dragdrop.fire({type:"dragstart", target: dragging,
					x: event.clientX, y: event.clientY});
				}
				break;
			case "mousemove":
				if (dragging !== null){
					//指定位置
					dragging.style.left = (event.clientX - diffX) + "px";
					dragging.style.top = (event.clientY - diffY) + "px";
					//触发自定义事件
					dragdrop.fire({type:"drag", target: dragging,
					x: event.clientX, y: event.clientY});
				}
				break;
			case "mouseup":
				dragdrop.fire({type:"dragend", target: dragging,
				x: event.clientX, y: event.clientY});
				dragging = null;
			break;
		}
	};
	//公共接口
	dragdrop.enable = function(){
		EventUtil.addHandler(document, "mousedown", handleEvent);
		EventUtil.addHandler(document, "mousemove", handleEvent);
		EventUtil.addHandler(document, "mouseup", handleEvent);
	};
	dragdrop.disable = function(){
		EventUtil.removeHandler(document, "mousedown", handleEvent);
		EventUtil.removeHandler(document, "mousemove", handleEvent);
		EventUtil.removeHandler(document, "mouseup", handleEvent);
	};
	return dragdrop;
}();
DragDrop.addHandler("dragstart", function(event){
	var status = document.getElementById("status");
	status.innerHTML = "Started dragging " + event.target.id;
});
DragDrop.addHandler("drag", function(event){
	var status = document.getElementById("status");
	status.innerHTML += "<br/> Dragged " + event.target.id + " to (" + event.x +
	"," + event.y + ")";
});
DragDrop.addHandler("dragend", function(event){
	var status = document.getElementById("status");
	status.innerHTML += "<br/> Dropped " + event.target.id + " at (" + event.x +
	"," + event.y + ")";
});
window.DragDrop = DragDrop