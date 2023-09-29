document.addEventListener('DOMContentLoaded', function () {

    let editando = false;

    let id_editando = 0;

    montarTabelaPrestadores();

    document.querySelector("#formulario").addEventListener('submit', adicionar);

    function mostrarErro(elemento, mensagem) {
        let campo = document.querySelector(elemento);
        campo.parentNode.querySelector('.error').textContent = mensagem;
        campo.style.borderColor = "red"; // Adiciona uma borda vermelha ao campo com erro
    }

    function limparErros() {
        const elementos = ['#nome', '#sobrenome', '#email', '#website', '#dataInicial', '#dataFim', 'input[name="regiao"]', 'input[name="atividade"]'];
        elementos.forEach(elemento => {
            mostrarErro(elemento, '');
            document.querySelector(elemento).style.borderColor = ""; // Remove a borda vermelha quando os erros são limpos
        });
    }

    function adicionar(event) {
        limparErros();

        let nome = document.querySelector("#nome").value;
        let sobrenome = document.querySelector("#sobrenome").value;
        let email = document.querySelector('#email').value;
        let website = document.querySelector("#website").value;
        let dataInicial = document.querySelector("#dataInicial").value;
        let dataFim = document.querySelector("#dataFim").value;
        let atividade = document.querySelectorAll('input[name="atividade"]:checked');

        let possuiErros = false; // Inicializa a variável possuiErros como false

        //validações do formulário
        if (nome === '') {
            mostrarErro('#nome', 'Nome é obrigatório!');
            possuiErros = true; // Se houver um erro, define possuiErros como true
        } else if (nome.length < 3) {
            mostrarErro('#nome', "O Nome deve ter pelo menos três caracteres!");
            possuiErros = true; // Se houver um erro, define possuiErros como true
        }

        //validacao sobrenome
        if (!sobrenome) {
            mostrarErro('#sobrenome', 'Sobrenome é Obrigatorio!')
            possuiErros = true; // Se houver um erro, define possuiErros como true
        }

        // validação de e-mail
        if (!email) {
            mostrarErro('#email', 'E-Mail é Obrigatorio');
            possuiErros = true; // Se houver um erro, define possuiErros como true
        } else {
            const a = email.indexOf('@');
            const b = email.lastIndexOf('.');
            if (a < 1 || b < a + 2 || b + 2 >= email.length) {
                mostrarErro('#email', 'E-Mail inválido');
                possuiErros = true; // Se houver um erro, define possuiErros como true
            }
        }

        //validação da webiste
        if (website) {
            if (!website.startsWith("http://") && !website.startsWith("https://")) {
                mostrarErro('#website', "Website deve começar com http:// ou https://");
                possuiErros = true; // Se houver um erro, define possuiErros como true
            }
        }

        // validação datainicial
        if (!dataInicial || !dataFim) {
            if (!dataInicial) {
                mostrarErro('#dataInicial', 'A data inicial é obrigatório');
            }
            if (!dataFim) {
                mostrarErro('#dataFim', 'Data final é obrigatória');
            }
            possuiErros = true; // Se houver um erro, define possuiErros como true
        }

        const dataInicialDate = new Date(dataInicial);
        const dataFimDate = new Date(dataFim);
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0); // Isso define a hora para meia-noite, para comparar apenas as datas

        if (dataInicialDate < hoje) {
            mostrarErro("#dataInicial", "A Data Inicial não pode ser menor que a data atual!");
            possuiErros = true; // Se houver um erro, define possuiErros como true
        }

        if (dataFimDate <= dataInicialDate) {
            mostrarErro("#dataFim", "A Data Final não pode ser menor ou igual à Data Inicial!");
            possuiErros = true; // Se houver um erro, define possuiErros como true
        }

        if (atividade.length < 1 || atividade.length > 3) {
            mostrarErro('input[name="atividade"]', 'Você deve selecionar no mínimo uma e no máximo três atividades!');
            possuiErros = true; // Se houver um erro, define possuiErros como true
        }

        if (possuiErros) {
            event.preventDefault();
            event.stopPropagation();
        }
        // Verificar se está editando ou criando
        if (editando) {
            const prestadoresDeServico = JSON
                .parse(localStorage.getItem('prestadoresDeServico')) ?? []

            prestadoresDeServico[id_editando] = {
                nome: document.querySelector('#nome').value,
                sobrenome: document.querySelector('#sobrenome').value,
                email: document.querySelector('#email').value,
                site: document.querySelector('#website').value,
                dataInicial: document.querySelector('#dataInicial').value,
                dataFinal: document.querySelector('#dataFim').value,
                regiao: document.querySelector('input[name=regiao]:checked').value,
                atividadesPretendidas: Array.from(document.querySelectorAll('input[name=atividade]:checked')).map(a => a.value)
            };

            localStorage
                .setItem(
                    'prestadoresDeServico',
                    JSON.stringify(prestadoresDeServico)
                );

            editando = false;
        } else {
            const prestadorServico = {
                nome: document.querySelector('#nome').value,
                sobrenome: document.querySelector('#sobrenome').value,
                email: document.querySelector('#email').value,
                site: document.querySelector('#website').value,
                dataInicial: document.querySelector('#dataInicial').value,
                dataFinal: document.querySelector('#dataFim').value,
                regiao: document.querySelector('input[name=regiao]:checked').value,
                atividadesPretendidas: Array.from(document.querySelectorAll('input[name=atividade]:checked')).map(a => a.value)
            };

            const prestadoresDeServico = JSON
                .parse(localStorage.getItem('prestadoresDeServico')) ?? []

            prestadoresDeServico.push(prestadorServico);

            localStorage
                .setItem(
                    'prestadoresDeServico',
                    JSON.stringify(prestadoresDeServico)
                );

            montarTabelaPrestadores();
        }
    }

    //validação região
    document.querySelectorAll('input[name="regiao"]').forEach(function (radio) {
        radio.addEventListener('change', function () {
            let regiao = this.value;
            const programadorOption = document.querySelector('#programador');
            const dbaOption = document.querySelector('#dba');

            if (regiao === 'centro-oeste') {
                programadorOption.disabled = true;
                dbaOption.disabled = true;
            } else {
                programadorOption.disabled = false;
                dbaOption.disabled = false;
            }
        });
    });

    function montarTabelaPrestadores() {
        const prestadoresDeServico = JSON
            .parse(localStorage.getItem('prestadoresDeServico')) ?? []


        const tabela = document.querySelector('#tabela-prestadores tbody');
        tabela.innerHTML = '';

        let conteudo = '';

        prestadoresDeServico.forEach((prestador, indice) => {
            conteudo += `
                    <tr>
                        <td>${prestador.nome}</td>	
                        <td>${prestador.sobrenome}</td>
                        <td>${prestador.email}</td>
                        <td>${prestador.site}</td>
                        <td>${prestador.dataInicial}</td>
                        <td>${prestador.dataFinal}</td>
                        <td>${prestador.regiao}</td>
                        <td>${prestador.atividadesPretendidas.join('-')}</td>
                        <td>
                            <button class='exclusao' data-id='${indice}'>Excluir</button>
                            <button class='edicao' data-id='${indice}'>Editar</button>
                        </td>
                    </tr>
            `;
        });
        tabela.innerHTML = conteudo;
    }
    //excluir prestador
    const tabela = document.querySelector('#tabela-prestadores tbody');
    tabela.addEventListener('click', function (event) {
        if (event.target.className == 'exclusao') {
            let id = event.target.getAttribute('data-id');
            excluirPrestador(id);
        }
    });
    function excluirPrestador(id) {

        const prestadoresDeServico = JSON
            .parse(localStorage.getItem('prestadoresDeServico')) ?? []

        prestadoresDeServico.splice(id, 1);

        localStorage
            .setItem(
                'prestadoresDeServico',
                JSON.stringify(prestadoresDeServico)
            );

        montarTabelaPrestadores();
    }
    //editar prestador
    tabela.addEventListener('click', function (event) {
        if (event.target.className == 'edicao') {
            let id = event.target.getAttribute('data-id');
            editarPrestador(id);
        }
    });

    function editarPrestador(id) {

        const prestadoresDeServico = JSON
            .parse(localStorage.getItem('prestadoresDeServico')) ?? []

        const prestador = prestadoresDeServico[id]

        document.querySelector('#nome').value = prestador.nome;
        document.querySelector('#sobrenome').value = prestador.sobrenome;
        document.querySelector('#email').value = prestador.email;
        document.querySelector('#website').value = prestador.site;
        document.querySelector('#dataInicial').value = prestador.dataInicial;
        document.querySelector('#dataFim').value = prestador.dataFinal;
        document.querySelector(`input[value="${prestador.regiao}"]`).checked = true;
        document.querySelectorAll('input[name="atividade"]').forEach(atividade => {
            atividade.checked = false;
        });
        prestador.atividadesPretendidas.forEach(atividade => {
            document.querySelector(`input[value="${atividade}"]`).checked = true;
        });

        editando = true;
        id_editando = id;
    }




});
