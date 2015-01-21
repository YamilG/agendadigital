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
			$('#featured-img').attr('src','%Featured:bannerMini:image%');
			// alert('is mobile!');
		} else { 
			$('#featured-img').attr('src','%Featured:banner:image%');
			// alert('is not mobile!');
		}
	};
		
	checkMobile();

});