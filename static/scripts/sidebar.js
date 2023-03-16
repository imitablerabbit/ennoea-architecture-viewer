import * as alert from "./alert.js";

var sidebar;
var sidebarToggle;

export function init() {
    sidebar = document.getElementById('sidebar');
    sidebarToggle = document.getElementById('sidebar-toggle');

    sidebarToggle.addEventListener('click', () => toggleSidebar());
}

function toggleSidebar() {
    sidebar.classList.toggle('active');
    sidebarToggle.classList.toggle('active');

    if (sidebarToggle.classList.contains('active')) {
        // sidebarToggle.html('&#x274C;'); // Red cross emoji
        sidebarToggle.innerHTML = "x";
    } else {
        // sidebarToggle.html("&#127828;"); // Hamburger emoji
        sidebarToggle.innerHTML = ">";
        alert.success("sidebar has been closed");
    }
}
