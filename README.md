# Infinite Play

Um jogo divertido de coletar moedas desenvolvido com HTML, CSS e JavaScript puro.

## Como Jogar

- Clique nas moedas para coletá-las
- Cada moeda vale 1 ponto na fase azul e 2 pontos na fase vermelha
- Encontre moedas especiais para ganhar pontos extras
- Evite as bombas que fazem você perder pontos
- Você tem 50 segundos para fazer o máximo de pontos possível

## Recursos

- Duas fases distintas com diferentes visuais e mecânicas
- Moedas normais e especiais
- Sistema de bombas
- Efeitos visuais e sonoros
- Dragões na fase vermelha
- Sistema de pontuação progressivo

## Tecnologias Utilizadas

- HTML5
- CSS3 (Animações e Transições)
- JavaScript (ES6+)
- Sprites e Assets Personalizados
- GitHub Actions para deploy automático

## Como Executar Localmente

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/InfinitePlay.git
```

2. Abra o arquivo `index.html` em seu navegador

## GitHub Pages

O jogo está disponível online através do GitHub Pages em:
https://seu-usuario.github.io/InfinitePlay/

## Estrutura do Projeto

```
InfinitePlay/
├── .github/
│   └── workflows/    # Configurações do GitHub Actions
├── assets/          # Recursos do jogo
│   ├── imgs/        # Imagens gerais
│   ├── phase0/      # Assets da fase azul
│   ├── phase1/      # Assets da fase vermelha
│   └── dragon/      # Sprites do dragão
├── css/            # Arquivos de estilo
├── js/             # Scripts do jogo
└── index.html      # Página principal
```

### Organização das Imagens

Para garantir o funcionamento correto no GitHub Pages, as imagens devem seguir esta estrutura:

- `assets/imgs/`: Imagens gerais do jogo
- `assets/phase0/`: Imagens específicas da fase azul (nuvens, fundo, etc.)
- `assets/phase1/`: Imagens específicas da fase vermelha (nuvens, fundo, etc.)
- `assets/dragon/`: Sprites de animação do dragão

Os caminhos das imagens no CSS e JavaScript são relativos à raiz do projeto.

## Contribuindo

Sinta-se à vontade para contribuir com o projeto. Abra uma issue ou envie um pull request.

## Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes. 