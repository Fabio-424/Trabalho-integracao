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

    // Verificar se os elementos foram encontrados
    console.log("Elemento do botão de busca encontrado:", botaoDeBusca);
    console.log("Elemento da caixa de busca encontrado:", caixaDeBusca);
    console.log("Elemento de resultados encontrado:", divResultados);

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
        console.log("O botão de busca foi clicado! A função realizarBusca() começou.");
        const termo = caixaDeBusca.value.trim();
        
        if (termo === '') {
            alert('Por favor, digite algo para buscar.');
            return;
        }

        divResultados.innerHTML = '<p>Buscando, aguarde...</p>';
        divFiltros.style.display = 'none'; // Esconde os filtros durante a busca

        try {
            // Chamamos nossa API no Vercel
            const response = await fetch(`/api/buscar?termo=${encodeURIComponent(termo)}`);
            
            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }
            
            const resultados = await response.json();
            resultadosOriginais = resultados; // Guarda os resultados sem filtro
            exibirResultados(resultadosOriginais);
            divFiltros.style.display = 'flex'; // Mostra os filtros após a busca

        } catch (error) {
            console.error('Falha na busca:', error);
            divResultados.innerHTML = `
                <p class="erro">Erro na busca: ${error.message}</p>
                <p class="erro">Verifique se a API está funcionando no Vercel.</p>
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
        divResultados.innerHTML = ''; // Limpa a tela

        if (resultados.length === 0) {
            divResultados.innerHTML = '<p>Nenhum resultado encontrado.</p>';
            return;
        }

        resultados.forEach(produto => {
            const cardProduto = document.createElement('a');
            cardProduto.href = produto.link;
            cardProduto.target = '_blank';
            cardProduto.className = 'card-produto';
            cardProduto.style.textDecoration = 'none';

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