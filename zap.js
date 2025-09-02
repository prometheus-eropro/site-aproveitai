document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById('formCliente');
  if (!form) return;

  function somenteDigitos(s) {
    return (s || "").replace(/\D/g, "");
  }

  function gerarIdPublico() {
    const r = Math.random().toString(36).slice(2, 7).toUpperCase();
    const s = Math.random().toString(36).slice(2, 7).toUpperCase();
    return `APV-${r}-${s}`;
  }

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    const BASE_ID = "appMQwMQMQz7dLISZ";
    const TABLE = "clientes";
    const API_KEY = "SEU_API_KEY"; // ⚠️ TROQUE

    const idPublico = gerarIdPublico();
    const cpf = somenteDigitos(form.cpf.value);

    const fields = {
      "nome": form.nome.value.trim(),
      "cpf": cpf,
      "dataNascimento": new Date(form.dataNascimento.value).toISOString().split("T")[0],
      "celular": somenteDigitos(form.celular.value),
      "grupo": form.grupo.value.trim(),
      "cidade": form.cidade.value.trim(),
      "ativo": "NÃO",
      "idPublico": idPublico,
      "dataCadastro": new Date().toISOString().split("T")[0],
      "qrURL": `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(idPublico)}`
    };

    const urlCheck = `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(TABLE)}?maxRecords=1&filterByFormula=${encodeURIComponent(`{cpf}='${cpf}'`)}`;
    const headers = {
      "Authorization": `Bearer ${API_KEY}`,
      "Content-Type": "application/json"
    };

    try {
      const r0 = await fetch(urlCheck, { headers });
      const j0 = await r0.json();

      if (j0.records.length) {
        const confirmado = confirm("CPF já cadastrado. Deseja cadastrar mesmo assim?");
        if (!confirmado) return;
      }

      const response = await fetch(`https://api.airtable.com/v0/${BASE_ID}/${TABLE}`, {
        method: "POST",
        headers,
        body: JSON.stringify({ fields })
      });

      if (!response.ok) throw new Error("Erro ao salvar no Airtable");

      alert("Cadastro enviado!");
      form.reset();

      const nomeZap = fields.nome;
      const cpfZap = fields.cpf.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4");
      const mensagem = `Olá! Fiz meu cadastro no site e quero ativar meu cartão.%0A%0ANome: ${nomeZap}%0ACPF: ${cpfZap}`;
      const numero = "5528999692303";
      const urlZap = `https://api.whatsapp.com/send?phone=${numero}&text=${mensagem}`;

      window.open(urlZap, "_blank");
    } catch (err) {
      console.error(err);
      alert("Erro ao cadastrar. Veja o console.");
    }
  });
});
