const decodeHTML = (s) => new DOMParser().parseFromString(s ?? "", "text/html").documentElement.textContent || "";

function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const options = { month: 'long', day: 'numeric' };
const today = new Date().toLocaleDateString(undefined, options);
document.getElementById('headline').textContent += today;

fetch("https://today.zenquotes.io/api")
  .then((r) => r.json())
  .then(({ data }) => {
    const events = shuffleArray(data.Events || []);
    const list = document.getElementById("events");
    document.getElementById("pickerLine").textContent =
      `Pick a number between 1 and ${events.length}`;

    events.forEach((event) => {
      const li = document.createElement("li");
      li.className = "event-item";

      const decodedText = decodeHTML(event.text || "");
      const dashIdx = decodedText.indexOf(" – ");
      const yearText = dashIdx > -1 ? decodedText.slice(0, dashIdx) : decodedText.split(" ")[0];
      const bodyText = dashIdx > -1 ? decodedText.slice(dashIdx + 3) : decodedText;

      const main = document.createElement("span");
      main.className = "event";

      const yearSpan = document.createElement("span");
      yearSpan.className = "year blurred";
      yearSpan.textContent = yearText;
      yearSpan.title = "Click to reveal year";
      yearSpan.addEventListener("click", () => yearSpan.classList.toggle("blurred"));

      const textSpan = document.createElement("span");
      textSpan.className = "event-text";
      textSpan.textContent = bodyText;

      main.appendChild(yearSpan);
      main.appendChild(textSpan);
      li.appendChild(main);

      const footer = document.createElement("div");
      footer.className = "footer-actions";

      const copyLink = document.createElement("a");
      copyLink.href = "#";
      copyLink.className = "copy-link";
      copyLink.textContent = "Copy Text";
      copyLink.addEventListener("click", (e) => {
        e.preventDefault();
        const toCopy = bodyText;
        if (navigator.clipboard?.writeText) {
          navigator.clipboard.writeText(toCopy);
        } else {
          const ta = document.createElement("textarea");
          ta.value = toCopy;
          document.body.appendChild(ta);
          ta.select();
          document.execCommand("copy");
          document.body.removeChild(ta);
        }
      });
      footer.appendChild(copyLink);

      const sep = document.createElement("span");
      sep.className = "sep";
      sep.textContent = "|";
      footer.appendChild(sep);

      if (event.links && typeof event.links === "object") {
        Object.keys(event.links)
          .sort((a, b) => (+a) - (+b))
          .forEach((k) => {
            const entry = event.links[k];
            const label = decodeHTML(entry?.["2"] ?? "Source");
            const href = entry?.["1"];
            if (!href) return;
            if (label === yearText) return; // skip the year link

            const a = document.createElement("a");
            a.href = href;
            a.target = "_blank";
            a.rel = "noopener";
            a.textContent = label;

            footer.appendChild(a);
          });
      }

      li.appendChild(footer);
      list.appendChild(li);
    });
  })
  .catch((err) => {
    document.getElementById("pickerLine").textContent = "Could not load events.";
    console.error(err);
  });
