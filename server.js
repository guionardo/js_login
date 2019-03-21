/* eslint-disable no-console */
const http = require('http')
const uuid = require('uuid/v1')
const fs = require('fs')

const port = 3000
const ip = 'localhost'
const url = require('url')
const users = {
  "Guionardo": {
    pass: "1234", args: { nome: "Guionardo Furlan", idade: 42 }
  },
  "Marines": {
    pass: "5678", args: { nome: "Marines dos Santos Furlan", idade: 41 }
  }
}

const tokens = {}

const server = http.createServer((req, res) => {
  var url_parts = url.parse(req.url, true);

  var parts = url_parts.query;
  var resposta = {
    OK: false,
    MSG: '',
    FUNC: '',
    TOKEN: '',
    USERDATA: {}
  }

  let func = (typeof (parts['login']) != 'undefined' ? 'login' :
    typeof (parts['logout']) != 'undefined' ? 'logout' :
      typeof (parts['check']) != 'undefined' ? 'check' : false);

  if (!func) {
    var arquivo = '.' + url_parts.path;
    if (arquivo == './') { arquivo = './index.html'; }
    console.log(arquivo);
    fs.exists(arquivo, (exists) => {
      if (!exists) {
        return;
      }
      fs.readFile(arquivo, function (err, html) {
        if (err) {
          console.error(err.message);
          res.end();
          return;
        }
        if (arquivo.substr(-3) === ".js") {
          res.writeHead(200, { "Content-Type": "text/javascript" })
        } else {
          res.writeHead(200, { "Content-Type": "text/html" });
        }
        res.write(html);
        res.end();
      })
    })

    return;
  }

  resposta.FUNC = func;

  switch (func) {
    case 'login':
      //### Solicitação de login para o usuário com senha (POST)
      //(url)?login&user=userName&pass=userPassword
      if (parts['user'] === undefined) {
        resposta.MSG = 'PARAMETER NOT FOUND user'
      } else if (parts['pass'] === undefined) {
        resposta.MSG = 'PARAMETER NOT FOUND pass'
      } else if (users[parts['user']] === undefined) {
        resposta.MSG = 'USER NOT FOUND ' + parts['user']
      } else if (users[parts['user']].pass != parts['pass']) {
        resposta.MSG = 'PASSWORD ERROR'
      } else {
        var token = uuid();
        tokens[token] = parts['user'];
        resposta.MSG = 'OK';
        resposta.OK = true;
        resposta.TOKEN = token;
        resposta.USERDATA = users[tokens[token]].args;
      }
      break;
    case 'logout':
      //### Solicitação de logout para o usuário (GET)
      //(url)?logout&token=loginToken
      if (parts['token'] === undefined) {
        resposta.MSG = 'PARAMETER NOT FOUND token'
      } else
        if (tokens[parts['token']] === undefined ||
          tokens[parts['token']] === null) {
          resposta.MSG = 'TOKEN NOT FOUND ' + parts['token']
        } else {
          tokens[parts['token']] = null
          resposta.MSG = 'TOKEN OK';
          resposta.TOKEN = parts['token']
          resposta.OK = true;
        }

      break;
    case 'check':
      //### Solicitação de validade do token (GET)
      //(url)?check&token=loginToken
      if (parts['token'] === undefined) {
        resposta.MSG = 'PARAMETER NOT FOUND token'
      } else
        if (tokens[parts['token']] === undefined) {
          resposta.MSG = 'TOKEN NOT FOUND ' + parts['token']
        } else {
          resposta.TOKEN = parts['token']
          resposta.MSG = 'TOKEN OK';
          resposta.OK = true;
          resposta.USERDATA = users[tokens[parts['token']]].args;
        }

      break;
    default:

  }


  res.end(JSON.stringify(resposta));
})


server.listen(port, ip, () => {
  console.log(`Servidor rodando em http://${ip}:${port}`);
})
