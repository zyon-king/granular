// alarm-clock.js
// Script combinado para funcionalidades de pop-up, notificação e despertador

// === FUNÇÕES DE POP-UP E MENSAGEM (Adaptadas do seu notificacoes.js) ===
const mensagemElement = document.getElementById('mensagem'); // Assume que #mensagem existe ou será criado dinamicamente

function showCustomPopup(type, icon, title, message, buttons) {
  const popup = document.createElement('div');
  popup.classList.add('popup');

  const content = document.createElement('div');
  if (type === 'error') {
    content.classList.add('popup-content', 'error');
  } else if (type === 'confirmation') {
    content.classList.add('popup-content', 'confirm');
  } else { // 'success' ou padrão
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

// showMessage já existe no notificacoes.js original e usa #mensagem
function showMessage(text, className = '') {
    if (mensagemElement) { // Verifica se o elemento existe
        mensagemElement.innerHTML = text;
        mensagemElement.className = className;
    } else {
        console.warn("#mensagem element not found. Message: " + text);
    }
}

// === FUNÇÕES DE NOTIFICAÇÃO (originalmente showDesktopNotification) ===
/**
 * Solicita permissão ao usuário para exibir notificações desktop e as exibe.
 * @param {string} title - O título da notificação.
 * @param {string} body - O corpo (conteúdo) da notificação.
 */
function sendDesktopNotification(title, body) { // Renomeado para evitar conflito de nomes se showDesktopNotification existisse
    if (!("Notification" in window)) {
        showError("Seu navegador não suporta notificações desktop.");
        return;
    }

    if (Notification.permission === "granted") {
        new Notification(title, { body: body });
    } else if (Notification.permission === "denied") {
        showError("Permissão para notificações negada. Não é possível exibir.");
    } else {
        Notification.requestPermission().then(permission => {
            if (permission === "granted") {
                new Notification(title, { body: body });
            } else if (permission === "denied") {
                showError("Permissão para notificações negada. Não é possível exibir.");
            }
        }).catch(error => {
            showError("Erro ao solicitar permissão para notificações: " + error.message);
        });
    }
}

// === FUNÇÕES DE PERMISSÃO (Adaptadas do seu notificacoes.js) ===
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

async function askForNotificationPermissionAsync() {
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

// === LÓGICA DO DESPERTADOR (adaptada para usar as novas funções) ===
const alarmTimeInput = document.getElementById('alarmTime');
const setAlarmButton = document.getElementById('setAlarmButton');
const statusMessage = document.getElementById('status-message');
const currentTimeDisplay = document.getElementById('current-time');

let alarmSet = false;
let alarmHour;
let alarmMinute;
let intervalId;

function updateCurrentTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    currentTimeDisplay.textContent = `Hora atual: ${hours}:${minutes}:${seconds}`;

    if (alarmSet && now.getHours() === alarmHour && now.getMinutes() === alarmMinute && now.getSeconds() === 0) {
        triggerAlarm();
        clearInterval(intervalId);
        alarmSet = false;
        statusMessage.textContent = 'Alarme disparado!';
        setAlarmButton.textContent = 'Definir Alarme';
    }
}

function setAlarm() {
    const timeValue = alarmTimeInput.value;
    if (!timeValue) {
        showError('Por favor, defina uma hora para o alarme.'); // Usando showError
        return;
    }

    const [hour, minute] = timeValue.split(':').map(Number);

    alarmHour = hour;
    alarmMinute = minute;
    alarmSet = true;
    
    const formattedAlarmTime = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    statusMessage.textContent = `Alarme definido para ${formattedAlarmTime}`;
    setAlarmButton.textContent = 'Alarme Definido (Clique para Cancelar)';

    if (intervalId) {
        clearInterval(intervalId);
    }
    intervalId = setInterval(updateCurrentTime, 1000);

    updateCurrentTime();

    // Dispara a notificação de confirmação usando a função de notificação combinada
    if (isPermissionGranted()) { // Verifica a permissão antes de tentar enviar
        sendDesktopNotification("⏰ Alarme Definido!", `Seu alarme foi configurado para: ${formattedAlarmTime}`);
    } else {
        showConfirm("Permissão de notificação não concedida.", () => {
            askForNotificationPermissionAsync().then(() => {
                if (isPermissionGranted()) {
                    sendDesktopNotification("⏰ Alarme Definido!", `Seu alarme foi configurado para: ${formattedAlarmTime}`);
                }
            }).catch(() => {
                // Permissão não concedida, nenhuma notificação será enviada
            });
        }, () => {
            // Usuário clicou em Não, nenhuma ação
        });
    }
}

function triggerAlarm() {
    sendDesktopNotification( // Usando a nova função sendDesktopNotification
        "🔔 Despertador!",
        "A hora que você definiu chegou: " + String(alarmHour).padStart(2, '0') + ":" + String(alarmMinute).padStart(2, '0')
    );

    const audio = new Audio('https://www.soundjay.com/buttons/beep-07.mp3');
    audio.play().catch(e => console.error("Erro ao tocar áudio:", e));

    setTimeout(() => {
        audio.pause();
        audio.currentTime = 0;
    }, 5000);
}

setAlarmButton.addEventListener('click', () => {
    if (alarmSet) {
        clearInterval(intervalId);
        alarmSet = false;
        statusMessage.textContent = 'Alarme cancelado.';
        setAlarmButton.textContent = 'Definir Alarme';
        showConfirm("Alarme cancelado com sucesso.");
    } else {
        setAlarm();
    }
});

// Inicialização (simulando o final do seu notificacoes.js)
// Função para esperar o DOM
function domReady() {
    return new Promise(resolve => {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", resolve);
        } else {
            resolve();
        }
    });
}

// Função de inicialização principal
async function initializeApp() {
    // Definir a hora atual como padrão no input ao carregar a página
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    if (alarmTimeInput) { // Verifica se o input existe antes de atribuir
        alarmTimeInput.value = `${hours}:${minutes}`;
    }
    updateCurrentTime(); // Exibe a hora atual imediatamente

    // Solicitar permissão de notificação ao iniciar
    try {
        await askForNotificationPermissionAsync();
        showSuccess("Despertador pronto para uso!"); // Usando showSuccess
    } catch (error) {
        showError("Problemas com permissão de notificação. " + error.message); // Usando showError
    }
}

// Executa a inicialização após o DOM estar pronto
(async () => {
    await domReady();
    await initializeApp();
})();
