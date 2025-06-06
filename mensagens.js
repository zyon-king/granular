/**
 * Criar os elementos HTML do popup dinamicamente 
 * dentro da função showCustomPopup usando JavaScript. 
 * Podendo ser útil para incluir o HTML do popup em todas as páginas.
 */
function showCustomPopup(type, icon, title, message, buttons) {
  const popup = document.createElement('div');
  popup.classList.add('popup');

  const content = document.createElement('div');
  content.classList.add('popup-content');
  popup.appendChild(content);

  const iconEl = document.createElement('span');
  iconEl.textContent = icon;
  content.appendChild(iconEl);

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
    buttonEl.classList.add(button.class);
    buttonEl.addEventListener('click', () => {
      if (button.callback) {
        button.callback();
      }
      popup.remove();
    });
    buttonsEl.appendChild(buttonEl);
  });

  document.body.appendChild(popup);
}

/**
 * Três tipos de mensagens (erro, confirmação e sucesso), 
 * provavelmente cobre os principais casos de uso 
 * para mensagens na aplicação.
 */
function showError(message) {
  showCustomPopup('error', '', 'Erro', message, [
    { text: 'OK', class: 'popup-btn popup-btn-error', callback: null }
  ]);
}

function showConfirmation(message, callbackSim, callbackNao) {
  showCustomPopup('confirmation', '', 'Confirmação', message, [
    { text: 'Sim', class: 'popup-btn popup-btn-confirmation', callback: callbackSim },
    { text: 'Não', class: 'popup-btn popup-btn-confirmation', callback: callbackNao }
  ]);
}

function showSuccess(message) {
  showCustomPopup('success', '', 'Sucesso', message, [
    { text: 'OK', class: 'popup-btn popup-btn-success', callback: null }
  ]);
}
