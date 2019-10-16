//jshint esversion:6
init();

function init(){
  const rowSize    = 100; // => container height / number of items
  const containers = [];

  let count = 1;

  containers.get = (i)=> containers[i];

  Array.from($('.container')).forEach(node => {
    let container;

    containers.push(
      container = createContainer(node)
    );

    Array.from(node.children).forEach(child => {
      container.insertItem(child);
    });

    container.indexItems();
  });


  function createContainer(element) {
    let index     = containers.length;
    let sortables = []; // Array of sortables
    let container = {
      index       : index,
      element     : element,
      sortables   : sortables,
      indexItems  : indexItems,
      insertItem  : insertItem
    };

    TweenLite.to(element, 0.5, { autoAlpha: 1 });

    function indexItems() {
      sortables.forEach((s,i) => s.setIndex(i));
    }

    function insertItem(node) {
      container.sortables.push(Sortable(node, container.sortables.length, container.index));
    }

    return container;
  }


  function changeIndex(item, to) {

    let container = containers.get(item.col);

    // Change position in array
    arrayMove(container.sortables, item.index, to);

    // console.log("changeIndex", to);


    // Set index for each sortable
    container.indexItems();
  }


  function Sortable(element, index, col) {

    var content = element.querySelector(".item-content");
    var id = content.id;

    var query = '#'+id+' h2';
    var procrastination = Number($(query).text());
    console.log(query, procrastination);
    // var colorNum = Number(colorIndex);
    // var query = '#'+id+' h2';
    // var colorIndex = $(query).text();
    // console.log(query, colorIndex);

    var animation = TweenLite.to(content, 0.3, {
      boxShadow: "rgba(0,0,0,0.2) 0px 16px 32px 0px",
      force3D: true,
      scale: 1.1,
      paused: true
    });

    var dragger = new Draggable(element, {
      onDragStart: onDragStart,
      onRelease: onRelease,
      onDrag: onDrag,
      cursor: "inherit",
      type: "x,y",
      zIndexBoost: true
    });

    var sortable = {
      dragger    : dragger,
      element    : element,
      index      : index,
      col        : col,
      setIndex   : setIndex,
      id         : id,
      procrastination : procrastination
    };


    TweenLite.set(element, { y:index * rowSize, x: 0});

    function setIndex(index) {
      if (sortable.index != index) {
        $.post("/changeIndex", {id: sortable.id, newIndex: index}, function(data, status){
          // console.log(data, status);
        });

        sortable.index = index;
      }

      // console.log("setIndex", index);

      // Don't layout if you're dragging
      if (!dragger.isDragging) layout();
    }

    function onDragStart() {
      sortable.initCol = sortable.col;
      animation.play();
      this.update();
    }

    function onDrag() {
      let container = containers.get(sortable.col);
      let last      = container;

      containers.forEach(c => {
        if (c !== container && this.hitTest(c.element, '51%')) {
          container = c;
          console.log("changeCol", sortable.col, c.index);

          var diff = c.index-sortable.col;

          sortable.col = c.index;

          // var array = ["#fff", "#f1bc31", "#e25822", "#b22222", "#7c0a02"];
          var backArr = ["rgb(255, 255, 255)", "rgb(241, 188, 49)", "rgb(226, 88, 34)", "rgb(178, 34, 34)", "rgb(124, 10, 2)"];
          var colorArr = ["rgb(153, 153, 153)", "rgb(255, 255, 255)", "rgb(255, 255, 255)", "rgb(255, 255, 255)", "rgb(255, 255, 255)",];

          // console.log("old", newColor);
          // console.log("diff", diff);
          // newColor += diff;
          sortable.procrastination += diff;
          var newColor = sortable.procrastination;
          newColor = Math.min(4, newColor);
          newColor = Math.max(0, newColor);
          console.log("new", newColor);
          content.style.backgroundColor = backArr[newColor];
          content.style.color = colorArr[newColor];



          $.post("/changeDate", {id: sortable.id, newDate: c.index, procrastination: sortable.procrastination}, function(data, status){
            // content.style.backgroundColor = data;
          });


        }
      });

      if (container !== last) {
        // Remove the sortable from the last container;
        last.sortables.splice(sortable.index, 1);

        // Make sure we do not insert the sortable at an index higher than the next containers length...
        // Otherwise Natively Javascript will insert an 'undefined' value for every value between the containers length and the new item
        if (sortable.index > (container.sortables.length -1)) {
          sortable.index = container.sortables.length;
        }

        // After the proper sortable index is set... insert the sortable into the new containers list
        container.sortables.splice(sortable.index, 0, sortable);

        // Re index the last containers items, so that the empty space is removed
        last.indexItems();

        // Next we want to append the dragging target to the new container, However there are special steps we must follow,
        // in order to keep the drag target's position

        if (container.element !== sortable.element.parentNode) {
          container.element.appendChild(sortable.element);
          this.endDrag();

          // compensate for the directional shift in X.
          const width = sortable.element.clientWidth;
          const newX  = container.index < last.index ? (width - (width/2)) : ((width/2) - width);
          const newY  = this.y;
          // Not sure why I have to set values to 0... the to the correct value,
          // If I do not do this, it does not work for me.
          TweenLite.set(sortable.element, {x:0, y:0});
          TweenLite.set(sortable.element, {x:newX, y:newY});

          this.startDrag(this.pointerEvent);
        }
      }

      // Calculate the current index based on element's position
      var index = clamp(Math.round(this.y / rowSize), 0, container.sortables.length - 1);

      if (index !== sortable.index) {
        changeIndex(sortable, index);
      }
    }

    function onRelease() {
      animation.reverse();

      if (sortable.initCol !== sortable.col) {
        let container = containers.get(sortable.col);
        container.indexItems();

      } else {
        layout();
      }
    }

    function layout() {
      TweenLite.to(element, 0.3, { y: sortable.index * rowSize, x: 0 });
    }

    return sortable;
  }

  // Changes an elements's position in array
  function arrayMove(array, from, to) {
    array.splice(to, 0, array.splice(from, 1)[0]);
  }

  // Clamps a value to a min/max
  function clamp(value, a, b) {
    return value < a ? a : (value > b ? b : value);
  }
}


function deleteItem(e){
  e.parentNode.parentNode.parentNode.removeChild(e.parentNode.parentNode);
  let id = e.parentNode.id;
  $.post("/delete", {idToDelete: id}, function(data, status){
    init();
  });
}
