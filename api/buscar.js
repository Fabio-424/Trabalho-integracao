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
    // Tentativa 1: API directa com headers
    console.log("Tentativa 1: API directa");
    const apiResponse1 = await fetch(`https://api.mercadolibre.com/sites/MLB/search?q=${encodeURIComponent(termo)}&limit=8`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
        'Accept-Language': 'pt-BR,pt;q=0.9',
      }
    });

    if (apiResponse1.ok) {
      const data = await apiResponse1.json();
      return enviarResultados(response, data, termo);
    }
    
    // Tentativa 2: Via CORS proxy
    console.log("Tentativa 2: CORS proxy");
    const apiResponse2 = await fetch(`https://corsproxy.io/?${encodeURIComponent(`https://api.mercadolibre.com/sites/MLB/search?q=${termo}&limit=8`)}`);
    
    if (apiResponse2.ok) {
      const data = await apiResponse2.json();
      return enviarResultados(response, data, termo);
    }

    // Tentativa 3: Via AllOrigins
    console.log("Tentativa 3: AllOrigins");
    const apiResponse3 = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(`https://api.mercadolibre.com/sites/MLB/search?q=${termo}&limit=8`)}`);
    
    if (apiResponse3.ok) {
      const data = await apiResponse3.json();
      const resultados = JSON.parse(data.contents);
      return enviarResultados(response, resultados, termo);
    }

    throw new Error('Todas as tentativas de conexão falharam');

  } catch (error) {
    console.error('Erro completo na API:', error);
    
    // Retorna informações úteis para debug
    response.status(200).json({
      success: false,
      message: 'API não disponível no momento',
      error: error.message,
      termo: termo,
      searchUrl: `https://lista.mercadolivre.com.br/${termo.replace(/\s+/g, '-')}`,
      timestamp: new Date().toISOString()
    });
  }
}

// Função para processar e enviar resultados
function enviarResultados(response, data, termo) {
  if (!data.results || !Array.isArray(data.results)) {
    throw new Error('Formato de resposta inválido da API');
  }

  const produtosFormatados = data.results.map(item => ({
    id: item.id,
    nome: item.title,
    preco: item.price,
    imagem: item.thumbnail ? item.thumbnail.replace('http://', 'https://') : 
            `https://via.placeholder.com/300x200/2d3277/ffffff?text=${encodeURIComponent(item.title.substring(0, 15))}`,
    link: item.permalink,
    condicao: item.condition === 'new' ? 'Novo' : 'Usado',
    vendidos: item.sold_quantity || 0,
    seller: item.seller?.nickname || 'Vendedor Mercado Livre',
    local: item.seller?.address?.city || 'Brasil',
    shipping: item.shipping?.free_shipping || false
  }));

  response.status(200).json({
    success: true,
    termo: termo,
    resultados: produtosFormatados,
    total: produtosFormatados.length
  });
}