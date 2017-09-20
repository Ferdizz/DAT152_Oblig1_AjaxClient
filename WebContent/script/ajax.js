"use strict";

class AJAXConnection {
  constructor(url){
    this._url = url || null
    this.onsuccess = function() {console.log("Success")}
    this.onerror = function() {console.log("Error")}
  }

  get(pathArray,data) {
    let xmlhttprequest = new XMLHttpRequest()

    // If given, add path to the URL.
    let url = this._url + this._convertToPath(pathArray)

    // If given, add GET parameters.
    if (data) url += "?" + this._formatData(data)

    console.log(url);

    xmlhttprequest.open('GET', url, true)
    xmlhttprequest.addEventListener("loadend",this._dataReceived.bind(this),true)
    if (this.onerror) xmlhttprequest.addEventListener("error",this.onerror.bind(this),true)

    // Sending request
    xmlhttprequest.send(null);
  }

  del(pathArray) {
    let xmlhttprequest = new XMLHttpRequest()

    // If given, add path to the URL.
    let url = this._url + this._convertToPath(pathArray)

    xmlhttprequest.open('DELETE', url, true)

    xmlhttprequest.addEventListener("loadend",this._dataReceived.bind(this),true)
    if (this.onerror) xmlhttprequest.addEventListener("error",this.onerror.bind(this),true)

    // Sending request
    xmlhttprequest.send(null)
  }

  put(pathArray,data) {
    let xmlhttprequest = new XMLHttpRequest()

    // If given, add path to the URL.
    let url = this._url + this._convertToPath(pathArray)

    xmlhttprequest.open('PUT', url, true);

    xmlhttprequest.addEventListener("loadend",this._dataReceived.bind(this),true)
    if (this.onerror) xmlhttprequest.addEventListener("error",this.onerror.bind(this),true)

    // Must specify document type with PUT data
    xmlhttprequest.setRequestHeader("Content-Type","application/json; charset=utf-8")

    // Sending request
    xmlhttprequest.send(JSON.stringify(data))
  }

  post(pathArray,data) {
    let xmlhttprequest = new XMLHttpRequest()

    // If given, add path to the URL.
    let url = this._url + this._convertToPath(pathArray)

    xmlhttprequest.open('POST', url, true);

    xmlhttprequest.addEventListener("loadend",this._dataReceived.bind(this),true)
    if (this.onerror) xmlhttprequest.addEventListener("error",this.onerror.bind(this),true)

    // Must specify document type with POST data
    xmlhttprequest.setRequestHeader("Content-Type","application/json; charset=utf-8")

    // Sending request
    xmlhttprequest.send(JSON.stringify(data));
  }

  _dataReceived(e) {
    try {
      let xmlhttprequest = e.target // The XMLHttpRequest instance
      if (xmlhttprequest.status == 200) { // Got data
        if (this.onsuccess) this.onsuccess(xmlhttprequest.responseText)
      } else {
        if (this.onerror) this.onerror(xmlhttprequest)
      }
    } catch(e) {
      if (this.onerror) this.onerror()
    }
  }

 _formatData(data) {
    let dataString="";
    for (var key in data) {
      dataString += encodeURIComponent(key) + "=" + encodeURIComponent(data[key]) + "&"
    }
    dataString = dataString.substring(0,dataString.length-1)
    return dataString
  }

  _convertToPath(pathArray) {
    let path = ""
    if (pathArray instanceof Array) {
      pathArray.forEach((part) => {path += "/" + part})
      /*
      if (pathArray.length > 0) {
        for (var i=0;i<pathArray.length;++i) {
          path += "/" + pathArray[i]
        }
      }
      */
    }
    return path;
  }
}
