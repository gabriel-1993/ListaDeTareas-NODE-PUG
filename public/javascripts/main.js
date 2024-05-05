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