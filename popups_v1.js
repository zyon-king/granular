        /**
         * Criar os elementos HTML do popup dinamicamente
         * dentro da função showCustomPopup usando JavaScript.
         * Podendo ser útil para incluir o HTML do popup em todas as páginas.
         */
        function showCustomPopup(type, icon, title, message, buttons) {
            const popup = document.createElement('div');
            popup.classList.add('popup');

            const content = document.createElement('div');
            // Aplica as classes de tipo (error, success, confirm)
            if (type === 'error') {
                content.classList.add('popup-content', 'error');
            } else if (type === 'confirmation') {
                content.classList.add('popup-content', 'confirm');
            } else { // default to success
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
                // Os botões agora sempre terão a classe 'popup-btn' e 'popup-btn-primary'
                // A cor do botão será definida pelo CSS com base no tipo de popup
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

            // Permitir que os popups sejam fechados clicando fora
            popup.addEventListener('click', (e) => {
                // Verifica se o clique foi diretamente no overlay do popup, e não no conteúdo
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
                { text: 'OK', callback: null } // Callback nulo para apenas fechar
            ]);
        }

        function showError(message) {
            showCustomPopup('error', '⚠️', 'Alerta', message, [
                { text: 'OK', callback: null } // Callback nulo para apenas fechar
            ]);
        }

        // Testes
        document.getElementById('testar-sucesso').addEventListener('click', function() {
            showSuccess("Ação realizada com sucesso!");
        });

        document.getElementById('testar-confirmacao').addEventListener('click', function() {
            showConfirm("Você vê uma mensagem de Confirmação?",
            function() {
                showSuccess("Você clicou em Sim!");
            },
            function() {
                showError("Você clicou em Não!");
            });
        });

        document.getElementById('testar-erro').addEventListener('click', function() {
            showError("Ocorreu um erro!");
        });

      // --------------- notificacao navegador --------------- //
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
       * Mostra a mensagem inicial para solicitar permissão para notificações.
       */
      function showInitialMessage() {
          showError("Por favor, sempre permita as notificações para não perder alertas importantes!");
      }

      // Adicionar evento de clique ao botão de teste
      document.getElementById('teste-notificacao').addEventListener('click', function() {
          if (isPermissionGranted()) {
              new Notification('Notificação de teste', {
                  body: 'Essa é uma notificação de teste!',
                  // icon: 'icone.png' // opcional
              });
          } else {
              askForNotificationPermission();
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
          askForNotificationPermission();
          showInitialMessage();
          runTests();
      });
