const API_KEY = 'patXmYwor3EFZGPte.628d2ecfcd251aab41181f5f8f0c601aa042c7195daad22f4178e2c5e0853c67';
const BASE_ID = 'appMQwMQMQz7dLISZ';
const TABELA_LOG = 'log';
const CNPJ_PARCEIRO = sessionStorage.getItem('cnpjParceiro');

async function carregarConsultas() {
  const cincoDiasAtras = new Date();
  cincoDiasAtras.setDate(cincoDiasAtras.getDate() - 5);
  const dataFiltro = cincoDiasAtras.toISOString().split('T')[0]; // formato 'DD-MM-YYYY'

  const url = `https://api.airtable.com/v0/${BASE_ID}/${TABELA_LOG}?filterByFormula=AND({cnpj}='${CNPJ_PARCEIRO}', IS_AFTER({dataHora}, '${dataFiltro}'))&sort[0][field]=dataHora&sort[0][direction]=desc`;

  const resp = await fetch(url, {
    headers: { Authorization: `Bearer ${API_KEY}` }
  });

  const data = await resp.json();
  const div = document.getElementById('listaConsultas');
  div.innerHTML = '';

  data.records.forEach(reg => {
    const f = reg.fields;
    const status = (f.statusCliente || '').toLowerCase();
    const classe = status === 'ativo' ? 'ativo' : (status === 'inativo' ? 'inativo' : 'erro');
    const emoji = status === 'ativo' ? '✅' : (status === 'inativo' ? '❌' : '⚠️');
    const nome = f.nomeCliente || f.nome || 'Desconhecido';
    const hora = f.dataHora ? formatarDataHoraBrasileira(f.dataHora) : '---';
    const codigo = f.codigoAutorizacao || '---';

function formatarDataHoraBrasileira(isoString) {
  const data = new Date(isoString);
  const dia = String(data.getDate()).padStart(2, '0');
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const ano = data.getFullYear();
  const horas = String(data.getHours()).padStart(2, '0');
  const minutos = String(data.getMinutes()).padStart(2, '0');
  return `${dia}/${mes}/${ano} ${horas}:${minutos}`;
}

if (data.records.length === 0) {
  div.innerHTML = '<p style="color: gray; text-align: center;">Nenhuma consulta recente encontrada.</p>';
  document.getElementById("mensagemAviso").innerText = "CNPJ não encontrado. Faça login novamente.";
  return;
}
    div.innerHTML += `
      <div class="consulta ${classe}">
        <strong>${emoji} ${nome}</strong><br>
        Código: <strong>${codigo}</strong><br>
        Status: <strong>${status.toUpperCase()}</strong><br>
        Data/Hora: ${hora}
      </div>
    `;
  });
}


carregarConsultas();
