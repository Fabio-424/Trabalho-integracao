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

        mostrarLoading();
        divFiltros.style.display = 'none';

        try {
            const apiUrl = `/api/buscar?termo=${encodeURIComponent(termo)}`;
            console.log("Buscando:", apiUrl);
            
            const response = await fetch(apiUrl);
            
            console.log("Status:", response.status);
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Erro: ${response.status}`);
            }
            
            const resultados = await response.json();
            console.log("Resultados reais recebidos:", resultados);
            
            if (resultados.error) {
                throw new Error(resultados.error);
            }
            
            resultadosOriginais = resultados;
            exibirResultados(resultadosOriginais);
            divFiltros.style.display = 'flex';

        } catch (error) {
            console.error('Erro na busca:', error);
            
            divResultados.innerHTML = `
                <div class="erro">
                    <p><strong>Erro na busca:</strong> ${error.message}</p>
                    <p>Não foi possível conectar à API do Mercado Livre.</p>
                    <p>Tente novamente ou verifique:</p>
                    <ul>
                        <li>Sua conexão com a internet</li>
                        <li>Se a API do Mercado Livre está funcionando</li>
                        <li>O console do navegador para mais detalhes (F12)</li>
                    </ul>
                    <p>Termo buscado: <strong>${termo}</strong></p>
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
            divResultados.innerHTML = '<p>Nenhum resultado encontrado para sua busca.</p>';
            return;
        }

        resultados.forEach(produto => {
            const cardProduto = document.createElement('a');
            cardProduto.href = produto.link;
            cardProduto.target = '_blank';
            cardProduto.className = 'card-produto';
            cardProduto.rel = 'noopener noreferrer'; // Segurança

            cardProduto.innerHTML = `
                <img src="${produto.imagem}" alt="${produto.nome}" class="imagem-produto"
                     onerror="this.src='https://via.placeholder.com/300x200/2d3277/ffffff?text=Imagem+Não+Disponível'">
                <div class="info-produto">
                    <h3>${produto.nome}</h3>
                    <p class="preco-produto">R$ ${produto.preco.toFixed(2)}</p>
                    <p class="condicao-produto">Condição: <strong>${produto.condicao}</strong></p>
                    <p class="vendedor-produto">Vendedor: ${produto.seller || 'Mercado Livre'}</p>
                    <p class="vendidos-produto">${produto.vendidos} vendidos</p>
                    <p class="fonte-produto">Clique para ver no Mercado Livre</p>
                </div>
            `;
            divResultados.appendChild(cardProduto);
        });
        // No final da função exibirResultados, adicione:
function exibirResultados(resultados, ehExemplo = false) {
    divResultados.innerHTML = '';

    if (resultados.length === 0) {
        divResultados.innerHTML = '<p>Nenhum resultado encontrado para sua busca.</p>';
        return;
    }

    resultados.forEach(produto => {
        // ... código existente ...
    });

    // Adicione esta mensagem se forem dados de exemplo
    if (ehExemplo) {
        const aviso = document.createElement('div');
        aviso.className = 'aviso';
        aviso.innerHTML = `
            <p>⚠️ <strong>Modo de demonstração:</strong> Mostrando dados de exemplo.</p>
            <p>A API do Mercado Livre está com restrições de acesso.</p>
        `;
        divResultados.appendChild(aviso);
    }
}

// E modifique a chamada em realizarBusca:
// Substitua:
exibirResultados(resultadosOriginais);

// Por:
exibirResultados(resultadosOriginais, false);
    }

    function mostrarLoading() {
        divResultados.innerHTML = '<div class="loading">Buscando produtos no Mercado Livre...</div>';
    }

    console.log("Sistema pronto para buscar qualquer produto!");
});