// complex_test.js

// Esta função será chamada ao carregar a página
document.addEventListener('DOMContentLoaded', function() {
    const contentElement = document.getElementById('dynamic-content');
    if (contentElement) {
        // Define o conteúdo inicial da página via JavaScript
        contentElement.textContent = "Página carregada! Clique nos botões abaixo.";
        contentElement.style.color = '#333';
        contentElement.style.fontWeight = 'normal';
        console.log("Conteúdo inicial da página definido por complex_test.js.");
    } else {
        console.error("Erro: Elemento com ID 'dynamic-content' não encontrado ao carregar a página.");
        alert("Erro: O elemento de destino não foi encontrado na página. Verifique o console.");
    }
});


function updatePageContent(type) {
    const contentElement = document.getElementById('dynamic-content');
    let message = "";
    let color = "";

    switch (type) {
        case 'success':
            message = "Ação realizada com sucesso! Tudo em ordem.";
            color = "green";
            break;
        case 'warning':
            message = "Atenção: algo pode estar errado. Verifique as informações.";
            color = "orange";
            break;
        case 'error':
            message = "Ocorreu um erro crítico! Por favor, tente novamente.";
            color = "red";
            break;
        default:
            message = "Tipo de mensagem desconhecido.";
            color = "gray";
    }

    if (contentElement) {
        contentElement.textContent = message;
        contentElement.style.color = color;
        contentElement.style.fontWeight = 'bold';
        console.log(`Conteúdo da página atualizado: "${message}" (${type})`);
    } else {
        console.error("Erro: Elemento com ID 'dynamic-content' não encontrado na página ao tentar atualizar.");
        alert("Erro: O elemento de destino não foi encontrado na página. Verifique o console.");
    }
}

function resetPageContent() {
    const contentElement = document.getElementById('dynamic-content');
    if (contentElement) {
        contentElement.textContent = "Conteúdo resetado. Clique nos botões novamente!";
        contentElement.style.color = '#333';
        contentElement.style.fontWeight = 'normal';
        console.log("Conteúdo da página resetado por complex_test.js.");
    }
}
