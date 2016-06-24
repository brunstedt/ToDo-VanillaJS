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


  // The TaskItem, to be populated and sent to list
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


  // Validate and post field data. Provide id to update existing task
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
      labelsList = document.getElementById('todo-labels'),
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

  // Add all the labels to the DOM
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


  // Get and return the currently select task-labels
  function getSelectedLabels(){
    var selectedToDoLabels = [],
        selectedCategories = labelsList.getElementsByClassName('category-selected');

    for (var i = 0; i < selectedCategories.length; i++) {
      selectedToDoLabels.push(selectedCategories[i].dataset.categorytitle);
    }

    return selectedToDoLabels;
  }


  //Bind the DOM elements to various functionality etc.
  function hookEvents(){

    // Bind submit by button
    submitBtn.onclick = function(){
      FormField.postItem();
    };


    // Bind input field: submit by [ENTER]
    inputField.onkeypress = function(e){
      if(e.keyCode === 13){
        FormField.postItem();
      }
    };


    // Bind input field: filter funtionality
    inputField.onkeyup = function(){
      TaskList.searchTask(inputField.value);
    };


    // Bind 'select all tasks'-button
    selectAllButton.onclick = function(){
      var checkboxes = document.getElementsByName('toDo-select'),
          checked = 'checked',
          state = true;

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


    // Bind click on task row to toggle select
    var taskRows = document.getElementsByClassName('task-row');

    for (var i = 0; i < taskRows.length; i++) {
      taskRows[i].onclick = function(e){
        // Catch if the user clicked the 'mark as done' (child in .task-row)
        if(e.target.classList.contains('task-mark-as-done')){
            var task = this.dataset.todoid;
            var checkbox = document.getElementById('task-'+ task +'-done');

            if(checkbox.checked){
              checkbox.checked = false;
            }else{
              checkbox.checked = true;
            }

            var event = new Event('change');
            checkbox.dispatchEvent(event);

        }else{

          console.log('clicked on row')

          var taskId = this.dataset.todoid;
          var checkBox = document.getElementById('task-' + taskId);

            // Toggle checkbox checked
            if(checkBox.checked){
              checkBox.checked = false;
            }else{
              checkBox.checked = true;
            }

          // Trigger event
          var event = new Event('change');
          checkBox.dispatchEvent(event);
        }
      }
    }


    // Bind 'mark as done'-button (mark all selected tasks as done at once)
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



    // Bind delete-button (delete all selected tasks at once)
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

        // If all tasks have been removed, set state of buttons to disabled.
        var checkboxes = document.getElementsByName('toDo-select');
        if(checkboxes.length){
          for (var i = 0; i < checkboxes.length; i++) {
            var event = new Event('change');
            checkboxes[i].dispatchEvent(event);
          }
        }else{
          deleteButton.classList.add('btn-disabled');
          markSelectedAsDone.classList.add('btn-disabled');
        }


      }else{
        return false;
      }
    }


    // Bind label buttons
    var categoryList = document.getElementById('todo-labels');
    var categoryButtons = categoryList.getElementsByClassName('category');
    for (var x = 0; x < categoryButtons.length; x++) {
      categoryButtons[x].onclick = function(){
        this.classList.toggle('category-selected');
      };
    }


    // Bind "done" and "select" checkboxes
    var checkboxes = document.getElementsByClassName('toDo-checkBox');
    for (var i = 0; i < checkboxes.length; i++) {
      checkboxes[i].onchange = function(){
        if(this.name === 'toDo-select'){
          console.log('select-changed')
          selectTaskEvent(this);
        }else if(this.name === 'toDo-done'){
          console.log('tododone changed')
          markAsDoneEvent(this);
        }else{
          return false;
        }
      }
    }


    // Toggle states of multi-choice buttons
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


    // Save task as marked as done (triggered when checkbox is ticked)
    function markAsDoneEvent(task){
      var tasks = TaskList.getTasks();
      var index = TaskList.getIndex(task.dataset.todoid);
      var toDo = new TaskList.task(tasks[index].title, tasks[index].labels, task.checked, tasks[index].id, tasks[index].selected);
      TaskList.addItem(toDo);
    }
  }


  function updateToDoList(filter){
    /*
      Update the DOM, removing the list and adding nodes again by
      looping the result saved in local storage.

      Pass argument as an object containing the id's of the task
      to filter. The filter will apply a class to tasks with a matching id
      from the passed argument object.
    */


    // Remove old elements from list
    taskList.innerHTML = '';

    // Get tasks from local storage
    var tasks = TaskList.getTasks();

    if(tasks !== null){
      for (var i = 0; i < tasks.length; i++) {

        // Loop tasks and create an object that we can append to our list
        var taskId = tasks[i].id,
            taskTitle = tasks[i].title,
            taskLabels = tasks[i].labels,
            taskDone = tasks[i].done,
            taskSelected = tasks[i].selected,
            taskDoneChecked = '',
            taskSelectedChecked = '',
            filtered = '';

        /*
          If we have a filter argument passed in, update 'filtered'
          (we'll use it for styling).
        */
        if(typeof filter === 'object' && filter.length >= 1){
          if(filter.indexOf(taskId) <= -1){
            filtered = 'task-filtered';
          }
        }

        /*
          If the task is marked as 'done' or 'selected' we update
          those variables too.
        */
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


        // Build the actual DOM element as a html string, then append it to the DOM.
        var svgCheck = '<svg data-todoid="'+ taskId +'" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" class="task-mark-as-done" x="0px" y="0px" viewBox="0 0 363.025 363.024" xml:space="preserve"><g><g><g><path d="M181.512,363.024C81.43,363.024,0,281.601,0,181.513C0,81.424,81.43,0,181.512,0     c100.083,0,181.513,81.424,181.513,181.513C363.025,281.601,281.595,363.024,181.512,363.024z M181.512,11.71     C87.88,11.71,11.71,87.886,11.71,181.513s76.17,169.802,169.802,169.802c93.633,0,169.803-76.175,169.803-169.802  S275.145,11.71,181.512,11.71z"/></g></g><g><polygon points="147.957,258.935 83.068,194.046 91.348,185.767 147.957,242.375 271.171,119.166  279.451,127.445"/></g></g></svg>';
        var taskItem = '<li class="task-row row '+ taskDone +' '+ filtered +' '+ taskSelected +'" data-todoid="'+ taskId +'">'
                      +'<div class="col-2-4">'
                      +'<input name="toDo-select" '+ taskSelectedChecked +' type="checkbox" id="task-'+ taskId +'" class="toDo-checkBox hidden" data-todoid="'+ taskId +'"/>'
                      +'<label class="task-row-title" for="task-'+ taskId +'">'+ taskTitle +'</label>'
                      +'</div><div class="col-2-4">'
                      +'<ul class="list-inline list-unstyled task-labels" id="task-labels-'+ taskId +'"></ul>'
                      +'<input name="toDo-done" data-todoid="'+ taskId +'" type="checkbox" '+ taskDoneChecked +' class="toDo-done toDo-checkBox hidden" data-todoid="'+ taskId +'" id="task-'+ taskId  +'-done"/><label for="task-'+ taskId  +'-done" class="pull-right">'+ svgCheck +'</label>'
                      +'</div></li>';

        taskList.innerHTML += taskItem;


        // Create list of labels that are attached to the task and append it to the DOM.
        var taskLabelsList = document.getElementById('task-labels-'+taskId);
        var taskLabelsStr = '';
        for (var z = 0; z < taskLabels.length; z++) {
          taskLabelsStr += '<li class="category category-sm category-'+ taskLabels[z].toString().replace(' ','') +' disabled">'+ taskLabels[z] +'</li>';
        }

        taskLabelsList.innerHTML += taskLabelsStr;

      }

    }

    // Re-do our bindings after our new elements has been added to the DOM.
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


// Lift off!
Main.init();
