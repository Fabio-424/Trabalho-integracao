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
            console.log("Tentando acessar API:", apiUrl);
            
            const response = await fetch(apiUrl);
            
            console.log("Status da resposta:", response.status);
            
            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }
            
            const resultados = await response.json();
            console.log("Resultados recebidos da API:", resultados);
            
            // USAR APENAS OS LINKS QUE VÊM DA API
            resultadosOriginais = resultados;
            
            if (resultados.length === 1 && resultados[0].isFallback) {
                // Modo fallback - apenas um resultado com link de busca
                exibirResultadoFallback(resultados[0]);
            } else {
                // Resultados normais da API
                exibirResultados(resultados);
                divFiltros.style.display = 'flex';
            }

        } catch (error) {
            console.error('Falha completa na busca:', error);
            
            divResultados.innerHTML = `
                <div class="erro">
                    <p><strong>Erro na conexão:</strong> ${error.message}</p>
                    <p>Não foi possível conectar ao servidor de busca.</p>
                    <p>Tente novamente em alguns instantes.</p>
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
            // SÓ EXIBE SE TIVER LINK VÁLIDO
            if (!produto.link || !produto.link.includes('mercadolivre')) {
                console.log('Produto sem link válido:', produto);
                return;
            }

            const cardProduto = document.createElement('a');
            cardProduto.href = produto.link;
            cardProduto.target = '_blank';
            cardProduto.className = 'card-produto';
            cardProduto.rel = 'noopener noreferrer';

            cardProduto.innerHTML = `
                <img src="${produto.imagem}" alt="${produto.nome}" class="imagem-produto"
                     onerror="this.src='https://via.placeholder.com/300x200/2d3277/ffffff?text=Imagem'">
                <div class="info-produto">
                    <h3>${produto.nome}</h3>
                    ${produto.preco > 0 ? `<p class="preco-produto">R$ ${produto.preco.toFixed(2)}</p>` : ''}
                    <div class="detalhes-produto">
                        <span class="condicao-produto">${produto.condicao}</span>
                        ${produto.vendidos > 0 ? `<span class="vendidos-produto">${produto.vendidos} vendidos</span>` : ''}
                    </div>
                    <p class="vendedor-produto">${produto.seller}</p>
                    ${produto.local ? `<p class="local-produto">${produto.local}</p>` : ''}
                    <p class="fonte-produto">Ver no Mercado Livre →</p>
                </div>
            `;
            divResultados.appendChild(cardProduto);
        });
    }

    function exibirResultadoFallback(produtoFallback) {
        divResultados.innerHTML = `
            <div class="aviso">
                <p>🔍 <strong>Redirecionamento para busca:</strong></p>
                <p>A API direta não está respondendo, mas você pode buscar diretamente no Mercado Livre.</p>
            </div>
            <div class="card-produto fallback">
                <a href="${produtoFallback.link}" target="_blank" class="fallback-link">
                    <div class="info-produto">
                        <h3>${produtoFallback.nome}</h3>
                        <p class="fonte-produto">Clique aqui para ver os resultados reais no Mercado Livre</p>
                    </div>
                </a>
            </div>
        `;
    }

    function mostrarLoading() {
        divResultados.innerHTML = '<div class="loading">Buscando produtos no Mercado Livre...</div>';
    }

    console.log("Inicialização concluída. O sistema usará apenas links da API.");
});