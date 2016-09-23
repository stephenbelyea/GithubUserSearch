/// <reference path="../typings/main.d.ts"/>

const form = document.getElementById("form");
const userField = document.getElementById("user");
const searchBtn = document.getElementById("search");
const outputEl = document.getElementById("output");
const messageEl = document.getElementById("message");
const apiSearch = "https://api.github.com/";

let userFieldVal = "";

// General helper functions.
class Helper {
  public setError(msg = "", type = "error") {
    let err = document.createElement("span");
    err.className = type;
    err.innerHTML = msg;
    messageEl.appendChild(err);
    outputEl.innerHTML = "";
  }
}
const helper = new Helper();

// Handle markup and content from search results.
class BuildView {
  user: any;
  repo: any;
  constructor(user) {
    this.user = user;
  }
  public doSectionTitle(isUser = true) {
    let secTitle = document.createElement("h2");
    let time = (isUser)? 200 : 500;
    let txt = (isUser)? `${this.user.login}'s Quick Facts` : `${this.user.login}'s Public Repos`;
    secTitle.setAttribute("data-show", "0");
    secTitle.innerHTML = txt;
    outputEl.appendChild(secTitle);
    setTimeout(() => {
      secTitle.setAttribute("data-show", "1");
    }, time);
  }
  public doUserLayout() {
    outputEl.innerHTML = "";
    this.doSectionTitle();
    let userCard = document.createElement("div");
    userCard.id = "userCard";
    userCard.setAttribute("data-show", "0");
    let scoreResp = "";
    let scoreVal = Math.round(this.user.score);
    if (scoreVal > 80) { scoreResp = "Sweet!"; }
    else if (scoreVal < 20) { scoreResp = "Ouch!"; }
    userCard.innerHTML = `
      <aside>
        <img src="${this.user.avatar_url}" alt="" />
      </aside>
      <article>
        <p>Check out <a href="${this.user.html_url}" target="_blank">${this.user.login}'s profile</a>.</p>
        <p>Follow <a href="${this.user.subscriptions_url}" target="_blank">${this.user.login}'s subscriptions</a>.</p>
        <p>Poach <a href="${this.user.followers_url}" target="_blank">${this.user.login}'s followers</a>.</p>
        <p>Github score of ${scoreVal}. ${scoreResp}</p>
        <p>Github user ID: ${this.user.id}.</p>
      </article>
    `;
    outputEl.appendChild(userCard);
    setTimeout(() => {
      userCard.setAttribute("data-show", "1");
    }, 300);
  }
  public doRepoLayout(repo, i) {
    this.repo = repo;
    //console.log("Repo", this.repo);
    if (i === 0) {
      this.doSectionTitle(false);
    }
    if (!this.repo.private) {
      let forked = (this.repo.fork)? "FORKED | " : "OWNER | ";
      let desc = (this.repo.description)? this.repo.description : "No description";
      let repoItem = document.createElement("div");
      let dateCreated = this.repo.created_at.split("T");
      let dateUpdated = this.repo.updated_at.split("T");
      repoItem.className = "repo-item";
      repoItem.setAttribute("data-show", "0");
      repoItem.innerHTML = `
        <h3>${this.repo.name}</h3>
        <p class="date">Created ${dateCreated[0]} | Updated: ${dateUpdated[0]}</p>
        <p class="desc">${forked}${desc}</p>
        <p class="links">
          <a href="${this.repo.html_url}" target="_blank">View</a> |
          <a href="${this.repo.clone_url}" target="_blank">Clone</a> |
          ${this.repo.forks_count} Forks | ${this.repo.open_issues_count} Issues |
          ${this.repo.watchers_count} Watchers | ${this.repo.stargazers_count} Stargazers
        </p>
      `;
      outputEl.appendChild(repoItem);
      let time = 600 + (i * 75);
      setTimeout(() => {
        repoItem.setAttribute("data-show", "1");
      }, time);
    }
  }
}

// Handle search execution.
class QueryApi {
  query: string;
  user: Object;
  view: any;
  constructor(query) {
    this.query = query;
  }
  public doRepoSearch() {
    let queryUrl = `${apiSearch}users/${this.query}/repos`;
    $.get(queryUrl, (result) => {
      //console.log('Success:', result);
      if (result.length) {
        for (let i = 0; i < result.length; i++) {
          this.view.doRepoLayout(result[i], i);
        }
      }
      else {
        helper.setError(`Ouch! No repos found for "${this.query}". Try another user?`);
      }
    })
    .fail((result) => {
      //console.log('Failed:', result);
      helper.setError(`Ouch! No repos found for "${this.query}". Try another user?`);
      return;
    });
  }
  public doUserSearch() {
    let queryUrl = `${apiSearch}search/users?q=${this.query}+user:${this.query}`;
    $.get(queryUrl, (result) => {
      //console.log('Success:', result);
      let items = result.items;
      if (items.length) {
        this.user = items[0];
        this.view = new BuildView(this.user);
        this.doRepoSearch();
        this.view.doUserLayout();
      }
      else {
        helper.setError(`Blast! No results for "${this.query}". Try something else?`);
      }
    })
    .fail((result) => {
      //console.log('Failed:', result);
      helper.setError(`Blast! No results for "${this.query}". Try something else?`);
      return;
    });
  }
}


// Use jQuery for the actual search, since $.get is just plain simple.
jQuery(document).ready(function($){

  form.onsubmit = (e) => {
    e.preventDefault();

    userFieldVal = (userField as any).value.toString();
    messageEl.innerHTML = "";

    if (userFieldVal == "" || !userFieldVal) {
      helper.setError("Please enter a username.");
      return;
    }

    let q = new QueryApi(userFieldVal);
    q.doUserSearch();

  }

});
