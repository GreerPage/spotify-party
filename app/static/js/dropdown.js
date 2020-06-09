window.onclick = function (event) {
    if (!event.target.matches(".invite-button") && !event.target.matches(".dropdown-content") && !event.target.matches('#link-input')) {
		var dropdowns = document.getElementsByClassName("dropdown-content");
		Array.from(dropdowns).forEach(function(i) {
			var openDropdown = i;
			if (openDropdown.classList.contains("show")) {
				openDropdown.classList.remove("show");
			}
		}); 	
    }
};
