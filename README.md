# 💰 Kanban Financeiro Inteligente

> Aplicação web intuitiva para gerenciamento financeiro pessoal, inspirada na organização visual e na dinâmica de quadros estilo Trello/Kanban.

O **Kanban Financeiro** nasceu da necessidade de transformar o controle de despesas e receitas — que geralmente é feito em planilhas complexas — em uma experiência visual, fluida e de fácil entendimento. O projeto foca no acompanhamento mensal inteligente, permitindo uma visão clara da saúde financeira do usuário.

🔗 **[Acesse a aplicação no ar aqui]** *[(Substitua pelo link do seu GitHub Pages depois de fazer o deploy)](https://higordrnls.github.io/Kanban-Financeiro/)*

---

## 📸 Demonstração

*(Dica: Adicione aqui uma imagem ou um GIF mostrando a tela do projeto, o efeito do Dark Mode ou você inserindo uma transação)*
![Demonstração do Kanban Financeiro](seupathtaimagem.png)

---

## 🚀 Funcionalidades Principais

* **Organização Visual (Estilo Trello):** Visualização de movimentações estruturadas em colunas e cartões dinâmicos, simulando um quadro Kanban.
* **Filtro Dinâmico por Período:** Seleção e visualização simplificada do saldo e das transações correspondentes ao mês selecionado.
* **Persistência de Dados (`localStorage`):** Os dados não somem ao atualizar a página (`F5`). Toda a movimentação e preferências ficam salvas localmente no navegador.
* **Cálculo Automático de Saldo:** Processamento instantâneo de receitas e despesas com atualização automática do saldo atual em formato de moeda brasileira (R$).
* **Experiência do Usuário (UX):** * Alternância rápida de temas (Dark Mode / Light Mode).
    * Tratamento de entradas numéricas (aceita pontos ou vírgulas para centavos).
    * Campos obrigatórios com validação nativa.

---

## 🛠️ Tecnologias Utilizadas

A arquitetura do projeto foi desenhada utilizando tecnologias nativas da web (**Vanilla JS**), priorizando desempenho, sem dependências ou frameworks externos:

* **HTML5:** Estruturação semântica e acessível da interface.
* **CSS3:** Estilização moderna baseada em variáveis CSS (para o sistema de temas) e layouts flexíveis/responsivos.
* **JavaScript (Vanilla JS):** Manipulação limpa do DOM, gerenciamento de estados e controle do fluxo de dados.
* **Web Storage API (`localStorage`):** Persistência de dados local segura e sem necessidade de backend.

---

## 📦 Como Executar o Projeto

Como o projeto foi desenvolvido com tecnologias client-side puras, você não precisa instalar nenhuma dependência (como Node.js). 

1. Clone este repositório em sua máquina:
   ```bash
   git clone https://github.com/higordrnls/Kanban-Financeiro