/*!
 * Zepto plugin : slide transition v1.2
 * https://github.com/Ilycite/zepto-slide-transition/
 */


/*
*
* I made some edits to this because it wasn't actually sliding down. KJZ
*
*/

(function($) {

	/**
	 * Slide down
	 * @param  {number or string} duration Optional. Duration of the animation. Default is Zepto default: 400
	 * @param  {string}           easing   Optional. Easing of the animation. Default is: swing
	 * @param  {function}         complete Optional. Callback when animation is complete.
	 * @return {object}                    Returns the Zepto collection
	 */
	$.fn.slideDown = function(duration, easing, complete) {
		// If second argument is an function, use it as the complete fallback
		if ($.type(easing) === 'function') {
			complete = easing;
			easing = undefined;
		}
		// Default easing
		if ($.type(easing) === 'undefined') {
			easing = 'swing';
		}
		if (!$.isFunction(complete)) {
			complete = function(){};
		}

		return this.each(function() {
			var $self = $(this);

			// get the element position to restore it then
			var position = $self.css('position');

			// show element if it is hidden
			//$self.show(); // commented out KJZ

			// get the element style attribute to restore it then
			var style = $self.attr('style');

			// place it so it displays as usually but hidden
			$self.css({
        display: 'block',
				position: 'absolute',
				visibility: 'hidden'
			});

			// get naturally height, margin, padding
			var marginTop = $self.css('margin-top'),
				marginBottom = $self.css('margin-bottom'),
				paddingTop = $self.css('padding-top'),
				paddingBottom = $self.css('padding-bottom'),
				height = $self.css('height');

			// set initial css for animation
			$self.css({
				position: position,
				visibility: 'visible',
				overflow: 'hidden',
				height: 0,
				marginTop: 0,
				marginBottom: 0,
				paddingTop: 0,
				paddingBottom: 0
			});

			// animate to gotten height, margin and padding
			$self.animate({
				height: height,
				marginTop: marginTop,
				marginBottom: marginBottom,
				paddingTop: paddingTop,
				paddingBottom: paddingBottom
			}, duration, easing, function() {
        console.log("setting style back to?", style);
				//$self.attr('style', $.type(style) === 'string' ? style : null); //comented out KJZ
				$self.each(complete);
			});
		});
	};

	/**
	 * Slide up
	 * @param  {number or string} duration Optional. Duration of the animation. Default is Zepto default: 400
	 * @param  {string}           easing   Optional. Easing of the animation. Default is: swing
	 * @param  {function}         complete Optional. Callback when animation is complete.
	 * @return {object}                    Returns the Zepto collection
	 */
	$.fn.slideUp = function(duration, easing, complete) {
		// If second argument is an function, use it as the complete fallback
		if ($.type(easing) === 'function') {
			complete = easing;
			easing = undefined;
		}
		// Default easing
		if ($.type(easing) === 'undefined') {
			easing = 'swing';
		}
		if (!$.isFunction(complete)) {
			complete = function(){};
		}

		return this.each(function() {
			var $self = $(this);

			// active the function only if the element is visible
			if ($self.height() > 0) {

				// get the element height, margin and padding to restore them then
				var height = $self.css('height'),
					marginTop = $self.css('margin-top'),
					marginBottom = $self.css('margin-bottom'),
					paddingTop = $self.css('padding-top'),
					paddingBottom = $self.css('padding-bottom');

				// set initial css for animation
				$self.css({
					visibility: 'visible',
					overflow: 'hidden',
					height: height,
					marginTop: marginTop,
					marginBottom: marginBottom,
					paddingTop: paddingTop,
					paddingBottom: paddingBottom
				});

				// animate element height, margin and padding to zero
				$self.animate({
					height: 0,
					marginTop: 0,
					marginBottom: 0,
					paddingTop: 0,
					paddingBottom: 0
				}, {
					// callback : restore the element position, height, margin and padding to original values
					duration: duration,
					easing: easing,
					queue: false,
					complete: function(){
						$self.attr('style', null);
						$self.hide();
						$self.each(complete);
					}
				});
			}
		});
	};

	/**
	 * Slide toggle, checks wheither is should slide down or up.
	 * @param  {number or string} duration Optional. Duration of the animation. Default is Zepto default: 400
	 * @param  {string}           easing   Optional. Easing of the animation. Default is: swing
	 * @param  {function}         complete Optional. Callback when animation is complete.
	 * @return {object}                    Returns the Zepto collection
	 */
	$.fn.slideToggle = function(duration, easing, complete) {

		return this.each(function() {
			var $self = $(this);
			
			// if the element is hidden, slideDown !
			if ($self.height() === 0) {
				$self.slideDown(duration, easing, complete);
			}
			// if the element is visible, slideUp !
			else {
				$self.slideUp(duration, easing, complete);
			}
		});

	};

})(Zepto);
