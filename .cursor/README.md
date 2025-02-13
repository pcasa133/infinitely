# Jogo no Estilo Fruit Ninja

Este é um jogo para navegador no estilo Fruit Ninja, onde o objetivo do jogador é coletar o máximo de moedas possível antes que o tempo acabe. O jogo inclui uma tela de início explicativa, moedas 3D que aparecem na tela, e uma moeda especial que ativa uma discoteca com cores vibrantes e pontos extras.

## Funcionalidades

- **Tela de Início**: Explica as regras do jogo e como jogar.
- **Moedas 3D**: Várias moedas aparecem na tela e o jogador deve clicar nelas para coletar.
- **Moeda Especial**: Se o jogador clicar na moeda especial, o jogo entra em modo discoteca, com cores vibrantes e pontos extras.
- **Pontuação**: Cada moeda comum vale 1 ponto.
- **Tempo**: O jogador tem 50 segundos para coletar as moedas. Se coletar a moeda especial, ganha mais 10 segundos.
- **Fundo Personalizável**: O fundo da tela é uma imagem que pode ser substituída.

## Hospedagem no Glitch

Este jogo será hospedado no [Glitch](https://glitch.com/), uma plataforma que permite criar e hospedar projetos web de forma simples e rápida. Para configurar o projeto no Glitch, siga as instruções abaixo.

---

## Estrutura do Projeto

A estrutura de pastas e arquivos deve ser organizada da seguinte forma:
fruit-ninja-game/
├── assets/
│ ├── coins/ # Pasta com as imagens das moedas (sequência de imagens 3D)
│ │ ├── coin1.png
│ │ ├── coin2.png
│ │ └── ...
│ ├── background.jpg # Imagem de fundo do jogo
│ └── special-coin.png # Imagem da moeda especial
├── css/
│ └── style.css # Arquivo de estilos CSS
├── js/
│ └── script.js # Arquivo de lógica do jogo em JavaScript
├── index.html # Arquivo principal do jogo
└── README.md # Documentação do projeto

Copy

---

## Como Configurar no Glitch

1. **Crie um Novo Projeto no Glitch**:
   - Acesse [Glitch](https://glitch.com/) e crie uma nova conta (se ainda não tiver uma).
   - Clique em "New Project" e selecione "Hello Website" para começar com um projeto básico.

2. **Substitua os Arquivos**:
   - No painel do Glitch, exclua os arquivos padrão (`style.css`, `script.js`, etc.) e substitua-os pelos arquivos do seu projeto.
   - Crie as pastas `assets/`, `css/`, e `js/` e adicione os arquivos correspondentes.

3. **Adicione os Assets**:
   - Na pasta `assets/`, adicione as imagens das moedas, a moeda especial e a imagem de fundo.

4. **Teste o Jogo**:
   - O Glitch atualiza automaticamente o projeto. Assim que os arquivos forem carregados, o jogo estará disponível no link gerado pelo Glitch.

5. **Compartilhe o Link**:
   - Compartilhe o link do projeto no Glitch para que outras pessoas possam jogar.

---

## Como Jogar

1. **Tela de Início**: Leia as instruções e clique em "Começar" para iniciar o jogo.
2. **Coletar Moedas**: Clique nas moedas que aparecem na tela para coletá-las.
3. **Moeda Especial**: Fique atento à moeda especial, que ativa o modo discoteca e adiciona 10 segundos ao tempo restante.
4. **Pontuação**: Tente coletar o máximo de moedas possível antes que o tempo acabe.

---

## Personalização

- **Fundo**: Substitua a imagem de fundo na pasta `assets/` para personalizar o visual do jogo.
- **Moedas**: Você pode adicionar ou substituir as imagens das moedas na pasta `assets/coins/`.

---

## Contribuição

Se você quiser contribuir para este projeto, sinta-se à vontade para abrir uma issue ou enviar um pull request.

---

## Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.
Instruções Adicionais para o Cursor

Crie a Estrutura de Pastas:
No Glitch, crie as pastas assets/, css/, e js/ conforme a estrutura acima.
Dentro de assets/, crie a subpasta coins/ para armazenar as imagens das moedas.
Adicione os Arquivos:
Adicione o arquivo index.html na raiz do projeto.
Adicione o arquivo style.css na pasta css/.
Adicione o arquivo script.js na pasta js/.
Adicione as imagens das moedas, da moeda especial e do fundo na pasta assets/.
Teste e Hospede:
O Glitch atualiza automaticamente o projeto. Assim que os arquivos forem carregados, o jogo estará disponível no link gerado pelo Glitch.