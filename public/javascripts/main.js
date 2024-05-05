// TOGGLE PARA CAMBIAR ESTADO DE UNA TAREA : PENDIENTE/FINALIZADA
document.querySelectorAll('.toggle-icon').forEach(function(icon) {
    icon.addEventListener('click', function() {
      const taskId = icon.dataset.taskId;
  
      // Realizar una solicitud POST al servidor para marcar la tarea como completada
      fetch(`/complete/${taskId}`, {
        method: 'POST'
      })
      .then(response => response.json())
      .then(data => {
        // Manejar la respuesta del servidor si es necesario
        if (data.success) {
          // Recargar la página después de completar la tarea (opcional)
          window.location.reload();
        }
      })
      .catch(error => {
        console.error('Error marking task as completed:', error);
      });
    });
  });


  // Función para eliminar una tarea
const deleteTask = async (taskId) => {
  try {
    const response = await fetch(`/delete/${taskId}`, {
      method: 'DELETE'
    });

    if (response.ok) {
      // Recargar la página después de eliminar la tarea
      window.location.reload();
    } else {
      console.error('Failed to delete task:', response.statusText);
    }
  } catch (error) {
    console.error('Error deleting task:', error);
  }
};

// Enviar datos del formulario al backend
const form = document.querySelector('.formAgregar');
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const taskTitle = form.querySelector('input[name="taskTitle"]').value;
  const taskDeadline = form.querySelector('input[name="taskDeadline"]').value;

  // Obtener la fecha actual en formato YYYY-MM-DD
  const today = new Date().toISOString().split('T')[0];

  if (taskDeadline < today) {
    alert('La fecha límite no puede ser anterior al día actual.');
    return;
  }

  try {
    const response = await fetch('/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ taskTitle, taskDeadline })
    });

    if (response.ok) {
      window.location.reload(); // Recargar la página después de agregar la tarea
    } else {
      console.error('Error al agregar tarea');
    }
  } catch (error) {
    console.error('Error:', error);
  }
});

