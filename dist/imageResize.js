/**
 * 
 */
(function($) {
	$.resizeImage = function(el, size, options) {
		// To avoid scope issues, use 'base' instead of 'this'
		// to reference this class from internal events and functions.
		var base = this;

		// Access to jQuery and DOM versions of element
		base.$el = $(el);
		base.el = el;

		// Add a reverse reference to the DOM object
		base.$el.data("resizeImage", base);

		base.init = function() {
			if (!base.$el.is("img")) {
				console.warn("Se un objeto DOM de tipo <img />", base.el);
				return false;
			}
			if (typeof (size) === "undefined" || size === null)
				size = "contain";

			base.size = size;

			base.options = $.extend({}, $.resizeImage.defaultOptions, options);

			// Put your initialization code here
			if (base.options.center) {
				base.$el.parent().css("position", "relative");
				base.$el.css({
					"position" : "absolute",
					"top" : "50%",
					"left" : "50%",
					"-moz-transform" : "translateX(-50%) translateY(-50%)",
					"-webkit-transform" : "translateX(-50%) translateY(-50%)",
					"-o-transform" : "translateX(-50%) translateY(-50%)",
					"-ms-transform" : "translateX(-50%) translateY(-50%)",
					"transform" : "translateX(-50%) translateY(-50%)"
				});
			}
			switch (size) {
				case "contain" :
					var w = base.$el.parent().width();
					var h = base.$el.parent().height();
					base.resize(base.$el.attr("src"), w, h).then(function(resp) {
						base.$el.width(resp.width);
						base.$el.height(resp.height);
					});
					if (base.options.responsive) {
						$(window).resize(function() {
							base.resize(base.$el.attr("src"), base.$el.parent().width(), base.$el.parent().height()).then(function(resp) {
								base.$el.width(resp.width);
								base.$el.height(resp.height);
								base.$el.trigger("change");
							});
						});
					}
					break;
				case "base64" :
					var w = base.options.width;
					var h = base.options.height;
					var format = base.options.format == "png"? "image/png" : "image/jpeg";
					base.resize(base.$el.attr("src"), w, h).then(function(resp) {
						var $canvasAux = $("<canvas></canvas>", {
							id : "canvasAux",
							css : {
								"display" : "none"
							}
						});
						$canvasAux[0].width = resp.width;
						$canvasAux[0].height = resp.height;
						var c = $canvasAux[0];
						var ctx = c.getContext("2d");
						ctx.clearRect(0, 0, resp.width, resp.height);
						if( format == "image/jpeg" ){
							ctx.fillStyle="#FFF";
							ctx.fillRect(0, 0, resp.width, resp.height);
						}
						ctx.drawImage(base.el, 0, 0, base.imgWidth, base.imgHeight, 0, 0, resp.width, resp.height);
						var imgSrc = $canvasAux[0].toDataURL(format, 0.5);
						base.$el.attr("src", imgSrc);
						base.$el.trigger("change");
					});
					break;
				default :
					break;
			}
		};

		base.resize = function(dataUrl, minW, minH) {
			var deferred = new $.Deferred();
			var image = {};
			if (base.imgWidth && base.imgHeight) {
				image.width = base.imgWidth;
				image.height = base.imgHeight;
				resizingFunc();
			} else {
				image = new Image();
				image.onload = resizingFunc;
				image.src = dataUrl;
			}
			function resizingFunc() {
				var w = minW ? minW : 900;
				var h = minH ? minH : 900;
				var ratio = 1;
				if (image.width > image.height) {
					ratio = image.height / image.width;
					if (w * ratio <= h) {
						h = w * ratio;
					} else {
						ratio = image.width / image.height;
						w = h * ratio;
					}
				} else {
					ratio = image.width / image.height;
					if (h * ratio <= w) {
						w = h * ratio;
					} else {
						ratio = image.height / image.width;
						h = w * ratio;
					}
				}
				base.imgWidth = image.width;
				base.imgHeight = image.height;
				deferred.resolve({
					width : w,
					height : h
				});
			}
			return deferred.promise();
		};

		// Run initializer
		base.init();
	};

	$.resizeImage.defaultOptions = {
		center : true,
		responsive : true,
		width : 900,
		height : 900
	};

	$.fn.resizeImage = function(size, options) {
		return this.each(function() {
			(new $.resizeImage(this, size, options));

			// HAVE YOUR PLUGIN DO STUFF HERE

			// END DOING STUFF

		});
	};

})(jQuery);