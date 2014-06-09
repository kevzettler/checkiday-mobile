var tree = {},
    today = new Date();

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

var counter = 0;

function dateIterater(i){
  var date = formatDate(AddDays(today, i)).ugly;
  $.get("http://www.checkiday.com/api/3/?d="+date,
  function(data,status,xhr){
    tree[date] = JSON.parse(data);
    counter ++;
    console.log("counter", counter);
    if(counter === (365 * 2)){
      console.log("ALL DONE", tree);
      $('body').empty();
      $('body').html("hard_cache = "+JSON.stringify(tree)+";");
    }
  });
}

alert("doing it!");
for(var i=0; i > -365; i--){
  (function(i){
    dateIterater(i);
  })(i);
}

for(var i=0; i < 365; i++){
  (function(i){
    dateIterater(i);
  })(i);
}
