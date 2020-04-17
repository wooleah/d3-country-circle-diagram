const loadData = async () => {
  const data = await fetch("/.netlify/functions/get-country-pop")
    .then((res) => res.json())
    .catch((err) => console.error(err));

  const canvas = document.querySelector(".canvas");
  const text = document.createElement("h1");
  text.innerText = data;

  canvas.appendChild(text);
};

loadData();
