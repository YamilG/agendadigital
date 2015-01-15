$(function() {
    $(window).scroll(function() {
    var $this = $(window);

    if ($this.scrollTop() >= 100) {
      $('#search-box').fadeIn();
    }
});
});