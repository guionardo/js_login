/* eslint-disable no-console */
class WebLogin {
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


    this.local = false;

    this.divlog = document.getElementById('log');

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

  cookie_load() {
    let ca = decodeURIComponent(document.cookie).split(';');
    let cookie = '';
    for (var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
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
          this.cookie_save();
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
  /**
   * Obtém as informações de login do back-end
   */
  fetchLogin() {
    if (this.local) {
      return {
        "token": "1234_",
        "expires": "Thu, 01 Jan 2020 00:00:00 UTC",
        "message": "Login OK"
      };
    }

    var json = {};

    if (self.fetch) {
      this.status = 0;
      fetch(this.LoginURL, { mode: 'no-cors' })
        .then(response => {
          response.text()
            .then(result => {
              this.parseJSONLogin(result);
            });
        });

    } else {
      // Não há suporte ao fetch
    }

    return json;
  }
  DoLogin() {
    this.fetchLogin();
  }


}

function callBack(msg) {
  console.log("CALLBACK: " + msg);
}
const webLogin = new WebLogin('login.json', callBack);
//webLogin.downloadTest();
webLogin.DoLogin();
