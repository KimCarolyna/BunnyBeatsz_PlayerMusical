// =============================
// Elementos principais
// =============================
const audio        = document.querySelector("audio");
const btnPlay      = document.querySelector(".btn-play");
const btnPause     = document.querySelector(".btn-pause");
const btnNext      = document.querySelector(".btn-next");
const btnPrev      = document.querySelector(".btn-prev");
const btnLoop      = document.querySelector(".btn-loop");
const btnShuffle   = document.querySelector(".btn-shuffle");
const barra        = document.querySelector(".barra");
const tempoInicio  = document.querySelector(".inicio");
const tempoFim     = document.querySelector(".fim");
const capaImg      = document.querySelector(".capa-container"); // <img class="capa-container">
const nomeMusica   = document.querySelector(".nome-musica");
const nomeArtista  = document.querySelector(".nome-artista");

// Menu/overlay
const menuBtn      = document.getElementById("menu-btn");
const overlayLista = document.getElementById("lista-musicas");
const voltarBtn    = document.getElementById("voltar-btn");

// Listas
const todasListaEl     = document.getElementById("todas-lista");
let   musicasLista     = Array.from(todasListaEl.querySelectorAll("li"));
const favoritasListaEl = document.getElementById("favoritas-lista");

// Like principal
const likeBtn = document.querySelector(".like");

// =============================
// Estado
// =============================
let indexAtual   = 0;
let isLooping    = false;
let isShuffling  = false;
const favoritos  = new Set();

// =============================
// Util
// =============================
function formatarTempo(seg) {
  if (!isFinite(seg)) return "0:00";
  const m = Math.floor(seg / 60);
  const s = Math.floor(seg % 60);
  return `${m}:${s < 10 ? "0" + s : s}`;
}

function tituloDeLi(li) {
  // Pega só o texto “puro” (ignora ícones)
  return (li.textContent || "").replace("❤", "").trim();
}

function atualizarLikePrincipal() {
  const titulo = nomeMusica.textContent.trim();
  likeBtn.src = favoritos.has(titulo) ? "imagens/like_cheio.png" : "imagens/like_vazio.png";
}

// =============================
// Carregar / Tocar
// =============================
function carregarMusica(index) {
  const li = musicasLista[index];
  if (!li) return;

  const src     = li.getAttribute("data-musica");
  const artista = li.getAttribute("data-artista") || "";
  const capa    = li.getAttribute("data-capa")    || "";
  const titulo  = tituloDeLi(li);

  audio.src = src;
  nomeMusica.textContent  = titulo;
  nomeArtista.textContent = artista;
  capaImg.src             = capa;

  audio.load();
  barra.value = 0;
  tempoInicio.textContent = "0:00";
  tempoFim.textContent    = "0:00";

  atualizarLikePrincipal();
}

function tocar() {
  audio.play();
  btnPlay.classList.add("hidden");
  btnPause.classList.remove("hidden");
}

function pausar() {
  audio.pause();
  btnPause.classList.add("hidden");
  btnPlay.classList.remove("hidden");
}

function trocarMusica() {
  carregarMusica(indexAtual);
  tocar();
}

// =============================
// Eventos do <audio> e barra
// =============================
audio.addEventListener("loadedmetadata", () => {
  barra.max = Math.floor(audio.duration) || 0;
  tempoFim.textContent = formatarTempo(audio.duration);
});

audio.addEventListener("timeupdate", () => {
  if (!audio.duration) return;
  const progresso = audio.currentTime / audio.duration;
  barra.value = Math.floor(progresso * (barra.max || 0));
  tempoInicio.textContent = formatarTempo(audio.currentTime);

  // gradiente da barra
  const pct = (progresso * 100).toFixed(2);
  barra.style.background = `linear-gradient(90deg, #ff70a6 ${pct}%, #ffffff ${pct}%)`;
});

barra.addEventListener("input", () => {
  if (!audio.duration) return;
  audio.currentTime = (barra.value / (barra.max || 1)) * audio.duration;
});

// =============================
// Botões do player
// =============================
btnPlay.addEventListener("click", tocar);
btnPause.addEventListener("click", pausar);

btnNext.addEventListener("click", () => {
  indexAtual = isShuffling
    ? Math.floor(Math.random() * musicasLista.length)
    : (indexAtual + 1) % musicasLista.length;
  trocarMusica();
});

btnPrev.addEventListener("click", () => {
  indexAtual = isShuffling
    ? Math.floor(Math.random() * musicasLista.length)
    : (indexAtual - 1 + musicasLista.length) % musicasLista.length;
  trocarMusica();
});

btnLoop.addEventListener("click", () => {
  isLooping = !isLooping;
  audio.loop = isLooping;
  btnLoop.style.opacity = isLooping ? "1" : "0.5";
});

btnShuffle.addEventListener("click", () => {
  isShuffling = !isShuffling;
  btnShuffle.style.opacity = isShuffling ? "1" : "0.5";
});

audio.addEventListener("ended", () => {
  if (audio.loop) return; // com loop true, o próprio áudio reinicia
  btnNext.click();
});

// =============================
// Abertura/fechamento da lista
// =============================
menuBtn.addEventListener("click", () => {
  atualizarListaFavoritos();
  atualizarListaFavoritas();
  overlayLista.classList.remove("hidden");
});

voltarBtn.addEventListener("click", () => {
  overlayLista.classList.add("hidden");
});

// =============================
// Clique nas músicas (Todas e Favoritas)
// =============================

// Delegação de evento: evita duplicar listeners
todasListaEl.addEventListener("click", (e) => {
  const li = e.target.closest("li");
  if (!li) return;
  const idx = musicasLista.indexOf(li);
  if (idx < 0) return;
  indexAtual = idx;
  trocarMusica();
  overlayLista.classList.add("hidden");
});

favoritasListaEl.addEventListener("click", (e) => {
  const li = e.target.closest("li");
  if (!li) return;
  const titulo = tituloDeLi(li);
  // achar correspondente na lista “todas”
  const idx = musicasLista.findIndex(item => tituloDeLi(item) === titulo);
  if (idx >= 0) {
    indexAtual = idx;
    trocarMusica();
    overlayLista.classList.add("hidden");
  }
});

// =============================
// Like / Favoritos
// =============================
likeBtn.addEventListener("click", () => {
  const tituloAtual = nomeMusica.textContent.trim();

  if (favoritos.has(tituloAtual)) {
    favoritos.delete(tituloAtual);
  } else {
    favoritos.add(tituloAtual);
  }

  // animação
  likeBtn.classList.remove("animando");
  void likeBtn.offsetWidth; // reflow
  likeBtn.classList.add("animando");

  atualizarLikePrincipal();
  atualizarListaFavoritos();
  atualizarListaFavoritas();
});

function atualizarListaFavoritos() {
  // Remove ícones antigos
  musicasLista.forEach(li => {
    const antigo = li.querySelector(".favorito-icon");
    if (antigo) antigo.remove();
  });

  // Adiciona ícone nas favoritas
  musicasLista.forEach(li => {
    const titulo = tituloDeLi(li);
    if (favoritos.has(titulo)) {
      const icone = document.createElement("img");
      icone.src = "imagens/like_cheio.png";
      icone.className = "favorito-icon";
      li.appendChild(icone);
    }
  });
}

function atualizarListaFavoritas() {
  favoritasListaEl.innerHTML = "";

  // Mantém a ordem igual à lista "Todas"
  musicasLista.forEach(li => {
    const titulo = tituloDeLi(li);
    if (favoritos.has(titulo)) {
      const novo = document.createElement("li");
      novo.textContent = titulo;

      const icone = document.createElement("img");
      icone.src = "imagens/like_cheio.png";
      icone.className = "favorito-icon";
      novo.appendChild(icone);

      favoritasListaEl.appendChild(novo);
    }
  });
}

// =============================
// Abas (Todas / Favoritas)
// =============================
const tabBtns = document.querySelectorAll(".tab-btn");
const containersPorAba = {
  todas: document.getElementById("todas-lista"),
  favoritas: document.getElementById("favoritas-lista"),
};

tabBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    tabBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    Object.values(containersPorAba).forEach(el => el.classList.remove("active"));
    const alvo = containersPorAba[btn.dataset.tab];
    alvo.classList.add("active");

    if (btn.dataset.tab === "favoritas") {
      atualizarListaFavoritas();
    } else {
      atualizarListaFavoritos();
    }
  });
});

// =============================
// Inicialização
// =============================
carregarMusica(indexAtual);
// =============================
// Controle de volume
// =============================
const volumeSlider = document.getElementById("volume-bar");
const iconeVolume = document.getElementById("icone-volume");

audio.volume = 1.0;
volumeSlider.value = 100;

volumeSlider.addEventListener("input", () => {
  audio.volume = volumeSlider.value / 100;
  iconeVolume.src = audio.volume === 0 ? "imagens/mute.png" : "imagens/volume-up.png";
});

iconeVolume.addEventListener("click", () => {
  if (audio.volume > 0) {
    audio.volume = 0;
    volumeSlider.value = 0;
    iconeVolume.src = "imagens/mute.png";
  } else {
    audio.volume = 1;
    volumeSlider.value = 100;
    iconeVolume.src = "imagens/volume-up.png";
  }
});
// =============================
// Playlists
// =============================
const playlistsListaEl = document.getElementById("playlists-lista");

// Estrutura de playlists (nome e array de músicas)
const playlists = [
  {
    nome: "Pop Hits",
    musicas: [
      "Soda Pop",
      "Jump"
    ]
  },
  {
    nome: "Favoritas",
    musicas: Array.from(favoritos)
  }
];

// Renderiza as playlists
function atualizarListaPlaylists() {
  playlistsListaEl.innerHTML = "";
  playlists.forEach((playlist, idx) => {
    const li = document.createElement("li");
    li.textContent = playlist.nome;
    li.dataset.playlistIndex = idx;
    playlistsListaEl.appendChild(li);
  });
}

// Adicione a aba playlists ao controle de abas
containersPorAba.playlists = playlistsListaEl;

// Atualize o evento das abas
tabBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    tabBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    Object.values(containersPorAba).forEach(el => el.classList.remove("active"));
    const alvo = containersPorAba[btn.dataset.tab];
    alvo.classList.add("active");

    if (btn.dataset.tab === "favoritas") {
      atualizarListaFavoritas();
    } else if (btn.dataset.tab === "playlists") {
      atualizarListaPlaylists();
    } else {
      atualizarListaFavoritos();
    }
  });
});
playlistsListaEl.addEventListener("click", (e) => {
  const li = e.target.closest("li");
  if (!li) return;
  const idx = li.dataset.playlistIndex;
  const playlist = playlists[idx];
  if (!playlist) return;

  // Cria o modal
  let modal = document.createElement("div");
  modal.style.position = "fixed";
  modal.style.top = "0";
  modal.style.left = "0";
  modal.style.width = "100vw";
  modal.style.height = "100vh";
  modal.style.background = "transparent";
  modal.style.pointerEvents = "none";
  modal.style.display = "flex";
  modal.style.justifyContent = "center";
  modal.style.alignItems = "center";
  modal.style.zIndex = "9999";

  let box = document.createElement("div");
  box.style.background = "#222";
  box.style.padding = "24px";
  box.style.borderRadius = "12px";
  box.style.color = "#fff";
  box.style.minWidth = "220px";
  box.style.textAlign = "center";
  box.style.pointerEvents = "auto";

  // Título
  let titulo = document.createElement("h3");
  titulo.textContent = playlist.nome;
  titulo.style.marginBottom = "16px";
  box.appendChild(titulo);

  // Botão Renomear
  let btnRenomear = document.createElement("button");
  btnRenomear.textContent = "Renomear";
  btnRenomear.style.marginLeft = "10px";
  btnRenomear.style.padding = "4px 12px";
  btnRenomear.style.borderRadius = "6px";
  btnRenomear.style.border = "none";
  btnRenomear.style.background = "#ff70a6";
  btnRenomear.style.color = "#fff";
  btnRenomear.style.cursor = "pointer";
  btnRenomear.addEventListener("click", () => {
    let input = document.createElement("input");
    input.type = "text";
    input.value = playlist.nome;
    input.style.marginTop = "10px";
    input.style.padding = "6px";
    input.style.borderRadius = "6px";
    input.style.border = "none";
    input.style.width = "80%";

    let btnSalvar = document.createElement("button");
    btnSalvar.textContent = "Salvar";
    btnSalvar.style.marginLeft = "8px";
    btnSalvar.style.padding = "4px 12px";
    btnSalvar.style.borderRadius = "6px";
    btnSalvar.style.border = "none";
    btnSalvar.style.background = "#ff70a6";
    btnSalvar.style.color = "#fff";
    btnSalvar.style.cursor = "pointer";

    box.replaceChild(input, titulo);
    box.insertBefore(btnSalvar, box.childNodes[1]);

    btnSalvar.addEventListener("click", () => {
      playlist.nome = input.value.trim() || playlist.nome;
      atualizarListaPlaylists();
      titulo.textContent = playlist.nome;
      box.replaceChild(titulo, input);
      box.removeChild(btnSalvar);
    });
  });
  box.appendChild(btnRenomear);

  // Lista de músicas
  let ul = document.createElement("ul");
  ul.style.maxHeight = "220px";
  ul.style.overflowY = "auto";
  ul.style.padding = "0";
  ul.style.margin = "16px 0";
  ul.style.background = "transparent";
  box.appendChild(ul);

  // Função para atualizar a lista de músicas no modal
  function atualizarUl() {
    ul.innerHTML = "";
    playlist.musicas.forEach(nome => {
      let liMusica = document.createElement("li");
      liMusica.textContent = nome;
      liMusica.style.cursor = "pointer";
      liMusica.style.margin = "12px 0";
      liMusica.style.listStyle = "none";
      liMusica.style.borderBottom = "1px solid #444";
      liMusica.style.padding = "4px 8px";
      liMusica.style.display = "flex";
      liMusica.style.justifyContent = "space-between";
      liMusica.style.alignItems = "center";
      liMusica.className = "playlist-item";

      // Botão remover
      let btnRemover = document.createElement("img");
      btnRemover.src = "imagens/remover.png"; // <-- sua imagem personalizada
      btnRemover.alt = "Remover";
      btnRemover.style.width = "18px";   // tamanho da imagem
      btnRemover.style.height = "18px";
      btnRemover.style.cursor = "pointer";
      btnRemover.addEventListener("click", (ev) => {
      ev.stopPropagation();
      playlist.musicas = playlist.musicas.filter(m => m !== nome);
      atualizarListaPlaylists();
      atualizarUl();
});
  btnSalvarMusica.addEventListener("click", () => {
    const nome = input.value.trim();
    if (nome) {
      playlist.musicas.push(nome);
      atualizarListaPlaylists();
      atualizarUl();
      input.value = "";
    }
  });

box.appendChild(btnAdicionar);
liMusica.appendChild(btnRemover);

      liMusica.addEventListener("click", () => {
        const idxMusica = musicasLista.findIndex(item => tituloDeLi(item) === nome);
        if (idxMusica >= 0) {
          indexAtual = idxMusica;
          trocarMusica();
          document.body.removeChild(modal);
          overlayLista.classList.add("hidden");
        }
      });
      ul.appendChild(liMusica);
    });
  }
  atualizarUl();

  // Botão Adicionar Música
  let btnAdicionar = document.createElement("button");
  btnAdicionar.textContent = "Adicionar Música";
  btnAdicionar.style.margin = "8px";
  btnAdicionar.style.padding = "4px 12px";
  btnAdicionar.style.borderRadius = "6px";
  btnAdicionar.style.border = "none";
  btnAdicionar.style.background = "#70c1ff";
  btnAdicionar.style.color = "#fff";
  btnAdicionar.style.cursor = "pointer";
  btnAdicionar.addEventListener("click", () => {
    // Remove inputs e botões "Salvar" antigos antes de adicionar novos
    Array.from(box.querySelectorAll('input[type="text"]')).forEach(el => el.remove());
    Array.from(box.querySelectorAll('button')).forEach(el => {
      if (el.textContent === "Salvar") el.remove();
    });

    let input = document.createElement("input");
    input.type = "text";
    input.placeholder = "Nome da música";
    input.style.marginTop = "10px";
    input.style.padding = "6px";
    input.style.borderRadius = "6px";
    input.style.border = "none";
    input.style.width = "80%";
    input.style.marginBottom = "10px";

    let btnSalvarMusica = document.createElement("button");
    btnSalvarMusica.textContent = "Salvar";
    btnSalvarMusica.style.marginLeft = "8px";
    btnSalvarMusica.style.padding = "4px 12px";
    btnSalvarMusica.style.borderRadius = "6px";
    btnSalvarMusica.style.border = "none";
    btnSalvarMusica.style.background = "#70c1ff";
    btnSalvarMusica.style.color = "#fff";
    btnSalvarMusica.style.cursor = "pointer";
    btnSalvarMusica.style.marginTop = "5px";

    box.insertBefore(input, ul);
    box.insertBefore(btnSalvarMusica, ul);

    btnSalvarMusica.addEventListener("click", () => {
      const nome = input.value.trim();
      if (nome) {
        playlist.musicas.push(nome);
        atualizarListaPlaylists();
        atualizarUl();
        input.value = "";
      }
    });
  });
  box.appendChild(btnAdicionar);

  // Botão Fechar
  let fechar = document.createElement("button");
  fechar.textContent = "Fechar";
  fechar.style.marginTop = "16px";
  fechar.style.padding = "8px 16px";
  fechar.style.borderRadius = "8px";
  fechar.style.border = "none";
  fechar.style.background = "#ff70a6";
  fechar.style.color = "#fff";
  fechar.style.cursor = "pointer";
  fechar.addEventListener("click", () => {
    document.body.removeChild(modal);
  });
  box.appendChild(fechar);

  modal.appendChild(box);
  document.body.appendChild(modal);
});

const barraPesquisa = document.getElementById("barra-pesquisa");
let sugestoesBox = document.getElementById("sugestoes-musica");
if (!sugestoesBox) {
    sugestoesBox = document.createElement("div");
    sugestoesBox.id = "sugestoes-musica";

    // estilos da caixa de sugestões
    sugestoesBox.style.position = "absolute";
    sugestoesBox.style.left = "0";
    sugestoesBox.style.top = "100%"; // logo abaixo do input
    sugestoesBox.style.width = "100%";
    sugestoesBox.style.background = "#222";
    sugestoesBox.style.color = "#fff";
    sugestoesBox.style.zIndex = "1000";
    sugestoesBox.style.borderRadius = "8px";
    sugestoesBox.style.boxShadow = "0 2px 8px #0003";
    sugestoesBox.style.maxHeight = "180px";
    sugestoesBox.style.overflow = "auto";

    // adiciona dentro do mesmo container do input
    barraPesquisa.parentNode.appendChild(sugestoesBox);
}

function ativarSugestoes(input, sugestoesBox) {
  input.addEventListener("input", () => {
    const termo = input.value.trim().toLowerCase();
    sugestoesBox.innerHTML = "";

    if (termo.length > 0) {
      const encontrados = musicasLista.filter(li => 
        tituloDeLi(li).toLowerCase().startsWith(termo)
      );

      encontrados.forEach(li => {
        const sugestao = document.createElement("div");
        sugestao.textContent = tituloDeLi(li);
        sugestao.style.cursor = "pointer";
        sugestao.style.padding = "6px 12px";
        sugestao.style.borderBottom = "1px solid #444";

        sugestao.addEventListener("click", () => {
          input.value = tituloDeLi(li);
          sugestoesBox.innerHTML = "";

          // Se for o campo principal, toca a música
          if (input.id === "barra-pesquisa") {
            const idx = musicasLista.indexOf(li);
            if (idx >= 0) {
              indexAtual = idx;
              trocarMusica();
              overlayLista.classList.add("hidden");
            }
          }
        });

        sugestoesBox.appendChild(sugestao);
      });
    }
  });
}

  const encontrados = musicasLista.filter(li =>
    tituloDeLi(li).toLowerCase().includes(termo))
    .sort((a, b) => {
      const ta = tituloDeLi(a).toLowerCase();
      const tb = tituloDeLi(b).toLowerCase();
      const aComeca = ta.startsWith(termo);
      const bComeca = tb.startsWith(termo);
      if (aComeca && !bComeca) return -1;
      if (!aComeca && bComeca) return 1;
      return ta.localeCompare(tb);
    });

  encontrados.forEach(li => {
    const sugestao = document.createElement("div");
    sugestao.textContent = tituloDeLi(li);
    sugestao.style.cursor = "pointer";
    sugestao.style.padding = "6px 12px";
    sugestao.style.borderBottom = "1px solid #444";
    sugestao.addEventListener("click", () => {
      barraPesquisa.value = tituloDeLi(li);
      sugestoesBox.innerHTML = "";
      // Aqui você pode adicionar à playlist ou tocar a música
    });
    sugestoesBox.appendChild(sugestao);
  });

barraPesquisa.addEventListener("blur", () => {
  setTimeout(() => sugestoesBox.innerHTML = "", 200);
});

let ul = document.createElement("ul");
ul.className = "playlist-modal";