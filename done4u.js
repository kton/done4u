// done4u.js
var phantom = require('phantom');
var d4u  = {};

d4u.urls = {
  main: 'http://www.safeway.com/',
  login: 'https://www.safeway.com/ShopStores/OSSO-Login.page' +
    '?goto=http://www.safeway.com/ShopStores/Justforu-Coupons.page',
  coupons: 'http://www.safeway.com/ShopStores/Justforu-Coupons.page'
};

d4u.currentPage = d4u.urls.main;

d4u.login    = process.env.J4U_LOGIN;
d4u.password = process.env.J4U_PASSWORD;

d4u.init = function() {
  phantom.create(function(ph) {
    ph.createPage(function(page) {
      // https://github.com/ariya/phantomjs/issues/10687
      ph.onError = page.onError = function(err) {
        page.close();
        ph.exit();
      };

      page.set('onLoadFinished', function(status) {
        if (status !== 'success') {
          console.log('exiting, unable to load ' + d4u.currentPage);
          page.close();
          ph.exit();
        } else {
          console.log('loaded\n  ' + d4u.currentPage);
          switch (d4u.currentPage) {
            case d4u.urls.main:
              page.open(d4u.urls.login); break;
            case d4u.urls.login:
              d4u.attemptLogin(ph, page); break;
            case d4u.urls.coupons:
              d4u.clipCoupons(ph, page); break;
            default:
              console.log('unknown page, exiting / logging out');
              page.close();
              ph.exit();
              break;
          }
        }
      });

      page.set('onUrlChanged', function(url) {
        d4u.currentPage = url;
      });

      page.open(d4u.currentPage);

    });
  });
};

d4u.clipCoupons = function(ph, page) {
  console.log('attempting to clip coupons');
  page.evaluate(function() {

    // jscs:disable
    // IIFE converted from "bookmarklet" at https://github.com/nishnet2002/Safeway-Just-for-u
    (function(){(function(e,a,g,h,f,c,b,d){if(!(f=e.jQuery)||g>f.fn.jquery||h(f)){
    c=a.createElement("script");c.type="text/javascript";c.src="http://ajax.googleapis.com/ajax/libs/jquery/"+
    g+"/jquery.min.js";c.onload=c.onreadystatechange=function(){if(!b&&(!(d=this.readyState)||d=="loaded"||
    d=="complete")){h((f=e.jQuery).noConflict(1),b=1);f(c).remove();}};a.documentElement.childNodes[0]
    .appendChild(c);}})(window,document,"1.7.2",function($,L){function OfferProcessor(c,f){var d=c;var b=0;
    var a=f;var e="/Clipping1/services/clip/offers";return{processOffers:function(l){var p=l.offers;var n=0;
    for(var m=0;m<p.length;m++){var o=p[m];if(o.clipStatus==="U"){n++;var g=[];var k={};k.offerId=o.offerId;
    k.offerPgm=o.offerPgm;g.push(k);var h={};h.clips=g;var j=JSON.stringify(h);$.ajax({type:"POST",url:e,
    contentType:"application/json",data:j,beforeSend:function(i){i.setRequestHeader("SWY_API_KEY","emjou");
    i.setRequestHeader("SWY_BANNER","safeway");i.setRequestHeader("SWY_VERSION","1.0");
    i.setRequestHeader("X-SWY_API_KEY","emjou");i.setRequestHeader("X-SWY_BANNER","safeway");
    i.setRequestHeader("X-SWY_VERSION","1.0");}});}}b=n;a();},process:function(){var g=this;
    $.ajax(d).done(function(h){g.processOffers(h);});},getOffersAdded:function(){return b;}};}
    function Counter(c){var d=c;var a="";var b=0;return{incrementCount:function(){b++;if(b==d){a();}},
    setCallback:function(e){a=e;}};}$(document).ready(function(){var c=Counter(3);
    var b=OfferProcessor("/J4UProgram1/services/program/CC/offer/allocations",c.incrementCount);
    var e=OfferProcessor("/J4UProgram1/services/program/PD/offer/allocations",c.incrementCount);
    var d=OfferProcessor("/J4UProgram1/services/program/YCS/offer/allocations",c.incrementCount);
    var a=function(){var f=b.getOffersAdded();var g=e.getOffersAdded();if(f+g>0){
    alert("J4U - Added "+f+" 'Coupon Center' coupons and \n "+g+" 'Personalized Deals' Coupons.");}};
    c.setCallback(a);b.process();e.process();d.process();});});})();
    // jscs: enable

    // lol, angularjs
    var _unfilteredItems = justForYouApp.coupons._invokeQueue[12][2][1].unfilteredItems.slice();
    var _data = {};

    _data.count = _unfilteredItems.length || 0;
    _data.clipped = 0;
    _data.unclipped = 0;

    _unfilteredItems.forEach(function(_item) {
      if (_item.clipStatus === 'C') { _data.clipped++; }

      if (_item.clipStatus === 'U') { _data.unclipped++; }
    });

    return _data;
  },

  function(result) {
    console.log('clipping attempt completed\n  results: ' + JSON.stringify(result));

    if (!d4u.clipped) {
      d4u.clipped = true;
      console.log('refreshing coupon page in 180s');
      setTimeout(function() { page.open(d4u.currentPage); }, 180000);
    } else {
      console.log('proceeding with logout in 30s');
      setTimeout(function() { d4u.logout(ph, page); }, 30000);
    }
  });
};

d4u.logout = function(ph, page) {
  console.log('attempting logout');
  d4u.urls.main = '';
  d4u.login = '';
  d4u.password = '';
  page.evaluate(function() {
    openssoLogoff();
  });
};

d4u.attemptLogin = function(ph, page) {
  console.log('attempting login');
  page.evaluate(function(_login, _password) {

    var formEmail    = document.querySelector('input#userId[type="text"]');
    var formPassword = document.querySelector('input#password[type="password"]');

    formEmail.value = _login;
    formPassword.value = _password;

    LoginSubmit(); // site function
  }, function() {}, d4u.login, d4u.password);

};

if (!d4u.login || !d4u.password) {
  console.log('d4u could not find any login credentials, exiting');
} else {
  d4u.init();
}
