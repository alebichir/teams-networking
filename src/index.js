import "./style.css";
import { $, mask, sleep, unmask } from "./utilities";
import { createTeamRequest, deleteTeamRequest, updateTeamRequest, loadTeamsRequest } from "./middleware";

const form = "#teamsForm";

let allTeams = [];
let editId;

function stringToColour(str) {
  var hash = 0;
  for (var i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  var colour = "#";
  for (var i = 0; i < 3; i++) {
    var value = (hash >> (i * 8)) & 0xff;
    colour += ("00" + value.toString(16)).substr(-2);
  }
  return colour;
}

function getTeamAsHTML(team) {
  // const id = team.id;
  // const url = team.url;
  const { id, url } = team;
  const displayUrl = url.startsWith("https://github.com/") ? url.substring(19) : url;
  return `<tr>
  <td style="text-align: center"><input type="checkbox" name="selected"></td>
  <td><span class="circle-bullet" style="background: ${stringToColour(team.promotion)};"></span>${team.promotion}</td>
  <td>${team.members}</td>
  <td>${team.name}</td>
  <td>
    <a href="${url}" target="_blank">${displayUrl}</a>
  </td>
  <td>
    <button type="button" data-id="${id}" class="action-btn edit-btn"> &#9998; </button>
    <button type="button" data-id="${id}" class="action-btn delete-btn"> ♻ </button>
  </td>
</tr>`;
}

function getTeamAsHTMLInputs({ promotion, members, name, url }) {
  //console.info("inputs", arguments[0]);
  //const { promotion, members, name, url } = team;
  return `<tr>
    <td style="text-align: center"><input type="checkbox" name="selected"></td>
    <td><input value="${promotion}" type="text" name="promotion" placeholder="Enter Promotion" required /></td>
    <td><input value="${members}" type="text" name="members" placeholder="Enter Members" required /></td>
    <td><input value="${name}" type="text" name="name" placeholder="Enter Name" required /></td>
    <td><input value="${url}" type="text" name="url" placeholder="Enter URL" required /></td>
    <td>
      <button type="submit" class="action-btn" title="Save">💾</button>
      <button type="reset" class="action-btn" title="Cancel">✖</button>
    </td>
  </tr>`;
}

let previewTeams = [];
function renderTeams(teams, editId) {
  console.time("check");
  if (!editId && teams === previewTeams) {
    //console.warn("same teams already rendered");
    console.timeEnd("check");
    return;
  }
  if (!editId && teams.length === previewTeams.length) {
    const sameContent = previewTeams.every((team, i) => team === teams[i]);
    if (sameContent) {
      //console.info("sameContent");
      console.timeEnd("check");
      return;
    }
  }
  console.timeEnd("check");

  console.time("render");
  previewTeams = teams;
  const htmlTeams = teams.map(team => {
    return team.id === editId ? getTeamAsHTMLInputs(team) : getTeamAsHTML(team);
  });
  //console.warn(htmlTeams);
  $("#teamsTable tbody").innerHTML = htmlTeams.join("");
  addTitleToOverflowCells();
  console.timeEnd("render");
}

function addTitleToOverflowCells() {
  const cells = document.querySelectorAll("#teamsTable td");
  //console.warn("cells", cells);
  cells.forEach(cell => {
    cell.title = cell.offsetWidth < cell.scrollWidth ? cell.textContent : "";
  });
}

async function loadTeams() {
  mask(form);
  const teams = await loadTeamsRequest();
  console.warn("teams", teams);
  allTeams = teams;
  renderTeams(teams);
  unmask(form);
}

function getTeamValues(parent) {
  const promotion = $(`${parent} input[name=promotion]`).value;
  const members = $(`${parent} input[name=members]`).value;
  const name = $(`${parent} input[name=name]`).value;
  const url = $(`${parent} input[name=url]`).value;
  const team = {
    promotion: promotion,
    members: members,
    name,
    url
  };
  return team;
}

function onSubmit(e) {
  //console.warn("submit", e);
  e.preventDefault();

  console.warn("update or create", editId);

  const team = getTeamValues(editId ? "tbody" : "tfoot");

  mask(form);

  if (editId) {
    team.id = editId;
    console.warn("update...", team);
    updateTeamRequest(team).then(({ success }) => {
      //console.warn("updated", status);
      if (success) {
        //loadTeams();
        allTeams = allTeams.map(t => {
          // console.info(t.id === team.id, t.promotion);
          if (t.id === team.id) {
            // var a = { x: 1, y: 2 };
            // var b = { y: 3, z: 4 };
            // var c = { ...a, ...b }; -> 1 3 4
            //console.warn("updated %o ->%o", t, team);
            return {
              ...t,
              ...team
            };
          }
          return t;
        });
        //allTeams = [...allTeams];
        console.info(allTeams);
        renderTeams(allTeams);
        setInputsDisable(false);
        editId = "";
      }
      unmask(form);
    });
  } else {
    console.warn("create...", team);
    createTeamRequest(team).then(({ success, id }) => {
      console.warn("created!");
      if (success) {
        team.id = id;
        allTeams = [...allTeams, team];
        renderTeams(allTeams);
        $(form).reset();
      }
      unmask(form);
    });
    console.warn("creating...");
  }
}

function startEdit(id) {
  editId = id;
  console.warn("edit %o", id, allTeams);

  // const team = allTeams.find(team => team.id === id);
  // console.warn(team.promotion);
  // $("#promotion").value = team.promotion;
  // $("#members").value = team.members;
  // $("#name").value = team.name;
  // $("#url").value = team.url;

  renderTeams(allTeams, id);
  setInputsDisable(true);
}

function setInputsDisable(disabled) {
  document.querySelectorAll("tfoot input").forEach(input => {
    input.disabled = disabled;
  });
}

function filterElements(teams, search) {
  search = search.toLowerCase();
  return teams.filter(({ promotion, members, name, url }) => {
    //console.info("search %o in %o", search, team.promotion);
    return (
      promotion.toLowerCase().includes(search) ||
      members.toLowerCase().includes(search) ||
      name.toLowerCase().includes(search) ||
      url.toLowerCase().includes(search)
    );
  });
}

//use tag <mark>
function initEvents() {
  $("#search").addEventListener("input", e => {
    const search = e.target.value;
    const teams = filterElements(allTeams, search);
    console.info("search", search, teams);
    renderTeams(teams);
  });
  $(form).addEventListener("submit", onSubmit);
  $(form).addEventListener("reset", e => {
    console.info("reset", editId);
    if (editId) {
      //console.warn("cancel edit");
      allTeams = [...allTeams];
      renderTeams(allTeams);
      setInputsDisable(false);
      editId = "";
    }
  });

  $("#teamsTable tbody").addEventListener("click", e => {
    if (e.target.matches("button.delete-btn")) {
      const id = e.target.dataset.id;
      console.warn("delete %o", id);
      mask(form);
      deleteTeamRequest(id, status => {
        console.info("delete callback %o", status);
        if (status.success) {
          //window.location.reload();
          loadTeams();
        }
      });
    } else if (e.target.matches("button.edit-btn")) {
      const id = e.target.dataset.id;
      startEdit(id);
    }
  });
}

initEvents();
loadTeams();

// var p = sleep(5000);
// p.then(() => {
//   $("#teamsForm").classList.remove("loading-mask");
//   console.warn("ready");
// });
// console.info("after sleep", p);

// const p2 = await sleep(5000);
// console.info("after sleep2"), p2;
