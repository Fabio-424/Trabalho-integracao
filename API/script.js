// --- Controles do HTML ---
const caixaDeBusca = document.getElementById('caixaDeBusca');
const botaoDeBusca = document.getElementById('botaoDeBusca');
const divResultados = document.getElementById('resultados');
const divFiltros = document.getElementById('filtros');

// --- Botões de Filtro ---
const btnMenorPreco = document.getElementById('filtroMenorPreco');
const btnMaiorPreco = document.getElementById('filtroMaiorPreco');
const btnCondicaoNovo = document.getElementById('filtroCondicaoNovo');
const btnLimparFiltros = document.getElementById('limparFiltros');

// Variável para guardar os resultados originais da busca
let resultadosOriginais = [];

// --- Event Listeners ---
botaoDeBusca.addEventListener('click', realizarBusca);
btnMenorPreco.addEventListener('click', () => aplicarFiltro('menorPreco'));
btnMaiorPreco.addEventListener('click', () => aplicarFiltro('maiorPreco'));
btnCondicaoNovo.addEventListener('click', () => aplicarFiltro('condicaoNovo'));
btnLimparFiltros.addEventListener('click', () => aplicarFiltro('limpar'));


async function realizarBusca() {
    const termo = caixaDeBusca.value.trim();
    if (termo === '') {
        alert('Por favor, digite algo para buscar.');
        return;
    }

    divResultados.innerHTML = '<p>Buscando, aguarde...</p>';
    divFiltros.style.display = 'none'; // Esconde os filtros durante a busca

    try {
        // A MÁGICA: Chamamos NOSSA API (/api/buscar) e não a do Mercado Livre diretamente
        const response = await fetch(`/api/buscar?termo=${termo}`);
        const resultados = await response.json();

        if (response.ok) {
            resultadosOriginais = resultados; // Guarda os resultados sem filtro
            exibirResultados(resultadosOriginais);
            divFiltros.style.display = 'flex'; // Mostra os filtros após a busca
        } else {
            throw new Error(resultados.error);
        }

    } catch (error) {
        divResultados.innerHTML = `<p>Erro na busca: ${error.message}</p>`;
        console.error('Falha na busca:', error);
    }
}

function aplicarFiltro(tipo) {
    // Cria uma cópia da lista original para não a modificarmos
    let resultadosFiltrados = [...resultadosOriginais]; 

    if (tipo === 'menorPreco') {
        // a.preco - b.preco -> ordena do menor para o maior
        resultadosFiltrados.sort((a, b) => a.preco - b.preco);
    } 
    else if (tipo === 'maiorPreco') {
        // b.preco - a.preco -> ordena do maior para o menor
        resultadosFiltrados.sort((a, b) => b.preco - a.preco);
    }
    else if (tipo === 'condicaoNovo') {
        resultadosFiltrados = resultadosFiltrados.filter(item => item.condicao === 'Novo');
    }
    else if (tipo === 'limpar') {
        // Não faz nada, a lista já é a original
    }

    // Após filtrar/ordenar, exibe os resultados na tela
    exibirResultados(resultadosFiltrados);
}

function exibirResultados(resultados) {
    divResultados.innerHTML = ''; // Limpa a tela

    if (resultados.length === 0) {
        divResultados.innerHTML = '<p>Nenhum resultado encontrado.</p>';
        return;
    }

    resultados.forEach(produto => {
        const cardProduto = document.createElement('a'); // Agora o card todo é um link
        cardProduto.href = produto.link;
        cardProduto.target = '_blank'; // Abrir em nova aba
        cardProduto.className = 'card-produto';
        cardProduto.style.textDecoration = 'none'; // Remove sublinhado do link

        cardProduto.innerHTML = `
            <img src="${produto.imagem}" alt="${produto.nome}" class="imagem-produto">
            <div class="info-produto">
                <h3>${produto.nome}</h3>
                <p class="preco-produto">R$ ${produto.preco.toFixed(2)}</p>
                <p class="fonte-produto">Condição: <strong>${produto.condicao}</strong></p>
                <p class="fonte-produto">Vendido no Mercado Livre</p>
            </div>
        `;
        divResultados.appendChild(cardProduto);
    });
}