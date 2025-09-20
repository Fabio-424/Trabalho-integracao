// --- Variáveis Globais ---
let resultadosOriginais = [];

// --- Inicialização quando a página carrega ---
document.addEventListener('DOMContentLoaded', function() {
    console.log("Página carregada. Inicializando...");
    
    // --- Elementos da DOM ---
    const botaoDeBusca = document.getElementById('botaoDeBusca');
    const caixaDeBusca = document.getElementById('caixaDeBusca');
    const divFiltros = document.getElementById('filtros');
    const divResultados = document.getElementById('resultados');
    
    // --- Botões de Filtro ---
    const btnMenorPreco = document.getElementById('filtroMenorPreco');
    const btnMaiorPreco = document.getElementById('filtroMaiorPreco');
    const btnCondicaoNovo = document.getElementById('filtroCondicaoNovo');
    const btnLimparFiltros = document.getElementById('limparFiltros');

    // --- Event Listeners ---
    botaoDeBusca.addEventListener('click', realizarBusca);
    caixaDeBusca.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            realizarBusca();
        }
    });
    
    btnMenorPreco.addEventListener('click', () => aplicarFiltro('menorPreco'));
    btnMaiorPreco.addEventListener('click', () => aplicarFiltro('maiorPreco'));
    btnCondicaoNovo.addEventListener('click', () => aplicarFiltro('condicaoNovo'));
    btnLimparFiltros.addEventListener('click', () => aplicarFiltro('limpar'));

    // --- Funções ---
    async function realizarBusca() {
        const termo = caixaDeBusca.value.trim();
        
        if (termo === '') {
            alert('Por favor, digite algo para buscar.');
            return;
        }

        divResultados.innerHTML = '<p>Buscando, aguarde...</p>';
        divFiltros.style.display = 'none';

        try {
            // URL da API - IMPORTANTE: a pasta deve se chamar "api" (minúsculo)
            const apiUrl = `/api/buscar?termo=${encodeURIComponent(termo)}`;
            console.log("Tentando acessar:", apiUrl);
            
            const response = await fetch(apiUrl);
            
            console.log("Status da resposta:", response.status);
            console.log("URL completa:", window.location.origin + apiUrl);
            
            if (!response.ok) {
                let errorMessage = `Erro HTTP: ${response.status}`;
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.error || errorMessage;
                } catch (e) {
                    // Não foi possível ler JSON de erro
                }
                throw new Error(errorMessage);
            }
            
            const resultados = await response.json();
            console.log("Resultados recebidos:", resultados);
            
            resultadosOriginais = resultados;
            exibirResultados(resultadosOriginais);
            divFiltros.style.display = 'flex';

        } catch (error) {
            console.error('Falha completa na busca:', error);
            divResultados.innerHTML = `
                <div class="erro">
                    <p><strong>Erro na busca:</strong> ${error.message}</p>
                    <p>Verifique:</p>
                    <ul>
                        <li>Se a pasta da API se chama "api" (minúsculo)</li>
                        <li>Se o arquivo dentro se chama "buscar.js"</li>
                        <li>Se o deploy na Vercel foi bem-sucedido</li>
                    </ul>
                    <p>Abra o console do navegador (F12) para mais detalhes.</p>
                </div>
            `;
        }
    }

    function aplicarFiltro(tipo) {
        let resultadosFiltrados = [...resultadosOriginais]; 

        if (tipo === 'menorPreco') {
            resultadosFiltrados.sort((a, b) => a.preco - b.preco);
        } 
        else if (tipo === 'maiorPreco') {
            resultadosFiltrados.sort((a, b) => b.preco - a.preco);
        }
        else if (tipo === 'condicaoNovo') {
            resultadosFiltrados = resultadosFiltrados.filter(item => item.condicao === 'Novo');
        }
        else if (tipo === 'limpar') {
            resultadosFiltrados = [...resultadosOriginais];
        }

        exibirResultados(resultadosFiltrados);
    }

    function exibirResultados(resultados) {
        divResultados.innerHTML = '';

        if (resultados.length === 0) {
            divResultados.innerHTML = '<p>Nenhum resultado encontrado.</p>';
            return;
        }

        resultados.forEach(produto => {
            const cardProduto = document.createElement('a');
            cardProduto.href = produto.link;
            cardProduto.target = '_blank';
            cardProduto.className = 'card-produto';

            cardProduto.innerHTML = `
                <img src="${produto.imagem}" alt="${produto.nome}" class="imagem-produto">
                <div class="info-produto">
                    <h3>${produto.nome}</h3>
                    <p class="preco-produto">R$ ${produto.preco.toFixed(2)}</p>
                    <p class="condicao-produto">Condição: <strong>${produto.condicao}</strong></p>
                    <p class="fonte-produto">Vendido no Mercado Livre</p>
                </div>
            `;
            divResultados.appendChild(cardProduto);
        });
    }

    console.log("Inicialização concluída. A página está pronta.");
});