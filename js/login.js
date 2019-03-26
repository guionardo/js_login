/* eslint-disable no-console */
/**
 * Classe de controle de logins, com conexão ao back-end para validação e uso de token
 */
class WebLogin {
  /**
   * Constructor
   * @param {string} loginUrl URL de destino no backend
   * @param {*} callBack função que será chamada a cada evento
   */
  constructor(loginUrl = 'login.json', callBack = null) {
    // Nome do cookie
    this.CookieName = 'loginKey';

    // Token recebido do servidor
    this.ServerToken = '';

    // URL para request de login ao servidor
    this.LoginURL = loginUrl;

    // Validade do token
    this.TokenExpires = Date.parse("Thu, 01 Jan 1970 00:00:00 UTC");

    // Função de retorno de status
    this.CallBack = callBack;

    // Status do login
    // -1 = Não inicializado
    // 0 = Fetching (obtendo a partir do servidor)
    // 1 = Login OK
    // 2 = Erro de login

    this.status = 0;

    this.cookie_load();
  }

  doCallBack(msg) {
    if (this.CallBack != null) {
      this.CallBack(msg);
    }
  }

  /**
   * Carrega as informações de login (token e validade) a partir do cookie
   */
  cookie_load() {
    let ca = decodeURIComponent(document.cookie).split(';');
    let cookie = '';
    for (var i = 0; i < ca.length; i++) {
      var c = ca[i].trim();

      if (c.indexOf(this.CookieName) == 0) {
        cookie = c.substring(this.CookieName.length + 1, c.length);
        break;
      }
    }
    if (cookie.length > 0) {
      try {
        let json = JSON.parse(atob(cookie));
        if (typeof (json['token']) === 'undefined' || typeof (json['expires']) === 'undefined') {
          // Erro no token
          this.doCallBack("cookie_load ERRO NO COOKIE");
        } else {
          this.ServerToken = json.token;
          this.TokenExpires = json.expires;
          this.doCallBack("cookie_load OK");
          return true;
        }
      } catch (e) {
        document.cookie = this.CookieName + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        this.doCallBack("cookie_load EXCEPTION " + e.message);
      }
    } else {
      this.doCallBack("cookie_load ERRO NO COOKIE");
    }
    return false;
  }

  cookie_save() {
    if (this.status == 1) {
      var exp = new Date(this.TokenExpires);

      document.cookie = this.CookieName + "=" + btoa(JSON.stringify({ token: this.ServerToken, expires: this.TokenExpires })) +
        "; expires=" + exp.toUTCString() + ";";
    }
  }

  parseJSONLogin(json) {
    if (typeof (json) === 'string') {
      json = JSON.parse(json);
    }
    if (typeof (json['token']) === 'undefined' || typeof (json['expires']) === 'undefined') {
      // Erro no token
      this.status = 2;
      this.doCallBack("parseJSONLogin ERRO NO TOKEN");
    } else {
      this.ServerToken = json.token;
      this.TokenExpires = Date.parse(json.expires);
      this.status = 1;
      this.cookie_save();
      this.doCallBack("parseJSONLogin OK");
    }
  }

  fetchJSON(url, callBack, method = "GET", params = false) {
    if (self.fetch) {
      var ops = { method: method };
      if (method == "POST") {
        ops.headers = new Headers({
          'Content-Type': 'application/x-www-form-urlencoded', // <-- Specifying the Content-Type
        });
      }
      if (params) {
        ops.body = params;
      }
      fetch(url, ops)
        .then(response => {
          response.text()
            .then(result => {
              try {
                var json = JSON.parse(result);
                callBack(true, json);
              } catch (e) {
                callBack(false, "");
              }
            })
        });
    } else {
      callBack(false, "");
    }
  }
  /**
   * Obtém as informações de login do back-end
   */
  DoLogin(userName, userPassword) {
    this.fetchJSON(this.LoginURL, (success, json) => {
      if (success) {
        this.parseJSONLogin(json);
      }
    }, "POST", "login=1&user=" + userName + "&pass=" + userPassword);
  }

  DoLogout() {
    if (this.ServerToken) {
      this.fetchJSON(this.LoginURL, (success, json) => {
        this.ServerToken = "";
        this.TokenExpires = Date.parse("Thu, 01 Jan 1970 00:00:00 UTC");
        document.cookie = this.CookieName + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        this.doCallBack("Logout:" + success);
      })
    }
  }

  CheckToken(){
    if (this.ServerToken){
      this.fetchJSON(this.LoginURL,(success,json)=>{

      })
    }
  }



}


