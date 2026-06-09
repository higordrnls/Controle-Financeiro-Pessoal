const formulario = document.getElementById("form-transacao");
const transacoes = [];

const categoriasReceita = ["Salário", "Freelance", "Investimentos", "Outras Entradas"];

const todasCategorias = [
    "Salário", "Freelance", "Investimentos", "Outras Entradas", "Assinaturas", 
    "Carro", "Casa", "Combustível", "Delivery", "Educação", "Farmácia", 
    "Lazer", "Lojas", "Loterias", "Mercado", "Pets", "Restaurantes", 
    "Saúde", "Transporte por App", "Transporte Público", "Viagens"
];

const listaMesesRef = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

// Escuta mudanças no seletor de períodos
document.addEventListener("change", (e) => {
    if (e.target.id === "ver-saldo-periodo") {
        atualizarSaldo();
    }
});

function obterPeriodo(dataString) {
    if (!dataString) return "";
    const data = new Date(dataString + "T00:00:00"); // Força o fuso horário local correto
    return `${listaMesesRef[data.getMonth()]} ${data.getFullYear()}`;
}

// Função auxiliar para ordenar períodos cronologicamente (Trata "Mês Ano")
function ordenarPeriodos(arrayDePeriodos) {
    return arrayDePeriodos.sort((a, b) => {
        const [mesA, anoA] = a.split(" ");
        const [mesB, anoB] = b.split(" ");

        if (anoA !== anoB) {
            return Number(anoA) - Number(anoB);
        }

        return listaMesesRef.indexOf(mesA) - listaMesesRef.indexOf(mesB);
    });
}

// Reorganiza fisicamente as colunas do board na tela seguindo a ordem cronológica
function ordenarColunasNoBoard() {
    const board = document.getElementById("board");
    if (!board) return;

    const colunas = Array.from(board.querySelectorAll(".trello-column"));
    
    colunas.sort((a, b) => {
        const periodoA = a.dataset.periodo;
        const periodoB = b.dataset.periodo;
        
        const [mesA, anoA] = periodoA.split(" ");
        const [mesB, anoB] = periodoB.split(" ");

        if (anoA !== anoB) {
            return Number(anoA) - Number(anoB);
        }
        return listaMesesRef.indexOf(mesA) - listaMesesRef.indexOf(mesB);
    });

    // Reanexa as colunas já ordenadas ao DOM do board
    colunas.forEach(coluna => board.appendChild(coluna));
}

function descobrirTipoPorCategoria(categoria) {
    return categoriasReceita.includes(categoria) ? "Entrada" : "Saída";
}

function atualizarSaldo() {
    const seletor = document.getElementById("ver-saldo-periodo");
    if (!seletor) return;

    const periodoSelecionado = seletor.value;
    let saldo = 0;

    transacoes.forEach(transacao => {
        if (transacao.periodo !== periodoSelecionado) {
            return;
        }

        if (transacao.tipo === "Entrada") {
            saldo += Number(transacao.valor);
        } else {
            saldo -= Number(transacao.valor);
        }
    });

    const elementoSaldo = document.getElementById("saldo");
    if (elementoSaldo) {
        elementoSaldo.textContent = saldo.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });
    }
}

function ordenarTransacoes(lista) {
    if (!lista) return;
    const cards = Array.from(lista.children);

    cards.sort((a, b) => {
        const transacaoA = JSON.parse(a.dataset.transacao);
        const transacaoB = JSON.parse(b.dataset.transacao);

        if (transacaoA.tipo !== transacaoB.tipo) {
            return transacaoA.tipo === "Entrada" ? -1 : 1;
        }

        return new Date(transacaoA.data) - new Date(transacaoB.data);
    });

    cards.forEach(card => lista.appendChild(card));
}

function criarItemTransacao(transacao) {
    if (!transacao.periodo) return;
    const coluna = criarColuna(transacao.periodo);
    const listaAlvo = coluna.querySelector(".trello-list");
    if (!listaAlvo) return;

    // DEFINIÇÃO ÚNICA E CORRETA DO CARD
    const card = document.createElement("li");
    card.classList.add("trello-card-item");
    card.draggable = true; 
    card.dataset.transacao = JSON.stringify(transacao);
    
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
            if (inputData.value && inputData.value !== transacao.data) {
                const antigoPeriodo = transacao.periodo;
                const novoPeriodo = obterPeriodo(inputData.value);
                
                transacao.data = inputData.value;
                transacao.periodo = novoPeriodo;
                spanData.textContent = formatarDataTela(inputData.value);
                
                card.dataset.transacao = JSON.stringify(transacao);

                if (antigoPeriodo !== novoPeriodo) {
                    const novaColuna = criarColuna(novoPeriodo);
                    const novaLista = novaColuna.querySelector(".trello-list");
                    if (novaLista) {
                        novaLista.appendChild(card);
                        ordenarTransacoes(novaLista);
                    }
                    atualizarFiltroPeriodos();
                } else {
                    ordenarTransacoes(card.closest(".trello-list"));
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
            
            card.dataset.transacao = JSON.stringify(transacao);
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
                
                card.dataset.transacao = JSON.stringify(transacao);
                
                ordenarTransacoes(card.closest(".trello-list"));
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
                
                card.dataset.transacao = JSON.stringify(transacao);
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
            atualizarFiltroPeriodos();
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
    ordenarTransacoes(listaAlvo);
}

// Configuração inicial do Drag and Drop nas colunas existentes
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
        const novoPeriodo = coluna.getAttribute("data-periodo");

        if (transacao && transacao.periodo !== novoPeriodo){
            transacao.periodo = novoPeriodo;
            salvarTransacoes();
            
            const listaInterna = coluna.querySelector(".trello-list");
            const cardSendoArrastado = document.querySelector(".arrastando");
            if (cardSendoArrastado) {
                listaInterna.appendChild(cardSendoArrastado);
                cardSendoArrastado.dataset.transacao = JSON.stringify(transacao);
                ordenarTransacoes(listaInterna);
            }
            
            atualizarFiltroPeriodos();
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
        atualizarFiltroPeriodos();
        salvarTransacoes();
        atualizarSaldo();
        criarItemTransacao(transacao);

        const mensagem = document.getElementById("mensagem");
        if (mensagem) {
            mensagem.textContent = `✨ Adicionado com sucesso em ${periodo}!`;
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
        atualizarFiltroPeriodos();
        atualizarSaldo();
        return;
    }

    try {
        const transacoesConvertidas = JSON.parse(transacoesSalvas);
        transacoes.push(...transacoesConvertidas);

        // Atualiza filtros primeiro antes de criar elementos
        atualizarFiltroPeriodos();

        for (const transacao of transacoesConvertidas) {
            criarItemTransacao(transacao);
        }
    } catch (e) {
        console.error("Erro ao carregar dados locales:", e);
    }

    atualizarSaldo();
}

function criarColuna(periodo) {
    const board = document.getElementById("board");
    if (!board) return null;

    let colunaExistente = document.querySelector(`[data-periodo="${periodo}"]`);
    if (colunaExistente) {
        return colunaExistente;
    }

    const coluna = document.createElement("div");
    coluna.classList.add("trello-column");
    coluna.dataset.periodo = periodo;

    coluna.innerHTML = `
        <h3>${periodo}</h3>
        <ul class="trello-list"></ul>
    `;

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
        const novoPeriodo = coluna.dataset.periodo;

        if (transacao) {
            transacao.periodo = novoPeriodo;
            salvarTransacoes();

            const listaInterna = coluna.querySelector(".trello-list");
            const cardSendoArrastado = document.querySelector(".arrastando");

            if (cardSendoArrastado) {
                listaInterna.appendChild(cardSendoArrastado);
                cardSendoArrastado.dataset.transacao = JSON.stringify(transacao);
                ordenarTransacoes(listaInterna);
            }

            atualizarFiltroPeriodos();
            atualizarSaldo();
        }
    });

    board.appendChild(coluna);
    
    // O PULO DO GATO: Reordena as colunas fisicamente após a adição de uma nova
    ordenarColunasNoBoard();
    
    return coluna;
}

function atualizarFiltroPeriodos() {
    const seletor = document.getElementById("ver-saldo-periodo");
    if (!seletor) return;

    // Pega o valor que estava selecionado antes de atualizar, pra não perder a seleção do usuário
    const valorAtual = seletor.value;

    let periodos = [...new Set(transacoes.map(t => t.periodo))];

    // O PULO DO GATO: Ordena cronologicamente os períodos antes de preencher o select
    periodos = ordenarPeriodos(periodos);

    seletor.innerHTML = "";

    if (periodos.length === 0) {
        const option = document.createElement("option");
        option.textContent = "Nenhum período";
        seletor.appendChild(option);
        return;
    }

    periodos.forEach(periodo => {
        const option = document.createElement("option");
        option.value = periodo;
        option.textContent = periodo;
        if (periodo === valorAtual) option.selected = true;
        seletor.appendChild(option);
    });
}

// Inicialização do Dark Mode
const btnAlternarTema = document.getElementById('alternar-tema');
const temaSalvo = localStorage.getItem('tema');
if (temaSalvo === 'dark') {
    document.body.classList.add('dark');
}

if (btnAlternarTema) {
    btnAlternarTema.addEventListener('click', () => {
        document.body.classList.toggle('dark');
        if (document.body.classList.contains('dark')) {
            localStorage.setItem('tema', 'dark');
        } else {
            localStorage.setItem('tema', 'light');
        }
    });
}

// Executa a carga inicial dos dados
carregarTransacoes();