// SAVE LAYOUT

const save_button = document.getElementById("save_button");

var save_layout = function(e) {
  e.preventDefault();
  // console.log("Save button clicked");
  const photoList = document.getElementsByClassName("photo_item_div");
  const filenames = [];
  for (element of photoList){
    filenames.push(element.id);
  }
  // console.log("Got filenames: " + filenames);
  fetch("/layout", {
    method: "POST", 
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(filenames),
  });
}

save_button.addEventListener('click', save_layout);

// DELETE PHOTO

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
        save_layout(e);
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

// ADD PHOTOS

// Adds photos to the gallery on the page
function addPhotosToPage(files){
  let newTags = [];
  for (file of files){
    let div = document.createElement("div");
    div.className = "photo_item_div";
    div.id = file.filename;
    div.setAttribute('draggable', true);
    div.addEventListener(ondragstart, drag_drop.drag);
    div.addEventListener(ondrop, drag_drop.drop);
    div.addEventListener(ondragover, drag_drop.allowdrop);
    let img = document.createElement("img");
    img.className = "photo_item";
    img.src = file.url;
    img.alt = file.filename;
    let i = document.createElement("i");
    i.className = "far fa-window-close";
    div.appendChild(img);
    div.appendChild(i);
    newTags.push(div);
  }
  
  let gallery_element = document.getElementById("gallery");
  for (newTag of newTags) {
    let first_child = gallery_element.firstChild;
    if (first_child.nodeName != "P"){
      gallery_element.insertBefore(newTag, first_child);
    } else {
      first_child.remove();
      gallery_element.appendChild(newTag);
    }
  }
}