function testarNotificacao() {
  if (!('Notification' in window)) {
    alert('Este navegador não suporta notificações.');
    return;
  }

  if (Notification.permission === 'granted') {
    new Notification('Notificação de teste', {
      body: 'Essa é uma notificação de teste!'
    });
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission().then(function(permission) {
      if (permission === 'granted') {
        new Notification('Notificação de teste', {
          body: 'Essa é uma notificação de teste!'
        });
      } else {
        alert('Permissão de notificação negada.');
      }
    });
  } else {
    alert('Permissão de notificação negada.');
  }
}
