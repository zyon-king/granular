/**Observações sobre a modificação do `notificacoes.js`:**

* Adicionei `window.notificacoesReady = new Promise(resolve => { resolve(); });` 
no final. Isso cria uma Promise global que é resolvida imediatamente após 
o script ser totalmente `eval`uado e suas funções definidas.
* Comentei o `domReady` e `initializeApp` no final do `notificacoes.js`. 
A lógica de inicialização e chamadas de teste será movida para o seu 
HTML principal para garantir que tudo esteja pronto.
* Adicionei uma verificação `if (mensagemElement)` dentro de `showMessage` 
porque `mensagemElement` pode ser `null` se `notificacoes.js` for 
avaliado antes do DOM estar completamente carregado.*/


function showCustomPopup(type, icon, title, message, buttons) {
  const popup = document.createElement('div');
  popup.classList.add('popup');

  const content = document.createElement('div');
  if (type === 'error') {
    content.classList.add('popup-content', 'error');
  } else if (type === 'confirmation') {
    content.classList.add('popup-content', 'confirm');
  } else {
    content.classList.add('popup-content', 'success');
  }

  popup.appendChild(content);

  if (icon) {
    const iconEl = document.createElement('span');
    iconEl.classList.add('popup-icon');
    iconEl.innerHTML = icon;
    content.appendChild(iconEl);
  }

  const titleEl = document.createElement('h2');
  titleEl.textContent = title;
  content.appendChild(titleEl);

  const messageEl = document.createElement('p');
  messageEl.textContent = message;
  content.appendChild(messageEl);

  const buttonsEl = document.createElement('div');
  buttonsEl.classList.add('popup-buttons');
  content.appendChild(buttonsEl);

  buttons.forEach(button => {
    const buttonEl = document.createElement('button');
    buttonEl.textContent = button.text;
    buttonEl.classList.add('popup-btn', 'popup-btn-primary');
    buttonEl.addEventListener('click', () => {
      if (button.callback) {
        button.callback();
      }
      popup.classList.add('fade-out');
      setTimeout(() => {
        popup.remove();
      }, 500);
    });
    buttonsEl.appendChild(buttonEl);
  });

  popup.addEventListener('click', (e) => {
    if (e.target === popup) {
      popup.classList.add('fade-out');
      setTimeout(() => {
        popup.remove();
      }, 500);
    }
  });

  document.body.appendChild(popup);
}

function showConfirm(message, callbackSim, callbackNao) {
  showCustomPopup('confirmation', '❓', 'Confirmação', message, [
    { text: 'Sim', callback: callbackSim },
    { text: 'Não', callback: callbackNao }
  ]);
}

function showSuccess(message) {
  showCustomPopup('success', '✅', 'Sucesso', message, [
    { text: 'OK', callback: null }
  ]);
}

function showError(message) {
  showCustomPopup('error', '⚠️', 'Alerta', message, [
    { text: 'OK', callback: null }
  ]);
}

const mensagemElement = document.getElementById('mensagem'); // Pode ser null se o script for avaliado antes do DOM estar pronto

function showMessage(text, className = '') {
  // Verificação para garantir que mensagemElement existe
  if (mensagemElement) {
    mensagemElement.innerHTML = text;
    mensagemElement.className = className;
  } else {
    console.warn("Elemento 'mensagem' não encontrado. Mensagem: " + text);
  }
}

function showInitialMessage() {
  showError("Por favor, sempre permita as notificações para não perder alertas importantes!");
}

function isNotificationSupported() {
  return "Notification" in window;
}

function isPermissionGranted() {
  return Notification.permission === "granted";
}

function isPermissionDenied() {
  return Notification.permission === "denied";
}

function isIncognitoMode() {
  try {
    window.localStorage.setItem('test', 'test');
    window.localStorage.removeItem('test');
    return false;
  } catch (e) {
    return true;
  }
}

async function initializeApp() {
  try {
    await askForNotificationPermissionAsync();
    showInitialMessage();
    runTests();
  } catch (error) {
    showError("Erro ao inicializar: " + error.message);
  }
}

function askForNotificationPermissionAsync() {
  return new Promise((resolve, reject) => {
    if (!isNotificationSupported()) {
      showError("Seu navegador não suporta notificações.");
      return reject(new Error("Notificações não suportadas"));
    }

    if (isIncognitoMode()) {
      showError("Notificações não funcionam na aba anônima.");
      return reject(new Error("Modo anônimo detectado"));
    }

    if (isPermissionGranted()) {
      showSuccess("Notificações foram permitidas!");
      return resolve("granted");
    }

    if (isPermissionDenied()) {
      showError("Permissão negada anteriormente. Notificações não funcionarão.");
      return reject(new Error("Permissão negada"));
    }

    Notification.requestPermission()
      .then(permission => {
        if (permission === "granted") {
          showSuccess("Notificações ativadas com sucesso!");
          resolve(permission);
        } else {
          showError("Permissão negada. Verifique as configurações do navegador.");
          reject(new Error("Permissão negada"));
        }
      })
      .catch(err => {
        showError("Erro ao solicitar permissão: " + err.message);
        reject(err);
      });
  });
}

function runTests() {
  console.log("Testes unitários:");
  console.log("isNotificationSupported():", isNotificationSupported());
  console.log("isPermissionGranted():", isPermissionGranted());
  console.log("isPermissionDenied():", isPermissionDenied());
  console.log("isIncognitoMode():", isIncognitoMode());
}

// Adicionando um mecanismo de 'ready' para o script de notificações
window.notificacoesReady = new Promise(resolve => {
    // Quando o script termina de ser avaliado, ele se resolve
    // Isso garante que todas as funções declaradas nele estejam disponíveis.
    resolve(); 
});

// A inicialização dos testes e do app deve ser movida para o HTML ou para uma função
// que o HTML chama quando o DOM estiver pronto E as notificações estiverem prontas.
// Assim, initializeApp não é chamado prematuramente aqui.
// (async () => {
//   await domReady();
//   await initializeApp();
// })();

