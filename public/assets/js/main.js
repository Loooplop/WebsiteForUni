window.addEventListener('load', function() {

    /*=======================================================================================================================================
        This is for the sticky navigation bar.
    
        Grab the navigation bar, get the offset position of the navigation bar, and add the sticky class to the navbar when the user
        reaches the scroll position. Remove 'stick' when the user leaves the scroll position. // If the screen goes into a mobile width
        then remove sticky navigation bar.

        WARNING: THIS COULD BECOME A DEPRECATED FEATURE DEPENDING IF THIS IS DEEMED NEEDED OR NOT.
    =======================================================================================================================================*/

    window.onscroll = function() {
        myFunction();
    };

    var navbar = document.querySelector('#navbar');
    var sticky = navbar.offsetTop;

    function myFunction() {
        if (window.pageYOffset >= sticky) {
            navbar.classList.add('sticky');
        } else {
            navbar.classList.remove('sticky');
        }
        if (window.innerWidth < 600) {
            navbar.classList.remove('sticky');
        }
    }

    /*=======================================================================================================================================
        This is for the Side Bar.
    =======================================================================================================================================*/

    document.querySelector("#openbt").addEventListener('click', function() {
        function openNav() {
            document.getElementById("mySidenav").style.display = "block";
        }
        openNav();
    })

    document.querySelector("#close").addEventListener('click', function() {
        function closeNav() {
            document.getElementById("mySidenav").style.display = "none";
        }
        closeNav();
    })
});