var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');

const LISTA_JSON_PATH = path.join(__dirname, '../lista.json');

/* GET home page. */
router.get('/', function(req, res, next) {
  // Verificar y crear lista.json si no existe o está vacío
  if (!fs.existsSync(LISTA_JSON_PATH) || fs.readFileSync(LISTA_JSON_PATH, 'utf8').trim() === '') {
    // Inicializar lista.json con una estructura vacía
    fs.writeFileSync(LISTA_JSON_PATH, JSON.stringify({ tasks: [] }), 'utf8');
  }

  // Leer datos de lista.json
  fs.readFile(LISTA_JSON_PATH, 'utf8', function(err, data) {
    if (err) {
      handleFileReadError(res, err);
      return;
    }

    try {
      var todoList = JSON.parse(data);

      if (!todoList || !Array.isArray(todoList.tasks)) {
        todoList = { tasks: [] };
      }

      res.render('index', { title: 'ToDo List', tasks: todoList.tasks });
    } catch (error) {
      handleError(res, error);
    }
  });
});

/* POST route to add a new task */
// router.post('/add', function(req, res, next) {
//   var newTaskTitle = req.body.taskTitle;

//   // Leer datos de lista.json
//   fs.readFile(LISTA_JSON_PATH, 'utf8', function(err, data) {
//     if (err) {
//       handleFileReadError(res, err);
//       return;
//     }

//     try {
//       var todoList = JSON.parse(data);

//       if (!todoList || !Array.isArray(todoList.tasks)) {
//         todoList = { tasks: [] };
//       }

//       // Verificar si la tarea ya existe
//       var existingTask = todoList.tasks.find(task => task.title.toLowerCase() === newTaskTitle.toLowerCase());
//       if (existingTask) {
//         console.log('Tarea existente encontrada:', existingTask);
//         return res.render('index', { title: 'ToDo List', tasks: todoList.tasks, errorMessage: '¡La tarea ya existe en la lista!' });
//       }

//       // Crear nueva tarea
//       var newTask = {
//         id: todoList.tasks.length + 1,
//         title: newTaskTitle,
//         completed: false
//       };

//       // Agregar la nueva tarea a la lista
//       todoList.tasks.push(newTask);

//       // Guardar la lista actualizada en lista.json
//       fs.writeFile(LISTA_JSON_PATH, JSON.stringify(todoList, null, 2), function(err) {
//         if (err) {
//           handleError(res, err);
//           return;
//         }
//         // Redireccionar a la página principal después de agregar la tarea
//         res.redirect('/');
//       });
//     } catch (error) {
//       handleError(res, error);
//     }
//   });
// });

router.post('/add', function(req, res, next) {
  var newTaskTitle = req.body.taskTitle;

  fs.readFile(LISTA_JSON_PATH, 'utf8', function(err, data) {
    if (err) {
      handleFileReadError(res, err);
      return;
    }

    try {
      var todoList = JSON.parse(data);

      if (!todoList || !Array.isArray(todoList.tasks)) {
        todoList = { tasks: [] };
      }

      // Verificar si la tarea ya existe en la lista
      var existingTask = todoList.tasks.find(task => task.title.toLowerCase() === newTaskTitle.toLowerCase());

      if (existingTask) {
        // Si la tarea ya existe, renderizar la página con un mensaje de error
        res.render('index', { title: 'ToDo List', tasks: todoList.tasks, errorMessage: '¡La tarea ya existe en la lista!' });
        return; // Salir de la función para evitar agregar la tarea duplicada
      }

      // Crear nueva tarea con un ID único
      var newTask = {
        id: todoList.tasks.length > 0 ? todoList.tasks[todoList.tasks.length - 1].id + 1 : 1,
        title: newTaskTitle,
        completed: false
      };

      // Agregar la nueva tarea a la lista
      todoList.tasks.push(newTask);

      // Guardar la lista actualizada en lista.json
      fs.writeFile(LISTA_JSON_PATH, JSON.stringify(todoList, null, 2), function(err) {
        if (err) {
          handleError(res, err);
          return;
        }
        // Redireccionar a la página principal después de agregar la tarea
        res.redirect('/');
      });
    } catch (error) {
      handleError(res, error);
    }
  });
});


// Ruta para marcar una tarea como completada
router.post('/complete/:taskId', function(req, res) {
  const taskId = req.params.taskId;

  // Leer el archivo lista.json y realizar los cambios necesarios
  fs.readFile(LISTA_JSON_PATH, 'utf8', function(err, data) {
    if (err) {
      console.error('Error reading todo list:', err);
      res.status(500).send('Error reading todo list');
      return;
    }

    try {
      var todoList = JSON.parse(data);

      // Encontrar la tarea por su ID
      var taskToUpdate = todoList.tasks.find(task => task.id === parseInt(taskId));

      if (taskToUpdate) {
        // Cambiar el estado de la tarea
        taskToUpdate.completed = !taskToUpdate.completed;

        // Guardar la lista actualizada en lista.json
        fs.writeFile(LISTA_JSON_PATH, JSON.stringify(todoList, null, 2), function(err) {
          if (err) {
            console.error('Error updating todo list:', err);
            res.status(500).send('Error updating todo list');
          } else {
            res.json({ success: true });
          }
        });
      } else {
        res.status(404).send('Task not found');
      }
    } catch (error) {
      console.error('Error parsing JSON:', error);
      res.status(500).send('Error parsing todo list');
    }
  });
});

// Ruta para eliminar una tarea por ID

router.delete('/delete/:taskId', function(req, res, next) {
  var taskId = req.params.taskId;
  fs.readFile(LISTA_JSON_PATH, 'utf8', function(err, data) {
    if (err) {
      handleError(res, err);
      return;
    }

    try {
      var todoList = JSON.parse(data);
      if (!todoList || !Array.isArray(todoList.tasks)) {
        handleError(res, 'No tasks found to delete.');
        return;
      }

      // Find the task by ID and remove it
      todoList.tasks = todoList.tasks.filter(task => task.id !== parseInt(taskId));

      // Save the updated task list back to the file
      fs.writeFile(LISTA_JSON_PATH, JSON.stringify(todoList, null, 2), function(err) {
        if (err) {
          handleError(res, err);
          return;
        }
        res.status(200).json({ success: true });
      });
    } catch (error) {
      handleError(res, error);
    }
  });
});

function handleError(res, error) {
  console.error('Error:', error);
  res.status(500).send('Error occurred');
}

function handleFileReadError(res, err) {
  console.error(err);
  res.status(500).send('Error reading todo list');
}

module.exports = router;