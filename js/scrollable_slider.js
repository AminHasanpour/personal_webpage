$(function() {
  // Lazy load helper function
  function lazyLoadTabImage(tabId) {
    var $tab = $(tabId);
    var $img = $tab.find('img');
    
    // Only load if not already loaded
    if ($img.length && $img.attr('data-src') && !$img.attr('src')) {
      $img.attr('src', $img.attr('data-src'));
      $img.removeAttr('data-src');
    }
  }
  
  // Initialize tabs with lazy loading
  $("#tabs").tabs({
    show: { effect: "blind", direction: "left", duration: 300 },
    activate: function(event, ui) {
      // Load image for the newly activated tab
      lazyLoadTabImage('#' + ui.newPanel.attr('id'));
    }
  });
  
  // Load the first tab's image immediately
  lazyLoadTabImage('#tabs-1');
  
  $( "#accordion" ).accordion();

  var btn = $('#accordion li a');
  var wrapper = $('#accordion li');

  $(btn).on('click', function() {
    $(btn).removeClass('active');
    $(btn).parent().find('.addon').removeClass('fadein');
    
    $(this).addClass('active');
    $(this).parent().find('.addon').addClass('fadein');
    
    // Lazy load the corresponding tab image when clicked
    var href = $(this).attr('href');
    if (href) {
      lazyLoadTabImage(href);
    }
  });
});


/* Scrollable */

$(document).ready(function () {
    if (window.matchMedia("(min-width:1180px)").matches) {
        var Scrollbar = window.Scrollbar;
        Scrollbar.use(window.OverscrollPlugin);
        var customScroll = Scrollbar.init(document.querySelector('.js-scroll-list'), {
        plugins: {
            overscroll: true
        }
        });
    
        var listItem = $('.js-scroll-list-item');
        listItem.eq(0).addClass('item-focus');
    // Start blurred until the user scrolls
    $('.js-scroll-list').addClass('is-blurred');

        // Fallback: if user interacts (wheel/touch/keys) over the list, hide mouse and unblur
        $('.js-scroll-list').one('wheel touchstart keydown', function() {
          $('.scroll-downs').css('opacity', '0');
          $('.scroll-downs').css('height', '0');
          $('.js-scroll-list').removeClass('is-blurred');
        });
    
        customScroll.addListener(function (status) {
    
        $('.scroll-downs').css('opacity', '0');
        $('.scroll-downs').css('height', '0');
    // Remove blur on first interaction
    if ($('.js-scroll-list').hasClass('is-blurred')) {
      $('.js-scroll-list').removeClass('is-blurred');
    }
        
        var top = status.offset.y;
        // console.log(top);
    
        var parentTop = 1;
        var $lis = $('.js-scroll-list-item');
        for (var i = 0; i < $lis.length; i++) {
            var $li = $($lis[i]);
            var liTop = $li.position().top;
            var liRelTop = liTop - parentTop;
    
            if (liRelTop + $li.parent().scrollTop() > top) {
            if (!$li.hasClass('item-focus')) {
                $li.prev().addClass('item-hide');
                $lis.removeClass('item-focus');
            }
            $li.removeClass('item-hide');
            $li.addClass('item-focus');
            break;
            }
        }
        });
    }
  });
