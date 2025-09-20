// Este arquivo é o nosso Backend (Serverless Function na Vercel)

export default async function handler(request, response) {
  // Pega o termo de busca que o nosso frontend enviou
  const { termo } = request.query;

  if (!termo) {
    return response.status(400).json({ error: 'O termo de busca é obrigatório' });
  }

  // Montamos a URL REAL e DIRETA da API do Mercado Livre
  const apiUrl = `https://api.mercadolibre.com/sites/MLB/search?q=${encodeURIComponent(termo)}&limit=10`;
  
  console.log("Tentando acessar API DIRETAMENTE:", apiUrl);

  try {
    // Fazemos a chamada de servidor (Vercel) para servidor (Mercado Livre)
    const apiResponse = await fetch(apiUrl);

    // Se a resposta não for OK (ex: erro 404, 500), nós lançamos um erro
    if (!apiResponse.ok) {
      throw new Error(`A API do Mercado Livre respondeu com status: ${apiResponse.status}`);
    }

    const data = await apiResponse.json();
    const resultados = data.results;

    if (!resultados || !Array.isArray(resultados)) {
      throw new Error('Formato de resposta inesperado da API do Mercado Livre');
    }

    console.log(`Sucesso! ${resultados.length} produtos encontrados diretamente.`);

    // Mantemos toda a sua formatação de dados excelente
    const produtosFormatados = resultados.map(item => ({
      id: item.id,
      nome: item.title,
      preco: item.price,
      imagem: item.thumbnail ? item.thumbnail.replace('http://', 'https://') : 
              `https://via.placeholder.com/300x200/2d3277/ffffff?text=Produto`,
      link: item.permalink,
      condicao: item.condition === 'new' ? 'Novo' : 'Usado',
      vendidos: item.sold_quantity || 0,
      seller: item.seller?.nickname || 'Vendedor Mercado Livre',
      local: item.seller_address?.city?.name || ''
    }));

    response.status(200).json(produtosFormatados);

  } catch (error) {
    console.error('Erro na busca DIRETA via API:', error);

    // Mantemos seu excelente mecanismo de Fallback
    const linkBuscaReal = `https://lista.mercadolivre.com.br/${termo.replace(/\s+/g, '-')}`;
    
    const produtosFallback = [{
      id: "fallback-1",
      nome: `Resultados de busca para: ${termo}`,
      preco: 0,
      imagem: "https://via.placeholder.com/300x200/2d3277/ffffff?text=Clique+para+ver",
      link: linkBuscaReal,
      condicao: "Novo",
      vendidos: 0,
      seller: "Mercado Livre",
      local: "Brasil",
      isFallback: true
    }];
    
    // ATENÇÃO: Enviamos o fallback com status 200 para o frontend não tratar como erro
    response.status(200).json(produtosFallback);
  }
}