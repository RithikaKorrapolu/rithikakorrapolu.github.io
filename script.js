// Example: Log clicks on menu items
document.addEventListener("DOMContentLoaded", function () {
    const menuLinks = document.querySelectorAll(".menu a");
    menuLinks.forEach(link => {
        link.addEventListener("click", function () {
            console.log(`Navigated to ${this.getAttribute("href")}`);
        });
    });
});
