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

  // Monta a URL da API real do Mercado Livre
  const apiUrl = `https://api.mercadolibre.com/sites/MLB/search?q=${encodeURIComponent(termo)}&limit=20`;

  try {
    // Faz a chamada para a API do Mercado Livre
    console.log("Acessando API do Mercado Livre:", apiUrl);
    
    const apiResponse = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'ComparadorPrecos/1.0',
        'Accept': 'application/json',
      }
    });
    
    console.log("Status da API:", apiResponse.status);
    
    if (!apiResponse.ok) {
      // Se der erro 401 ou outros, vamos tentar uma abordagem diferente
      console.log("Tentando abordagem alternativa sem headers...");
      
      // Tentamos novamente sem headers específicos
      const apiResponse2 = await fetch(apiUrl);
      if (!apiResponse2.ok) {
        throw new Error(`Erro na API: ${apiResponse2.status} ${apiResponse2.statusText}`);
      }
      
      const data = await apiResponse2.json();
      return processarDados(response, data, termo);
    }
    
    const data = await apiResponse.json();
    return processarDados(response, data, termo);

  } catch (error) {
    console.error('Erro completo:', error);
    
    // Em caso de erro, mostramos uma mensagem mas não usamos dados mockados
    response.status(500).json({ 
      error: 'Falha ao buscar dados da API do Mercado Livre',
      detalhes: error.message,
      termo: termo
    });
  }
}

// Função separada para processar os dados
function processarDados(response, data, termo) {
  // Verifica se temos resultados
  if (!data.results || !Array.isArray(data.results)) {
    throw new Error('Formato de resposta inesperado da API');
  }

  console.log(`Encontrados ${data.results.length} produtos para "${termo}"`);

  // Formata os dados
  const produtosFormatados = data.results.map(item => ({
    id: item.id,
    nome: item.title,
    preco: item.price,
    imagem: item.thumbnail ? item.thumbnail.replace('http://', 'https://') : 
            `https://via.placeholder.com/300x200/2d3277/ffffff?text=${encodeURIComponent(item.title.substring(0, 15))}`,
    link: item.permalink,
    condicao: item.condition === 'new' ? 'Novo' : 'Usado',
    vendidos: item.sold_quantity || 0,
    seller: item.seller.nickname
  }));

  // Retorna os dados reais da API
  response.status(200).json(produtosFormatados);
}