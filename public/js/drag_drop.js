function allowDrop(ev) {
  ev.preventDefault();
}

function drag(ev) {
  // Ev.target is the img and its parent is the moving div
  // console.log(ev.target.parentElement.id)
  ev.dataTransfer.setData("text", ev.target.parentElement.id);
}

function drop(ev) {
  ev.preventDefault();
  var data = ev.dataTransfer.getData("text");
  // console.log(data);
  // Moving_element is the div being dragged
  var moving_element = document.getElementById(data);
  // Parent is the full grid div
  var parent = moving_element.parentElement;
  // Reference_element is the div around the img you want to drag the moving_element before
  var reference_element = ev.target.parentElement;
  parent.insertBefore(moving_element, reference_element);
}