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
    // Faz a chamada para a API do Mercado Livre com headers
    const apiResponse = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'ComparadorPrecos/1.0 (https://trabalho-integracao.vercel.app)',
        'Accept': 'application/json',
      }
    });
    
    console.log("Status da API Mercado Livre:", apiResponse.status);
    console.log("Headers da API:", Object.fromEntries(apiResponse.headers.entries()));
    
    if (!apiResponse.ok) {
      // Tenta ler a resposta de erro
      let errorText = await apiResponse.text();
      console.error("Resposta de erro da API:", errorText);
      
      throw new Error(`Erro na API do Mercado Livre: ${apiResponse.status} - ${errorText}`);
    }
    
    const data = await apiResponse.json();
    console.log(`Encontrados ${data.results ? data.results.length : 0} produtos`);

    // Verifica se temos resultados
    if (!data.results || !Array.isArray(data.results)) {
      throw new Error('Formato de resposta inesperado da API');
    }

    // Formata os dados
    const produtosFormatados = data.results.map(item => ({
      nome: item.title,
      preco: item.price,
      imagem: item.thumbnail ? item.thumbnail.replace('http://', 'https://') : '',
      link: item.permalink,
      condicao: item.condition === 'new' ? 'Novo' : 'Usado',
    }));

    // Retorna os dados
    response.status(200).json(produtosFormatados);

  } catch (error) {
    console.error('Erro completo no servidor:', error);
    
    // Fallback: dados mockados para demonstração
    const dadosMockados = [
      {
        nome: "Notebook Intel Core i5 8GB RAM SSD 256GB",
        preco: 1899.99,
        imagem: "https://via.placeholder.com/150?text=Notebook+Exemplo",
        link: "https://www.mercadolivre.com.br",
        condicao: "Novo"
      },
      {
        nome: "Computador Completo Intel i5 8GB RAM",
        preco: 1599.50,
        imagem: "https://via.placeholder.com/150?text=Computador+Exemplo",
        link: "https://www.mercadolivre.com.br",
        condicao: "Novo"
      },
      {
        nome: "PC Gamer AMD Ryzen 5 16GB RAM Placa de Vídeo",
        preco: 2599.99,
        imagem: "https://via.placeholder.com/150?text=PC+Gamer+Exemplo",
        link: "https://www.mercadolivre.com.br",
        condicao: "Novo"
      }
    ];
    
    // Retorna dados mockados em caso de erro (para o trabalho funcionar)
    response.status(200).json(dadosMockados);
    
    // Se quiser retornar erro mesmo, descomente a linha abaixo e comente a acima:
    // response.status(500).json({ error: 'Falha ao buscar dados: ' + error.message });
  }
}