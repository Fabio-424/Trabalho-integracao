// Este arquivo é o nosso Backend (Serverless Function na Vercel)

export default async function handler(request, response) {
  // Habilita CORS para o frontend - IMPORTANTE!
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
    const apiResponse = await fetch(apiUrl);
    
    if (!apiResponse.ok) {
      throw new Error(`Erro na API do Mercado Livre: ${apiResponse.status}`);
    }
    
    const data = await apiResponse.json();

    // Formata os dados
    const produtosFormatados = data.results.map(item => ({
      nome: item.title,
      preco: item.price,
      imagem: item.thumbnail.replace('http://', 'https://'),
      link: item.permalink,
      condicao: item.condition === 'new' ? 'Novo' : 'Usado',
    }));

    console.log(`Encontrados ${produtosFormatados.length} produtos`);
    
    // Retorna os dados
    response.status(200).json(produtosFormatados);

  } catch (error) {
    console.error('Erro no servidor:', error);
    response.status(500).json({ 
      error: 'Falha ao buscar dados: ' + error.message,
      detalhes: 'Verifique se a função serverless foi implantada corretamente'
    });
  }
}