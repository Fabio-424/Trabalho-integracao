// Este arquivo é o nosso Backend (Serverless Function na Vercel)

// A Vercel exige que exportemos uma função 'handler'
export default async function handler(request, response) {
  // Pega o termo de busca que o nosso frontend enviou (ex: /api/buscar?termo=notebook)
  const termo = request.query.termo;

  if (!termo) {
    return response.status(400).json({ error: 'O termo de busca é obrigatório' });
  }

  // Monta a URL da API real do Mercado Livre
  const apiUrl = `https://api.mercadolibre.com/sites/MLB/search?q=${termo}`;

  try {
    // Faz a chamada de servidor para servidor (aqui não há CORS!)
    const apiResponse = await fetch(apiUrl);
    const data = await apiResponse.json();

    // Filtra e formata os dados para enviar apenas o que precisamos
    const produtosFormatados = data.results.map(item => ({
      nome: item.title,
      preco: item.price,
      imagem: item.thumbnail.replace('http://', 'https://'), // Garante imagem segura
      link: item.permalink,
      // Adicionamos atributos para os filtros!
      condicao: item.condition === 'new' ? 'Novo' : 'Usado',
    }));

    // Envia os dados formatados de volta para o nosso frontend
    response.status(200).json(produtosFormatados);

  } catch (error) {
    response.status(500).json({ error: 'Falha ao buscar dados da API do Mercado Livre' });
  }
}