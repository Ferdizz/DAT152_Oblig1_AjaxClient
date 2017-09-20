'use strict';

class ModalBox {
  constructor(){
    this.box = document.getElementById("modalBox");
    this.submitCallBack = (id) => {}
    this.memberID = 0;

    this.btnSubmit = document.getElementById("btnSubmit");
    this.btnSubmit.addEventListener('click', (function() {
      this.submitCallBack(this.member);
      this.box.style.display = "none";
    }).bind(this));

    this.btnCancel = document.getElementById("btnCancel");
    this.btnCancel.addEventListener('click', (function() {
      this.box.style.display = "none";
    }).bind(this));
  }

  add(){
    this.memberID = 0;
    document.getElementById("firstnameInput").value = "";
    document.getElementById("lastnameInput").value = "";
    document.getElementById("addressInput").value = "";
    document.getElementById("phoneInput").value = "";
    this.btnSubmit.innerHTML = "Add member";
    this.box.style.display = "block";
  }

  edit(member){
    this.memberID = member.id;
    document.getElementById("firstnameInput").value = member.firstname;
    document.getElementById("lastnameInput").value = member.lastname;
    document.getElementById("addressInput").value = member.address;
    document.getElementById("phoneInput").value = member.phone;
    this.btnSubmit.innerHTML = "Update member";
    this.box.style.display = "block";
  }

  get member(){
    return {
      "id": this.memberID,
      "firstname": document.getElementById("firstnameInput").value,
      "lastname": document.getElementById("lastnameInput").value,
      "address": document.getElementById("addressInput").value,
      "phone": document.getElementById("phoneInput").value
    }
  }

  set onSubmit(callback){
    this.submitCallBack = callback;
  }
}

class AppController {
  constructor(memberlist, addMember) {
    this.memberlist = memberlist;
    this.addMember = addMember;
    this.buttonClicked = "";
    this.url = "../Mservices/data";
    this.logId = -1
  }

  run() {
    this.ui = new UIHandler();
    this.box = new ModalBox();
    document.getElementById(this.memberlist).appendChild(this.ui.memberlist);

    /*
	 * Code added temporarily to test that addMember works as intended.
	 */
    this.ui.addMember({"id":1,"firstname":"Ole","lastname":"Olsen","address":"Olsenbakken","phone":"91826453"})
    this.ui.addMember({"id":2,"firstname":"Per","lastname":"Persen","address":"Persenbakken 77","phone":"14546567"})

    this.ui.deleteMemberCallback = (id) => {
      const doDelete = window.confirm(`Do you really want to delete member with id ${id}?`)
      if (doDelete) {
        this.ui.deleteMember(id);
        window.alert(`Member ${id} should be deleted.`)
      } else  {
        window.alert(`Member ${id} should not be deleted.`)
      }
    }

    this.ui.editMemberCallback = (id) => {
      const doEdit = window.confirm(`Edit member with id ${id}?`)
      if (doEdit) {
        this.box.edit(this.ui.getMember(id))
        window.alert(`Data for member ${id} should be changed.`)
      } else  {
        window.alert(`Data for member ${id} should not change.`)
      }
    }

    this.box.onSubmit = (member) => {
      // Code added temporarily to check that adding/editing member data
		// works.
      if(this.buttonClicked == "add"){
        this.ui.addMember(member)
        print()
      }else if(this.buttonClicked == "edit"){
        this.ui.editMember(member)
      }
    }

    this.getUpdates(this.logId);

  }

  getUpdates(id) { // TODO
    const ajax = new AJAXConnection(this.url + "/updates/" + id)

    ajax.onsuccess = (response) => {
      var res = JSON.parse(response);
      if(res.status){
        this.logId = res.logId;
        var newMembers = res.newMembers,
        updatedMembers = res.updatedMembers,
        deletedMembers = res.deletedMembers;

        // Add new members if any
        if (typeof newMembers != 'undefined') {
          for (var i = 0; i < newMembers.length; i++) {
            this.ui.addMember(newMembers[i]);
          }
        }

        // Edit updated members if any
        if (typeof updatedMembers != 'undefined') {
          for (var i = 0; i < updatedMembers.length; i++) {
            this.ui.editMember(updatedMembers[i]);
          }
        }

        // Remove deleted members if any
        if (typeof deletedMembers != 'undefined') {
          for (var i = 0; i < deletedMembers.length; i++) {
            this.ui.deleteMember(deletedMembers[i]);
          }
        }

      }else{
        console.log("Something went wrong while fetching updates");
      }
    }

    ajax.get()
  }

}

class UIHandler {
  constructor(){
    this.memberlist = document.createElement("table");
    this.tbody = document.createElement("tbody");

    var thead = document.createElement("thead");
    var row = document.createElement("tr");

    ["Firstname", "Lastname", "Address", "Phone"].forEach(function(el, i) {
      let cell = row.insertCell(i);
      cell.innerHTML = "<b>" + el + "</b>";
    });

    thead.appendChild(row);
    this.memberlist.appendChild(thead);
    this.memberlist.appendChild(this.tbody);

    this.deleteCallback = (id) => {}
    this.editCallback = (id) => {}

    this.btnAddMember = document.getElementById("addMember");
    this.btnAddMember.addEventListener('click', (function() {
      app.buttonClicked = "add";
      app.box.add();
    }));
  }

  addMember(member) {
    var row = document.createElement("tr");
    row.id = member.memberId;

    var data = new Array(4)
    data[0] = member.firstname;
    data[1] = member.lastname;
    data[2] = member.address;
    data[3] = member.phone;

    for (var i = 0; i < data.length; i++) {
      let cell = row.insertCell(i);
      cell.innerHTML = data[i];
    }

    var btnDelete = document.createElement("button");
    btnDelete.innerHTML = "Delete";
    btnDelete.addEventListener('click', (function() {
      app.ui.deleteCallback(this.id);
    }).bind(member));

    var btnEdit = document.createElement("button");
    btnEdit.innerHTML = "Edit";
    btnEdit.addEventListener('click', (function() {
      app.buttonClicked = "edit";
      app.ui.editCallback(this.id);
    }).bind(member));

    row.appendChild(btnDelete);
    row.appendChild(btnEdit);
    this.tbody.appendChild(row);
  }

  get length(){
    return this.tbody.getElementsByTagName("tr").length;
  }

  getMember(id){
    var rows = this.tbody.getElementsByTagName("tr");
    for (var i = 0; i < rows.length; i++) {
      if(rows[i].id == id){
        var cells = rows[i].getElementsByTagName("td");
        return {
          "id": id,
          "firstname": cells[0].innerHTML,
          "lastname": cells[1].innerHTML,
          "address": cells[2].innerHTML,
          "phone": cells[3].innerHTML
        }
      }
    }
  }

  set deleteMemberCallback(callback){
    this.deleteCallback = callback;
  }

  deleteMember(id){
    var rows = this.tbody.getElementsByTagName("tr");
    for (var i = 0; i < rows.length; i++) {
      if(rows[i].id == id){
        this.tbody.deleteRow(i);
      }
    }
  }

  set editMemberCallback(callback){
    this.editCallback = callback;
  }

  editMember(member){
    var rows = this.tbody.rows;

    for (var i = 0; i < rows.length; i++) {
      if(rows[i].id == member.id){

        var cells = rows[i].cells;
        let j = 0;

        for (var p in member) {
          if (p == "id") {
            // Do nothing
          } else if (cells[j].innerHTML != member[p]) {
            cells[j].innerHTML = member[p];
            j++;
          } else {
            j++;
          }
        }
      }
    }
  }
}

const app = new AppController("memberlist", "addMember");
document.addEventListener('DOMContentLoaded', app.run.bind(app), true);

// Debug method, called by onClick-event from html button
function debug() {
  console.log("Hello world");
}

// Debug method, called by onClick-event from html button
function getReq() {

}
