const urlParams = new URLSearchParams(window.location.search);
const redirect = urlParams.get('redirect');
delete_cookie('username')
delete_cookie('user_id')
delete_cookie('token')
delete_cookie('refresh')
if (redirect) window.location.href = redirect;
else window.location.href = '/';