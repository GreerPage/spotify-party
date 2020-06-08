function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length).replace(/"/g, '');
      }
    }
    return null;
  }
function delete_cookie(name) {
    document.cookie = name+'=; Max-Age=-99999999;';  
}
async function refreshToken() {
    var username = getCookie('username');
    var uid = getCookie('user_id');
    var res = await fetch('/refresh/'+ username + '/' + uid);
    data = await res.text();
    delete_cookie('token');
    document.cookie = 'token='+data;
    return new Promise(function(resolve, reject) {
      resolve(data);
    });
}