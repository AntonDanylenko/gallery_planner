// DRAG DROP

function allowDrop(ev) {
  ev.preventDefault();
}

function drag(ev) {
  // Ev.target is the moving div
  if (ev.target.className == "photo_item_div"){
    ev.dataTransfer.setData("text", ev.target.id);
  }
  // Ev.target is the img and its parent is the moving div
  else {
    ev.dataTransfer.setData("text", ev.target.parentElement.id);
  }
}

function drop(ev) {
  ev.preventDefault();
  var data = ev.dataTransfer.getData("text");
  // console.log(data);
  // Moving_element is the div being dragged
  var moving_element = document.getElementById(data);
  // console.log("moving_element.className: " + moving_element.className);

  // Reference_element is the div around the img you want to drag the moving_element before
  var reference_element = ev.target.parentElement;
  // console.log("ev.target.tagName: " + ev.target.tagName);

  // Target can also be the no_photos label or the div around the img itself
  if (ev.target.tagName == "P" || ev.target.className =="photo_item_div"){
    reference_element = ev.target;
  }
  // console.log("reference_element: " + reference_element);

  // Parent is either the full grid div or the temp sidebar gallery div
  var parent = reference_element.parentElement;
  // console.log("parent.id: " + parent.id);

  // Change class names of photo elements if its moved between gallery and temp
  if (parent.id=="gallery"){
    moving_element.className = "photo_item_div";
    var img = moving_element.getElementsByTagName("img")[0];
    img.className = "photo_item";
    var p = moving_element.getElementsByTagName("P")[0];
    p.className = "window_close";
  }
  else {
    moving_element.className = "temp_photo_item_div";
    var img = moving_element.getElementsByTagName("img")[0];
    img.className = "temp_photo_item";
    var p = moving_element.getElementsByTagName("P")[0];
    p.className = "temp_window_close";
  }

  // Insert moving_element before reference_element
  parent.insertBefore(moving_element, reference_element);

  // Remove no_photos element if first photo was moved in
  if (reference_element.tagName == "P"){
    reference_element.remove();
  }
  // Add no_photos element if last photo was moved out
  if(document.getElementById("gallery").childElementCount === 0){
    let no_photos = document.createElement("p");
    no_photos.addEventListener("drop", drop);
    no_photos.addEventListener("dragover", allowDrop);
    no_photos.innerHTML = "No Photos Available";
    no_photos.id = "no_photos";
    document.getElementById("gallery").appendChild(no_photos);
  }
  if(document.getElementById("temp_photos").childElementCount === 0){
    let no_photos = document.createElement("p");
    no_photos.addEventListener("drop", drop);
    no_photos.addEventListener("dragover", allowDrop);
    no_photos.innerHTML = "Drag photos here";
    no_photos.id = "temp_no_photos";
    document.getElementById("temp_photos").appendChild(no_photos);
  }
}

// SAVE LAYOUT

const save_button = document.getElementById("save_button");

var save_layout = function(e) {
  e.preventDefault();
  // console.log("Save button clicked");

  // Get ordered list of gallery photos
  const photoList = document.getElementsByClassName("photo_item_div");
  const filenames = [];
  for (element of photoList){
    filenames.push(element.id);
  }
  // console.log("Got filenames: " + filenames);

  // Get list of sidebar photos
  const tempPhotoList = document.getElementsByClassName("temp_photo_item_div");
  const temp_filenames = [];
  for (element of tempPhotoList){
    temp_filenames.push(element.id);
  }
  // console.log("Got temp_filenames: " + temp_filenames);

  fetch("/layout", {
    method: "POST", 
    headers: {
      "Content-Type": "application/json",
    },
    body: {
      "gallery_photos": JSON.stringify(filenames),
      "temp_photos": JSON.stringify(temp_filenames)
    },
  });
}

save_button.addEventListener("click", save_layout);

// DELETE PHOTO

const delete_buttons = document.getElementsByClassName("window_close");
const temp_delete_buttons = document.getElementsByClassName("temp_window_close");

var delete_func = function(e) {
  // console.log("Remove button was clicked");
  filename = e.target.parentElement.id;

  fetch("/files/"+filename, {method: "DELETE"})
    .then(function(response) {
      // console.log(response);
      if(response.ok) {
        // console.log("Photo removed from database");
        document.getElementById(filename).remove();
        if(document.getElementById("gallery").childElementCount === 0){
          let no_photos = document.createElement("p");
          no_photos.addEventListener("drop", drop);
          no_photos.addEventListener("dragover", allowDrop);
          no_photos.innerHTML = "No Photos Available";
          no_photos.id = "no_photos";
          document.getElementById("gallery").appendChild(no_photos);
        }
        if(document.getElementById("temp_photos").childElementCount === 0){
          let no_photos = document.createElement("p");
          no_photos.addEventListener("drop", drop);
          no_photos.addEventListener("dragover", allowDrop);
          no_photos.innerHTML = "Drag photos here";
          no_photos.id = "temp_no_photos";
          document.getElementById("temp_photos").appendChild(no_photos);
        }
        // console.log("Photo removed from page");
        save_layout(e);
        return;
      }
      throw new Error("Request failed.");
    })
    .catch(function(error) {
      console.log(error);
    });
};

for (var i = 0; i < delete_buttons.length; i++) {
  delete_buttons[i].addEventListener("click", delete_func);
}

for (var i = 0; i < temp_delete_buttons.length; i++) {
  temp_delete_buttons[i].addEventListener("click", delete_func);
}

// ADD PHOTOS

// Adds photos to the gallery on the page
// function addPhotosToPage(files){
//   let newTags = [];
//   for (file of files){
//     let div = document.createElement("div");
//     div.className = "photo_item_div";
//     div.id = file.filename;
//     div.setAttribute("draggable", true);
//     div.addEventListener(ondragstart, drag);
//     div.addEventListener(ondrop, drop);
//     div.addEventListener(ondragover, allowDrop);
//     let img = document.createElement("img");
//     img.className = "photo_item";
//     img.src = file.url;
//     img.alt = file.filename;
//     let i = document.createElement("i");
//     i.className = "far fa-window-close";
//     div.appendChild(img);
//     div.appendChild(i);
//     newTags.push(div);
//   }
  
//   let gallery_element = document.getElementById("gallery");
//   for (newTag of newTags){
//     let first_child = gallery_element.firstChild;
//     if (first_child.nodeName != "P"){
//       gallery_element.insertBefore(newTag, first_child);
//     } else {
//       first_child.remove();
//       gallery_element.appendChild(newTag);
//     }
//   }
// }

// CHANGE GAP WIDTH

function gapWidth(e){
  if (e.target.value=="phone"){
    document.getElementById("gallery").style.gap = "1rem";
    document.getElementById("container").style.maxWidth = "91rem";
  }
  else {
    document.getElementById("gallery").style.gap = "2rem";
    document.getElementById("container").style.maxWidth = "93rem";
  }
}

const radios = document.getElementsByClassName("radio");
for (radio of radios) {
  radio.addEventListener("click", gapWidth);
}

// OPEN SIDEBAR

function openSidebar(e) {
  e.preventDefault();
  document.getElementById("sidebar").style.width = "250px";
  document.getElementById("main").style.marginLeft = "250px";
}

function closeSidebar(e) {
  e.preventDefault();
  document.getElementById("sidebar").style.width = "0";
  document.getElementById("main").style.marginLeft= "0";
}

const sidebar_open = document.getElementById("sidebar_open");
sidebar_open.addEventListener("click", openSidebar);

const sidebar_close = document.getElementById("sidebar_close");
sidebar_close.addEventListener("click", closeSidebar);