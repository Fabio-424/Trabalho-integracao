// Este arquivo é o nosso Backend (Serverless Function na Vercel)

// A Vercel exige que exportemos uma função 'handler'
export default async function handler(request, response) {
  // Habilita CORS para o frontend - IMPORTANTE!
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  
  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  // Pega o termo de busca que o nosso frontend enviou (ex: /api/buscar?termo=notebook)
  const { termo } = request.query;

  if (!termo) {
    return response.status(400).json({ error: 'O termo de busca é obrigatório' });
  }

  // Monta a URL da API real do Mercado Livre
  const apiUrl = `https://api.mercadolibre.com/sites/MLB/search?q=${encodeURIComponent(termo)}&limit=20`;

  try {
    // Faz a chamada de servidor para servidor (aqui não há CORS!)
    const apiResponse = await fetch(apiUrl);
    
    if (!apiResponse.ok) {
      throw new Error(`Erro na API do Mercado Livre: ${apiResponse.status}`);
    }
    
    const data = await apiResponse.json();

    // Filtra e formata os dados para enviar apenas o que precisamos
    const produtosFormatados = data.results.map(item => ({
      nome: item.title,
      preco: item.price,
      imagem: item.thumbnail.replace('http://', 'https://'), // Garante imagem segura
      link: item.permalink,
      condicao: item.condition === 'new' ? 'Novo' : 'Usado',
    }));

    // Envia os dados formatados de volta para o nosso frontend
    response.status(200).json(produtosFormatados);

  } catch (error) {
    console.error('Erro no servidor:', error);
    response.status(500).json({ error: 'Falha ao buscar dados da API do Mercado Livre: ' + error.message });
  }
}