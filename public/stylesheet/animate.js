(function( $ ) {
    function doAnimations( elems ) {
        //store the animation event in a variable
        var animEndEv = 'webkitAnimationEnd animationend';	
        elems.each(function () {
            var $this = $(this),
                $animationType = $this.data('animation');
            $this.addClass($animationType).one(animEndEv, function () {
                $this.removeClass($animationType);
            });
        });
    }
    
    //Variables on page load 
    var $myCarousel = $('#namma-carousel'),
        $firstAnimatingElems = $myCarousel.find('.item:first').find("[data-animation ^= 'animated']");
    //Initialize carousel 
    $myCarousel.carousel();
    //Animate captions in first slide on page load 
    doAnimations($firstAnimatingElems);
    //Pause carousel  
    $myCarousel.carousel('pause');
    //Other slides to be animated on carousel slide event 
    $myCarousel.on('slide.bs.carousel', function (e) {
        var $animatingElems = $(e.relatedTarget).find("[data-animation ^= 'animated']");
        doAnimations($animatingElems);
    });  
})(jQuery);
  /***********************************************************
  * OPAQUE NAVBAR SCRIPT
  ***********************************************************/
  // Toggle tranparent navbar when the user scrolls the page
  $(window).scroll(function() {
    if($(this).scrollTop() > 315)  /*height in pixels when the navbar becomes non opaque*/ 
    {
        $('.opaque-navbar').addClass('opaque');
    } else {
     $('.opaque-navbar').removeClass('opaque');
    }
});
