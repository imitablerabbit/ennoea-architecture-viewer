$(document).ready(function () {
    var sidebarToggle = $('#sidebar > button.activate-toggle');
    var sidebar = $('#sidebar');

    sidebarToggle.click(toggleSidebar);

    function toggleSidebar() {
        // Toggle the class of the sidebar elements.
        sidebar.toggleClass('active');
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
