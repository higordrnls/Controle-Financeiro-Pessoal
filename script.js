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

   item.textContent =
    `${transacao.data} | ${transacao.descricao} - ${transacao.valor.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    })} `;

    botaoExcluir.textContent = "❌";

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

    const valor = Number(
        document.getElementById("valor")
            .value
            .replace(",", ".")
    );

    const transacao = {
    tipo,
    data,
    descricao,
    valor
};

    transacoes.push(transacao);

    salvarTransacoes();

    atualizarSaldo();

    criarItemTransacao(transacao);

    console.log(transacoes);

    const mensagem = document.getElementById("mensagem");

    mensagem.textContent =
        "✨ Nova movimentação adicionada com sucesso.";

    document.getElementById("descricao").value = "";

    document.getElementById("valor").value = "";

});

function salvarTransacoes() {

    localStorage.setItem(
        "transacoes",
        JSON.stringify(transacoes)
    );

}

function carregarTransacoes() {

    const transacoesSalvas =
        localStorage.getItem("transacoes");

    if (!transacoesSalvas) {
        return;
    }

    const transacoesConvertidas =
        JSON.parse(transacoesSalvas);

    transacoes.push(...transacoesConvertidas);

    for (const transacao of transacoesConvertidas) {

        criarItemTransacao(transacao);

    }

    atualizarSaldo();

}

carregarTransacoes();

console.log(transacoes);