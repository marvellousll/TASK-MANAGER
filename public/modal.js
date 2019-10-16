$('#exampleModal').on('show.bs.modal', function (event) {
  var button = $(event.relatedTarget); // Button that triggered the modal
  var recipient = button.data('whatever'); // Extract info from data-* attributes
  // If necessary, you could initiate an AJAX request here (and then do the updating in a callback).
  // Update the modal's content. We'll use jQuery here, but you could use a data binding library or other methods instead.
  var modal = $(this);
  modal.find('.modal-title').text('Add A New Task');
  modal.find('#date-text').val(recipient);
});


$('#addTodo').on('click', function(event) {
  // event.preventDefault(); // To prevent following the link (optional)
  var date = $('#date-text').val();
  var todo = $('#todo-text').val();
  console.log(date, todo);
  $.post("/addTodo", {date: date, todo: todo}, function(data, status){
    window.location.reload();
  });
});
