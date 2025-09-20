export default async function handler(request, response) {
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  
  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  const { cep } = request.query;

  if (!cep) {
    return response.status(400).json({ error: 'CEP é obrigatório' });
  }

  try {
    const apiUrl = `https://viacep.com.br/ws/${cep}/json/`;
    const apiResponse = await fetch(apiUrl);
    
    if (!apiResponse.ok) {
      throw new Error(`Erro na API: ${apiResponse.status}`);
    }
    
    const data = await apiResponse.json();
    
    if (data.erro) {
      throw new Error('CEP não encontrado');
    }
    
    response.status(200).json({
      cep: data.cep,
      logradouro: data.logradouro,
      bairro: data.bairro,
      cidade: data.localidade,
      estado: data.uf
    });

  } catch (error) {
    response.status(500).json({ 
      error: 'Erro ao buscar CEP',
      detalhes: error.message
    });
  }
}