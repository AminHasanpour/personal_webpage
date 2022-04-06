var slider = document.getElementById("slider");
var f_img = document.getElementById("foreground-img");
var b_img = document.getElementById("background-img");
var baloon = document.getElementById("baloon");
var s_button = document.getElementById("slider-button");
f_img.style.backgroundSize = slider.clientWidth+"px 100%";

slider.oninput = function() {
    f_img.style.width = this.value + "%";
    s_button.style.left = 'calc('+this.value+'% - 15px)';
}

window.onresize = function() {
    f_img.style.backgroundSize = slider.clientWidth+"px 100%";
}

document.getElementById("slider-list").addEventListener("click",function(e) {
    if(e.target) {
        baloon.src = "images/slider/"+e.target.id+"_1.png";
        b_img.style.backgroundImage = "url('images/slider/"+e.target.id+"_2.png')";
        f_img.style.backgroundImage = "url('images/slider/"+e.target.id+"_1.png')";
    }
});