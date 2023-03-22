import gsap from 'gsap';

var sidebar;
var sidebarToggle;
var sidebarToggleText;

export function init() {
    sidebar = document.getElementById('sidebar');
    sidebarToggle = document.getElementById('sidebar-toggle');
    sidebarToggleText = document.getElementById('sidebar-toggle-text');
    sidebarToggle.addEventListener('click', () => toggleSidebar());
}

function toggleSidebar() {
    sidebarToggle.classList.toggle('active');
    let left = -sidebar.clientWidth;
    let rotation = -180; // going counter-clockwise for closing animation
    if (sidebarToggle.classList.contains('active')) {
        left = 0;
        rotation = 0;
    }

    gsap.to(sidebar, {
        left: left,
        duration: 0.5
    });
    gsap.to(sidebarToggleText, {
        rotateZ: rotation,
        duration: 0.5
    });
}
