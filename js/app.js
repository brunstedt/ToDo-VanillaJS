var TaskList = (function() {

  // Array of tasks
  var taskList = [];

  // Add or update ToDo
  function add(taskItem){
    if(typeof taskItem.id === 'undefined'){
      /* If it's a new task (no id passed), we give
        the task an id before adding it.
      */
      var id = taskList.length;
      taskItem.id = id;
      taskList.push(taskItem);
    }else{
      /* We got an id, so we check to see if it exists already.
         If we find the id, we update that task, otherwise we'll
         add it as a new task.
       */
      var taskIndex = find(taskItem.id);
      if(taskIndex >= 0){
        taskList[taskIndex].title = taskItem.title;
        taskList[taskIndex].tags = taskItem.tags;
        taskList[taskIndex].done = taskItem.done;
      }else{
        taskList.push(taskItem);
      }
    }

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
  }

  /* Find index for specific task by id. Since vanilla is the flavour, we do some
    looping to find the task. Would normally prefer _filter / $.inArray / arr.find
  */
  function find(id){
    for (var i = 0; i < taskList.length; i++) {
      if(taskList[i].id === parseInt(id)){
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


  // The TaskItem, to be pupolated and sent to list
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
    searchTask : search,
    getIndex : find
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

    // Submit by button
    submitBtn.onclick = function(){
      FormField.postItem();
    }

    // Submit by [ENTER]
    inputField.onkeypress = function(e){
      if(e.keyCode === 13){
        FormField.postItem();
      }
    }

    // Filter/Search
    inputField.onkeyup = function(){
      TaskList.searchTask(inputField.value);
    }

    // Mark as done
    var markAsDoneButtons = document.getElementsByClassName('toDo-done');
    for (var i = 0; i < markAsDoneButtons.length; i++) {
      markAsDoneButtons[i].onclick = function(){
        var index = TaskList.getIndex(this.dataset.todoid);
        var toDo = new TaskList.task(TaskList.taskList[index].title, 'labels', this.checked, TaskList.taskList[index].id);
        TaskList.addItem(toDo);
      }
    }

    // Delete ToDo
    var deleteButtons = document.getElementsByClassName('toDo-delete');
    for (var i = 0; i < deleteButtons.length; i++) {
      deleteButtons[i].onclick = function(){
        TaskList.removeItem(this.dataset.todoid);
      }
    }

    inputField.blur();

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

      var taskDone = '',
          checked = '';
      if(tasks[i].done){
        taskDone = 'task-done';
        checked = 'checked';
      }

      var taskItem = '<li class="'+taskDone+'"><input type="checkbox" '+ checked +' class="toDo-done" data-todoid="'+ tasks[i].id +'"/>D</button>'+ tasks[i].title +'<button class="toDo-delete" data-todoid="'+ tasks[i].id +'">Delete todo</button></li>'
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
