var TaskList = (function() {

  // Array of tasks
  var taskList = [];

  // Add item
  function add(taskItem){
    // Before pushing it to our array we add an id to the task
    var id = taskList.length;
    taskItem.id = id;
    taskList.push(taskItem);

    // Update DOM
    Main.updateToDoList();
    Main.inputField.value = '';
    Main.init();
  }

  // Remove item
  function remove(id){
    var taskIndex = find(id);
    taskList.splice(taskIndex, 1);
    Main.updateToDoList();
    Main.init();
    console.log('Removed item width index of ' + id);
  }

  // ToDo: Update item!


  /* Find index for specific task by id. Since vanilla is the flavour, we do some
    looping to find the task. Would normally prefer _filter / $.inArray / arr.find
  */
  function find(id){
    for (var i = 0; i < taskList.length; i++) {
      if(taskList[i].id === parseInt(id)){
        console.log('Task with id '+ id +' found at index ' + i);
        return i;
      }
    }
  }

  // Filter taskList by title and update UI
  function search(searchTerm){
    if(typeof searchTerm !== 'undefined' && searchTerm !== ''){

      var searchHits = [];
      
      for (var i = 0; i < taskList.length; i++) {
        var taskTitle = taskList[i].title.toString().indexOf(searchTerm);
        if(taskTitle >= 0){
          searchHits.push(taskList[i].id);
        }
      }

      Main.updateToDoList(searchHits);

    }else{
      Main.updateToDoList();
    }
  }

  function TaskItem(title, labels, done, id) {
      this.id = id;
      this.title = title;
      this.done = done;
      this.labels = labels;
  }

  return {
    addItem : add,
    removeItem : remove,
    task : TaskItem,
    taskList : taskList,
    searchTask : search
  };

})();


var FormField = (function() {

  // Validate the input field
  function validateInputField(){
    if( (typeof Main.inputField.value !== 'undefined') && (Main.inputField.value !== '') ){
      // Remove HTML tags and trim string
      var taskTitle = Main.inputField.value.replace(/<\/?[^>]+(>|$)/g, "").trim();
      return taskTitle;
    }else{
      return false;
    }
  }


  // Post field data. Provide id to update existing task
  function post(){

    if(validateInputField()){
      // Create new object for our task
      var toDo = new TaskList.task(validateInputField(), 'labels', false);
      // ...and post it!
      TaskList.addItem(toDo);
    }else{
      alert('add title pls');
    }
  }


  return {
    postItem : post
  }

})();



var Main = (function() {

  // DOM elements
  var submitBtn = document.getElementById('todo-submit');
  var inputField = document.getElementById('todo-input');
  var taskList = document.getElementById('todo-items');

  function init(){
    inputField.focus();

    // Submit
    submitBtn.onclick = function(){
      FormField.postItem();
    }

    inputField.onkeyup = function(){
      TaskList.searchTask(inputField.value);
    }

    // Delete ToDo
    var deleteButtons = document.getElementsByClassName('toDo-delete');
    for (var i = 0; i < deleteButtons.length; i++) {
      deleteButtons[i].onclick = function(){
        TaskList.removeItem(this.dataset.todoid);
      }
    }


  }

  function updateToDoList(filter){
    // Remove old tasks from list
    taskList.innerHTML = '';

    // Get tasks
    var tasks = TaskList.taskList;

    // Loop tasks and create elements in list
    for (var i = 0; i < tasks.length; i++) {

      // If we have a filter defined, skip all tasks that does not match
      if(typeof filter === 'object' && filter.length >= 1){
        if(filter.indexOf(tasks[i].id) <= -1){
          continue;
        }
      }

      var taskDone = '';
      if(tasks[i].done){
        taskDone = 'task-done'
      }

      var taskItem = '<li class="'+taskDone+'"><button class="toDo-done" data-todoid="'+ tasks[i].id +'"/></button>'+ tasks[i].title +'<button class="toDo-delete" data-todoid="'+ tasks[i].id +'">Delete todo</button></li>'
      taskList.innerHTML += taskItem;
    }
  }

  return {
    submitButton : submitBtn,
    inputField : inputField,
    init : init,
    updateToDoList : updateToDoList
  }

})();


Main.init();
