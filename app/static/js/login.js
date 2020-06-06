const urlParams = new URLSearchParams(window.location.search);
const redirect = urlParams.get('redirect');
if (redirect) document.cookie = `redirect=${redirect}`
