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
  }

  // Remove item
  function remove(id){
    taskList.splice(id, 1);
    console.log('Removed item width index of ' + id);
  }

  // ToDo: Update item!


  /* Find index for specific task by id. Since vanilla is the flavour, we do some
    looping to find the task. Would normally prefer _filter / $.inArray / arr.find
  */
  function find(id){
    for (var i = 0; i < taskList.length; i++) {
      if(taskList[i].id === id){
        return i;
        console.log('Task with id '+ id +' found at index ' + i);
      }
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
    taskList : taskList
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
    // Hooks
    // Submit
    submitBtn.onclick = function(){
      FormField.postItem();
    }

    // Delete ToDo
    var deleteBtn = document.getElementByClassName('toDo-delete');
    


  }

  function updateToDoList(){
    // Remove old tasks from list
    taskList.innerHTML = '';

    // Get tasks
    var tasks = TaskList.taskList;

    // Loop tasks and create elements in list
    for (var i = 0; i < tasks.length; i++) {

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
