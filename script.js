const formulario = document.getElementById("form-transacao");
const transacoes = [];

const categoriasReceita = ["Salário", "Freelance", "Investimentos", "Outras Entradas"];

const todasCategorias = [
    "Salário", "Freelance", "Investimentos", "Outras Entradas", "Assinaturas", 
    "Carro", "Casa", "Combustível", "Delivery", "Educação", "Farmácia", 
    "Lazer", "Lojas", "Loterias", "Mercado", "Pets", "Restaurantes", 
    "Saúde", "Transporte por App", "Transporte Público", "Viagens"
];

function obterPeriodo(dataString) {

    const data = new Date(dataString);

    const meses = [
        "Janeiro",
        "Fevereiro",
        "Março",
        "Abril",
        "Maio",
        "Junho",
        "Julho",
        "Agosto",
        "Setembro",
        "Outubro",
        "Novembro",
        "Dezembro"
    ];

    return `${meses[data.getMonth()]} ${data.getFullYear()}`;

}



function descobrirTipoPorCategoria(categoria) {
    return categoriasReceita.includes(categoria) ? "Entrada" : "Saída";
}

function atualizarSaldo() {

    let saldo = 0;

    for (const transacao of transacoes) {

        if (transacao.tipo === "Entrada") {
            saldo += Number(transacao.valor);
        } else {
            saldo -= Number(transacao.valor);
        }

    }

    document.getElementById("saldo")
        .textContent =
        saldo.toLocaleString(
            "pt-BR",
            {
                style: "currency",
                currency: "BRL"
            }
        );
}



function criarItemTransacao(transacao) {
    if (!transacao.periodo) return;
    const coluna =
    criarColuna(transacao.periodo);

const listaAlvo =
    coluna.querySelector(".trello-list");
    if (!listaAlvo) return;

    const card = document.createElement("li");
    card.classList.add("trello-card-item");
    card.draggable = true; 
    
    card.style.borderLeftColor = transacao.tipo === "Entrada" ? "#61bd4f" : "#ec9488";

    const containerTexto = document.createElement("div");
    containerTexto.classList.add("card-main-content");

    // 1. DATA
    const spanData = document.createElement("span");
    spanData.classList.add("card-date", "editavel");
    
    const formatarDataTela = (dataString) => {
        if (!dataString) return "";
        const partes = dataString.split("-");
        return `${partes[2]}/${partes[1]}/${partes[0]}`;
    };
    
    spanData.textContent = formatarDataTela(transacao.data);
    spanData.title = "Clique para editar a data";

    spanData.addEventListener("click", () => {
        const inputData = document.createElement("input");
        inputData.type = "date";
        inputData.value = transacao.data;
        inputData.classList.add("input-edicao-data");

        const salvarEdicaoData = () => {
            if (inputData.value) {
                transacao.data = inputData.value;
                spanData.textContent = formatarDataTela(inputData.value);
                
                const novoPeriodo =
    obterPeriodo(inputData.value);
                if (transacao.periodo !== novoPeriodo) {

    transacao.periodo = novoPeriodo;

    const novaColuna =
        criarColuna(novoPeriodo);

    const novaLista =
        novaColuna.querySelector(
            ".trello-list"
        );

    novaLista.appendChild(card);

}
                
                salvarTransacoes();
                atualizarSaldo();
            }
            inputData.replaceWith(spanData);
        };

        inputData.addEventListener("blur", salvarEdicaoData);
        inputData.addEventListener("keydown", (e) => {
            if (e.key === "Enter") salvarEdicaoData();
        });

        spanData.replaceWith(inputData);
        inputData.focus();
    });

    // 2. DESCRIÇÃO
    const spanDescricao = document.createElement("span");
    spanDescricao.classList.add("card-title", "editavel");
    spanDescricao.textContent = transacao.descricao || ""; 
    spanDescricao.title = "Clique para editar a descrição";

    spanDescricao.addEventListener("click", () => {
        const inputEdit = document.createElement("input");
        inputEdit.type = "text";
        inputEdit.value = transacao.descricao || "";
        inputEdit.classList.add("input-edicao");

        const salvarEdicaoDescricao = () => {
            const novoTexto = inputEdit.value.trim();
            transacao.descricao = novoTexto;
            spanDescricao.textContent = novoTexto;
            salvarTransacoes();
            inputEdit.replaceWith(spanDescricao);
        };

        inputEdit.addEventListener("blur", salvarEdicaoDescricao);
        inputEdit.addEventListener("keydown", (e) => {
            if (e.key === "Enter") salvarEdicaoDescricao();
        });

        spanDescricao.replaceWith(inputEdit);
        inputEdit.focus();
    });

    // 3. CATEGORIA
    const spanTag = document.createElement("span");
    spanTag.classList.add("card-tag", "editavel");
    spanTag.textContent = transacao.categoria;
    spanTag.title = "Clique para alterar a categoria";

    const aplicarEstiloTag = (elemento, tipo) => {
        if (tipo === "Entrada") {
            elemento.style.background = "#e2f5dd";
            elemento.style.color = "#237804";
        } else {
            elemento.style.background = "#ffebe6";
            elemento.style.color = "#bf2600";
        }
    };
    aplicarEstiloTag(spanTag, transacao.tipo);

    spanTag.addEventListener("click", () => {
        const selectCategoria = document.createElement("select");
        selectCategoria.classList.add("select-edicao-tag");

        todasCategorias.forEach(cat => {
            const opcao = document.createElement("option");
            opcao.value = cat;
            opcao.textContent = cat;
            if (cat === transacao.categoria) opcao.selected = true;
            selectCategoria.appendChild(opcao);
        });

        const salvarEdicaoCategoria = () => {
            const novaCat = selectCategoria.value;
            if (novaCat && novaCat !== transacao.categoria) {
                transacao.categoria = novaCat;
                spanTag.textContent = novaCat;
                
                const novoTipo = descobrirTipoPorCategoria(novaCat);
                transacao.tipo = novoTipo;
                
                card.style.borderLeftColor = novoTipo === "Entrada" ? "#61bd4f" : "#ec9488";
                aplicarEstiloTag(spanTag, novoTipo);
                
                salvarTransacoes();
                atualizarSaldo();
            }
            selectCategoria.replaceWith(spanTag);
        };

        selectCategoria.addEventListener("blur", salvarEdicaoCategoria);
        selectCategoria.addEventListener("change", salvarEdicaoCategoria);

        spanTag.replaceWith(selectCategoria);
        selectCategoria.focus();
    });

    // 4. VALOR
    const divValor = document.createElement("div");
    divValor.classList.add("card-value", "editavel");
    divValor.textContent = Number(transacao.valor).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
    divValor.title = "Clique para editar o valor";

    divValor.addEventListener("click", () => {
        const inputEdit = document.createElement("input");
        inputEdit.type = "text";
        inputEdit.value = Number(transacao.valor).toFixed(2).replace(".", ",");
        inputEdit.classList.add("input-edicao-valor");

        const salvarEdicaoValor = () => {
            const novoValor = Number(inputEdit.value.replace(",", "."));
            if (!isNaN(novoValor) && novoValor > 0) {
                transacao.valor = novoValor;
                divValor.textContent = novoValor.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL"
                });
                salvarTransacoes();
                atualizarSaldo();
            }
            inputEdit.replaceWith(divValor);
        };

        inputEdit.addEventListener("blur", salvarEdicaoValor);
        inputEdit.addEventListener("keydown", (e) => {
            if (e.key === "Enter") salvarEdicaoValor();
        });

        divValor.replaceWith(inputEdit);
        inputEdit.focus();
    });

    containerTexto.appendChild(spanData);
    containerTexto.appendChild(spanDescricao);
    containerTexto.appendChild(spanTag);

    const botaoExcluir = document.createElement("button");
    botaoExcluir.textContent = "❌";
    botaoExcluir.classList.add("btn-excluir-card");
    
    botaoExcluir.addEventListener("click", () => {
        const indice = transacoes.indexOf(transacao);
        if (indice > -1) {
            transacoes.splice(indice, 1);
            salvarTransacoes();
            card.remove();
            atualizarSaldo();
        }
    });

    card.appendChild(containerTexto);
    card.appendChild(divValor);
    card.appendChild(botaoExcluir);

    card.addEventListener("dragstart", (e) => {
        card.classList.add("arrastando");
        e.dataTransfer.setData("text/plain", transacoes.indexOf(transacao));
    });

    card.addEventListener("dragend", () => {
        card.classList.remove("arrastando");
    });
    
    listaAlvo.appendChild(card);
}

document.querySelectorAll(".trello-column").forEach(coluna => {
    coluna.addEventListener("dragover", (e) => {
        e.preventDefault();
        coluna.classList.add("coluna-destaque");
    });

    coluna.addEventListener("dragleave", () => {
        coluna.classList.remove("coluna-destaque");
    });

    coluna.addEventListener("drop", (e) => {
        e.preventDefault();
        coluna.classList.remove("coluna-destaque");
        
        const indiceTransacao = e.dataTransfer.getData("text/plain");
        const transacao = transacoes[indiceTransacao];
        const novoMes = coluna.getAttribute("data-mes");

        if (transacao && transacao.periodo !== novoMes) {
            transacao.periodo = novoMes;
            salvarTransacoes();
            
            const listaInterna = coluna.querySelector(".trello-list");
            const cardSendoArrastado = document.querySelector(".arrastando");
            if (cardSendoArrastado) {
                listaInterna.appendChild(cardSendoArrastado);
            }
            
            atualizarSaldo();
        }
    });
});

if (formulario) {
    formulario.addEventListener("submit", (event) => {
        event.preventDefault();

        const categoria = document.getElementById("categoria").value; 
        const data = document.getElementById("data").value;
        const descricao = document.getElementById("descricao").value.trim();

        const valor = Number(
            document.getElementById("valor")
                .value
                .replace(",", ".")
        );

        if (isNaN(valor) || valor <= 0) {
            alert("Por favor, insira um valor numérico válido!");
            return; 
        }

        const periodo = obterPeriodo(data);
        const tipo = descobrirTipoPorCategoria(categoria);

        const transacao = {
        tipo,
        categoria,
        periodo,
        data,
        descricao,
    valor
};

        transacoes.push(transacao);
        salvarTransacoes();
        atualizarSaldo();
        criarItemTransacao(transacao);

        const mensagem = document.getElementById("mensagem");
        if (mensagem) {
            mensagem.textContent =
`✨ Adicionado com sucesso em ${periodo}!`;
        }

        document.getElementById("descricao").value = "";
        document.getElementById("valor").value = "";
        document.getElementById("data").value = "";
    });
}

function salvarTransacoes() {
    localStorage.setItem("transacoes", JSON.stringify(transacoes));
}

function carregarTransacoes() {
    const transacoesSalvas = localStorage.getItem("transacoes");

    if (!transacoesSalvas) {
        atualizarSaldo();
        return;
    }

    try {
        const transacoesConvertidas = JSON.parse(transacoesSalvas);
        transacoes.push(...transacoesConvertidas);

        for (const transacao of transacoesConvertidas) {
            criarItemTransacao(transacao);
        }
    } catch (e) {
        console.error("Erro ao carregar dados locais:", e);
    }

    atualizarSaldo();
}

carregarTransacoes();

// ==========================================================================
// CONTROLE DO DARK MODE / MODO ESCURO
// ==========================================================================
const btnAlternarTema = document.getElementById('alternar-tema');

// Verifica se o usuário já tinha uma preferência salva no localStorage
const temaSalvo = localStorage.getItem('tema');
if (temaSalvo === 'dark') {
    document.body.classList.add('dark');
}

// Escuta o clique no botão para alternar o tema
btnAlternarTema.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    
    // Salva a nova escolha no localStorage para persistir no F5
    if (document.body.classList.contains('dark')) {
        localStorage.setItem('tema', 'dark');
    } else {
        localStorage.setItem('tema', 'light');
    }
});

function criarColuna(periodo) {

    const board =
        document.getElementById("board");

    let colunaExistente =
        document.querySelector(
            `[data-periodo="${periodo}"]`
        );

    if (colunaExistente) {
        return colunaExistente;
    }

    const coluna =
        document.createElement("div");

    coluna.classList.add("trello-column");

    coluna.dataset.periodo = periodo;

    coluna.innerHTML = `
        <h3>${periodo}</h3>
        <ul class="trello-list"></ul>
    `;

    board.appendChild(coluna);

    return coluna;

}