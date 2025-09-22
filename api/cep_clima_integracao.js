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
    // --- 1. Buscar endereço ---
    const apiUrlCep = `https://viacep.com.br/ws/${cep}/json/`;
    const apiResponseCep = await fetch(apiUrlCep);

    if (!apiResponseCep.ok) {
      throw new Error(`Erro na API de CEP: ${apiResponseCep.status}`);
    }

    const dataCep = await apiResponseCep.json();

    if (dataCep.erro) {
      throw new Error('CEP não encontrado');
    }

    // --- 2. Buscar clima da cidade ---
    const apiKey = "a7316fab206ebe1f315ca75436b3579f"; // sua chave
    const apiUrlClima = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(dataCep.localidade)}&appid=${apiKey}&units=metric&lang=pt_br`;
    
    const apiResponseClima = await fetch(apiUrlClima);
    if (!apiResponseClima.ok) {
      throw new Error(`Erro na API de clima: ${apiResponseClima.status}`);
    }

    const dataClima = await apiResponseClima.json();

    // --- 3. Retorno combinado ---
    response.status(200).json({
      cep: dataCep.cep,
      logradouro: dataCep.logradouro,
      bairro: dataCep.bairro,
      cidade: dataCep.localidade,
      estado: dataCep.uf,
      clima: {
        temperatura: Math.round(dataClima.main.temp),
        descricao: dataClima.weather[0].description,
        umidade: dataClima.main.humidity,
        vento: dataClima.wind.speed,
        icone: dataClima.weather[0].icon
      }
    });

  } catch (error) {
    response.status(500).json({
      error: "Erro ao buscar dados",
      detalhes: error.message
    });
  }
}
