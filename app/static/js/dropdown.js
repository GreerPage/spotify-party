window.onclick = function (event) {
    if (!event.target.matches(".invite-button") && !event.target.matches(".dropdown-content")) {
	var dropdowns = document.getElementsByClassName("dropdown-content");
	for (i = 0; i < dropdowns.length; i++) {
	    var openDropdown = dropdowns[i];
	    if (openDropdown.classList.contains("show")) {
		openDropdown.classList.remove("show");
	    }
	}
    }
};
