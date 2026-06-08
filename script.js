const formulario = document.getElementById("form-transacao");

const transacoes = [];

function atualizarSaldo() {
    let saldo = 0;

    for (const transacao of transacoes) {
        if (transacao.tipo === "receita") {
            saldo += transacao.valor;
        } else {
            saldo -= transacao.valor;
        }
    }

    document.getElementById("saldo").textContent =
        saldo.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });
}

function criarItemTransacao(transacao) {
    const lista = document.getElementById("lista-transacoes");
    const item = document.createElement("li");
    const botaoExcluir = document.createElement("button");

    const dataObjeto = new Date(transacao.data + 'T00:00:00');
    const dataFormatada = dataObjeto.toLocaleDateString('pt-BR');

    // Exibe a categoria salva entre colchetes antes da descrição
    item.textContent =
        `${dataFormatada} | [${transacao.categoria || 'Outros'}] ${transacao.descricao} - ${transacao.valor.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        })} `;

    botaoExcluir.textContent = "❌";
    botaoExcluir.setAttribute("aria-label", "Excluir esta transação");

    botaoExcluir.addEventListener("click", () => {
        const indice = transacoes.indexOf(transacao);
        transacoes.splice(indice, 1);
        salvarTransacoes();
        item.remove();
        atualizarSaldo();
    });

    item.appendChild(botaoExcluir);
    lista.appendChild(item);
}

formulario.addEventListener("submit", (event) => {
    event.preventDefault();

    const tipo = document.getElementById("tipo").value;
    const data = document.getElementById("data").value;
    const descricao = document.getElementById("descricao").value;
    const categoria = document.getElementById("categoria").value; // Captura a categoria

    const valor = Number(
        document.getElementById("valor")
            .value
            .replace(",", ".")
    );

    if (isNaN(valor) || valor <= 0) {
        alert("Por favor, insira um valor numérico válido e maior que zero!");
        return; 
    }

    const transacao = {
        tipo,
        data,
        descricao,
        categoria, // Salva a categoria no objeto
        valor
    };

    transacoes.push(transacao);
    salvarTransacoes();
    atualizarSaldo();
    criarItemTransacao(transacao);

    const mensagem = document.getElementById("mensagem");
    mensagem.textContent = "✨ Nova movimentação adicionada com sucesso.";

    document.getElementById("descricao").value = "";
    document.getElementById("valor").value = "";
    document.getElementById("categoria").value = "Outros"; // Reseta o campo de categoria
});

function salvarTransacoes() {
    localStorage.setItem(
        "transacoes",
        JSON.stringify(transacoes)
    );
}

function carregarTransacoes() {
    const transacoesSalvas = localStorage.getItem("transacoes");

    if (!transacoesSalvas) {
        return;
    }

    const transacoesConvertidas = JSON.parse(transacoesSalvas);
    transacoes.push(...transacoesConvertidas);

    for (const transacao of transacoesConvertidas) {
        criarItemTransacao(transacao);
    }

    atualizarSaldo();
}

carregarTransacoes();