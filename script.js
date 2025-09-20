document.addEventListener('DOMContentLoaded', function() {
    // Elementos do DOM
    const inputCep = document.getElementById('inputCep');
    const btnCep = document.getElementById('btnCep');
    const resultadoCep = document.getElementById('resultadoCep');
    
    const inputCidade = document.getElementById('inputCidade');
    const btnClima = document.getElementById('btnClima');
    const resultadoClima = document.getElementById('resultadoClima');
    
    const btnIntegrar = document.getElementById('btnIntegrar');
    const resultadoIntegrado = document.getElementById('resultadoIntegrado');

    // Formatador de CEP
    inputCep.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 5) {
            value = value.replace(/^(\d{5})(\d)/, '$1-$2');
        }
        e.target.value = value.substring(0, 9);
    });

    // Consulta de CEP
    btnCep.addEventListener('click', consultarCep);
    inputCep.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') consultarCep();
    });

    // Consulta de Clima
    btnClima.addEventListener('click', consultarClima);
    inputCidade.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') consultarClima();
    });

    // Integração das duas APIs
    btnIntegrar.addEventListener('click', integrarApis);

    async function consultarCep() {
        const cep = inputCep.value.replace(/\D/g, '');
        
        if (cep.length !== 8) {
            resultadoCep.innerHTML = '<div class="erro">⚠️ Digite um CEP válido com 8 dígitos</div>';
            return;
        }

        resultadoCep.innerHTML = '<div class="loading">Buscando endereço...</div>';
        
        try {
            const response = await fetch(`/api/cep?cep=${cep}`);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Erro ao buscar CEP');
            }
            
            resultadoCep.innerHTML = `
                <div class="sucesso">
                    <h3>📍 Endereço Encontrado</h3>
                    <p><strong>CEP:</strong> ${data.cep}</p>
                    <p><strong>Logradouro:</strong> ${data.logradouro || 'Não informado'}</p>
                    <p><strong>Bairro:</strong> ${data.bairro || 'Não informado'}</p>
                    <p><strong>Cidade:</strong> ${data.cidade}</p>
                    <p><strong>Estado:</strong> ${data.estado}</p>
                </div>
            `;
            
            // Preenche automaticamente o campo de cidade para integração
            inputCidade.value = data.cidade;
            
        } catch (error) {
            resultadoCep.innerHTML = `<div class="erro">❌ ${error.message}</div>`;
        }
    }

    async function consultarClima() {
        const cidade = inputCidade.value.trim();
        
        if (!cidade) {
            resultadoClima.innerHTML = '<div class="erro">⚠️ Digite o nome de uma cidade</div>';
            return;
        }

        resultadoClima.innerHTML = '<div class="loading">Buscando previsão do tempo...</div>';
        
        try {
            const response = await fetch(`/api/clima?cidade=${encodeURIComponent(cidade)}`);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Erro ao buscar clima');
            }
            
            resultadoClima.innerHTML = `
                <div class="sucesso">
                    <h3>🌤️ Clima em ${data.cidade}</h3>
                    <p><strong>Temperatura:</strong> ${data.temperatura}°C</p>
                    <p><strong>Condição:</strong> ${data.descricao}</p>
                    <p><strong>Umidade:</strong> ${data.umidade}%</p>
                    <p><strong>Vento:</strong> ${data.vento} m/s</p>
                </div>
            `;
            
        } catch (error) {
            resultadoClima.innerHTML = `<div class="erro">❌ ${error.message}</div>`;
        }
    }

    async function integrarApis() {
        const cep = inputCep.value.replace(/\D/g, '');
        
        if (cep.length !== 8) {
            resultadoIntegrado.innerHTML = '<div class="erro">⚠️ Digite um CEP válido primeiro</div>';
            return;
        }

        resultadoIntegrado.innerHTML = '<div class="loading">Integrando APIs... Buscando CEP e depois clima.</div>';
        
        try {
            // Primeiro busca o CEP
            const responseCep = await fetch(`/api/cep?cep=${cep}`);
            const dataCep = await responseCep.json();
            
            if (!responseCep.ok) {
                throw new Error(dataCep.error || 'Erro ao buscar CEP');
            }
            
            // Depois busca o clima baseado na cidade do CEP
            const responseClima = await fetch(`/api/clima?cidade=${encodeURIComponent(dataCep.cidade)}`);
            const dataClima = await responseClima.json();
            
            if (!responseClima.ok) {
                throw new Error(dataClima.error || 'Erro ao buscar clima');
            }
            
            resultadoIntegrado.innerHTML = `
                <div class="sucesso">
                    <h3>🔄 Integração Concluída</h3>
                    
                    <div class="info-cep">
                        <h4>📍 Dados do CEP ${dataCep.cep}:</h4>
                        <p>${dataCep.logradouro || ''} ${dataCep.bairro || ''}</p>
                        <p>${dataCep.cidade} - ${dataCep.estado}</p>
                    </div>
                    
                    <div class="info-clima">
                        <h4>🌤️ Clima em ${dataClima.cidade}:</h4>
                        <p><strong>${dataClima.temperatura}°C</strong> - ${dataClima.descricao}</p>
                        <p>Umidade: ${dataClima.umidade}% | Vento: ${dataClima.vento} m/s</p>
                    </div>
                </div>
            `;
            
        } catch (error) {
            resultadoIntegrado.innerHTML = `<div class="erro">❌ Erro na integração: ${error.message}</div>`;
        }
    }
});