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
            const data = await response.json();
            
            console.log("Resposta da API:", data);

            if (!response.ok) {
                throw new Error(`Erro ${response.status}: ${response.statusText}`);
            }

            if (data.success) {
                // API funcionou - mostrar resultados
                resultadosOriginais = data.resultados;
                exibirResultados(resultadosOriginais);
                divFiltros.style.display = 'flex';
                
                // Mostrar estatísticas
                divResultados.innerHTML += `
                    <div class="sucesso">
                        <p>✅ Encontrados ${data.total} resultados para "${termo}"</p>
                    </div>
                `;
                
            } else {
                // API não está disponível
                exibirErroAPI(data, termo);
            }

        } catch (error) {
            console.error('Erro completo:', error);
            exibirErroConexao(error, termo);
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
            cardProduto.rel = 'noopener noreferrer';

            cardProduto.innerHTML = `
                <img src="${produto.imagem}" alt="${produto.nome}" class="imagem-produto"
                     onerror="this.src='https://via.placeholder.com/300x200/2d3277/ffffff?text=Imagem'">
                <div class="info-produto">
                    <h3>${produto.nome}</h3>
                    <p class="preco-produto">R$ ${produto.preco.toFixed(2)}</p>
                    <div class="detalhes-produto">
                        <span class="condicao-produto">${produto.condicao}</span>
                        ${produto.vendidos > 0 ? `<span class="vendidos-produto">${produto.vendidos} vendidos</span>` : ''}
                        ${produto.shipping ? `<span class="frete-gratis">🚚 Frete Grátis</span>` : ''}
                    </div>
                    <p class="vendedor-produto">${produto.seller}</p>
                    ${produto.local ? `<p class="local-produto">📍 ${produto.local}</p>` : ''}
                    <p class="fonte-produto">Ver no Mercado Livre →</p>
                </div>
            `;
            divResultados.appendChild(cardProduto);
        });
    }

    function exibirErroAPI(data, termo) {
        divResultados.innerHTML = `
            <div class="erro">
                <h3>⚠️ API Indisponível no Momento</h3>
                <p>A conexão com o Mercado Livre está temporariamente indisponível.</p>
                <p><strong>Detalhes técnicos:</strong> ${data.error || 'Erro desconhecido'}</p>
                
                <div class="solucao">
                    <h4>📋 Soluções:</h4>
                    <ul>
                        <li>Tente novamente em alguns minutos</li>
                        <li>Verifique sua conexão com a internet</li>
                        <li>Busque diretamente no <a href="${data.searchUrl || 'https://www.mercadolivre.com.br'}" target="_blank">Mercado Livre</a></li>
                    </ul>
                </div>
                
                <p class="timestamp">⌚ ${new Date().toLocaleString()}</p>
            </div>
        `;
    }

    function exibirErroConexao(error, termo) {
        divResultados.innerHTML = `
            <div class="erro">
                <h3>❌ Erro de Conexão</h3>
                <p>Não foi possível conectar ao servidor de busca.</p>
                <p><strong>Erro:</strong> ${error.message}</p>
                
                <div class="solucao">
                    <h4>🚀 Alternativas:</h4>
                    <ul>
                        <li>Busque diretamente no <a href="https://lista.mercadolivre.com.br/${termo.replace(/\s+/g, '-')}" target="_blank">Mercado Livre</a></li>
                        <li>Tente outros termos de busca</li>
                        <li>Verifique se o servidor está online</li>
                    </ul>
                </div>
            </div>
        `;
    }

    function mostrarLoading() {
        divResultados.innerHTML = `
            <div class="loading-container">
                <div class="loading-spinner"></div>
                <p>Conectando com o Mercado Livre...</p>
                <p class="loading-details">Buscando melhores preços para você</p>
            </div>
        `;
    }

    console.log("Sistema inicializado com tratamento de erros melhorado");
});