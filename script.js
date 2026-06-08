const formulario = document.getElementById("form-transacao");

const transacoes = [];

function atualizarSaldo() {
    let saldo = 0;

    // Lista com todas as categorias que devem SOMAR no saldo
    const categoriasReceita = ["Salário", "Freelance", "Investimentos", "Outras Entradas"];

    for (const transacao of transacoes) {
        if (categoriasReceita.includes(transacao.categoria)) {
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
    const containerTexto = document.createElement("div");
    const botaoExcluir = document.createElement("button");

    const dataObjeto = new Date(transacao.data + 'T00:00:00');
    const dataFormatada = dataObjeto.toLocaleDateString('pt-BR');

    // Texto principal contendo Data, Categoria, Descrição e Valor
    containerTexto.textContent =
        `${dataFormatada} | [${transacao.categoria}] ${transacao.descricao} - ${transacao.valor.toLocaleString("pt-BR", {
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

    item.appendChild(containerTexto);
    item.appendChild(botaoExcluir);
    lista.appendChild(item);
}

formulario.addEventListener("submit", (event) => {
    event.preventDefault();

    const data = document.getElementById("data").value;
    const descricao = document.getElementById("descricao").value;
    const categoria = document.getElementById("categoria").value; 

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
        data,
        descricao,
        categoria, 
        valor
    };

    transacoes.push(transacao);
    salvarTransacoes();
    atualizarSaldo();
    criarItemTransacao(transacao);

    const mensagem = document.getElementById("mensagem");
    mensagem.textContent = "✨ Nova movimentação adicionada com sucesso.";

    // Limpa os campos do formulário
    document.getElementById("descricao").value = "";
    document.getElementById("valor").value = "";
    document.getElementById("categoria").value = "Salário"; // Reseta para a primeira opção
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