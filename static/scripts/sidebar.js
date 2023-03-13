$(document).ready(function () {
    var sidebarToggle = $('#hamburger-toggle');
    var sidebar = $('#sidebar');
    var overlay = $('#overlay');

    sidebarToggle.click(toggleSidebar);
    overlay.click(toggleSidebar);

    function toggleSidebar() {
        // Toggle the class of the sidebar elements.
        sidebar.toggleClass('active');
        overlay.toggleClass('active');
        sidebarToggle.toggleClass('active');
    
        if (sidebarToggle.hasClass('active')) {
            // Replace it with the red cross emoji
            // sidebarToggle.html('&#x274C;');
            sidebarToggle.html('x');
        } else {
            // Replace it with the hamburger emoji.
            // sidebarToggle.html("&#127828;");
            sidebarToggle.html(">");
        }
    }
});
