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
  forge.prefs.get(date, $.proxy(prefsGetHandler, state), prefsErrorHandler);
}

function renderPage(date){
  $('#page_template').tmpl({date: formatDate(date).nice}).appendTo('#pager');
  getHolidays(date);
}

$(function(){

  $(document).on('swipeRight', '.page',function(e){
    checkiday.date = AddDays(checkiday.date, -1);
    transition($('#pager'), $('.page'), renderPage(checkiday.date), checkiday.directions.right);
  });

  $(document).on('swipeLeft', '.page', function(e){
    checkiday.date = AddDays(checkiday.date, 1);
    transition($('#pager'), $('.page'), renderPage(checkiday.date), checkiday.directions.left);
  });

  renderPage(checkiday.date);

  // $(document).on('click', '.today_btn', function(e){
  //   console.log("today btn hit");
  //   checkiday.date = new Date();
  //   renderPage(checkiday.date);
  // });

});
