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

const mensagemElement = document.getElementById('mensagem');

function showMessage(text, className = '') {
  mensagemElement.innerHTML = text;
  mensagemElement.className = className;
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

function domReady() {
  return new Promise(resolve => {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", resolve);
    } else {
      resolve();
    }
  });
}

(async () => {
  await domReady();
  await initializeApp();
})();
