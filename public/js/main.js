$(function() {
    $(window).scroll(function() {
	    var $this = $(window);

	    if ($this.scrollTop() >= 100) {
	      $('#search-box').fadeIn();
	    }
	});
	 
    window.onresize = function() {
		checkMobile();	
    }

	function checkMobile() {
		if( screen.width <= 768 ) {
			$('#featured-img').attr('src',img1);
			// alert('is mobile!');
		} else { 
			$('#featured-img').attr('src', img2);
			// alert('is not mobile!');
		}
	};
		
	checkMobile();

});