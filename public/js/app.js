// Funções AJAX com fetch: a página NÃO recarrega.
// Se o servidor estiver fora do ar, aparece uma mensagem de erro, não uma tela quebrada.
(function () {
  const csrf = document.querySelector('meta[name="csrf-token"]').content;

  function mostrarMensagem(texto, tipo) {
    const caixa = document.getElementById('mensagem');
    if (!caixa) return alert(texto);
    caixa.textContent = texto;
    caixa.className = 'mensagem ' + (tipo || 'sucesso');
    caixa.hidden = false;
    clearTimeout(caixa._t);
    caixa._t = setTimeout(() => { caixa.hidden = true; }, 4000);
  }

  // Lê o JSON da resposta e transforma erro HTTP em exceção com a mensagem do servidor.
  async function lerResposta(resposta) {
    let dados = {};
    try { dados = await resposta.json(); } catch (e) { /* resposta sem JSON */ }
    if (!resposta.ok) throw new Error(dados.erro || 'Não foi possível concluir a ação.');
    return dados;
  }

  // ---------- AJAX 1: busca de eventos enquanto digita ----------
  const campoBusca = document.getElementById('busca');
  if (campoBusca) {
    const lista = document.getElementById('busca-resultados');
    const status = document.getElementById('busca-status');
    let espera;

    campoBusca.addEventListener('input', () => {
      clearTimeout(espera);
      const termo = campoBusca.value.trim();
      if (termo.length < 2) { lista.innerHTML = ''; status.textContent = ''; return; }
      espera = setTimeout(() => buscar(termo), 300); // espera o usuário parar de digitar
    });

    async function buscar(termo) {
      status.textContent = 'Buscando...';
      try {
        const resposta = await fetch('/api/eventos?q=' + encodeURIComponent(termo));
        const eventos = await lerResposta(resposta);
        lista.innerHTML = '';
        eventos.forEach((ev) => {
          const item = document.createElement('li');
          const link = document.createElement('a');
          link.href = '/eventos/' + ev.id;
          link.textContent = ev.titulo; // textContent: nada vindo do servidor vira HTML
          const info = document.createElement('span');
          info.textContent = ' · ' + ev.categoria + ' · ' + new Date(ev.data + 'T12:00:00').toLocaleDateString('pt-BR');
          item.append(link, info);
          lista.appendChild(item);
        });
        status.textContent = eventos.length ? eventos.length + ' resultado(s)' : 'Nenhum evento encontrado.';
      } catch (erro) {
        lista.innerHTML = '';
        status.textContent = erro instanceof TypeError
          ? 'Sem conexão com o servidor. Tente de novo.'
          : erro.message;
      }
    }
  }

  // ---------- AJAX 2: inscrever-se / cancelar inscrição ----------
  document.addEventListener('click', async (e) => {
    const botao = e.target.closest('.js-inscricao');
    if (!botao) return;
    const cartao = botao.closest('.evento');
    const acao = botao.dataset.acao;
    const url = acao === 'inscrever'
      ? '/api/eventos/' + botao.dataset.evento + '/inscricao'
      : '/api/inscricoes/' + botao.dataset.inscricao;

    botao.disabled = true;
    try {
      const resposta = await fetch(url, {
        method: acao === 'inscrever' ? 'POST' : 'DELETE',
        headers: { 'X-CSRF-Token': csrf, 'Accept': 'application/json' }
      });
      const dados = await lerResposta(resposta);

      if (botao.dataset.remover) { // no painel, o cartão some
        cartao.remove();
        mostrarMensagem('Inscrição cancelada.');
        return;
      }
      const ocupadas = cartao.querySelector('.js-ocupadas');
      if (ocupadas) ocupadas.textContent = dados.ocupadas;

      if (acao === 'inscrever') {
        botao.dataset.acao = 'cancelar';
        botao.dataset.inscricao = dados.inscricaoId;
        botao.textContent = 'Cancelar inscrição';
        botao.classList.add('botao-perigo');
        mostrarMensagem('Inscrição confirmada!');
      } else {
        botao.dataset.acao = 'inscrever';
        delete botao.dataset.inscricao;
        botao.textContent = 'Inscrever-se';
        botao.classList.remove('botao-perigo');
        mostrarMensagem('Inscrição cancelada.');
      }
      botao.disabled = false;
    } catch (erro) {
      botao.disabled = false;
      mostrarMensagem(erro instanceof TypeError ? 'Sem conexão com o servidor. Tente de novo.' : erro.message, 'erro');
    }
  });

  // Confirmação antes de excluir (sem script inline, por causa do helmet/CSP)
  document.querySelectorAll('.js-confirmar').forEach((form) => {
    form.addEventListener('submit', (e) => {
      if (!confirm(form.dataset.pergunta || 'Tem certeza?')) e.preventDefault();
    });
  });
})();
