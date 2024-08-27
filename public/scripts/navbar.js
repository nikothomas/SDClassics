document.addEventListener('DOMContentLoaded', function () {
    const header = document.querySelector('header');
    const navbarLogo = document.querySelector('.nav-logo img');
    const profileIcon = document.getElementById('profile-icon');

    function handleScroll() {
        if (window.scrollY > 50) {
            header.classList.add('shrink');
            navbarLogo.classList.add('shrink');
            profileIcon.classList.add('shrink');
        } else {
            header.classList.remove('shrink');
            navbarLogo.classList.remove('shrink');
            profileIcon.classList.remove('shrink');
        }
    }

    window.addEventListener('scroll', handleScroll);
});
