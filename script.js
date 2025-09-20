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
            const apiUrl = `/api/buscar?termo=${encodeURIComponent(termo)}`;
            console.log("Tentando acessar:", apiUrl);
            
            const response = await fetch(apiUrl);
            
            console.log("Status da resposta:", response.status);
            
            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }
            
            const resultados = await response.json();
            console.log("Resultados recebidos:", resultados);
            
            resultadosOriginais = resultados;
            exibirResultados(resultadosOriginais);
            divFiltros.style.display = 'flex';

        } catch (error) {
            console.error('Falha na busca:', error);
            
            // Fallback: dados mockados para demonstração
            const dadosMockados = [
              {
                nome: `Notebook ${termo} Intel Core i5 8GB RAM SSD 256GB`,
                preco: 1899.99,
                imagem: "https://via.placeholder.com/150?text=Notebook+Exemplo",
                link: "https://www.mercadolivre.com.br",
                condicao: "Novo"
              },
              {
                nome: `Computador ${termo} Intel i5 8GB RAM`,
                preco: 1599.50,
                imagem: "https://via.placeholder.com/150?text=Computador+Exemplo",
                link: "https://www.mercadolivre.com.br",
                condicao: "Novo"
              },
              {
                nome: `PC Gamer ${termo} AMD Ryzen 5 16GB RAM`,
                preco: 2599.99,
                imagem: "https://via.placeholder.com/150?text=PC+Gamer+Exemplo",
                link: "https://www.mercadolivre.com.br",
                condicao: "Novo"
              }
            ];
            
            resultadosOriginais = dadosMockados;
            exibirResultados(resultadosOriginais);
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