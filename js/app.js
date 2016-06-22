var TaskList = (function() {

  // Array of tasks
  var taskList = [];

  // Array of categories
  var taskCategories = ['bugg', 'defect', 'feature request', 'in progress', 'to process'];

  // Get tasks from local storage
  function get(){
    var storedTasks = JSON.parse(localStorage.getItem("tasks"));
    taskList = storedTasks;
    return taskList;
  }

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

    // Save tasks
    save();

    // Update DOM
    Main.updateToDoList();
    Main.inputField.value = '';
    Main.init();
  }


  // Save to loacal storage
  function save(){
    localStorage.setItem("tasks", JSON.stringify(taskList));
  }


  // Remove item
  function remove(id){
    var taskIndex = find(id);
    taskList.splice(taskIndex, 1);
    // Save tasks
    save();
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
    getIndex : find,
    getTasks : get,
    getCategories : taskCategories
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
  var categoriesList = document.getElementById('todo-categories');

  function init(){

    // Update UI with the tasks
    updateToDoList();

    // Add categories to UI
    addCategories();

    // Hook events for dynamic content
    hookEvents();

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

    inputField.blur();

  }


  function addCategories(){
    // Remove old elements from UI
    categoriesList.innerHTML = '';
    // Get categories
    var categories = TaskList.getCategories;
    // Update list
    for (var i = 0; i < categories.length; i++) {
      var category = '<li class="category category-' + categories[i].toString().replace(' ','') + '" data-categorytitle="' + categories[i] + '">' + categories[i] + '</li>';
      categoriesList.innerHTML += category;
    }
  }


  function hookEvents(){
    // Get tasks
    var tasks = TaskList.getTasks();

    // Mark as done
    var markAsDoneButtons = document.getElementsByClassName('toDo-done');
    for (var i = 0; i < markAsDoneButtons.length; i++) {
      markAsDoneButtons[i].onclick = function(){
        var index = TaskList.getIndex(this.dataset.todoid);
        var toDo = new TaskList.task(tasks[index].title, 'labels', this.checked, tasks[index].id);
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

    // Add category
    var categoryList = document.getElementById('todo-categories');
    var categoryButtons = categoryList.getElementsByClassName('category');
    for (var i = 0; i < categoryButtons.length; i++) {
      categoryButtons[i].onclick = function(){
        this.classList.toggle('category-selected');
      }
    }

  }


  function updateToDoList(filter){

    // Remove old tasks from list
    taskList.innerHTML = '';

    // Get tasks
    var tasks = TaskList.getTasks();

    // Loop tasks and create elements in list
    for (var i = 0; i < tasks.length; i++) {
      var taskDone = '',
          checked = '',
          filtered = '';

      // If we have a filter defined, update 'filtered' (we'll use it for styling)
      if(typeof filter === 'object' && filter.length >= 1){
        if(filter.indexOf(tasks[i].id) <= -1){
          filtered = 'task-filtered';
        }
      }

      if(tasks[i].done){
        taskDone = 'task-done';
        checked = 'checked';
      }

      var taskItem = '<li class="'+ taskDone +' '+ filtered +'"><input type="checkbox" '+ checked +' id="task-'+ tasks[i].id +'" class="toDo-done" data-todoid="'+ tasks[i].id +'"/><label for="task-'+ tasks[i].id +'">'+ tasks[i].title +'</label><button class="toDo-delete" data-todoid="'+ tasks[i].id +'">Delete todo</button></li>'
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
