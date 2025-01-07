// Log a message to the browser console
console.log("Welcome to my personal website!");

// Example of adding interactivity
document.addEventListener("DOMContentLoaded", function() {
    const heading = document.querySelector("h1");
    heading.addEventListener("click", function() {
        alert("You clicked the heading!");
    });
});
