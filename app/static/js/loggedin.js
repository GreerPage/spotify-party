var r = getCookie('redirect');
if (r) {
    window.location.href = r;
    delete_cookie('redirect');
}
else window.location.href = '/';