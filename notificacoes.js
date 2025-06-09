function testarNotificacao() {
  if (!("Notification" in window)) {
    alert("Seu navegador não suporta notificações.");
    return;
  }

  if (Notification.permission === "granted") {
    new Notification("Notificação de teste", {
      body: "Essa é uma notificação simples de teste!"
    });
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then(permission => {
      if (permission === "granted") {
        new Notification("Notificação ativada", {
          body: "Você ativou as notificações com sucesso."
        });
      } else {
        alert("Permissão negada.");
      }
    });
  } else {
    alert("As notificações foram bloqueadas. Verifique as configurações do navegador.");
  }
}

// Torna a função acessível globalmente
window.testarNotificacao = testarNotificacao;
