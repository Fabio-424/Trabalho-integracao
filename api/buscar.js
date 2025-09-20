// Este arquivo é o nosso Backend (Serverless Function na Vercel)

export default async function handler(request, response) {
  // Habilita CORS para o frontend
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  
  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  // Pega o termo de busca
  const { termo } = request.query;

  if (!termo) {
    return response.status(400).json({ error: 'O termo de busca é obrigatório' });
  }

  console.log("Buscando termo:", termo);

  try {
    // Tentativa com proxy confiável - AllOrigins
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(`https://api.mercadolibre.com/sites/MLB/search?q=${termo}&limit=10`)}`;
    
    console.log("Tentando acessar via proxy:", proxyUrl);
    
    const apiResponse = await fetch(proxyUrl, {
      headers: {
        'User-Agent': 'ComparadorPrecos/1.0',
        'Accept': 'application/json',
      },
      timeout: 10000
    });
    
    if (apiResponse.ok) {
      const data = await apiResponse.json();
      const resultados = JSON.parse(data.contents).results;
      
      if (!resultados || !Array.isArray(resultados)) {
        throw new Error('Formato de resposta inesperado da API');
      }

      console.log(`Sucesso! ${resultados.length} produtos encontrados`);
      
      // Formata os dados com links reais da API
      const produtosFormatados = resultados.map(item => ({
        id: item.id,
        nome: item.title,
        preco: item.price,
        imagem: item.thumbnail ? item.thumbnail.replace('http://', 'https://') : 
                `https://via.placeholder.com/300x200/2d3277/ffffff?text=Produto`,
        link: item.permalink, // LINK REAL da API
        condicao: item.condition === 'new' ? 'Novo' : 'Usado',
        vendidos: item.sold_quantity || 0,
        seller: item.seller?.nickname || 'Vendedor Mercado Livre',
        local: item.seller?.address?.city || 'São Paulo, SP'
      }));

      response.status(200).json(produtosFormatados);
      
    } else {
      throw new Error('Proxy não respondeu corretamente');
    }

  } catch (error) {
    console.error('Erro na busca via API:', error);
    
    // Como fallback, vamos fazer uma busca REAL no Mercado Livre
    // mas retornando apenas o link de busca geral
    const linkBuscaReal = `https://lista.mercadolivre.com.br/${termo.replace(/\s+/g, '-')}`;
    
    const produtosFallback = [
      {
        id: "fallback-1",
        nome: `Resultados de busca para: ${termo}`,
        preco: 0,
        imagem: "https://via.placeholder.com/300x200/2d3277/ffffff?text=Clique+para+ver",
        link: linkBuscaReal, // Link REAL de busca
        condicao: "Novo",
        vendidos: 0,
        seller: "Mercado Livre",
        local: "Brasil",
        isFallback: true
      }
    ];
    
    response.status(200).json(produtosFallback);
  }
}