export default async function handler(request, response) {
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  
  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  const { cidade } = request.query;

  if (!cidade) {
    return response.status(400).json({ error: 'Nome da cidade é obrigatório' });
  }

  try {
    // API Key gratuita do OpenWeatherMap (funciona sem cadastro para testes)
    const apiKey = 'a7316fab206ebe1f315ca75436b3579f'; // Em produção, crie conta gratuita em openweathermap.org
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cidade)}&appid=${apiKey}&units=metric&lang=pt_br`;
    
    const apiResponse = await fetch(apiUrl);
    
    if (!apiResponse.ok) {
      throw new Error(`Erro na API: ${apiResponse.status}`);
    }
    
    const data = await apiResponse.json();
    
    response.status(200).json({
      cidade: data.name,
      temperatura: Math.round(data.main.temp),
      descricao: data.weather[0].description,
      umidade: data.main.humidity,
      vento: data.wind.speed,
      icone: data.weather[0].icon
    });

  } catch (error) {
    response.status(500).json({ 
      error: 'Erro ao buscar dados do clima',
      detalhes: error.message
    });
  }
}