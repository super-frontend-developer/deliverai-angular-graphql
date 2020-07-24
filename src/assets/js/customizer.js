$('.header').on('click', '.search-toggle', function(e) {

  $('.header-title').toggleClass('header-title--hidden');
  $('.search-icon').toggleClass('search-icon--hidden');
  $('.close-icon').toggleClass('close-icon--show');
  $('.search-input-box').toggleClass('search-input-box--show').find('.search-input').focus();
  $(this).toggleClass('active');

  e.preventDefault();
});
