'use strict';

console.log('Width', $(window).width());
if ($(window).width() < 992) {
  // disable carousel
  $('.carousel').carousel({
    interval: false
  });
}
// $('.carousel').carousel({
//     pause: "hover",
//     interval: 5000
// });

$('.carousel-control-prev').click(function() {
  $('.carousel').carousel('prev');
});

$('.carousel-control-next').click(function() {
  $('.carousel').carousel('next');
});