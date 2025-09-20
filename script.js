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

        mostrarLoading();
        divFiltros.style.display = 'none';

        try {
            const apiUrl = `/api/buscar?termo=${encodeURIComponent(termo)}`;
            console.log("Tentando acessar:", apiUrl);
            
            const response = await fetch(apiUrl);
            
            console.log("Status da resposta:", response.status);
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Erro HTTP: ${response.status}`);
            }
            
            const resultados = await response.json();
            console.log("Resultados recebidos:", resultados);
            
            if (resultados.error) {
                throw new Error(resultados.error);
            }
            
            resultadosOriginais = resultados;
            exibirResultados(resultadosOriginais, false);
            divFiltros.style.display = 'flex';

        } catch (error) {
            console.error('Falha na busca:', error);
            
            // Fallback: dados mockados para demonstração
            const dadosMockados = criarDadosMockados(termo);
            
            resultadosOriginais = dadosMockados;
            exibirResultados(resultadosOriginais, true);
            divFiltros.style.display = 'flex';
            
            divResultados.innerHTML += `
                <div class="aviso">
                    <p><strong>Atenção:</strong> Usando dados de demonstração. A API do Mercado Livre retornou erro.</p>
                    <p>Detalhes do erro: ${error.message}</p>
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

        exibirResultados(resultadosFiltrados, false);
    }

    function exibirResultados(resultados, ehExemplo = false) {
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
                     onerror="this.src='https://via.placeholder.com/300x200/2d3277/ffffff?text=Imagem+Não+Disponível'">
                <div class="info-produto">
                    <h3>${produto.nome}</h3>
                    <p class="preco-produto">R$ ${produto.preco.toFixed(2)}</p>
                    <div class="detalhes-produto">
                        <span class="condicao-produto">${produto.condicao}</span>
                        <span class="vendidos-produto">${produto.vendidos || 0} vendidos</span>
                        ${produto.estrelas ? `<span class="avaliacao-produto">⭐ ${produto.estrelas}</span>` : ''}
                    </div>
                    <p class="vendedor-produto">${produto.seller || 'Vendedor Mercado Livre'}</p>
                    ${produto.local ? `<p class="local-produto">${produto.local}</p>` : ''}
                    <p class="fonte-produto">Clique para ver no Mercado Livre</p>
                </div>
            `;
            divResultados.appendChild(cardProduto);
        });

        if (ehExemplo) {
            const aviso = document.createElement('div');
            aviso.className = 'aviso';
            aviso.innerHTML = `
                <p>🔍 <strong>Modo de demonstração:</strong> Mostrando dados simulados.</p>
                <p>A API do Mercado Livre está com restrições de acesso temporárias.</p>
                <p>Os preços e produtos são exemplos representativos.</p>
            `;
            divResultados.appendChild(aviso);
        }
    }

    function mostrarLoading() {
        const divResultados = document.getElementById('resultados');
        divResultados.innerHTML = '<div class="loading">Buscando produtos no Mercado Livre...</div>';
    }

    function criarDadosMockados(termo) {
        console.log("Criando dados mockados para:", termo);
        
        const categorias = {
            'celular': [
                'Samsung Galaxy S23 256GB',
                'iPhone 15 Pro 128GB',
                'Xiaomi Redmi Note 12',
                'Motorola Edge 40',
                'Google Pixel 7'
            ],
            'notebook': [
                'Dell Inspiron i7 16GB RAM',
                'MacBook Air M2 2023',
                'Acer Nitro 5 Gamer',
                'Lenovo Ideapad 3i',
                'HP Pavilion 15'
            ],
            'tv': [
                'Smart TV LG 55" 4K',
                'Samsung 50" Crystal UHD',
                'TV TCL 43" 4K Android',
                'Philips 65" Ambilight',
                'AOC 32" Smart TV'
            ],
            'fone': [
                'Fone Bluetooth Sony WH-1000XM5',
                'AirPods Pro 2ª Geração',
                'JBL Tune 710BT',
                'Fone Samsung Galaxy Buds2',
                'Fone Philips com Cancelamento de Ruído'
            ],
            'default': [
                'Produto Premium',
                'Modelo Avançado',
                'Edição Especial',
                'Kit Completo',
                'Versão Plus'
            ]
        };

        // Escolhe a categoria baseada no termo
        let produtosDaCategoria = categorias.default;
        for (const [key, value] of Object.entries(categorias)) {
            if (termo.toLowerCase().includes(key)) {
                produtosDaCategoria = value;
                break;
            }
        }

        const vendedores = [
            'Loja Oficial', 'Tech Store', 'Eletro Mundo', 'Super Discount', 
            'Mega Shop', 'Digital Store', 'Premium Tech', 'Best Buy Eletrônicos'
        ];

        const cidades = ['São Paulo, SP', 'Rio de Janeiro, RJ', 'Belo Horizonte, MG', 
                        'Porto Alegre, RS', 'Brasília, DF', 'Salvador, BA'];

        return produtosDaCategoria.map((nomeProduto, index) => {
            const precoBase = 500 + (index * 300);
            const precoVariacao = Math.floor(Math.random() * 400);
            const vendidos = 50 + Math.floor(Math.random() * 200);
            
            return {
                id: `MLB${Math.floor(1000000000 + Math.random() * 9000000000)}`,
                nome: `${termo} ${nomeProduto}`,
                preco: precoBase + precoVariacao,
                imagem: `https://via.placeholder.com/300x200/2d3277/ffffff?text=${encodeURIComponent(nomeProduto.split(' ')[0])}`,
                link: `https://www.mercadolivre.com.br`,
                condicao: Math.random() > 0.3 ? 'Novo' : 'Usado',
                vendidos: vendidos,
                seller: vendedores[Math.floor(Math.random() * vendedores.length)],
                local: cidades[Math.floor(Math.random() * cidades.length)],
                estrelas: (4 + Math.random()).toFixed(1)
            };
        });
    }

    console.log("Inicialização concluída. A página está pronta.");
});