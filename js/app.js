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
        taskList[taskIndex].labels = taskItem.labels;
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
          var taskTitle = taskList[i].title.toString().toLowerCase().indexOf(searchTerm.toLowerCase());
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
  function validateInputField(field){
    if( (typeof field.value !== 'undefined') && (field.value !== '') ){
      // Remove HTML tags and trim string
      var taskTitle = field.value.replace(/<\/?[^>]+(>|$)/g, "").trim();
      return taskTitle;
    }else{
      return false;
    }

  }


  // Validate and post field data. Provide id to update existing task
  function post(source){
    if(source.classList.contains('js-newTask')){
      if(validateInputField(Main.inputField)){

        document.getElementById('error-notitle').classList.add('hidden');

        // Create new object for our task
        var selectedToDoLabels = Main.getSelectedLabels(document.getElementById('todo-labels'));
        var toDo = new TaskList.task(validateInputField(Main.inputField), selectedToDoLabels, false);

        // ...and post it!
        TaskList.addItem(toDo);

      }else{
        document.getElementById('error-notitle').classList.remove('hidden');
        Main.inputField.focus();
        Main.inputField.classList.add('has-error');
      }

    }else if(source.classList.contains('js-editTask')){
      // Edit task

      var editTask = document.getElementsByClassName('task-edit');

      if(editTask.length !== 1){
        console.log('Error: Could not find what task to edit');
        return false;
      }

      var taskTitle = editTask[0].getElementsByClassName('js-editTask')[0];
      var labels = editTask[0].getElementsByClassName('task-labels')[0];

      if(validateInputField(taskTitle)){
        var updatedToDoLabels = Main.getSelectedLabels(labels);
        var tasks = TaskList.getTasks();
        var index = TaskList.getIndex(taskTitle.dataset.todoid);
        var updatedToDo = new TaskList.task(taskTitle.value, updatedToDoLabels, tasks[index].done, tasks[index].id, tasks[index].selected);
        TaskList.addItem(updatedToDo);
      }
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
      var label = '<li class="label label-' + labels[i].toString().replace(' ','') + '" data-labeltitle="' + labels[i] + '">' + labels[i] + '</li>';
      labelsList.innerHTML += label;
    }
  }


  // Get and return the currently select task-labels
  function getSelectedLabels(source){
    var selectedToDoLabels = [],
        selectedCategories = source.getElementsByClassName('label-selected');

    for (var i = 0; i < selectedCategories.length; i++) {
      selectedToDoLabels.push(selectedCategories[i].dataset.labeltitle);
    }

    return selectedToDoLabels;
  }


  //Bind the DOM elements to various functionality etc.
  function hookEvents(){

    // Bind submit by button
    submitBtn.onclick = function(){
      FormField.postItem(this);
    };

    // Bind input field: submit by [ENTER]
    inputField.onkeypress = function(e){
      if(e.keyCode === 13){
        FormField.postItem(this);
      }
    };

    // Bind input field: filter funtionality
    inputField.onkeyup = function(){
      TaskList.searchTask(inputField.value);

      // Toggle state of submit button
      if(this.value.trim().length){
        submitBtn.classList.remove('disabled');
        inputField.classList.remove('has-error');
      }else{
        submitBtn.classList.add('disabled');
      }
    };

    // Bind 'select all tasks'-button
    selectAllButton.onclick = function(){
      var checkboxes = document.getElementsByName('toDo-select'),
          checkedBoxes = 0,
          checked = 'checked',
          state = true;

      // Check how many tasks that is currently selected
      for (var i = 0; i < checkboxes.length; i++) {
        if(checkboxes[i].checked === true){
          checkedBoxes++;
        }
      }

      if(checkedBoxes >= checkboxes.length){
        // If all boxes are seleced, deselect them
        checked = '';
        state = false;
      }

      for (var checkboxesIndex = 0; checkboxesIndex < checkboxes.length; checkboxesIndex++) {
        checkboxes[checkboxesIndex].setAttribute('checked', checked);
        checkboxes[checkboxesIndex].checked = state;

        // Trigger event
        var event = new Event('change');
        checkboxes[checkboxesIndex].dispatchEvent(event);
      }

      var taskRows = document.getElementsByClassName('task-row');
      if(state){
        for (var taskRowsAddClassIndex = 0; taskRowsAddClassIndex < taskRows.length; taskRowsAddClassIndex++) {
          taskRows[taskRowsAddClassIndex].classList.add('task-row-selected');
        }
      }else{
        for (var taskRowsRemoveClassIndex = 0; taskRowsRemoveClassIndex < taskRows.length; taskRowsRemoveClassIndex++) {
          taskRows[taskRowsRemoveClassIndex].classList.remove('task-row-selected');
        }
      }
    };

    // Bind click on task row to toggle select / mark as done / edit task
    var taskRows = document.getElementsByClassName('task-row');

    for (var i = 0; i < taskRows.length; i++) {
      taskRows[i].onclick = function(e){

        // Catch if the user clicked the 'mark as done' (child in .task-row)
        if(e.target.classList.contains('task-mark-as-done') || e.target.classList.contains('toDo-done')){

            var task = this.dataset.todoid;
            var checkbox = document.getElementById('task-'+ task +'-done');

            if(checkbox.checked){
              checkbox.checked = false;
            }else{
              checkbox.checked = true;
            }

            var event = new Event('change');
            checkbox.dispatchEvent(event);

        }else if(e.target.classList.contains('btn-edit-task')){

          // Catch click on "edit task"
          toggleEditTask(this);

        }else{

          var taskId = this.dataset.todoid;
          var checkBox = document.getElementById('task-' + taskId);

            // Toggle checkbox checked
            if(checkBox.checked){
              checkBox.checked = false;
            }else{
              checkBox.checked = true;
            }

          // Trigger event
          var taskCheckEvent = new Event('change');
          checkBox.dispatchEvent(taskCheckEvent);

        }
      };
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
    };

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
          deleteButton.classList.add('disabled');
          markSelectedAsDone.classList.add('disabled');
        }

      }else{
        return false;
      }
    };

    // Bind label buttons
    var labelButtons = document.getElementsByClassName('label');
    for (var x = 0; x < labelButtons.length; x++) {
      labelButtons[x].onclick = function(){
        this.classList.toggle('label-selected');
      };
    }

    // Bind "done" and "select" checkboxes
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
      };
    }

    // Toggle states of multi-choice buttons
    function selectTaskEvent(task){
      var tasks = TaskList.getTasks();
      var index = TaskList.getIndex(task.dataset.todoid);
      var toDo = new TaskList.task(tasks[index].title, tasks[index].labels, tasks[index].done, tasks[index].id, task.checked);
      TaskList.addItem(toDo);

      var rowSelected = false;
      for (var i = 0; i < tasks.length; i++) {
        if (tasks[i].selected === true){
          rowSelected = true;
          break;
        }
      }

      if(rowSelected){
        deleteButton.classList.remove('disabled');
        markSelectedAsDone.classList.remove('disabled');
      }else{
        deleteButton.classList.add('disabled');
        markSelectedAsDone.classList.add('disabled');
      }
    }

    // Save task as marked as done (triggered when checkbox is ticked)
    function markAsDoneEvent(task){
      var tasks = TaskList.getTasks(),
          index = TaskList.getIndex(task.dataset.todoid),
          toDo = new TaskList.task(tasks[index].title, tasks[index].labels, task.checked, tasks[index].id, tasks[index].selected);

      TaskList.addItem(toDo);
    }
  }

  function toggleEditTask(task){
    var saveButton = task.getElementsByClassName('btn-save-task')[0],
        cancelButton = task.getElementsByClassName('btn-cancel-task')[0],
        tasksEditing = document.getElementsByClassName('task-edit'),
        taskLabels = document.getElementsByClassName('task-label');

    // Remove edit-state of other tasks
    for (var i = 0; i < taskLabels.length; i++) {
      taskLabels[i].classList.add('disabled');
    }

    for (var i = 0; i < tasksEditing.length; i++) {
      var inputField = tasksEditing[i].getElementsByClassName('task-row-title')[0];
      inputField.disabled = true;
      inputField.blur();
      tasksEditing[i].classList.remove('task-edit');
      hookEvents();
    }


    // Add edit state to current task
    task.classList.add('task-edit', 'js-editTask');
    var inputField = task.getElementsByClassName('task-row-title')[0],
        taskLabels = task.getElementsByClassName('task-label');
    for (var i = 0; i < taskLabels.length; i++) {
      taskLabels[i].classList.remove('disabled');
    }

    // Bind cancel button
    cancelButton.onclick = function(){
      task.classList.remove('task-edit');
      hookEvents();
    };

    // Save button
    saveButton.onclick = function(){
      FormField.postItem(task);
      task.classList.remove('task-edit');
      hookEvents();
    };

    // Unbind click event on the row that is being edited
    var taskRows = document.getElementsByClassName('task-edit');
    for (var i = 0; i < taskRows.length; i++) {
      taskRows[i].onclick = null;
    }

    inputField.disabled = false;

    // Bind [ENTER]
    inputField.onkeypress = function(e){
      if(e.keyCode === 13){
        FormField.postItem(this);
      }
    };

    inputField.focus();

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
      if(!tasks.length){
        taskList.innerHTML = '<li class="text-center"><p class="text-faded">No tasks registered. Go ahead and add some!</p></li>';
        return false;
      }

      document.getElementById('selectAll').classList.remove('disabled');

      for (var i = 0; i < tasks.length; i++) {

        // Loop tasks and create an object that we can append to our list
        var taskId = tasks[i].id,
            taskTitle = tasks[i].title,
            taskLabels = tasks[i].labels,
            taskDone = tasks[i].done,
            taskSelected = tasks[i].selected,
            taskDoneChecked = '',
            taskSelectedChecked = '',
            filtered = '',
            editTaskState = 'disabled';

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
          editTaskState = '';
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
                      +'<div class="col-2-4 flex-vertical-center-children">'
                      +'<input name="toDo-select" '+ taskSelectedChecked +' type="checkbox" id="task-'+ taskId +'" class="toDo-checkBox hidden" data-todoid="'+ taskId +'"/>'
                      +'<textarea rows="2" class="js-editTask task-row-title" disabled data-todoid="'+ taskId +'">'+ taskTitle +'</textarea>'
                      +'</div><div class="col-2-4 flex-vertical-center-children">'
                      +'<ul class="list-inline list-unstyled task-labels col-2-4" id="task-labels-'+ taskId +'"></ul>'
                      +'<ul class="list-inline list-unstyled">'
                      +'<li>'
                      +'<button class="btn btn-bordered btn-md btn-edit-task '+ editTaskState +'" data-taskid="'+ taskId +'">Edit task</button>'
                      +'<button class="btn btn-bordered btn-md btn-grey btn-cancel-task" data-taskid="'+ taskId +'">Cancel</button>'
                      +'<button class="btn btn-bordered btn-success btn-md btn-save-task" data-taskid="'+ taskId +'">Save task</button>'
                      +'</li><li>'
                      +'<input name="toDo-done" data-todoid="'+ taskId +'" type="checkbox" '+ taskDoneChecked +' class="toDo-done toDo-checkBox hidden" data-todoid="'+ taskId +'" id="task-'+ taskId  +'-done"/>'
                      +'<label for="task-'+ taskId  +'-done" class="pull-right">'+ svgCheck +'</label>'
                      +'</li>'
                      +'</ul>'
                      +'</div></li>';

        taskList.innerHTML += taskItem;


        // Create list of labels that are attached to the task and append it to the DOM.
        var allTaskLabels = TaskList.getLabels;
        var taskLabelsList = document.getElementById('task-labels-'+taskId);
        var taskLabelsStr = '';

        for (var z = 0; z < allTaskLabels.length; z++) {
          var labelClass = '';

          if(taskLabels.indexOf(allTaskLabels[z]) > -1){
            labelClass = 'label-selected';
          }else{
            labelClass = 'disabled';
          }


          taskLabelsStr += '<li class="label label-sm task-label ' + labelClass + ' label-'+ allTaskLabels[z].toString().replace(' ','') +'" data-labeltitle="' + allTaskLabels[z] + '">'+ allTaskLabels[z] +'</li>';
        }

        taskLabelsList.innerHTML += taskLabelsStr;

      }

    }

    // Re-do the bindings after our new elements has been added to the DOM.
    hookEvents();

  }

  return {
    submitButton : submitBtn,
    inputField : inputField,
    init : init,
    updateToDoList : updateToDoList,
    getSelectedLabels : getSelectedLabels,
    labelsList : labelsList
  };

})();


// Lift off!
Main.init();
