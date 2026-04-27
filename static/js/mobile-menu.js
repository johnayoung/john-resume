'use strict';

$('.personal-profile__name').on('click', function() {
  console.log('does anything work?');
});

//Open mobile menu
$('.menu__wrapper, .mobile-menu__close').on('click', function() {
  console.log('it worked');
  $('.mobile-menu').toggleClass('active');
});

//Close mobile menu after click
$('.mobile-menu__wrapper ul li a').on('click', function() {
  $('.mobile-menu').removeClass('active');
});