const mensagemElement = document.getElementById('mensagem');

/**
 * Mostra uma mensagem na tela.
 * @param {string} text - A mensagem a ser mostrada.
 * @param {string} className - A classe CSS a ser aplicada à mensagem.
 */
function showMessage(text, className = '') {
    mensagemElement.innerHTML = text;
    mensagemElement.className = className;
}

/**
 * Mostra uma mensagem de confirmação.
 * @param {string} message - A mensagem a ser mostrada.
 */
function showConfirm(message) {
    showMessage(message);
}

/**
 * Mostra uma mensagem de sucesso.
 * @param {string} message - A mensagem a ser mostrada.
 */
function showSuccess(message) {
    showMessage(message, 'success');
}

/**
 * Mostra uma mensagem de erro.
 * @param {string} message - A mensagem a ser mostrada.
 */
function showError(message) {
    showMessage(message, 'error');
}

/**
 * Mostra a mensagem inicial para solicitar permissão para notificações.
 */
function showInitialMessage() {
    showConfirm("Por favor, permita as notificações para não perder alertas importantes!");
}

// Adicionar evento de clique ao botão de teste
document.addEventListener('DOMContentLoaded', function() {
    const botaoTeste = document.getElementById('teste-notificacao');
    if (botaoTeste) {
        botaoTeste.addEventListener('click', () => {
            if (isPermissionGranted()) {
                new Notification('Notificação de teste', {
                    body: 'Essa é uma notificação de teste!',
                    // icon: 'icone.png' // opcional
                });
            } else {
                showError("Permissão para notificações não foi concedida.");
            }
        });
    }
});

/**
 * Verifica se o navegador suporta notificações.
 * @returns {boolean} True se o navegador suporta notificações, false caso contrário.
 */
function isNotificationSupported() {
    return "Notification" in window;
}

/**
 * Verifica se a permissão para notificações foi concedida.
 * @returns {boolean} True se a permissão foi concedida, false caso contrário.
 */
function isPermissionGranted() {
    return Notification.permission === "granted";
}

/**
 * Verifica se a permissão para notificações foi negada.
 * @returns {boolean} True se a permissão foi negada, false caso contrário.
 */
function isPermissionDenied() {
    return Notification.permission === "denied";
}

/**
 * Verifica se o usuário está na aba anônima.
 * @returns {boolean} True se o usuário está na aba anônima, false caso contrário.
 */
function isIncognitoMode() {
    try {
        // Testa se o armazenamento local está disponível
        window.localStorage.setItem('test', 'test');
        window.localStorage.removeItem('test');
        return false;
    } catch (e) {
        // Se ocorrer um erro, provavelmente está na aba anônima
        return true;
    }
}

/**
 * Solicita permissão para notificações ao usuário.
 */
function askForNotificationPermission() {
    if (!isNotificationSupported()) {
        showError("Seu navegador não suporta notificações.");
        return;
    }

    if (isIncognitoMode()) {
        showError("Notificações não funcionam na aba anônima.");
        return;
    }

    if (isPermissionGranted()) {
        showSuccess("Notificações foram permitidas!");
        return;
    }

    if (isPermissionDenied()) {
        showError("Permissão já foi negada anteriormente. Você não receberá notificações. Dica: notificações não são permitidas no modo de navegação anônima.");
        return;
    }
    
    try {
        Notification.requestPermission().then(permission => {
            if (permission === "granted") {
                showSuccess("Notificações ativadas com sucesso! Você receberá atualizações importantes.");
            } else {
                showError("Permissão negada. Você não receberá notificações. Por favor, verifique as configurações do seu navegador.");
            }
        });
    } catch (error) {
        showError("Erro ao solicitar permissão: " + error.message);
    }
}

// Testes unitários
function runTests() {
    console.log("Testes unitários:");
    console.log("isNotificationSupported():", isNotificationSupported());
    console.log("isPermissionGranted():", isPermissionGranted());
    console.log("isPermissionDenied():", isPermissionDenied());
    console.log("isIncognitoMode():", isIncognitoMode());
}

// Solicitar permissão quando a página for carregada
window.addEventListener('load', () => {
    showInitialMessage();
    askForNotificationPermission();
    runTests();
});
