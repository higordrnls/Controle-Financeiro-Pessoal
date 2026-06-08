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

    // Ajuste e formatação da data para o padrão brasileiro
    const dataObjeto = new Date(transacao.data + 'T00:00:00');
    const dataFormatada = dataObjeto.toLocaleDateString('pt-BR');

    // ALTERAÇÃO AQUI: Agora exibe a categoria salva entre colchetes antes da descrição
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
    
    // ALTERAÇÃO AQUI: Captura qual categoria o usuário escolheu no HTML
    const categoria = document.getElementById("categoria").value; 

    const valor = Number(
        document.getElementById("valor")
            .value
            .replace(",", ".")
    );

    // Validação para evitar que valores incorretos quebrem o saldo
    if (isNaN(valor) || valor <= 0) {
        alert("Por favor, insira um valor numérico válido e maior que zero!");
        return; 
    }

    // ALTERAÇÃO AQUI: Adicionamos a propriedade "categoria" dentro do objeto da transação
    const transacao = {
        tipo,
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

    // Limpa os campos de texto do formulário
    document.getElementById("descricao").value = "";
    document.getElementById("valor").value = "";
    
    // ALTERAÇÃO AQUI: Reseta a caixinha de seleção para a opção padrão
    document.getElementById("categoria").value = "Outros"; 
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

// Inicializa a aplicação buscando dados salvos no navegador
carregarTransacoes();