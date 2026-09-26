// =================================
// REVEAL DESIGNS WHEN SCROLLING
// =================================

const designs = document.querySelectorAll(".design-card");

const revealObserver = new IntersectionObserver(
    (entries) => {

        entries.forEach((entry) => {

            if (entry.isIntersecting) {

                entry.target.classList.add("show");

                revealObserver.unobserve(entry.target);

            }

        });

    },
    {
        threshold: 0.08
    }
);


designs.forEach((design, index) => {

    // Small delay between cards
    design.style.transitionDelay = `${index * 0.05}s`;

    revealObserver.observe(design);

});


// =================================
// NAVBAR BACKGROUND ON SCROLL
// =================================

const navbar = document.querySelector(".navbar");

window.addEventListener("scroll", () => {

    if (window.scrollY > 50) {

        navbar.style.background =
            "rgba(248, 246, 241, 0.95)";

    } else {

        navbar.style.background =
            "rgba(248, 246, 241, 0.82)";

    }

});