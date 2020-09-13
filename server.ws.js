let ws;

function socket() {
  if (ws && ws.readyState !== 3) {
    return;
  }

  ws = new WebSocket(`ws://${document.location.host}`);
  ws.onopen = () => {
    console.log("Socket connection open. Listening for events.");
    const files = read("refresh");

    if (files) {
      refresh(files);
    }
  };
  ws.onmessage = (e) => {
    const files = JSON.parse(e.data);
    console.log(files);

    if (!Array.isArray(files)) {
      console.log(e.data);
      return;
    }

    let path = document.location.pathname;

    if (!path.endsWith(".html")) {
      path += path.endsWith("/") ? "index.html" : "/index.html";
    }

    if (files.includes(path)) {
      save("refresh", files);
      location.reload();
      return;
    }

    refresh(files);
  };
}

setInterval(socket, 1000);

function refresh(files) {
  files.forEach((file) => {
    const format = file.split(".").pop().toLowerCase();

    switch (format) {
      case "css":
        document.querySelectorAll('link[rel="stylesheet"]').forEach((el) =>
          cache(el, "href", file, true)
        );
        break;

      case "jpeg":
      case "jpg":
      case "png":
      case "svg":
      case "gif":
        document.querySelectorAll("img").forEach((el) =>
          cache(el, "src", file)
        );
        break;

      case "js":
        document.querySelectorAll("script").forEach((el) =>
          cache(el, "src", file)
        );
        break;
    }
  });
}

function cache(el, attr, file, clone = false) {
  const url = new URL(el[attr]);

  if (url.pathname !== file) {
    return;
  }

  url.searchParams.set("_cache", (new Date()).getTime());

  if (clone) {
    const newEl = el.cloneNode();
    newEl[attr] = url.toString();
    el.after(newEl);
    setTimeout(() => el.remove(), 500);
    return;
  }

  el[attr] = url.toString();
}

function save(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

function read(key) {
  const data = localStorage.getItem(key);
  localStorage.removeItem(key);

  if (data) {
    return JSON.parse(data);
  }
}