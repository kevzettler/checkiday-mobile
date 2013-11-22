if(typeof forge != 'undefined'){
  forge.logging.info("Setting console.log to forge debug");
  console.log = function(){
    var args_array = Array.prototype.slice.call(arguments);
    forge.logging.debug("Console.log: " + args_array.toString());
  };
}

//zepto templates
$.fn.tmpl = function(d) {
    var s = $(this[0]).html().trim();
    if (d) {
      for (var k in d) {
        s = s.replace(new RegExp('\\${' + k + '}', 'g'), d[k]);
      }
    }
    return $(s);
};

var checkiday = {
  months: [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
  ],

  view: "list",

  calendar_rendered: false,

  noop: function(){return;},

  directions: {
    left:1,
    right: -1
  },

  caldirections: {
    left: "gotoNextMonth",
    right: "gotoPreviousMonth"
  },

  transitionInProgress: false,

  date : new Date()
};

function formatDate(date){
  var today = date,
      dd = today.getDate(),
      mm = today.getMonth()+1,
      yyyy = today.getFullYear(),
      ret = {};

  ret.dd = dd;
  ret.mm = mm;
  ret.yyyy = yyyy;
  ret.nice = checkiday.months[mm-1]+ " " + dd + ", " + yyyy;
  
  if(dd<10){
    dd='0'+dd;
  }

  if(mm<10){
    mm='0'+mm;
  }

  ret.ugly = mm+'/'+dd+'/'+yyyy;

  return ret;
}

function AddDays(date, amount){
  var tzOff = date.getTimezoneOffset() * 60 * 1000;
  var t = date.getTime();
  t += (1000 * 60 * 60 * 24) * amount;
  var d = new Date();
  d.setTime(t);
  var tzOff2 = d.getTimezoneOffset() * 60 * 1000;
  if (tzOff != tzOff2)
  {
    var diff = tzOff2 - tzOff;
    t += diff;
    d.setTime(t);
  }
  return d;
}

function flipTransition(fromPage,toPage,reverse,onStart,onEnd) {
  //get elements
  fromPage = $(fromPage);
  toPage = $(toPage);

  //trigger onStart 
  if(typeof onStart == 'function') {onStart();}

  //trigger animation
  if (!reverse) {
    fromPage.addClass("flip out active");
    toPage.addClass("flip in active");
  } else {
    fromPage.addClass("flip out reverse active");
    toPage.addClass("flip in reverse active");
  }

   fromPage.unbind('webkitAnimationEnd');
   fromPage.bind('webkitAnimationEnd', function(){
      fromPage.removeClass("flip out in reverse active");
   });
   
   toPage.unbind('webkitAnimationEnd');
   toPage.bind('webkitAnimationEnd', function(){
    toPage.removeClass("flip out in reverse");
    toPage.addClass("active");
      //trigger onEnd
      if(typeof onEnd == 'function') {
        onEnd();
      }
    });
}



function slideTransition(wrapperEl, currentPageEl, nextPageEl, delta) {
  if (checkiday.transitionInProgress) {
    return;
  }

  checkiday.transitionInProgress = true;
  var transitionDistance = window.innerWidth;

  var $current = $(currentPageEl);
  var $wrapper = $(wrapperEl);
  var $next = $(nextPageEl);

  // horizontally align next page with viewport
  $next.css({
    position: 'absolute',
    top: 0,
    left: (delta*transitionDistance)+'px',
    "z-index": "-5"
  });

  $current.css({
    position: 'absolute',
    top: 0,
    "z-index": "20"
  })

  // insert into wrapper for transition
  $wrapper.append($next);

  $wrapper.anim(
    {translate: (-delta * transitionDistance)+'px,0'},

    // the animation will take 0.3 seconds
    0.3,

    // the animation will slow down towards the end
    'ease-out',

    // callback to execute when the animation's done
    function () {
      // remove the page that has been transitioned out
      $current.remove();

      // remove the CSS transition
      $wrapper.attr('style', '');

      // remove the position absoluteness
      $next.css({top: '', left: '', position: '', 'z-index': 5});

      checkiday.transitionInProgress = false;
    }
  );
}

function renderHolidays(holidays){
  var holidays_fragment = $('<div></div>');
  for(var i=0; i<holidays.length; i++){
    holidays[i].dyno_title = (function(){
      var prefix = formatDate(checkiday.date).nice + " is";

      if(formatDate(checkiday.date).ugly === formatDate(new Date()).ugly){
        prefix = "Today is";
      }

      return prefix+" "+holidays[i].name + "!";
    })();

    holidays[i].home_url = (function(){
      return "http://www.checkiday.com/" + (checkiday.date.getMonth()+1) + "/" + checkiday.date.getDate();
    })();

    $('#holiday_template').tmpl(holidays[i]).appendTo(holidays_fragment);
  }

  $('.day-holiday-list').last().empty();
  holidays_fragment.children().appendTo($('.day-holiday-list').last());
  stButtons.locateElements();
}

function prefsGetHandler(result){
  if(result !== null){
    renderHolidays(result.holidays);
  }else{
    forge.request.get("http://www.checkiday.com/api/3/?d="+this.date, $.proxy(requestGetHandler, this), requestGetErrorHandler);
  }
}

function prefsErrorHandler(error){
  console.log("got error from prefs api");
  console.log(error);
}

function prefsSetHandler(result){
  console.log("set okay", result);
}

function prefsSetErrorHandler(error){
  console.log("pres set error handler", error);
}

function requestGetHandler(result){
  renderHolidays(result.holidays);
  forge.prefs.set(this.date, result.holidays, prefsSetHandler, prefsSetErrorHandler);
}

function requestGetErrorHandler(error){
  console.log(error);
}

function getHolidays(date){
  var state = {date: formatDate(date).ugly};
  if(typeof hard_cache[state.date] != 'undefined'){
    renderHolidays(hard_cache[state.date].holidays);
  }else{
    forge.prefs.get(date, $.proxy(prefsGetHandler, state), prefsErrorHandler);
  }
}

function renderPage(date){
  var dateformat = formatDate(date);

  $('#page_template').tmpl({date: dateformat.nice}).appendTo('#pager');
  getHolidays(date);
}

function updateMonthYear() {
  var $month = $( '#custom-month' ),
  $year = $( '#custom-year' );

  $month.html( checkiday.cal.getMonthName() );
  $year.html( checkiday.cal.getYear() );
}

function generateSwipeEvent(direction){
  return function(e){
    if(checkiday.view === 'list'){
      checkiday.date = AddDays(checkiday.date, checkiday.directions[direction]);
      slideTransition($('#pager'), $('.page'), renderPage(checkiday.date), checkiday.directions[direction]);
    }else if(checkiday.view === 'cal'){
      checkiday.cal[checkiday.caldirections[direction]]( updateMonthYear );
    }
  };
}

function ensureCalendar(){
  if(checkiday.calendar_rendered === true){
    var df = formatDate(checkiday.date);
        checkiday.cal.get(df.mm-1, df.yyyy);
        updateMonthYear();
    return;
  }
  checkiday.calendar_rendered = true;

  var $calendar = $( '#calendar' );

  checkiday.cal = $calendar.calendario( {
    onDayClick : function( $el, $contentEl, dateProperties ) {
      var date = new Date(Date.parse(dateProperties.monthname + " " + dateProperties.day + ", " + dateProperties.year));
      $('.page').remove();
      checkiday.date = date;
      renderPage(date);
      flipTransition('#cal-view', '#list-view', true, checkiday.noop, function(){
        checkiday.view = 'list';
      });
    },
    displayWeekAbbr : true
  } ).data('calendario');

  updateMonthYear();

  $(document).on('click', "#cal-view h1 .next", function(e){
    checkiday.cal.gotoNextMonth( updateMonthYear );
  });

  $(document).on('click', "#cal-view h1 .prev", function(e){
    checkiday.cal.gotoPreviousMonth( updateMonthYear );
  });

}

$(document).ready(function() {
  var $pager = $('#pager'),
      $doc = $(document),
      Modernizr = window.Modernizr;

  $.fn.foundationAlerts           ? $doc.foundationAlerts() : null;
  $.fn.foundationButtons          ? $doc.foundationButtons() : null;
  $.fn.foundationAccordion        ? $doc.foundationAccordion() : null;
  $.fn.foundationNavigation       ? $doc.foundationNavigation() : null;
  $.fn.foundationTopBar           ? $doc.foundationTopBar() : null;
  $.fn.foundationCustomForms      ? $doc.foundationCustomForms() : null;
  $.fn.foundationMediaQueryViewer ? $doc.foundationMediaQueryViewer() : null;
  $.fn.foundationTabs             ? $doc.foundationTabs({callback : $.foundation.customForms.appendCustomMarkup}) : null;
  $.fn.foundationTooltips         ? $doc.foundationTooltips() : null;
  $.fn.foundationMagellan         ? $doc.foundationMagellan() : null;
  $.fn.foundationClearing         ? $doc.foundationClearing() : null;
  $.fn.placeholder                ? $('input, textarea').placeholder() : null;

  $doc.on('swipeRight', generateSwipeEvent('right'));
  $doc.on('swipeLeft', generateSwipeEvent('left'));

  $doc.on('click', ".holiday_button", function(e){
    
    if ($(this).next().height() === 0) { // swap up/down arrow icon
      $(this).find('.fa-arrow-circle-o-down').addClass('fa-arrow-circle-o-up');
    } else {
      $(this).find('.fa-arrow-circle-o-down').removeClass('fa-arrow-circle-o-up');
    }
    $(this).next('.holiday_actions').slideToggle();
  });

  $doc.on('click', "#list-view h1 .next", function(e){
    $doc.trigger('swipeLeft');
  });

  $doc.on('click', "#list-view h1 .prev", function(e){
    $doc.trigger('swipeRight');
  });

  $doc.on('click', "#list-view h1 .switch", function(e){
    flipTransition("#list-view", "#cal-view", true, checkiday.noop, function(){
      checkiday.view = "cal";
      ensureCalendar();
    });
  });

  $doc.on('click', "#cal-view h1 .switch", function(e){
    flipTransition("#cal-view", "#list-view", true, checkiday.noop, function(){
      checkiday.view = "list";
    });
  });

  renderPage(checkiday.date);

  //Prepopulate the calendar header
  var $month = $( '#custom-month' ),
      $year = $( '#custom-year' ),
      dateformat = formatDate(checkiday.date);
  $month.html( checkiday.months[dateformat.mm-1] );
  $year.html( dateformat.yyyy );

  stLight.options({publisher: "e8005f24-cf8c-4f87-837e-d269f4401148", doNotHash: false, doNotCopy: false, hashAddressBar: false});
});


