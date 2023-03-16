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
        sidebarToggle.innerHTML = "x";
    } else {
        sidebarToggle.innerHTML = ">";
    }
}