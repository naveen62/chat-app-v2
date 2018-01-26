function myFunction() {
    // Declare variables
    var input, filter, ul, li, a, i;
    input = document.getElementById('myInput');
    filter = input.value.toUpperCase();
    ul = document.getElementById("myUL");
    li = ul.getElementsByTagName('li');
    if (filter.length == 0) {
        ul.style.display = 'none';
        li.style.display = 'none'
    }
    // Loop through all list items, and hide those who don't match the search query
    for (i = 0; i < li.length; i++) {
        ul.style.display = 'block'
        a = li[i].getElementsByTagName("a")[0];
        if (a.innerHTML.toUpperCase().indexOf(filter) > -1) {
            li[i].style.display = "";
        } else {
            li[i].style.display = "none";
        }

    }
}