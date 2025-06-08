/*<body>
	<div id='test-buttons'>
		<button id="testar-sucesso">Testar Sucesso</button>
		<button id="testar-confirmacao">Testar Confirmação</button>
		<button id="testar-erro">Testar Erro</button>
	</div>

<script>*/
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
          
		  // Adicionar evento de clique nos botões
		  buttons.forEach(button => {
		      const buttonEl = document.createElement('button');
		      buttonEl.textContent = button.text;
		      buttonEl.classList.add('popup-btn', 'popup-btn-primary');
		      buttonEl.addEventListener('click', () => {
		          if (button.callback) {
		              button.callback();
		          }
		          // Adicionar classe fade-out e remover o popup após a animação
		          popup.classList.add('fade-out');
		          setTimeout(() => {
		              popup.remove();
		          }, 500); // tempo da animação em milissegundos
		      });
		      buttonsEl.appendChild(buttonEl);
		  });
		  
		  // Permitir que os popups sejam fechados clicando fora
		  popup.addEventListener('click', (e) => {
		      if (e.target === popup) {
		          popup.classList.add('fade-out');
		          setTimeout(() => {
		              popup.remove();
		          }, 500); // tempo da animação em milissegundos
		      }
		  });
		
		  document.body.appendChild(popup);
		}

        function showConfirmation(message, callbackSim, callbackNao) {
		  showCustomPopup('confirmation', '❓', 'Confirmação', message, [
		    { text: 'Sim', class: 'popup-btn popup-btn-confirmation', callback: callbackSim },
		    { text: 'Não', class: 'popup-btn popup-btn-confirmation', callback: callbackNao }
		  ]);
		}      
        
        function showSuccess(message) {
		  showCustomPopup('success', '✅', 'Sucesso', message, [
		    { text: 'OK', class: 'popup-btn popup-btn-success', callback: null }
		  ]);
		}
		
        function showError(message) {
		  showCustomPopup('error', '❌', 'Erro', message, [
		    { text: 'OK', class: 'popup-btn popup-btn-error', callback: null }
		  ]);
		}
           
        // Testes
		
        document.getElementById('testar-sucesso').addEventListener('click', function() {
		    showSuccess("Ação realizada com sucesso!");
		});

        document.getElementById('testar-confirmacao').addEventListener('click', function() {
             showConfirmation("Vê  uma mensagem de Confirmação?");
        });       
        		
        document.getElementById('testar-erro').addEventListener('click', function() {
		    showError("Ocorreu um erro!");
		});
        
/*</script>
</body>*/
