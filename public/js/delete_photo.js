const delete_buttons = document.getElementsByClassName('fa-window-close');

var delete_func = function(e) {
  // console.log('Remove button was clicked');
  filename = e.target.parentElement.id;

  fetch('/files/'+filename, {method: 'DELETE'})
    .then(function(response) {
      // console.log(response);
      if(response.ok) {
        // console.log('Photo removed from database');
        document.getElementById(filename).remove();
        if(document.getElementById("gallery").childElementCount === 0){
          let no_photos = document.createElement("p");
          no_photos.innerHTML = "No Photos Available";
          document.getElementById("gallery").appendChild(no_photos);
        }
        // console.log("Photo removed from page");
        return;
      }
      throw new Error('Request failed.');
    })
    .catch(function(error) {
      console.log(error);
    });
};

for (var i = 0; i < delete_buttons.length; i++) {
  delete_buttons[i].addEventListener('click', delete_func);
}