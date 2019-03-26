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
    this.wlConsts = {
      cookieName: 'loginKey',
      minDate: 'Thu, 01 Jan 1970 00:00:00 UTC',
      propToken: 'token',
      propExpires: 'expires',
      propData: 'data',
      loginStatus_not_init: -1,
      loginStatus_fetching: 0,
      loginStatus_login_ok: 1,
      loginStatus_login_error: 2,
      cookiesDisabled: 'COOKIES NEED TO BE ACTIVE ON THIS BROWSER',
      browserDisabled: 'BROWSER DISABLED',
      cookieLoaded: 'AUTH COOKIE OK',
      cookieDataInvalid: 'AUTH COOKIE DATA ERROR',
      cookieLoadException: 'COOKIE LOAD EXCEPTION',
      serverLogout: 'SERVER LOGOUT'
    }
    Object.freeze(this.wlConsts);

    // Nome do cookie
    this.CookieName = this.wlConsts.cookieName;

    // Token recebido do servidor
    this.ServerToken = '';

    // URL para request de login ao servidor
    this.LoginURL = loginUrl;

    // Validade do token (valor em segundos desde 01/01/1970)
    this.TokenExpires = 0;

    // Dados extra, enviados pelo servidor auth
    this.Data = false;

    // Função de retorno de status
    this.CallBack = callBack;

    // Status do login
    // -1 = Não inicializado
    // 0 = Fetching (obtendo a partir do servidor)
    // 1 = Login OK
    // 2 = Erro de login

    this.status = this.wlConsts.loginStatus_not_init;
    this.lastmessage = '';
    this.cookie_load();
  }

  /**
   * Envia a mensagem para o método call-back, incluindo as informações Data enviadas pelo servidor auth
   * @param {*} msg 
   */
  doCallBack(msg) {
    this.lastmessage = msg;
    if (this.CallBack != null) {
      this.CallBack(msg, this.Data);
    }
  }

  /**
   * Obtém o valor de uma propriedade do objeto ou um valor default se não existir.
   * @param {} object 
   * @param {*} property 
   * @param {*} defaultValue 
   */
  getProp(object, property, defaultValue = false) {
    object.hasOwnProperty(property) ? object[property] : defaultValue;
  }
  /**
   * Carrega as informações de login (token e validade) a partir do cookie
   */
  cookie_load() {
    if (typeof navigator != 'undefined' && navigator.cookieEnabled) {
      this.doCallBack(this.wlConsts.cookiesDisabled);
      return;
    }
    if (typeof document == 'undefined') {
      this.doCallBack(this.wlConsts.browserDisabled);
      return;
    }
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
        let token = this.getProp(json, this.wlConsts.propToken);
        let expires = this.getProp(json, this.wlConsts.propExpires);
        let data = this.getProp(json, this.wlConsts.propData);
        if (token && expires) {
          this.ServerToken = json.token;
          this.TokenExpires = this.parseExpires(json.expires);
          this.Data = data;
          this.doCallBack(this.wlConsts.cookieLoaded);
          return true;
        }

        // Erro no token
        this.doCallBack(this.wlConsts.cookieDataInvalid);

      } catch (e) {
        this.cookieRelease();
        this.doCallBack(this.wlConsts.cookieLoadException + ' ' + e.message);
      }
    } else {
      // Erro no token
      this.cookieRelease();
      this.doCallBack(this.wlConsts.cookieDataInvalid);
    }
    return false;
  }

  cookieRelease() {
    this.TokenExpires = 0;
    document.cookie = this.cookieName + '=; expires=' + new Date(0).toUTCString() + '; path=/;';
  }

  /**
   * Trata uma informação de expiração retornando um objeto Date
   * @param {*} expires 
   */
  parseExpires(expires) {
    var d;
    if (typeof (expires) === 'string') {
      try {
        d = new Date(Date.parse(expires));
        return d;
      } catch (e) { d = 0; }
    } else if (typeof (expires) === 'number') {
      try {
        d = new Date(expires);
        return d;
      } catch (e) { d = 0; }
    }

    return Date.parse(this.wlConsts.minDate);
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
    }, "POST", "login=" + userName + "&pass=" + userPassword);
  }

  DoLogout() {
    if (this.ServerToken) {
      this.fetchJSON(this.LoginURL, (success, json) => {
        this.ServerToken = "";
        this.TokenExpires = 0;
        this.cookieRelease();
        this.doCallBack("Logout:" + success);
      }, "GET", "logout=" + this.ServerToken)
    }
  }

  CheckToken() {
    if (this.ServerToken) {
      this.fetchJSON(this.LoginURL, (success, json) => {
        if (success) {
          this.TokenExpires = Date.parse(json.expires);
          document.cookie = this.cookieName + "=; expires='" + json.expires + ";'";
        } else {
          this.ServerToken = false;
          this.TokenExpires = 0;
          document.cookie = this.CookieName + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
          this.doCallBack(this.wlConsts.serverLogout);
        }
      })
    }
  }



}


let wl = new WebLogin();
console.log(wl.parseExpires(50));
console.log(wl.parseExpires('Thu, 01 Jan 1970 00:00:00 UTC'));