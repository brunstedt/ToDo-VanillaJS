var TaskList = (function() {

  // Array of tasks
  var taskList = [];

  // Array of categories
  var taskCategories = ['bugg', 'defect', 'feature request', 'in progress', 'to process'];

  // Get tasks from local storage
  function get(){
    var storedTasks = JSON.parse(localStorage.getItem("tasks"));

    if(storedTasks !== null){
      taskList = storedTasks;
    }

    return taskList;
  }

  // Add or update ToDo
  function add(taskItem){
    if(typeof taskItem.id === 'undefined'){
      /* If it's a new task (no id passed), we give
        the task an id before adding it.
      */

      var id = '';
      if(taskList !== null){
          id = taskList.length;
      }else{
          id = '0';
      }

      taskItem.id = id;
      taskList.unshift(taskItem);
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
        taskList[taskIndex].selected = taskItem.selected;
      }else{
        taskList.unshift(taskItem);
      }
    }

    // Save tasks
    save();

    // Update DOM
    Main.inputField.value = '';
    Main.updateToDoList();
    Main.init();
  }


  // Save to local storage
  function save(){
    localStorage.setItem('tasks', JSON.stringify(taskList));
  }


  // Remove item
  function remove(id){
    var taskIndex;

    if(typeof id === 'string'){
      taskIndex = find(id);
      taskList.splice(taskIndex, 1);
    }else if(typeof id === 'object'){
      // Loop the array of id's to remove and remove them from taskList
      for (var i = 0; i < id.length; i++) {
        taskIndex = find(id[i]);
        taskList.splice(taskIndex, 1);
      }

    }else{
      return false;
    }

    // Save tasks
    save();

    // Update DOM
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
      if(taskList !== null){
        for (var i = 0; i < taskList.length; i++) {
          var taskTitle = taskList[i].title.toString().indexOf(searchTerm);
          if(taskTitle >= 0){
            searchHits.push(taskList[i].id);
          }
        }
      }
      Main.updateToDoList(searchHits);
    }else{
      Main.updateToDoList();
    }

  }


  // The TaskItem, to be pupolated and sent to list
  function TaskItem(title, labels, done, id, selected) {
      this.id = id;
      this.title = title;
      this.done = done;
      this.labels = labels;
      this.selected = selected;
  }


  return {
    addItem : add,
    removeItem : remove,
    task : TaskItem,
    taskList : taskList,
    searchTask : search,
    getIndex : find,
    getTasks : get,
    getLabels : taskCategories
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
      var selectedToDoLabels = Main.getSelectedLabels();
      var toDo = new TaskList.task(validateInputField(), selectedToDoLabels, false);
      // ...and post it!
      TaskList.addItem(toDo);
    }else{
      alert('add title pls');
    }

  }


  return {
    postItem : post
  };

})();



var Main = (function() {

  // DOM elements
  var submitBtn = document.getElementById('todo-submit'),
      inputField = document.getElementById('todo-input'),
      taskList = document.getElementById('todo-items'),
      labelsList = document.getElementById('todo-categories'),
      deleteButton = document.getElementById('delete-todos'),
      selectAllButton = document.getElementById('selectAll'),
      markSelectedAsDone = document.getElementById('markasdone-todos');


  function init(){

    // Update UI with the tasks
    updateToDoList();

    // Add categories to UI
    addLabels();

    // Hook events for dynamic content
    hookEvents();

  }


  function addLabels(){
    // Remove old elements from UI
    labelsList.innerHTML = '';
    // Get categories
    var labels = TaskList.getLabels;
    // Update list
    for (var i = 0; i < labels.length; i++) {
      var label = '<li class="category category-' + labels[i].toString().replace(' ','') + '" data-categorytitle="' + labels[i] + '">' + labels[i] + '</li>';
      labelsList.innerHTML += label;
    }
  }


  function getSelectedLabels(){
    var selectedToDoLabels = [];
    var selectedCategories = labelsList.getElementsByClassName('category-selected');
    for (var i = 0; i < selectedCategories.length; i++) {
      selectedToDoLabels.push(selectedCategories[i].dataset.categorytitle);
    }
    return selectedToDoLabels;
  }



  // Bind DOM elements
  function hookEvents(){

    // Submit by button
    submitBtn.onclick = function(){
      FormField.postItem();
    };

    // Submit by [ENTER]
    inputField.onkeypress = function(e){
      if(e.keyCode === 13){
        FormField.postItem();
      }
    };

    // Filter/Search
    inputField.onkeyup = function(){
      TaskList.searchTask(inputField.value);
    };


    // Select all tasks
    selectAllButton.onclick = function(){
      var checkboxes = document.getElementsByName('toDo-select');
      var checked = 'checked';
      var state = true;

      if(checkboxes.length && checkboxes[0].checked){
        checked = '';
        state = false;
      }

      for (var i = 0; i < checkboxes.length; i++) {
        checkboxes[i].setAttribute('checked', checked);
        checkboxes[i].checked = state;
        // Trigger event
        var event = new Event('change');
        checkboxes[i].dispatchEvent(event);
      }

      var taskRows = document.getElementsByClassName('task-row');
      if(state){
        for (var i = 0; i < taskRows.length; i++) {
          taskRows[i].classList.add('task-row-selected');
        }
      }else{
        for (var i = 0; i < taskRows.length; i++) {
          taskRows[i].classList.remove('task-row-selected');
        }
      }

    }


    // mark as done (button)
    markSelectedAsDone.onclick = function(){
      var toDoSelect = document.getElementsByName('toDo-select'),
          tasks = TaskList.getTasks();

          for (var i = 0; i < toDoSelect.length; i++) {
            if(toDoSelect[i].checked){
              var index = TaskList.getIndex(toDoSelect[i].dataset.todoid);
              var toDo = new TaskList.task(tasks[index].title, tasks[index].labels, true, tasks[index].id, tasks[index].checked);
              TaskList.addItem(toDo);

              // Trigger event
              var event = new Event('change');
              toDoSelect[i].dispatchEvent(event);
            }
          }
    }


    // Delete ToDo's
    deleteButton.onclick = function(){
      var toDoSelect = document.getElementsByName('toDo-select'),
          toDosToDelete = [];

      for (var i = 0; i < toDoSelect.length; i++) {
        if(toDoSelect[i].checked){
          toDosToDelete.push(toDoSelect[i].dataset.todoid);
        }
      }

      if(toDosToDelete.length){
        TaskList.removeItem(toDosToDelete);
      }else{
        return false;
      }
    }

    // Add category
    var categoryList = document.getElementById('todo-categories');
    var categoryButtons = categoryList.getElementsByClassName('category');
    for (var x = 0; x < categoryButtons.length; x++) {
      categoryButtons[x].onclick = function(){
        this.classList.toggle('category-selected');
      };
    }

    // Select row-checkboxes
    var checkboxes = document.getElementsByClassName('toDo-checkBox');

    for (var i = 0; i < checkboxes.length; i++) {
      checkboxes[i].onchange = function(){
        if(this.name === 'toDo-select'){
          selectTaskEvent(this);
        }else if(this.name === 'toDo-done'){
          markAsDoneEvent(this);
        }else{
          return false;
        }
      }
    }

    // When a task is selected
    function selectTaskEvent(task){
      var tasks = TaskList.getTasks();
      var index = TaskList.getIndex(task.dataset.todoid);
      var toDo = new TaskList.task(tasks[index].title, tasks[index].labels, tasks[index].done, tasks[index].id, task.checked);
      TaskList.addItem(toDo);

      var rowSelected = false;
      if(task.checked){
        rowSelected = true;
      }

      if(rowSelected){
        deleteButton.classList.remove('btn-disabled');
        markSelectedAsDone.classList.remove('btn-disabled');
      }else{
        deleteButton.classList.add('btn-disabled');
        markSelectedAsDone.classList.add('btn-disabled');
      }
    }

    // Mark task as done event
    function markAsDoneEvent(task){
      var tasks = TaskList.getTasks();
      var index = TaskList.getIndex(task.dataset.todoid);
      var toDo = new TaskList.task(tasks[index].title, tasks[index].labels, task.checked, tasks[index].id, tasks[index].selected);
      TaskList.addItem(toDo);
    }
  }



  /* Update the Todo-list in DOM */
  function updateToDoList(filter){

    // Remove old tasks from list
    taskList.innerHTML = '';

    // Get tasks
    var tasks = TaskList.getTasks();

    if(tasks !== null){

      // Loop tasks and create elements in list
      for (var i = 0; i < tasks.length; i++) {
        var taskId = tasks[i].id,
            taskTitle = tasks[i].title,
            taskLabels = tasks[i].labels,
            taskDone = tasks[i].done,
            taskSelected = tasks[i].selected,
            taskDoneChecked = '',
            taskSelectedChecked = '',
            filtered = '';

        // If we have a filter defined, update 'filtered' (we'll use it for styling)
        if(typeof filter === 'object' && filter.length >= 1){
          if(filter.indexOf(taskId) <= -1){
            filtered = 'task-filtered';
          }
        }

        if(taskDone){
          taskDone = 'task-done';
          taskDoneChecked = 'checked';
        }else{
          taskDone = '';
        }

        if(taskSelected){
          taskSelected = 'task-row-selected';
          taskSelectedChecked = 'checked';
        }else{
          taskSelected = '';
          taskSelectedChecked = '';
        }

        // Create task element and append to DOM
        var taskItem = '<li class="task-row row '+ taskDone +' '+ filtered +' '+ taskSelected +'">'
                      +'<div class="col-2-4">'
                      +'<input name="toDo-select" '+ taskSelectedChecked +' type="checkbox" id="task-'+ taskId +'" class="toDo-checkBox" data-todoid="'+ taskId +'"/>'
                      +'<label class="task-row-title" for="task-'+ taskId +'">'+ taskTitle +'</label>'
                      +'</div><div class="col-2-4">'
                      +'<ul class="list-inline list-unstyled task-labels" id="task-labels-'+ taskId +'"></ul>'
                      +'<label for="task-'+ taskId  +'-done" class="pull-right"><input name="toDo-done" type="checkbox" '+ taskDoneChecked +' class="toDo-done toDo-checkBox" data-todoid="'+ taskId +'" id="task-'+ taskId  +'-done"/> Done</label>'
                      +'</div></li>';
        taskList.innerHTML += taskItem;

        // Create task label list and append to DOM
        var taskLabelsList = document.getElementById('task-labels-'+taskId);
        var taskLabelsStr = '';
        for (var z = 0; z < taskLabels.length; z++) {
          taskLabelsStr += '<li class="category category-sm category-'+ taskLabels[z].toString().replace(' ','') +' disabled">'+ taskLabels[z] +'</li>';
        }
        taskLabelsList.innerHTML += taskLabelsStr;

      }
    }

    hookEvents();

  }



  return {
    submitButton : submitBtn,
    inputField : inputField,
    init : init,
    updateToDoList : updateToDoList,
    getSelectedLabels : getSelectedLabels
  };

})();



Main.init();
