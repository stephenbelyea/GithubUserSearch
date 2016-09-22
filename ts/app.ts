/// <reference path="../typings/main.d.ts"/>

const form = document.getElementById("form");
const userField = document.getElementById("user");
const searchBtn = document.getElementById("search");
const outputEl = document.getElementById("output");
const messageEl = document.getElementById("message");
const apiSearch = "https://api.github.com/search/";

let userFieldVal = "";

class User {
  usr: any;
  constructor(usr) {
    this.usr = usr;
  }
  public buildLayout() {
    console.log(this.usr);
    outputEl.innerHTML = "";
    let userCard = document.createElement("div");
    userCard.id = "userCard";
    let scoreResp = "";
    if (this.usr.score > 80) { scoreResp = "Sweet!"; }
    else if (this.usr.score < 20) { scoreResp = "Ouch!"; }
    userCard.innerHTML = `
      <aside>
        <img src="${this.usr.avatar_url}" alt="" />
      </aside>
      <article>
        <h2>${this.usr.login}</h2>
        <ul>
          <li>Check out <a href="${this.usr.html_url}" target="_blank">${this.usr.login}'s profile</a>.</li>
          <li>Follow <a href="${this.usr.subscriptions_url}" target="_blank">${this.usr.login}'s subscriptions</a>.</li>
          <li>Poach <a href="${this.usr.followers_url}" target="_blank">${this.usr.login}'s followers</a>.</li>
          <li>Github score of ${this.usr.score}. ${scoreResp}</li>
          <li>Github user ID: ${this.usr.id}.</li>
        </ul>
      </article>
    `;
    outputEl.appendChild(userCard);
  }
}

class Helper {
  public setError(msg = "", type = "error") {
    let err = document.createElement("span");
    err.className = type;
    err.innerHTML = msg;
    messageEl.appendChild(err);
  }
}

const helper = new Helper();

jQuery(document).ready(function($){

  form.onsubmit = (e) => {
    e.preventDefault();

    userFieldVal = (userField as any).value.toString();
    messageEl.innerHTML = "";

    if (userFieldVal == "" || !userFieldVal) {
      helper.setError("Please enter a username.");
      return;
    }

    $.get(
      //`${apiSearch}users?q=${userFieldVal}+user:${userFieldVal}`,
      `${apiSearch}users?q=${userFieldVal}`,
      (result) => {
        console.log('success',result);
      }
    )
    .done((result) => {
      let items = result.items;
      if (items.length < 1) {
        helper.setError(`Sorry, no results for "${userFieldVal}".`);
      }
      else {
        if (items.length > 1) {
          let msg = `
            Hoo boy! Looks like "${userFieldVal}" returns a bunch of results, but we'll be sticking with the first. <br />
            Feel free to <a href="https://github.com/search?q=${userFieldVal}&type=Users" target="_blank">check out the others on GitHub</a>.
          `;
          helper.setError(msg, "hint");
        }
        const user = new User(items[0]);
        user.buildLayout();
      }
    })
    .fail((result) => {
      console.log('failed',result);
      helper.setError(`Blast! "${userFieldVal}" doesn't appear to be valid. Try something else?`);
      return;
    });

  }

});
