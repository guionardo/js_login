# Funções para tratamento de login

![Fluxograma de login](docs\Login.jpg "Fluxograma de login")

Utilização de token armazenado em cookie

1. Ao iniciar, WebLogin verifica se o cookie existe e autentica o token no servidor

## Instalar servidor para testes

* npm install http-server -g
* http-server ./
* node server.js

## Instalação do GULP

* npm install gulp-cli -g
* npm install gulp -D

https://stackoverflow.com/questions/4720343/loading-basic-html-in-node-js

## Padrão de URL 

### Solicitação de login para o usuário com senha (POST)
(url)?login&user=userName&pass=userPassword

### Solicitação de logout para o usuário (GET)
(url)?logout&token=loginToken

### Solicitação de validade do token (GET)
(url)?check&token=loginToken

