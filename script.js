const formulario = document.getElementById("cadastro-cliente");
const inputNome = document.getElementById("nome-cliente");
const inputEmail = document.getElementById("email-cliente");
const selectPlano = document.getElementById("plano");
const listaClientes = document.getElementById("lista-clientes");
const campoBusca = document.getElementById("campo-busca");
const operadorAtual = document.getElementById("operador");
const inputCep = document.getElementById("cep");
const inputLogradouro = document.getElementById("logradouro");
const inputNumero = document.getElementById("numero");
const inputBairro = document.getElementById("bairro");
const inputCidade = document.getElementById("cidade");
const inputUf = document.getElementById("uf");
const botaoSalvar = document.getElementById("botao-salvar");

let clientes = JSON.parse(localStorage.getItem("clientes_db")) || [];
let operador = sessionStorage.getItem("nome_operador");

if (!operador) {
  operador = prompt("Por favor, digite o seu nome");
}
if (operador) {
  sessionStorage.setItem("nome_operador", operador);
}
if (operador) {
  operadorAtual.textContent = `Operador: ${operador}`;
}

clientes.forEach(function (cliente) {
  renderizarCard(cliente);
});

formulario.addEventListener("submit", function (event) {
  event.preventDefault();
  adicionarCliente();
});

async function adicionarCliente() {
  try {
    botaoSalvar.disabled = true;

    botaoSalvar.textContent = "Salvando...";

    const nome = inputNome.value.trim();
    const email = inputEmail.value.trim();
    const plano = selectPlano.value;

    const existe = clientes.some((c) => c.email === email);
    if (existe) {
      alert("Esse e-mail já está cadastrado");
      return;
    }

    await simularProcessamento();

    if (!inputLogradouro.value) {
      alert("Preencha um CEP válido");
      return;
    }

    const cliente = {
      nome,
      email,
      plano,
      cep: inputCep.value.trim(),
      logradouro: inputLogradouro.value.trim(),
      numero: inputNumero.value.trim(),
      bairro: inputBairro.value.trim(),
      cidade: inputCidade.value.trim(),
      uf: inputUf.value.trim(),
    };

    clientes.push(cliente);

    localStorage.setItem("clientes_db", JSON.stringify(clientes));

    renderizarCard(cliente);

    formulario.reset();

    limparEndereco();
  } catch (erro) {
    alert("Erro ao salvar cliente");
  } finally {
    botaoSalvar.disabled = false;
    botaoSalvar.textContent = "Cadastrar";
  }
}

function renderizarCard(cliente) {
  const card = document.createElement("div");

  card.classList.add("cliente-card");

  card.classList.add(cliente.plano);

  const titulo = document.createElement("h3");

  titulo.textContent = cliente.nome;

  card.appendChild(titulo);

  const paragrafoEmail = document.createElement("p");

  paragrafoEmail.textContent = cliente.email;

  card.appendChild(paragrafoEmail);

  const paragrafoEndereco = document.createElement("p");

  paragrafoEndereco.textContent = `${cliente.logradouro}, ${cliente.numero} - ${cliente.bairro}`;

  card.appendChild(paragrafoEndereco);

  const paragrafoCidade = document.createElement("p");

  paragrafoCidade.textContent = `${cliente.cidade} - ${cliente.uf}`;

  card.appendChild(paragrafoCidade);

  const paragrafoPlano = document.createElement("p");

  paragrafoPlano.textContent = `Plano: ${cliente.plano.charAt(0).toUpperCase() + cliente.plano.slice(1)}`;

  card.appendChild(paragrafoPlano);

  const botaoRemover = document.createElement("button");

  botaoRemover.textContent = "Remover";

  botaoRemover.addEventListener("click", function () {
    card.remove();
    clientes = clientes.filter((c) => c.email !== cliente.email);
    localStorage.setItem("clientes_db", JSON.stringify(clientes));
  });

  card.appendChild(botaoRemover);

  listaClientes.appendChild(card);
}

function limparEndereco() {
  inputLogradouro.value = "";
  inputBairro.value = "";
  inputCidade.value = "";
  inputUf.value = "";
}

async function buscarEndereco(cep) {
  const cepLimpo = cep.replace(/\D/g, "");

  if (cepLimpo.length !== 8) {
    alert("CEP deve conter 8 números");

    limparEndereco();

    return;
  }
  try {
    inputLogradouro.value = "Carregando...";
    inputBairro.value = "Carregando...";
    inputCidade.value = "Carregando...";
    inputUf.value = "Carregando...";

    const resposta = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);

    if (!resposta.ok) {
      throw new Error("Erro na requisição");
    }
    const dados = await resposta.json();

    if (dados.erro) {
      throw new Error("CEP inválido");
    }

    inputLogradouro.value = dados.logradouro;
    inputBairro.value = dados.bairro;
    inputCidade.value = dados.localidade;
    inputUf.value = dados.uf;
  } catch (erro) {
    limparEndereco();

    alert("Erro ao consultar CEP");
  }
}

function simularProcessamento() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, 2000);
  });
}

inputCep.addEventListener("blur", function () {
  buscarEndereco(inputCep.value);
});

campoBusca.addEventListener("input", function () {
  const textoBusca = campoBusca.value.toLowerCase();

  const cards = document.querySelectorAll(".cliente-card");

  cards.forEach(function (card) {
    const nomeCliente = card.querySelector("h3").textContent.toLowerCase();
    if (nomeCliente.includes(textoBusca)) {
      card.style.display = "block";
    } else {
      card.style.display = "none";
    }
  });
});

const emailInput = document.querySelector("#email-cliente");
emailInput.addEventListener("blur", function () {
  const valor = emailInput.value;

  if (valor.includes("@")) {
    emailInput.classList.remove("erro");
  } else {
    emailInput.classList.add("erro");
  }
});
