/**
 * Criar os elementos HTML do popup dinamicamente 
 * dentro da função showCustomPopup usando JavaScript. 
 * Podendo ser útil para incluir o HTML do popup em todas as páginas.
 */
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

  if (Array.isArray(buttons)) {
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
  } else {
    console.error('O parâmetro buttons deve ser um array.');
  }

  // Permitir que os popups sejam fechados clicando fora
  popup.addEventListener('click', (e) => {
    if (e.target === popup) {
      popup.remove();
    }
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
  if (typeof callbackSim !== 'function' || typeof callbackNao !== 'function') {
    console.error('Os parâmetros callbackSim e callbackNao devem ser funções.');
    return;
  }
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
