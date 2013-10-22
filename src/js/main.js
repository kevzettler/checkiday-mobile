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
      for (k in d) {
        s = s.replace(new RegExp('\\${' + k + '}', 'g'), d[k]);
      }
    }
    return $(s);
};

function formatDate(date){
  var today = date
      ,dd = today.getDate()
      ,mm = today.getMonth()+1
      ,yyyy = today.getFullYear()
      ret = {}
      ;

  ret.nice = checkiday.months[mm-1]+ " " + dd + ", " + yyyy;
  
  if(dd<10){
    dd='0'+dd
  } 
  if(mm<10){
    mm='0'+mm
  } 

  ret.ugly = mm+'/'+dd+'/'+yyyy;

  return ret;
}

var checkiday = {
  months: [
  "January"
  ,"February"
  ,"March"
  ,"April"
  ,"May"
  ,"June"
  ,"July"
  ,"August"
  ,"September"
  ,"October"
  ,"November"
  ,"December"
  ]

  ,directions: {
    left:1
    ,right: -1
  }

  ,transitionInProgress: false

  ,date : new Date()
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


function transition(wrapperEl, currentPageEl, nextPageEl, delta) {
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
    left: (delta*transitionDistance)+'px'
  });

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
      $next.css({top: '', left: '', position: ''});

      checkiday.transitionInProgress = false;
    }
  );
}

function renderHolidays(holidays){
  var holidays_fragment = $('<div></div>');
  for(var i=0; i<holidays.length; i++){
    $('#holiday_template').tmpl(holidays[i]).appendTo(holidays_fragment);
  }

  $('.day-holiday-list').last().empty();
  holidays_fragment.children().appendTo($('.day-holiday-list').last());
}

function prefsGetHandler(result){
  if(result != null){
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
    console.log("pulling from hard cache");
    renderHolidays(hard_cache[state.date].holidays);
  }else{
    forge.prefs.get(date, $.proxy(prefsGetHandler, state), prefsErrorHandler);
  }
}

function renderPage(date){
  $('#page_template').tmpl({date: formatDate(date).nice}).appendTo('#pager');
  getHolidays(date);
}


  var $doc = $(document),
      Modernizr = window.Modernizr;

  $(document).ready(function() {
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

    $(document).on('swipeRight',function(e){
      checkiday.date = AddDays(checkiday.date, -1);
      transition($('#pager'), $('.page'), renderPage(checkiday.date), checkiday.directions.right);
    });

    $(document).on('swipeLeft',function(e){
      checkiday.date = AddDays(checkiday.date, 1);
      transition($('#pager'), $('.page'), renderPage(checkiday.date), checkiday.directions.left);
    });

    $(document).on('click', ".holiday_button", function(e){
      var $this = $(this);
      console.log("whats this", $this);

      $('.holiday_actions:visible').slideUp('fast', function(){
        if($this.next('.holiday_actions').is(":visible") === 'none'){
          $this.next('.holiday_actions').slideDown('fast');
        }else{
          $this.next('.holiday_actions').slideUp('fast');
        }
      });
    });

    renderPage(checkiday.date);
  });

  // Hide address bar on mobile devices (except if #hash present, so we don't mess up deep linking).
  if (Modernizr.touch && !window.location.hash) {
    $(window).load(function () {
      setTimeout(function () {
        window.scrollTo(0, 1);
      }, 0);
    });
  }


