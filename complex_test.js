// complex_test.js

function updatePageContent(message, color) {
    // Tenta encontrar um elemento com o ID 'dynamic-content'
    const contentElement = document.getElementById('dynamic-content');

    if (contentElement) {
        // Se o elemento existe, atualiza seu texto e cor
        contentElement.textContent = message;
        contentElement.style.color = color;
        contentElement.style.fontWeight = 'bold';
        console.log(`Conteúdo da página atualizado: "${message}" com cor "${color}".`);
    } else {
        // Se o elemento não for encontrado, loga um erro no console
        console.error("Erro: Elemento com ID 'dynamic-content' não encontrado na página.");
        alert("Erro: O elemento de destino não foi encontrado na página. Verifique o console.");
    }
}

// Opcional: Uma função para resetar o conteúdo
function resetPageContent() {
    const contentElement = document.getElementById('dynamic-content');
    if (contentElement) {
        contentElement.textContent = "Clique nos botões abaixo!";
        contentElement.style.color = '#333';
        contentElement.style.fontWeight = 'normal';
        console.log("Conteúdo da página resetado.");
    }
}
