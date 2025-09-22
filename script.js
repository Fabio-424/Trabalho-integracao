document.addEventListener('DOMContentLoaded', function() {
  const inputCep = document.getElementById('inputCep');
  const btnCep = document.getElementById('btnCep');
  const resultado = document.getElementById('resultado');

  //formatando o cep
  inputCep.addEventListener('input', function(e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 5) {
      value = value.replace(/^(\d{5})(\d)/, '$1-$2');
    }
    e.target.value = value.substring(0, 9);
  });

  btnCep.addEventListener('click', consultarCep);
  inputCep.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') consultarCep();
  });

  async function consultarCep() {
    const cep = inputCep.value.replace(/\D/g, '');
    
    if (cep.length !== 8) {
      resultado.innerHTML = '<div class="erro">Digite um CEP válido com 8 dígitos</div>';
      return;
    }

    resultado.innerHTML = '<div class="loading">Buscando dados...</div>';

    try {
      const response = await fetch(`/api/cep_clima_integracao?cep=${cep}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao buscar dados");
      }

      resultado.innerHTML = `
        <div class="card">
          <h2>📍 Endereço</h2>
          <p><strong>CEP:</strong> ${data.cep}</p>
          <p><strong>Logradouro:</strong> ${data.logradouro || "Não informado"}</p>
          <p><strong>Bairro:</strong> ${data.bairro || "Não informado"}</p>
          <p><strong>Cidade:</strong> ${data.cidade} - ${data.estado}</p>

          <h2>🌤️ Clima</h2>
          <div class="clima">
            <img src="https://openweathermap.org/img/wn/${data.clima.icone}@2x.png" alt="icone clima"/>
            <div>
              <p><strong>${data.clima.temperatura}°C</strong> - ${data.clima.descricao}</p>
              <p>Umidade: ${data.clima.umidade}%</p>
              <p>Vento: ${data.clima.vento} m/s</p>
            </div>
          </div>
        </div>
      `;
    } catch (error) {
      resultado.innerHTML = `<div class="erro">${error.message}</div>`;
    }
  }
});
